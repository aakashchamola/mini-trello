# Mini Trello - Kanban Board Application

A modern, collaborative Kanban board application inspired by Trello, built with React.js frontend and Node.js/Express backend featuring real-time collaboration, drag-and-drop functionality, and comprehensive project management tools.

## 🏗️ Tech Stack & Rationale

### Frontend
- **React.js (v18)** with functional components and hooks for modern UI development
- **React Query (TanStack Query)** for efficient server state management and caching
- **React Beautiful DnD** for smooth, accessible drag-and-drop interactions
- **Socket.IO Client** for real-time collaboration features
- **React Router (v6)** for seamless client-side navigation
- **CSS Modules & Tailwind CSS** for maintainable, responsive styling

### Backend
- **Node.js with Express.js** for robust API development and middleware support
- **Socket.IO** for real-time bidirectional communication
- **SQLite with Sequelize ORM** for lightweight database management with powerful query capabilities
- **JSON Web Tokens (JWT)** for secure authentication and authorization
- **bcrypt** for password hashing and security
- **Swagger/OpenAPI** for comprehensive API documentation

### Development Tools
- **ESLint & Prettier** for code quality and consistency
- **Docker & Docker Compose** for containerized development environment
- **Jest & React Testing Library** for comprehensive testing

The tech stack prioritizes developer experience, performance, and scalability while maintaining simplicity for rapid development and deployment.

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/aakashchamola/mini-trello.git
cd mini-trello
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Quick Setup (Recommended):**
```bash
npm run setup    # Installs dependencies and initializes database and will start backend server
```

**Manual Setup:**
Create a `.env` file in the backend directory by copying from `.env.example`:
```bash
cp .env.example .env
```

**Environment Variables Setup:**
The `.env.example` file contains all necessary environment variables with sample values. Key configurations include:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` - Change these to secure random strings (minimum 32 characters)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - For Google OAuth (optional)
- `PORT` - Backend server port (default: 3001)
- `USE_MYSQL` - Set to false for SQLite, true for MySQL

**Database Setup:**
```bash
# Option 1: Use the initialization script (recommended)
npm run db:init              # Creates database with schema and sample data

# Option 2: Use the database switch utility migrates data from mysql to sqlite and vice versa
node db-switch.js sqlite     # Ensures proper SQLite setup
node db-switch.js mysql      # Ensures proper MySQL setup

**Start the Backend Server:**
```bash
npm start
```

The backend will be available at `http://localhost:3001`
- API Documentation: `http://localhost:3001/api-docs`
- Health Check: `http://localhost:3001/health`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Access the Application
1. Open `http://localhost:3000` in your browser
2. Register a new account or login using Google OAuth
3. Create your first board and start organizing tasks!

### 5. Sample User Accounts (for testing)
The seed data includes pre-created users for testing:
- **Email**: `john.doe@example.com` | **Password**: `Password123!`
- **Email**: `jane.smith@example.com` | **Password**: `Password123!`
- **Email**: `alice.johnson@example.com` | **Password**: `Password123!`

