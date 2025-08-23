const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit } = require('../middleware/boardPermissions');
const ActivityLogger = require('../middleware/activityLogger');

// All list routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/boards/{boardId}/lists:
 *   post:
 *     summary: Create a new list
 *     description: Create a new list within a board
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListCreate'
 *     responses:
 *       201:
 *         description: List created successfully
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
 *                   example: List created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
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
router.post('/boards/:boardId/lists', canEdit, ActivityLogger.logListActivity, listController.createList);

/**
 * @swagger
 * /api/boards/{boardId}/lists:
 *   get:
 *     summary: Get board lists
 *     description: Retrieve all lists for a specific board
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [cards, cardCount]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
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
 *                     lists:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/List'
 *                           - type: object
 *                             properties:
 *                               cards:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/Card'
 *                               cardCount:
 *                                 type: integer
 *                                 description: Number of cards in the list
 *                                 example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/lists', canRead, listController.getBoardLists);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}:
 *   get:
 *     summary: Get list by ID
 *     description: Retrieve a specific list with optional cards
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [cards]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *     responses:
 *       200:
 *         description: List retrieved successfully
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
 *                     list:
 *                       allOf:
 *                         - $ref: '#/components/schemas/List'
 *                         - type: object
 *                           properties:
 *                             cards:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Card'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/lists/:listId', canRead, listController.getListById);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}:
 *   put:
 *     summary: Update list
 *     description: Update list properties like title and position
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: List title
 *                 example: Updated List Title
 *               position:
 *                 type: number
 *                 description: List position on board
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: List updated successfully
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
 *                   example: List updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
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
/**
 * @swagger
 * /api/boards/{boardId}/lists/reorder:
 *   put:
 *     summary: Reorder lists
 *     description: Update the order of lists on a board
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listOrder]
 *             properties:
 *               listOrder:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id, position]
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: List ID
 *                       example: 1
 *                     position:
 *                       type: number
 *                       description: New position
 *                       example: 1.0
 *                 description: Array of list IDs with their new positions
 *                 example: [{"id": 1, "position": 1.0}, {"id": 2, "position": 2.0}]
 *     responses:
 *       200:
 *         description: Lists reordered successfully
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
 *                   example: Lists reordered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     lists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/List'
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
router.put('/boards/:boardId/lists/reorder', canEdit, ActivityLogger.logListActivity, listController.reorderLists);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}:
 *   put:
 *     summary: Update list
 *     description: Update an existing list on a board
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ListUpdate'
 *     responses:
 *       200:
 *         description: List updated successfully
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
 *                   example: List updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
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
router.put('/boards/:boardId/lists/:listId', canEdit, ActivityLogger.logListActivity, listController.updateList);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}:
 *   delete:
 *     summary: Delete list
 *     description: Permanently delete a list and all its cards
 *     tags: [Lists]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *     responses:
 *       200:
 *         description: List deleted successfully
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
 *                   example: List deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/boards/:boardId/lists/:listId', canEdit, ActivityLogger.logListActivity, listController.deleteList);

module.exports = router;
