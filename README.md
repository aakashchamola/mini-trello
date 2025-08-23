# Mini Trello - Kanban Board Application

A simplified Trello-like kanban board application built with React.js frontend and Node.js/Express backend with real-time collaboration features.

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

Create a `.env` file in the backend directory:
```
// just copy the .env.example to .env in the backend directory i haven given all the keys and secret keys there itself 
```

Start the backend server:
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
2. Register a new account or login/sign up using google option
3. Create your first board and start organizing tasks!

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

## 🗄️ Database Schema

The application uses SQLite with the following core tables:

### Users
- User authentication and profile information
- Fields: id, email, username, password, avatar_url, timestamps

### Boards  
- Board information and ownership
- Fields: id, title, description, owner_id, color, is_starred, timestamps

### BoardMembers
- User permissions on boards
- Fields: id, board_id, user_id, role (admin/editor/viewer), joined_at

### Lists
- Organization containers within boards
- Fields: id, title, board_id, position, timestamps

### Cards
- Task items with rich content
- Fields: id, title, description, list_id, position, due_date, is_completed, timestamps

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

## 🔄 Real-time Events

The application uses WebSocket (Socket.IO) for real-time collaboration:

### Board Events
- `board:updated` - Board details changed
- `board:deleted` - Board was deleted

### List Events
- `list:created` - New list added
- `list:updated` - List details changed
- `list:deleted` - List was removed

### Card Events
- `card:created` - New card added
- `card:updated` - Card details changed
- `card:moved` - Card moved between lists
- `card:deleted` - Card was removed

### Comment Events
- `comment:created` - New comment added

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

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Joi schemas prevent malicious input
- **CORS Protection**: Configured for specific frontend domain
- **Helmet Security**: Security headers for production
- **Permission Middleware**: Role-based access control
- **SQL Injection Prevention**: Sequelize ORM parameterized queries

---

## 🚀 Deployment

### Environment Variables
Make sure to set these environment variables in production:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
DATABASE_URL=your-production-database-url
FRONTEND_URL=https://your-frontend-domain.com
```

### Production Build
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm run build
# Serve the build folder with your web server
```

---

## 📞 Support

For issues and questions:
- Email: aakashchamolababa@gmail.com
- Create an issue on GitHub

---

## 📄 License

This project is licensed under the MIT License.
