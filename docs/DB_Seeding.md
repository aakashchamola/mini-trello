# Database Seeding Guide for Mini Trello

## Overview

This project now includes a comprehensive database seeding system that creates realistic sample data for testing and development purposes. The seeding system works with both SQLite (development) and MySQL (production) databases.

## Available Commands

```bash
# Run all seeders (preserves existing data)
npm run seed

# Fresh seed - recreates database with sample data
npm run seed:fresh

# Undo all seeders (cleans up data)
npm run seed:undo

```
 d
## What Gets Seeded

The seeding system creates the following data:

### 1. Users (6 users)
- **demo@example.com** - Demo User (Password: `Password123!`)
- **john.doe@example.com** - John Doe (Password: `Password123!`)
- **jane.smith@example.com** - Jane Smith (Password: `Password123!`)
- **alice.johnson@example.com** - Alice Johnson (Password: `Password123!`)
- **bob.wilson@example.com** - Bob Wilson (Password: `Password123!`)
- **carol.brown@example.com** - Carol Brown (Password: `Password123!`)

### 2. Workspaces (4 workspaces)
- **TechCorp Workspace** - Main development workspace
- **Marketing Team** - Marketing campaigns workspace
- **Design Studio** - Creative design workspace
- **Personal Workspace** - Demo user's personal workspace

### 3. Boards (8 boards)
- **Product Development Board** - Main development tracking
- **Q4 Marketing Campaign** - Marketing planning
- **Mobile App MVP** - Mobile development
- **Website Redesign Project** - Design project
- **Team Sprint Planning** - Agile planning
- **Personal Todo Board** - Personal tasks
- **Content Strategy** - Content planning
- **Bug Tracking Board** - Bug management

### 4. Lists (33 lists total)
Each board has appropriate lists like:
- Backlog, In Progress, Code Review, Testing, Done
- Ideas, Planning, In Progress, Review, Published
- User Stories, Development, Testing, Ready for Release
- And more...

### 5. Cards (25+ cards)
Realistic cards with:
- Detailed descriptions
- Due dates
- Priority levels
- Labels
- Assigned creators
- Completion status

### 6. Comments (20+ comments)
- Realistic conversations on cards
- From different users
- Context-appropriate content

### 7. Activities (20+ activities)
- Board creation activities
- Card movements
- Member additions
- Comments
- Updates with timestamps

### 8. Board/Workspace Members
- Proper role assignments (admin, editor, viewer)
- Realistic member distributions
- Invitation tracking

## Login Credentials

All users have the same password: **`Password123!`**

**Recommended test account:**
- Email: `demo@example.com`
- Password: `Password123!`

## How to Use

1. **For fresh development setup:**
   ```bash
   npm run seed:fresh
   ```

2. **To add sample data to existing database:**
   ```bash
   npm run seed
   ```

3. **To clean up all seeded data:**
   ```bash
   npm run seed:undo
   ```

## File Structure

```
backend/
├── seeders/
│   ├── 01-users.js              # User accounts
│   ├── 02-workspaces.js         # Workspaces
│   ├── 03-workspace-members.js  # Workspace memberships
│   ├── 04-boards.js             # Boards
│   ├── 05-board-members.js      # Board memberships
│   ├── 06-lists.js              # Lists in boards
│   ├── 07-cards.js              # Cards in lists
│   ├── 08-comments.js           # Comments on cards
│   ├── 09-activities.js         # Activity logs
│   └── seed-runner.js           # Seeding script
├── src/config/sequelize.js      # Sequelize CLI config
└── .sequelizerc                 # Sequelize configuration
```

## Features

- **Non-breaking**: Safe to run multiple times
- **Realistic data**: Proper relationships and realistic content
- **Comprehensive**: Covers all major entities
- **Development friendly**: Easy setup for new developers
- **Database agnostic**: Works with SQLite and MySQL
- **Error handling**: Graceful error handling and reporting
- **Progress tracking**: Visual feedback during seeding

## Troubleshooting

If seeding fails:

1. **Check database connection**: Ensure your database is running
2. **Try fresh seed**: Use `npm run seed:fresh` to recreate everything
3. **Check logs**: The seeder provides detailed error messages
4. **Clean and retry**: Use `npm run seed:undo` then `npm run seed:fresh`

## Customization

To modify the seed data:

1. Edit the appropriate seeder file in `backend/seeders/`
2. Maintain proper foreign key relationships
3. Use realistic data that makes sense
4. Test with `npm run seed:fresh`

## Production Note

⚠️ **Warning**: Never run seeders in production! These are for development and testing only.

The seeding system automatically detects the environment and uses appropriate database settings.
