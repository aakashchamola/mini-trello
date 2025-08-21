const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');
const { canRead, canEdit } = require('../middleware/boardPermissions');
const ActivityLogger = require('../middleware/activityLogger');

// All comment routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}/comments:
 *   post:
 *     summary: Create a new comment
 *     description: Add a comment to a card
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *                   example: Comment created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Comment'
 *                         - type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 username:
 *                                   type: string
 *                                   example: johndoe
 *                                 avatar_url:
 *                                   type: string
 *                                   example: https://example.com/avatar.jpg
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
router.post('/boards/:boardId/lists/:listId/cards/:cardId/comments', canEdit, ActivityLogger.logCommentActivity, commentController.createComment);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}/comments:
 *   get:
 *     summary: Get card comments
 *     description: Retrieve all comments for a specific card
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
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
 *         description: Number of comments per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: Sort order for comments
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
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
 *                     comments:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Comment'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 1
 *                                   username:
 *                                     type: string
 *                                     example: johndoe
 *                                   avatar_url:
 *                                     type: string
 *                                     example: https://example.com/avatar.jpg
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         total:
 *                           type: integer
 *                           example: 12
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/lists/:listId/cards/:cardId/comments', canRead, commentController.getCardComments);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}/comments/{commentId}:
 *   put:
 *     summary: Update comment
 *     description: Update a comment's content (only by comment author)
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *       - $ref: '#/components/parameters/CommentId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Updated comment content
 *                 example: Updated comment with additional information
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                   example: Comment updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Comment'
 *                         - type: object
 *                           properties:
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 username:
 *                                   type: string
 *                                   example: johndoe
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to edit this comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/boards/:boardId/lists/:listId/cards/:cardId/comments/:commentId', canRead, ActivityLogger.logCommentActivity, commentController.updateComment);

/**
 * @swagger
 * /api/boards/{boardId}/lists/{listId}/cards/{cardId}/comments/{commentId}:
 *   delete:
 *     summary: Delete comment
 *     description: Delete a comment (only by comment author or board admin)
 *     tags: [Comments]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/ListId'
 *       - $ref: '#/components/parameters/CardId'
 *       - $ref: '#/components/parameters/CommentId'
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: Comment deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to delete this comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/boards/:boardId/lists/:listId/cards/:cardId/comments/:commentId', canRead, ActivityLogger.logCommentActivity, commentController.deleteComment);

module.exports = router;
