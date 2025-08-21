const Joi = require('joi');

// Schema for creating a new comment
const createCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment content cannot be empty',
      'string.min': 'Comment must be at least 1 character long',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment content is required'
    })
});

// Schema for updating a comment
const updateCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment content cannot be empty',
      'string.min': 'Comment must be at least 1 character long',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment content is required'
    })
});

module.exports = {
  createCommentSchema,
  updateCommentSchema
};
