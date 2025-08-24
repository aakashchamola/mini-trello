'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const lists = [
      // Product Development Board (id: 1)
      {
        title: 'Backlog',
        board_id: 1,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'In Progress',
        board_id: 1,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Code Review',
        board_id: 1,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Testing',
        board_id: 1,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Done',
        board_id: 1,
        position: 5000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Q4 Marketing Campaign (id: 2)
      {
        title: 'Ideas',
        board_id: 2,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Planning',
        board_id: 2,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'In Progress',
        board_id: 2,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Review',
        board_id: 2,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Published',
        board_id: 2,
        position: 5000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Mobile App MVP (id: 3)
      {
        title: 'User Stories',
        board_id: 3,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Development',
        board_id: 3,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Testing',
        board_id: 3,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Ready for Release',
        board_id: 3,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Website Redesign Project (id: 4)
      {
        title: 'Research',
        board_id: 4,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Design',
        board_id: 4,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Development',
        board_id: 4,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Review',
        board_id: 4,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Team Sprint Planning (id: 5)
      {
        title: 'Sprint Backlog',
        board_id: 5,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'In Progress',
        board_id: 5,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'In Review',
        board_id: 5,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Done',
        board_id: 5,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Personal Todo Board (id: 6)
      {
        title: 'To Do',
        board_id: 6,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'In Progress',
        board_id: 6,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Done',
        board_id: 6,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Content Strategy (id: 7)
      {
        title: 'Content Ideas',
        board_id: 7,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Writing',
        board_id: 7,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Review & Edit',
        board_id: 7,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Scheduled',
        board_id: 7,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Published',
        board_id: 7,
        position: 5000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Bug Tracking Board (id: 8)
      {
        title: 'Reported',
        board_id: 8,
        position: 1000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Triaged',
        board_id: 8,
        position: 2000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'In Progress',
        board_id: 8,
        position: 3000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Fixed',
        board_id: 8,
        position: 4000.00000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Closed',
        board_id: 8,
        position: 5000.00000,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('lists', lists, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lists', null, {});
  }
};
