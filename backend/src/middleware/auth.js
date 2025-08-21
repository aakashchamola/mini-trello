// Authentication middleware
// Protects routes that require user authentication

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

// Middleware to authenticate user with JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
    }
    
    // Verify the token
    const decoded = verifyAccessToken(token);
    
    // Find the user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }
    
    // Attach user to request object
    req.user = user.toSafeJSON();
    req.userId = user.id;
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: error.message
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.userId);
      
      if (user) {
        req.user = user.toSafeJSON();
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Middleware to check if user owns resource
const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findByPk(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource not found',
          message: 'The requested resource does not exist'
        });
      }
      
      // Check if user owns the resource
      if (resource.user_id !== req.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this resource'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Server error',
        message: 'Failed to verify resource ownership'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireOwnership
};
