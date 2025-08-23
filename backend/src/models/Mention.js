const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mention = sequelize.define('Mention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  mentionedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  mentionedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'boards',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'mentions',








  
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['comment_id']
    },
    {
      fields: ['mentioned_user_id']
    },
    {
      fields: ['card_id']
    },
    {
      fields: ['board_id']
    },
    {
      fields: ['mentioned_user_id', 'is_read']
    },
    {
      fields: ['card_id', 'mentioned_user_id', 'is_read']
    }
  ]
});

module.exports = Mention;
