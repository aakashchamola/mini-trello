// Authentication controller
// Handles user registration, login, logout, and token refresh

const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
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
    
    const { username, avatar_url } = value;
    
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
    await User.update(
      { username, avatar_url },
      { where: { id: req.userId } }
    );
    
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

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
