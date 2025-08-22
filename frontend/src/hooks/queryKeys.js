// Query Keys for consistent cache management
export const queryKeys = {
  // Auth
  user: ['user'],
  
  // Boards
  boards: ['boards'],
  userBoards: ['boards', 'user'],
  board: (boardId) => ['boards', boardId],
  boardMembers: (boardId) => ['boards', boardId, 'members'],
  boardActivities: (boardId) => ['boards', boardId, 'activities'],
  
  // Lists
  lists: ['lists'],
  boardLists: (boardId) => ['boards', boardId, 'lists'],
  list: (listId) => ['lists', listId],
  
  // Cards
  cards: ['cards'],
  listCards: (listId) => ['lists', listId, 'cards'],
  card: (cardId) => ['cards', cardId],
  cardComments: (cardId) => ['cards', cardId, 'comments'],
  
  // Workspaces
  workspaces: ['workspaces'],
  userWorkspaces: ['workspaces', 'user'],
  workspace: (workspaceId) => ['workspaces', workspaceId],
  workspaceMembers: (workspaceId) => ['workspaces', workspaceId, 'members'],
  
  // Comments
  comments: ['comments'],
  comment: (commentId) => ['comments', commentId],
};
