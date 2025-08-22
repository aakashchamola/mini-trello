const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkBoardAccess } = require('../middleware/boardPermissions');
const dragDropController = require('../controllers/dragDropController');

// Apply authentication to all routes
router.use(authenticateToken);

// Move a card to a different position/list
router.put('/cards/:cardId/move', 
  checkBoardAccess('editor'),
  dragDropController.moveCard
);

// Move a list to a different position
router.put('/lists/:listId/move',
  checkBoardAccess('editor'),
  dragDropController.moveList
);

// Bulk update positions (for performance optimization)
router.put('/bulk-update',
  checkBoardAccess('editor'),
  dragDropController.bulkUpdatePositions
);

// Rebalance positions when they become too dense
router.post('/rebalance',
  checkBoardAccess('editor'),
  dragDropController.rebalancePositions
);

module.exports = router;
