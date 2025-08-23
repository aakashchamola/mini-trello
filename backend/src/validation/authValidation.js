// Authentication validation schemas using Joi
// Validates user input for registration and login

const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
    
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Password change validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
    
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    }),
    
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'New password confirmation is required'
    })
});

// Profile update validation schema
const updateProfileSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters'
    }),
    
  currentPassword: Joi.when('username', {
    is: Joi.exist(),
    then: Joi.string().required().messages({
      'any.required': 'Current password is required to change username'
    }),
    otherwise: Joi.optional()
  }),
    
  avatar_url: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Avatar URL must be a valid URL'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema
};
