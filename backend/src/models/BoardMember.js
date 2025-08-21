// Board Member model for Mini Trello
// Handles board sharing and member permissions

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BoardMember = sequelize.define('BoardMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer',
    validate: {
      isIn: {
        args: [['admin', 'editor', 'viewer']],
        msg: 'Role must be admin, editor, or viewer'
      }
    }
  },
  invitedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  invitedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'board_members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['board_id', 'user_id']
    },
    {
      fields: ['board_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['invited_by']
    },
    {
      fields: ['status']
    }
  ]
});

// Instance method to check if user can perform action
BoardMember.prototype.canEdit = function() {
  return this.role === 'admin' || this.role === 'editor';
};

BoardMember.prototype.canDelete = function() {
  return this.role === 'admin';
};

BoardMember.prototype.canInvite = function() {
  return this.role === 'admin' || this.role === 'editor';
};

module.exports = BoardMember;
