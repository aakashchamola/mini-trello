const Activity = require('../models/Activity');
const Card = require('../models/Card');
const List = require('../models/List');
const Comment = require('../models/Comment');

class BoardEvents {
  constructor(socketHandler) {
    this.socketHandler = socketHandler;
  }

  // Emit card creation event
  async emitCardCreated(boardId, card, createdBy) {
    try {
      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: createdBy.id,
        action: 'created',
        entityType: 'card',
        entityId: card.id,
        details: `Created card "${card.title}"`,
        oldValue: null,
        newValue: {
          title: card.title,
          description: card.description,
          listId: card.listId
        }
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: createdBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('card-created', {
        card,
        createdBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Card created event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting card created event:', error);
    }
  }

  // Emit card update event
  async emitCardUpdated(boardId, cardId, oldCard, newCard, updatedBy, changes) {
    try {
      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: updatedBy.id,
        action: 'updated',
        entityType: 'card',
        entityId: cardId,
        details: `Updated card "${newCard.title}"`,
        oldValue: oldCard,
        newValue: changes
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: updatedBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('card-updated-server', {
        cardId,
        oldCard,
        newCard,
        changes,
        updatedBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Card updated event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting card updated event:', error);
    }
  }

  // Emit card move event
  async emitCardMoved(boardId, cardId, fromListId, toListId, card, movedBy) {
    try {
      // Get list names for better activity description
      const [fromList, toList] = await Promise.all([
        List.findByPk(fromListId, { attributes: ['title'] }),
        List.findByPk(toListId, { attributes: ['title'] })
      ]);

      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: movedBy.id,
        action: 'moved',
        entityType: 'card',
        entityId: cardId,
        details: `Moved card "${card.title}" from "${fromList?.title}" to "${toList?.title}"`,
        oldValue: { listId: fromListId, listName: fromList?.title },
        newValue: { listId: toListId, listName: toList?.title }
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: movedBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('card-moved-server', {
        cardId,
        fromListId,
        toListId,
        card,
        fromListName: fromList?.title,
        toListName: toList?.title,
        movedBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Card moved event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting card moved event:', error);
    }
  }

  // Emit card deletion event
  async emitCardDeleted(boardId, cardId, cardTitle, deletedBy) {
    try {
      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: deletedBy.id,
        action: 'deleted',
        entityType: 'card',
        entityId: cardId,
        details: `Deleted card "${cardTitle}"`,
        oldValue: { title: cardTitle },
        newValue: null
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: deletedBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('card-deleted', {
        cardId,
        cardTitle,
        deletedBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Card deleted event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting card deleted event:', error);
    }
  }

  // Emit comment creation event
  async emitCommentCreated(boardId, cardId, comment, createdBy) {
    try {
      // Get card title for activity
      const card = await Card.findByPk(cardId, { attributes: ['title'] });

      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: createdBy.id,
        action: 'commented',
        entityType: 'comment',
        entityId: comment.id,
        details: `Commented on card "${card?.title}"`,
        oldValue: null,
        newValue: { text: comment.text, cardId: cardId }
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: createdBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('comment-created', {
        cardId,
        comment,
        createdBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Comment created event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting comment created event:', error);
    }
  }

  // Emit comment update event
  async emitCommentUpdated(boardId, cardId, commentId, oldComment, newComment, updatedBy) {
    try {
      // Get card title for activity
      const card = await Card.findByPk(cardId, { attributes: ['title'] });

      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: updatedBy.id,
        action: 'updated',
        entityType: 'comment',
        entityId: commentId,
        details: `Updated comment on card "${card?.title}"`,
        oldValue: { text: oldComment.text },
        newValue: { text: newComment.text }
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: updatedBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('comment-updated-server', {
        cardId,
        commentId,
        oldComment,
        newComment,
        updatedBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Comment updated event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting comment updated event:', error);
    }
  }

  // Emit list creation event
  async emitListCreated(boardId, list, createdBy) {
    try {
      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: createdBy.id,
        action: 'created',
        entityType: 'list',
        entityId: list.id,
        details: `Created list "${list.title}"`,
        oldValue: null,
        newValue: { title: list.title, position: list.position }
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: createdBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('list-created', {
        list,
        createdBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`List created event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting list created event:', error);
    }
  }

  // Emit list update event
  async emitListUpdated(boardId, listId, oldList, newList, updatedBy, changes) {
    try {
      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: updatedBy.id,
        action: 'updated',
        entityType: 'list',
        entityId: listId,
        details: `Updated list "${newList.title}"`,
        oldValue: oldList,
        newValue: changes
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: updatedBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('list-updated-server', {
        listId,
        oldList,
        newList,
        changes,
        updatedBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`List updated event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting list updated event:', error);
    }
  }

  // Emit board update event
  async emitBoardUpdated(boardId, oldBoard, newBoard, updatedBy, changes) {
    try {
      // Create activity log
      const activity = await Activity.create({
        boardId: boardId,
        userId: updatedBy.id,
        action: 'updated',
        entityType: 'board',
        entityId: boardId,
        details: `Updated board "${newBoard.title}"`,
        oldValue: oldBoard,
        newValue: changes
      });

      // Include user info in activity
      const activityWithUser = {
        ...activity.toJSON(),
        user: updatedBy
      };

      // Broadcast to all board members
      this.socketHandler.io.to(`board-${boardId}`).emit('board-updated', {
        boardId,
        oldBoard,
        newBoard,
        changes,
        updatedBy,
        activity: activityWithUser,
        timestamp: new Date().toISOString()
      });

      // Also broadcast activity
      this.socketHandler.broadcastActivity(boardId, activityWithUser);

      console.log(`Board updated event broadcasted for board ${boardId}`);
    } catch (error) {
      console.error('Error emitting board updated event:', error);
    }
  }

  // Emit user joined board event
  emitUserJoined(boardId, user) {
    this.socketHandler.io.to(`board-${boardId}`).emit('user-joined-board', {
      boardId,
      user,
      timestamp: new Date().toISOString()
    });

    console.log(`User joined event broadcasted for board ${boardId}`);
  }

  // Emit user left board event
  emitUserLeft(boardId, user) {
    this.socketHandler.io.to(`board-${boardId}`).emit('user-left-board', {
      boardId,
      user,
      timestamp: new Date().toISOString()
    });

    console.log(`User left event broadcasted for board ${boardId}`);
  }

  // Get board presence (connected users)
  getBoardPresence(boardId) {
    return this.socketHandler.getBoardUsers(boardId);
  }

  // Emit typing indicators
  emitTypingIndicator(boardId, user, cardId, location, isTyping) {
    const event = isTyping ? 'user-typing-start' : 'user-typing-stop';
    
    this.socketHandler.io.to(`board-${boardId}`).emit(event, {
      boardId,
      cardId,
      location,
      user,
      timestamp: new Date().toISOString()
    });
  }

  // Emit cursor position for presence
  emitCursorPosition(boardId, user, position) {
    this.socketHandler.io.to(`board-${boardId}`).emit('cursor-moved', {
      boardId,
      user,
      position,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = BoardEvents;
