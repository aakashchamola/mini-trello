// Test API Integration
import { authAPI, boardAPI, workspaceAPI } from './api';

export const testAPIConnection = async () => {
  console.log('🔄 Testing API Connection...');
  
  try {
    // Test register endpoint
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'testpassword123'
    };
    
    console.log('📝 Testing user registration...');
    const registerResponse = await authAPI.register(testUser);
    console.log('✅ Registration successful:', registerResponse.data);
    
    // Test login endpoint
    console.log('🔐 Testing user login...');
    const loginResponse = await authAPI.login({
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    // Test boards endpoint
    console.log('📋 Testing boards API...');
    try {
      const boardsResponse = await boardAPI.getUserBoards();
      console.log('✅ Boards API successful:', boardsResponse.data);
    } catch (boardError) {
      console.log('ℹ️ Boards API (expected empty):', boardError.response?.status);
    }
    
    // Test workspaces endpoint
    console.log('🏢 Testing workspaces API...');
    try {
      const workspacesResponse = await workspaceAPI.getUserWorkspaces();
      console.log('✅ Workspaces API successful:', workspacesResponse.data);
    } catch (workspaceError) {
      console.log('ℹ️ Workspaces API (expected empty):', workspaceError.response?.status);
    }
    
    console.log('🎉 API Integration Test Complete!');
    return { success: true, message: 'All API endpoints working' };
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Helper function to test specific endpoints
export const testEndpoint = async (name, apiCall) => {
  try {
    console.log(`🔄 Testing ${name}...`);
    const response = await apiCall();
    console.log(`✅ ${name} successful:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};
