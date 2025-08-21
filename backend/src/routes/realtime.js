const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const BoardMember = require('../models/BoardMember');
const router = express.Router();

/**
 * @swagger
 * /api/boards/{boardId}/presence:
 *   get:
 *     summary: Get board presence
 *     description: Retrieve information about users currently connected to a board
 *     tags: [Real-time]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *     responses:
 *       200:
 *         description: Board presence retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BoardPresence'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/presence', authenticateToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    console.log('Board presence check - boardId:', boardId, 'userId:', userId);

    // Check if user has access to the board (either as owner or member)
    const Board = require('../models/Board');
    const board = await Board.findByPk(boardId);
    
    console.log('Found board:', board ? {id: board.id, userId: board.userId} : null);
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user is the board owner (using userId field, not ownerId)
    const isOwner = board.userId === userId;
    console.log('Is owner check:', isOwner, 'board.userId:', board.userId, 'userId:', userId);
    
    // Check if user is a board member  
    let isMember = false;
    if (!isOwner) {
      const boardMember = await BoardMember.findOne({
        where: { boardId, userId, status: 'accepted' }
      });
      isMember = !!boardMember;
      console.log('Is member check:', isMember, 'boardMember:', boardMember ? boardMember.id : null);
    }

    // User must be either owner or accepted member
    if (!isOwner && !isMember) {
      console.log('Access denied - not owner and not member');
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this board'
      });
    }

    console.log('Access granted - isOwner:', isOwner, 'isMember:', isMember);

    // Get socket handler from app
    const socketHandler = req.app.get('socketHandler');
    const connectedUsers = socketHandler ? socketHandler.getBoardUsers(boardId) : [];

    res.json({
      success: true,
      data: {
        boardId: parseInt(boardId),
        connectedUsers,
        totalConnected: connectedUsers.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting board presence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get board presence'
    });
  }
});

/**
 * @swagger
 * /api/realtime/status:
 *   get:
 *     summary: Get real-time system status
 *     description: Retrieve the current status of the real-time collaboration system
 *     tags: [Real-time]
 *     responses:
 *       200:
 *         description: Real-time status retrieved successfully
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
 *                     status:
 *                       type: string
 *                       enum: [active, disabled]
 *                       description: Current status of real-time features
 *                       example: active
 *                     message:
 *                       type: string
 *                       description: Status description
 *                       example: Real-time features are enabled
 *                     connectedUsers:
 *                       type: integer
 *                       description: Total number of connected users
 *                       example: 15
 *                     activeBoards:
 *                       type: integer
 *                       description: Number of boards with active users
 *                       example: 5
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Status check timestamp
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/realtime/status', authenticateToken, (req, res) => {
  try {
    const socketHandler = req.app.get('socketHandler');
    
    if (!socketHandler) {
      return res.json({
        success: true,
        data: {
          status: 'disabled',
          message: 'Real-time features are not enabled',
          connectedUsers: 0,
          activeBoards: 0
        }
      });
    }

    const totalConnectedUsers = socketHandler.connectedUsers.size;
    const activeBoards = socketHandler.boardRooms.size;

    res.json({
      success: true,
      data: {
        status: 'active',
        message: 'Real-time features are enabled',
        connectedUsers: totalConnectedUsers,
        activeBoards: activeBoards,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting real-time status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time status'
    });
  }
});

module.exports = router;
