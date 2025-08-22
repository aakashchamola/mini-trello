const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Card = sequelize.define('Card', {
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
        msg: 'Card title cannot be empty'
      },
      len: {
        args: [1, 255],
        msg: 'Card title must be between 1 and 255 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'Description cannot exceed 2000 characters'
      }
    }
  },
  position: {
    type: DataTypes.DECIMAL(15, 5), // Use decimal for fractional positioning
    allowNull: false,
    defaultValue: 65536.00000,
    validate: {
      min: {
        args: [0],
        msg: 'Position must be a non-negative number'
      }
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Due date must be a valid date'
      },
      isAfterToday(value) {
        if (value && new Date(value) < new Date()) {
          throw new Error('Due date must be in the future');
        }
      }
    }
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  labels: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidLabels(value) {
        if (value && Array.isArray(value)) {
          for (const label of value) {
            if (typeof label !== 'string' || label.length > 50) {
              throw new Error('Each label must be a string with max 50 characters');
            }
          }
          if (value.length > 10) {
            throw new Error('Maximum 10 labels allowed per card');
          }
        }
      }
    }
  },
  assignees: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidAssignees(value) {
        if (value && Array.isArray(value)) {
          for (const assigneeId of value) {
            if (!Number.isInteger(assigneeId) || assigneeId <= 0) {
              throw new Error('Each assignee must be a valid user ID');
            }
          }
          if (value.length > 10) {
            throw new Error('Maximum 10 assignees allowed per card');
          }
        }
      }
    }
  },
  listId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'list_id', // Map to correct database column
    references: {
      model: 'lists',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by', // Map to correct database column
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'cards',
  timestamps: true,
  underscored: true, // This ensures Sequelize uses snake_case for field names
  indexes: [
    {
      name: 'cards_list_id_index',
      fields: ['list_id']
    },
    {
      name: 'cards_created_by_index',
      fields: ['created_by']
    },
    {
      name: 'cards_priority_index',
      fields: ['priority']
    },
    {
      name: 'cards_due_date_index',
      fields: ['due_date']
    },
    {
      name: 'cards_list_id_position_unique',
      unique: true,
      fields: ['list_id', 'position']
    }
  ]
});

module.exports = Card;
