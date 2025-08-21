// Models index file
// Centralizes all model imports and database synchronization

const { sequelize } = require('../config/database');
const User = require('./User');
const Board = require('./Board');
const List = require('./List');
const Card = require('./Card');

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

// Initialize all models
const models = {
  User,
  Board,
  List,
  Card,
  sequelize
};

// Sync database tables
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
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
