// Swagger configuration for Mini Trello API
// Comprehensive API documentation setup

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Trello API',
      version: '1.0.0',
      description: 'A comprehensive API for a collaborative Kanban board application similar to Trello',
      contact: {
        name: 'Aakash Chamola',
        email: 'aakashchamolababa@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.mini-trello.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique user identifier',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              description: 'Unique username',
              example: 'johndoe'
            },
            avatar_url: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'URL to user avatar image',
              example: 'https://example.com/avatar.jpg'
            },
            email_verified: {
              type: 'boolean',
              description: 'Whether user email is verified',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User registration timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last profile update timestamp'
            }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['email', 'username', 'password', 'confirmPassword'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'newuser@example.com'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9]+$',
              description: 'Unique username (alphanumeric only)',
              example: 'newuser123'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
              example: 'securepassword123'
            },
            confirmPassword: {
              type: 'string',
              description: 'Password confirmation (must match password)',
              example: 'securepassword123'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT access token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        
        // Workspace schemas
        Workspace: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique workspace identifier',
              example: 1
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Workspace name',
              example: 'My Team Workspace'
            },
            description: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              description: 'Workspace description',
              example: 'Our main workspace for project collaboration'
            },
            userId: {
              type: 'integer',
              description: 'ID of workspace owner',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        WorkspaceCreate: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Workspace name',
              example: 'New Project Workspace'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Workspace description',
              example: 'Workspace for our new project'
            }
          }
        },

        // Board schemas
        Board: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique board identifier',
              example: 1
            },
            title: {
              type: 'string',
              maxLength: 100,
              description: 'Board title',
              example: 'Project Development Board'
            },
            description: {
              type: 'string',
              maxLength: 500,
              nullable: true,
              description: 'Board description',
              example: 'Track development progress for our main project'
            },
            background_color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              nullable: true,
              description: 'Board background color (hex)',
              example: '#0079bf'
            },
            visibility: {
              type: 'string',
              enum: ['private', 'workspace', 'public'],
              description: 'Board visibility level',
              example: 'private'
            },
            userId: {
              type: 'integer',
              description: 'ID of board owner',
              example: 1
            },
            workspaceId: {
              type: 'integer',
              nullable: true,
              description: 'ID of parent workspace',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        BoardCreate: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              maxLength: 100,
              description: 'Board title',
              example: 'New Development Board'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Board description',
              example: 'Board for tracking development tasks'
            },
            background_color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Board background color (hex)',
              example: '#026aa7'
            },
            visibility: {
              type: 'string',
              enum: ['private', 'workspace', 'public'],
              description: 'Board visibility level',
              example: 'private'
            },
            workspaceId: {
              type: 'integer',
              description: 'ID of parent workspace',
              example: 1
            }
          }
        },

        // List schemas
        List: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique list identifier',
              example: 1
            },
            title: {
              type: 'string',
              maxLength: 100,
              description: 'List title',
              example: 'To Do'
            },
            position: {
              type: 'number',
              description: 'List position on board',
              example: 1.0
            },
            boardId: {
              type: 'integer',
              description: 'ID of parent board',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ListCreate: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              maxLength: 100,
              description: 'List title',
              example: 'In Progress'
            },
            position: {
              type: 'number',
              description: 'List position on board',
              example: 2.0
            }
          }
        },

        // Card schemas
        Card: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique card identifier',
              example: 1
            },
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Card title',
              example: 'Implement user authentication'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              nullable: true,
              description: 'Card description',
              example: 'Create login and registration functionality with JWT tokens'
            },
            position: {
              type: 'number',
              description: 'Card position in list',
              example: 1.0
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Card due date'
            },
            labels: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Card labels',
              example: ['urgent', 'backend']
            },
            listId: {
              type: 'integer',
              description: 'ID of parent list',
              example: 1
            },
            assignedUserId: {
              type: 'integer',
              nullable: true,
              description: 'ID of assigned user',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CardCreate: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
              description: 'Card title',
              example: 'Fix responsive design issues'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Card description',
              example: 'Fix layout issues on mobile devices'
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              description: 'Card due date',
              example: '2024-01-15T10:00:00Z'
            },
            labels: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Card labels',
              example: ['frontend', 'bug']
            },
            assignedUserId: {
              type: 'integer',
              description: 'ID of user to assign',
              example: 2
            },
            position: {
              type: 'number',
              description: 'Card position in list',
              example: 3.0
            }
          }
        },
        CardMove: {
          type: 'object',
          required: ['targetListId', 'position'],
          properties: {
            targetListId: {
              type: 'integer',
              description: 'ID of target list',
              example: 2
            },
            position: {
              type: 'number',
              description: 'New position in target list',
              example: 1.0
            }
          }
        },

        // Comment schemas
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique comment identifier',
              example: 1
            },
            content: {
              type: 'string',
              maxLength: 1000,
              description: 'Comment content',
              example: 'This task is blocked by the API endpoint implementation'
            },
            cardId: {
              type: 'integer',
              description: 'ID of parent card',
              example: 1
            },
            userId: {
              type: 'integer',
              description: 'ID of comment author',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CommentCreate: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              maxLength: 1000,
              description: 'Comment content',
              example: 'Great progress on this task!'
            }
          }
        },

        // Board member schemas
        BoardMember: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique membership identifier',
              example: 1
            },
            userId: {
              type: 'integer',
              description: 'ID of member user',
              example: 2
            },
            boardId: {
              type: 'integer',
              description: 'ID of board',
              example: 1
            },
            role: {
              type: 'string',
              enum: ['admin', 'member', 'observer'],
              description: 'Member role',
              example: 'member'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'declined'],
              description: 'Membership status',
              example: 'accepted'
            },
            invitedBy: {
              type: 'integer',
              description: 'ID of user who sent invitation',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        BoardInvitation: {
          type: 'object',
          required: ['email', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email of user to invite',
              example: 'colleague@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'member', 'observer'],
              description: 'Role to assign to invited user',
              example: 'member'
            }
          }
        },

        // Activity schemas
        Activity: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique activity identifier',
              example: 1
            },
            type: {
              type: 'string',
              description: 'Activity type',
              example: 'card_created'
            },
            description: {
              type: 'string',
              description: 'Activity description',
              example: 'created card "Implement user authentication"'
            },
            entityType: {
              type: 'string',
              description: 'Type of entity affected',
              example: 'card'
            },
            entityId: {
              type: 'integer',
              description: 'ID of affected entity',
              example: 1
            },
            userId: {
              type: 'integer',
              description: 'ID of user who performed action',
              example: 1
            },
            boardId: {
              type: 'integer',
              description: 'ID of board where activity occurred',
              example: 1
            },
            metadata: {
              type: 'object',
              description: 'Additional activity metadata'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Real-time presence schema
        BoardPresence: {
          type: 'object',
          properties: {
            boardId: {
              type: 'integer',
              description: 'Board identifier',
              example: 1
            },
            connectedUsers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'integer',
                    example: 1
                  },
                  username: {
                    type: 'string',
                    example: 'johndoe'
                  },
                  avatar_url: {
                    type: 'string',
                    example: 'https://example.com/avatar.jpg'
                  },
                  lastSeen: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            totalConnected: {
              type: 'integer',
              description: 'Total number of connected users',
              example: 3
            }
          }
        },

        // Error schemas
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found'
            },
            code: {
              type: 'string',
              description: 'Error code',
              example: 'RESOURCE_NOT_FOUND'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Please provide a valid email address'
                  }
                }
              }
            }
          }
        },

        // Success response schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      },
      parameters: {
        BoardId: {
          name: 'boardId',
          in: 'path',
          required: true,
          description: 'Board identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        },
        ListId: {
          name: 'listId',
          in: 'path',
          required: true,
          description: 'List identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        },
        CardId: {
          name: 'cardId',
          in: 'path',
          required: true,
          description: 'Card identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        },
        CommentId: {
          name: 'commentId',
          in: 'path',
          required: true,
          description: 'Comment identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        },
        WorkspaceId: {
          name: 'workspaceId',
          in: 'path',
          required: true,
          description: 'Workspace identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        },
        MemberId: {
          name: 'memberId',
          in: 'path',
          required: true,
          description: 'Member identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        },
        InvitationId: {
          name: 'invitationId',
          in: 'path',
          required: true,
          description: 'Invitation identifier',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User profile management'
      },
      {
        name: 'Workspaces',
        description: 'Workspace management and collaboration'
      },
      {
        name: 'Boards',
        description: 'Board management and configuration'
      },
      {
        name: 'Lists',
        description: 'List management within boards'
      },
      {
        name: 'Cards',
        description: 'Card management and operations'
      },
      {
        name: 'Comments',
        description: 'Card comments and discussions'
      },
      {
        name: 'Board Collaboration',
        description: 'Board sharing and member management'
      },
      {
        name: 'Real-time',
        description: 'Real-time collaboration features'
      },
      {
        name: 'System',
        description: 'System health and information'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
