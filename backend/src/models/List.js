const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const List = sequelize.define('List', {
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
        msg: 'List title cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'List title must be between 1 and 100 characters'
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
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'board_id', // Map to correct database column
    references: {
      model: 'boards',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'lists',
  timestamps: true,
  underscored: true, // This ensures Sequelize uses snake_case for field names
  indexes: [
    {
      name: 'lists_board_id_index',
      fields: ['board_id']
    },
    {
      name: 'lists_board_id_position_unique',
      unique: true,
      fields: ['board_id', 'position']
    }
  ]
});

module.exports = List;
