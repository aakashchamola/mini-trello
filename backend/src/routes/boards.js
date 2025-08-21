const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken } = require('../middleware/auth');

// All board routes require authentication
router.use(authenticateToken);

// Board CRUD operations
router.post('/', boardController.createBoard);
router.get('/', boardController.getUserBoards);
router.get('/:id', boardController.getBoardById);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

module.exports = router;
