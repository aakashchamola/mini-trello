// Activity Logging Middleware
// Automatically logs user activities for audit trails and activity feeds

const { Activity } = require('../models');

class ActivityLogger {
  /**
   * Log an activity to the database
   * @param {Object} params - Activity parameters
   * @param {number} params.boardId - Board ID where activity occurred
   * @param {number} params.userId - User who performed the action
   * @param {string} params.actionType - Type of action (created, updated, deleted, etc.)
   * @param {string} params.entityType - Type of entity (board, list, card, comment, member)
   * @param {number} params.entityId - ID of the affected entity
   * @param {Object} params.oldValue - Previous state (for updates)
   * @param {Object} params.newValue - New state
   * @param {string} params.description - Human-readable description
   */
  static async logActivity({
    boardId,
    userId,
    actionType,
    entityType,
    entityId,
    oldValue = null,
    newValue = null,
    description
  }) {
    try {
      await Activity.create({
        boardId,
        userId,
        actionType,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        description
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Middleware to log board activities
   */
  static logBoardActivity = async (req, res, next) => {
    // Store original methods to track changes
    const originalSend = res.send;
    const originalJson = res.json;

    // Capture the response to get created/updated data
    let responseData = null;
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      if (typeof data === 'object') {
        responseData = data;
      }
      return originalSend.call(this, data);
    };

    // Continue with the original request
    res.on('finish', async () => {
      try {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300 && responseData) {
          const boardId = req.params.boardId || (responseData.board && responseData.board.id);
          const userId = req.user?.id;

          if (!boardId || !userId) return;

          let description = '';
          let entityId = null;
          let newValue = null;
          let actionType = '';

          // Determine action type based on HTTP method and response
          if (req.method === 'POST') {
            actionType = 'created';
            if (responseData.board) {
              entityId = responseData.board.id;
              newValue = {
                title: responseData.board.title,
                description: responseData.board.description
              };
              description = `${req.user.username} created board "${responseData.board.title}"`;
            }
          } else if (req.method === 'PUT') {
            actionType = 'updated';
            if (responseData.board) {
              entityId = responseData.board.id;
              newValue = req.body;
              description = `${req.user.username} updated board "${responseData.board.title}"`;
            }
          } else if (req.method === 'DELETE') {
            actionType = 'deleted';
            entityId = parseInt(boardId);
            description = `${req.user.username} deleted a board`;
          }

          if (entityId) {
            await ActivityLogger.logActivity({
              boardId: parseInt(boardId),
              userId,
              actionType,
              entityType: 'board',
              entityId,
              newValue,
              description
            });
          }
        }
      } catch (error) {
        console.error('Board activity logging error:', error);
      }
    });

    next();
  };

  /**
   * Middleware to log card activities
   */
  static logCardActivity = async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    let responseData = null;
    let oldCardData = null;

    // For updates, fetch current data first
    if (req.method === 'PUT' && req.params.cardId) {
      try {
        const Card = require('../models/Card');
        const existingCard = await Card.findByPk(req.params.cardId);
        if (existingCard) {
          oldCardData = {
            title: existingCard.title,
            description: existingCard.description,
            priority: existingCard.priority,
            assignees: existingCard.assignees,
            labels: existingCard.labels,
            isCompleted: existingCard.isCompleted
          };
        }
      } catch (error) {
        console.error('Failed to fetch old card data:', error);
      }
    }

    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300 && responseData) {
          const boardId = req.params.boardId;
          const userId = req.user?.id;
          const cardId = req.params.cardId;

          if (!boardId || !userId) return;

          let description = '';
          let entityId = null;
          let newValue = null;
          let actionType = '';

          // Determine action type based on HTTP method and URL path
          if (req.method === 'POST') {
            actionType = 'created';
            if (responseData.card) {
              entityId = responseData.card.id;
              newValue = {
                title: responseData.card.title,
                priority: responseData.card.priority,
                assignees: responseData.card.assignees,
                labels: responseData.card.labels
              };
              description = `${req.user.username} created card "${responseData.card.title}"`;
            }
          } else if (req.method === 'PUT') {
            if (req.url.includes('/move')) {
              actionType = 'moved';
              if (responseData.card) {
                entityId = responseData.card.id;
                newValue = { targetListId: req.body.targetListId };
                description = `${req.user.username} moved card "${responseData.card.title}"`;
              }
            } else {
              actionType = 'updated';
              if (responseData.card) {
                entityId = responseData.card.id;
                newValue = req.body;
                description = `${req.user.username} updated card "${responseData.card.title}"`;
              }
            }
          } else if (req.method === 'DELETE') {
            actionType = 'deleted';
            entityId = parseInt(cardId);
            description = `${req.user.username} deleted a card`;
          }

          if (entityId) {
            await ActivityLogger.logActivity({
              boardId: parseInt(boardId),
              userId,
              actionType,
              entityType: 'card',
              entityId,
              oldValue: oldCardData,
              newValue,
              description
            });
          }
        }
      } catch (error) {
        console.error('Card activity logging error:', error);
      }
    });

    next();
  };

  /**
   * Middleware to log list activities
   */
  static logListActivity = async (req, res, next) => {
    const originalJson = res.json;
    let responseData = null;

    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300 && responseData) {
          const boardId = req.params.boardId;
          const userId = req.user?.id;

          if (!boardId || !userId) return;

          let description = '';
          let entityId = null;
          let newValue = null;
          let actionType = '';

          if (req.method === 'POST') {
            actionType = 'created';
            if (responseData.list) {
              entityId = responseData.list.id;
              newValue = { title: responseData.list.title, position: responseData.list.position };
              description = `${req.user.username} created list "${responseData.list.title}"`;
            }
          } else if (req.method === 'PUT') {
            actionType = 'updated';
            if (responseData.list) {
              entityId = responseData.list.id;
              newValue = req.body;
              description = `${req.user.username} updated list "${responseData.list.title}"`;
            }
          } else if (req.method === 'DELETE') {
            actionType = 'deleted';
            entityId = parseInt(req.params.listId || req.params.id);
            description = `${req.user.username} deleted a list`;
          }

          if (entityId) {
            await ActivityLogger.logActivity({
              boardId: parseInt(boardId),
              userId,
              actionType,
              entityType: 'list',
              entityId,
              newValue,
              description
            });
          }
        }
      } catch (error) {
        console.error('List activity logging error:', error);
      }
    });

    next();
  };

  /**
   * Middleware to log comment activities
   */
  static logCommentActivity = async (req, res, next) => {
    const originalJson = res.json;
    let responseData = null;

    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300 && responseData) {
          const boardId = req.params.boardId;
          const userId = req.user?.id;

          if (!boardId || !userId) return;

          let description = '';
          let entityId = null;
          let newValue = null;
          let actionType = '';

          if (req.method === 'POST') {
            actionType = 'commented';
            if (responseData.comment) {
              entityId = responseData.comment.id;
              newValue = { content: responseData.comment.content };
              description = `${req.user.username} commented on a card`;
            }
          } else if (req.method === 'PUT') {
            actionType = 'updated';
            if (responseData.comment) {
              entityId = responseData.comment.id;
              newValue = req.body;
              description = `${req.user.username} updated comment`;
            }
          } else if (req.method === 'DELETE') {
            actionType = 'deleted';
            entityId = parseInt(req.params.commentId);
            description = `${req.user.username} deleted a comment`;
          }

          if (entityId) {
            await ActivityLogger.logActivity({
              boardId: parseInt(boardId),
              userId,
              actionType,
              entityType: 'comment',
              entityId,
              newValue,
              description
            });
          }
        }
      } catch (error) {
        console.error('Comment activity logging error:', error);
      }
    });

    next();
  };

  /**
   * Get board activities feed with filtering and pagination
   */
  static getBoardActivities = async (req, res) => {
    try {
      const { boardId } = req.params;
      const {
        page = 1,
        limit = 50,
        actionType,
        entityType,
        userId: filterUserId
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { boardId: parseInt(boardId) };

      // Add filters if provided
      if (actionType) whereClause.actionType = actionType;
      if (entityType) whereClause.entityType = entityType;
      if (filterUserId) whereClause.userId = parseInt(filterUserId);

      const { rows: activities, count: totalCount } = await Activity.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: require('../models/User'),
            as: 'user',
            attributes: ['id', 'username', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        success: true,
        activities,
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      });
    } catch (error) {
      console.error('Failed to fetch board activities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch board activities'
      });
    }
  };
}

module.exports = ActivityLogger;
