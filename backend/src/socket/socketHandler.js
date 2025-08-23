const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> { socketId, boardId, userInfo }
    this.boardRooms = new Map(); // boardId -> Set of userIds
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log('Socket auth - Token received:', token ? token.substring(0, 50) + '...' : 'null');
        
        if (!token) {
          console.log('Socket auth - No token provided');
          return next(new Error('No authentication token provided. Please log in again.'));
        }

        console.log('Socket auth - Attempting to verify token...');
        const decoded = verifyAccessToken(token);
        console.log('Socket auth - Token decoded successfully:', { userId: decoded.userId, type: decoded.type });
        
        const user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        });

        if (!user) {
          console.log('Socket auth - User not found for userId:', decoded.userId);
          return next(new Error('User account not found. Please log in again.'));
        }

        console.log('Socket auth - User found:', user.username);
        socket.userId = user.id;
        socket.userInfo = user;
        next();
      } catch (error) {
        console.error('Socket auth - Error:', error.message);
        console.error('Socket auth - Full error:', error);
        
        // Send more specific error messages based on the error type
        if (error.message.includes('expired')) {
          return next(new Error('Your session has expired. Please log in again.'));
        } else if (error.message.includes('invalid signature')) {
          return next(new Error('Invalid authentication token. Please log in again.'));
        } else if (error.message.includes('malformed')) {
          return next(new Error('Corrupted authentication token. Please log in again.'));
        } else {
          return next(new Error('Authentication failed. Please log in again.'));
        }
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userInfo.username} connected: ${socket.id}`);
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const userInfo = socket.userInfo;

    // Store connected user
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      boardId: null,
      userInfo: userInfo
    });

    // Handle joining a board
    socket.on('join-board', async (data) => {
      try {
        console.log(`Socket ${socket.id} attempting to join board ${data.boardId}`);
        await this.handleJoinBoard(socket, data);
      } catch (error) {
        console.error('Error joining board:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle leaving a board
    socket.on('leave-board', (data) => {
      this.handleLeaveBoard(socket, data);
    });

    // Handle card move events
    socket.on('card-moved', (data) => {
      this.handleCardMoved(socket, data);
    });

    // Handle list move events
    socket.on('list-moved', (data) => {
      this.handleListMoved(socket, data);
    });

    // Handle drag start events
    socket.on('drag-start', (data) => {
      this.handleDragStart(socket, data);
    });

    // Handle drag end events
    socket.on('drag-end', (data) => {
      this.handleDragEnd(socket, data);
    });

    // Handle bulk position updates
    socket.on('bulk-position-update', (data) => {
      this.handleBulkPositionUpdate(socket, data);
    });

    // Handle card updates
    socket.on('card-updated', (data) => {
      this.handleCardUpdated(socket, data);
    });

    // Handle new comments
    socket.on('comment-added', (data) => {
      this.handleCommentAdded(socket, data);
    });

    // Handle comment updates
    socket.on('comment-updated', (data) => {
      this.handleCommentUpdated(socket, data);
    });

    // Handle list updates
    socket.on('list-updated', (data) => {
      this.handleListUpdated(socket, data);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing-stop', (data) => {
      this.handleTypingStop(socket, data);
    });

    // Handle cursor position (for future presence features)
    socket.on('cursor-position', (data) => {
      this.handleCursorPosition(socket, data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  async handleJoinBoard(socket, data) {
    const { boardId } = data;
    const userId = socket.userId;

    // Verify user has access to the board
    const boardMember = await BoardMember.findOne({
      where: { boardId, userId }
    });

    if (!boardMember) {
      throw new Error('Access denied: You are not a member of this board');
    }

    // Leave current board if any
    const currentConnection = this.connectedUsers.get(userId);
    if (currentConnection && currentConnection.boardId) {
      this.handleLeaveBoard(socket, { boardId: currentConnection.boardId });
    }

    // Join the board room
    socket.join(`board-${boardId}`);
    
    // Update user's current board
    this.connectedUsers.set(userId, {
      ...currentConnection,
      boardId: boardId
    });

    // Add user to board room tracking
    if (!this.boardRooms.has(boardId)) {
      this.boardRooms.set(boardId, new Set());
    }
    this.boardRooms.get(boardId).add(userId);

    // Get board info
    const board = await Board.findByPk(boardId);

    // Notify other users in the board
    socket.to(`board-${boardId}`).emit('user-joined', {
      user: socket.userInfo,
      boardId: boardId,
      timestamp: new Date().toISOString()
    });

    // Send current board users to the joining user
    const boardUsers = Array.from(this.boardRooms.get(boardId))
      .map(id => this.connectedUsers.get(id)?.userInfo)
      .filter(Boolean);

    socket.emit('board-joined', {
      boardId: boardId,
      boardName: board.title,
      connectedUsers: boardUsers,
      timestamp: new Date().toISOString()
    });

    console.log(`User ${socket.userInfo.username} joined board ${boardId}`);
  }

  handleLeaveBoard(socket, data) {
    const { boardId } = data;
    const userId = socket.userId;

    // Leave the socket room
    socket.leave(`board-${boardId}`);

    // Remove from board room tracking
    if (this.boardRooms.has(boardId)) {
      this.boardRooms.get(boardId).delete(userId);
      if (this.boardRooms.get(boardId).size === 0) {
        this.boardRooms.delete(boardId);
      }
    }

    // Update user's current board
    const currentConnection = this.connectedUsers.get(userId);
    if (currentConnection) {
      this.connectedUsers.set(userId, {
        ...currentConnection,
        boardId: null
      });
    }

    // Notify other users in the board
    socket.to(`board-${boardId}`).emit('user-left', {
      user: socket.userInfo,
      boardId: boardId,
      timestamp: new Date().toISOString()
    });

    console.log(`User ${socket.userInfo.username} left board ${boardId}`);
  }

  handleCardMoved(socket, data) {
    const { cardId, fromListId, toListId, newPosition, cardData } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast card move to all other users in the board
    socket.to(`board-${boardId}`).emit('card-moved', {
      cardId,
      fromListId,
      toListId,
      newPosition,
      cardData,
      movedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`Card ${cardId} moved by ${socket.userInfo.username} from list ${fromListId} to ${toListId}`);
  }

  handleCardUpdated(socket, data) {
    const { cardId, updates, cardData } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast card update to all other users in the board
    socket.to(`board-${boardId}`).emit('card-updated', {
      cardId,
      updates,
      cardData,
      updatedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`Card ${cardId} updated by ${socket.userInfo.username}`);
  }

  handleCommentAdded(socket, data) {
    const { cardId, comment } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast new comment to all other users in the board
    socket.to(`board-${boardId}`).emit('comment-added', {
      cardId,
      comment,
      addedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`Comment added to card ${cardId} by ${socket.userInfo.username}`);
  }

  handleCommentUpdated(socket, data) {
    const { cardId, commentId, comment } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast comment update to all other users in the board
    socket.to(`board-${boardId}`).emit('comment-updated', {
      cardId,
      commentId,
      comment,
      updatedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`Comment ${commentId} updated by ${socket.userInfo.username}`);
  }

  handleListUpdated(socket, data) {
    const { listId, updates, listData } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast list update to all other users in the board
    socket.to(`board-${boardId}`).emit('list-updated', {
      listId,
      updates,
      listData,
      updatedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`List ${listId} updated by ${socket.userInfo.username}`);
  }

  handleTypingStart(socket, data) {
    const { cardId, location } = data; // location could be 'description' or 'comment'
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast typing indicator to all other users in the board
    socket.to(`board-${boardId}`).emit('typing-start', {
      cardId,
      location,
      user: socket.userInfo,
      timestamp: new Date().toISOString()
    });
  }

  handleTypingStop(socket, data) {
    const { cardId, location } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast typing stop to all other users in the board
    socket.to(`board-${boardId}`).emit('typing-stop', {
      cardId,
      location,
      user: socket.userInfo,
      timestamp: new Date().toISOString()
    });
  }

  handleCursorPosition(socket, data) {
    const { x, y, element } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId) {
      return;
    }

    const boardId = currentConnection.boardId;

    // Broadcast cursor position to all other users in the board
    socket.to(`board-${boardId}`).emit('cursor-position', {
      user: socket.userInfo,
      x,
      y,
      element,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnection(socket) {
    const userId = socket.userId;
    const userInfo = socket.userInfo;

    if (!userId) return;

    const currentConnection = this.connectedUsers.get(userId);
    
    if (currentConnection && currentConnection.boardId) {
      const boardId = currentConnection.boardId;
      
      // Remove from board room tracking
      if (this.boardRooms.has(boardId)) {
        this.boardRooms.get(boardId).delete(userId);
        if (this.boardRooms.get(boardId).size === 0) {
          this.boardRooms.delete(boardId);
        }
      }

      // Notify other users in the board
      socket.to(`board-${boardId}`).emit('user-left', {
        user: userInfo,
        boardId: boardId,
        timestamp: new Date().toISOString()
      });
    }

    // Remove from connected users
    this.connectedUsers.delete(userId);

    console.log(`User ${userInfo.username} disconnected: ${socket.id}`);
  }

  // Utility method to broadcast activity events
  broadcastActivity(boardId, activity) {
    this.io.to(`board-${boardId}`).emit('activity-added', {
      activity,
      timestamp: new Date().toISOString()
    });
  }

  // Handle list move events
  handleListMoved(socket, data) {
    const { listId, newPosition, boardId, listData } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId || currentConnection.boardId != boardId) {
      return;
    }

    // Broadcast list move to all other users in the board
    socket.to(`board-${boardId}`).emit('list-moved', {
      listId,
      newPosition,
      listData,
      movedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`List ${listId} moved by ${socket.userInfo.username} to position ${newPosition}`);
  }

  // Handle drag start events (visual feedback)
  handleDragStart(socket, data) {
    const { type, id, boardId } = data; // type: 'card' or 'list'
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId || currentConnection.boardId != boardId) {
      return;
    }

    // Broadcast drag start to show visual indicators to other users
    socket.to(`board-${boardId}`).emit('drag-start', {
      type,
      id,
      draggedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`${type} ${id} drag started by ${socket.userInfo.username}`);
  }

  // Handle drag end events
  handleDragEnd(socket, data) {
    const { type, id, boardId } = data;
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId || currentConnection.boardId != boardId) {
      return;
    }

    // Broadcast drag end to remove visual indicators
    socket.to(`board-${boardId}`).emit('drag-end', {
      type,
      id,
      draggedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`${type} ${id} drag ended by ${socket.userInfo.username}`);
  }

  // Handle bulk position updates (for performance optimization)
  handleBulkPositionUpdate(socket, data) {
    const { updates, boardId } = data; // updates: [{ type, id, position, listId? }]
    const userId = socket.userId;
    const currentConnection = this.connectedUsers.get(userId);

    if (!currentConnection || !currentConnection.boardId || currentConnection.boardId != boardId) {
      return;
    }

    // Broadcast bulk updates to all other users in the board
    socket.to(`board-${boardId}`).emit('bulk-position-update', {
      updates,
      updatedBy: socket.userInfo,
      timestamp: new Date().toISOString()
    });

    console.log(`Bulk position update by ${socket.userInfo.username}: ${updates.length} items`);
  }

  // Get connected users for a board
  getBoardUsers(boardId) {
    if (!this.boardRooms.has(boardId)) {
      return [];
    }

    return Array.from(this.boardRooms.get(boardId))
      .map(userId => this.connectedUsers.get(userId)?.userInfo)
      .filter(Boolean);
  }

  // Check if user is connected to a board
  isUserConnectedToBoard(userId, boardId) {
    const connection = this.connectedUsers.get(userId);
    return connection && connection.boardId === boardId;
  }
}

module.exports = SocketHandler;
