// Debug utility for mutation testing
export const debugMutation = (mutationName, data, error) => {
  console.group(`🔍 Debug: ${mutationName}`);
  console.log('Data:', data);
  if (error) {
    console.error('Error:', error);
    console.error('Error Response:', error.response);
    console.error('Error Message:', error.message);
  }
  console.groupEnd();
};

// Enhanced error handling for mutations
export const handleMutationError = (error, operationName) => {
  console.error(`❌ ${operationName} failed:`, error);
  
  if (error.response) {
    // Server responded with error status
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return error.response.data?.message || `${operationName} failed`;
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response received:', error.request);
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    console.error('Error setting up request:', error.message);
    return error.message || `${operationName} failed`;
  }
};
