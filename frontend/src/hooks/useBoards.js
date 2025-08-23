import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { boardAPI, handleAPIError } from '../services/api';
import { queryKeys } from './queryKeys';
import { handleMutationError, debugMutation } from '../utils/debugUtils';

// Fetch user's boards
export const useUserBoards = () => {
  return useQuery({
    queryKey: queryKeys.userBoards,
    queryFn: async () => {
      const response = await boardAPI.getUserBoards();
      return response.data?.boards || response.data?.data || [];
    },
    onError: (error) => {
      console.error('Failed to fetch user boards:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Fetch single board
export const useBoard = (boardId) => {
  return useQuery({
    queryKey: queryKeys.board(boardId),
    queryFn: async () => {
      const response = await boardAPI.getBoard(boardId);
      return response.data?.board || response.data;
    },
    enabled: !!boardId,
    onError: (error) => {
      console.error('Failed to fetch board:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Fetch board members
export const useBoardMembers = (boardId) => {
  return useQuery({
    queryKey: queryKeys.boardMembers(boardId),
    queryFn: async () => {
      const response = await boardAPI.getBoardMembers(boardId);
      return response.data?.members || response.data || [];
    },
    enabled: !!boardId,
    onError: (error) => {
      console.error('Failed to fetch board members:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Fetch board activities
export const useBoardActivities = (boardId, limit = 20) => {
  return useQuery({
    queryKey: [...queryKeys.boardActivities(boardId), { limit }],
    queryFn: async () => {
      const response = await boardAPI.getBoardActivities(boardId, { limit });
      return response.data?.activities || response.data || [];
    },
    enabled: !!boardId,
    onError: (error) => {
      console.error('Failed to fetch board activities:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Create board mutation
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (boardData) => {
      // Only send allowed fields for board creation
      const cleanBoardData = {
        title: boardData.title,
        ...(boardData.description && { description: boardData.description }),
        ...(boardData.workspaceId && { workspaceId: boardData.workspaceId }),
        ...(boardData.color && { color: boardData.color })
      };
      console.log('🚀 Creating board with clean data:', cleanBoardData);
      const response = await boardAPI.create(cleanBoardData);
      console.log('📝 Board creation response:', response);
      return response.data?.board || response.data;
    },
    onMutate: async (boardData) => {
      // Optimistic update
      console.log('⚡ Optimistic board creation:', boardData);
      await queryClient.cancelQueries({ queryKey: queryKeys.userBoards });
      
      const previousBoards = queryClient.getQueryData(queryKeys.userBoards);
      
      const optimisticBoard = {
        id: `temp-${Date.now()}`,
        title: boardData.title,
        description: boardData.description || '',
        color: boardData.color || '#0079bf',
        isPrivate: boardData.isPrivate || false,
        createdAt: new Date().toISOString(),
        ...boardData
      };
      
      queryClient.setQueryData(queryKeys.userBoards, (old) => {
        return [optimisticBoard, ...(old || [])];
      });
      
      return { previousBoards, optimisticBoard };
    },
    onSuccess: (newBoard, boardData, context) => {
      console.log('✅ Board created successfully:', newBoard);
      // Update the user boards cache with real data
      queryClient.setQueryData(queryKeys.userBoards, (old) => {
        return (old || []).map(board => 
          board.id === context?.optimisticBoard?.id ? newBoard : board
        );
      });
      
      // Also cache the individual board
      queryClient.setQueryData(queryKeys.board(newBoard.id), newBoard);
      toast.success('Board created successfully!');
    },
    onError: (error, boardData, context) => {
      console.error('❌ Board creation failed:', error);
      debugMutation('Create Board', boardData, error);
      
      // Rollback optimistic update
      if (context?.previousBoards) {
        queryClient.setQueryData(queryKeys.userBoards, context.previousBoards);
      }
      
      const errorMessage = handleMutationError(error, 'Board creation');
      toast.error(handleAPIError(error));
    }
  });
};

// Update board mutation
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, updates }) => {
      const response = await boardAPI.updateBoard(boardId, updates);
      return response.data?.board || response.data;
    },
    onSuccess: (updatedBoard) => {
      // Update the specific board in cache
      queryClient.setQueryData(
        queryKeys.board(updatedBoard.id), 
        updatedBoard
      );
      // Invalidate user boards to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.userBoards });
      toast.success('Board updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update board:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Delete board mutation
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (boardId) => {
      await boardAPI.deleteBoard(boardId);
      return boardId;
    },
    onSuccess: (boardId) => {
      // Remove the board from cache
      queryClient.removeQueries({ queryKey: queryKeys.board(boardId) });
      // Invalidate user boards
      queryClient.invalidateQueries({ queryKey: queryKeys.userBoards });
      toast.success('Board deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete board:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Fetch single board with lists and cards
export const useBoardWithData = (boardId) => {
  return useQuery({
    queryKey: queryKeys.board(boardId).concat(['with-data']),
    queryFn: async () => {
      // Import APIs here to avoid circular dependencies
      const { listAPI, cardAPI } = await import('../services/api');
      
      // Fetch board
      const boardResponse = await boardAPI.getBoard(boardId);
      const board = boardResponse.data?.board || boardResponse.data;
      
      // Fetch lists for the board
      const listsResponse = await listAPI.getByBoard(boardId);
      const lists = listsResponse.data?.lists || listsResponse.data?.data || [];
      
      // Fetch cards for each list
      const listsWithCards = await Promise.all(
        lists.map(async (list) => {
          try {
            const cardsResponse = await cardAPI.getByList(boardId, list.id);
            const cards = cardsResponse.data?.cards || cardsResponse.data?.data || [];
            return { ...list, cards };
          } catch (error) {
            console.error(`Error fetching cards for list ${list.id}:`, error);
            return { ...list, cards: [] };
          }
        })
      );
      
      return {
        ...board,
        lists: listsWithCards
      };
    },
    enabled: !!boardId,
    staleTime: 30 * 1000, // 30 seconds - shorter for board data
    onError: (error) => {
      console.error('Failed to fetch board with data:', error);
      toast.error(handleAPIError(error));
    }
  });
};

// Star/Unstar board mutation
export const useToggleStarBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, isStarred }) => {
      const response = isStarred 
        ? await boardAPI.starBoard(boardId)
        : await boardAPI.unstarBoard(boardId);
      return { boardId, isStarred, data: response.data };
    },
    onMutate: async ({ boardId, isStarred }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.userBoards });
      
      const previousBoards = queryClient.getQueryData(queryKeys.userBoards);
      
      queryClient.setQueryData(queryKeys.userBoards, (old) => {
        return old?.map(board => 
          board.id === boardId ? { ...board, isStarred } : board
        ) || [];
      });
      
      return { previousBoards };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(queryKeys.userBoards, context.previousBoards);
      }
      console.error('Failed to toggle star:', error);
      toast.error(handleAPIError(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBoards });
    }
  });
};
