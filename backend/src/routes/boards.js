const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit, canAdmin } = require('../middleware/boardPermissions');
const ActivityLogger = require('../middleware/activityLogger');

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD operations
router.post('/', ActivityLogger.logBoardActivity, boardController.createBoard);
router.get('/', boardController.getUserBoards);
router.get('/:boardId', canRead, boardController.getBoardById);
router.get('/:boardId/activities', canRead, ActivityLogger.getBoardActivities);
router.put('/:boardId', canEdit, ActivityLogger.logBoardActivity, boardController.updateBoard);
router.delete('/:boardId', canAdmin, ActivityLogger.logBoardActivity, boardController.deleteBoard);

module.exports = router;
