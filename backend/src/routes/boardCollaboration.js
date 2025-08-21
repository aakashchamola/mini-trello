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

/**
 * @swagger
 * /api/boards/{boardId}/invite:
 *   post:
 *     summary: Invite user to board
 *     description: Invite a user to collaborate on a board
 *     tags: [Board Collaboration]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardInvitation'
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
 *                         boardId:
 *                           type: integer
 *                           example: 1
 *                         invitedBy:
 *                           type: integer
 *                           example: 1
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Board not found or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already invited or is a member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/boards/:boardId/invite', boardCollaborationController.inviteUser);

/**
 * @swagger
 * /api/boards/{boardId}/members:
 *   get:
 *     summary: Get board members
 *     description: Retrieve all members of a board including their roles
 *     tags: [Board Collaboration]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, accepted, pending, declined]
 *           default: accepted
 *         description: Filter members by status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, member, observer]
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/BoardMember'
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
 *                                   email:
 *                                     type: string
 *                                     example: john@example.com
 *                                   avatar_url:
 *                                     type: string
 *                                     example: https://example.com/avatar.jpg
 *                               inviter:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 1
 *                                   username:
 *                                     type: string
 *                                     example: boardowner
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: boardowner
 *                         email:
 *                           type: string
 *                           example: owner@example.com
 *                         avatar_url:
 *                           type: string
 *                           example: https://example.com/owner-avatar.jpg
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/boards/:boardId/members', boardCollaborationController.getBoardMembers);

/**
 * @swagger
 * /api/boards/{boardId}/members/{memberId}/role:
 *   put:
 *     summary: Update member role
 *     description: Update a board member's role (only by board admin or owner)
 *     tags: [Board Collaboration]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/MemberId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member, observer]
 *                 description: New role for the member
 *                 example: admin
 *     responses:
 *       200:
 *         description: Member role updated successfully
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
 *                   example: Member role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     member:
 *                       allOf:
 *                         - $ref: '#/components/schemas/BoardMember'
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
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Board or member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/boards/:boardId/members/:memberId/role', boardCollaborationController.updateMemberRole);

/**
 * @swagger
 * /api/boards/{boardId}/members/{memberId}:
 *   delete:
 *     summary: Remove board member
 *     description: Remove a member from the board (only by board admin/owner or the member themselves)
 *     tags: [Board Collaboration]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/MemberId'
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *                   example: Member removed from board successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Board or member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/boards/:boardId/members/:memberId', boardCollaborationController.removeMember);

/**
 * @swagger
 * /api/boards/{boardId}/invitations/{invitationId}/respond:
 *   put:
 *     summary: Respond to board invitation
 *     description: Accept or decline a board invitation
 *     tags: [Board Collaboration]
 *     parameters:
 *       - $ref: '#/components/parameters/BoardId'
 *       - $ref: '#/components/parameters/InvitationId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [response]
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [accept, decline]
 *                 description: Response to the invitation
 *                 example: accept
 *     responses:
 *       200:
 *         description: Invitation response processed successfully
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
 *                   example: Invitation accepted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     member:
 *                       $ref: '#/components/schemas/BoardMember'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not authorized to respond to this invitation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Invitation already responded to
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/boards/:boardId/invitations/:invitationId/respond', boardCollaborationController.respondToInvitation);

/**
 * @swagger
 * /api/invitations:
 *   get:
 *     summary: Get user invitations
 *     description: Retrieve all pending invitations for the current user
 *     tags: [Board Collaboration]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, declined, all]
 *           default: pending
 *         description: Filter invitations by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [board, workspace, all]
 *           default: all
 *         description: Filter invitations by type
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
 *         description: Number of invitations per page
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
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
 *                     invitations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           type:
 *                             type: string
 *                             enum: [board, workspace]
 *                             example: board
 *                           role:
 *                             type: string
 *                             example: member
 *                           status:
 *                             type: string
 *                             example: pending
 *                           boardId:
 *                             type: integer
 *                             nullable: true
 *                             example: 1
 *                           workspaceId:
 *                             type: integer
 *                             nullable: true
 *                             example: null
 *                           invitedBy:
 *                             type: integer
 *                             example: 1
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           board:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               title:
 *                                 type: string
 *                                 example: Project Board
 *                           workspace:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: Team Workspace
 *                           inviter:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               username:
 *                                 type: string
 *                                 example: teamlead
 *                               avatar_url:
 *                                 type: string
 *                                 example: https://example.com/avatar.jpg
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
 *                           example: 3
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/invitations', boardCollaborationController.getUserInvitations);

module.exports = router;
