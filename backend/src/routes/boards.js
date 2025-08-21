const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit, canAdmin } = require('../middleware/boardPermissions');
const ActivityLogger = require('../middleware/activityLogger');

// All board routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create a new board
 *     description: Create a new Kanban board
 *     tags: [Boards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardCreate'
 *     responses:
 *       201:
 *         description: Board created successfully
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
 *                   example: Board created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     board:
 *                       $ref: '#/components/schemas/Board'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', ActivityLogger.logBoardActivity, boardController.createBoard);

/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Get user's boards
 *     description: Retrieve all boards accessible to the current user
 *     tags: [Boards]
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: integer
 *         description: Filter boards by workspace ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of boards per page
 *     responses:
 *       200:
 *         description: Boards retrieved successfully
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
 *                     boards:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Board'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', boardController.getUserBoards);

/**
 * @swagger
 * /api/boards/{boardId}:
 *   get:
 *     summary: Get board by ID
 *     description: Retrieve a specific board with its lists and cards
 *     tags: [Boards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [lists, cards, members, activities]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *     responses:
 *       200:
 *         description: Board retrieved successfully
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
 *                     board:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Board'
 *                         - type: object
 *                           properties:
 *                             lists:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/List'
 *                             members:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/BoardMember'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:boardId', canRead, boardController.getBoardById);

/**
 * @swagger
 * /api/boards/{boardId}/activities:
 *   get:
 *     summary: Get board activities
 *     description: Retrieve activity history for a specific board
 *     tags: [Boards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of activities per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter activities by type
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
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
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:boardId/activities', canRead, ActivityLogger.getBoardActivities);

/**
 * @swagger
 * /api/boards/{boardId}:
 *   put:
 *     summary: Update board
 *     description: Update board properties like title, description, and visibility
 *     tags: [Boards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
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
 *                 description: Board title
 *                 example: Updated Board Title
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Board description
 *                 example: Updated board description
 *               background_color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: Board background color (hex)
 *                 example: '#ff0000'
 *               visibility:
 *                 type: string
 *                 enum: [private, workspace, public]
 *                 description: Board visibility level
 *                 example: workspace
 *     responses:
 *       200:
 *         description: Board updated successfully
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
 *                   example: Board updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     board:
 *                       $ref: '#/components/schemas/Board'
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
router.put('/:boardId', canEdit, ActivityLogger.logBoardActivity, boardController.updateBoard);

/**
 * @swagger
 * /api/boards/{boardId}:
 *   delete:
 *     summary: Delete board
 *     description: Permanently delete a board and all its contents
 *     tags: [Boards]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *     responses:
 *       200:
 *         description: Board deleted successfully
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
 *                   example: Board deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:boardId', canAdmin, ActivityLogger.logBoardActivity, boardController.deleteBoard);

module.exports = router;
