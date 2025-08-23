const List = require('../models/List');
const Board = require('../models/Board');
const { createListSchema, updateListSchema, reorderListsSchema } = require('../validation/listValidation');
const { Op } = require('sequelize');
const positionService = require('../services/positionService');

const listController = {
  // Create a new list in a board
  async createList(req, res) {
    try {
      const { boardId } = req.params;
      const { error, value } = createListSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Board access is already checked by middleware
      const board = req.board;
      
      // Validate boardId parameter
      const boardIdNum = parseInt(boardId, 10);
      if (isNaN(boardIdNum)) {
        return res.status(400).json({
          error: 'Invalid board ID',
          message: 'Board ID must be a valid number'
        });
      }

      console.log('Creating list for board:', boardIdNum, 'with data:', value);

      // Always generate a unique position to avoid conflicts
      let position = await positionService.getUniqueListPosition(boardIdNum);

      console.log('List position calculated:', position);

      // Create the new list directly (no need for position shifting with decimal positions)
      const listData = {
        ...value,
        position,
        boardId: boardIdNum
      };
      
      console.log('Creating list with data:', listData);
      
      // Try to create the list, with retry logic for position conflicts
      let list;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          list = await List.create(listData);
          break; // Success, exit loop
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError' && retryCount < maxRetries - 1) {
            console.log(`Position conflict detected, generating new position (attempt ${retryCount + 1})`);
            // Generate a new unique position and try again
            listData.position = await positionService.getUniqueListPosition(boardIdNum);
            retryCount++;
          } else {
            throw error; // Re-throw if not a position conflict or max retries reached
          }
        }
      }

      console.log('List created successfully:', list);

      const newList = {
        id: list.id,
        title: list.title,
        position: list.position,
        boardId: list.boardId,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      };

      // Emit real-time update to all clients on this board
      if (req.io) {
        console.log('Emitting list:created event to board-' + boardIdNum);
        req.io.to(`board-${boardIdNum}`).emit('list:created', {
          list: newList,
          boardId: boardIdNum,
          userId: req.user.id,
          timestamp: new Date()
        });
      } else {
        console.log('req.io is not available for list creation');
      }

      res.status(201).json({
        message: 'List created successfully',
        list: newList
      });
    } catch (error) {
      console.error('Create list error:', error);
      
      // Handle specific Sequelize errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'Duplicate constraint violation',
          message: 'A list with this position already exists for this board',
          details: error.errors.map(e => e.message)
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid data provided',
          details: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create list'
      });
    }
  },

  // Get all lists for a board
  async getBoardLists(req, res) {
    try {
      const { boardId } = req.params;

      // Board access is already checked by middleware
      const board = req.board;

      const lists = await List.findAll({
        where: { boardId },
        order: [['position', 'ASC']],
        attributes: ['id', 'title', 'position', 'boardId', 'createdAt', 'updatedAt']
      });

      res.json({
        lists,
        boardId: parseInt(boardId),
        totalLists: lists.length
      });
    } catch (error) {
      console.error('Get board lists error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve lists'
      });
    }
  },

  // Get a specific list by ID
  async getListById(req, res) {
    try {
      const { boardId, listId } = req.params;

      // Board access is already checked by middleware
      const board = req.board;

      const list = await List.findOne({
        where: {
          id: listId,
          boardId
        },
        attributes: ['id', 'title', 'position', 'boardId', 'createdAt', 'updatedAt']
      });

      if (!list) {
        return res.status(404).json({
          error: 'List not found',
          message: 'List does not exist in this board'
        });
      }

      res.json({ list });
    } catch (error) {
      console.error('Get list by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve list'
      });
    }
  },

  // Update a list
  async updateList(req, res) {
    try {
      const { boardId, listId } = req.params;
      const { error, value } = updateListSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Board access is already checked by middleware
      const board = req.board;
      
      // Validate parameters
      const boardIdNum = parseInt(boardId, 10);
      const listIdNum = parseInt(listId, 10);
      
      if (isNaN(boardIdNum) || isNaN(listIdNum)) {
        return res.status(400).json({
          error: 'Invalid parameters',
          message: 'Board ID and List ID must be valid numbers'
        });
      }

      console.log('Updating list:', listIdNum, 'in board:', boardIdNum, 'with data:', value);

      const list = await List.findOne({
        where: {
          id: listIdNum,
          boardId: boardIdNum
        }
      });

      if (!list) {
        return res.status(404).json({
          error: 'List not found',
          message: 'List does not exist in this board'
        });
      }

      // Use transaction for position updates to avoid conflicts
      const { sequelize } = require('../config/database');
      const updatedList = await sequelize.transaction(async (t) => {
        // Handle position updates with conflict resolution
        if (value.position !== undefined && value.position !== list.position) {
          console.log('Updating position from', list.position, 'to', value.position);
          
          if (value.position > list.position) {
            // Moving right - shift left
            await List.decrement('position', {
              where: {
                boardId: boardIdNum,
                position: {
                  [Op.gt]: list.position,
                  [Op.lte]: value.position
                }
              },
              transaction: t
            });
          } else {
            // Moving left - shift right
            await List.increment('position', {
              where: {
                boardId: boardIdNum,
                position: {
                  [Op.gte]: value.position,
                  [Op.lt]: list.position
                }
              },
              transaction: t
            });
          }
        }

        await list.update(value, { transaction: t });
        return list;
      });

      console.log('List updated successfully:', updatedList);

      const updatedListData = {
        id: updatedList.id,
        title: updatedList.title,
        position: updatedList.position,
        boardId: updatedList.boardId,
        createdAt: updatedList.createdAt,
        updatedAt: updatedList.updatedAt
      };

      // Emit real-time update to all clients on this board
      if (req.io) {
        console.log('Emitting list:updated event to board-' + board.id);
        req.io.to(`board-${board.id}`).emit('list:updated', {
          list: updatedListData,
          boardId: board.id,
          userId: req.user.id,
          timestamp: new Date()
        });
      } else {
        console.log('req.io is not available for list update');
      }

      res.json({
        message: 'List updated successfully',
        list: updatedListData
      });
    } catch (error) {
      console.error('Update list error:', error);
      
      // Handle specific Sequelize errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'Duplicate constraint violation',
          message: 'A list with this position already exists for this board',
          details: error.errors.map(e => e.message)
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid data provided',
          details: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update list'
      });
    }
  },

  // Reorder multiple lists
  async reorderLists(req, res) {
    try {
      const { boardId } = req.params;
      const { error, value } = reorderListsSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Board access is already checked by middleware
      const board = req.board;

      // Verify all lists belong to the board
      const listIds = value.listPositions.map(lp => lp.id);
      const existingLists = await List.findAll({
        where: {
          id: { [Op.in]: listIds },
          boardId
        }
      });

      if (existingLists.length !== listIds.length) {
        return res.status(400).json({
          error: 'Invalid lists',
          message: 'Some lists do not exist in this board'
        });
      }

      // Update positions in a transaction using temporary positions to avoid constraint violations
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (t) => {
        // First, set all lists to temporary high positive positions to avoid unique constraint violations
        for (let i = 0; i < value.listPositions.length; i++) {
          const { id } = value.listPositions[i];
          await List.update(
            { position: 999999 + i }, // Use high positive numbers that won't conflict
            {
              where: { id, boardId },
              transaction: t
            }
          );
        }
        
        // Then, update to the final positions
        for (const { id, position } of value.listPositions) {
          await List.update(
            { position },
            {
              where: { id, boardId },
              transaction: t
            }
          );
        }
      });

      // Get updated lists
      const updatedLists = await List.findAll({
        where: { boardId },
        order: [['position', 'ASC']],
        attributes: ['id', 'title', 'position', 'boardId', 'createdAt', 'updatedAt']
      });

      // Emit real-time update to all clients on this board for each list that moved
      if (req.io) {
        console.log('Emitting list:moved events to board-' + board.id);
        for (const { id, position } of value.listPositions) {
          const listData = updatedLists.find(list => list.id === id);
          req.io.to(`board-${board.id}`).emit('list:moved', {
            listId: id,
            newPosition: position,
            listData: {
              id: listData.id,
              title: listData.title,
              position: listData.position,
              boardId: listData.boardId
            },
            movedBy: req.user,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.log('req.io is not available for list reorder event');
      }

      res.json({
        message: 'Lists reordered successfully',
        lists: updatedLists
      });
    } catch (error) {
      console.error('Reorder lists error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reorder lists'
      });
    }
  },

  // Delete a list
  async deleteList(req, res) {
    try {
      const { boardId, listId } = req.params;

      // Board access is already checked by middleware
      const board = req.board;

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

      const deletedPosition = list.position;

      // Use transaction to ensure data consistency
      const { sequelize } = require('../config/database');
      const { Card, Comment } = require('../models');
      
      await sequelize.transaction(async (t) => {
        // Get all cards in this list
        const cards = await Card.findAll({
          where: { listId: list.id },
          transaction: t
        });

        // For each card, delete all its comments first
        for (const card of cards) {
          await Comment.destroy({
            where: { cardId: card.id },
            transaction: t
          });
        }

        // Then delete all cards in this list
        await Card.destroy({
          where: { listId: list.id },
          transaction: t
        });

        // Then delete the list
        await list.destroy({ transaction: t });

        // Finally shift positions of lists that were after this one
        await List.decrement('position', {
          where: {
            boardId,
            position: { [Op.gt]: deletedPosition }
          },
          transaction: t
        });
      });

      // Emit real-time update to all clients on this board
      if (req.io) {
        console.log('Emitting list:deleted event to board-' + board.id);
        req.io.to(`board-${board.id}`).emit('list:deleted', {
          listId: list.id,
          boardId: board.id,
          userId: req.user.id,
          timestamp: new Date()
        });
      } else {
        console.log('req.io is not available for list deletion');
      }

      res.json({
        message: 'List deleted successfully'
      });
    } catch (error) {
      console.error('Delete list error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete list'
      });
    }
  }
};

module.exports = listController;
