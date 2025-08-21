const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticateToken } = require('../middleware/auth');

// All workspace routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     description: Create a new workspace for organizing boards
 *     tags: [Workspaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkspaceCreate'
 *     responses:
 *       201:
 *         description: Workspace created successfully
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
 *                   example: Workspace created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace:
 *                       $ref: '#/components/schemas/Workspace'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/workspaces', workspaceController.createWorkspace);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get user workspaces
 *     description: Retrieve all workspaces accessible to the current user
 *     tags: [Workspaces]
 *     parameters:
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [boards, memberCount]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
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
 *         description: Number of workspaces per page
 *     responses:
 *       200:
 *         description: Workspaces retrieved successfully
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
 *                     workspaces:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Workspace'
 *                           - type: object
 *                             properties:
 *                               boards:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/Board'
 *                               memberCount:
 *                                 type: integer
 *                                 description: Number of workspace members
 *                                 example: 5
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
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/workspaces', workspaceController.getUserWorkspaces);

/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   get:
 *     summary: Get workspace by ID
 *     description: Retrieve a specific workspace with its boards and members
 *     tags: [Workspaces]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [boards, members]
 *         style: form
 *         explode: false
 *         description: Additional data to include in response
 *     responses:
 *       200:
 *         description: Workspace retrieved successfully
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
 *                     workspace:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Workspace'
 *                         - type: object
 *                           properties:
 *                             boards:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Board'
 *                             members:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 1
 *                                   userId:
 *                                     type: integer
 *                                     example: 1
 *                                   role:
 *                                     type: string
 *                                     enum: [admin, member]
 *                                     example: member
 *                                   user:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: integer
 *                                         example: 1
 *                                       username:
 *                                         type: string
 *                                         example: johndoe
 *                                       email:
 *                                         type: string
 *                                         example: john@example.com
 *                                       avatar_url:
 *                                         type: string
 *                                         example: https://example.com/avatar.jpg
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/workspaces/:workspaceId', workspaceController.getWorkspaceById);

/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   put:
 *     summary: Update workspace
 *     description: Update workspace properties (only by workspace admin)
 *     tags: [Workspaces]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Workspace name
 *                 example: Updated Workspace Name
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Workspace description
 *                 example: Updated workspace description
 *     responses:
 *       200:
 *         description: Workspace updated successfully
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
 *                   example: Workspace updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace:
 *                       $ref: '#/components/schemas/Workspace'
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
router.put('/workspaces/:workspaceId', workspaceController.updateWorkspace);

/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   delete:
 *     summary: Delete workspace
 *     description: Permanently delete a workspace and all its boards (only by workspace owner)
 *     tags: [Workspaces]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
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
 *                   example: Workspace deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/workspaces/:workspaceId', workspaceController.deleteWorkspace);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/invite:
 *   post:
 *     summary: Invite user to workspace
 *     description: Invite a user to join the workspace
 *     tags: [Workspaces]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of user to invite
 *                 example: colleague@example.com
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 description: Role to assign to invited user
 *                 example: member
 *     responses:
 *       201:
 *         description: Invitation sent successfully
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
 *                   example: Invitation sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     invitation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: colleague@example.com
 *                         role:
 *                           type: string
 *                           example: member
 *                         status:
 *                           type: string
 *                           example: pending
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: User already invited or is a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/workspaces/:workspaceId/invite', workspaceController.inviteToWorkspace);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   get:
 *     summary: Get workspace members
 *     description: Retrieve all members of a workspace
 *     tags: [Workspaces]
 *     parameters:
 *       - $ref: '#/components/parameters/WorkspaceId'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, pending]
 *           default: active
 *         description: Filter members by status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, member]
 *         description: Filter members by role
 *     responses:
 *       200:
 *         description: Members retrieved successfully
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
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: integer
 *                             example: 1
 *                           role:
 *                             type: string
 *                             enum: [admin, member]
 *                             example: member
 *                           status:
 *                             type: string
 *                             enum: [active, pending]
 *                             example: active
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               username:
 *                                 type: string
 *                                 example: johndoe
 *                               email:
 *                                 type: string
 *                                 example: john@example.com
 *                               avatar_url:
 *                                 type: string
 *                                 example: https://example.com/avatar.jpg
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/workspaces/:workspaceId/members', workspaceController.getWorkspaceMembers);

module.exports = router;
