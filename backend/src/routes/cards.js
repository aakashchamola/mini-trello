const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth');

// All card routes require authentication
router.use(authenticateToken);

// Card CRUD operations within lists
router.post('/boards/:boardId/lists/:listId/cards', cardController.createCard);
router.get('/boards/:boardId/lists/:listId/cards', cardController.getListCards);
router.get('/boards/:boardId/cards', cardController.getBoardCards);
router.get('/boards/:boardId/lists/:listId/cards/:cardId', cardController.getCardById);
router.put('/boards/:boardId/lists/:listId/cards/:cardId', cardController.updateCard);
router.put('/boards/:boardId/lists/:listId/cards/:cardId/move', cardController.moveCard);
router.delete('/boards/:boardId/lists/:listId/cards/:cardId', cardController.deleteCard);

module.exports = router;
