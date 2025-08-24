# Mini Trello - Kanban Board Application

A modern, collaborative Kanban board application inspired by Trello, built with React.js frontend and Node.js/Express backend featuring real-time collaboration, drag-and-drop functionality, and comprehensive project management tools.

## 🏗️ Tech Stack & Rationale

### Frontend
- **React.js (v18)** with functional components and hooks for modern UI development
- **React Query (TanStack Query)** for efficient server state management and caching
- **React Beautiful DnD** for smooth, accessible drag-and-drop interactions
- **Socket.IO Client** for real-time collaboration features
- **React Router (v6)** for seamless client-side navigation
- **CSS Modules** for maintainable, responsive styling

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
If you don’t have Docker or MySQL installed, you can directly use **SQLite** with one command:

**Optional Seed Data Setup(before starting up server):**
To populate the database with initial data, run the following command:
```bash
# Run all seeders (preserves existing data)
npm run seed

# Fresh seed - recreates database with sample data
npm run seed:fresh

# Undo all seeders (cleans up data)
npm run seed:undo

```

**Quick Setup without docker(Recommended):**
```bash
cd backend
npm run setup  # Installs dependencies and copies .env.example to .env then runs db-switch.js sqlite to switch db to sqlite and then initializes database and starts backend server
```

**Quick Setup with docker:**
If you have docker and can use it, you can set up the backend, frontend, mysql with the following command:

```bash
docker-compose up --build # will take care of mysql database 
```

You can  run the below command in another terminal to start the backend server:

```bash
cd backend
npm start 
```



**Manual Setup:**
```bash
# Move into backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Switch to SQLite (default simple setup)
node db-switch.js sqlite

# Start backend server
npm start
```




**Environment Variables Setup:**
The `.env.example` file contains all necessary environment variables with sample values. Key configurations include:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` - Change these to secure random strings (minimum 32 characters)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - For Google OAuth (optional)
- `PORT` - Backend server port (default: 3001)
- `USE_MYSQL` - Set to false for SQLite, true for MySQL

**Database Setup:** 
We have two options to set up the database:
1. sqlite 
2. mysql
```bash
# Use the database switch utility migrates data from mysql to sqlite and vice versa
node db-switch.js sqlite     # Ensures proper SQLite setup
node db-switch.js mysql      # Ensures proper MySQL setup
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
│   │   └── boardCollaboration.js # Board collaboration
│   │   └── dragDropController.js # Drag and drop functionality
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
│   │   └── Mention.js         # Mention system
│   │   └── index.js         # Index file for easier imports
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic
│   │   └── googleAuthService.js       # Google OAuth integration
│   │   └── positionService.js         # Position management
│   ├── socket/                 # Real-time functionality
│   │   ├── socketHandler.js    # Main socket management
│   │   ├── boardEvents.js      # Board-specific events
│   │   └── realTimeMiddleware.js # Event emission
│   ├── validation/             # Request validation schemas
│   └── utils/                  # Helper functions
│   │   ├── jwt.js              # JWT utilities
│   │   ├── mentionUtils.js      # Mention system utilities
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
- **Mentions**: Notify users by mentioning them in comments
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


### Supported Real-time Events

#### Board Events
- `board:updated` - Board details changed by another user
- `board:deleted` - Board was deleted by owner

#### List Events  
- `list:created` - New list added to board
- `list:updated` - List title or details changed
- `list:moved` - List reordered by drag-and-drop
- `list:deleted` - List removed from board

### Mention Events
- `mention:added` - User mentioned in a comment
- `mention:removed` - User unmentioned in a comment

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
5. **Mentions**: User B sees "User A mentioned you in a comment"

---

## � Documentation

### Design Documents
- **[High-Level Design (HLD)](./docs/HLD.md)** - System architecture, component design, and technology decisions
- **[Low-Level Design (LLD)](./docs/LLD.md)** - Detailed implementation, API specifications, and database design
- **[API Reference](./docs/API-Reference.md)** - Complete REST API documentation with examples
- **[ERD Diagram](./docs/ERD_diagram.png)** - Entity-Relationship Diagram for database schema

### API Resources
- **Swagger Documentation**: `http://localhost:3001/api-docs` (when backend is running)

---