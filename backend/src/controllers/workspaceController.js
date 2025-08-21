const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const User = require('../models/User');
const Board = require('../models/Board');
const { 
  createWorkspaceSchema, 
  updateWorkspaceSchema, 
  inviteToWorkspaceSchema,
  updateMemberRoleSchema,
  respondToInvitationSchema 
} = require('../validation/workspaceValidation');
const { Op } = require('sequelize');

const workspaceController = {
  // Create a new workspace
  async createWorkspace(req, res) {
    try {
      const { error, value } = createWorkspaceSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const workspace = await Workspace.create({
        name: value.name,
        description: value.description,
        ownerId: req.user.id
      });

      // Fetch workspace with owner information
      const workspaceWithOwner = await Workspace.findByPk(workspace.id, {
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }]
      });

      res.status(201).json({
        workspace: workspaceWithOwner,
        message: 'Workspace created successfully'
      });
    } catch (error) {
      console.error('Create workspace error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create workspace'
      });
    }
  },

  // Get user's workspaces (owned + member)
  async getUserWorkspaces(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause for search
      const whereClause = {};
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }

      // Get owned workspaces
      const ownedWorkspaces = await Workspace.findAll({
        where: {
          ownerId: req.user.id,
          ...whereClause
        },
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Get member workspaces
      const memberWorkspaces = await Workspace.findAll({
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email']
          },
          {
            model: WorkspaceMember,
            as: 'members',
            where: {
              userId: req.user.id,
              status: 'accepted'
            },
            attributes: ['role', 'status']
          }
        ],
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Combine and deduplicate
      const allWorkspaces = [...ownedWorkspaces, ...memberWorkspaces];
      const uniqueWorkspaces = allWorkspaces.filter((workspace, index, self) =>
        index === self.findIndex(w => w.id === workspace.id)
      );

      res.json({
        workspaces: uniqueWorkspaces,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          total: uniqueWorkspaces.length
        }
      });
    } catch (error) {
      console.error('Get user workspaces error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve workspaces'
      });
    }
  },

  // Get specific workspace by ID
  async getWorkspaceById(req, res) {
    try {
      const { workspaceId } = req.params;

      const workspace = await Workspace.findByPk(workspaceId, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email']
          },
          {
            model: WorkspaceMember,
            as: 'members',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }],
            where: { status: 'accepted' },
            required: false
          },
          {
            model: Board,
            as: 'boards',
            attributes: ['id', 'title', 'description', 'color', 'visibility', 'createdAt']
          }
        ]
      });

      if (!workspace) {
        return res.status(404).json({
          error: 'Workspace not found',
          message: 'Workspace does not exist'
        });
      }

      // Check if user has access to this workspace
      const isOwner = workspace.ownerId === req.user.id;
      const isMember = workspace.members.some(member => member.userId === req.user.id);

      if (!isOwner && !isMember) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this workspace'
        });
      }

      res.json({
        workspace
      });
    } catch (error) {
      console.error('Get workspace error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve workspace'
      });
    }
  },

  // Update workspace
  async updateWorkspace(req, res) {
    try {
      const { workspaceId } = req.params;
      const { error, value } = updateWorkspaceSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const workspace = await Workspace.findByPk(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          error: 'Workspace not found',
          message: 'Workspace does not exist'
        });
      }

      // Check if user is owner or admin
      const isOwner = workspace.ownerId === req.user.id;
      
      if (!isOwner) {
        const membership = await WorkspaceMember.findOne({
          where: {
            workspaceId,
            userId: req.user.id,
            status: 'accepted',
            role: 'admin'
          }
        });

        if (!membership) {
          return res.status(403).json({
            error: 'Permission denied',
            message: 'Only workspace owners and admins can update workspace details'
          });
        }
      }

      // Update the workspace
      await workspace.update({
        name: value.name || workspace.name,
        description: value.description !== undefined ? value.description : workspace.description
      });

      // Fetch updated workspace with owner
      const updatedWorkspace = await Workspace.findByPk(workspace.id, {
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }]
      });

      res.json({
        workspace: updatedWorkspace,
        message: 'Workspace updated successfully'
      });
    } catch (error) {
      console.error('Update workspace error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update workspace'
      });
    }
  },

  // Delete workspace
  async deleteWorkspace(req, res) {
    try {
      const { workspaceId } = req.params;

      const workspace = await Workspace.findByPk(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          error: 'Workspace not found',
          message: 'Workspace does not exist'
        });
      }

      // Only owner can delete workspace
      if (workspace.ownerId !== req.user.id) {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'Only workspace owner can delete the workspace'
        });
      }

      await workspace.destroy();

      res.json({
        message: 'Workspace deleted successfully'
      });
    } catch (error) {
      console.error('Delete workspace error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete workspace'
      });
    }
  },

  // Invite user to workspace
  async inviteToWorkspace(req, res) {
    try {
      const { workspaceId } = req.params;
      const { error, value } = inviteToWorkspaceSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const workspace = await Workspace.findByPk(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          error: 'Workspace not found',
          message: 'Workspace does not exist'
        });
      }

      // Check if user can invite (owner or admin)
      const isOwner = workspace.ownerId === req.user.id;
      
      if (!isOwner) {
        const membership = await WorkspaceMember.findOne({
          where: {
            workspaceId,
            userId: req.user.id,
            status: 'accepted',
            role: 'admin'
          }
        });

        if (!membership) {
          return res.status(403).json({
            error: 'Permission denied',
            message: 'Only workspace owners and admins can invite users'
          });
        }
      }

      // Find user by email
      const invitedUser = await User.findOne({
        where: { email: value.email }
      });

      if (!invitedUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No user found with that email address'
        });
      }

      // Check if user is already a member
      const existingMembership = await WorkspaceMember.findOne({
        where: {
          workspaceId,
          userId: invitedUser.id
        }
      });

      if (existingMembership) {
        return res.status(409).json({
          error: 'User already invited',
          message: 'User is already a member or has a pending invitation'
        });
      }

      // Create invitation
      const invitation = await WorkspaceMember.create({
        workspaceId: parseInt(workspaceId),
        userId: invitedUser.id,
        role: value.role,
        status: 'pending',
        invitedBy: req.user.id
      });

      // Fetch invitation with user details
      const invitationWithDetails = await WorkspaceMember.findByPk(invitation.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'inviter',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Workspace,
            as: 'workspace',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      res.status(201).json({
        invitation: invitationWithDetails,
        message: 'User invited to workspace successfully'
      });
    } catch (error) {
      console.error('Invite to workspace error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to invite user to workspace'
      });
    }
  },

  // Get workspace members
  async getWorkspaceMembers(req, res) {
    try {
      const { workspaceId } = req.params;

      const workspace = await Workspace.findByPk(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          error: 'Workspace not found',
          message: 'Workspace does not exist'
        });
      }

      // Check if user has access to this workspace
      const isOwner = workspace.ownerId === req.user.id;
      
      if (!isOwner) {
        const membership = await WorkspaceMember.findOne({
          where: {
            workspaceId,
            userId: req.user.id,
            status: 'accepted'
          }
        });

        if (!membership) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have access to this workspace'
          });
        }
      }

      const members = await WorkspaceMember.findAll({
        where: {
          workspaceId,
          status: 'accepted'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }],
        order: [['createdAt', 'ASC']]
      });

      res.json({
        members,
        workspaceId: parseInt(workspaceId),
        totalMembers: members.length
      });
    } catch (error) {
      console.error('Get workspace members error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve workspace members'
      });
    }
  }
};

module.exports = workspaceController;
