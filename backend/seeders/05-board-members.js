'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const boardMembers = [
      // Product Development Board (id: 1)
      {
        board_id: 1,
        user_id: 1, // John (owner)
        role: 'admin',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 1,
        user_id: 2, // Jane
        role: 'editor',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 1,
        user_id: 3, // Alice
        role: 'editor',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 1,
        user_id: 4, // Bob
        role: 'viewer',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Q4 Marketing Campaign (id: 2)
      {
        board_id: 2,
        user_id: 2, // Jane (owner)
        role: 'admin',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 2,
        user_id: 1, // John
        role: 'editor',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 2,
        user_id: 5, // Carol
        role: 'editor',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Mobile App MVP (id: 3)
      {
        board_id: 3,
        user_id: 3, // Alice (owner)
        role: 'admin',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 3,
        user_id: 4, // Bob
        role: 'editor',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 3,
        user_id: 5, // Carol
        role: 'editor',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 3,
        user_id: 1, // John
        role: 'viewer',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Website Redesign Project (id: 4)
      {
        board_id: 4,
        user_id: 3, // Alice (owner)
        role: 'admin',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 4,
        user_id: 4, // Bob
        role: 'editor',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 4,
        user_id: 5, // Carol
        role: 'editor',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Team Sprint Planning (id: 5)
      {
        board_id: 5,
        user_id: 4, // Bob (owner)
        role: 'admin',
        status: 'active',
        invited_by: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 5,
        user_id: 1, // John
        role: 'editor',
        status: 'active',
        invited_by: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 5,
        user_id: 2, // Jane
        role: 'editor',
        status: 'active',
        invited_by: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 5,
        user_id: 3, // Alice
        role: 'editor',
        status: 'active',
        invited_by: 4,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Personal Todo Board (id: 6) - only owner
      {
        board_id: 6,
        user_id: 6, // Demo (owner)
        role: 'admin',
        status: 'active',
        invited_by: 6,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Content Strategy (id: 7)
      {
        board_id: 7,
        user_id: 2, // Jane (owner)
        role: 'admin',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 7,
        user_id: 5, // Carol
        role: 'editor',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Bug Tracking Board (id: 8)
      {
        board_id: 8,
        user_id: 1, // John (owner)
        role: 'admin',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 8,
        user_id: 3, // Alice
        role: 'editor',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        board_id: 8,
        user_id: 4, // Bob
        role: 'editor',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('board_members', boardMembers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('board_members', null, {});
  }
};
