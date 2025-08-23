import { io } from 'socket.io-client';
import { SOCKET_URL, WEBSOCKET_ENABLED, SOCKET_EVENTS, STORAGE_KEYS } from '../config/constants';
import { toast } from 'react-toastify';
import { isTokenExpired, refreshAuthToken, isValidTokenFormat } from './api';

class SocketService {
  onMentionCreated(callback) {
    this.on(SOCKET_EVENTS.MENTION_CREATED, callback);
  }
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentBoardId = null;
    this.listeners = new Map();
    this.refreshAttempts = 0;
    this.maxRefreshAttempts = 3;
    this.lastRefreshTime = 0;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
  }

  connect() {
    if (!WEBSOCKET_ENABLED) {
      console.log('WebSocket is disabled');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.socket && (this.socket.connected || this.socket.connecting)) {
      console.log('Socket already connected or connecting');
      return;
    }

    this.connectionAttempts++;
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      console.error('Max connection attempts reached, stopping');
      this.clearTokensAndRedirect();
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn('No auth token found, cannot connect to socket');
      toast.error('Authentication token missing. Please log in again.');
      return;
    }

    console.log('Attempting socket connection with token...');
    console.log('Connection attempt:', this.connectionAttempts, 'of', this.maxConnectionAttempts);
    console.log('Token format check:', isValidTokenFormat(token) ? 'valid' : 'invalid');
    console.log('Token sample:', token.substring(0, 50) + '...');
    console.log('Token length:', token.length);
    console.log('Token parts count:', token.split('.').length);
    
    // Debug: Decode token payload
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Token expires at:', new Date(payload.exp * 1000));
      console.log('Token issued at:', new Date(payload.iat * 1000));
      console.log('Current time:', new Date());
    } catch (e) {
      console.error('Failed to decode token payload:', e);
    }
    
    // Check if token is expired before attempting connection
    // Only do this if we can parse the token properly
    if (isValidTokenFormat(token) && isTokenExpired(token)) {
      console.warn('Token appears to be expired, attempting refresh...');
      this.handleTokenRefresh();
      return;
    }

    // Reset refresh attempts on successful token validation
    this.refreshAttempts = 0;
    console.log('Token appears valid, attempting socket connection...');

    try {
      // Disconnect any existing socket first
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: false  // We'll handle reconnection manually
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.isConnected = true;
        this.connectionAttempts = 0; // Reset on successful connection
        this.refreshAttempts = 0; // Reset on successful connection
        
        // Rejoin board if we were in one before disconnection
        if (this.currentBoardId) {
          console.log('Rejoining board after reconnection:', this.currentBoardId);
          this.socket.emit(SOCKET_EVENTS.BOARD_JOIN, { boardId: this.currentBoardId });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        
        // Don't auto-reconnect for auth errors
        if (reason !== 'io server disconnect') {
          console.log('Not attempting auto-reconnect for reason:', reason);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        
        if (error.message && error.message.includes('Authentication error')) {
          console.log('Authentication error detected, attempting token refresh...');
          this.handleTokenRefresh();
        } else {
          console.error('Non-auth socket error:', error.message);
          toast.error('Socket connection error. Please check your network.');
          
          // Retry connection after delay for non-auth errors
          setTimeout(() => {
            if (!this.isConnected && this.connectionAttempts < this.maxConnectionAttempts) {
              this.connect();
            }
          }, 5000);
        }
      });

      // Set up default event listeners
      this.setupDefaultListeners();

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      toast.error('Failed to initialize socket. Please try again later.');
    }
  }

  handleTokenRefresh() {
    const now = Date.now();
    
    // Check if we've exceeded max refresh attempts
    if (this.refreshAttempts >= this.maxRefreshAttempts) {
      console.error('Max refresh attempts reached, clearing tokens and redirecting to login');
      this.clearTokensAndRedirect();
      return;
    }
    
    // Prevent rapid refresh attempts (minimum 2 seconds between attempts)
    if (now - this.lastRefreshTime < 2000) {
      console.warn('Refresh attempted too recently, skipping');
      return;
    }
    
    this.refreshAttempts++;
    this.lastRefreshTime = now;
    
    console.log('Handling token refresh, attempt:', this.refreshAttempts);
    toast.error('Authentication error. Attempting to refresh token...');
    
    // Disconnect current socket before refreshing
    this.disconnect();
    
    // Attempt refresh
    this.refreshTokenAndConnect();
  }

  async refreshTokenAndConnect() {
    try {
      console.log('Attempting to refresh token... (attempt', this.refreshAttempts, 'of', this.maxRefreshAttempts, ')');
      
      const oldToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('Old token before refresh:', oldToken ? oldToken.substring(0, 20) + '...' : 'null');
      
      await refreshAuthToken();
      
      const newToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('New token after refresh:', newToken ? newToken.substring(0, 20) + '...' : 'null');
      console.log('Token refreshed successfully, retrying socket connection...');
      
      // Don't reset refresh attempts here - only reset on successful connection
      
      // Retry connection with new token after a short delay
      setTimeout(() => this.connect(), 1000);
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      if (this.refreshAttempts >= this.maxRefreshAttempts) {
        toast.error('Failed to refresh authentication after multiple attempts. Please log in again.');
        this.clearTokensAndRedirect();
      } else {
        toast.error('Failed to refresh authentication. Retrying...');
        // Retry after a delay with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.refreshAttempts - 1), 10000);
        setTimeout(() => this.refreshTokenAndConnect(), delay);
      }
    }
  }

  clearTokensAndRedirect() {
    console.log('clearTokensAndRedirect called - clearing tokens and redirecting to login');
    
    // Reset all counters
    this.connectionAttempts = 0;
    this.refreshAttempts = 0;
    this.lastRefreshTime = 0;
    
    // Disconnect socket
    this.disconnect();
    
    // Clear tokens and redirect to login
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Add a small delay to avoid immediate redirect during login process
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 1000);
  }

  // Method to reset the service for a fresh start
  reset() {
    this.disconnect();
    this.connectionAttempts = 0;
    this.refreshAttempts = 0;
    this.lastRefreshTime = 0;
  }

  disconnect() {
    if (this.socket) {
      if (this.currentBoardId) {
        this.leaveBoard(this.currentBoardId);
      }
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentBoardId = null;
    this.listeners.clear();
    // Don't reset connection attempts and refresh attempts here
    // as we might be disconnecting to reconnect
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    // Handle authentication errors
    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
      this.disconnect();
      toast.error('Authentication error. Please log in again.');
    });

    // Handle general errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    });
  }

  joinBoard(boardId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot join board');
      return;
    }

    if (this.currentBoardId === boardId) {
      console.log('Already in board', boardId);
      return; // Already in this board
    }

    // Leave current board if any
    if (this.currentBoardId) {
      this.leaveBoard(this.currentBoardId);
    }

    this.currentBoardId = boardId;
    this.socket.emit(SOCKET_EVENTS.BOARD_JOIN, { boardId });
    console.log(`Joined board: ${boardId}`);
  }

  leaveBoard(boardId) {
    if (!this.socket || !boardId) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.BOARD_LEAVE, { boardId });
    
    if (this.currentBoardId === boardId) {
      this.currentBoardId = null;
    }
    
    console.log(`Left board: ${boardId}`);
  }

  // Event listener management
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not available, cannot add listener');
      return;
    }

    this.socket.on(event, callback);
    
    // Keep track of listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off(event, callback);
    
    // Remove from our tracking
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }

  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit event');
      return;
    }

    this.socket.emit(event, data);
  }

  // Typing indicators
  startTyping(cardId) {
    this.emit(SOCKET_EVENTS.USER_TYPING, {
      cardId,
      boardId: this.currentBoardId,
      typing: true
    });
  }

  stopTyping(cardId) {
    this.emit(SOCKET_EVENTS.USER_TYPING, {
      cardId,
      boardId: this.currentBoardId,
      typing: false
    });
  }

  // Presence
  updatePresence(data) {
    this.emit(SOCKET_EVENTS.USER_PRESENCE, {
      boardId: this.currentBoardId,
      ...data
    });
  }

  // Convenience methods for common events
  onCardCreated(callback) {
    this.on(SOCKET_EVENTS.CARD_CREATED, callback);
  }

  onCardUpdated(callback) {
    this.on(SOCKET_EVENTS.CARD_UPDATED, callback);
  }

  onCardMoved(callback) {
    this.on(SOCKET_EVENTS.CARD_MOVED, callback);
  }

  onCardDeleted(callback) {
    this.on(SOCKET_EVENTS.CARD_DELETED, callback);
  }

  onListCreated(callback) {
    this.on(SOCKET_EVENTS.LIST_CREATED, callback);
  }

  onListUpdated(callback) {
    this.on(SOCKET_EVENTS.LIST_UPDATED, callback);
  }

  onListDeleted(callback) {
    this.on(SOCKET_EVENTS.LIST_DELETED, callback);
  }

  onCommentCreated(callback) {
    this.on(SOCKET_EVENTS.COMMENT_CREATED, callback);
  }

  onCommentUpdated(callback) {
    this.on(SOCKET_EVENTS.COMMENT_UPDATED, callback);
  }

  onCommentDeleted(callback) {
    this.on(SOCKET_EVENTS.COMMENT_DELETED, callback);
  }

  onUserTyping(callback) {
    this.on(SOCKET_EVENTS.USER_TYPING, callback);
  }

  onUserPresence(callback) {
    this.on(SOCKET_EVENTS.USER_PRESENCE, callback);
  }

  onBoardJoined(callback) {
    this.on(SOCKET_EVENTS.BOARD_JOINED, callback);
  }

  onUserJoined(callback) {
    this.on(SOCKET_EVENTS.USER_JOINED, callback);
  }

  onUserLeft(callback) {
    this.on(SOCKET_EVENTS.USER_LEFT, callback);
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getCurrentBoardId() {
    return this.currentBoardId;
  }

  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
