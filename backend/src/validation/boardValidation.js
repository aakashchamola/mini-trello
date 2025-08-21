const Joi = require('joi');

const createBoardSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Board title is required',
      'string.min': 'Board title must be at least 1 character long',
      'string.max': 'Board title cannot exceed 100 characters',
      'any.required': 'Board title is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #0079bf)'
    }),
  isPrivate: Joi.boolean()
    .default(false)
});

const updateBoardSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Board title cannot be empty',
      'string.min': 'Board title must be at least 1 character long',
      'string.max': 'Board title cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #0079bf)'
    }),
  isPrivate: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  createBoardSchema,
  updateBoardSchema
};
