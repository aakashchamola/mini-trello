const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const User = require('../models/User');
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

      // Board access is already checked by middleware
      const board = req.board;

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
          assignees: card.assignees,
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

      // Board access is already checked by middleware
      const board = req.board;

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

      // Board access is already checked by middleware - get board with lists for cards
      const board = await Board.findByPk(boardId, {
        include: [{
          model: List,
          as: 'lists',
          attributes: ['id', 'title']
        }]
      });

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

      // Board access is already checked by middleware
      const board = req.board;
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

  // Search cards across a board
  async searchBoardCards(req, res) {
    try {
      const { boardId } = req.params;
      const { 
        q: searchQuery, 
        labels, 
        assignees, 
        priority, 
        completed, 
        dueDate,
        page = 1, 
        limit = 20 
      } = req.query;

      // Board access is already checked by middleware
      const board = req.board;

      const offset = (page - 1) * limit;
      const whereClause = {};
      const searchConditions = [];

      // Text search across title and description
      if (searchQuery) {
        searchConditions.push({
          [Op.or]: [
            { title: { [Op.like]: `%${searchQuery}%` } },
            { description: { [Op.like]: `%${searchQuery}%` } }
          ]
        });
      }

      // Filter by labels
      if (labels) {
        const labelArray = Array.isArray(labels) ? labels : [labels];
        searchConditions.push({
          [Op.or]: labelArray.map(label => ({
            labels: { [Op.like]: `%"${label}"%` }
          }))
        });
      }

      // Filter by assignees
      if (assignees) {
        const assigneeArray = Array.isArray(assignees) ? assignees : [assignees];
        const assigneeIds = assigneeArray.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (assigneeIds.length > 0) {
          searchConditions.push({
            [Op.or]: assigneeIds.map(assigneeId => ({
              assignees: { [Op.like]: `%${assigneeId}%` }
            }))
          });
        }
      }

      // Filter by priority
      if (priority) {
        const priorityArray = Array.isArray(priority) ? priority : [priority];
        whereClause.priority = { [Op.in]: priorityArray };
      }

      // Filter by completion status
      if (completed !== undefined) {
        whereClause.isCompleted = completed === 'true';
      }

      // Filter by due date
      if (dueDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        switch (dueDate) {
          case 'overdue':
            whereClause.dueDate = { [Op.lt]: today };
            whereClause.isCompleted = false;
            break;
          case 'today':
            whereClause.dueDate = { 
              [Op.gte]: today.toISOString().split('T')[0],
              [Op.lt]: tomorrow.toISOString().split('T')[0]
            };
            break;
          case 'week':
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            whereClause.dueDate = { 
              [Op.gte]: today,
              [Op.lte]: nextWeek
            };
            break;
          case 'month':
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            whereClause.dueDate = { 
              [Op.gte]: today,
              [Op.lte]: nextMonth
            };
            break;
        }
      }

      // Combine all search conditions
      if (searchConditions.length > 0) {
        whereClause[Op.and] = searchConditions;
      }

      // Get cards from all lists in the board
      const cards = await Card.findAndCountAll({
        include: [{
          model: List,
          as: 'list',
          where: { boardId },
          attributes: ['id', 'title']
        }, {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }],
        where: whereClause,
        order: [['updatedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'title', 'description', 'position', 'priority', 
          'dueDate', 'isCompleted', 'labels', 'assignees', 'listId', 
          'createdBy', 'createdAt', 'updatedAt'
        ]
      });

      res.json({
        cards: cards.rows,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          total: cards.count,
          totalPages: Math.ceil(cards.count / limit)
        },
        boardId: parseInt(boardId),
        searchQuery,
        filters: {
          labels: labels || [],
          assignees: assignees || [],
          priority: priority || [],
          completed,
          dueDate
        }
      });
    } catch (error) {
      console.error('Search board cards error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to search cards'
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

      // Board access is already checked by middleware
      const board = req.board;
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
          assignees: card.assignees,
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
      console.log('moveCard called with params:', req.params);
      console.log('moveCard called with body:', req.body);
      
      const { boardId, listId, cardId } = req.params;
      
      // Convert string IDs to numbers before validation
      const bodyWithNumbers = {
        ...req.body,
        targetListId: parseInt(req.body.targetListId),
        position: parseInt(req.body.position)
      };
      
      const { error, value } = moveCardSchema.validate(bodyWithNumbers);
      
      if (error) {
        console.log('Validation error:', error.details);
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }
      
      console.log('Validation passed, validated data:', value);

      // Board access is already checked by middleware
      const board = req.board;
      if (!board) {
        console.log('Board not found in req.board');
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist or you do not have access to it'
        });
      }
      
      console.log('Board found:', board.id);

      // Verify both source and target lists exist in the board
      const [sourceList, targetList] = await Promise.all([
        List.findOne({ where: { id: listId, boardId } }),
        List.findOne({ where: { id: value.targetListId, boardId } })
      ]);

      if (!sourceList || !targetList) {
        console.log('Lists not found. Source:', !!sourceList, 'Target:', !!targetList);
        return res.status(404).json({
          error: 'List not found',
          message: 'Source or target list does not exist in this board'
        });
      }
      
      console.log('Lists found. Source:', sourceList.id, 'Target:', targetList.id);

      const card = await Card.findOne({
        where: { id: cardId, listId }
      });

      if (!card) {
        console.log('Card not found:', cardId, 'in list:', listId);
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in the source list'
        });
      }
      
      console.log('Card found:', card.id, 'current listId:', card.listId, 'position:', card.position);
      console.log('Move to listId:', value.targetListId, 'position:', value.position);

      // Move card using simplified transaction
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (t) => {
        const oldPosition = card.position;
        const oldListId = card.listId;
        const newPosition = value.position;
        const newListId = value.targetListId;

        console.log('Transaction start - oldPos:', oldPosition, 'newPos:', newPosition, 'oldList:', oldListId, 'newList:', newListId);

        if (oldListId !== newListId) {
          // Moving between different lists - simplified approach
          console.log('Moving between lists');
          
          // Step 1: Shift positions in source list (fill the gap)
          await Card.decrement('position', {
            where: {
              listId: oldListId,
              position: { [Op.gt]: oldPosition }
            },
            transaction: t
          });

          // Step 2: Make space in target list (shift positions)
          await Card.increment('position', {
            where: {
              listId: newListId,
              position: { [Op.gte]: newPosition }
            },
            transaction: t
          });
        } else {
          // Moving within the same list
          if (oldPosition < newPosition) {
            // Moving down - shift cards up
            await Card.decrement('position', {
              where: {
                listId: oldListId,
                position: { [Op.gt]: oldPosition, [Op.lte]: newPosition }
              },
              transaction: t
            });
          } else if (oldPosition > newPosition) {
            // Moving up - shift cards down  
            await Card.increment('position', {
              where: {
                listId: oldListId,
                position: { [Op.gte]: newPosition, [Op.lt]: oldPosition }
              },
              transaction: t
            });
          }
        }

        // Step 3: Update the card itself
        await card.update({
          listId: newListId,
          position: newPosition
        }, { transaction: t });
        
        console.log('Card move completed');
      });

      // Refresh the card data to return updated info
      await card.reload();

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

      // Board access is already checked by middleware
      const board = req.board;
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

      // Use transaction to ensure data consistency
      const { sequelize } = require('../config/database');
      await sequelize.transaction(async (t) => {
        // First delete the card
        await card.destroy({ transaction: t });
        
        // Then shift positions of cards after this one
        await Card.decrement('position', {
          where: {
            listId,
            position: { [Op.gt]: card.position }
          },
          transaction: t
        });
      });

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
