// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
export const UPLOAD_MAX_SIZE = parseInt(process.env.REACT_APP_UPLOAD_MAX_SIZE) || 5242880; // 5MB
export const WEBSOCKET_ENABLED = process.env.REACT_APP_WEBSOCKET_ENABLED !== 'false'; // Enable by default

// App Configuration
export const APP_NAME = process.env.REACT_APP_NAME || 'Mini Trello';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';

// UI Configuration
export const SIDEBAR_WIDTH = 300;
export const CARD_WIDTH = 280;
export const LIST_WIDTH = 300;

// Colors
export const COLORS = {
  primary: '#0079bf',
  secondary: '#026aa7',
  success: '#61bd4f',
  warning: '#f2d600',
  danger: '#eb5a46',
  info: '#00c2e0',
  light: '#f4f5f7',
  dark: '#172b4d',
  gray: '#6b778c',
  white: '#ffffff'
};

// Board Background Colors
export const BOARD_COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632', '#89609e', '#cd5a91',
  '#4bbf6b', '#00aecc', '#838c91'
];

export const BOARD_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  WORKSPACE: 'workspace'
};

// Card Label Colors
export const LABEL_COLORS = [
  { name: 'Green', color: '#61bd4f' },
  { name: 'Yellow', color: '#f2d600' },
  { name: 'Orange', color: '#ff9f1a' },
  { name: 'Red', color: '#eb5a46' },
  { name: 'Purple', color: '#c377e0' },
  { name: 'Blue', color: '#0079bf' },
  { name: 'Sky', color: '#00c2e0' },
  { name: 'Lime', color: '#51e898' },
  { name: 'Pink', color: '#ff78cb' },
  { name: 'Black', color: '#344563' }
];

// Roles and Permissions
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  OBSERVER: 'observer'
};

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  INVITE: 'invite'
};

// Socket Events
export const SOCKET_EVENTS = {
  BOARD_JOIN: 'join-board',
  BOARD_LEAVE: 'leave-board',
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_MOVED: 'card:moved',
  CARD_DELETED: 'card:deleted',
  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  USER_TYPING: 'user:typing',
  USER_PRESENCE: 'user:presence'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'mini_trello_token',
  REFRESH_TOKEN: 'mini_trello_refresh_token',
  USER: 'mini_trello_user',
  THEME: 'mini_trello_theme',
  SIDEBAR_COLLAPSED: 'mini_trello_sidebar_collapsed'
};

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  WORKSPACES: {
    BASE: '/workspaces',
    BY_ID: (id) => `/workspaces/${id}`,
    INVITE: (id) => `/workspaces/${id}/invite`,
    MEMBERS: (id) => `/workspaces/${id}/members`
  },
  BOARDS: {
    BASE: '/boards',
    BY_ID: (id) => `/boards/${id}`,
    INVITE: (boardId) => `/boards/${boardId}/invite`,
    MEMBERS: (boardId) => `/boards/${boardId}/members`,
    ACTIVITIES: (boardId) => `/boards/${boardId}/activities`,
    PRESENCE: (boardId) => `/boards/${boardId}/presence`
  },
  LISTS: {
    BY_BOARD: (boardId) => `/boards/${boardId}/lists`,
    BY_ID: (boardId, listId) => `/boards/${boardId}/lists/${listId}`,
    REORDER: (boardId) => `/boards/${boardId}/lists/reorder`
  },
  CARDS: {
    BY_LIST: (boardId, listId) => `/boards/${boardId}/lists/${listId}/cards`,
    BY_BOARD: (boardId) => `/boards/${boardId}/cards`,
    SEARCH: (boardId) => `/boards/${boardId}/cards/search`,
    BY_ID: (boardId, listId, cardId) => `/boards/${boardId}/lists/${listId}/cards/${cardId}`,
    MOVE: (boardId, listId, cardId) => `/boards/${boardId}/lists/${listId}/cards/${cardId}/move`
  },
  COMMENTS: {
    BY_CARD: (boardId, listId, cardId) => `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`,
    BY_ID: (boardId, listId, cardId, commentId) => `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`
  },
  INVITATIONS: '/invitations'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  INPUT: 'yyyy-MM-dd\'T\'HH:mm'
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  COMMENT_MAX_LENGTH: 1000
};
