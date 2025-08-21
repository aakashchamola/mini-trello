// Models index file
// Centralizes all model imports and database synchronization

const { sequelize } = require('../config/database');
const User = require('./User');
const Board = require('./Board');
const List = require('./List');

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

// Initialize all models
const models = {
  User,
  Board,
  List,
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
