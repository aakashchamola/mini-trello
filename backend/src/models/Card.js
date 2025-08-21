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
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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
  listId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lists',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'cards',
  timestamps: true,
  indexes: [
    {
      fields: ['list_id']
    },
    {
      fields: ['list_id', 'position']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['due_date']
    },
    {
      unique: true,
      fields: ['list_id', 'position']
    }
  ]
});

module.exports = Card;
