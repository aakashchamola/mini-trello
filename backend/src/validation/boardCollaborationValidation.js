// Board collaboration validation schemas for Mini Trello
// Handles validation for board sharing and member management

const Joi = require('joi');

const inviteMemberSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),
  role: Joi.string()
    .valid('admin', 'editor', 'viewer')
    .default('viewer')
    .messages({
      'any.only': 'Role must be one of: admin, editor, viewer'
    })
}).or('email', 'username').messages({
  'object.missing': 'Either email or username must be provided'
});

const updateMemberRoleSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'editor', 'viewer')
    .required()
    .messages({
      'any.only': 'Role must be one of: admin, editor, viewer',
      'any.required': 'Role is required'
    })
});

const respondToInvitationSchema = Joi.object({
  action: Joi.string()
    .valid('accept', 'decline')
    .required()
    .messages({
      'any.only': 'Action must be either "accept" or "decline"',
      'any.required': 'Action is required'
    })
});

module.exports = {
  inviteMemberSchema,
  updateMemberRoleSchema,
  respondToInvitationSchema
};
