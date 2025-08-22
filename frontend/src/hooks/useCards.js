import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardAPI, commentAPI } from '../services/api';
import { queryKeys } from './queryKeys';
import { handleMutationError, debugMutation } from '../utils/debugUtils';

// Simple toast notification functions
const toast = {
  success: (message) => console.log('✅ Success:', message),
  error: (message) => console.error('❌ Error:', message),
  info: (message) => console.log('ℹ️ Info:', message)
};

// Fetch cards for a list
export const useListCards = (boardId, listId) => {
  return useQuery({
    queryKey: queryKeys.listCards(listId),
    queryFn: async () => {
      const response = await cardAPI.getByList(boardId, listId);
      return response.data?.cards || response.data?.data || [];
    },
    enabled: !!(boardId && listId),
    onError: (error) => {
      console.error('Failed to fetch list cards:', error);
      toast.error('Failed to load cards');
    }
  });
};

// Fetch all cards for a board
export const useBoardCards = (boardId) => {
  return useQuery({
    queryKey: queryKeys.cards.concat(['board', boardId]),
    queryFn: async () => {
      const response = await cardAPI.getByBoard(boardId);
      return response.data?.cards || response.data?.data || [];
    },
    enabled: !!boardId,
    onError: (error) => {
      console.error('Failed to fetch board cards:', error);
      toast.error('Failed to load cards');
    }
  });
};

// Fetch single card
export const useCard = (boardId, listId, cardId) => {
  return useQuery({
    queryKey: queryKeys.card(cardId),
    queryFn: async () => {
      const response = await cardAPI.getById(boardId, listId, cardId);
      return response.data?.card || response.data;
    },
    enabled: !!(boardId && listId && cardId),
    onError: (error) => {
      console.error('Failed to fetch card:', error);
      toast.error('Failed to load card');
    }
  });
};

// Fetch card comments
export const useCardComments = (boardId, listId, cardId) => {
  return useQuery({
    queryKey: queryKeys.cardComments(cardId),
    queryFn: async () => {
      const response = await commentAPI.getByCard(boardId, listId, cardId);
      return response.data?.comments || response.data?.data || [];
    },
    enabled: !!(boardId && listId && cardId),
    onError: (error) => {
      console.error('Failed to fetch card comments:', error);
    }
  });
};

// Create card mutation
export const useCreateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, cardData }) => {
      // Only send allowed fields for card creation
      const cleanCardData = {
        title: cardData.title,
        ...(cardData.description && { description: cardData.description }),
        ...(cardData.priority && { priority: cardData.priority }),
        ...(cardData.labels && cardData.labels.length > 0 && { labels: cardData.labels }),
        ...(cardData.position !== undefined && { position: cardData.position })
      };
      console.log('🚀 Creating card with clean data:', { boardId, listId, cleanCardData });
      const response = await cardAPI.create(boardId, listId, cleanCardData);
      console.log('📝 Card creation response:', response);
      return response.data?.card || response.data;
    },
    onMutate: async ({ boardId, listId, cardData }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.listCards(listId) });
      
      const previousCards = queryClient.getQueryData(queryKeys.listCards(listId));
      
      // Create a stable client ID that persists through the update
      const clientId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const optimisticCard = {
        id: `temp-${Date.now()}`,
        clientId, // This stays stable
        title: cardData.title,
        description: cardData.description || '',
        position: cardData.position || 0,
        priority: cardData.priority || 'medium',
        labels: cardData.labels || [],
        assignees: cardData.assignees || [],
        list_id: listId,
        board_id: boardId,
        is_completed: false,
        created_at: new Date().toISOString(),
        ...cardData
      };
      
      queryClient.setQueryData(queryKeys.listCards(listId), (old) => {
        return [...(old || []), optimisticCard];
      });
      
      return { previousCards, optimisticCard, clientId };
    },
    onSuccess: (newCard, { boardId, listId }, context) => {
      // Update the list cards cache with real data - replace only the specific optimistic card using clientId
      queryClient.setQueryData(queryKeys.listCards(listId), (old) => {
        return (old || []).map(card => 
          card.clientId === context?.clientId ? { ...newCard, clientId: context.clientId } : card
        );
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Card created successfully!');
    },
    onError: (error, { listId }, context) => {
      // Rollback optimistic update
      if (context?.previousCards) {
        queryClient.setQueryData(queryKeys.listCards(listId), context.previousCards);
      }
      console.error('Failed to create card:', error);
      toast.error(error.response?.data?.message || 'Failed to create card');
    }
  });
};

