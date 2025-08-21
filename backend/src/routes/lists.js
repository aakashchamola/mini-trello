const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authenticateToken } = require('../middleware/auth');

// All list routes require authentication
router.use(authenticateToken);

// List CRUD operations within boards
router.post('/boards/:boardId/lists', listController.createList);
router.get('/boards/:boardId/lists', listController.getBoardLists);
router.get('/boards/:boardId/lists/:listId', listController.getListById);
router.put('/boards/:boardId/lists/:listId', listController.updateList);
router.put('/boards/:boardId/lists/reorder', listController.reorderLists);
router.delete('/boards/:boardId/lists/:listId', listController.deleteList);

module.exports = router;
