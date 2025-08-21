#!/usr/bin/env node

/**
 * Mini Trello API Test Suite
 * 
 * This script tests all API endpoints for the Mini Trello backend.
 * Run with: node test-api.js
 * 
 * Features tested:
 * - Authentication (register, login, profile)
 * - Workspace Management (CRUD, member management)
 * - Board Management (CRUD, shared boards, workspace integration)
 * - Board Collaboration (invite, members, permissions)
 * - List Management (CRUD, reordering)
 * - Card Management (CRUD, move between lists, filters, search)
 * - Comment Management (CRUD, permissions, validation)
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TIMESTAMP = Date.now();
const TEST_CONFIG = {
  users: [
    {
      username: `testuser1${TIMESTAMP}`,
      email: `test1${TIMESTAMP}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    },
    {
      username: `testuser2${TIMESTAMP}`, 
      email: `test2${TIMESTAMP}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    }
  ]
};

// Test state
let testData = {
  users: [],
  tokens: [],
  workspaces: [],
  boards: [],
  lists: [],
  cards: [],
  invitations: [],
  comments: []
};

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  switch (type) {
    case 'success':
      console.log(`[${timestamp}] ✅ ${message}`.green);
      break;
    case 'error':
      console.log(`[${timestamp}] ❌ ${message}`.red);
      break;
    case 'info':
      console.log(`[${timestamp}] ℹ️  ${message}`.blue);
      break;
    case 'warn':
      console.log(`[${timestamp}] ⚠️  ${message}`.yellow);
      break;
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(60).cyan);
  console.log(`  ${title}`.cyan.bold);
  console.log('='.repeat(60).cyan);
}

async function test(description, testFn) {
  testResults.total++;
  try {
    await testFn();
    testResults.passed++;
    log(`${description}`, 'success');
  } catch (error) {
    testResults.failed++;
    
    // Enhanced error logging
    let errorMessage = error.message;
    if (error.response) {
      errorMessage += ` (Status: ${error.response.status})`;
      if (error.response.data) {
        errorMessage += ` - ${JSON.stringify(error.response.data)}`;
      }
    }
    
    testResults.errors.push({ description, error: errorMessage });
    log(`${description} - ${errorMessage}`, 'error');
  }
}

async function makeRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {},
    timeout: 10000 // 10 second timeout
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    return await axios(config);
  } catch (error) {
    // Re-throw with more context
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Test functions
async function testAuthentication() {
  logSection('Authentication Tests');

  // Test user registration
  await test('Register first user', async () => {
    const response = await makeRequest('POST', '/auth/register', TEST_CONFIG.users[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.users.push(response.data.user);
    testData.tokens.push(response.data.tokens.accessToken);
  });

  await test('Register second user', async () => {
    const response = await makeRequest('POST', '/auth/register', TEST_CONFIG.users[1]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.users.push(response.data.user);
    testData.tokens.push(response.data.tokens.accessToken);
  });

  // Test duplicate registration
  await test('Reject duplicate email registration', async () => {
    try {
      // Try to register the first user again with same email
      const duplicateUser = {
        username: `differentuser${TIMESTAMP}`,
        email: TEST_CONFIG.users[0].email, // Same email as first user
        password: 'password123',
        confirmPassword: 'password123'
      };
      await makeRequest('POST', '/auth/register', duplicateUser);
      throw new Error('Should have failed with duplicate email');
    } catch (error) {
      if (error.response?.status !== 409) {
        throw new Error(`Expected 409, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test user login
  await test('Login first user', async () => {
    const loginData = {
      email: TEST_CONFIG.users[0].email,
      password: TEST_CONFIG.users[0].password
    };
    const response = await makeRequest('POST', '/auth/login', loginData);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.tokens || !response.data.tokens.accessToken) throw new Error('No access token received');
    // Update the token for this user
    testData.tokens[0] = response.data.tokens.accessToken;
  });

  // Test invalid login
  await test('Reject invalid credentials', async () => {
    try {
      const loginData = {
        email: TEST_CONFIG.users[0].email,
        password: 'wrongpassword'
      };
      await makeRequest('POST', '/auth/login', loginData);
      throw new Error('Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(`Expected 401, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test get profile
  await test('Get user profile', async () => {
    const response = await makeRequest('GET', '/auth/profile', null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.user.email !== TEST_CONFIG.users[0].email) {
      throw new Error('Profile email mismatch');
    }
  });
}

async function testWorkspaceManagement() {
  logSection('Workspace Management Tests');

  // Test create workspace
  await test('Create first workspace', async () => {
    const workspaceData = {
      name: 'Test Workspace 1',
      description: 'First test workspace for organization'
    };
    const response = await makeRequest('POST', '/workspaces', workspaceData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.workspaces.push(response.data.workspace);
  });

  await test('Create second workspace', async () => {
    const workspaceData = {
      name: 'Test Workspace 2',
      description: 'Second test workspace'
    };
    const response = await makeRequest('POST', '/workspaces', workspaceData, testData.tokens[1]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.workspaces.push(response.data.workspace);
  });

  // Test get user workspaces
  await test('Get user workspaces', async () => {
    const response = await makeRequest('GET', '/workspaces', null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.workspaces.length < 1) throw new Error('Should have at least 1 workspace');
  });

  // Test get specific workspace
  await test('Get specific workspace', async () => {
    const workspaceId = testData.workspaces[0].id;
    const response = await makeRequest('GET', `/workspaces/${workspaceId}`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.workspace.id !== workspaceId) throw new Error('Workspace ID mismatch');
  });

  // Test update workspace
  await test('Update workspace', async () => {
    const workspaceId = testData.workspaces[0].id;
    const updateData = {
      name: 'Updated Test Workspace 1',
      description: 'Updated description'
    };
    const response = await makeRequest('PUT', `/workspaces/${workspaceId}`, updateData, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.workspace.name !== updateData.name) throw new Error('Workspace name not updated');
  });

  // Test workspace member invitation
  await test('Invite user to workspace', async () => {
    const workspaceId = testData.workspaces[0].id;
    const inviteData = {
      email: TEST_CONFIG.users[1].email,
      role: 'member'
    };
    const response = await makeRequest('POST', `/workspaces/${workspaceId}/invite`, inviteData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
  });

  // Test get workspace members
  await test('Get workspace members', async () => {
    const workspaceId = testData.workspaces[0].id;
    const response = await makeRequest('GET', `/workspaces/${workspaceId}/members`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test unauthorized workspace access
  await test('Reject unauthorized workspace access', async () => {
    try {
      const workspaceId = testData.workspaces[1].id; // Workspace owned by user 2
      await makeRequest('GET', `/workspaces/${workspaceId}`, null, testData.tokens[0]); // User 1 trying to access
      throw new Error('Should have failed with unauthorized access');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test delete workspace
  await test('Delete workspace', async () => {
    // Create a workspace specifically for deletion
    const workspaceData = {
      name: 'Workspace To Delete',
      description: 'This workspace will be deleted'
    };
    const createResponse = await makeRequest('POST', '/workspaces', workspaceData, testData.tokens[0]);
    if (createResponse.status !== 201) throw new Error(`Expected 201, got ${createResponse.status}`);
    
    const workspaceId = createResponse.data.workspace.id;
    const deleteResponse = await makeRequest('DELETE', `/workspaces/${workspaceId}`, null, testData.tokens[0]);
    if (deleteResponse.status !== 200) throw new Error(`Expected 200, got ${deleteResponse.status}`);
  });

  // Test unauthorized workspace deletion
  await test('Reject unauthorized workspace deletion', async () => {
    try {
      const workspaceId = testData.workspaces[1].id; // Workspace owned by user 2
      await makeRequest('DELETE', `/workspaces/${workspaceId}`, null, testData.tokens[0]); // User 1 trying to delete
      throw new Error('Should have failed with unauthorized access');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

async function testBoardManagement() {
  logSection('Board Management Tests');

  // Test create board in workspace
  await test('Create first board', async () => {
    const boardData = {
      title: 'Test Board 1',
      description: 'First test board',
      workspaceId: testData.workspaces[0].id
    };
    const response = await makeRequest('POST', '/boards', boardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.boards.push(response.data.board);
  });

  await test('Create second board', async () => {
    const boardData = {
      title: 'Test Board 2',
      description: 'Second test board for user 2',
      workspaceId: testData.workspaces[1].id
    };
    const response = await makeRequest('POST', '/boards', boardData, testData.tokens[1]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.boards.push(response.data.board);
  });
}

async function testBoardCollaboration() {
  logSection('Board Collaboration Tests');

  // Test invite user to board
  await test('Invite user to board', async () => {
    const boardId = testData.boards[0].id;
    const inviteData = {
      email: TEST_CONFIG.users[1].email,
      role: 'editor'
    };
    const response = await makeRequest('POST', `/boards/${boardId}/invite`, inviteData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.invitations.push(response.data.invitation);
  });

  // Test get user invitations
  await test('Get pending invitations', async () => {
    const response = await makeRequest('GET', '/invitations', null, testData.tokens[1]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.invitations.length === 0) throw new Error('Should have pending invitations');
  });

  // Test accept invitation
  await test('Accept board invitation', async () => {
    // First get pending invitations to find the invitation ID
    const invitationsResponse = await makeRequest('GET', '/invitations', null, testData.tokens[1]);
    if (invitationsResponse.data.invitations.length === 0) {
      throw new Error('No pending invitations found');
    }
    
    const invitation = invitationsResponse.data.invitations[0];
    const boardId = invitation.board.id;
    const invitationId = invitation.id;
    
    const response = await makeRequest(
      'PUT', 
      `/boards/${boardId}/invitations/${invitationId}/respond`,
      { action: 'accept' },
      testData.tokens[1]
    );
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test get board members
  await test('Get board members', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/members`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.members.length < 2) throw new Error('Should have at least 2 members');
  });

  // Test shared board access
  await test('Access shared board', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}`, null, testData.tokens[1]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

async function testListManagement() {
  logSection('List Management Tests');

  // Test create lists
  await test('Create first list', async () => {
    const boardId = testData.boards[0].id;
    const listData = {
      title: 'To Do',
      position: 0
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists`, listData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.lists.push(response.data.list);
  });

  await test('Create second list', async () => {
    const boardId = testData.boards[0].id;
    const listData = {
      title: 'In Progress',
      position: 1
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists`, listData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.lists.push(response.data.list);
  });

  await test('Create third list', async () => {
    const boardId = testData.boards[0].id;
    const listData = {
      title: 'Done',
      position: 2
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists`, listData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.lists.push(response.data.list);
  });

  // Test get board lists
  await test('Get board lists', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/lists`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.lists.length !== 3) throw new Error('Should have 3 lists');
  });

  // Test update list
  await test('Update list', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const updateData = {
      title: 'Updated To Do'
    };
    const response = await makeRequest('PUT', `/boards/${boardId}/lists/${listId}`, updateData, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test list access by shared user
  await test('Shared user can access lists', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/lists`, null, testData.tokens[1]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

async function testCardManagement() {
  logSection('Card Management Tests');

  // Test create cards
  await test('Create first card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardData = {
      title: 'Fix authentication bug',
      description: 'User reported login issues',
      priority: 'high',
      labels: ['bug', 'backend']
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards`, cardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.cards.push(response.data.card);
  });

  await test('Create second card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardData = {
      title: 'Add user profile page',
      description: 'Create user profile management',
      priority: 'medium',
      labels: ['feature', 'frontend']
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards`, cardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.cards.push(response.data.card);
  });

  await test('Create third card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[1].id;
    const cardData = {
      title: 'Implement board sharing',
      description: 'Allow users to share boards',
      priority: 'urgent',
      labels: ['feature', 'collaboration']
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards`, cardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.cards.push(response.data.card);
  });

  // Test card with assignees
  await test('Create card with assignees', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardData = {
      title: 'Review code changes',
      description: 'Review PR #123 for new features',
      priority: 'high',
      labels: ['review', 'urgent'],
      assignees: [testData.users[0].id, testData.users[1].id], // Assign to both users
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards`, cardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    
    // Verify assignees are properly stored
    if (!response.data.card.assignees || response.data.card.assignees.length !== 2) {
      throw new Error('Assignees not properly stored');
    }
    
    testData.cards.push(response.data.card);
  });

  // Test get list cards
  await test('Get list cards', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/lists/${listId}/cards`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.cards.length !== 3) throw new Error('Should have 3 cards in first list');
  });

  // Test get board cards
  await test('Get all board cards', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/cards`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.cards.length !== 4) throw new Error('Should have 4 cards total');
  });

  // Test card filtering
  await test('Filter cards by priority', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/lists/${listId}/cards?priority=high`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.cards.length !== 2) throw new Error('Should have 2 high priority cards');
  });

  // Test update card
  await test('Update card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    const updateData = {
      title: 'Fixed authentication bug',
      isCompleted: true
    };
    const response = await makeRequest('PUT', `/boards/${boardId}/lists/${listId}/cards/${cardId}`, updateData, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test update card assignees
  await test('Update card assignees', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[1].id; // Use second card
    const updateData = {
      assignees: [testData.users[1].id], // Change assignees
      labels: ['feature', 'frontend', 'updated']
    };
    const response = await makeRequest('PUT', `/boards/${boardId}/lists/${listId}/cards/${cardId}`, updateData, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    
    // Verify assignees were updated
    if (!response.data.card.assignees || response.data.card.assignees.length !== 1) {
      throw new Error('Assignees not properly updated');
    }
  });

  // Test move card between lists
  await test('Move card between lists', async () => {
    const boardId = testData.boards[0].id;
    const sourceListId = testData.lists[0].id;
    const cardId = testData.cards[1].id;
    const moveData = {
      targetListId: testData.lists[2].id, // Move to "Done" list
      position: 0
    };
    const response = await makeRequest('PUT', `/boards/${boardId}/lists/${sourceListId}/cards/${cardId}/move`, moveData, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test shared user can create cards
  await test('Shared user can create cards', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[1].id;
    const cardData = {
      title: 'Card by shared user',
      description: 'Created by user with editor role',
      priority: 'low'
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards`, cardData, testData.tokens[1]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.cards.push(response.data.card);
  });
}

async function testCommentManagement() {
  logSection('Comment Management Tests');

  // Test create comment
  await test('Create first comment on card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    const commentData = {
      content: 'This is a great feature request! Let me work on this.'
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, commentData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.comments.push(response.data.comment);
  });

  await test('Create second comment by different user', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    const commentData = {
      content: 'Thanks for looking into this! I have some additional requirements...'
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, commentData, testData.tokens[1]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.comments.push(response.data.comment);
  });

  await test('Create comment on different card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[1].id;
    const cardId = testData.cards[2].id;
    const commentData = {
      content: 'This collaboration feature is working perfectly!'
    };
    const response = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, commentData, testData.tokens[1]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.comments.push(response.data.comment);
  });

  // Test get comments for a card
  await test('Get comments for card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.comments.length !== 2) throw new Error('Should have 2 comments on first card');
  });

  // Test update comment
  await test('Update own comment', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    const commentId = testData.comments[0].id;
    const updateData = {
      content: 'This is a great feature request! Let me work on this ASAP. Updated comment.'
    };
    const response = await makeRequest('PUT', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`, updateData, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.comment.content.includes('Updated comment')) throw new Error('Comment was not updated');
  });

  // Test unauthorized comment update
  await test('Reject unauthorized comment update', async () => {
    try {
      const boardId = testData.boards[0].id;
      const listId = testData.lists[0].id;
      const cardId = testData.cards[0].id;
      const commentId = testData.comments[0].id; // This comment belongs to user 1
      const updateData = {
        content: 'Trying to update someone else\'s comment'
      };
      await makeRequest('PUT', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`, updateData, testData.tokens[1]); // User 2 trying to update
      throw new Error('Should have failed with unauthorized access');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test comment validation
  await test('Reject empty comment', async () => {
    try {
      const boardId = testData.boards[0].id;
      const listId = testData.lists[0].id;
      const cardId = testData.cards[0].id;
      const commentData = {
        content: ''
      };
      await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, commentData, testData.tokens[0]);
      throw new Error('Should have failed with empty comment');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error(`Expected 400, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test comment on non-existent card
  await test('Reject comment on non-existent card', async () => {
    try {
      const boardId = testData.boards[0].id;
      const listId = testData.lists[0].id;
      const commentData = {
        content: 'Comment on non-existent card'
      };
      await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards/99999/comments`, commentData, testData.tokens[0]);
      throw new Error('Should have failed with non-existent card');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Expected 404, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

async function testSearchFunctionality() {
  logSection('Card Search Tests');

  // Create test cards with different properties for search testing
  await test('Create card with assignees and labels', async () => {
    const cardData = {
      title: 'Search Test Card 1',
      description: 'Card for testing search functionality',
      assignees: [testData.users[0].id, testData.users[1].id],
      labels: ['bug', 'urgent'],
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    const response = await makeRequest('POST', `/boards/${testData.boards[0].id}/lists/${testData.lists[0].id}/cards`, cardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.cards.push(response.data.card);
  });

  await test('Create another search test card', async () => {
    const cardData = {
      title: 'Search Test Card 2',
      description: 'Another card for search testing',
      assignees: [testData.users[1].id],
      labels: ['feature'],
      priority: 'medium'
    };
    const response = await makeRequest('POST', `/boards/${testData.boards[0].id}/lists/${testData.lists[0].id}/cards`, cardData, testData.tokens[0]);
    if (response.status !== 201) throw new Error(`Expected 201, got ${response.status}`);
    testData.cards.push(response.data.card);
  });

  // Test basic search
  await test('Search cards by title', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/cards/search?q=Search Test`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.cards.length < 2) throw new Error('Should find at least 2 cards with "Search Test"');
  });

  // Test filter by assignee
  await test('Search cards by assignee', async () => {
    const boardId = testData.boards[0].id;
    const userId = testData.users[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/cards/search?assignee=${userId}`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test filter by label
  await test('Search cards by label', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/cards/search?label=bug`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test filter by priority
  await test('Search cards by priority', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/cards/search?priority=high`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test combined filters
  await test('Search cards with combined filters', async () => {
    const boardId = testData.boards[0].id;
    const userId = testData.users[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/cards/search?q=Search&assignee=${userId}&priority=high`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

async function testCleanup() {
  logSection('Cleanup Tests');

  // Test delete comment
  await test('Delete comment', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[1].id;
    const cardId = testData.cards[2].id;
    const commentId = testData.comments[2].id;
    const response = await makeRequest('DELETE', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`, null, testData.tokens[1]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test delete cards
  await test('Delete card', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[2].id;
    const cardId = testData.cards[1].id;
    const response = await makeRequest('DELETE', `/boards/${boardId}/lists/${listId}/cards/${cardId}`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test delete list
  await test('Delete list', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[2].id;
    const response = await makeRequest('DELETE', `/boards/${boardId}/lists/${listId}`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test delete board (owner only)
  await test('Delete board', async () => {
    const boardId = testData.boards[0].id; // Use board created by user 1
    const response = await makeRequest('DELETE', `/boards/${boardId}`, null, testData.tokens[0]); // User 1 deleting their own board
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

// Error handling and validation tests
async function testErrorHandling() {
  logSection('Error Handling Tests');

  // Test invalid endpoints
  await test('Handle invalid endpoint', async () => {
    try {
      await makeRequest('GET', '/invalid-endpoint', null, testData.tokens[0]);
      throw new Error('Should have failed with 404');
    } catch (error) {
      if (error.response?.status !== 404) {
        throw new Error(`Expected 404, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test missing authentication
  await test('Reject unauthenticated requests', async () => {
    try {
      await makeRequest('GET', '/boards');
      throw new Error('Should have failed with 401');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(`Expected 401, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test invalid JSON
  await test('Handle invalid JSON payload', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, 'invalid-json', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testData.tokens[0]}`
        }
      });
      throw new Error('Should have failed with invalid JSON');
    } catch (error) {
      if (![400, 422].includes(error.response?.status)) {
        throw new Error(`Expected 400 or 422, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

// Health check
async function testHealthCheck() {
  logSection('Health Check');
  
  await test('Health endpoint responds', async () => {
    const response = await axios.get('http://localhost:3001/health');
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.status !== 'OK') throw new Error('Health check failed');
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Mini Trello API Test Suite...'.bold.magenta);
  console.log(`Testing against: ${BASE_URL}`.gray);
  
  const startTime = Date.now();

  try {
    await testHealthCheck();
    await testAuthentication();
    await testWorkspaceManagement();
    await testBoardManagement();
    await testBoardCollaboration();
    await testListManagement();
    await testCardManagement();
    await testSearchFunctionality();
    await testCommentManagement();
    await testCleanup();
    await testErrorHandling();
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print results
  console.log('\n' + '='.repeat(60).magenta);
  console.log('  TEST RESULTS'.magenta.bold);
  console.log('='.repeat(60).magenta);
  
  console.log(`Total Tests: ${testResults.total}`.white);
  console.log(`Passed: ${testResults.passed}`.green);
  console.log(`Failed: ${testResults.failed}`.red);
  console.log(`Duration: ${duration}s`.gray);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`.yellow);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:'.red.bold);
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.description}`.red);
      console.log(`     ${error.error}`.gray);
    });
  }

  console.log('\n' + (testResults.failed === 0 ? '🎉 All tests passed!'.green.bold : '⚠️  Some tests failed.'.yellow.bold));
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error');
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`, 'error');
  process.exit(1);
});

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3001/health');
    return true;
  } catch (error) {
    return false;
  }
}

// Start tests
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('Server is not running on http://localhost:3001', 'error');
    log('Please start the server with: npm run dev', 'warn');
    process.exit(1);
  }
  
  await runAllTests();
})();
