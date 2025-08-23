// Board collaboration controller for Mini Trello
// Handles board sharing, member management, and permissions

const Board = require('../models/Board');
const User = require('../models/User');
const BoardMember = require('../models/BoardMember');
const { inviteMemberSchema, updateMemberRoleSchema } = require('../validation/boardCollaborationValidation');
const { Op } = require('sequelize');

const boardCollaborationController = {
  // Invite a user to join a board
  async inviteUser(req, res) {
    try {
      const { boardId } = req.params;
      console.log('Inviting user to board:', boardId, 'Body:', req.body);
      
      const { error, value } = inviteMemberSchema.validate(req.body);
      
      if (error) {
        console.log('Validation error:', error.details);
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Check if board exists and user has permission to invite
      const board = await Board.findOne({
        where: { id: boardId },
        include: [{
          model: BoardMember,
          as: 'members',
          where: { 
            userId: req.user.id,
            status: 'accepted'
          },
          required: false
        }]
      });

      console.log('Found board:', board ? board.id : 'null', 'Members:', board?.members?.length || 0);

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist'
        });
      }

      // Check if user is board owner or has permission to invite
      const isOwner = board.userId === req.user.id;
      const memberPermission = board.members.find(m => m.userId === req.user.id);
      const canInvite = isOwner || (memberPermission && memberPermission.canInvite());

      console.log('Permission check - isOwner:', isOwner, 'memberPermission:', !!memberPermission, 'canInvite:', canInvite);

      if (!canInvite) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You do not have permission to invite users to this board'
        });
      }

      // Find user to invite
      const whereConditions = [];
      if (value.email) {
        whereConditions.push({ email: value.email });
      }
      if (value.username) {
        whereConditions.push({ username: value.username });
      }

      const userToInvite = await User.findOne({
        where: {
          [Op.or]: whereConditions
        }
      });

      if (!userToInvite) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No user found with this email or username'
        });
      }

      // Check if user is already a member or has pending invitation
      const existingMember = await BoardMember.findOne({
        where: {
          boardId,
          userId: userToInvite.id
        }
      });

      if (existingMember) {
        const status = existingMember.status;
        return res.status(400).json({
          error: 'User already involved',
          message: status === 'pending' 
            ? 'User already has a pending invitation'
            : 'User is already a member of this board'
        });
      }

      // Create invitation or direct member addition
      const status = value.directAdd ? 'accepted' : 'pending';
      const invitation = await BoardMember.create({
        boardId,
        userId: userToInvite.id,
        role: value.role || 'viewer',
        invitedBy: req.user.id,
        status: status
      });

      const message = value.directAdd ? 'User added to board successfully' : 'User invited successfully';

      res.status(201).json({
        message: message,
        invitation: {
          id: invitation.id,
          boardId: invitation.boardId,
          user: {
            id: userToInvite.id,
            username: userToInvite.username,
            email: userToInvite.email
          },
          role: invitation.role,
          status: invitation.status,
          invitedAt: invitation.invitedAt
        }
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to invite user'
      });
    }
  },

  // Accept or decline board invitation
  async respondToInvitation(req, res) {
    try {
      const { boardId, invitationId } = req.params;
      const { action } = req.body; // 'accept' or 'decline'

      if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({
          error: 'Invalid action',
          message: 'Action must be either "accept" or "decline"'
        });
      }

      // Find invitation
      const invitation = await BoardMember.findOne({
        where: {
          id: invitationId,
          boardId,
          userId: req.user.id,
          status: 'pending'
        },
        include: [{
          model: Board,
          as: 'board',
          attributes: ['id', 'title']
        }]
      });

      if (!invitation) {
        return res.status(404).json({
          error: 'Invitation not found',
          message: 'No pending invitation found'
        });
      }

      // Update invitation status
      const status = action === 'accept' ? 'accepted' : 'declined';
      const updateData = { status };
      
      if (action === 'accept') {
        updateData.joinedAt = new Date();
      }

      await invitation.update(updateData);

      res.json({
        message: `Invitation ${action}ed successfully`,
        invitation: {
          id: invitation.id,
          boardId: invitation.boardId,
          boardTitle: invitation.board.title,
          role: invitation.role,
          status: invitation.status,
          joinedAt: invitation.joinedAt
        }
      });
    } catch (error) {
      console.error('Respond to invitation error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to respond to invitation'
      });
    }
  },

  // Get board members
  async getBoardMembers(req, res) {
    try {
      const { boardId } = req.params;

      // Check if board exists and user has access
      const board = await Board.findOne({
        where: { id: boardId },
        include: [{
          model: BoardMember,
          as: 'members',
          where: { 
            userId: req.user.id,
            status: 'accepted'
          },
          required: false
        }]
      });

      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist'
        });
      }

      // Check if user has access to this board
      const isOwner = board.userId === req.user.id;
      const isMember = board.members.some(m => m.userId === req.user.id);

      if (!isOwner && !isMember) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this board'
        });
      }

      // Get all board members
      const members = await BoardMember.findAll({
        where: { 
          boardId,
          status: 'accepted'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar_url']
        }, {
          model: User,
          as: 'inviter',
          attributes: ['id', 'username']
        }],
        order: [['joinedAt', 'ASC']]
      });

      // Check if owner has a BoardMember entry
      const ownerMemberEntry = members.find(member => member.userId === board.userId);
      
      let allMembers = [];
      
      if (ownerMemberEntry) {
        // Owner has a BoardMember entry, use that
        allMembers = members.map(member => ({
          id: member.id,
          userId: member.userId,
          user: member.user,
          role: member.role,
          joinedAt: member.joinedAt,
          invitedBy: member.inviter,
          isOwner: member.userId === board.userId
        }));
      } else {
        // Owner doesn't have a BoardMember entry, add them as owner
        const owner = await User.findByPk(board.userId, {
          attributes: ['id', 'username', 'email', 'avatar_url']
        });

        allMembers = [
          {
            id: 'owner',
            userId: board.userId,
            user: owner,
            role: 'admin', // Changed from 'owner' to 'admin'
            joinedAt: board.createdAt,
            isOwner: true
          },
          ...members.map(member => ({
            id: member.id,
            userId: member.userId,
            user: member.user,
            role: member.role,
            joinedAt: member.joinedAt,
            invitedBy: member.inviter,
            isOwner: false
          }))
        ];
      }

      res.json({
        boardId: parseInt(boardId),
        members: allMembers,
        totalMembers: allMembers.length
      });
    } catch (error) {
      console.error('Get board members error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve board members'
      });
    }
  },

  // Update member role
  async updateMemberRole(req, res) {
    try {
      const { boardId, memberId } = req.params;
      const { error, value } = updateMemberRoleSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Check if board exists and user has permission
      const board = await Board.findByPk(boardId);
      
      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist'
        });
      }

      // Only board owner can update member roles
      if (board.userId !== req.user.id) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'Only board owner can update member roles'
        });
      }

      // Find member
      const member = await BoardMember.findOne({
        where: {
          id: memberId,
          boardId,
          status: 'accepted'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }]
      });

      if (!member) {
        return res.status(404).json({
          error: 'Member not found',
          message: 'Member not found in this board'
        });
      }

      await member.update({ role: value.role });

      res.json({
        message: 'Member role updated successfully',
        member: {
          id: member.id,
          user: member.user,
          role: member.role,
          joinedAt: member.joinedAt
        }
      });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update member role'
      });
    }
  },

  // Remove member from board
  async removeMember(req, res) {
    try {
      const { boardId, memberId } = req.params;

      // Check if board exists and user has permission
      const board = await Board.findByPk(boardId);
      
      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist'
        });
      }

      // Find member
      const member = await BoardMember.findOne({
        where: {
          id: memberId,
          boardId
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }]
      });

      if (!member) {
        return res.status(404).json({
          error: 'Member not found',
          message: 'Member not found in this board'
        });
      }

      // Check permissions - board owner or the member themselves can remove
      const isOwner = board.userId === req.user.id;
      const isSelf = member.userId === req.user.id;

      if (!isOwner && !isSelf) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You can only remove yourself or be the board owner'
        });
      }

      await member.destroy();

      res.json({
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to remove member'
      });
    }
  },

  // Get user's pending invitations
  async getUserInvitations(req, res) {
    try {
      const invitations = await BoardMember.findAll({
        where: {
          userId: req.user.id,
          status: 'pending'
        },
        include: [{
          model: Board,
          as: 'board',
          attributes: ['id', 'title', 'description']
        }, {
          model: User,
          as: 'inviter',
          attributes: ['id', 'username']
        }],
        order: [['invitedAt', 'DESC']]
      });

      res.json({
        invitations: invitations.map(inv => ({
          id: inv.id,
          board: inv.board,
          role: inv.role,
          invitedBy: inv.inviter,
          invitedAt: inv.invitedAt
        })),
        totalInvitations: invitations.length
      });
    } catch (error) {
      console.error('Get user invitations error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve invitations'
      });
    }
  }
};

module.exports = boardCollaborationController;