// Update card mutation
export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, cardId, updates, cardData }) => {
      // Support both 'updates' and 'cardData' parameter names for backward compatibility
      const updateData = updates || cardData;
      
      console.log('useUpdateCard - Parameters:', { boardId, listId, cardId, updateData });
      console.log('useUpdateCard - cardId type:', typeof cardId, 'value:', cardId);
      
      const response = await cardAPI.update(boardId, listId, cardId, updateData);
      return response.data?.card || response.data;
    },
    onMutate: async ({ boardId, listId, cardId, updates, cardData }) => {
      // Support both parameter names
      const updateData = updates || cardData;
      
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.listCards(listId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.card(cardId) });
      
      const previousCards = queryClient.getQueryData(queryKeys.listCards(listId));
      const previousCard = queryClient.getQueryData(queryKeys.card(cardId));
      
      // Update in list cards
      queryClient.setQueryData(queryKeys.listCards(listId), (old) => {
        return (old || []).map(card => 
          card.id === cardId ? { ...card, ...updateData } : card
        );
      });
      
      // Update individual card
      queryClient.setQueryData(queryKeys.card(cardId), (old) => {
        return old ? { ...old, ...updateData } : null;
      });
      
      return { previousCards, previousCard };
    },
    onSuccess: (updatedCard, { boardId, listId, cardId }) => {
      // Update caches with real data
      queryClient.setQueryData(queryKeys.card(cardId), updatedCard);
      queryClient.setQueryData(queryKeys.listCards(listId), (old) => {
        return (old || []).map(card => 
          card.id === cardId ? updatedCard : card
        );
      });
      
      // Invalidate board activities
      queryClient.invalidateQueries({ queryKey: queryKeys.boardActivities(boardId) });
      toast.success('Card updated successfully!');
    },
    onError: (error, { listId, cardId }, context) => {
      // Rollback optimistic updates
      if (context?.previousCards) {
        queryClient.setQueryData(queryKeys.listCards(listId), context.previousCards);
      }
      if (context?.previousCard) {
        queryClient.setQueryData(queryKeys.card(cardId), context.previousCard);
      }
      console.error('Failed to update card:', error);
      toast.error(error.response?.data?.message || 'Failed to update card');
    }
  });
};

// Delete card mutation
export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, cardId }) => {
      await cardAPI.delete(boardId, listId, cardId);
      return cardId;
    },
    onMutate: async ({ boardId, listId, cardId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.listCards(listId) });
      
      const previousCards = queryClient.getQueryData(queryKeys.listCards(listId));
      
      queryClient.setQueryData(queryKeys.listCards(listId), (old) => {
        return (old || []).filter(card => card.id !== cardId);
      });
      
      return { previousCards };
    },
    onSuccess: (cardId, { boardId, listId }) => {
      // Remove card from cache
      queryClient.removeQueries({ queryKey: queryKeys.card(cardId) });
      queryClient.removeQueries({ queryKey: queryKeys.cardComments(cardId) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.boardActivities(boardId) });
      toast.success('Card deleted successfully!');
    },
    onError: (error, { listId }, context) => {
      // Rollback optimistic update
      if (context?.previousCards) {
        queryClient.setQueryData(queryKeys.listCards(listId), context.previousCards);
      }
      console.error('Failed to delete card:', error);
      toast.error(error.response?.data?.message || 'Failed to delete card');
    }
  });
};

