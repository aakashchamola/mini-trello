const Board = require('../models/Board');
const { createBoardSchema, updateBoardSchema } = require('../validation/boardValidation');

const boardController = {
  // Create a new board
  async createBoard(req, res) {
    try {
      const { error, value } = createBoardSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const board = await Board.create({
        ...value,
        userId: req.user.id
      });

      res.status(201).json({
        message: 'Board created successfully',
        board: {
          id: board.id,
          title: board.title,
          description: board.description,
          color: board.color,
          isPrivate: board.isPrivate,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt
        }
      });
    } catch (error) {
      console.error('Create board error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create board'
      });
    }
  },

  // Get all boards for the authenticated user
  async getUserBoards(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.user.id };
      
      if (search) {
        const { Op } = require('sequelize');
        whereClause.title = {
          [Op.like]: `%${search}%`
        };
      }

      const { count, rows: boards } = await Board.findAndCountAll({
        where: whereClause,
        order: [['updatedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: ['id', 'title', 'description', 'color', 'isPrivate', 'createdAt', 'updatedAt']
      });

      res.json({
        boards,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalBoards: count,
          hasNext: offset + boards.length < count,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get user boards error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve boards'
      });
    }
  },

  // Get a specific board by ID
  async getBoardById(req, res) {
    try {
      const { id } = req.params;

      const board = await Board.findOne({
        where: {
          id,
          userId: req.user.id
        },
        attributes: ['id', 'title', 'description', 'color', 'isPrivate', 'createdAt', 'updatedAt']
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      res.json({ board });
    } catch (error) {
      console.error('Get board by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve board'
      });
    }
  },

  // Update a board
  async updateBoard(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updateBoardSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const board = await Board.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      await board.update(value);

      res.json({
        message: 'Board updated successfully',
        board: {
          id: board.id,
          title: board.title,
          description: board.description,
          color: board.color,
          isPrivate: board.isPrivate,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt
        }
      });
    } catch (error) {
      console.error('Update board error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update board'
      });
    }
  },

  // Delete a board
  async deleteBoard(req, res) {
    try {
      const { id } = req.params;

      const board = await Board.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }

      await board.destroy();

      res.json({
        message: 'Board deleted successfully'
      });
    } catch (error) {
      console.error('Delete board error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete board'
      });
    }
  }
};

module.exports = boardController;
