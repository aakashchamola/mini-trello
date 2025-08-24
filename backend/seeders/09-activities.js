'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const activities = [
      // Board creation activities
      {
        action_type: 'created',
        entity_type: 'board',
        entity_id: 1,
        description: 'created this board',
        board_id: 1,
        user_id: 1, // John
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'created',
        entity_type: 'board',
        entity_id: 2,
        description: 'created this board',
        board_id: 2,
        user_id: 2, // Jane
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'created',
        entity_type: 'board',
        entity_id: 3,
        description: 'created this board',
        board_id: 3,
        user_id: 3, // Alice
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },

      // List creation activities
      {
        action_type: 'created',
        entity_type: 'list',
        entity_id: 1,
        description: 'added "Backlog" to Product Development Board',
        board_id: 1,
        user_id: 1, // John
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'created',
        entity_type: 'list',
        entity_id: 2,
        description: 'added "In Progress" to Product Development Board',
        board_id: 1,
        user_id: 1, // John
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },

      // Card creation activities
      {
        action_type: 'created',
        entity_type: 'card',
        entity_id: 1,
        description: 'added "Implement JWT Authentication" to Backlog',
        board_id: 1,
        user_id: 1, // John
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'created',
        entity_type: 'card',
        entity_id: 2,
        description: 'added "Real-time Collaboration Features" to Backlog',
        board_id: 1,
        user_id: 1, // John
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'created',
        entity_type: 'card',
        entity_id: 3,
        description: 'added "User Profile Management" to In Progress',
        board_id: 1,
        user_id: 2, // Jane
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },

      // Card movement activities
      {
        action_type: 'moved',
        entity_type: 'card',
        entity_id: 4,
        description: 'moved "Board Templates Feature" from Backlog to Code Review',
        board_id: 1,
        user_id: 3, // Alice
        old_value: JSON.stringify({
          from_list: 'Backlog',
          from_list_id: 1
        }),
        new_value: JSON.stringify({
          to_list: 'Code Review',
          to_list_id: 3
        }),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'moved',
        entity_type: 'card',
        entity_id: 5,
        description: 'moved "API Documentation" from Code Review to Testing',
        board_id: 1,
        user_id: 4, // Bob
        old_value: JSON.stringify({
          from_list: 'Code Review',
          from_list_id: 3
        }),
        new_value: JSON.stringify({
          to_list: 'Testing',
          to_list_id: 4
        }),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'moved',
        entity_type: 'card',
        entity_id: 6,
        description: 'moved "Initial Project Setup" from Testing to Done',
        board_id: 1,
        user_id: 1, // John
        old_value: JSON.stringify({
          from_list: 'Testing',
          from_list_id: 4
        }),
        new_value: JSON.stringify({
          to_list: 'Done',
          to_list_id: 5
        }),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },

      // Member addition activities
      {
        action_type: 'invited',
        entity_type: 'member',
        entity_id: 2,
        description: 'added Jane Smith to Product Development Board',
        board_id: 1,
        user_id: 1, // John (who added)
        new_value: JSON.stringify({
          added_member: 'Jane Smith',
          added_member_id: 2,
          role: 'editor'
        }),
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'invited',
        entity_type: 'member',
        entity_id: 3,
        description: 'added Alice Johnson to Product Development Board',
        board_id: 1,
        user_id: 1, // John (who added)
        new_value: JSON.stringify({
          added_member: 'Alice Johnson',
          added_member_id: 3,
          role: 'editor'
        }),
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },

      // Comment activities
      {
        action_type: 'commented',
        entity_type: 'card',
        entity_id: 1,
        description: 'commented on "Implement JWT Authentication"',
        board_id: 1,
        user_id: 2, // Jane
        new_value: JSON.stringify({
          comment: 'I can help with the JWT implementation. We should use refresh tokens for better security.'
        }),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'commented',
        entity_type: 'card',
        entity_id: 2,
        description: 'commented on "Real-time Collaboration Features"',
        board_id: 1,
        user_id: 3, // Alice
        new_value: JSON.stringify({
          comment: 'For real-time features, we should consider using rooms to optimize performance.'
        }),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },

      // Marketing board activities
      {
        action_type: 'created',
        entity_type: 'card',
        entity_id: 7,
        description: 'added "Holiday Season Campaign Strategy" to Ideas',
        board_id: 2,
        user_id: 2, // Jane
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'moved',
        entity_type: 'card',
        entity_id: 8,
        description: 'moved "Social Media Content Calendar" from Ideas to Planning',
        board_id: 2,
        user_id: 5, // Carol
        old_value: JSON.stringify({
          from_list: 'Ideas',
          from_list_id: 6
        }),
        new_value: JSON.stringify({
          to_list: 'Planning',
          to_list_id: 7
        }),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },

      // Bug tracking activities
      {
        action_type: 'created',
        entity_type: 'card',
        entity_id: 23,
        description: 'reported "Card drag and drop not working on mobile"',
        board_id: 8,
        user_id: 1, // John
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        action_type: 'moved',
        entity_type: 'card',
        entity_id: 25,
        description: 'moved "Memory leak in real-time updates" from Triaged to In Progress',
        board_id: 8,
        user_id: 4, // Bob
        old_value: JSON.stringify({
          from_list: 'Triaged',
          from_list_id: 32
        }),
        new_value: JSON.stringify({
          to_list: 'In Progress',
          to_list_id: 33
        }),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },

      // Recent activities (last few hours)
      {
        action_type: 'updated',
        entity_type: 'card',
        entity_id: 3,
        description: 'updated due date for "User Profile Management"',
        board_id: 1,
        user_id: 2, // Jane
        old_value: null,
        new_value: JSON.stringify({
          field: 'due_date',
          value: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }),
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        action_type: 'commented',
        entity_type: 'card',
        entity_id: 25,
        description: 'commented on "Memory leak in real-time updates"',
        board_id: 8,
        user_id: 4, // Bob
        new_value: JSON.stringify({
          comment: 'I found the source of the memory leak. It\'s in the socket event listeners. Working on a fix.'
        }),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        action_type: 'updated',
        entity_type: 'card',
        entity_id: 7,
        description: 'added labels to "Holiday Season Campaign Strategy"',
        board_id: 2,
        user_id: 2, // Jane
        old_value: JSON.stringify([]),
        new_value: JSON.stringify(['strategy', 'holiday', 'campaign']),
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('activities', activities, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('activities', null, {});
  }
};
