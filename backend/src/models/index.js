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
    // Force recreation for clean database
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    throw error;
  }
};

module.exports = {
  ...models,
  syncDatabase
};
