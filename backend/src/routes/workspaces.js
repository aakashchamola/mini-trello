const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticateToken } = require('../middleware/auth');

// All workspace routes require authentication
router.use(authenticateToken);

// Workspace CRUD operations
router.post('/workspaces', workspaceController.createWorkspace);
router.get('/workspaces', workspaceController.getUserWorkspaces);
router.get('/workspaces/:workspaceId', workspaceController.getWorkspaceById);
router.put('/workspaces/:workspaceId', workspaceController.updateWorkspace);
router.delete('/workspaces/:workspaceId', workspaceController.deleteWorkspace);

// Workspace member management
router.post('/workspaces/:workspaceId/invite', workspaceController.inviteToWorkspace);
router.get('/workspaces/:workspaceId/members', workspaceController.getWorkspaceMembers);

module.exports = router;
