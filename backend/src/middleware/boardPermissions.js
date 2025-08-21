// Board permission middleware for Mini Trello
// Handles board access control for shared boards

const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');

// Check if user has access to a board (owner or member)
const checkBoardAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const { boardId } = req.params;
      
      // Find board
      const board = await Board.findByPk(boardId);
      
      if (!board) {
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist'
        });
      }

      // Check if user is board owner
      if (board.userId === req.user.id) {
        req.userBoardRole = 'owner';
        req.board = board;
        return next();
      }

      // Check if user is a board member
      const membership = await BoardMember.findOne({
        where: {
          boardId,
          userId: req.user.id,
          status: 'accepted'
        }
      });

      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this board'
        });
      }

      // Check role permissions if required
      if (requiredRole) {
        const hasPermission = checkRolePermission(membership.role, requiredRole);
        if (!hasPermission) {
          return res.status(403).json({
            error: 'Permission denied',
            message: `This action requires ${requiredRole} permissions`
          });
        }
      }

      req.userBoardRole = membership.role;
      req.board = board;
      req.membership = membership;
      next();
    } catch (error) {
      console.error('Board access check error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check board access'
      });
    }
  };
};

// Check if user role has required permissions
const checkRolePermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'viewer': 1,
    'editor': 2,
    'admin': 3,
    'owner': 4
  };

  const requiredLevel = roleHierarchy[requiredRole];
  const userLevel = roleHierarchy[userRole];

  return userLevel >= requiredLevel;
};

// Specific permission checks
const canRead = checkBoardAccess();
const canEdit = checkBoardAccess('editor');
const canAdmin = checkBoardAccess('admin');

module.exports = {
  checkBoardAccess,
  checkRolePermission,
  canRead,
  canEdit,
  canAdmin
};
