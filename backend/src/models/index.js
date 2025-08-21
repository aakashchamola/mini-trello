// Models index file
// Centralizes all model imports and database synchronization

const { sequelize } = require('../config/database');
const User = require('./User');

// Initialize all models
const models = {
  User,
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
