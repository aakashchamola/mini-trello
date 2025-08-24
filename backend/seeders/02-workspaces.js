'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const workspaces = [
      {
        name: 'TechCorp Workspace',
        description: 'Main workspace for TechCorp development team',
        owner_id: 1, // John Doe
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Marketing Team',
        description: 'Workspace for marketing campaigns and content planning',
        owner_id: 2, // Jane Smith
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Design Studio',
        description: 'Creative workspace for design projects',
        owner_id: 3, // Alice Johnson
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Personal Workspace',
        description: 'Personal workspace for individual projects',
        owner_id: 6, // Demo User
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('workspaces', workspaces, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workspaces', null, {});
  }
};
