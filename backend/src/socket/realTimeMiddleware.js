// Real-time middleware to emit events for route operations
class RealTimeMiddleware {
  constructor(boardEvents) {
    this.boardEvents = boardEvents;
  }

  // Middleware to emit card events
  emitCardEvents() {
    return (req, res, next) => {
      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Call original json method
        originalJson.call(this, data);
        
        // Emit real-time events based on method and route
        const method = req.method;
        const route = req.route?.path;
        
        try {
          if (method === 'POST' && route === '/boards/:boardId/lists/:listId/cards') {
            // Card created
            if (data.success && data.data) {
              req.boardEvents?.emitCardCreated(
                req.params.boardId, 
                data.data, 
                req.user
              );
            }
          } else if (method === 'PUT' && route === '/boards/:boardId/lists/:listId/cards/:cardId') {
            // Card updated
            if (data.success && data.data && req.oldCardData) {
              req.boardEvents?.emitCardUpdated(
                req.params.boardId,
                req.params.cardId,
                req.oldCardData,
                data.data,
                req.user,
                req.cardChanges || {}
              );
            }
          } else if (method === 'PUT' && route === '/boards/:boardId/cards/:cardId/move') {
            // Card moved
            if (data.success && data.data && req.moveData) {
              req.boardEvents?.emitCardMoved(
                req.params.boardId,
                req.params.cardId,
                req.moveData.fromListId,
                req.moveData.toListId,
                data.data,
                req.user
              );
            }
          } else if (method === 'DELETE' && route === '/boards/:boardId/lists/:listId/cards/:cardId') {
            // Card deleted
            if (data.success && req.deletedCardTitle) {
              req.boardEvents?.emitCardDeleted(
                req.params.boardId,
                req.params.cardId,
                req.deletedCardTitle,
                req.user
              );
            }
          }
        } catch (error) {
          console.error('Error emitting real-time card event:', error);
        }
      };
      
      // Attach boardEvents to request for route handlers to use
      req.boardEvents = this.boardEvents;
      next();
    };
  }

  // Middleware to emit comment events
  emitCommentEvents() {
    return (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        originalJson.call(this, data);
        
        const method = req.method;
        const route = req.route?.path;
        
        try {
          if (method === 'POST' && route === '/boards/:boardId/cards/:cardId/comments') {
            // Comment created
            if (data.success && data.data) {
              req.boardEvents?.emitCommentCreated(
                req.params.boardId,
                req.params.cardId,
                data.data,
                req.user
              );
            }
          } else if (method === 'PUT' && route === '/boards/:boardId/cards/:cardId/comments/:commentId') {
            // Comment updated
            if (data.success && data.data && req.oldCommentData) {
              req.boardEvents?.emitCommentUpdated(
                req.params.boardId,
                req.params.cardId,
                req.params.commentId,
                req.oldCommentData,
                data.data,
                req.user
              );
            }
          }
        } catch (error) {
          console.error('Error emitting real-time comment event:', error);
        }
      };
      
      req.boardEvents = this.boardEvents;
      next();
    };
  }

  // Middleware to emit list events
  emitListEvents() {
    return (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        originalJson.call(this, data);
        
        const method = req.method;
        const route = req.route?.path;
        
        try {
          if (method === 'POST' && route === '/boards/:boardId/lists') {
            // List created
            if (data.success && data.data) {
              req.boardEvents?.emitListCreated(
                req.params.boardId,
                data.data,
                req.user
              );
            }
          } else if (method === 'PUT' && route === '/boards/:boardId/lists/:listId') {
            // List updated
            if (data.success && data.data && req.oldListData) {
              req.boardEvents?.emitListUpdated(
                req.params.boardId,
                req.params.listId,
                req.oldListData,
                data.data,
                req.user,
                req.listChanges || {}
              );
            }
          }
        } catch (error) {
          console.error('Error emitting real-time list event:', error);
        }
      };
      
      req.boardEvents = this.boardEvents;
      next();
    };
  }

  // Middleware to emit board events
  emitBoardEvents() {
    return (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        originalJson.call(this, data);
        
        const method = req.method;
        const route = req.route?.path;
        
        try {
          if (method === 'PUT' && route === '/boards/:boardId') {
            // Board updated
            if (data.success && data.data && req.oldBoardData) {
              req.boardEvents?.emitBoardUpdated(
                req.params.boardId,
                req.oldBoardData,
                data.data,
                req.user,
                req.boardChanges || {}
              );
            }
          }
        } catch (error) {
          console.error('Error emitting real-time board event:', error);
        }
      };
      
      req.boardEvents = this.boardEvents;
      next();
    };
  }

  // Helper middleware to capture old data before updates
  captureOldData(entityType) {
    return async (req, res, next) => {
      try {
        const id = req.params.cardId || req.params.listId || req.params.boardId || req.params.commentId;
        
        if (req.method === 'PUT' || req.method === 'DELETE') {
          let model;
          let dataKey;
          
          switch (entityType) {
            case 'card':
              model = require('../models/Card');
              dataKey = 'oldCardData';
              break;
            case 'list':
              model = require('../models/List');
              dataKey = 'oldListData';
              break;
            case 'board':
              model = require('../models/Board');
              dataKey = 'oldBoardData';
              break;
            case 'comment':
              model = require('../models/Comment');
              dataKey = 'oldCommentData';
              break;
            default:
              return next();
          }
          
          if (model && id) {
            const oldData = await model.findByPk(id);
            if (oldData) {
              req[dataKey] = oldData.toJSON();
              
              // For DELETE operations, store title for activity
              if (req.method === 'DELETE' && entityType === 'card') {
                req.deletedCardTitle = oldData.title;
              }
            }
          }
        }
        
        next();
      } catch (error) {
        console.error(`Error capturing old ${entityType} data:`, error);
        next();
      }
    };
  }

  // Middleware to capture changes in request body
  captureChanges(entityType) {
    return (req, res, next) => {
      if (req.method === 'PUT' && req.body) {
        const changesKey = `${entityType}Changes`;
        req[changesKey] = req.body;
      }
      next();
    };
  }

  // Middleware to capture move data for card moves
  captureMoveData() {
    return (req, res, next) => {
      if (req.method === 'PUT' && req.body) {
        req.moveData = {
          fromListId: req.body.fromListId,
          toListId: req.body.toListId,
          newPosition: req.body.newPosition
        };
      }
      next();
    };
  }
}

module.exports = RealTimeMiddleware;
