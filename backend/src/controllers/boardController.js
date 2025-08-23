const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const { createBoardSchema, updateBoardSchema } = require('../validation/boardValidation');
const { Op } = require('sequelize');

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

      // Automatically add the creator as an admin member
      await BoardMember.create({
        boardId: board.id,
        userId: req.user.id,
        role: 'admin',
        status: 'accepted',
        invitedBy: req.user.id
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

  // Get all boards for the authenticated user (owned + shared)
  async getUserBoards(req, res) {
    try {
      const { page = 1, limit = 10, search, type = 'all' } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      let includeShared = type === 'all' || type === 'shared';
      let includeOwned = type === 'all' || type === 'owned';

      if (search) {
        whereClause.title = {
          [Op.like]: `%${search}%`
        };
      }

      let boards = [];
      let totalCount = 0;

      // Get owned boards
      if (includeOwned) {
        const ownedBoards = await Board.findAll({
          where: {
            ...whereClause,
            userId: req.user.id
          },
          attributes: ['id', 'title', 'description', 'color', 'isPrivate', 'createdAt', 'updatedAt'],
          order: [['updatedAt', 'DESC']]
        });

        boards = boards.concat(ownedBoards.map(board => ({
          ...board.toJSON(),
          role: 'owner',
          isOwner: true
        })));
      }

      // Get shared boards (where user is a member)
      if (includeShared) {
        const sharedBoardsData = await BoardMember.findAll({
          where: {
            userId: req.user.id,
            status: 'accepted'
          },
          include: [{
            model: Board,
            as: 'board',
            where: whereClause,
            attributes: ['id', 'title', 'description', 'color', 'isPrivate', 'createdAt', 'updatedAt']
          }],
          attributes: ['role'],
          order: [[{model: Board, as: 'board'}, 'updatedAt', 'DESC']]
        });

        const sharedBoards = sharedBoardsData.map(membership => ({
          ...membership.board.toJSON(),
          role: membership.role,
          isOwner: false
        }));

        boards = boards.concat(sharedBoards);
      }

      // Sort all boards by updatedAt
      boards.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      // Apply pagination
      totalCount = boards.length;
      const paginatedBoards = boards.slice(offset, offset + parseInt(limit));

      res.json({
        boards: paginatedBoards,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalBoards: totalCount,
          hasNext: offset + paginatedBoards.length < totalCount,
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
      // Board is already fetched and access verified by permission middleware
      const board = {
        id: req.board.id,
        title: req.board.title,
        description: req.board.description,
        color: req.board.color,
        isPrivate: req.board.isPrivate,
        createdAt: req.board.createdAt,
        updatedAt: req.board.updatedAt,
        role: req.userBoardRole
      };

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
      const { error, value } = updateBoardSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Board is already fetched and access verified by permission middleware
      await req.board.update(value);

      res.json({
        message: 'Board updated successfully',
        board: {
          id: req.board.id,
          title: req.board.title,
          description: req.board.description,
          color: req.board.color,
          isPrivate: req.board.isPrivate,
          createdAt: req.board.createdAt,
          updatedAt: req.board.updatedAt
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
      // Board is already fetched and access verified by permission middleware
      // Only admins/owners can delete boards (enforced by canAdmin middleware)
      await req.board.destroy();

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
