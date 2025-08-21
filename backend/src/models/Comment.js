const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Comment content cannot be empty'
      },
      len: {
        args: [1, 1000],
        msg: 'Comment must be between 1 and 1000 characters'
      }
    }
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cards',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  tableName: 'comments',
  timestamps: true,
  indexes: [
    {
      fields: ['card_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['card_id', 'created_at']
    }
  ]
});

module.exports = Comment;
