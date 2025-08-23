const Comment = require('../models/Comment');
const Card = require('../models/Card');
const User = require('../models/User');
const { createCommentSchema, updateCommentSchema } = require('../validation/commentValidation');
const { parseMentions, findMentionedUsers, createMentions } = require('../utils/mentionUtils');

const commentController = {
  // Create a new comment on a card
  async createComment(req, res) {
    try {
      const { boardId, listId, cardId } = req.params;
      const { error, value } = createCommentSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Board access is already checked by middleware
      const board = req.board;

      // Check if card exists in the board
      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: require('../models/List'),
          as: 'list',
          where: { boardId }
        }]
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this board'
        });
      }

      // Create the comment
      const comment = await Comment.create({
        content: value.content,
        cardId: parseInt(cardId),
        userId: req.user.id
      });

      // Handle mentions
      const mentionedUsernames = parseMentions(value.content);
      let mentionedUsers = [];
      let mentions = [];
      
      if (mentionedUsernames.length > 0) {
        mentionedUsers = await findMentionedUsers(mentionedUsernames, parseInt(boardId));
        if (mentionedUsers.length > 0) {
          mentions = await createMentions(
            comment.id, 
            parseInt(cardId), 
            parseInt(boardId), 
            req.user.id, 
            mentionedUsers
          );
        }
      }

      // Fetch the comment with author information
      const commentWithAuthor = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url']
        }]
      });

      // Emit real-time update to all clients on this board
      if (req.io) {
        console.log('Emitting comment:created event to board-' + boardId);
        req.io.to(`board-${boardId}`).emit('comment:created', {
          comment: commentWithAuthor,
          cardId: parseInt(cardId),
          listId: parseInt(listId),
          boardId: parseInt(boardId),
          action: 'created',
          timestamp: new Date().toISOString()
        });

        // Emit mention notifications to mentioned users
        if (mentions.length > 0) {
          mentionedUsers.forEach(mentionedUser => {
            // Don't notify the user who created the mention
            if (mentionedUser.id !== req.user.id) {
              req.io.to(`user-${mentionedUser.id}`).emit('mention:created', {
                mention: {
                  id: mentions.find(m => m.mentionedUserId === mentionedUser.id)?.id,
                  cardId: parseInt(cardId),
                  cardTitle: card.title,
                  boardId: parseInt(boardId),
                  boardTitle: board.title,
                  commentContent: value.content,
                  mentionedBy: {
                    id: req.user.id,
                    username: req.user.username,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name
                  }
                },
                timestamp: new Date().toISOString()
              });
            }
          });
        }
      } else {
        console.log('req.io is not available for comment creation');
      }

      res.status(201).json({
        comment: commentWithAuthor,
        message: 'Comment created successfully'
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create comment'
      });
    }
  },

  // Get all comments for a card
  async getCardComments(req, res) {
    try {
      const { boardId, listId, cardId } = req.params;

      // Board access is already checked by middleware
      const board = req.board;

      // Check if card exists in the board
      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: require('../models/List'),
          as: 'list',
          where: { boardId }
        }]
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this board'
        });
      }

      // Get all comments for the card
      const comments = await Comment.findAll({
        where: { cardId },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url']
        }],
        order: [['createdAt', 'DESC']] // Newest comments first
      });

      res.json({
        comments,
        cardId: parseInt(cardId),
        totalComments: comments.length
      });
    } catch (error) {
      console.error('Get card comments error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve comments'
      });
    }
  },

  // Update a comment
  async updateComment(req, res) {
    try {
      const { boardId, listId, cardId, commentId } = req.params;
      const { error, value } = updateCommentSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Board access is already checked by middleware
      const board = req.board;

      // Check if card exists in the board
      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: require('../models/List'),
          as: 'list',
          where: { boardId }
        }]
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this board'
        });
      }

      // Find the comment
      const comment = await Comment.findOne({
        where: {
          id: commentId,
          cardId
        }
      });

      if (!comment) {
        return res.status(404).json({
          error: 'Comment not found',
          message: 'Comment does not exist on this card'
        });
      }

      // Check if user owns the comment or has admin access
      if (comment.userId !== req.user.id && req.userBoardRole !== 'admin' && req.userBoardRole !== 'owner') {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You can only edit your own comments'
        });
      }

      // Update the comment
      await comment.update({
        content: value.content
      });

      // Fetch updated comment with author
      const updatedComment = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url']
        }]
      });

      // Emit real-time update to all clients on this board
      if (req.io) {
        console.log('Emitting comment:updated event to board-' + boardId);
        req.io.to(`board-${boardId}`).emit('comment:updated', {
          comment: updatedComment,
          cardId: parseInt(cardId),
          listId: parseInt(listId),
          boardId: parseInt(boardId),
          action: 'updated',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('req.io is not available for comment update');
      }

      res.json({
        comment: updatedComment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update comment'
      });
    }
  },

  // Delete a comment
  async deleteComment(req, res) {
    try {
      const { boardId, listId, cardId, commentId } = req.params;

      // Board access is already checked by middleware
      const board = req.board;

      // Check if card exists in the board
      const card = await Card.findOne({
        where: {
          id: cardId,
          listId
        },
        include: [{
          model: require('../models/List'),
          as: 'list',
          where: { boardId }
        }]
      });

      if (!card) {
        return res.status(404).json({
          error: 'Card not found',
          message: 'Card does not exist in this board'
        });
      }

      // Find the comment
      const comment = await Comment.findOne({
        where: {
          id: commentId,
          cardId
        }
      });

      if (!comment) {
        return res.status(404).json({
          error: 'Comment not found',
          message: 'Comment does not exist on this card'
        });
      }

      // Check if user owns the comment or has admin access
      if (comment.userId !== req.user.id && req.userBoardRole !== 'admin' && req.userBoardRole !== 'owner') {
        return res.status(403).json({
          error: 'Permission denied',
          message: 'You can only delete your own comments'
        });
      }

      // Delete the comment
      await comment.destroy();

      // Emit real-time update to all clients on this board
      if (req.io) {
        console.log('Emitting comment:deleted event to board-' + boardId);
        req.io.to(`board-${boardId}`).emit('comment:deleted', {
          commentId: parseInt(commentId),
          cardId: parseInt(cardId),
          listId: parseInt(listId),
          boardId: parseInt(boardId),
          action: 'deleted',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('req.io is not available for comment deletion');
      }

      res.json({
        message: 'Comment deleted successfully',
        commentId: parseInt(commentId)
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete comment'
      });
    }
  }
};

module.exports = commentController;
