'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const comments = [
      // Comments on Product Development Board cards (Card IDs 1-6)
      {
        content: 'I can help with the JWT implementation. We should use refresh tokens for better security.',
        card_id: 1, // JWT Authentication
        user_id: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Good point! Let\'s also implement rate limiting for login attempts.',
        card_id: 1, // JWT Authentication
        user_id: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'For real-time features, we should consider using rooms to optimize performance.',
        card_id: 2, // Real-time Collaboration
        user_id: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'The profile form is looking good! Just need to add avatar upload functionality.',
        card_id: 3, // User Profile Management
        user_id: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Should we include file upload limits? Maybe 5MB max for avatars?',
        card_id: 3, // User Profile Management
        user_id: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on Marketing Campaign cards (Card IDs 7-10)
      {
        content: 'Great strategy! We should also consider TikTok for younger demographics.',
        card_id: 7, // Holiday Season Campaign Strategy
        user_id: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'The content calendar looks comprehensive. Should we add video content slots?',
        card_id: 8, // Social Media Content Calendar
        user_id: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Newsletter design is coming along nicely. The holiday theme works well.',
        card_id: 9, // Email Newsletter Design
        user_id: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on Mobile App MVP cards (Card IDs 11-13)
      {
        content: 'The authentication flow wireframes look intuitive. Users should find it easy to navigate.',
        card_id: 11, // User Authentication Flow
        user_id: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'For the board view, we might need to adjust the card size for better touch targets.',
        card_id: 12, // Board View Interface
        user_id: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Offline mode is crucial for mobile users. Let\'s prioritize sync conflict resolution.',
        card_id: 13, // Offline Mode Support
        user_id: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on Website Redesign cards (Card IDs 14-16)
      {
        content: 'The user interviews revealed some interesting insights about navigation preferences.',
        card_id: 14, // User Research & Analysis
        user_id: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Love the new homepage design! The hero section is much more engaging.',
        card_id: 15, // New Homepage Design
        user_id: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on Team Sprint Planning cards (Card IDs 17-19)
      {
        content: 'Sprint planning went well. Team velocity is improving consistently.',
        card_id: 17, // Sprint Planning Meeting
        user_id: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'The code review guidelines document is very thorough. This will help maintain quality.',
        card_id: 18, // Code Review Guidelines
        user_id: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Should we include performance testing in our strategy as well?',
        card_id: 19, // Testing Strategy Document
        user_id: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on Personal Todo Board cards (Card IDs 20-22)
      {
        content: 'React Native course from Meta is really good. Highly recommend it!',
        card_id: 20, // Learn React Native
        user_id: 6, // Demo (self-comment)
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Portfolio is looking great so far. The new projects section is impressive!',
        card_id: 21, // Update Portfolio Website
        user_id: 6, // Demo (self-comment)
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on Content Strategy cards (Card IDs 23-24)
      {
        content: 'This blog post idea is perfect timing with the remote work trends.',
        card_id: 23, // Blog Post: Best Practices for Remote Work
        user_id: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Video tutorials will be great for user onboarding. Should we include captions?',
        card_id: 24, // Video Tutorial Series
        user_id: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },

      // Comments on the last Bug Tracking card (Card ID 25)
      {
        content: 'I found the source of the memory leak. It\'s in the socket event listeners. Working on a fix.',
        card_id: 25, // Memory leak in real-time updates
        user_id: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        content: 'Good catch! Make sure to also remove event listeners when components unmount.',
        card_id: 25, // Memory leak in real-time updates
        user_id: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('comments', comments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  }
};
