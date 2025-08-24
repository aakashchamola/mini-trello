'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get future dates for due dates
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    const cards = [
      // Product Development Board cards (lists 1-5)
      {
        title: 'Implement JWT Authentication',
        description: 'Set up JWT-based user authentication with login, logout, and token refresh functionality. Include proper password hashing and security measures.',
        list_id: 1, // Backlog
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['authentication', 'security', 'backend']),
        created_by: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Real-time Collaboration Features',
        description: 'Add Socket.IO-based real-time updates for board collaboration. Users should see live changes when others move cards or add comments.',
        list_id: 1, // Backlog
        position: 2000.00000,
        priority: 'high',
        due_date: nextMonth,
        is_completed: false,
        labels: JSON.stringify(['real-time', 'socket.io', 'collaboration']),
        created_by: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'User Profile Management',
        description: 'Allow users to update their profile information, avatar, and preferences',
        list_id: 2, // In Progress
        position: 1000.00000,
        priority: 'medium',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['profile', 'frontend', 'user-experience']),
        created_by: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Board Templates Feature',
        description: 'Create predefined board templates for common use cases like software development, marketing, personal tasks',
        list_id: 3, // Code Review
        position: 1000.00000,
        priority: 'low',
        due_date: null,
        is_completed: false,
        labels: JSON.stringify(['templates', 'productivity', 'feature']),
        created_by: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'API Documentation',
        description: 'Complete API documentation using Swagger/OpenAPI for all endpoints',
        list_id: 4, // Testing
        position: 1000.00000,
        priority: 'medium',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['documentation', 'api', 'swagger']),
        created_by: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Initial Project Setup',
        description: 'Set up the basic project structure with Express.js, Sequelize, and initial database schema',
        list_id: 5, // Done
        position: 1000.00000,
        priority: 'high',
        due_date: null,
        is_completed: true,
        labels: JSON.stringify(['setup', 'backend', 'database']),
        created_by: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },

      // Q4 Marketing Campaign cards (lists 6-10)
      {
        title: 'Holiday Season Campaign Strategy',
        description: 'Develop comprehensive strategy for holiday season marketing including Black Friday and Christmas campaigns',
        list_id: 6, // Ideas
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['strategy', 'holiday', 'campaign']),
        created_by: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Social Media Content Calendar',
        description: 'Create content calendar for Q4 social media posts across all platforms',
        list_id: 7, // Planning
        position: 1000.00000,
        priority: 'medium',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['social-media', 'content', 'planning']),
        created_by: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Email Newsletter Design',
        description: 'Design and develop email newsletter templates for holiday promotions',
        list_id: 8, // In Progress
        position: 1000.00000,
        priority: 'medium',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['email', 'design', 'newsletter']),
        created_by: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Influencer Partnership Program',
        description: 'Research and reach out to potential influencers for holiday campaign partnerships',
        list_id: 9, // Review
        position: 1000.00000,
        priority: 'low',
        due_date: nextMonth,
        is_completed: false,
        labels: JSON.stringify(['influencer', 'partnership', 'outreach']),
        created_by: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },

      // Mobile App MVP cards (lists 11-14)
      {
        title: 'User Authentication Flow',
        description: 'Design and implement user registration, login, and password reset functionality for mobile app',
        list_id: 11, // User Stories
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['mobile', 'authentication', 'mvp']),
        created_by: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Board View Interface',
        description: 'Create mobile-optimized board view with touch-friendly drag and drop functionality',
        list_id: 12, // Development
        position: 1000.00000,
        priority: 'high',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['mobile', 'ui', 'boards']),
        created_by: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Offline Mode Support',
        description: 'Implement offline functionality to allow users to work without internet connection',
        list_id: 13, // Testing
        position: 1000.00000,
        priority: 'medium',
        due_date: nextMonth,
        is_completed: false,
        labels: JSON.stringify(['mobile', 'offline', 'sync']),
        created_by: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },

      // Website Redesign Project cards (lists 15-18)
      {
        title: 'User Research & Analysis',
        description: 'Conduct user interviews and analyze current website usage patterns',
        list_id: 15, // Research
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['research', 'ux', 'analysis']),
        created_by: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'New Homepage Design',
        description: 'Create modern, responsive homepage design with improved user experience',
        list_id: 16, // Design
        position: 1000.00000,
        priority: 'high',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['design', 'homepage', 'responsive']),
        created_by: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize website performance for faster loading times and better SEO',
        list_id: 17, // Development
        position: 1000.00000,
        priority: 'medium',
        due_date: nextMonth,
        is_completed: false,
        labels: JSON.stringify(['performance', 'seo', 'optimization']),
        created_by: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },

      // Team Sprint Planning cards (lists 19-22)
      {
        title: 'Sprint Planning Meeting',
        description: 'Plan upcoming sprint goals, story points, and task assignments',
        list_id: 19, // Sprint Backlog
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['planning', 'meeting', 'sprint']),
        created_by: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Code Review Guidelines',
        description: 'Establish team code review guidelines and best practices',
        list_id: 20, // In Progress
        position: 1000.00000,
        priority: 'medium',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['code-review', 'guidelines', 'team']),
        created_by: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Testing Strategy Document',
        description: 'Document comprehensive testing strategy including unit, integration, and e2e tests',
        list_id: 21, // In Review
        position: 1000.00000,
        priority: 'medium',
        due_date: nextMonth,
        is_completed: false,
        labels: JSON.stringify(['testing', 'strategy', 'documentation']),
        created_by: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },

      // Personal Todo Board cards (lists 23-25)
      {
        title: 'Learn React Native',
        description: 'Complete online course on React Native development for mobile apps',
        list_id: 23, // To Do
        position: 1000.00000,
        priority: 'medium',
        due_date: nextMonth,
        is_completed: false,
        labels: JSON.stringify(['learning', 'react-native', 'mobile']),
        created_by: 6, // Demo
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Update Portfolio Website',
        description: 'Add recent projects and update design of personal portfolio',
        list_id: 24, // In Progress
        position: 1000.00000,
        priority: 'low',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['portfolio', 'personal', 'design']),
        created_by: 6, // Demo
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Set up Development Environment',
        description: 'Install and configure development tools and IDE settings',
        list_id: 25, // Done
        position: 1000.00000,
        priority: 'high',
        due_date: null,
        is_completed: true,
        labels: JSON.stringify(['setup', 'environment', 'tools']),
        created_by: 6, // Demo
        created_at: new Date(),
        updated_at: new Date()
      },

      // Content Strategy cards (lists 26-30)
      {
        title: 'Blog Post: Best Practices for Remote Work',
        description: 'Write comprehensive guide on effective remote work strategies and tools',
        list_id: 26, // Content Ideas
        position: 1000.00000,
        priority: 'medium',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['blog', 'remote-work', 'guide']),
        created_by: 2, // Jane
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Video Tutorial Series',
        description: 'Create video tutorials for new users showing how to use the platform',
        list_id: 27, // Writing
        position: 1000.00000,
        priority: 'high',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['video', 'tutorial', 'onboarding']),
        created_by: 5, // Carol
        created_at: new Date(),
        updated_at: new Date()
      },

      // Bug Tracking Board cards (lists 31-35)
      {
        title: 'Card drag and drop not working on mobile',
        description: 'Users report that drag and drop functionality is not working properly on mobile devices',
        list_id: 31, // Reported
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['bug', 'mobile', 'drag-drop']),
        created_by: 1, // John
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Email notifications not sending',
        description: 'Some users are not receiving email notifications for board activities',
        list_id: 32, // Triaged
        position: 1000.00000,
        priority: 'medium',
        due_date: twoWeeks,
        is_completed: false,
        labels: JSON.stringify(['bug', 'email', 'notifications']),
        created_by: 3, // Alice
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Memory leak in real-time updates',
        description: 'Browser memory usage increases over time when board is open for extended periods',
        list_id: 33, // In Progress
        position: 1000.00000,
        priority: 'high',
        due_date: nextWeek,
        is_completed: false,
        labels: JSON.stringify(['bug', 'memory-leak', 'performance']),
        created_by: 4, // Bob
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('cards', cards, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cards', null, {});
  }
};
