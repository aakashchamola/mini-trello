import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import socketService from '../services/socket';
import { STORAGE_KEYS } from '../config/constants';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const ACTION_TYPES = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.LOGIN_START:
    case ACTION_TYPES.REGISTER_START:
    case ACTION_TYPES.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case ACTION_TYPES.LOGIN_SUCCESS:
    case ACTION_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      };

    case ACTION_TYPES.LOAD_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user || action.payload,
        token: action.payload.token || state.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        error: null
      };

    case ACTION_TYPES.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null
      };

    case ACTION_TYPES.LOGIN_FAILURE:
    case ACTION_TYPES.REGISTER_FAILURE:
    case ACTION_TYPES.LOAD_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        error: action.payload
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userString = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && refreshToken && userString) {
        try {
          const user = JSON.parse(userString);
          
          // Set tokens in state first
          dispatch({
            type: ACTION_TYPES.LOGIN_SUCCESS,
            payload: { user, accessToken: token, refreshToken }
          });
          
          // Verify token is still valid by making a request
          dispatch({ type: ACTION_TYPES.LOAD_USER_START });
          const response = await authAPI.getProfile();
          
          dispatch({
            type: ACTION_TYPES.LOAD_USER_SUCCESS,
            payload: {
              user: response.data.data,
              token,
              refreshToken
            }
          });

          // Connect to socket
          socketService.connect();

        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          
          dispatch({
            type: ACTION_TYPES.LOAD_USER_FAILURE,
            payload: 'Session expired'
          });
        }
      } else {
        dispatch({
          type: ACTION_TYPES.LOAD_USER_FAILURE,
          payload: null
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (emailOrCredentials, password) => {
    try {
      dispatch({ type: ACTION_TYPES.LOGIN_START });
      
      // Handle both object and individual parameters
      let credentials;
      if (typeof emailOrCredentials === 'object') {
        credentials = emailOrCredentials;
      } else {
        credentials = { email: emailOrCredentials, password };
      }
      
      const response = await authAPI.login(credentials);
      
      // Handle different response structures
      let user, accessToken, refreshToken;
      if (response.data.tokens) {
        // New API structure
        user = response.data.user;
        accessToken = response.data.tokens.accessToken;
        refreshToken = response.data.tokens.refreshToken;
      } else {
        // Legacy structure
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      }

      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      dispatch({
        type: ACTION_TYPES.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      // Connect to socket
      socketService.connect();

      toast.success(`Welcome back, ${user.username}!`);
      return { success: true };

    } catch (error) {
      const errorMessage = handleAPIError(error);
      dispatch({
        type: ACTION_TYPES.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: ACTION_TYPES.REGISTER_START });
      
      const response = await authAPI.register(userData);
      
      // Handle different response structures
      let user, accessToken, refreshToken;
      if (response.data.tokens) {
        // New API structure
        user = response.data.user;
        accessToken = response.data.tokens.accessToken;
        refreshToken = response.data.tokens.refreshToken;
      } else {
        // Legacy structure
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      }

      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      dispatch({
        type: ACTION_TYPES.REGISTER_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      // Connect to socket
      socketService.connect();

      toast.success(`Welcome to Mini Trello, ${user.username}!`);
      return { success: true };

    } catch (error) {
      const errorMessage = handleAPIError(error);
      dispatch({
        type: ACTION_TYPES.REGISTER_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (state.isAuthenticated) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Disconnect socket
      socketService.disconnect();

      dispatch({ type: ACTION_TYPES.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data;

      // Update local storage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      dispatch({
        type: ACTION_TYPES.UPDATE_PROFILE_SUCCESS,
        payload: updatedUser
      });

      toast.success('Profile updated successfully');
      return { success: true };

    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      return { success: true };

    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Google Login function
  const loginWithGoogle = async (googleCredential) => {
    try {
      console.log('🔑 Starting Google login with credential:', googleCredential ? 'present' : 'missing');
      dispatch({ type: ACTION_TYPES.LOGIN_START });
      
      const response = await authAPI.googleLogin({ credential: googleCredential });
      console.log('✅ Google login response:', response.data);
      
      // Handle different response structures
      let user, accessToken, refreshToken;
      if (response.data.tokens) {
        // New API structure
        user = response.data.user;
        accessToken = response.data.tokens.accessToken;
        refreshToken = response.data.tokens.refreshToken;
      } else {
        // Legacy structure
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      }

      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      dispatch({
        type: ACTION_TYPES.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      // Connect to socket
      socketService.connect();

      // Show appropriate welcome message for Google authentication
      const welcomeMessage = user.first_name 
        ? `Welcome, ${user.first_name}!` 
        : `Welcome, ${user.username}!`;
      
      toast.success(welcomeMessage);
      return { success: true };

    } catch (error) {
      const errorMessage = handleAPIError(error);
      dispatch({
        type: ACTION_TYPES.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Google Register function
  const registerWithGoogle = async (googleCredential) => {
    try {
      dispatch({ type: ACTION_TYPES.REGISTER_START });
      
      const response = await authAPI.googleRegister({ credential: googleCredential });
      
      // Handle different response structures
      let user, accessToken, refreshToken;
      if (response.data.tokens) {
        // New API structure
        user = response.data.user;
        accessToken = response.data.tokens.accessToken;
        refreshToken = response.data.tokens.refreshToken;
      } else {
        // Legacy structure
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      }

      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      dispatch({
        type: ACTION_TYPES.REGISTER_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      // Connect to socket
      socketService.connect();

      toast.success(`Welcome to Mini Trello, ${user.username}!`);
      return { success: true };

    } catch (error) {
      const errorMessage = handleAPIError(error);
      dispatch({
        type: ACTION_TYPES.REGISTER_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loginWithGoogle,
    registerWithGoogle,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
