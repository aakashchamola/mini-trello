'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash for password 'Password123!'
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    
    const users = [
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=0079bf&color=fff',
        email_verified: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: hashedPassword,
        first_name: 'Jane',
        last_name: 'Smith',
        avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=eb5a46&color=fff',
        email_verified: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'alice.johnson@example.com',
        username: 'alicejohnson',
        password: hashedPassword,
        first_name: 'Alice',
        last_name: 'Johnson',
        avatar_url: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=c377e0&color=fff',
        email_verified: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'bob.wilson@example.com',
        username: 'bobwilson',
        password: hashedPassword,
        first_name: 'Bob',
        last_name: 'Wilson',
        avatar_url: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=026aa7&color=fff',
        email_verified: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'carol.brown@example.com',
        username: 'carolbrown',
        password: hashedPassword,
        first_name: 'Carol',
        last_name: 'Brown',
        avatar_url: 'https://ui-avatars.com/api/?name=Carol+Brown&background=f2d600&color=fff',
        email_verified: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'demo@example.com',
        username: 'demo',
        password: hashedPassword,
        first_name: 'Demo',
        last_name: 'User',
        avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=61bd4f&color=fff',
        email_verified: true,
        provider: 'local',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
