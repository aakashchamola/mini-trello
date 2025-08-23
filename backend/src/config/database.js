// Database configuration for Mini Trello
// Using Sequelize ORM with SQLite (default) or MySQL (production)

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Determine database type based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const useMySQL = process.env.USE_MYSQL === 'true';

let sequelize;

if (useMySQL) {
  // MySQL configuration for production/docker
  sequelize = new Sequelize(
    process.env.DB_NAME || 'mini_trello',
    process.env.DB_USER || 'trello_user', 
    process.env.DB_PASSWORD || 'trello_password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false, // Only log errors, not all SQL queries
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // SQLite configuration for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false, // Only log errors, not all SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
  // Enable foreign key constraints for SQLite
  sequelize.query('PRAGMA foreign_keys = ON;');
}

// Common options for all models
sequelize.options.define = {
  underscored: true,
  freezeTableName: true,
  timestamps: true
};

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    const dbType = useMySQL ? 'MySQL' : 'SQLite';
    console.log(`Database connection established successfully (${dbType})`);
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
