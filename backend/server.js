// Mini Trello Backend Server
// Main server file with Express setup and middleware configuration

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');

// Import socket handlers
const SocketHandler = require('./src/socket/socketHandler');
const BoardEvents = require('./src/socket/boardEvents');
const RealTimeMiddleware = require('./src/socket/realTimeMiddleware');

// Import Swagger configuration
const { swaggerUi, specs } = require('./src/config/swagger');

// Import routes
const authRoutes = require('./src/routes/auth');
const boardRoutes = require('./src/routes/boards');
const listRoutes = require('./src/routes/lists');
const cardRoutes = require('./src/routes/cards');
const boardCollaborationRoutes = require('./src/routes/boardCollaboration');
const commentRoutes = require('./src/routes/comments');
const workspaceRoutes = require('./src/routes/workspaces');
const realtimeRoutes = require('./src/routes/realtime');

// Create Express application
const app = express();
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize socket handlers
const socketHandler = new SocketHandler(io);
const boardEvents = new BoardEvents(socketHandler);
const realTimeMiddleware = new RealTimeMiddleware(boardEvents);

// Make socket services available globally for routes
app.set('socketHandler', socketHandler);
app.set('boardEvents', boardEvents);

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

// Debug: Route registration logging
console.log('Registering routes...');

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API server is running and operational
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Mini Trello API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current server timestamp
 *                 environment:
 *                   type: string
 *                   description: Current environment
 *                   example: development
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mini Trello API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Mini Trello API Documentation',
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// API documentation JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API information endpoint
 *     description: Get basic information about the Mini Trello API and available endpoints
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to Mini Trello API!
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: /health
 *                     auth:
 *                       type: string
 *                       example: /api/auth
 *                     boards:
 *                       type: string
 *                       example: /api/boards
 *                     cards:
 *                       type: string
 *                       example: /api/cards
 *                     documentation:
 *                       type: string
 *                       example: /api-docs
 */
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Mini Trello API!',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      boards: '/api/boards',
      cards: '/api/cards',
      documentation: '/api-docs'
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Board management routes with real-time events
app.use('/api/boards', 
  realTimeMiddleware.emitBoardEvents(),
  realTimeMiddleware.captureOldData('board'),
  realTimeMiddleware.captureChanges('board'),
  boardRoutes
);

// List management routes with real-time events
app.use('/api', 
  realTimeMiddleware.emitListEvents(),
  realTimeMiddleware.captureOldData('list'),
  realTimeMiddleware.captureChanges('list'),
  listRoutes
);

// Card management routes with real-time events
app.use('/api', 
  realTimeMiddleware.emitCardEvents(),
  realTimeMiddleware.captureOldData('card'),
  realTimeMiddleware.captureChanges('card'),
  realTimeMiddleware.captureMoveData(),
  cardRoutes
);

// Board collaboration routes  
app.use('/api', boardCollaborationRoutes);

// Comment management routes with real-time events
app.use('/api', 
  realTimeMiddleware.emitCommentEvents(),
  realTimeMiddleware.captureOldData('comment'),
  commentRoutes
);

// Workspace management routes
app.use('/api', workspaceRoutes);

// Real-time routes
app.use('/api', realtimeRoutes);

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
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`WebSocket server ready for real-time collaboration`);
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
