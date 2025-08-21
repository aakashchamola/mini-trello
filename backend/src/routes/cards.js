const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit } = require('../middleware/boardPermissions');
const ActivityLogger = require('../middleware/activityLogger');

// All card routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards:
 *   post:
 *     summary: Create a new card
 *     description: Create a new card within a list
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardCreate'
 *     responses:
 *       201:
 *         description: Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Card created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     card:
 *                       $ref: '#/components/schemas/Card'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/boards/:boardId/lists/:listId/cards', canEdit, ActivityLogger.logCardActivity, cardController.createCard);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards:
 *   get:
 *     summary: Get list cards
 *     description: Retrieve all cards in a specific list
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [comments, commentCount, assignedUser]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Card'
 *                           - type: object
 *                             properties:
 *                               comments:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/Comment'
 *                               commentCount:
 *                                 type: integer
 *                                 description: Number of comments on the card
 *                                 example: 3
 *                               assignedUser:
 *                                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/lists/:listId/cards', canRead, cardController.getListCards);

/**
 * @swagger
 * /api/boards/{boardId}/cards:
 *   get:
 *     summary: Get all board cards
 *     description: Retrieve all cards across all lists in a board
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [comments, list, assignedUser]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *       - in: query
 *         name: assignedUserId
 *         schema:
 *           type: integer
 *         description: Filter cards by assigned user ID
 *       - in: query
 *         name: labels
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter cards by labels
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter cards with due date from this date
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter cards with due date until this date
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Card'
 *                           - type: object
 *                             properties:
 *                               list:
 *                                 $ref: '#/components/schemas/List'
 *                               assignedUser:
 *                                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/cards', canRead, cardController.getBoardCards);

/**
 * @swagger
 * /api/boards/{boardId}/cards/search:
 *   get:
 *     summary: Search board cards
 *     description: Search for cards within a board by title and description
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Search query
 *         example: authentication
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cards:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Card'
 *                           - type: object
 *                             properties:
 *                               list:
 *                                 $ref: '#/components/schemas/List'
 *                     query:
 *                       type: string
 *                       example: authentication
 *                     totalResults:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/cards/search', canRead, cardController.searchBoardCards);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}:
 *   get:
 *     summary: Get card by ID
 *     description: Retrieve a specific card with optional related data
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [comments, list, assignedUser, activities]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *     responses:
 *       200:
 *         description: Card retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     card:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Card'
 *                         - type: object
 *                           properties:
 *                             comments:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Comment'
 *                             list:
 *                               $ref: '#/components/schemas/List'
 *                             assignedUser:
 *                               $ref: '#/components/schemas/User'
 *                             activities:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/lists/:listId/cards/:cardId', canRead, cardController.getCardById);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}:
 *   put:
 *     summary: Update card
 *     description: Update card properties like title, description, labels, etc.
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Card title
 *                 example: Updated card title
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Card description
 *                 example: Updated card description with more details
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Card due date
 *                 example: '2024-01-20T15:00:00Z'
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Card labels
 *                 example: ['urgent', 'frontend', 'bug']
 *               assignedUserId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of assigned user (null to unassign)
 *                 example: 2
 *               position:
 *                 type: number
 *                 description: Card position in list
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Card updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     card:
 *                       $ref: '#/components/schemas/Card'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/boards/:boardId/lists/:listId/cards/:cardId', canEdit, ActivityLogger.logCardActivity, cardController.updateCard);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}/move:
 *   put:
 *     summary: Move card
 *     description: Move a card to a different list and/or position
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardMove'
 *     responses:
 *       200:
 *         description: Card moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Card moved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     card:
 *                       $ref: '#/components/schemas/Card'
 *                     fromList:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         title:
 *                           type: string
 *                           example: To Do
 *                     toList:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         title:
 *                           type: string
 *                           example: In Progress
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/boards/:boardId/lists/:listId/cards/:cardId/move', canEdit, ActivityLogger.logCardActivity, cardController.moveCard);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}:
 *   delete:
 *     summary: Delete card
 *     description: Permanently delete a card and all its comments
 *     tags: [Cards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Card deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/boards/:boardId/lists/:listId/cards/:cardId', canEdit, ActivityLogger.logCardActivity, cardController.deleteCard);

module.exports = router;