All sample users have access to various pre-created boards with different collaboration scenarios.

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── swagger.js           # API documentation setup
│   ├── controllers/             # Request handlers
│   │   ├── authController.js    # Authentication endpoints
│   │   ├── boardController.js   # Board management
│   │   ├── cardController.js    # Card operations
│   │   ├── listController.js    # List management
│   │   └── commentController.js # Comment system
│   ├── middleware/              # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── boardPermissions.js # Role-based access control
│   │   └── activityLogger.js   # Activity tracking
│   ├── models/                 # Database models
│   │   ├── User.js             # User authentication
│   │   ├── Board.js            # Board entity
│   │   ├── BoardMember.js      # Collaboration relationships
│   │   ├── List.js             # Kanban lists
│   │   ├── Card.js             # Task cards
│   │   ├── Comment.js          # Comment system
│   │   └── Activity.js         # Activity logging
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic
│   ├── socket/                 # Real-time functionality
│   │   ├── socketHandler.js    # Main socket management
│   │   ├── boardEvents.js      # Board-specific events
│   │   └── realTimeMiddleware.js # Event emission
│   ├── validation/             # Request validation schemas
│   └── utils/                  # Helper functions
├── database.sqlite             # Local SQLite database
└── server.js                   # Main application entry point
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/               # Login/Register forms
│   │   ├── board/              # Board-related components
│   │   │   ├── BoardHeader.js  # Board title and controls
│   │   │   ├── BoardListNew.js # Kanban list component
│   │   │   ├── CardItem.js     # Card display
│   │   │   ├── CardModal.js    # Card editing modal
│   │   │   ├── BoardMemberManager.js # Member management
│   │   │   ├── ActivitySidebar.js # Activity feed
│   │   │   └── PresenceAvatars.js # Online users
│   │   ├── common/             # Reusable components
│   │   ├── forms/              # Form components
│   │   └── layout/             # Layout components
│   ├── contexts/               # React context providers
│   │   ├── AuthContext.js      # User authentication state
│   │   ├── AppContext.js       # Global application state
│   │   └── UIContext.js        # UI state management
│   ├── hooks/                  # Custom React hooks
│   │   ├── useBoards.js        # Board API operations
│   │   ├── useCards.js         # Card API operations
│   │   ├── useLists.js         # List API operations
│   │   └── useDragDrop.js      # Drag and drop functionality
│   ├── pages/                  # Route components
│   │   ├── BoardPage.js        # Main board interface
│   │   ├── DashboardPage.js    # Board listing
│   │   └── SettingsPage.js     # User settings
│   ├── services/               # External service integrations
│   │   ├── api.js              # HTTP client
│   │   └── socket.js           # WebSocket client
│   └── utils/                  # Helper functions
└── public/                     # Static assets
```

---

## 🏗️ Architecture Overview

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js framework
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens) with refresh token rotation
- **Real-time**: Socket.IO for live collaboration
- **Validation**: Joi for request validation
- **Documentation**: Swagger/OpenAPI 3.0

**Key Components:**

#### 1. Authentication System (`/src/controllers/authController.js`)
- **User Registration**: Email/username + password with validation
- **Login/Logout**: JWT token generation and validation
- **Profile Management**: Update username with current password verification
- **Password Change**: Secure password updates with old password verification
- **Token Refresh**: Automatic token refresh for seamless user experience

#### 2. Board Management (`/src/controllers/boardController.js`)
- **CRUD Operations**: Create, read, update, delete boards
- **Board Ownership**: Users own boards they create
- **Starring**: Favorite/unfavorite boards for quick access
- **Member Auto-creation**: Board creator automatically becomes admin member
- **Activity Tracking**: All board actions logged automatically

#### 3. Board Collaboration (`/src/controllers/boardCollaborationController.js`)
- **Member Management**: Add/remove members from boards
- **Role-based Access**: Admin, Editor, Viewer roles with different permissions
  - **Admin**: Full board control, can manage members
  - **Editor**: Can modify content (cards, lists)
  - **Viewer**: Read-only access, can add comments
- **Direct Member Addition**: Simple email/username-based member addition
- **Permission Enforcement**: Middleware validates user permissions for each action

#### 4. List Management (`/src/controllers/listController.js`)
- **CRUD Operations**: Create, read, update, delete lists within boards
- **Position Management**: Drag-and-drop list reordering
- **Board Association**: Lists belong to specific boards

#### 5. Card Management (`/src/controllers/cardController.js`)
- **CRUD Operations**: Create, read, update, delete cards within lists
- **Card Movement**: Move cards between lists with position tracking
- **Rich Content**: Title, description, due dates, completion status
- **Activity Logging**: Card changes trigger activity entries

#### 6. Comment System (`/src/controllers/commentController.js`)
- **Card Comments**: Users can comment on cards
- **Author Tracking**: Comments linked to users with timestamps
- **Real-time Updates**: Comments appear live via WebSocket

#### 7. Real-time Features (`/src/socket/`)
- **Live Collaboration**: Multiple users can work on same board simultaneously
- **Event Broadcasting**: Card moves, updates, comments broadcast to all board members
- **Board Synchronization**: Changes instantly reflected across all connected clients

#### 8. Database Models (`/src/models/`)
- **Users**: Authentication and profile data
- **Boards**: Board information and ownership
- **BoardMembers**: Member roles and permissions
- **Lists**: Organization containers within boards
- **Cards**: Task items with metadata
- **Comments**: User feedback on cards
- **Activities**: Audit trail of all board actions

#### 9. Middleware & Security
- **Authentication Middleware** (`/src/middleware/auth.js`): JWT validation
- **Board Permissions** (`/src/middleware/boardPermissions.js`): Role-based access control
- **Activity Logger** (`/src/middleware/activityLogger.js`): Automatic action tracking
- **Input Validation**: Joi schemas for all request payloads
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers for production

---

### Frontend Architecture

**Technology Stack:**
- **Framework**: React.js with functional components and hooks
- **State Management**: React Query for server state, Context API for UI state
- **Routing**: React Router for navigation
- **Drag & Drop**: React Beautiful DnD for intuitive card/list movement
- **Real-time**: Socket.IO client for live updates
- **Styling**: CSS modules with responsive design
- **HTTP Client**: Axios with interceptors for API communication

**Key Components:**

#### 1. Authentication Flow (`/src/contexts/AuthContext.js`)
- **Login/Register Pages**: User authentication forms
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Token Management**: Automatic refresh and storage
- **Profile Management**: Settings page for username/password changes

#### 2. Dashboard (`/src/pages/DashboardPage.js`)
- **Board Overview**: Display user's boards in grid layout
- **Quick Actions**: Create new boards, star favorites
- **Recent Boards**: Easy access to recently accessed boards
- **Starred Boards**: Separate section for favorited boards

#### 3. Board Interface (`/src/pages/BoardPage.js`)
- **Real-time Collaboration**: Live updates from other users
- **Drag & Drop**: Intuitive card and list reordering
- **Member Management**: Modal for adding/removing board members
- **Activity Sidebar**: Toggleable activity feed
- **Search & Filters**: Find cards quickly within board

#### 4. List Management (`/src/components/board/BoardListNew.js`)
- **List CRUD**: Create, edit, delete lists
- **Card Container**: Houses cards with drag-drop zones
- **Add Card**: Quick card creation within lists
- **Position Tracking**: Maintains list order

#### 5. Card System (`/src/components/board/CardItem.js`, `/src/components/board/CardModal.js`)
- **Card Display**: Shows card title and metadata
- **Detailed Modal**: Full card editing interface
- **Comment Thread**: Real-time comment system
- **Rich Editing**: Title, description, due dates

#### 6. Member Management (`/src/components/board/BoardMemberManager.js`)
- **Add Members**: Email/username-based member addition
- **Role Management**: Change member roles (admin/editor/viewer)
- **Remove Members**: Remove users from board
- **Owner Protection**: Board owners cannot be removed or demoted

#### 7. Real-time Integration (`/src/services/socket.js`)
- **Event Listening**: Handles all real-time board updates
- **Optimistic Updates**: UI updates immediately, syncs with server
- **Error Handling**: Graceful fallback for connection issues
- **Board Synchronization**: Ensures all users see latest state

#### 8. State Management
- **React Query**: Server state, caching, and synchronization
- **UI Context**: Modal states, filters, drag-and-drop state
- **Auth Context**: User authentication state
- **Local Storage**: Persistent user preferences and tokens

#### 9. API Integration (`/src/services/api.js`)
- **HTTP Client**: Axios instance with interceptors
- **Authentication**: Automatic token attachment
- **Error Handling**: Centralized error processing
- **Token Refresh**: Seamless token renewal

---

## 🎯 Implemented Features

### ✅ Core Features
- **User Authentication**: Register, login, logout with JWT
- **Board Management**: Create, edit, delete, star boards
- **List Management**: Create, edit, delete, reorder lists
- **Card Management**: Create, edit, delete, move cards between lists
- **Comments**: Add comments to cards with real-time updates
- **Member Collaboration**: Add members to boards with role-based permissions
- **Activity Tracking**: Automatic logging of all board actions
- **Real-time Updates**: Live collaboration with Socket.IO
- **Drag & Drop**: Intuitive card and list reordering
- **Responsive Design**: Works on desktop and mobile devices

### ✅ Advanced Features
- **Role-based Access Control**: Admin, Editor, Viewer permissions
- **Activity Feed**: See what happened on your boards
- **Board Starring**: Mark important boards as favorites
- **Search & Filters**: Find cards quickly
- **Member Management**: Add/remove users, change roles
- **Settings Page**: Update profile and change password
- **Auto-save**: Changes saved automatically
- **Optimistic Updates**: UI responds immediately to actions

### ✅ Technical Features
- **JWT Authentication**: Secure token-based auth with refresh
- **Real-time Collaboration**: Multiple users can work simultaneously
- **Database Relationships**: Proper foreign key constraints
- **Input Validation**: Server-side validation with Joi
- **Error Handling**: Comprehensive error responses
- **API Documentation**: Swagger/OpenAPI documentation
- **Activity Logging**: Audit trail for all actions
- **Permission Middleware**: Role-based access control

---

## 🗄️ Database Schema Overview

The application uses SQLite by default (with MySQL support) and follows a normalized relational design:

### Core Tables

#### Users Table
```sql
users (
  id INTEGER PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- bcrypt hashed
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Boards Table
```sql
boards (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  color VARCHAR(255) DEFAULT '#0079bf',
  is_starred BOOLEAN DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Board Members Table (Collaboration)
```sql
board_members (
  id INTEGER PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(20) CHECK (role IN ('admin', 'editor', 'viewer')),
  joined_at TIMESTAMP,
  UNIQUE(board_id, user_id)
)
```

#### Lists Table (Kanban Columns)
```sql
lists (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  board_id INTEGER REFERENCES boards(id),
  position INTEGER DEFAULT 0,           -- For ordering
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Cards Table (Tasks)
```sql
cards (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  list_id INTEGER REFERENCES lists(id),
  position INTEGER DEFAULT 0,           -- For ordering within list
  due_date TIMESTAMP NULL,
  is_completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Comments Table
```sql
comments (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  card_id INTEGER REFERENCES cards(id),
  author_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Activities Table (Audit Trail)
```sql
activities (
  id INTEGER PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id),
  user_id INTEGER REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,    -- 'created', 'updated', 'moved', etc.
  entity_type VARCHAR(50) NOT NULL,     -- 'board', 'list', 'card', 'comment'
  entity_id INTEGER,
  old_value TEXT,                       -- JSON string of old values
  new_value TEXT,                       -- JSON string of new values
  description TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Key Relationships
- **One-to-Many**: User → Boards (ownership)
- **Many-to-Many**: Users ↔ Boards (collaboration via board_members)
- **One-to-Many**: Board → Lists → Cards
- **One-to-Many**: Cards → Comments
- **One-to-Many**: Board → Activities (audit trail)


### Comments
- User comments on cards
- Fields: id, content, card_id, author_id, timestamps

### Activities
- Audit trail of board actions
- Fields: id, board_id, user_id, action, description, entity_type, entity_id, metadata, created_at

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Boards
- `GET /api/boards` - Get user boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `PUT /api/boards/:id/star` - Star board

### Board Collaboration
- `GET /api/boards/:id/members` - Get board members
- `POST /api/boards/:id/invite` - Add member
- `PUT /api/boards/:id/members/:memberId` - Update member role
- `DELETE /api/boards/:id/members/:memberId` - Remove member

### Lists
- `GET /api/boards/:boardId/lists` - Get board lists
- `POST /api/boards/:boardId/lists` - Create list
- `PUT /api/boards/:boardId/lists/:id` - Update list
- `DELETE /api/boards/:boardId/lists/:id` - Delete list

### Cards
- `GET /api/boards/:boardId/lists/:listId/cards` - Get list cards
- `POST /api/boards/:boardId/lists/:listId/cards` - Create card
- `PUT /api/boards/:boardId/lists/:listId/cards/:id` - Update card
- `DELETE /api/boards/:boardId/lists/:listId/cards/:id` - Delete card
- `PUT /api/boards/:boardId/lists/:listId/cards/:id/move` - Move card

### Comments
- `GET /api/boards/:boardId/lists/:listId/cards/:cardId/comments` - Get card comments
- `POST /api/boards/:boardId/lists/:listId/cards/:cardId/comments` - Add comment

---

## 🔄 Real-time Collaboration

The application uses **Socket.IO** for real-time collaboration, enabling multiple users to work on the same board simultaneously.

### Real-time Features
- **Live Card Movements**: See cards move as other users drag them
- **Instant Updates**: Board changes appear immediately for all users
- **Activity Feed**: Real-time activity notifications
- **Member Presence**: See who's currently viewing the board
- **Comment Notifications**: Instant comment updates
- **Visual Feedback**: See what other users are currently dragging

### How to Start Real-time Server
The real-time server is integrated with the main backend server - no separate setup required.

**Backend Integration:**
```javascript
// Socket.IO is automatically initialized with the Express server
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Real-time events are handled in src/socket/
server.listen(3001);
```

**Frontend Connection:**
```javascript
// Automatic connection when user logs in
import socketService from './services/socket';

// Connect and join board room
socketService.connect();
socketService.joinBoard(boardId);
```

### Supported Real-time Events

#### Board Events
- `board:updated` - Board details changed by another user
- `board:deleted` - Board was deleted by owner

#### List Events  
- `list:created` - New list added to board
- `list:updated` - List title or details changed
- `list:moved` - List reordered by drag-and-drop
- `list:deleted` - List removed from board

#### Card Events
- `card:created` - New card added to list
- `card:updated` - Card title, description, or status changed
- `card:moved` - Card moved between lists or positions
- `card:deleted` - Card removed from board

#### Comment Events
- `comment:created` - New comment added to card
- `comment:updated` - Comment text modified
- `comment:deleted` - Comment removed

#### Collaboration Events
- `user:joined` - User joined the board
- `user:left` - User left the board
- `drag-start` - User started dragging an item
- `drag-end` - User finished dragging an item

### Example Real-time Usage
When User A moves a card, User B immediately sees:
1. **Visual Feedback**: Card being dragged (with user indicator)
2. **Live Movement**: Card position updates in real-time
3. **Activity Update**: "User A moved Card X from List Y to List Z"
4. **Optimistic UI**: Changes appear instantly, then sync with server

---

## 🛠️ Development

### File Structure
```
mini-trello/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Swagger config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, permissions, logging
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # External services
│   │   ├── socket/         # Real-time handlers
│   │   ├── utils/          # Helper functions
│   │   └── validation/     # Input validation
│   ├── database.sqlite     # SQLite database
│   └── server.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   └── utils/          # Helper functions
│   └── public/             # Static files
└── docs/                   # Documentation
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

---

## � Documentation

### Design Documents
- **[High-Level Design (HLD)](./docs/HLD.md)** - System architecture, component design, and technology decisions
- **[Low-Level Design (LLD)](./docs/LLD.md)** - Detailed implementation, API specifications, and database design
- **[API Reference](./docs/API-Reference.md)** - Complete REST API documentation with examples

### API Resources
- **Swagger Documentation**: `http://localhost:3001/api-docs` (when backend is running)

### Database Resources
- **Schema**: See `database/01-schema.sql` for complete table definitions
- **ERD Diagram**: See `docs/ERD_diagram.png` for visual schema representation

---

## �🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcrypt with configurable salt rounds for secure password storage
- **Input Validation**: Joi schemas prevent malicious input and ensure data integrity
- **CORS Protection**: Configured for specific frontend domain to prevent unauthorized access
- **Helmet Security**: Comprehensive security headers for production environments
- **Permission Middleware**: Role-based access control (Admin/Editor/Viewer)
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **Rate Limiting**: Protection against brute force attacks and API abuse
- **XSS Protection**: Input sanitization and proper content security policies

---


### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production mode
docker-compose -f docker-compose.prod.yml up -d
```

```
## Changelog

### v1.0.0 (Current)
- ✅ Complete authentication system with JWT and Google OAuth integration
- ✅ Full board, list, and card management with CRUD operations
- ✅ Real-time collaboration using Socket.IO with room-based events
- ✅ Comment system with real-time updates and notifications
- ✅ Role-based access control (Admin/Editor/Viewer permissions)
- ✅ Comprehensive activity tracking and audit trails
- ✅ Intuitive drag and drop interface with visual feedback
- ✅ Responsive design optimized for mobile and desktop
- ✅ Complete API documentation with Swagger and Postman collection
- ✅ Docker support for containerized deployment