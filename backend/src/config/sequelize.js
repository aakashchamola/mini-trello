// Sequelize CLI configuration
// This configuration is used by sequelize-cli for migrations and seeders

const { sequelize } = require('./database');

module.exports = {
  development: {
    dialect: process.env.USE_MYSQL === 'true' ? 'mysql' : 'sqlite',
    storage: process.env.USE_MYSQL === 'true' ? undefined : './database.sqlite',
    host: process.env.USE_MYSQL === 'true' ? (process.env.DB_HOST || 'localhost') : undefined,
    port: process.env.USE_MYSQL === 'true' ? (process.env.DB_PORT || 3306) : undefined,
    database: process.env.USE_MYSQL === 'true' ? (process.env.DB_NAME || 'mini_trello') : undefined,
    username: process.env.USE_MYSQL === 'true' ? (process.env.DB_USER || 'trello_user') : undefined,
    password: process.env.USE_MYSQL === 'true' ? (process.env.DB_PASSWORD || 'trello_password') : undefined,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
