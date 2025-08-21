const List = require('../models/List');
const Board = require('../models/Board');
const { createListSchema, updateListSchema, reorderListsSchema } = require('../validation/listValidation');
const { Op } = require('sequelize');

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

      // Get the next position if not provided
      let position = value.position;
      if (position === undefined) {
        const maxPosition = await List.max('position', {
          where: { boardId }
        });
        position = (maxPosition || -1) + 1;
      }

      // Handle position conflicts by shifting existing lists
      await List.increment('position', {
        where: {
          boardId,
          position: { [Op.gte]: position }
        }
      });

      const list = await List.create({
        ...value,
        position,
        boardId
      });

      res.status(201).json({
        message: 'List created successfully',
        list: {
          id: list.id,
          title: list.title,
          position: list.position,
          boardId: list.boardId,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        }
      });
    } catch (error) {
      console.error('Create list error:', error);
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

      // Handle position updates with conflict resolution
      if (value.position !== undefined && value.position !== list.position) {
        if (value.position > list.position) {
          // Moving right - shift left
          await List.decrement('position', {
            where: {
              boardId,
              position: {
                [Op.gt]: list.position,
                [Op.lte]: value.position
              }
            }
          });
        } else {
          // Moving left - shift right
          await List.increment('position', {
            where: {
              boardId,
              position: {
                [Op.gte]: value.position,
                [Op.lt]: list.position
              }
            }
          });
        }
      }

      await list.update(value);

      res.json({
        message: 'List updated successfully',
        list: {
          id: list.id,
          title: list.title,
          position: list.position,
          boardId: list.boardId,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        }
      });
    } catch (error) {
      console.error('Update list error:', error);
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

      // Update positions in a transaction
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (t) => {
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

      // Shift positions of lists after this one
      await List.decrement('position', {
        where: {
          boardId,
          position: { [Op.gt]: list.position }
        }
      });

      await list.destroy();

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
