import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  FiPlus
} from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  useBoardWithData, 
  useBoardMembers, 
  useBoardActivities,
  useCreateList,
  useReorderLists,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useMoveCard
} from '../hooks';
import socketService from '../services/socket';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BoardHeader from '../components/board/BoardHeader';
import BoardListNew from '../components/board/BoardListNew';
import CardModal from '../components/board/CardModal';
import AddListForm from '../components/forms/AddListForm';
import BoardMemberManager from '../components/board/BoardMemberManager';
import PresenceAvatars from '../components/board/PresenceAvatars';
import ActivitySidebar from '../components/board/ActivitySidebar';
import '../components/board/BoardEnhancements.css';
import '../components/board/DragDropEnhancements.css';
import './BoardPage.css';

const BoardPageNew = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { 
    modals, 
    openModal, 
    closeModal, 
    boardSettings,
    setCardFilters,
    toggleActivities,
    dragState,
    startDrag,
    updateDrag,
    endDrag
  } = useUI();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [dragOperations, setDragOperations] = useState([]); // Track other users' drag operations

  // React Query hooks
  const { 
    data: boardData, 
    isLoading: boardLoading, 
    error: boardError 
  } = useBoardWithData(boardId);

  const { 
    data: boardMembers = [], 
    isLoading: membersLoading 
  } = useBoardMembers(boardId);

  const { 
    data: activities = [], 
    isLoading: activitiesLoading 
  } = useBoardActivities(boardId, 20);

  // Mutations
  const createListMutation = useCreateList();
  const reorderListsMutation = useReorderLists();
  
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const moveCardMutation = useMoveCard();

  // Socket.io integration for real-time updates
  useEffect(() => {
    if (!boardId) return;

    console.log('Setting up socket connection for board:', boardId);

    // Connect to socket service
    socketService.connect();
    
    // Add a small delay to ensure connection is established
    const joinTimeout = setTimeout(() => {
      console.log('Joining board:', boardId);
      socketService.joinBoard(boardId);
    }, 100);

    // Set up socket event listeners with enhanced debugging
    const handleCardCreated = (data) => {
      console.log('🎉 Socket event - Card created:', data);
      // Invalidate the board with data query since it contains all lists and cards
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Also invalidate specific list cards if we have the listId
      if (data.listId) {
        queryClient.invalidateQueries({ queryKey: ['lists', data.listId, 'cards'] });
      }
      // Also invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    const handleCardUpdated = (data) => {
      console.log('✏️ Socket event - Card updated:', data);
      // Invalidate the board with data query since it contains all lists and cards
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Also invalidate specific list cards and card data
      if (data.listId) {
        queryClient.invalidateQueries({ queryKey: ['lists', data.listId, 'cards'] });
      }
      if (data.card?.id) {
        queryClient.invalidateQueries({ queryKey: ['cards', data.card.id] });
      }
      // Also invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    const handleCardDeleted = (data) => {
      console.log('🗑️ Socket event - Card deleted:', data);
      // Invalidate the board with data query since it contains all lists and cards
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Also invalidate specific list cards
      if (data.listId) {
        queryClient.invalidateQueries({ queryKey: ['lists', data.listId, 'cards'] });
      }
      // Remove the deleted card from cache
      if (data.cardId) {
        queryClient.removeQueries({ queryKey: ['cards', data.cardId] });
      }
      // Also invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    // Handle real-time comment events for counter updates
    const handleCommentCreated = (data) => {
      console.log('💬 Socket event - Comment created:', data);
      if (data.cardId) {
        // Update card comment count in board cache
        queryClient.setQueryData(['boards', boardId, 'with-data'], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            lists: oldData.lists?.map(list => ({
              ...list,
              cards: list.cards?.map(card => 
                card.id === data.cardId 
                  ? { ...card, commentCount: (card.commentCount || 0) + 1 }
                  : card
              )
            }))
          };
        });
        
        // Also invalidate comment count query for mention bubble updates
        queryClient.invalidateQueries({ queryKey: ['mentions', 'card', data.cardId, 'count'] });
      }
      
      // Invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    const handleCommentDeleted = (data) => {
      console.log('🗑️ Socket event - Comment deleted:', data);
      if (data.cardId) {
        // Update card comment count in board cache
        queryClient.setQueryData(['boards', boardId, 'with-data'], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            lists: oldData.lists?.map(list => ({
              ...list,
              cards: list.cards?.map(card => 
                card.id === data.cardId 
                  ? { ...card, commentCount: Math.max((card.commentCount || 0) - 1, 0) }
                  : card
              )
            }))
          };
        });
        
        // Also invalidate comment count query for mention bubble updates
        queryClient.invalidateQueries({ queryKey: ['mentions', 'card', data.cardId, 'count'] });
      }
      
      // Invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    // Handle real-time mention events for mention bubble updates
    const handleMentionCreated = (data) => {
      console.log('🔔 Socket event - Mention created:', data);
      if (data.mention?.cardId) {
        // Invalidate mention count query to update mention bubble
        queryClient.invalidateQueries({ queryKey: ['mentions', 'card', data.mention.cardId, 'count'] });
      }
    };

    const handleListCreated = (data) => {
      console.log('📝 Socket event - List created:', data);
      // Invalidate the board with data query since it contains all lists and cards
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Also invalidate board lists
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'lists'] });
      // Also invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    const handleListUpdated = (data) => {
      console.log('📝 Socket event - List updated:', data);
      // Invalidate the board with data query since it contains all lists and cards
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Also invalidate board lists
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'lists'] });
      // Also invalidate specific list if we have the id
      if (data.list?.id) {
        queryClient.invalidateQueries({ queryKey: ['lists', data.list.id] });
      }
      // Also invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    const handleListDeleted = (data) => {
      console.log('🗑️ Socket event - List deleted:', data);
      // Invalidate the board with data query since it contains all lists and cards
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Also invalidate board lists
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'lists'] });
      // Remove the deleted list from cache
      if (data.listId) {
        queryClient.removeQueries({ queryKey: ['lists', data.listId] });
        queryClient.removeQueries({ queryKey: ['lists', data.listId, 'cards'] });
      }
      // Also invalidate board activities
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    // Handle real-time drag and drop events for other users
    const handleCardMoved = (data) => {
      console.log('🔄 Socket event - Card moved by another user:', data);
      
      // Update the board data cache optimistically for real-time feel
      queryClient.setQueryData(['boards', boardId, 'with-data'], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          lists: oldData.lists.map(list => {
            // Remove card from source list
            if (list.id === data.fromListId) {
              return {
                ...list,
                cards: list.cards.filter(card => card.id !== data.cardId)
              };
            }
            
            // Add card to target list
            if (list.id === data.toListId) {
              const newCards = [...list.cards];
              
              // Insert card at the correct position based on newPosition
              const cardData = {
                ...data.cardData,
                listId: data.toListId,
                position: data.newPosition
              };
              
              // Find correct insertion point
              let insertIndex = newCards.length;
              for (let i = 0; i < newCards.length; i++) {
                if (newCards[i].position > data.newPosition) {
                  insertIndex = i;
                  break;
                }
              }
              
              newCards.splice(insertIndex, 0, cardData);
              
              return {
                ...list,
                cards: newCards
              };
            }
            
            return list;
          })
        };
      });
      
      // Also invalidate board activities for the activity sidebar
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    const handleListMoved = (data) => {
      console.log('🔄 Socket event - List moved by another user:', data);
      
      // Update the board data cache optimistically for real-time feel
      queryClient.setQueryData(['boards', boardId, 'with-data'], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          lists: oldData.lists.map(list => {
            if (list.id === data.listId) {
              return {
                ...list,
                position: data.newPosition
              };
            }
            return list;
          }).sort((a, b) => a.position - b.position) // Re-sort by position
        };
      });
      
      // Also invalidate board activities for the activity sidebar
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'activities'] });
    };

    // Handle real-time drag start/end events for visual feedback
    const handleDragStart = (data) => {
      console.log('🎯 Socket event - Drag started by another user:', data);
      setDragOperations(prev => [
        ...prev.filter(op => op.userId !== data.draggedBy.id), // Remove any existing ops by this user
        {
          id: data.id,
          type: data.type,
          userId: data.draggedBy.id,
          userName: data.draggedBy.username || data.draggedBy.first_name,
          timestamp: data.timestamp
        }
      ]);
    };

    const handleDragEnd = (data) => {
      console.log('🎯 Socket event - Drag ended by another user:', data);
      setDragOperations(prev => 
        prev.filter(op => !(op.id === data.id && op.userId === data.draggedBy.id))
      );
    };

    // Register socket event listeners
    socketService.onCardCreated(handleCardCreated);
    socketService.onCardUpdated(handleCardUpdated);
    socketService.onCardDeleted(handleCardDeleted);
    socketService.onCardMoved(handleCardMoved);
    socketService.onListCreated(handleListCreated);
    socketService.onListUpdated(handleListUpdated);
    socketService.onListMoved(handleListMoved);
    socketService.onListDeleted(handleListDeleted);
    
    // Register comment and mention event listeners for real-time counters
    socketService.on('comment:created', handleCommentCreated);
    socketService.on('comment:deleted', handleCommentDeleted);
    socketService.on('mention:created', handleMentionCreated);
    
    // Register drag operation event listeners for visual feedback
    socketService.on('drag-start', handleDragStart);
    socketService.on('drag-end', handleDragEnd);

    // Log socket connection status
    const checkConnection = setInterval(() => {
      const isConnected = socketService.isSocketConnected();
      const currentBoard = socketService.getCurrentBoardId();
      console.log(`🔌 Socket status - Connected: ${isConnected}, Current Board: ${currentBoard}`);
    }, 5000);

    // Cleanup on unmount
    return () => {
      clearTimeout(joinTimeout);
      clearInterval(checkConnection);
      console.log('Cleaning up socket listeners for board:', boardId);
      socketService.removeAllListeners('card:created');
      socketService.removeAllListeners('card:updated');
      socketService.removeAllListeners('card:deleted');
      socketService.removeAllListeners('card:moved');
      socketService.removeAllListeners('list:created');
      socketService.removeAllListeners('list:updated');
      socketService.removeAllListeners('list:moved');
      socketService.removeAllListeners('list:deleted');
      socketService.removeAllListeners('comment:created');
      socketService.removeAllListeners('comment:deleted');
      socketService.removeAllListeners('mention:created');
      socketService.removeAllListeners('drag-start');
      socketService.removeAllListeners('drag-end');
      socketService.leaveBoard(boardId);
    };
  }, [boardId, queryClient]);

  // Global ESC handling to navigate back to dashboard when no modals are open
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Check if any modals are open
        const hasOpenModals = modals.cardDetails || showMemberModal;
        
        // Check if any forms are open (like add list, add card forms)
        const hasOpenForms = document.querySelector('.add-list-form, .add-card-form');
        
        // If no modals or forms are open, navigate back to dashboard
        if (!hasOpenModals && !hasOpenForms) {
          navigate('/dashboard');
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate, modals.cardDetails, showMemberModal]);

  // Handle ESC key for member modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showMemberModal) {
        setShowMemberModal(false);
      }
    };

    if (showMemberModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showMemberModal]);

  // Handle board not found
  const shouldRedirect = boardError?.response?.status === 404;
  
  // Filtered lists based on search and filters
  const filteredLists = useMemo(() => {
    if (!boardData?.lists) return [];
    
    return boardData.lists.map(list => ({
      ...list,
      cards: (list.cards || []).filter(card => {
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = card.title?.toLowerCase().includes(query);
          const matchesDescription = card.description?.toLowerCase().includes(query);
          const matchesLabels = card.labels?.some(label => 
            (typeof label === 'string' ? label : label.name || '')
              .toLowerCase().includes(query)
          );
          
          if (!matchesTitle && !matchesDescription && !matchesLabels) {
            return false;
          }
        }

        // Apply card filters from UI context
        const { assignee, labels, dueDate } = boardSettings.cardFilters;
        
        if (assignee && !card.assignees?.includes(assignee)) {
          return false;
        }

        if (labels?.length > 0) {
          if (!card.labels?.some(label => labels.includes(
            typeof label === 'string' ? label : label.name || ''
          ))) {
            return false;
          }
        }

        if (dueDate) {
          if (!card.due_date) return false;
          // Add due date filter logic here
        }

        return true;
      })
    }));
  }, [boardData, searchQuery, boardSettings.cardFilters]);

  // Handle navigation after hooks
  if (shouldRedirect) {
    navigate('/404');
    return null;
  }

  // Drag and drop handlers
  const handleDragStart = (start) => {
    // Don't allow drag if data isn't ready
    if (!boardData?.lists || boardLoading) {
      return;
    }

    const { draggableId, source, type } = start;
    
    if (type === 'list') {
      const list = boardData.lists.find(l => String(l.id) === draggableId);
      startDrag(list, 'list', source.droppableId);
      
      // Emit socket event for visual feedback
      socketService.emit('drag-start', {
        type: 'list',
        id: draggableId,
        boardId: boardId
      });
    } else if (type === 'card') {
      const sourceList = boardData.lists.find(l => String(l.id) === source.droppableId);
      const card = sourceList?.cards?.find(c => String(c.id) === draggableId);
      startDrag(card, 'card', source.droppableId);
      
      // Emit socket event for visual feedback
      socketService.emit('drag-start', {
        type: 'card',
        id: draggableId,
        boardId: boardId
      });
    }
  };

  const handleDragUpdate = (update) => {
    if (update.destination) {
      updateDrag(update.destination.droppableId);
    }
  };

  const handleDragEnd = async (result) => {
    console.log('🎉 Drag ended successfully!', result);
    
    const { destination, source, type, draggableId } = result;

    // Emit drag-end event for visual feedback cleanup
    socketService.emit('drag-end', {
      type,
      id: draggableId,
      boardId: boardId
    });

    // Schedule endDrag with a longer delay to ensure React Beautiful DnD completes its cleanup
    const scheduleEndDrag = () => {
      // Use setTimeout instead of requestAnimationFrame for more reliable timing
      setTimeout(() => {
        endDrag();
      }, 100); // Give React Beautiful DnD time to complete its animations
    };

    if (!destination) {
      console.log('❌ Dropped outside valid area');
      scheduleEndDrag();
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('➡️ Dropped in same position');
      scheduleEndDrag();
      return;
    }

    console.log('✅ Valid drag operation:', {
      type,
      draggableId,
      from: `${source.droppableId}[${source.index}]`,
      to: `${destination.droppableId}[${destination.index}]`,
      sourceType: source.type,
      destType: destination.type
    });

    try {
      if (type === 'list') {
        // Validate draggableId format for lists
        if (!draggableId.startsWith('list-')) {
          console.error('❌ Invalid list draggableId format:', draggableId);
          scheduleEndDrag();
          return;
        }
        
        // Ensure we're only handling list operations
        if (destination.droppableId !== 'all-lists' || source.droppableId !== 'all-lists') {
          console.error('❌ Invalid list drag - not within all-lists container');
          scheduleEndDrag();
          return;
        }
        
        // Extract the actual list ID from the prefixed draggableId
        const listId = draggableId.replace('list-', ''); // eslint-disable-line no-unused-vars
        
        // Handle list reordering
        const sourceIndex = source.index;
        const destIndex = destination.index;
        
        // Optimistically update local state
        const currentLists = [...boardData.lists];
        const [movedList] = currentLists.splice(sourceIndex, 1);
        currentLists.splice(destIndex, 0, movedList);
        
        // Update positions
        const updatedLists = currentLists.map((list, index) => ({
          ...list,
          position: index
        }));
        
        // Update the query cache optimistically
        queryClient.setQueryData(['boards', boardId, 'with-data'], (oldData) => ({
          ...oldData,
          lists: updatedLists
        }));
        
        // Call API to persist the change
        await reorderListsMutation.mutateAsync({
          boardId,
          listOrder: updatedLists.map(list => ({ id: list.id, position: list.position }))
        });
        
      } else if (type === 'card') {
        // Validate draggableId format for cards
        if (!draggableId.startsWith('card-')) {
          console.error('❌ Invalid card draggableId format:', draggableId);
          scheduleEndDrag();
          return;
        }
        
        // Ensure we're only handling card operations between valid lists
        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;
        
        // Extract the actual card ID from the prefixed draggableId
        const cardId = draggableId.replace('card-', '');
        
        // Validate that source and destination are list IDs (numbers), not 'all-lists'
        if (sourceListId === 'all-lists' || destListId === 'all-lists') {
          console.error('❌ Invalid card drag - cards cannot be dropped in all-lists container');
          scheduleEndDrag();
          return;
        }
        
        // Validate that the droppable IDs are valid list IDs
        const sourceList = boardData?.lists?.find(list => String(list.id) === sourceListId);
        const destList = boardData?.lists?.find(list => String(list.id) === destListId);
        
        if (!sourceList || !destList) {
          console.error('❌ Invalid card drag - invalid list IDs', { sourceListId, destListId });
          scheduleEndDrag();
          return;
        }

        // Handle card movement between lists
        console.log('🔄 Card drag parameters:', {
          boardId,
          sourceListId,
          destListId,
          cardId,
          position: destination.index
        });
        
        if (sourceListId === destListId) {
          // Reordering within same list
          await moveCardMutation.mutateAsync({
            boardId,
            sourceListId,
            cardId,
            targetListId: destListId,
            position: destination.index
          });
        } else {
          // Moving card between lists
          await moveCardMutation.mutateAsync({
            boardId,
            sourceListId,
            cardId,
            targetListId: destListId,
            position: destination.index
          });
        }
      } else {
        // Unknown drag type or improper draggableId format
        console.error('❌ Unknown drag type or invalid draggableId format:', { 
          type, 
          draggableId,
          expectedFormat: 'list-{id} or card-{id}'
        });
        scheduleEndDrag();
        return;
      }
      
      // Schedule endDrag after successful operation
      scheduleEndDrag();
      
    } catch (error) {
      console.error('❌ Drag operation failed:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'with-data'] });
      // Schedule endDrag even on error
      scheduleEndDrag();
    }
  };  // Event handlers
  const handleListAdded = async (listData) => {
    // The list has already been created by the AddListForm React Query mutation
    // Just handle any UI state changes
    console.log('List added successfully:', listData);
    setShowAddList(false);
  };

  const handleCardAdded = async (cardData, listId) => {
    // The card has already been created by the AddCardForm React Query mutation
    // React Query optimistic updates have already updated the cache
    // Just handle any UI state changes
    console.log('Card added successfully:', cardData, 'to list:', listId);
  };

  const handleCardClick = (card, listId) => {
    openModal('cardDetails', { ...card, listId });
  };

  const handleCloseCardModal = () => {
    closeModal('cardDetails');
  };

  const handleCardUpdated = (cardId, listId, updates) => {
    // Card has already been updated by the CardModal's React Query mutation
    // React Query optimistic updates have already updated the cache
    // Just handle any UI state changes if needed
    console.log('Card updated successfully:', cardId, 'in list:', listId, 'with updates:', updates);
    
    // Close the card modal if it's open
    if (modals.cardDetails.isOpen && modals.cardDetails.card?.id === cardId) {
      closeModal('cardDetails');
    }
  };

  const handleCardDeleted = async (cardId, listId) => {
    // The card has already been deleted by the CardItem React Query mutation
    // React Query optimistic updates have already updated the cache
    // Just handle any UI state changes
    console.log('Card deleted successfully:', cardId, 'from list:', listId);
  };

  const handleListUpdated = (listId, updates) => {
    // List has already been updated by the BoardListNew's React Query mutation
    // React Query optimistic updates have already updated the cache
    // Just handle any UI state changes if needed
    console.log('List updated successfully:', listId, 'with updates:', updates);
  };

  const handleListDeleted = async (listId) => {
    // The list has already been deleted by the BoardList React Query mutation
    // React Query optimistic updates have already updated the cache
    // Just handle any UI state changes
    console.log('List deleted successfully:', listId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (filters) => {
    setCardFilters(filters);
  };

  const handleOpenMemberModal = () => {
    setShowMemberModal(true);
  };

  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
  };

  const handleMembersUpdate = () => {
    // Refresh the board members data
    queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'members'] });
  };

  // Loading state
  if (boardLoading) {
    return <LoadingSpinner size="large" message="Loading board..." />;
  }

  // Error state with fallback demo data
  if (boardError && !boardData) {
    console.error('Board error:', boardError);
    return (
      <div className="board-error">
        <h2>Board not found</h2>
        <p>The board you're looking for doesn't exist or you don't have access to it.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const selectedCard = modals.cardDetails;

  // Get board background color with gradient
  const boardBackgroundColor = boardData?.color || '#0079bf';
  const gradientStyle = {
    background: `linear-gradient(135deg, ${boardBackgroundColor} 0%, ${boardBackgroundColor}dd 100%)`
  };

  return (
    <div 
      className="board-page"
      style={gradientStyle}
    >
      <BoardHeader
        board={boardData}
        members={boardMembers}
        onToggleActivity={toggleActivities}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onOpenMemberModal={handleOpenMemberModal}
        isLoading={membersLoading}
      />

      {/* Presence Avatars */}
      <div className="presence-container">
        <PresenceAvatars 
          boardId={boardId} 
          currentUser={currentUser} 
        />
      </div>

      <div className="board-content">
        <DragDropContext 
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate} 
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided, snapshot) => (
              <div
                className={`board-lists ${snapshot.isDraggingOver ? 'is-dragging-over' : ''} ${dragState.isDragging ? 'is-dragging' : ''}`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {boardData?.lists && filteredLists.length >= 0 ? (
                  <>
                    {filteredLists.map((list, index) => (
                      <Draggable 
                        key={String(list.id)} 
                        draggableId={`list-${String(list.id)}`} 
                        index={index}
                        isDragDisabled={!boardData?.lists || boardLoading}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1
                            }}
                            className={snapshot.isDragging ? 'list-dragging-container' : ''}
                          >
                            <BoardListNew
                              list={list}
                              onCardClick={handleCardClick}
                              onCardAdded={handleCardAdded}
                              onCardUpdated={handleCardUpdated}
                              onCardDeleted={handleCardDeleted}
                              onListUpdated={handleListUpdated}
                              onListDeleted={handleListDeleted}
                              boardId={boardId}
                              isLoading={
                                createCardMutation.isLoading ||
                                updateCardMutation.isLoading ||
                                deleteCardMutation.isLoading ||
                                !boardData?.lists ||
                                boardLoading
                              }
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    <div className="add-list-container">
                      {showAddList ? (
                        <AddListForm
                          boardId={boardId}
                          onListAdded={handleListAdded}
                          onCancel={() => setShowAddList(false)}
                          isLoading={createListMutation.isLoading}
                        />
                      ) : (
                        <button
                          className="add-list-btn"
                          onClick={() => setShowAddList(true)}
                          disabled={createListMutation.isLoading || !boardData?.lists}
                        >
                          <FiPlus />
                          Add another list
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="board-loading">
                    <LoadingSpinner size="medium" message="Loading lists..." />
                    {provided.placeholder}
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Activity Sidebar */}
      {boardSettings.showActivities && (
        <ActivitySidebar
          activities={activities}
          isLoading={activitiesLoading}
          onClose={toggleActivities}
          boardMembers={boardMembers}
        />
      )}

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={boardId}
          listId={selectedCard.listId}
          onClose={handleCloseCardModal}
          onCardUpdated={handleCardUpdated}
          members={boardMembers}
          isLoading={updateCardMutation.isLoading}
        />
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={handleCloseMemberModal}>
          <div className="modal-content-members" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Board Members</h2>
              <button 
                className="modal-close-btn"
                onClick={handleCloseMemberModal}
              >
                ×
              </button>
            </div>
            <BoardMemberManager
              boardId={boardId}
              members={boardMembers}
              onMembersUpdate={handleMembersUpdate}
              currentUser={JSON.parse(localStorage.getItem('user'))} // Get current user from localStorage
              boardOwner={boardData?.owner || boardData?.userId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPageNew;
