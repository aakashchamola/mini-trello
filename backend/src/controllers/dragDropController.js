const Card = require('../models/Card');
const List = require('../models/List');
const positionService = require('../services/positionService');
const { logActivity } = require('../middleware/activityLogger');

class DragDropController {
  
  /**
   * Move a card within the same list or to a different list
   */
  async moveCard(req, res) {
    try {
      const { cardId } = req.params;
      const { targetListId, targetIndex, sourceListId, sourceIndex } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!targetListId || targetIndex === undefined) {
        return res.status(400).json({ error: 'Missing required fields: targetListId, targetIndex' });
      }

      // Find the card
      const card = await Card.findByPk(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      // Get all cards in the target list (excluding the moving card if it's the same list)
      const whereClause = { listId: targetListId };
      if (targetListId === sourceListId) {
        whereClause.id = { [require('sequelize').Op.ne]: cardId };
      }

      const targetListCards = await Card.findAll({
        where: whereClause,
        order: [['position', 'ASC']]
      });

      // Calculate new position
      const newPosition = positionService.calculatePositionAtIndex(targetListCards, targetIndex);

      // Update the card
      const oldListId = card.listId;
      await card.update({
        listId: targetListId,
        position: newPosition,
        updatedAt: new Date()
      });

      // Log activity
      const activity = {
        boardId: req.board.id,
        userId: userId,
        actionType: oldListId === targetListId ? 'card_reordered' : 'card_moved',
        entityType: 'card',
        entityId: cardId,
        oldValue: { listId: oldListId, position: card.position },
        newValue: { listId: targetListId, position: newPosition },
        description: oldListId === targetListId 
          ? `Reordered card "${card.title}" within list`
          : `Moved card "${card.title}" to another list`
      };

      logActivity(activity);

      // Emit socket event for real-time updates
      if (req.io) {
        req.io.to(`board-${req.board.id}`).emit('card-moved', {
          cardId: card.id,
          fromListId: oldListId,
          toListId: targetListId,
          newPosition: newPosition,
          cardData: {
            id: card.id,
            title: card.title,
            description: card.description,
            priority: card.priority,
            position: newPosition,
            listId: targetListId
          },
          movedBy: req.user,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        card: {
          id: card.id,
          title: card.title,
          position: newPosition,
          listId: targetListId
        }
      });

    } catch (error) {
      console.error('Move card error:', error);
      res.status(500).json({ error: 'Failed to move card' });
    }
  }

  /**
   * Move a list within a board
   */
  async moveList(req, res) {
    try {
      const { listId } = req.params;
      const { targetIndex } = req.body;
      const userId = req.user.id;

      // Validate input
      if (targetIndex === undefined) {
        return res.status(400).json({ error: 'Missing required field: targetIndex' });
      }

      // Find the list
      const list = await List.findByPk(listId);
      if (!list || list.boardId !== req.board.id) {
        return res.status(404).json({ error: 'List not found' });
      }

      // Get all lists in the board (excluding the moving list)
      const boardLists = await List.findAll({
        where: { 
          boardId: req.board.id,
          id: { [require('sequelize').Op.ne]: listId }
        },
        order: [['position', 'ASC']]
      });

      // Calculate new position
      const newPosition = positionService.calculatePositionAtIndex(boardLists, targetIndex);

      // Update the list
      const oldPosition = list.position;
      await list.update({
        position: newPosition,
        updatedAt: new Date()
      });

      // Log activity
      const activity = {
        boardId: req.board.id,
        userId: userId,
        actionType: 'list_reordered',
        entityType: 'list',
        entityId: listId,
        oldValue: { position: oldPosition },
        newValue: { position: newPosition },
        description: `Reordered list "${list.title}"`
      };

      logActivity(activity);

      // Emit socket event for real-time updates
      if (req.io) {
        req.io.to(`board-${req.board.id}`).emit('list-moved', {
          listId: list.id,
          newPosition: newPosition,
          listData: {
            id: list.id,
            title: list.title,
            position: newPosition,
            boardId: list.boardId
          },
          movedBy: req.user,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        list: {
          id: list.id,
          title: list.title,
          position: newPosition,
          boardId: list.boardId
        }
      });

    } catch (error) {
      console.error('Move list error:', error);
      res.status(500).json({ error: 'Failed to move list' });
    }
  }

  /**
   * Bulk update positions for optimization
   */
  async bulkUpdatePositions(req, res) {
    try {
      const { updates } = req.body; // [{ type: 'card' | 'list', id, position, listId? }]
      const userId = req.user.id;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const results = [];

      for (const update of updates) {
        try {
          if (update.type === 'card') {
            const card = await Card.findByPk(update.id);
            if (card) {
              const updateData = { position: update.position };
              if (update.listId) {
                updateData.listId = update.listId;
              }
              await card.update(updateData);
              results.push({ type: 'card', id: update.id, success: true });
            }
          } else if (update.type === 'list') {
            const list = await List.findByPk(update.id);
            if (list && list.boardId === req.board.id) {
              await list.update({ position: update.position });
              results.push({ type: 'list', id: update.id, success: true });
            }
          }
        } catch (updateError) {
          console.error(`Failed to update ${update.type} ${update.id}:`, updateError);
          results.push({ type: update.type, id: update.id, success: false, error: updateError.message });
        }
      }

      // Emit socket event for real-time updates
      if (req.io) {
        req.io.to(`board-${req.board.id}`).emit('bulk-position-update', {
          updates: results.filter(r => r.success),
          updatedBy: req.user,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        results
      });

    } catch (error) {
      console.error('Bulk update positions error:', error);
      res.status(500).json({ error: 'Failed to bulk update positions' });
    }
  }

  /**
   * Rebalance positions when they become too dense
   */
  async rebalancePositions(req, res) {
    try {
      const { type, listId } = req.body; // type: 'cards' | 'lists'

      if (type === 'cards' && listId) {
        await positionService.rebalanceCardPositions(listId);
        res.json({ success: true, message: `Rebalanced card positions in list ${listId}` });
      } else if (type === 'lists') {
        await positionService.rebalanceListPositions(req.board.id);
        res.json({ success: true, message: `Rebalanced list positions in board ${req.board.id}` });
      } else {
        res.status(400).json({ error: 'Invalid rebalance type or missing listId for cards' });
      }

    } catch (error) {
      console.error('Rebalance positions error:', error);
      res.status(500).json({ error: 'Failed to rebalance positions' });
    }
  }
}

module.exports = new DragDropController();
