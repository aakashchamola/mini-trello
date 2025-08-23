// Simplified Swagger configuration for Mini Trello API
// Only includes APIs actually used in the frontend

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Trello API',
      version: '1.0.0',
      description: 'A simplified Kanban board application API - only documented endpoints that are actively used',
      contact: {
        name: 'Aakash Chamola',
        email: 'aakashchamolababa@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            avatar_url: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Board: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Project Board' },
            description: { type: 'string', nullable: true },
            owner_id: { type: 'integer' },
            color: { type: 'string', example: '#0079bf' },
            is_starred: { type: 'boolean', default: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        BoardMember: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            board_id: { type: 'integer' },
            user_id: { type: 'integer' },
            role: { type: 'string', enum: ['admin', 'editor', 'viewer'], default: 'editor' },
            joined_at: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        List: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'To Do' },
            board_id: { type: 'integer' },
            position: { type: 'integer', default: 0 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Card: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Task title' },
            description: { type: 'string', nullable: true },
            list_id: { type: 'integer' },
            position: { type: 'integer', default: 0 },
            due_date: { type: 'string', format: 'date-time', nullable: true },
            is_completed: { type: 'boolean', default: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            content: { type: 'string' },
            card_id: { type: 'integer' },
            author_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            author: { $ref: '#/components/schemas/User' }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            board_id: { type: 'integer' },
            user_id: { type: 'integer' },
            action: { type: 'string' },
            description: { type: 'string' },
            entity_type: { type: 'string', example: 'card' },
            entity_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management'
      },
      {
        name: 'Boards',
        description: 'Board management and collaboration'
      },
      {
        name: 'Lists',
        description: 'List management within boards'
      },
      {
        name: 'Cards',
        description: 'Card management within lists'
      },
      {
        name: 'Comments',
        description: 'Comments on cards'
      }
    ]
  },
  apis: [
    './src/routes/auth.js',
    './src/routes/boards.js',
    './src/routes/boardCollaboration.js',
    './src/routes/lists.js',
    './src/routes/cards.js',
    './src/routes/comments.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
