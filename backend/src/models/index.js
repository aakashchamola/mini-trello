// Models index file
// Centralizes all model imports and database synchronization

const { sequelize } = require('../config/database');
const User = require('./User');
const Board = require('./Board');
const List = require('./List');
const Card = require('./Card');
const BoardMember = require('./BoardMember');
const Comment = require('./Comment');
const Workspace = require('./Workspace');
const WorkspaceMember = require('./WorkspaceMember');
const Activity = require('./Activity');

// Define model associations
User.hasMany(Board, {
  foreignKey: 'userId',
  as: 'boards',
  onDelete: 'CASCADE'
});

Board.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner'
});

Board.hasMany(List, {
  foreignKey: 'boardId',
  as: 'lists',
  onDelete: 'CASCADE'
});

List.belongsTo(Board, {
  foreignKey: 'boardId',
  as: 'board'
});

List.hasMany(Card, {
  foreignKey: 'listId',
  as: 'cards',
  onDelete: 'CASCADE'
});

Card.belongsTo(List, {
  foreignKey: 'listId',
  as: 'list'
});

User.hasMany(Card, {
  foreignKey: 'createdBy',
  as: 'createdCards',
  onDelete: 'CASCADE'
});

Card.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Board Member associations
Board.hasMany(BoardMember, {
  foreignKey: 'boardId',
  as: 'members',
  onDelete: 'CASCADE'
});

BoardMember.belongsTo(Board, {
  foreignKey: 'boardId',
  as: 'board'
});

User.hasMany(BoardMember, {
  foreignKey: 'userId',
  as: 'boardMemberships',
  onDelete: 'CASCADE'
});

BoardMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(BoardMember, {
  foreignKey: 'invitedBy',
  as: 'sentInvitations',
  onDelete: 'CASCADE'
});

BoardMember.belongsTo(User, {
  foreignKey: 'invitedBy',
  as: 'inviter'
});

// Comment associations
Card.hasMany(Comment, {
  foreignKey: 'cardId',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(Card, {
  foreignKey: 'cardId',
  as: 'card'
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
});

// Workspace associations
User.hasMany(Workspace, {
  foreignKey: 'ownerId',
  as: 'ownedWorkspaces',
  onDelete: 'CASCADE'
});

Workspace.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

Workspace.hasMany(Board, {
  foreignKey: 'workspaceId',
  as: 'boards',
  onDelete: 'CASCADE'
});

Board.belongsTo(Workspace, {
  foreignKey: 'workspaceId',
  as: 'workspace'
});

// Workspace member associations
Workspace.hasMany(WorkspaceMember, {
  foreignKey: 'workspaceId',
  as: 'members',
  onDelete: 'CASCADE'
});

WorkspaceMember.belongsTo(Workspace, {
  foreignKey: 'workspaceId',
  as: 'workspace'
});

User.hasMany(WorkspaceMember, {
  foreignKey: 'userId',
  as: 'workspaceMemberships',
  onDelete: 'CASCADE'
});

WorkspaceMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(WorkspaceMember, {
  foreignKey: 'invitedBy',
  as: 'sentWorkspaceInvitations',
  onDelete: 'CASCADE'
});

WorkspaceMember.belongsTo(User, {
  foreignKey: 'invitedBy',
  as: 'inviter'
});

// Activity associations
Board.hasMany(Activity, {
  foreignKey: 'boardId',
  as: 'activities',
  onDelete: 'CASCADE'
});

Activity.belongsTo(Board, {
  foreignKey: 'boardId',
  as: 'board'
});

User.hasMany(Activity, {
  foreignKey: 'userId',
  as: 'activities',
  onDelete: 'CASCADE'
});

Activity.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Initialize all models
const models = {
  User,
  Board,
  List,
  Card,
  BoardMember,
  Comment,
  Workspace,
  WorkspaceMember,
  Activity,
  sequelize
};

// Sync database tables
const syncDatabase = async (force = false) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if we're using SQLite and if the database file is very small or doesn't exist
    const useMySQL = process.env.USE_MYSQL === 'true';
    let shouldForceSync = force;
    
    if (!useMySQL) {
      const dbPath = path.join(__dirname, '../../database.sqlite');
      const dbExists = fs.existsSync(dbPath);
      
      if (!dbExists) {
        console.log('SQLite database file not found, creating new database...');
        shouldForceSync = true;
      } else {
        const stats = fs.statSync(dbPath);
        // If the SQLite file is very small (less than 10KB), it's likely empty or corrupted
        if (stats.size < 10240) {
          console.log('SQLite database appears to be empty or corrupted, recreating...');
          shouldForceSync = true;
        }
      }
    }
    
    if (shouldForceSync) {
      console.log('Performing full database sync (creating/recreating tables)...');
      await sequelize.sync({ force: true });
    } else {
      console.log('Performing safe database sync (preserving existing data)...');
      await sequelize.sync({ alter: true });
    }
    
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    
    // Only use force sync as a fallback for very specific errors and when database is new/empty
    if (!force && process.env.USE_MYSQL !== 'true') {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../../database.sqlite');
      
      // Check if database is empty or very small (likely no important data)
      let isEmptyDb = false;
      try {
        if (fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          isEmptyDb = stats.size < 10240; // Less than 10KB
        } else {
          isEmptyDb = true; // No database file
        }
      } catch (fileError) {
        console.error('Error checking database file:', fileError);
      }
      
      // Only force sync if database appears to be empty AND it's a schema-related error
      const isSchemaError = error.name === 'SequelizeUniqueConstraintError' || 
                           error.name === 'SequelizeDatabaseError' ||
                           error.message.includes('no such table') ||
                           error.message.includes('table already exists');
      
      if (isEmptyDb && isSchemaError) {
        console.log('Empty database with schema error detected, attempting force sync...');
        try {
          await sequelize.sync({ force: true });
          console.log('Database force sync completed successfully');
        } catch (forceError) {
          console.error('Force sync also failed:', forceError);
          throw forceError;
        }
      } else {
        console.log('Database contains data or error is not schema-related, preserving data...');
        console.log('Continuing with existing database state...');
        
        // Try a basic sync without alter to just connect
        try {
          await sequelize.sync({ alter: false });
          console.log('Database connection established with existing schema');
        } catch (basicSyncError) {
          console.error('Basic sync also failed:', basicSyncError);
          throw error; // Throw original error
        }
      }
    } else {
      throw error;
    }
  }
};

module.exports = {
  ...models,
  syncDatabase
};
