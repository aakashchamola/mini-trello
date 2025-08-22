import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAPI } from '../services/api';
import { queryKeys } from './queryKeys';
import { handleMutationError, debugMutation } from '../utils/debugUtils';

// Simple toast notification functions
const toast = {
  success: (message) => console.log('✅ Success:', message),
  error: (message) => console.error('❌ Error:', message),
  info: (message) => console.log('ℹ️ Info:', message)
};

// Fetch lists for a board
export const useBoardLists = (boardId) => {
  return useQuery({
    queryKey: queryKeys.boardLists(boardId),
    queryFn: async () => {
      const response = await listAPI.getByBoard(boardId);
      return response.data?.lists || response.data?.data || [];
    },
    enabled: !!boardId,
    onError: (error) => {
      console.error('Failed to fetch board lists:', error);
      toast.error('Failed to load lists');
    }
  });
};

// Fetch single list
export const useList = (boardId, listId) => {
  return useQuery({
    queryKey: queryKeys.list(listId),
    queryFn: async () => {
      const response = await listAPI.getById(boardId, listId);
      return response.data?.list || response.data;
    },
    enabled: !!(boardId && listId),
    onError: (error) => {
      console.error('Failed to fetch list:', error);
      toast.error('Failed to load list');
    }
  });
};

// Create list mutation
export const useCreateList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listData }) => {
      // Only send allowed fields for list creation
      const cleanListData = {
        title: listData.title,
        ...(listData.position !== undefined && { position: listData.position })
      };
      console.log('🚀 Creating list with clean data:', { boardId, cleanListData });
      const response = await listAPI.create(boardId, cleanListData);
      console.log('📝 List creation response:', response);
      return response.data?.list || response.data;
    },
    onMutate: async ({ boardId, listData }) => {
      // Optimistic update
      console.log('⚡ Optimistic list creation:', { boardId, listData });
      await queryClient.cancelQueries({ queryKey: queryKeys.boardLists(boardId) });
      
      const previousLists = queryClient.getQueryData(queryKeys.boardLists(boardId));
      
      // Create a stable client ID that persists through the update
      const clientId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const optimisticList = {
        id: `temp-${Date.now()}`,
        clientId, // This stays stable
        title: listData.title,
        position: listData.position || 0,
        cards: [],
        board_id: boardId,
        ...listData
      };
      
      queryClient.setQueryData(queryKeys.boardLists(boardId), (old) => {
        return [...(old || []), optimisticList];
      });
      
      return { previousLists, optimisticList, clientId };
    },
    onSuccess: (newList, { boardId }, context) => {
      console.log('✅ List created successfully:', newList);
      // Update the board lists cache with real data - replace only the specific optimistic list
      queryClient.setQueryData(queryKeys.boardLists(boardId), (old) => {
        return (old || []).map(list => 
          list.clientId === context?.clientId ? { ...newList, clientId: context.clientId } : list
        );
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('List created successfully!');
    },
    onError: (error, { boardId, listData }, context) => {
      console.error('❌ List creation failed:', error);
      debugMutation('Create List', { boardId, listData }, error);
      
      // Rollback optimistic update
      if (context?.previousLists) {
        queryClient.setQueryData(queryKeys.boardLists(boardId), context.previousLists);
      }
      
      const errorMessage = handleMutationError(error, 'List creation');
      toast.error(errorMessage);
    }
  });
};

// Update list mutation
export const useUpdateList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, updates }) => {
      const response = await listAPI.update(boardId, listId, updates);
      return response.data?.list || response.data;
    },
    onMutate: async ({ boardId, listId, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.boardLists(boardId) });
      
      const previousLists = queryClient.getQueryData(queryKeys.boardLists(boardId));
      
      queryClient.setQueryData(queryKeys.boardLists(boardId), (old) => {
        return (old || []).map(list => 
          list.id === listId ? { ...list, ...updates } : list
        );
      });
      
      return { previousLists };
    },
    onSuccess: (updatedList, { boardId }) => {
      // Update the specific list in cache
      queryClient.setQueryData(queryKeys.list(updatedList.id), updatedList);
      // Ensure board lists are updated
      queryClient.setQueryData(queryKeys.boardLists(boardId), (old) => {
        return (old || []).map(list => 
          list.id === updatedList.id ? updatedList : list
        );
      });
      toast.success('List updated successfully!');
    },
    onError: (error, { boardId }, context) => {
      // Rollback optimistic update
      if (context?.previousLists) {
        queryClient.setQueryData(queryKeys.boardLists(boardId), context.previousLists);
      }
      console.error('Failed to update list:', error);
      toast.error(error.response?.data?.message || 'Failed to update list');
    }
  });
};

// Delete list mutation
export const useDeleteList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId }) => {
      await listAPI.delete(boardId, listId);
      return listId;
    },
    onMutate: async ({ boardId, listId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.boardLists(boardId) });
      
      const previousLists = queryClient.getQueryData(queryKeys.boardLists(boardId));
      
      queryClient.setQueryData(queryKeys.boardLists(boardId), (old) => {
        return (old || []).filter(list => list.id !== listId);
      });
      
      return { previousLists };
    },
    onSuccess: (listId, { boardId }) => {
      // Remove the list from cache
      queryClient.removeQueries({ queryKey: queryKeys.list(listId) });
      // Remove all cards from this list
      queryClient.removeQueries({ queryKey: queryKeys.listCards(listId) });
      // Invalidate board query
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('List deleted successfully!');
    },
    onError: (error, { boardId }, context) => {
      // Rollback optimistic update
      if (context?.previousLists) {
        queryClient.setQueryData(queryKeys.boardLists(boardId), context.previousLists);
      }
      console.error('Failed to delete list:', error);
      toast.error(error.response?.data?.message || 'Failed to delete list');
    }
  });
};

// Reorder lists mutation
export const useReorderLists = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listOrder }) => {
      const response = await listAPI.reorder(boardId, { listOrder });
      return response.data;
    },
    onMutate: async ({ boardId, listOrder }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.boardLists(boardId) });
      
      const previousLists = queryClient.getQueryData(queryKeys.boardLists(boardId));
      
      // Reorder lists based on listOrder
      const reorderedLists = listOrder.map(orderItem => {
        const list = previousLists?.find(l => l.id === orderItem.id);
        return list ? { ...list, position: orderItem.position } : null;
      }).filter(Boolean);
      
      queryClient.setQueryData(queryKeys.boardLists(boardId), reorderedLists);
      
      return { previousLists };
    },
    onSuccess: (data, { boardId }) => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) });
    },
    onError: (error, { boardId }, context) => {
      // Rollback optimistic update
      if (context?.previousLists) {
        queryClient.setQueryData(queryKeys.boardLists(boardId), context.previousLists);
      }
      console.error('Failed to reorder lists:', error);
      toast.error('Failed to reorder lists');
    }
  });
};
