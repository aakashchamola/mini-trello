const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
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
  actionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'action_type', // Map to correct database column
    validate: {
      isIn: {
        args: [['created', 'updated', 'deleted', 'moved', 'archived', 'commented', 'assigned', 'invited', 'joined', 'left']],
        msg: 'Invalid action type'
      }
    }
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: {
        args: [['board', 'list', 'card', 'comment', 'member']],
        msg: 'Invalid entity type'
      }
    }
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  oldValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newValue: {
    type: DataTypes.JSON,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'activities',
  timestamps: true,
  underscored: true, // Add this to ensure snake_case columns
  indexes: [
    {
      fields: ['board_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['board_id', 'created_at']
    },
    {
      fields: ['entity_type', 'entity_id']
    },
    {
      fields: ['action_type']
    }
  ]
});

module.exports = Activity;
