const User = require('../models/User');
const BoardMember = require('../models/BoardMember');

/**
 * Parse mentions from comment content
 * @param {string} content - The comment content
 * @returns {Array} Array of usernames mentioned
 */
const parseMentions = (content) => {
  if (!content) return [];
  
  // Regular expression to match @username patterns
  // Supports alphanumeric characters, underscores, and hyphens
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    if (username && !mentions.includes(username)) {
      mentions.push(username);
    }
  }
  
  return mentions;
};

/**
 * Find valid board members from mentioned usernames
 * @param {Array} usernames - Array of mentioned usernames
 * @param {number} boardId - Board ID to check membership
 * @returns {Array} Array of valid user objects
 */
const findMentionedUsers = async (usernames, boardId) => {
  if (!usernames || usernames.length === 0) return [];
  
  try {
    // Find users with the mentioned usernames who are members of the board
    const boardMembers = await BoardMember.findAll({
      where: {
        boardId,
        status: 'accepted'
      },
      include: [{
        model: User,
        as: 'user',
        where: {
          username: usernames
        },
        attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url']
      }]
    });
    
    // Also check board owner (who might not have a BoardMember entry)
    const { Board } = require('../models');
    const board = await Board.findByPk(boardId, {
      include: [{
        model: User,
        as: 'owner',
        where: {
          username: usernames
        },
        attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url'],
        required: false
      }]
    });
    
    const mentionedUsers = [];
    
    // Add board members
    boardMembers.forEach(member => {
      if (member.user) {
        mentionedUsers.push(member.user);
      }
    });
    
    // Add board owner if mentioned and not already included
    if (board?.owner && !mentionedUsers.find(u => u.id === board.owner.id)) {
      mentionedUsers.push(board.owner);
    }
    
    return mentionedUsers;
  } catch (error) {
    console.error('Error finding mentioned users:', error);
    return [];
  }
};

/**
 * Create mention records in database
 * @param {number} commentId - Comment ID
 * @param {number} cardId - Card ID
 * @param {number} boardId - Board ID
 * @param {number} mentionedByUserId - User ID who created the mention
 * @param {Array} mentionedUsers - Array of mentioned user objects
 * @returns {Array} Array of created mention records
 */
const createMentions = async (commentId, cardId, boardId, mentionedByUserId, mentionedUsers) => {
  if (!mentionedUsers || mentionedUsers.length === 0) return [];
  
  try {
    const { Mention } = require('../models');
    
    // Filter out the user who is creating the mention (prevent self-mentions)
    const validMentionedUsers = mentionedUsers.filter(user => user.id !== mentionedByUserId);
    
    if (validMentionedUsers.length === 0) return [];
    
    const mentionData = validMentionedUsers.map(user => ({
      commentId,
      cardId,
      boardId,
      mentionedUserId: user.id,
      mentionedByUserId,
      isRead: false
    }));
    
    const mentions = await Mention.bulkCreate(mentionData);
    return mentions;
  } catch (error) {
    console.error('Error creating mentions:', error);
    return [];
  }
};

/**
 * Get unread mention count for a user on a specific card
 * @param {number} userId - User ID
 * @param {number} cardId - Card ID
 * @returns {number} Count of unread mentions
 */
const getUnreadMentionCount = async (userId, cardId) => {
  try {
    const { Mention } = require('../models');
    
    const count = await Mention.count({
      where: {
        mentionedUserId: userId,
        cardId,
        isRead: false
      }
    });
    
    return count;
  } catch (error) {
    console.error('Error getting unread mention count:', error);
    return 0;
  }
};

/**
 * Mark mentions as read for a user on a specific card
 * @param {number} userId - User ID
 * @param {number} cardId - Card ID
 * @returns {boolean} Success status
 */
const markMentionsAsRead = async (userId, cardId) => {
  try {
    const { Mention } = require('../models');
    
    await Mention.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          mentionedUserId: userId,
          cardId,
          isRead: false
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error marking mentions as read:', error);
    return false;
  }
};

/**
 * Get all unread mentions for a user across all boards
 * @param {number} userId - User ID
 * @returns {Array} Array of unread mention objects with card and board info
 */
const getUserUnreadMentions = async (userId) => {
  try {
    const { Mention, Card, Board, Comment, User } = require('../models');
    
    const mentions = await Mention.findAll({
      where: {
        mentionedUserId: userId,
        isRead: false
      },
      include: [
        {
          model: Card,
          as: 'card',
          attributes: ['id', 'title']
        },
        {
          model: Board,
          as: 'board',
          attributes: ['id', 'title']
        },
        {
          model: Comment,
          as: 'comment',
          attributes: ['id', 'content', 'createdAt']
        },
        {
          model: User,
          as: 'mentionedByUser',
          attributes: ['id', 'username', 'first_name', 'last_name', 'avatar_url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return mentions;
  } catch (error) {
    console.error('Error getting user unread mentions:', error);
    return [];
  }
};

module.exports = {
  parseMentions,
  findMentionedUsers,
  createMentions,
  getUnreadMentionCount,
  markMentionsAsRead,
  getUserUnreadMentions
};
