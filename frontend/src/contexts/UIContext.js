import React, { createContext, useContext, useReducer } from 'react';

// Initial UI state
const initialState = {
  // Global loading states
  globalLoading: false,
  
  // Modals
  modals: {
    createBoard: false,
    createWorkspace: false,
    inviteMembers: false,
    cardDetails: null, // stores card ID if open
    profile: false,
  },
  
  // Toast notifications
  toasts: [],
  
  // Theme
  theme: 'light',
  
  // Sidebar
  sidebarCollapsed: false,
  
  // Board view settings
  boardSettings: {
    showActivities: false,
    activityFilters: [],
    cardFilters: {
      assignee: null,
      labels: [],
      dueDate: null,
    }
  },
  
  // Drag and drop state
  dragState: {
    isDragging: false,
    draggedItem: null,
    dragType: null, // 'card' | 'list'
    sourceId: null,
    destinationId: null,
  }
};

// Action types
const actionTypes = {
  // Global loading
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  
  // Modals
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',
  
  // Toasts
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS',
  
  // Theme
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  
  // Sidebar
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  
  // Board settings
  TOGGLE_ACTIVITIES: 'TOGGLE_ACTIVITIES',
  SET_ACTIVITY_FILTERS: 'SET_ACTIVITY_FILTERS',
  SET_CARD_FILTERS: 'SET_CARD_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // Drag and drop
  START_DRAG: 'START_DRAG',
  END_DRAG: 'END_DRAG',
  UPDATE_DRAG: 'UPDATE_DRAG',
};

// Reducer function
function uiReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_GLOBAL_LOADING:
      return {
        ...state,
        globalLoading: action.payload
      };
      
    case actionTypes.OPEN_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.data || true
        }
      };
      
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: false
        }
      };
      
    case actionTypes.CLOSE_ALL_MODALS:
      return {
        ...state,
        modals: Object.keys(state.modals).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {})
      };
      
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, { 
          id: Date.now(), 
          ...action.payload 
        }]
      };
      
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
      
    case actionTypes.CLEAR_TOASTS:
      return {
        ...state,
        toasts: []
      };
      
    case actionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
      
    case actionTypes.TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
      
    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
      
    case actionTypes.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload
      };
      
    case actionTypes.TOGGLE_ACTIVITIES:
      return {
        ...state,
        boardSettings: {
          ...state.boardSettings,
          showActivities: !state.boardSettings.showActivities
        }
      };
      
    case actionTypes.SET_ACTIVITY_FILTERS:
      return {
        ...state,
        boardSettings: {
          ...state.boardSettings,
          activityFilters: action.payload
        }
      };
      
    case actionTypes.SET_CARD_FILTERS:
      return {
        ...state,
        boardSettings: {
          ...state.boardSettings,
          cardFilters: {
            ...state.boardSettings.cardFilters,
            ...action.payload
          }
        }
      };
      
    case actionTypes.RESET_FILTERS:
      return {
        ...state,
        boardSettings: {
          ...state.boardSettings,
          cardFilters: initialState.boardSettings.cardFilters
        }
      };
      
    case actionTypes.START_DRAG:
      return {
        ...state,
        dragState: {
          isDragging: true,
          draggedItem: action.payload.item,
          dragType: action.payload.type,
          sourceId: action.payload.sourceId,
          destinationId: null
        }
      };
      
    case actionTypes.UPDATE_DRAG:
      return {
        ...state,
        dragState: {
          ...state.dragState,
          destinationId: action.payload.destinationId
        }
      };
      
    case actionTypes.END_DRAG:
      return {
        ...state,
        dragState: initialState.dragState
      };
      
    default:
      return state;
  }
}

// Create context
const UIContext = createContext();

// Context provider component
export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  
  // Action creators
  const actions = {
    // Global loading
    setGlobalLoading: (loading) => 
      dispatch({ type: actionTypes.SET_GLOBAL_LOADING, payload: loading }),
    
    // Modals
    openModal: (modal, data = null) => 
      dispatch({ type: actionTypes.OPEN_MODAL, payload: { modal, data } }),
    closeModal: (modal) => 
      dispatch({ type: actionTypes.CLOSE_MODAL, payload: modal }),
    closeAllModals: () => 
      dispatch({ type: actionTypes.CLOSE_ALL_MODALS }),
    
    // Toasts (using react-toastify internally, but can add custom logic)
    addToast: (toast) => 
      dispatch({ type: actionTypes.ADD_TOAST, payload: toast }),
    removeToast: (id) => 
      dispatch({ type: actionTypes.REMOVE_TOAST, payload: id }),
    clearToasts: () => 
      dispatch({ type: actionTypes.CLEAR_TOASTS }),
    
    // Theme
    setTheme: (theme) => 
      dispatch({ type: actionTypes.SET_THEME, payload: theme }),
    toggleTheme: () => 
      dispatch({ type: actionTypes.TOGGLE_THEME }),
    
    // Sidebar
    toggleSidebar: () => 
      dispatch({ type: actionTypes.TOGGLE_SIDEBAR }),
    setSidebarCollapsed: (collapsed) => 
      dispatch({ type: actionTypes.SET_SIDEBAR_COLLAPSED, payload: collapsed }),
    
    // Board settings
    toggleActivities: () => 
      dispatch({ type: actionTypes.TOGGLE_ACTIVITIES }),
    setActivityFilters: (filters) => 
      dispatch({ type: actionTypes.SET_ACTIVITY_FILTERS, payload: filters }),
    setCardFilters: (filters) => 
      dispatch({ type: actionTypes.SET_CARD_FILTERS, payload: filters }),
    resetFilters: () => 
      dispatch({ type: actionTypes.RESET_FILTERS }),
    
    // Drag and drop
    startDrag: (item, type, sourceId) => 
      dispatch({ 
        type: actionTypes.START_DRAG, 
        payload: { item, type, sourceId } 
      }),
    updateDrag: (destinationId) => 
      dispatch({ 
        type: actionTypes.UPDATE_DRAG, 
        payload: { destinationId } 
      }),
    endDrag: () => 
      dispatch({ type: actionTypes.END_DRAG }),
  };
  
  const value = {
    ...state,
    ...actions
  };
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;
