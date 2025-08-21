#!/usr/bin/env node

/**
 * Minimal test for debugging board collaboration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TIMESTAMP = Date.now();

async function testBoardCollaboration() {
  try {
    // Register two users
    console.log('1. Registering users...');
    const user1Data = {
      username: `testuser1${TIMESTAMP}`,
      email: `test1${TIMESTAMP}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    };
    const user2Data = {
      username: `testuser2${TIMESTAMP}`,
      email: `test2${TIMESTAMP}@example.com`,
      password: 'password123',
      confirmPassword: 'password123'
    };

    const user1Response = await axios.post(`${BASE_URL}/auth/register`, user1Data);
    const user2Response = await axios.post(`${BASE_URL}/auth/register`, user2Data);
    
    const token1 = user1Response.data.tokens.accessToken;
    const token2 = user2Response.data.tokens.accessToken;
    
    console.log('Users registered');

    // Create a board
    console.log('2. Creating board...');
    const boardResponse = await axios.post(`${BASE_URL}/boards`, {
      title: 'Test Board',
      description: 'Test board for collaboration'
    }, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const boardId = boardResponse.data.board.id;
    console.log('Board created with ID:', boardId);

    // Test invite user
    console.log('3. Inviting user to board...');
    const inviteData = {
      email: user2Data.email,
      role: 'editor'
    };
    
    console.log('Invite data:', inviteData);
    console.log('Board ID:', boardId);
    console.log('Token:', token1.substring(0, 20) + '...');
    
    const inviteResponse = await axios.post(`${BASE_URL}/boards/${boardId}/invite`, inviteData, {
      headers: { 
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Invite response:', inviteResponse.data);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testBoardCollaboration();
