import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { boardAPI, listAPI, cardAPI, commentAPI, workspaceAPI, handleAPIError } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  workspaces: [],
  boards: [],
  currentBoard: null,
  selectedCard: null,
  lists: [],
  cards: [],
  comments: {},
  activities: [],
  boardMembers: [],
  connectedUsers: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  activeFilters: {
    labels: [],
    assignees: [],
    dueDateFrom: null,
    dueDateTo: null
  },
  filters: {
    search: '',
    labels: [],
    assignees: [],
    dueDateFrom: null,
    dueDateTo: null
  },
  sidebar: {
    isOpen: false,
    activeTab: 'activity' // activity, members, settings
  }
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Workspaces
  SET_WORKSPACES: 'SET_WORKSPACES',
  ADD_WORKSPACE: 'ADD_WORKSPACE',
  UPDATE_WORKSPACE: 'UPDATE_WORKSPACE',
  REMOVE_WORKSPACE: 'REMOVE_WORKSPACE',
  
  // Boards
  SET_BOARDS: 'SET_BOARDS',
  SET_CURRENT_BOARD: 'SET_CURRENT_BOARD',
  ADD_BOARD: 'ADD_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  REMOVE_BOARD: 'REMOVE_BOARD',
  
  // Lists
  SET_LISTS: 'SET_LISTS',
  ADD_LIST: 'ADD_LIST',
  UPDATE_LIST: 'UPDATE_LIST',
  REMOVE_LIST: 'REMOVE_LIST',
  REORDER_LISTS: 'REORDER_LISTS',
  
  // Cards
  SET_CARDS: 'SET_CARDS',
  ADD_CARD: 'ADD_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  REMOVE_CARD: 'REMOVE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  SET_SELECTED_CARD: 'SET_SELECTED_CARD',
  
  // Comments
  SET_COMMENTS: 'SET_COMMENTS',
  ADD_COMMENT: 'ADD_COMMENT',
  UPDATE_COMMENT: 'UPDATE_COMMENT',
  REMOVE_COMMENT: 'REMOVE_COMMENT',
  
  // Activities
  SET_ACTIVITIES: 'SET_ACTIVITIES',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  
  // Members and Presence
  SET_BOARD_MEMBERS: 'SET_BOARD_MEMBERS',
  SET_CONNECTED_USERS: 'SET_CONNECTED_USERS',
  
  // UI State
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_ACTIVE_FILTERS: 'SET_ACTIVE_FILTERS',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_TAB: 'SET_SIDEBAR_TAB'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };

    // Workspaces
    case ACTION_TYPES.SET_WORKSPACES:
      return { ...state, workspaces: action.payload };
    
    case ACTION_TYPES.ADD_WORKSPACE:
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    
    case ACTION_TYPES.UPDATE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.map(ws => 
          ws.id === action.payload.id ? action.payload : ws
        )
      };
    
    case ACTION_TYPES.REMOVE_WORKSPACE:
      return {
        ...state,
        workspaces: state.workspaces.filter(ws => ws.id !== action.payload)
      };

    // Boards
    case ACTION_TYPES.SET_BOARDS:
      return { ...state, boards: action.payload };
    
    case ACTION_TYPES.SET_CURRENT_BOARD:
      return { ...state, currentBoard: action.payload };
    
    case ACTION_TYPES.ADD_BOARD:
      return { ...state, boards: [...state.boards, action.payload] };
    
    case ACTION_TYPES.UPDATE_BOARD:
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === action.payload.id ? action.payload : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.id ? action.payload : state.currentBoard
      };
    
    case ACTION_TYPES.REMOVE_BOARD:
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard
      };

    // Lists
    case ACTION_TYPES.SET_LISTS:
      return { ...state, lists: action.payload };
    
    case ACTION_TYPES.ADD_LIST:
      return { ...state, lists: [...state.lists, action.payload] };
    
    case ACTION_TYPES.UPDATE_LIST:
      return {
        ...state,
        lists: state.lists.map(list => 
          list.id === action.payload.id ? action.payload : list
        )
      };
    
    case ACTION_TYPES.REMOVE_LIST:
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        cards: state.cards.filter(card => card.listId !== action.payload)
      };
    
    case ACTION_TYPES.REORDER_LISTS:
      return { ...state, lists: action.payload };

    // Cards
    case ACTION_TYPES.SET_CARDS:
      return { ...state, cards: action.payload };
    
    case ACTION_TYPES.ADD_CARD:
      return { ...state, cards: [...state.cards, action.payload] };
    
    case ACTION_TYPES.UPDATE_CARD:
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.id ? action.payload : card
        )
      };
    
    case ACTION_TYPES.REMOVE_CARD:
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
    
    case ACTION_TYPES.MOVE_CARD:
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.id ? action.payload : card
        )
      };

    case ACTION_TYPES.SET_SELECTED_CARD:
      return { ...state, selectedCard: action.payload };

    // Comments
    case ACTION_TYPES.SET_COMMENTS:
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.payload.cardId]: action.payload.comments
        }
      };
    
    case ACTION_TYPES.ADD_COMMENT:
      const cardId = action.payload.cardId;
      return {
        ...state,
        comments: {
          ...state.comments,
          [cardId]: [...(state.comments[cardId] || []), action.payload]
        }
      };
    
    case ACTION_TYPES.UPDATE_COMMENT:
      const updateCardId = action.payload.cardId;
      return {
        ...state,
        comments: {
          ...state.comments,
          [updateCardId]: (state.comments[updateCardId] || []).map(comment =>
            comment.id === action.payload.id ? action.payload : comment
          )
        }
      };
    
    case ACTION_TYPES.REMOVE_COMMENT:
      const removeCardId = action.payload.cardId;
      return {
        ...state,
        comments: {
          ...state.comments,
          [removeCardId]: (state.comments[removeCardId] || []).filter(
            comment => comment.id !== action.payload.commentId
          )
        }
      };

    // Activities
    case ACTION_TYPES.SET_ACTIVITIES:
      return { ...state, activities: action.payload };
    
    case ACTION_TYPES.ADD_ACTIVITY:
      return { 
        ...state, 
        activities: [action.payload, ...state.activities.slice(0, 19)] // Keep only last 20
      };

    // Members and Presence
    case ACTION_TYPES.SET_BOARD_MEMBERS:
      return { ...state, boardMembers: action.payload };
    
    case ACTION_TYPES.SET_CONNECTED_USERS:
      return { ...state, connectedUsers: action.payload };

    // UI State
    case ACTION_TYPES.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ACTION_TYPES.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case ACTION_TYPES.SET_ACTIVE_FILTERS:
      return { ...state, activeFilters: { ...state.activeFilters, ...action.payload } };
    
    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return { 
        ...state, 
        sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen } 
      };
    
    case ACTION_TYPES.SET_SIDEBAR_TAB:
      return { 
        ...state, 
        sidebar: { ...state.sidebar, activeTab: action.payload } 
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// App provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Utility functions
  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  // Workspace functions
  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await workspaceAPI.getAll();
      dispatch({ type: ACTION_TYPES.SET_WORKSPACES, payload: response.data.data });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError]);

  const createWorkspace = useCallback(async (workspaceData) => {
    try {
      const response = await workspaceAPI.create(workspaceData);
      dispatch({ type: ACTION_TYPES.ADD_WORKSPACE, payload: response.data.data });
      toast.success('Workspace created successfully');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Board functions
  const fetchBoards = useCallback(async (workspaceId = null) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const params = workspaceId ? { workspaceId } : {};
      const response = await boardAPI.getAll(params);
      dispatch({ type: ACTION_TYPES.SET_BOARDS, payload: response.data.data });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError]);

  const fetchBoard = useCallback(async (boardId) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await boardAPI.getById(boardId, { include: 'lists,cards,members' });
      const board = response.data.data;
      
      dispatch({ type: ACTION_TYPES.SET_CURRENT_BOARD, payload: board });
      
      if (board.lists) {
        dispatch({ type: ACTION_TYPES.SET_LISTS, payload: board.lists });
      }
      
      if (board.cards) {
        dispatch({ type: ACTION_TYPES.SET_CARDS, payload: board.cards });
      }
      
      if (board.members) {
        dispatch({ type: ACTION_TYPES.SET_BOARD_MEMBERS, payload: board.members });
      }

      // Join socket room for real-time updates
      socketService.joinBoard(boardId);
      
      return board;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError]);

  const createBoard = useCallback(async (boardData) => {
    try {
      const response = await boardAPI.create(boardData);
      dispatch({ type: ACTION_TYPES.ADD_BOARD, payload: response.data.data });
      toast.success('Board created successfully');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateBoard = useCallback(async (boardId, boardData) => {
    try {
      const response = await boardAPI.update(boardId, boardData);
      dispatch({ type: ACTION_TYPES.UPDATE_BOARD, payload: response.data.data });
      toast.success('Board updated successfully');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteBoard = useCallback(async (boardId) => {
    try {
      await boardAPI.delete(boardId);
      dispatch({ type: ACTION_TYPES.REMOVE_BOARD, payload: boardId });
      toast.success('Board deleted successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const setCurrentBoard = useCallback((board) => {
    dispatch({ type: ACTION_TYPES.SET_CURRENT_BOARD, payload: board });
  }, []);

  // List functions
  const createList = useCallback(async (boardId, listData) => {
    try {
      const response = await listAPI.create(boardId, listData);
      dispatch({ type: ACTION_TYPES.ADD_LIST, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateList = useCallback(async (boardId, listId, listData) => {
    try {
      const response = await listAPI.update(boardId, listId, listData);
      dispatch({ type: ACTION_TYPES.UPDATE_LIST, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteList = useCallback(async (boardId, listId) => {
    try {
      await listAPI.delete(boardId, listId);
      dispatch({ type: ACTION_TYPES.REMOVE_LIST, payload: listId });
      toast.success('List deleted successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const reorderLists = useCallback(async (boardId, listOrder) => {
    try {
      await listAPI.reorder(boardId, { listOrder });
      dispatch({ type: ACTION_TYPES.REORDER_LISTS, payload: listOrder });
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Card functions
  const createCard = useCallback(async (boardId, listId, cardData) => {
    try {
      const response = await cardAPI.create(boardId, listId, cardData);
      dispatch({ type: ACTION_TYPES.ADD_CARD, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateCard = useCallback(async (boardId, listId, cardId, cardData) => {
    try {
      const response = await cardAPI.update(boardId, listId, cardId, cardData);
      dispatch({ type: ACTION_TYPES.UPDATE_CARD, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const moveCard = useCallback(async (boardId, listId, cardId, targetListId, position) => {
    try {
      const response = await cardAPI.move(boardId, listId, cardId, { targetListId, position });
      dispatch({ type: ACTION_TYPES.MOVE_CARD, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteCard = useCallback(async (boardId, listId, cardId) => {
    try {
      await cardAPI.delete(boardId, listId, cardId);
      dispatch({ type: ACTION_TYPES.REMOVE_CARD, payload: cardId });
      toast.success('Card deleted successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Comment functions
  const fetchComments = useCallback(async (boardId, listId, cardId) => {
    try {
      const response = await commentAPI.getByCard(boardId, listId, cardId);
      dispatch({ 
        type: ACTION_TYPES.SET_COMMENTS, 
        payload: { cardId, comments: response.data.data } 
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const createComment = useCallback(async (boardId, listId, cardId, commentData) => {
    try {
      const response = await commentAPI.create(boardId, listId, cardId, commentData);
      const comment = { ...response.data.data, cardId };
      dispatch({ type: ACTION_TYPES.ADD_COMMENT, payload: comment });
      return { success: true, data: comment };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Filter functions
  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });
  }, []);

  // UI functions
  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR });
  }, []);

  const setSidebarTab = useCallback((tab) => {
    dispatch({ type: ACTION_TYPES.SET_SIDEBAR_TAB, payload: tab });
  }, []);

  // Card state functions
  const setSelectedCard = useCallback((card) => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_CARD, payload: card });
  }, []);

  // Search and filter functions
  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ACTION_TYPES.SET_SEARCH_QUERY, payload: query });
  }, []);

  const setActiveFilters = useCallback((filters) => {
    dispatch({ type: ACTION_TYPES.SET_ACTIVE_FILTERS, payload: filters });
  }, []);

  // Context value
  const value = {
    ...state,
    
    // Utility functions
    setLoading,
    setError,
    clearError,
    
    // Workspace functions
    fetchWorkspaces,
    createWorkspace,
    
    // Board functions
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    
    // List functions
    createList,
    updateList,
    deleteList,
    reorderLists,
    
    // Card functions
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    setSelectedCard,
    
    // Comment functions
    fetchComments,
    createComment,
    
    // Filter functions
    setFilters,
    setSearchQuery,
    setActiveFilters,
    
    // UI functions
    toggleSidebar,
    setSidebarTab
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
