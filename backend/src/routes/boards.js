const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit, canAdmin } = require('../middleware/boardPermissions');

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD operations
router.post('/boards', authenticateToken, boardController.createBoard);
router.get('/boards', authenticateToken, boardController.getUserBoards);
router.get('/boards/:boardId', authenticateToken, canRead, boardController.getBoardById);
router.put('/boards/:boardId', authenticateToken, canEdit, boardController.updateBoard);
router.delete('/boards/:boardId', authenticateToken, canAdmin, boardController.deleteBoard);

module.exports = router;
