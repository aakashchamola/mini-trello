const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit } = require('../middleware/boardPermissions');

// All list routes require authentication
router.use(authenticateToken);

// List CRUD operations within boards
router.post('/boards/:boardId/lists', canEdit, listController.createList);
router.get('/boards/:boardId/lists', canRead, listController.getBoardLists);
router.get('/boards/:boardId/lists/:listId', canRead, listController.getListById);
router.put('/boards/:boardId/lists/:listId', canEdit, listController.updateList);
router.put('/boards/:boardId/lists/reorder', canEdit, listController.reorderLists);
router.delete('/boards/:boardId/lists/:listId', canEdit, listController.deleteList);

module.exports = router;
