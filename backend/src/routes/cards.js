const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit } = require('../middleware/boardPermissions');

// All card routes require authentication
router.use(authenticateToken);

// Card CRUD operations within lists
router.post('/boards/:boardId/lists/:listId/cards', canEdit, cardController.createCard);
router.get('/boards/:boardId/lists/:listId/cards', canRead, cardController.getListCards);
router.get('/boards/:boardId/cards', canRead, cardController.getBoardCards);
router.get('/boards/:boardId/lists/:listId/cards/:cardId', canRead, cardController.getCardById);
router.put('/boards/:boardId/lists/:listId/cards/:cardId', canEdit, cardController.updateCard);
router.put('/boards/:boardId/lists/:listId/cards/:cardId/move', canEdit, cardController.moveCard);
router.delete('/boards/:boardId/lists/:listId/cards/:cardId', canEdit, cardController.deleteCard);

module.exports = router;
