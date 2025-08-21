const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit } = require('../middleware/boardPermissions');

// All comment routes require authentication
router.use(authenticateToken);

// Comment CRUD operations within cards
router.post('/boards/:boardId/lists/:listId/cards/:cardId/comments', canEdit, commentController.createComment);
router.get('/boards/:boardId/lists/:listId/cards/:cardId/comments', canRead, commentController.getCardComments);
router.put('/boards/:boardId/lists/:listId/cards/:cardId/comments/:commentId', canRead, commentController.updateComment);
router.delete('/boards/:boardId/lists/:listId/cards/:cardId/comments/:commentId', canRead, commentController.deleteComment);

module.exports = router;
