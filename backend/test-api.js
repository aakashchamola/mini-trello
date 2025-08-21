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

async function testActivityLogging() {
  logSection('Activity Logging Tests');

  // Test getting board activities (should have activities from previous operations)
  await test('Get board activity feed', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/activities`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.success) throw new Error('Response should indicate success');
    if (!Array.isArray(response.data.activities)) throw new Error('Activities should be an array');
    if (response.data.activities.length === 0) throw new Error('Should have some activities from previous operations');
    
    // Check activity structure
    const activity = response.data.activities[0];
    if (!activity.id) throw new Error('Activity should have an id');
    if (!activity.actionType) throw new Error('Activity should have an actionType');
    if (!activity.entityType) throw new Error('Activity should have an entityType');
    if (!activity.description) throw new Error('Activity should have a description');
    if (!activity.createdAt) throw new Error('Activity should have a createdAt timestamp');
    if (!activity.user) throw new Error('Activity should include user information');
    if (!activity.user.username) throw new Error('Activity user should have a username');
  });

  await test('Get board activities with pagination', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/activities?page=1&limit=5`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.activities.length > 5) throw new Error('Should respect limit parameter');
    if (typeof response.data.totalCount !== 'number') throw new Error('Should include totalCount');
    if (typeof response.data.totalPages !== 'number') throw new Error('Should include totalPages');
    if (typeof response.data.currentPage !== 'number') throw new Error('Should include currentPage');
  });

  await test('Filter activities by action type', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/activities?actionType=created`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    // Verify all returned activities have the 'created' action type
    response.data.activities.forEach(activity => {
      if (activity.actionType !== 'created') {
        throw new Error(`Expected actionType 'created', got '${activity.actionType}'`);
      }
    });
  });

  await test('Filter activities by entity type', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/activities?entityType=card`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    // Verify all returned activities have the 'card' entity type
    response.data.activities.forEach(activity => {
      if (activity.entityType !== 'card') {
        throw new Error(`Expected entityType 'card', got '${activity.entityType}'`);
      }
    });
  });

  // Test that activity logging happens automatically on operations
  await test('Verify board creation generates activity', async () => {
    const initialBoardId = testData.boards[0].id;
    const initialResponse = await makeRequest('GET', `/boards/${initialBoardId}/activities`, null, testData.tokens[0]);
    const initialCount = initialResponse.data.totalCount;

    // Create a new board to trigger activity logging
    const boardData = {
      title: 'Activity Test Board',
      description: 'Board created to test activity logging',
      workspaceId: testData.workspaces[0].id
    };
    const createResponse = await makeRequest('POST', '/boards', boardData, testData.tokens[0]);
    if (createResponse.status !== 201) throw new Error(`Expected 201, got ${createResponse.status}`);
    
    const newBoardId = createResponse.data.board.id;
    testData.boards.push(createResponse.data.board);

    // Check if activity was logged for the new board
    const activitiesResponse = await makeRequest('GET', `/boards/${newBoardId}/activities`, null, testData.tokens[0]);
    if (activitiesResponse.status !== 200) throw new Error(`Expected 200, got ${activitiesResponse.status}`);
    
    const activities = activitiesResponse.data.activities;
    const boardCreatedActivity = activities.find(activity => 
      activity.actionType === 'created' && 
      activity.entityType === 'board' &&
      activity.entityId === newBoardId
    );
    
    if (!boardCreatedActivity) {
      throw new Error('Board creation activity should have been logged');
    }
    
    if (!boardCreatedActivity.description.includes('created board')) {
      throw new Error('Activity description should mention board creation');
    }
  });

  await test('Verify card creation generates activity', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    
    // Get initial activity count
    const initialResponse = await makeRequest('GET', `/boards/${boardId}/activities`, null, testData.tokens[0]);
    const initialCount = initialResponse.data.totalCount;

    // Create a card to trigger activity logging
    const cardData = {
      title: 'Activity Test Card',
      description: 'Card created to test activity logging',
      priority: 'medium'
    };
    const createResponse = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards`, cardData, testData.tokens[0]);
    if (createResponse.status !== 201) throw new Error(`Expected 201, got ${createResponse.status}`);
    
    const newCardId = createResponse.data.card.id;

    // Check if activity was logged
    const activitiesResponse = await makeRequest('GET', `/boards/${boardId}/activities`, null, testData.tokens[0]);
    if (activitiesResponse.status !== 200) throw new Error(`Expected 200, got ${activitiesResponse.status}`);
    
    if (activitiesResponse.data.totalCount <= initialCount) {
      throw new Error('Activity count should have increased after card creation');
    }
    
    const activities = activitiesResponse.data.activities;
    const cardCreatedActivity = activities.find(activity => 
      activity.actionType === 'created' && 
      activity.entityType === 'card' &&
      activity.entityId === newCardId
    );
    
    if (!cardCreatedActivity) {
      throw new Error('Card creation activity should have been logged');
    }
    
    if (!cardCreatedActivity.description.includes('created card')) {
      throw new Error('Activity description should mention card creation');
    }
  });

  await test('Verify card update generates activity with old/new values', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    
    // Update the card to trigger activity logging
    const updateData = {
      title: 'Updated Activity Test Card',
      description: 'Updated description for activity testing',
      priority: 'high'
    };
    const updateResponse = await makeRequest('PUT', `/boards/${boardId}/lists/${listId}/cards/${cardId}`, updateData, testData.tokens[0]);
    if (updateResponse.status !== 200) throw new Error(`Expected 200, got ${updateResponse.status}`);

    // Check if activity was logged
    const activitiesResponse = await makeRequest('GET', `/boards/${boardId}/activities?actionType=updated&entityType=card`, null, testData.tokens[0]);
    if (activitiesResponse.status !== 200) throw new Error(`Expected 200, got ${activitiesResponse.status}`);
    
    const activities = activitiesResponse.data.activities;
    const cardUpdateActivity = activities.find(activity => 
      activity.actionType === 'updated' && 
      activity.entityType === 'card' &&
      activity.entityId === cardId
    );
    
    if (!cardUpdateActivity) {
      throw new Error('Card update activity should have been logged');
    }
    
    if (!cardUpdateActivity.description.includes('updated card')) {
      throw new Error('Activity description should mention card update');
    }

    // Check if new values were recorded
    if (!cardUpdateActivity.newValue) {
      throw new Error('Activity should include new values for update operations');
    }
    
    const newValues = JSON.parse(cardUpdateActivity.newValue);
    console.log('Test Debug - updateData:', updateData);
    console.log('Test Debug - newValues:', newValues);
    console.log('Test Debug - newValues.title:', newValues.title);
    console.log('Test Debug - updateData.title:', updateData.title);
    if (newValues.title !== updateData.title) {
      throw new Error(`New values should match the update data. Expected: "${updateData.title}", Got: "${newValues.title}"`);
    }
  });

  await test('Verify comment creation generates activity', async () => {
    const boardId = testData.boards[0].id;
    const listId = testData.lists[0].id;
    const cardId = testData.cards[0].id;
    
    // Create a comment to trigger activity logging
    const commentData = {
      content: 'This is a test comment for activity logging'
    };
    const createResponse = await makeRequest('POST', `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, commentData, testData.tokens[0]);
    if (createResponse.status !== 201) throw new Error(`Expected 201, got ${createResponse.status}`);
    
    const newCommentId = createResponse.data.comment.id;

    // Check if activity was logged
    const activitiesResponse = await makeRequest('GET', `/boards/${boardId}/activities?actionType=commented&entityType=comment`, null, testData.tokens[0]);
    if (activitiesResponse.status !== 200) throw new Error(`Expected 200, got ${activitiesResponse.status}`);
    
    const activities = activitiesResponse.data.activities;
    const commentActivity = activities.find(activity => 
      activity.actionType === 'commented' && 
      activity.entityType === 'comment' &&
      activity.entityId === newCommentId
    );
    
    if (!commentActivity) {
      throw new Error('Comment creation activity should have been logged');
    }
    
    if (!commentActivity.description.includes('commented on')) {
      throw new Error('Activity description should mention commenting');
    }
  });

  await test('Activity feed shows most recent activities first', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/activities`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    
    const activities = response.data.activities;
    if (activities.length < 2) return; // Skip if not enough activities
    
    // Verify activities are ordered by creation time (newest first)
    for (let i = 1; i < activities.length; i++) {
      const current = new Date(activities[i].createdAt);
      const previous = new Date(activities[i - 1].createdAt);
      if (current > previous) {
        throw new Error('Activities should be ordered by creation time (newest first)');
      }
    }
  });

  await test('Activity feed includes user information', async () => {
    const boardId = testData.boards[0].id;
    const response = await makeRequest('GET', `/boards/${boardId}/activities`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    
    const activities = response.data.activities;
    if (activities.length === 0) return; // Skip if no activities
    
    activities.forEach((activity, index) => {
      if (!activity.user) {
        throw new Error(`Activity ${index} should include user information`);
      }
      if (!activity.user.id || !activity.user.username || !activity.user.email) {
        throw new Error(`Activity ${index} user should include id, username, and email`);
      }
    });
  });

  await test('Reject unauthorized access to activity feed', async () => {
    try {
      const boardId = testData.boards[0].id; // This board belongs to user 1
      // Try to access with user 2's token (who is not a member of this board)
      await makeRequest('GET', `/boards/${boardId}/activities`, null, 'invalid-token');
      throw new Error('Should have failed with unauthorized access');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(`Expected 401, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

async function testRealTimeFeatures() {
  logSection('Real-Time Features Tests');

  // Test real-time system status
  await test('Get real-time system status', async () => {
    const response = await makeRequest('GET', '/realtime/status', null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.data.status) throw new Error('Status should be included');
    if (typeof response.data.data.connectedUsers !== 'number') throw new Error('Connected users should be a number');
    if (typeof response.data.data.activeBoards !== 'number') throw new Error('Active boards should be a number');
  });

  // Test board presence
  await test('Get board presence', async () => {
    // Use board 0 which should have user 2 invited and accepted
    const boardId = testData.boards[0].id; // Board created by user 1 with user 2 invited
    const response = await makeRequest('GET', `/boards/${boardId}/presence`, null, testData.tokens[0]);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!Array.isArray(response.data.data.connectedUsers)) throw new Error('Connected users should be an array');
    if (typeof response.data.data.totalConnected !== 'number') throw new Error('Total connected should be a number');
    if (response.data.data.boardId !== boardId) throw new Error('Board ID should match');
  });

  // Test unauthorized board presence access
  await test('Reject unauthorized board presence access', async () => {
    try {
      // Create a board that user 2 definitely doesn't have access to
      const newBoardResponse = await makeRequest('POST', '/boards', {
        title: 'Private Test Board',
        description: 'Board for testing unauthorized access'
      }, testData.tokens[0]);
      
      if (newBoardResponse.status !== 201) throw new Error('Failed to create test board');
      const privateBoardId = newBoardResponse.data.board.id;
      
      // Try to access with user 2's token (who is definitely not a member)
      await makeRequest('GET', `/boards/${privateBoardId}/presence`, null, testData.tokens[1]);
      throw new Error('Should have failed with unauthorized access');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error(`Expected 403, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test real-time endpoint with invalid board
  await test('Handle invalid board ID for presence', async () => {
    try {
      await makeRequest('GET', '/boards/99999/presence', null, testData.tokens[0]);
      throw new Error('Should have failed with not found');
    } catch (error) {
      if (error.response?.status !== 403 && error.response?.status !== 404) {
        throw new Error(`Expected 403 or 404, got ${error.response?.status || 'network error'}`);
      }
    }
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
    const listId = testData.lists[2].id; // Card was moved to "Done" list in previous test
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
    await testActivityLogging();
    await testRealTimeFeatures();
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
