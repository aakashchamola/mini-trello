import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import socketService from '../services/socket';
import { debounce } from '../utils/helpers';

// Export React Query hooks
export * from './useBoards';
export * from './useWorkspaces';
export * from './useLists';
export * from './useCards';
export { queryKeys } from './queryKeys';

// Custom hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Custom hook for debounced value
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for previous value
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Custom hook for async operations
export const useAsync = (asyncFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await asyncFunction(...args);
      setData(response);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
};

// Custom hook for socket events
export const useSocket = (event, handler, deps = []) => {
  useEffect(() => {
    if (!socketService.isSocketConnected()) {
      return;
    }

    socketService.on(event, handler);

    return () => {
      socketService.off(event, handler);
    };
  }, [event, handler, ...deps]);
};

// Custom hook for real-time board updates
export const useBoardRealtime = (boardId) => {
  const { isAuthenticated } = useAuth();
  const {
    lists,
    cards,
    activities,
    connectedUsers,
    dispatch
  } = useApp();

  // Join board on mount
  useEffect(() => {
    if (isAuthenticated && boardId && socketService.isSocketConnected()) {
      socketService.joinBoard(boardId);
    }

    return () => {
      if (boardId) {
        socketService.leaveBoard(boardId);
      }
    };
  }, [isAuthenticated, boardId]);

  // Card events
  useSocket('card:created', useCallback((data) => {
    if (data.boardId === boardId) {
      // Handle real-time card creation
      console.log('Card created:', data);
    }
  }, [boardId]), [boardId]);

  useSocket('card:updated', useCallback((data) => {
    if (data.boardId === boardId) {
      // Handle real-time card updates
      console.log('Card updated:', data);
    }
  }, [boardId]), [boardId]);

  useSocket('card:moved', useCallback((data) => {
    if (data.boardId === boardId) {
      // Handle real-time card moves
      console.log('Card moved:', data);
    }
  }, [boardId]), [boardId]);

  useSocket('card:deleted', useCallback((data) => {
    if (data.boardId === boardId) {
      // Handle real-time card deletion
      console.log('Card deleted:', data);
    }
  }, [boardId]), [boardId]);

  // List events
  useSocket('list:created', useCallback((data) => {
    if (data.boardId === boardId) {
      console.log('List created:', data);
    }
  }, [boardId]), [boardId]);

  useSocket('list:updated', useCallback((data) => {
    if (data.boardId === boardId) {
      console.log('List updated:', data);
    }
  }, [boardId]), [boardId]);

  useSocket('list:deleted', useCallback((data) => {
    if (data.boardId === boardId) {
      console.log('List deleted:', data);
    }
  }, [boardId]), [boardId]);

  // Comment events
  useSocket('comment:created', useCallback((data) => {
    if (data.boardId === boardId) {
      console.log('Comment created:', data);
    }
  }, [boardId]), [boardId]);

  // Presence events
  useSocket('user:presence', useCallback((data) => {
    if (data.boardId === boardId) {
      console.log('User presence update:', data);
    }
  }, [boardId]), [boardId]);

  // Typing events
  useSocket('user:typing', useCallback((data) => {
    if (data.boardId === boardId) {
      console.log('User typing:', data);
    }
  }, [boardId]), [boardId]);
};

// Custom hook for keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modifierKey = ctrlKey || metaKey;

      for (const shortcut of shortcuts) {
        const {
          key: shortcutKey,
          ctrl = false,
          meta = false,
          shift = false,
          alt = false,
          handler
        } = shortcut;

        const keyMatch = key.toLowerCase() === shortcutKey.toLowerCase();
        const ctrlMatch = ctrl === (ctrlKey || metaKey);
        const shiftMatch = shift === shiftKey;
        const altMatch = alt === altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          handler(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Custom hook for outside click detection
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Custom hook for infinite scrolling
export const useInfiniteScroll = (callback, hasMore = true) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || !hasMore) {
        return;
      }
      setIsFetching(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!isFetching) return;
    
    callback().then(() => {
      setIsFetching(false);
    }).catch(() => {
      setIsFetching(false);
    });
  }, [isFetching, callback]);

  return [isFetching, setIsFetching];
};

// Custom hook for form validation
export const useFormValidation = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const fieldErrors = validate({ ...values });
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return { success: false, errors: validationErrors };
      }
    }

    try {
      const result = await onSubmit(values);
      setIsSubmitting(false);
      return result;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};

// Custom hook for drag and drop
export const useDragAndDrop = (onDrop) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const handleDragStart = useCallback((item) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedItem && dropTarget && onDrop) {
      onDrop(draggedItem, dropTarget);
    }
    setDraggedItem(null);
    setDropTarget(null);
  }, [draggedItem, dropTarget, onDrop]);

  const handleDragOver = useCallback((target) => {
    setDropTarget(target);
  }, []);

  return {
    draggedItem,
    dropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver
  };
};

// Custom hook for pagination
export const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPrevious = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    goToNext,
    goToPrevious,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1
  };
};
