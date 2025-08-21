const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const { createCardSchema, updateCardSchema, moveCardSchema, reorderCardsSchema } = require('../validation/cardValidation');
const { Op } = require('sequelize');

const cardController = {
  // Create a new card in a list
  async createCard(req, res) {
    try {
      const { boardId, listId } = req.params;
      const { error, value } = createCardSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      // Check if list exists in the board
      const list = await List.findOne({
        where: {
          id: listId,
          boardId
        }
      });

      if (!list) {
        return res.status(404).json({
          error: 'List not found',
          message: 'List does not exist in this board'
        });
      }

      // Get the next position if not provided
      let position = value.position;
      if (position === undefined) {
        const maxPosition = await Card.max('position', {
          where: { listId }
        });
        position = (maxPosition || -1) + 1;
      }

      // Handle position conflicts by shifting existing cards
      await Card.increment('position', {
        where: {
          listId,
          position: { [Op.gte]: position }
        }
      });

      const card = await Card.create({
        ...value,
        position,
        listId,
        createdBy: req.user.id
      });

      res.status(201).json({
        message: 'Card created successfully',
        card: {
          id: card.id,
          title: card.title,
          description: card.description,
          position: card.position,
          priority: card.priority,
          dueDate: card.dueDate,
          isCompleted: card.isCompleted,
          labels: card.labels,
          listId: card.listId,
          createdBy: card.createdBy,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
        }
      });
    } catch (error) {
      console.error('Create card error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create card'
      });
    }
  },

  // Get all cards for a list
  async getListCards(req, res) {
    try {
      const { boardId, listId } = req.params;
      const { priority, completed, search } = req.query;

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      // Check if list exists in the board
      const list = await List.findOne({
        where: {
          id: listId,
          boardId
        }
      });

      if (!list) {
        return res.status(404).json({
          error: 'List not found',
          message: 'List does not exist in this board'
        });
      }

      const whereClause = { listId };

      // Apply filters
      if (priority) {
        whereClause.priority = priority;
      }
      if (completed !== undefined) {
        whereClause.isCompleted = completed === 'true';
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const cards = await Card.findAll({
        where: whereClause,
        order: [['position', 'ASC']],
        attributes: ['id', 'title', 'description', 'position', 'priority', 'dueDate', 'isCompleted', 'labels', 'listId', 'createdBy', 'createdAt', 'updatedAt']
      });

      res.json({
        cards,
        listId: parseInt(listId),
        boardId: parseInt(boardId),
        totalCards: cards.length
      });
    } catch (error) {
      console.error('Get list cards error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve cards'
      });
    }
  },

  // Get all cards for a board
  async getBoardCards(req, res) {
    try {
      const { boardId } = req.params;
      const { priority, completed, search } = req.query;

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        },
        include: [{
          model: List,
          as: 'lists',
          attributes: ['id', 'title']
        }]
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      const listIds = board.lists.map(list => list.id);
      const whereClause = { listId: { [Op.in]: listIds } };

      // Apply filters
      if (priority) {
        whereClause.priority = priority;
      }
      if (completed !== undefined) {
        whereClause.isCompleted = completed === 'true';
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const cards = await Card.findAll({
        where: whereClause,
        include: [{
          model: List,
          as: 'list',
          attributes: ['id', 'title']
        }],
        order: [['listId', 'ASC'], ['position', 'ASC']],
        attributes: ['id', 'title', 'description', 'position', 'priority', 'dueDate', 'isCompleted', 'labels', 'listId', 'createdBy', 'createdAt', 'updatedAt']
      });

      res.json({
        cards,
        boardId: parseInt(boardId),
        totalCards: cards.length
      });
    } catch (error) {
      console.error('Get board cards error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve cards'
      });
    }
  },

  // Get a specific card by ID
  async getCardById(req, res) {
    try {
      const { boardId, listId, cardId } = req.params;

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: List,
          as: 'list',
          attributes: ['id', 'title', 'boardId'],
          where: { boardId }
        }],
        attributes: ['id', 'title', 'description', 'position', 'priority', 'dueDate', 'isCompleted', 'labels', 'listId', 'createdBy', 'createdAt', 'updatedAt']
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this list'
        });
      }

      res.json({ card });
    } catch (error) {
      console.error('Get card by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve card'
      });
    }
  },

  // Update a card
  async updateCard(req, res) {
    try {
      const { boardId, listId, cardId } = req.params;
      const { error, value } = updateCardSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: List,
          as: 'list',
          attributes: ['id', 'boardId'],
          where: { boardId }
        }]
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this list'
        });
      }

      await card.update(value);

      res.json({
        message: 'Card updated successfully',
        card: {
          id: card.id,
          title: card.title,
          description: card.description,
          position: card.position,
          priority: card.priority,
          dueDate: card.dueDate,
          isCompleted: card.isCompleted,
          labels: card.labels,
          listId: card.listId,
          createdBy: card.createdBy,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
        }
      });
    } catch (error) {
      console.error('Update card error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update card'
      });
    }
  },

  // Move card to another list
  async moveCard(req, res) {
    try {
      const { boardId, listId, cardId } = req.params;
      const { error, value } = moveCardSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      // Verify both source and target lists exist in the board
      const [sourceList, targetList] = await Promise.all([
        List.findOne({ where: { id: listId, boardId } }),
        List.findOne({ where: { id: value.targetListId, boardId } })
      ]);

      if (!sourceList || !targetList) {
        return res.status(404).json({
          error: 'List not found',
          message: 'Source or target list does not exist in this board'
        });
      }

      const card = await Card.findOne({
        where: { id: cardId, listId }
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in the source list'
        });
      }

      // Move card using transaction
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (t) => {
        // Remove card from source list (shift positions)
        await Card.decrement('position', {
          where: {
            listId,
            position: { [Op.gt]: card.position }
          },
          transaction: t
        });

        // Make space in target list (shift positions)
        await Card.increment('position', {
          where: {
            listId: value.targetListId,
            position: { [Op.gte]: value.position }
          },
          transaction: t
        });

        // Update card with new list and position
        await card.update({
          listId: value.targetListId,
          position: value.position
        }, { transaction: t });
      });

      res.json({
        message: 'Card moved successfully',
        card: {
          id: card.id,
          title: card.title,
          description: card.description,
          position: card.position,
          priority: card.priority,
          dueDate: card.dueDate,
          isCompleted: card.isCompleted,
          labels: card.labels,
          listId: card.listId,
          createdBy: card.createdBy,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
        }
      });
    } catch (error) {
      console.error('Move card error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to move card'
      });
    }
  },

  // Delete a card
  async deleteCard(req, res) {
    try {
      const { boardId, listId, cardId } = req.params;

      // Check if board exists and belongs to user
      const board = await Board.findOne({
        where: {
          id: boardId,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: List,
          as: 'list',
          attributes: ['id', 'boardId'],
          where: { boardId }
        }]
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this list'
        });
      }

      // Shift positions of cards after this one
      await Card.decrement('position', {
        where: {
          listId,
          position: { [Op.gt]: card.position }
        }
      });

      await card.destroy();

      res.json({
        message: 'Card deleted successfully'
      });
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete card'
      });
    }
  }
};

module.exports = cardController;
