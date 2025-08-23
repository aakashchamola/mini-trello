import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  googleLogin: (googleData) => api.post('/auth/google/login', googleData),
  googleRegister: (googleData) => api.post('/auth/google/register', googleData)
};

// Workspace API methods
export const workspaceAPI = {
  getAll: (params = {}) => api.get('/workspaces', { params }),
  getUserWorkspaces: (params = {}) => api.get('/workspaces', { params }), // Backend endpoint gets user's workspaces by default
  getWorkspace: (id, params = {}) => api.get(`/workspaces/${id}`, { params }),
  getById: (id, params = {}) => api.get(`/workspaces/${id}`, { params }),
  create: (data) => api.post('/workspaces', data),
  createWorkspace: (data) => api.post('/workspaces', data), // Alias for create
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  updateWorkspace: (id, data) => api.put(`/workspaces/${id}`, data), // Alias for update
  delete: (id) => api.delete(`/workspaces/${id}`),
  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`), // Alias for delete
  invite: (id, data) => api.post(`/workspaces/${id}/invite`, data),
  getMembers: (id, params = {}) => api.get(`/workspaces/${id}/members`, { params }),
  getWorkspaceMembers: (id, params = {}) => api.get(`/workspaces/${id}/members`, { params }) // Alias for getMembers
};

// Board API methods
export const boardAPI = {
  getAll: (params = {}) => api.get('/boards', { params }),
  getBoard: (id, params = {}) => api.get(`/boards/${id}`, { params }),
  getById: (id, params = {}) => api.get(`/boards/${id}`, { params }),
  getUserBoards: (params = {}) => api.get('/boards', { params }),
  create: (data) => api.post('/boards', data),
  createBoard: (data) => api.post('/boards', data), // Alias for create
  update: (id, data) => api.put(`/boards/${id}`, data),
  updateBoard: (id, data) => api.put(`/boards/${id}`, data), // Alias for update
  delete: (id) => api.delete(`/boards/${id}`),
  deleteBoard: (id) => api.delete(`/boards/${id}`), // Alias for delete
  toggleStar: (id) => api.put(`/boards/${id}/star`),
  starBoard: (id) => api.put(`/boards/${id}/star`),
  unstarBoard: (id) => api.delete(`/boards/${id}/star`),
  invite: (boardId, data) => api.post(`/boards/${boardId}/invite`, data),
  getMembers: (boardId, params = {}) => api.get(`/boards/${boardId}/members`, { params }),
  getBoardMembers: (boardId, params = {}) => api.get(`/boards/${boardId}/members`, { params }),
  removeMember: (boardId, memberId) => api.delete(`/boards/${boardId}/members/${memberId}`),
  updateMemberRole: (boardId, memberId, data) => api.put(`/boards/${boardId}/members/${memberId}`, data),
  getActivities: (boardId, params = {}) => api.get(`/boards/${boardId}/activities`, { params }),
  getBoardActivities: (boardId, params = {}) => api.get(`/boards/${boardId}/activities`, { params }),
  getPresence: (boardId) => api.get(`/boards/${boardId}/presence`)
};

// List API methods
export const listAPI = {
  getByBoard: (boardId, params = {}) => api.get(`/boards/${boardId}/lists`, { params }),
  getById: (boardId, listId, params = {}) => api.get(`/boards/${boardId}/lists/${listId}`, { params }),
  create: (boardId, data) => api.post(`/boards/${boardId}/lists`, data),
  update: (boardId, listId, data) => api.put(`/boards/${boardId}/lists/${listId}`, data),
  delete: (boardId, listId) => api.delete(`/boards/${boardId}/lists/${listId}`),
  reorder: (boardId, data) => api.put(`/boards/${boardId}/lists/reorder`, data)
};

// Card API methods
export const cardAPI = {
  getByList: (boardId, listId, params = {}) => api.get(`/boards/${boardId}/lists/${listId}/cards`, { params }),
  getByBoard: (boardId, params = {}) => api.get(`/boards/${boardId}/cards`, { params }),
  search: (boardId, params = {}) => api.get(`/boards/${boardId}/cards/search`, { params }),
  getById: (boardId, listId, cardId, params = {}) => api.get(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, { params }),
  create: (boardId, listId, data) => api.post(`/boards/${boardId}/lists/${listId}/cards`, data),
  update: (boardId, listId, cardId, data) => {
    console.log('cardAPI.update called with:', { boardId, listId, cardId, data });
    console.log('cardId type in API:', typeof cardId, 'value:', cardId);
    return api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, data);
  },
  delete: (boardId, listId, cardId) => api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}`),
  move: (boardId, listId, cardId, data) => api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}/move`, data)
};

// Comment API methods
export const commentAPI = {
  getByCard: (boardId, listId, cardId, params = {}) => api.get(`/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, { params }),
  create: (boardId, listId, cardId, data) => api.post(`/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`, data),
  update: (boardId, listId, cardId, commentId, data) => api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`, data),
  delete: (boardId, listId, cardId, commentId) => api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`)
};

// Invitation API methods
export const invitationAPI = {
  getAll: (params = {}) => api.get('/invitations', { params }),
  respond: (boardId, invitationId, data) => api.put(`/boards/${boardId}/invitations/${invitationId}/respond`, data)
};

// Generic API error handler
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request';
      case 401:
        return 'You are not authorized to perform this action';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 409:
        return data.message || 'Resource already exists';
      case 422:
        return data.errors ? 
          data.errors.map(err => err.message).join(', ') : 
          'Validation failed';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Internal server error. Please try again later';
      default:
        return data.message || 'An unexpected error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

export default api;
