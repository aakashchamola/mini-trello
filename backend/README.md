# Mini Trello Backend

A Kanban board application backend built with Node.js, Express, and SQLite/MySQL.

**By default, the app runs on SQLite for easy local setup (<15 minutes).
For production-like usage, set environment variables and run with MySQL (see Docker setup).**

## Quick Setup (SQLite)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001` with SQLite database automatically created.

## Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Choose your database option:

   **Option A: MySQL with Docker (Recommended)**
   ```bash
   docker run --name mini-trello-mysql 
     -e MYSQL_ROOT_PASSWORD=rootpassword 
     -e MYSQL_DATABASE=mini_trello 
     -e MYSQL_USER=trello_user 
     -e MYSQL_PASSWORD=trello_password 
     -p 3306:3306 
     -d mysql:8.0 
     --default-authentication-plugin=mysql_native_password
   ```

   **Option B: SQLite (No Docker needed)**
   
   No setup required - SQLite database will be created automatically.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Database Options

- **SQLite** (default): File-based database, no setup required
- **MySQL**: Production-ready database with Docker support

Switch between databases by setting `USE_MYSQL=true/false` in `.env` file.

Server runs on `http://localhost:3001`

## Features

- **User Authentication**: Registration, login, JWT tokens
- **Protected Routes**: Bearer token authentication
- **Input Validation**: Joi schema validation
- **Database**: MySQL with Docker or SQLite for local development
- **Password Security**: bcrypt hashing


## File Structure

### Authentication System
- `src/models/User.js` - User model with password hashing
- `src/controllers/authController.js` - Auth endpoints (register/login/profile)
- `src/routes/auth.js` - Auth route definitions
- `src/middleware/auth.js` - JWT authentication middleware
- `src/validation/authValidation.js` - Input validation schemas
- `src/utils/jwt.js` - Token generation and verification

### Configuration
- `src/config/database.js` - Database connection and setup
- `src/models/index.js` - Model initialization and sync
- `server.js` - Express app setup and middleware

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)
