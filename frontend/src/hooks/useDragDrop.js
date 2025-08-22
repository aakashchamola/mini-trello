import { useContext, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const useDragDrop = (boardId, socket) => {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // API endpoints
  const moveCard = useMutation({
    mutationFn: async ({ cardId, targetListId, targetIndex, sourceListId }) => {
      const response = await fetch(`/api/boards/${boardId}/drag-drop/cards/${cardId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetListId,
          targetIndex,
          sourceListId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to move card');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['board', boardId, 'lists'], (oldLists) => {
        if (!oldLists) return oldLists;

        return oldLists.map(list => {
          // Remove card from source list
          if (list.id === variables.sourceListId) {
            return {
              ...list,
              cards: list.cards.filter(card => card.id !== variables.cardId)
            };
          }
          
          // Add card to target list
          if (list.id === variables.targetListId) {
            const cardData = data.card;
            const newCards = [...list.cards];
            newCards.splice(variables.targetIndex, 0, cardData);
            return {
              ...list,
              cards: newCards
            };
          }
          
          return list;
        });
      });

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('card-moved', {
          cardId: variables.cardId,
          fromListId: variables.sourceListId,
          toListId: variables.targetListId,
          newPosition: data.card.position,
          cardData: data.card
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to move card');
      // Invalidate cache to refresh from server
      queryClient.invalidateQueries(['board', boardId, 'lists']);
    }
  });

  const moveList = useMutation({
    mutationFn: async ({ listId, targetIndex }) => {
      const response = await fetch(`/api/boards/${boardId}/drag-drop/lists/${listId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetIndex
        })
      });

      if (!response.ok) {
        throw new Error('Failed to move list');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['board', boardId, 'lists'], (oldLists) => {
        if (!oldLists) return oldLists;

        const listToMove = oldLists.find(list => list.id === variables.listId);
        if (!listToMove) return oldLists;

        const filteredLists = oldLists.filter(list => list.id !== variables.listId);
        const newLists = [...filteredLists];
        newLists.splice(variables.targetIndex, 0, { ...listToMove, position: data.list.position });
        
        return newLists;
      });

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('list-moved', {
          listId: variables.listId,
          newPosition: data.list.position,
          boardId: boardId,
          listData: data.list
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to move list');
      // Invalidate cache to refresh from server
      queryClient.invalidateQueries(['board', boardId, 'lists']);
    }
  });

  // Real-time socket event handlers
  const handleSocketCardMoved = useCallback((data) => {
    queryClient.setQueryData(['board', boardId, 'lists'], (oldLists) => {
      if (!oldLists) return oldLists;

      return oldLists.map(list => {
        // Remove card from source list
        if (list.id === data.fromListId) {
          return {
            ...list,
            cards: list.cards.filter(card => card.id !== data.cardId)
          };
        }
        
        // Add card to target list
        if (list.id === data.toListId) {
          const newCards = [...list.cards, data.cardData];
          return {
            ...list,
            cards: newCards.sort((a, b) => a.position - b.position)
          };
        }
        
        return list;
      });
    });
  }, [queryClient, boardId]);

  const handleSocketListMoved = useCallback((data) => {
    queryClient.setQueryData(['board', boardId, 'lists'], (oldLists) => {
      if (!oldLists) return oldLists;

      return oldLists.map(list => {
        if (list.id === data.listId) {
          return { ...list, position: data.newPosition };
        }
        return list;
      }).sort((a, b) => a.position - b.position);
    });
  }, [queryClient, boardId]);

  const handleDragStart = useCallback((data) => {
    // Show visual indicators for drag start
    if (socket) {
      socket.emit('drag-start', {
        type: data.type,
        id: data.id,
        boardId: boardId
      });
    }
  }, [socket, boardId]);

  const handleDragEnd = useCallback((data) => {
    // Remove visual indicators for drag end
    if (socket) {
      socket.emit('drag-end', {
        type: data.type,
        id: data.id,
        boardId: boardId
      });
    }
  }, [socket, boardId]);

  return {
    moveCard: moveCard.mutate,
    moveList: moveList.mutate,
    isMovingCard: moveCard.isPending,
    isMovingList: moveList.isPending,
    handleSocketCardMoved,
    handleSocketListMoved,
    handleDragStart,
    handleDragEnd
  };
};

export default useDragDrop;