// Move card mutation (between lists or reorder within list)
export const useMoveCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, sourceListId, cardId, targetListId, position }) => {
      if (sourceListId === targetListId) {
        // Reorder within same list
        const response = await cardAPI.update(boardId, sourceListId, cardId, { position });
        return { type: 'reorder', card: response.data?.card || response.data };
      } else {
        // Move between lists
        const response = await cardAPI.move(boardId, sourceListId, cardId, {
          targetListId,
          position
        });
        return { type: 'move', card: response.data?.card || response.data };
      }
    },
    onMutate: async ({ boardId, sourceListId, cardId, targetListId, position }) => {
      // Cancel relevant queries
      await queryClient.cancelQueries({ queryKey: queryKeys.listCards(sourceListId) });
      if (sourceListId !== targetListId) {
        await queryClient.cancelQueries({ queryKey: queryKeys.listCards(targetListId) });
      }
      
      const previousSourceCards = queryClient.getQueryData(queryKeys.listCards(sourceListId));
      const previousTargetCards = sourceListId !== targetListId 
        ? queryClient.getQueryData(queryKeys.listCards(targetListId))
        : null;
      
      // Find the card being moved
      const cardToMove = previousSourceCards?.find(card => card.id === cardId);
      if (!cardToMove) return { previousSourceCards, previousTargetCards };
      
      if (sourceListId === targetListId) {
        // Reorder within same list
        const newCards = [...(previousSourceCards || [])];
        const cardIndex = newCards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
          newCards.splice(cardIndex, 1);
          newCards.splice(position, 0, { ...cardToMove, position });
          queryClient.setQueryData(queryKeys.listCards(sourceListId), newCards);
        }
      } else {
        // Move between lists
        const newSourceCards = (previousSourceCards || []).filter(card => card.id !== cardId);
        const newTargetCards = [...(previousTargetCards || [])];
        newTargetCards.splice(position, 0, { 
          ...cardToMove, 
          list_id: targetListId, 
          position 
        });
        
        queryClient.setQueryData(queryKeys.listCards(sourceListId), newSourceCards);
        queryClient.setQueryData(queryKeys.listCards(targetListId), newTargetCards);
      }
      
      return { previousSourceCards, previousTargetCards };
    },
    onSuccess: (result, { boardId, sourceListId, targetListId }) => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.listCards(sourceListId) });
      if (sourceListId !== targetListId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.listCards(targetListId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.boardLists(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.boardActivities(boardId) });
    },
    onError: (error, { sourceListId, targetListId }, context) => {
      // Rollback optimistic updates
      if (context?.previousSourceCards) {
        queryClient.setQueryData(queryKeys.listCards(sourceListId), context.previousSourceCards);
      }
      if (context?.previousTargetCards && sourceListId !== targetListId) {
        queryClient.setQueryData(queryKeys.listCards(targetListId), context.previousTargetCards);
      }
      console.error('Failed to move card:', error);
      toast.error('Failed to move card');
    }
  });
};

// Search cards
export const useSearchCards = (boardId, searchQuery) => {
  return useQuery({
    queryKey: [...queryKeys.cards, 'search', boardId, searchQuery],
    queryFn: async () => {
      const response = await cardAPI.search(boardId, { q: searchQuery });
      return response.data?.cards || response.data?.data || [];
    },
    enabled: !!(boardId && searchQuery && searchQuery.length > 2),
    onError: (error) => {
      console.error('Failed to search cards:', error);
    }
  });
};

// Create comment mutation
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, cardId, content }) => {
      const response = await commentAPI.create(boardId, listId, cardId, { content });
      return response.data?.comment || response.data;
    },
    onSuccess: (newComment, { cardId, boardId }) => {
      // Add comment to cache
      queryClient.setQueryData(queryKeys.cardComments(cardId), (old) => {
        return [...(old || []), newComment];
      });
      
      // Invalidate board activities
      queryClient.invalidateQueries({ queryKey: queryKeys.boardActivities(boardId) });
      toast.success('Comment added successfully!');
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  });
};

// Update comment mutation
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, cardId, commentId, content }) => {
      const response = await commentAPI.update(boardId, listId, cardId, commentId, { content });
      return response.data?.comment || response.data;
    },
    onSuccess: (updatedComment, { cardId }) => {
      // Update comment in cache
      queryClient.setQueryData(queryKeys.cardComments(cardId), (old) => {
        return (old || []).map(comment => 
          comment.id === updatedComment.id ? updatedComment : comment
        );
      });
      toast.success('Comment updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update comment:', error);
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  });
};

// Delete comment mutation
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, listId, cardId, commentId }) => {
      await commentAPI.delete(boardId, listId, cardId, commentId);
      return commentId;
    },
    onSuccess: (commentId, { cardId }) => {
      // Remove comment from cache
      queryClient.setQueryData(queryKeys.cardComments(cardId), (old) => {
        return (old || []).filter(comment => comment.id !== commentId);
      });
      toast.success('Comment deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  });
};
