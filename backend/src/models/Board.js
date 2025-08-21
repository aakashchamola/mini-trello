const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Board = sequelize.define('Board', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Board title cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Board title must be between 1 and 100 characters'
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
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#0079bf',
    validate: {
      isHexColor(value) {
        if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
          throw new Error('Color must be a valid hex color code');
        }
      }
    }
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'boards',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['title', 'user_id']
    }
  ]
});

module.exports = Board;
