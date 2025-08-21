// Board collaboration routes for Mini Trello
// Handles board sharing, member management, and invitations

const express = require('express');
const router = express.Router();
const boardCollaborationController = require('../controllers/boardCollaborationController');
const { authenticateToken } = require('../middleware/auth');

// All collaboration routes require authentication
router.use(authenticateToken);

// Add debug logging
router.use((req, res, next) => {
  console.log(`Board Collaboration Route: ${req.method} ${req.path}`);
  next();
});

// Board member management routes
router.post('/boards/:boardId/invite', boardCollaborationController.inviteUser);
router.get('/boards/:boardId/members', boardCollaborationController.getBoardMembers);
router.put('/boards/:boardId/members/:memberId/role', boardCollaborationController.updateMemberRole);
router.delete('/boards/:boardId/members/:memberId', boardCollaborationController.removeMember);

// Invitation management routes
router.put('/boards/:boardId/invitations/:invitationId/respond', boardCollaborationController.respondToInvitation);
router.get('/invitations', boardCollaborationController.getUserInvitations);

module.exports = router;
