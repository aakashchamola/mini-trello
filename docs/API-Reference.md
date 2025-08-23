# Mini Trello API Reference

## Base URL
```
Development: http://localhost:3001
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "avatar_url": null
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/login
Login with email/username and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "avatar_url": null
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/refresh
Refresh an expired access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/logout
Logout and invalidate refresh token.

### Boards

#### GET /boards
Get all boards for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "boards": [
    {
      "id": 1,
      "title": "Product Development",
      "description": "Main product development board",
      "color": "#0079bf",
      "is_starred": true,
      "owner_id": 1,
      "created_at": "2025-08-24T10:00:00Z",
      "role": "admin"
    }
  ]
}
```

#### POST /boards
Create a new board.

**Request Body:**
```json
{
  "title": "New Project Board",
  "description": "Description of the board",
  "color": "#0079bf"
}
```

#### GET /boards/:boardId/with-data
Get board with all lists, cards, and activities.

**Response (200):**
```json
{
  "success": true,
  "board": {
    "id": 1,
    "title": "Product Development",
    "description": "Main product development board",
    "color": "#0079bf",
    "lists": [
      {
        "id": 1,
        "title": "To Do",
        "position": 1000,
        "cards": [
          {
            "id": 1,
            "title": "Implement JWT Authentication",
            "description": "Set up JWT-based authentication",
            "position": 1000,
            "due_date": "2025-09-15T17:00:00Z",
            "is_completed": false,
            "commentCount": 3
          }
        ]
      }
    ],
    "activities": [
      {
        "id": 1,
        "action_type": "created",
        "description": "Created card \"Implement JWT Authentication\"",
        "entity_type": "card",
        "entity_id": 1,
        "created_at": "2025-08-24T10:00:00Z",
        "user": {
          "id": 1,
          "username": "johndoe",
          "avatar_url": null
        }
      }
    ]
  }
}
```

#### PUT /boards/:boardId
Update board details.

**Request Body:**
```json
{
  "title": "Updated Board Title",
  "description": "Updated description",
  "color": "#eb5a46"
}
```

#### DELETE /boards/:boardId
Delete a board (owner only).

### Lists

#### POST /boards/:boardId/lists
Create a new list in a board.

**Request Body:**
```json
{
  "title": "New List",
  "position": 2000
}
```

#### PUT /boards/:boardId/lists/:listId
Update list details.

**Request Body:**
```json
{
  "title": "Updated List Title"
}
```

#### PUT /boards/:boardId/lists/reorder
Reorder lists within a board.

**Request Body:**
```json
{
  "listOrders": [
    { "id": 1, "position": 1000 },
    { "id": 2, "position": 2000 }
  ]
}
```

#### DELETE /boards/:boardId/lists/:listId
Delete a list and all its cards.

### Cards

#### POST /boards/:boardId/lists/:listId/cards
Create a new card in a list.

**Request Body:**
```json
{
  "title": "New Card",
  "description": "Card description",
  "due_date": "2025-09-15T17:00:00Z"
}
```

#### PUT /boards/:boardId/cards/:cardId
Update card details.

**Request Body:**
```json
{
  "title": "Updated Card Title",
  "description": "Updated description",
  "due_date": "2025-09-20T17:00:00Z",
  "is_completed": true
}
```

#### PUT /boards/:boardId/cards/:cardId/move
Move a card between lists or positions.

**Request Body:**
```json
{
  "targetListId": 2,
  "targetIndex": 1
}
```

#### DELETE /boards/:boardId/cards/:cardId
Delete a card.

### Comments

#### GET /boards/:boardId/cards/:cardId/comments
Get all comments for a card.

**Response (200):**
```json
{
  "success": true,
  "comments": [
    {
      "id": 1,
      "text": "This looks great!",
      "card_id": 1,
      "author_id": 2,
      "created_at": "2025-08-24T10:00:00Z",
      "author": {
        "id": 2,
        "username": "janesmith",
        "avatar_url": null
      }
    }
  ]
}
```

#### POST /boards/:boardId/cards/:cardId/comments
Add a comment to a card.

**Request Body:**
```json
{
  "text": "This is a comment"
}
```

#### PUT /boards/:boardId/comments/:commentId
Update a comment.

**Request Body:**
```json
{
  "text": "Updated comment text"
}
```

### Board Members

#### GET /boards/:boardId/members
Get all members of a board.

**Response (200):**
```json
{
  "success": true,
  "members": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "avatar_url": null,
      "role": "admin",
      "joined_at": "2025-08-24T10:00:00Z"
    }
  ]
}
```

#### POST /boards/:boardId/members
Add a member to a board.

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "editor"
}
```

#### PUT /boards/:boardId/members/:memberId
Update member role.

**Request Body:**
```json
{
  "role": "viewer"
}
```

#### DELETE /boards/:boardId/members/:memberId
Remove a member from a board.

## Real-time Events (Socket.IO)

### Event Types

#### Card Events
- `card:created` - New card added
- `card:updated` - Card details changed
- `card:moved` - Card moved between lists
- `card:deleted` - Card removed

#### List Events
- `list:created` - New list added
- `list:updated` - List details changed
- `list:moved` - List reordered
- `list:deleted` - List removed

#### Comment Events
- `comment:created` - New comment added
- `comment:updated` - Comment text changed
- `comment:deleted` - Comment removed

#### Board Events
- `board:updated` - Board details changed
- `user:joined` - User joined board
- `user:left` - User left board

### Example Event Data

#### card:moved Event
```json
{
  "boardId": 1,
  "cardId": 1,
  "fromListId": 1,
  "toListId": 2,
  "card": {
    "id": 1,
    "title": "Card Title",
    "position": 2000
  },
  "movedBy": {
    "id": 1,
    "username": "johndoe"
  },
  "timestamp": "2025-08-24T10:00:00Z"
}
```

## Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per window
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Postman Collection
A Postman collection with all endpoints is available at: `/docs/Mini-Trello-API.postman_collection.json`
