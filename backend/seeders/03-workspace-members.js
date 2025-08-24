'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const workspaceMembers = [
      // TechCorp Workspace (id: 1)
      {
        workspace_id: 1,
        user_id: 1, // John (owner)
        role: 'admin',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 1,
        user_id: 2, // Jane
        role: 'member',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 1,
        user_id: 3, // Alice
        role: 'member',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 1,
        user_id: 4, // Bob
        role: 'member',
        status: 'active',
        invited_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Marketing Team (id: 2)
      {
        workspace_id: 2,
        user_id: 2, // Jane (owner)
        role: 'admin',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 2,
        user_id: 1, // John
        role: 'member',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 2,
        user_id: 5, // Carol
        role: 'member',
        status: 'active',
        invited_by: 2,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Design Studio (id: 3)
      {
        workspace_id: 3,
        user_id: 3, // Alice (owner)
        role: 'admin',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 3,
        user_id: 4, // Bob
        role: 'member',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        workspace_id: 3,
        user_id: 5, // Carol
        role: 'member',
        status: 'active',
        invited_by: 3,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Personal Workspace (id: 4)
      {
        workspace_id: 4,
        user_id: 6, // Demo (owner)
        role: 'admin',
        status: 'active',
        invited_by: 6,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('workspace_members', workspaceMembers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('workspace_members', null, {});
  }
};
