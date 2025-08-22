import { io } from 'socket.io-client';
import { SOCKET_URL, WEBSOCKET_ENABLED, SOCKET_EVENTS, STORAGE_KEYS } from '../config/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentBoardId = null;
    this.listeners = new Map();
  }

  connect() {
    if (!WEBSOCKET_ENABLED || this.socket) {
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn('No auth token found, cannot connect to socket');
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        
        // Attempt to reconnect if disconnection was not intentional
        if (reason === 'io server disconnect') {
          this.socket.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });

      // Set up default event listeners
      this.setupDefaultListeners();

    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      if (this.currentBoardId) {
        this.leaveBoard(this.currentBoardId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentBoardId = null;
      this.listeners.clear();
    }
  }

  setupDefaultListeners() {
    if (!this.socket) return;

    // Handle authentication errors
    this.socket.on('auth_error', (error) => {
      console.error('Socket auth error:', error);
      this.disconnect();
    });

    // Handle general errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
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
