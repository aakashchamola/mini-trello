const Joi = require('joi');

const createListSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'List title is required',
      'string.min': 'List title must be at least 1 character long',
      'string.max': 'List title cannot exceed 100 characters',
      'any.required': 'List title is required'
    }),
  position: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position must be a non-negative number'
    })
});

const updateListSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'List title cannot be empty',
      'string.min': 'List title must be at least 1 character long',
      'string.max': 'List title cannot exceed 100 characters'
    }),
  position: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position must be a non-negative number'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const reorderListsSchema = Joi.object({
  listPositions: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required(),
        position: Joi.number().integer().min(0).required()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one list position must be provided',
      'any.required': 'List positions are required'
    })
});

module.exports = {
  createListSchema,
  updateListSchema,
  reorderListsSchema
};
