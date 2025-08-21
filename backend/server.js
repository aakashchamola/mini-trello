// Mini Trello Backend Server
// Main server file with Express setup and middleware configuration

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Import routes
const authRoutes = require('./src/routes/auth');
const boardRoutes = require('./src/routes/boards');
const listRoutes = require('./src/routes/lists');
const cardRoutes = require('./src/routes/cards');
const boardCollaborationRoutes = require('./src/routes/boardCollaboration');

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet()); // Set security headers

// CORS configuration - allow frontend to connect
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression middleware for better performance
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mini Trello API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Basic API routes (will be expanded)
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Mini Trello API!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      boards: '/api/boards',
      cards: '/api/cards'
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Board management routes
app.use('/api/boards', boardRoutes);

// List management routes
app.use('/api', listRoutes);

// Card management routes
app.use('/api', cardRoutes);

// Board collaboration routes  
app.use('/api', boardCollaborationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Don't expose error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).json({
    error: {
      message: isProduction ? 'Internal server error' : err.message,
      status: err.status || 500
    }
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server function
const startServer = async () => {
  try {
    // Test database connection and sync models
    try {
      await testConnection();
      console.log('Database ready');
      
      // Sync database tables (create if they don't exist)
      await syncDatabase();
      console.log('Database tables synchronized');
    } catch (error) {
      console.log('Database not connected (will work without it for now)');
      console.log('Start database with: docker-compose up -d mysql');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
