'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const boards = [
      {
        title: 'Product Development Board',
        description: 'Main product development board for tracking features, bugs, and improvements',
        color: '#0079bf',
        visibility: 'workspace',
        workspace_id: 1, // TechCorp Workspace
        user_id: 1, // John Doe
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Q4 Marketing Campaign',
        description: 'Planning and execution of Q4 marketing initiatives',
        color: '#eb5a46',
        visibility: 'workspace',
        workspace_id: 2, // Marketing Team
        user_id: 2, // Jane Smith
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Mobile App MVP',
        description: 'Development roadmap for mobile application minimum viable product',
        color: '#026aa7',
        visibility: 'workspace',
        workspace_id: 1, // TechCorp Workspace
        user_id: 3, // Alice Johnson
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Website Redesign Project',
        description: 'Complete redesign of company website with modern UI/UX',
        color: '#61bd4f',
        visibility: 'workspace',
        workspace_id: 3, // Design Studio
        user_id: 3, // Alice Johnson
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Team Sprint Planning',
        description: 'Agile sprint planning and task management for development team',
        color: '#ff6900',
        visibility: 'workspace',
        workspace_id: 1, // TechCorp Workspace
        user_id: 4, // Bob Wilson
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Personal Todo Board',
        description: 'Personal task management and goal tracking',
        color: '#c377e0',
        visibility: 'private',
        workspace_id: null, // Personal board
        user_id: 6, // Demo User
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Content Strategy',
        description: 'Content planning, creation, and publishing schedule',
        color: '#f2d600',
        visibility: 'workspace',
        workspace_id: 2, // Marketing Team
        user_id: 2, // Jane Smith
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Bug Tracking Board',
        description: 'Track and resolve bugs and technical issues',
        color: '#eb5a46',
        visibility: 'workspace',
        workspace_id: 1, // TechCorp Workspace
        user_id: 1, // John Doe
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('boards', boards, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('boards', null, {});
  }
};
