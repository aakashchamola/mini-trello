const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit, canAdmin } = require('../middleware/boardPermissions');

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD operations
router.post('/', boardController.createBoard);
router.get('/', boardController.getUserBoards);
router.get('/:boardId', canRead, boardController.getBoardById);
router.put('/:boardId', canEdit, boardController.updateBoard);
router.delete('/:boardId', canAdmin, boardController.deleteBoard);

module.exports = router;
