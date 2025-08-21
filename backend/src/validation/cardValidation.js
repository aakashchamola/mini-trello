const Joi = require('joi');

const createCardSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Card title is required',
      'string.min': 'Card title must be at least 1 character long',
      'string.max': 'Card title cannot exceed 255 characters',
      'any.required': 'Card title is required'
    }),
  description: Joi.string()
    .trim()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  position: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position must be a non-negative number'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  dueDate: Joi.date()
    .iso()
    .min('now')
    .messages({
      'date.base': 'Due date must be a valid date',
      'date.min': 'Due date must be in the future'
    }),
  labels: Joi.array()
    .items(
      Joi.string().max(50).messages({
        'string.max': 'Each label cannot exceed 50 characters'
      })
    )
    .max(10)
    .messages({
      'array.max': 'Maximum 10 labels allowed per card'
    })
});

const updateCardSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .messages({
      'string.empty': 'Card title cannot be empty',
      'string.min': 'Card title must be at least 1 character long',
      'string.max': 'Card title cannot exceed 255 characters'
    }),
  description: Joi.string()
    .trim()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  dueDate: Joi.date()
    .iso()
    .allow(null)
    .messages({
      'date.base': 'Due date must be a valid date'
    }),
  isCompleted: Joi.boolean()
    .messages({
      'boolean.base': 'Completion status must be true or false'
    }),
  labels: Joi.array()
    .items(
      Joi.string().max(50).messages({
        'string.max': 'Each label cannot exceed 50 characters'
      })
    )
    .max(10)
    .messages({
      'array.max': 'Maximum 10 labels allowed per card'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const moveCardSchema = Joi.object({
  targetListId: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Target list ID must be a number',
      'number.integer': 'Target list ID must be an integer',
      'any.required': 'Target list ID is required'
    }),
  position: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Position must be a number',
      'number.integer': 'Position must be an integer',
      'number.min': 'Position must be a non-negative number',
      'any.required': 'Position is required'
    })
});

const reorderCardsSchema = Joi.object({
  cardPositions: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().required(),
        position: Joi.number().integer().min(0).required()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one card position must be provided',
      'any.required': 'Card positions are required'
    })
});

module.exports = {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  reorderCardsSchema
};
