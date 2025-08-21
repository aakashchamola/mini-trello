const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkspaceMember = sequelize.define('WorkspaceMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workspaces',
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
    type: DataTypes.ENUM('admin', 'member'),
    allowNull: false,
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  },
  invitedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'workspace_members',
  timestamps: true,
  indexes: [
    {
      fields: ['workspace_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['workspace_id', 'user_id'],
      unique: true
    },
    {
      fields: ['invited_by']
    }
  ]
});

module.exports = WorkspaceMember;
