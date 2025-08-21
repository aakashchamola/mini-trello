const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workspace = sequelize.define('Workspace', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Workspace name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Workspace name must be between 1 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'workspaces',
  timestamps: true,
  indexes: [
    {
      fields: ['owner_id']
    },
    {
      fields: ['name']
    }
  ]
});

module.exports = Workspace;
