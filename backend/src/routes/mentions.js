const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUnreadMentionCount, markMentionsAsRead, getUserUnreadMentions } = require('../utils/mentionUtils');

/**
 * @swagger
 * /api/mentions/unread:
 *   get:
 *     summary: Get all unread mentions for current user
 *     tags: [Mentions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread mentions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mentions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       cardId:
 *                         type: integer
 *                       boardId:
 *                         type: integer
 *                       card:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                       board:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                       comment:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                       mentionedByUser:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           username:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           avatar_url:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const mentions = await getUserUnreadMentions(req.user.id);
    
    res.json({
      mentions,
      totalCount: mentions.length
    });
  } catch (error) {
    console.error('Get unread mentions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve unread mentions'
    });
  }
});

/**
 * @swagger
 * /api/mentions/card/{cardId}/count:
 *   get:
 *     summary: Get unread mention count for a specific card
 *     tags: [Mentions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unread mention count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cardId:
 *                   type: integer
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/card/:cardId/count', authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.params;
    const count = await getUnreadMentionCount(req.user.id, parseInt(cardId));
    
    res.json({
      cardId: parseInt(cardId),
      unreadCount: count
    });
  } catch (error) {
    console.error('Get mention count error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get mention count'
    });
  }
});

/**
 * @swagger
 * /api/mentions/card/{cardId}/mark-read:
 *   post:
 *     summary: Mark mentions as read for a specific card
 *     tags: [Mentions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mentions marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cardId:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/card/:cardId/mark-read', authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.params;
    const success = await markMentionsAsRead(req.user.id, parseInt(cardId));
    
    if (success) {
      res.json({
        message: 'Mentions marked as read successfully',
        cardId: parseInt(cardId)
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to mark mentions as read'
      });
    }
  } catch (error) {
    console.error('Mark mentions as read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark mentions as read'
    });
  }
});

module.exports = router;
