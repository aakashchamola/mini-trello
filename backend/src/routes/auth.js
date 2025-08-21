// Authentication routes
// Defines all authentication endpoints

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication middleware to all routes below

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
