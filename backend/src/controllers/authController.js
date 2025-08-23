// Authentication controller
// Handles user registration, login, logout, and token refresh

const User = require('../models/User');
const Joi = require('joi');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const googleAuthService = require('../services/googleAuthService');
const { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema, 
  updateProfileSchema 
} = require('../validation/authValidation');

// Register a new user
const register = async (req, res) => {
  try {
    // Validate input data
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    const { email, username, password } = value;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        error: 'User already exists',
        message: `A user with this ${field} already exists`
      });
    }
    
    // Create new user
    const user = await User.create({
      email,
      username,
      password
    });
    
    // Generate tokens
    const tokens = generateTokenPair(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toSafeJSON(),
      tokens
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to register user'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Validate input data
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const { email, password } = value;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate tokens
    const tokens = generateTokenPair(user.id);
    
    res.json({
      message: 'Login successful',
      user: user.toSafeJSON(),
      tokens
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to login'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }
    
    // Generate new tokens
    const tokens = generateTokenPair(user.id);
    
    res.json({
      message: 'Token refreshed successfully',
      tokens
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      message: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }
    
    res.json({
      user: user.toSafeJSON()
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Validate input data
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const { username, avatar_url, currentPassword } = value;
    
    // Get user with password if username is being updated
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    // If username is being updated, handle password verification based on provider
    if (username) {
      if (user.provider === 'local') {
        // Local users must provide current password to change username
        if (!currentPassword) {
          return res.status(400).json({
            error: 'Password required',
            message: 'Current password is required to change username'
          });
        }
        
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            error: 'Invalid password',
            message: 'Current password is incorrect'
          });
        }
      } else if (user.provider === 'google') {
        // Google OAuth users can change username without password verification
        // But if they want to set a password for their account, they can provide one
        if (currentPassword) {
          // This means they want to add a password to their Google account
          // We'll allow this but won't verify against any existing password
          console.log('Google user is setting a password for their account');
        }
      }
    }
    
    // Check if username is already taken (if provided)
    if (username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [require('sequelize').Op.ne]: req.userId }
        }
      });
      
      if (existingUser) {
        return res.status(409).json({
          error: 'Username taken',
          message: 'This username is already taken'
        });
      }
    }
    
    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    
    await User.update(updateData, { where: { id: req.userId } });
    
    // Get updated user
    const updatedUser = await User.findByPk(req.userId);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toSafeJSON()
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    // Validate input data
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const { currentPassword, newPassword } = value;
    
    // Get user with password
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to change password'
    });
  }
};

// Logout (client-side token removal)
const logout = (req, res) => {
  res.json({
    message: 'Logout successful'
  });
};

// Google Login
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        error: 'Missing credential',
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const googleProfile = await googleAuthService.verifyGoogleToken(credential);
    
    // Find existing user by email or Google ID
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: googleProfile.email },
          { google_id: googleProfile.googleId }
        ]
      }
    });

    if (!user) {
      // User doesn't exist, create a new one automatically
      const userData = googleAuthService.extractUserDataForRegistration(googleProfile);
      
      // Ensure username is unique
      let uniqueUsername = userData.username;
      let counter = 1;
      while (await User.findOne({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${userData.username}${counter}`;
        counter++;
      }
      userData.username = uniqueUsername;

      // Create new user
      user = await User.create(userData);
    } else {
      // Update existing user with latest Google profile info
      const updateData = {};
      
      // Only update if the field is not already set or if it's from Google
      if (!user.google_id) {
        updateData.google_id = googleProfile.googleId;
      }
      
      // Always update avatar from Google (fresher data)
      if (googleProfile.picture) {
        updateData.avatar_url = googleProfile.picture;
      }
      
      // Update names if not set
      if (!user.first_name && googleProfile.firstName) {
        updateData.first_name = googleProfile.firstName;
      }
      if (!user.last_name && googleProfile.lastName) {
        updateData.last_name = googleProfile.lastName;
      }
      
      // Update email verification status
      if (googleProfile.emailVerified) {
        updateData.email_verified = true;
      }
      
      // Apply updates if any
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
        // Reload user to get updated data
        await user.reload();
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id);

    res.json({
      message: 'Authentication successful',
      user: user.toSafeJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({
      error: 'Google authentication failed',
      message: error.message
    });
  }
};

// Google Register
const googleRegister = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        error: 'Missing credential',
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const googleProfile = await googleAuthService.verifyGoogleToken(credential);
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: googleProfile.email },
          { google_id: googleProfile.googleId }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // Create user data from Google profile
    const userData = googleAuthService.extractUserDataForRegistration(googleProfile);
    
    // Ensure username is unique
    let uniqueUsername = userData.username;
    let counter = 1;
    while (await User.findOne({ where: { username: uniqueUsername } })) {
      uniqueUsername = `${userData.username}${counter}`;
      counter++;
    }
    userData.username = uniqueUsername;

    // Create new user
    const newUser = await User.create(userData);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(newUser.id);

    res.status(201).json({
      message: 'Registration successful',
      user: newUser.toSafeJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Google registration error:', error);
    res.status(400).json({
      error: 'Google registration failed',
      message: error.message
    });
  }
};

// Set password for Google OAuth users
const setPassword = async (req, res) => {
  try {
    // For Google users setting password, we use a modified validation
    const setPasswordSchema = Joi.object({
      newPassword: Joi.string()
        .min(6)
        .required()
        .messages({
          'string.min': 'Password must be at least 6 characters long',
          'any.required': 'New password is required'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'Passwords do not match',
          'any.required': 'Password confirmation is required'
        })
    });
    
    // Validate input data
    const { error, value } = setPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    const { newPassword } = value;
    
    // Get user
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    // Only allow Google OAuth users to set password
    if (user.provider !== 'google') {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Only Google OAuth users can set a new password'
      });
    }
    
    // Check if user already has a password (shouldn't happen, but just in case)
    if (user.password) {
      return res.status(400).json({
        error: 'Password already exists',
        message: 'You already have a password set. Use change password instead.'
      });
    }
    
    // Set the new password
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Password set successfully. You can now log in with email and password.'
    });
    
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to set password'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  setPassword,
  logout,
  googleLogin,
  googleRegister
};
