const Joi = require('joi');

// Schema for creating a new workspace
const createWorkspaceSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Workspace name cannot be empty',
      'string.min': 'Workspace name must be at least 1 character long',
      'string.max': 'Workspace name cannot exceed 100 characters',
      'any.required': 'Workspace name is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Schema for updating a workspace
const updateWorkspaceSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Workspace name cannot be empty',
      'string.min': 'Workspace name must be at least 1 character long',
      'string.max': 'Workspace name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Schema for inviting a user to workspace
const inviteToWorkspaceSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  role: Joi.string()
    .valid('admin', 'member')
    .default('member')
    .messages({
      'any.only': 'Role must be either admin or member'
    })
});

// Schema for updating workspace member role
const updateMemberRoleSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'member')
    .required()
    .messages({
      'any.only': 'Role must be either admin or member',
      'any.required': 'Role is required'
    })
});

// Schema for responding to workspace invitation
const respondToInvitationSchema = Joi.object({
  action: Joi.string()
    .valid('accept', 'decline')
    .required()
    .messages({
      'any.only': 'Action must be either accept or decline',
      'any.required': 'Action is required'
    })
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteToWorkspaceSchema,
  updateMemberRoleSchema,
  respondToInvitationSchema
};
