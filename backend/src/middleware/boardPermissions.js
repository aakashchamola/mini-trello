// Board permission middleware for Mini Trello
// Handles board access control for shared boards

const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');

// Check if user has access to a board (owner or member)
const checkBoardAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      console.log('checkBoardAccess called with params:', req.params);
      console.log('checkBoardAccess user:', req.user?.id);
      console.log('checkBoardAccess requiredRole:', requiredRole);
      
      const { boardId } = req.params;
      
      // Find board
      const board = await Board.findByPk(boardId);
      
      if (!board) {
        console.log('Board not found:', boardId);
        return res.status(404).json({
          error: 'Board not found',
          message: 'Board does not exist'
        });
      }
      
      console.log('Board found:', board.id, 'owner:', board.userId);

      // Check if user is board owner
      if (board.userId === req.user.id) {
        console.log('User is board owner');
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
      
      console.log('Board membership found:', !!membership);

      if (!membership) {
        console.log('Access denied - not a member');
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this board'
        });
      }
      
      console.log('User role:', membership.role);

      // Check role permissions if required
      if (requiredRole) {
        const hasPermission = checkRolePermission(membership.role, requiredRole);
        console.log('Permission check:', hasPermission, 'for role:', membership.role, 'required:', requiredRole);
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
