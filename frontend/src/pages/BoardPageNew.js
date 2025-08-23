import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  FiPlus, 
  FiActivity
} from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useUI } from '../contexts/UIContext';
import { 
  useBoardWithData, 
  useBoardMembers, 
  useBoardActivities,
  useCreateList,
  useUpdateList,
  useDeleteList,
  useReorderLists,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useMoveCard
} from '../hooks';
import { calculateNewPosition, calculateReorderPositions } from '../utils/positionUtils';
import socketService from '../services/socket';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BoardHeader from '../components/board/BoardHeader';
import BoardListNew from '../components/board/BoardListNew';
import CardModal from '../components/board/CardModal';
import AddListForm from '../components/forms/AddListForm';
import '../components/board/BoardEnhancements.css';
import './BoardPage.css';

const BoardPageNew = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    modals, 
    openModal, 
    closeModal, 
    boardSettings,
    setCardFilters,
    dragState,
    startDrag,
    updateDrag,
    endDrag
  } = useUI();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddList, setShowAddList] = useState(false);

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
  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();
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

    // Register socket event listeners
    socketService.onCardCreated(handleCardCreated);
    socketService.onCardUpdated(handleCardUpdated);
    socketService.onCardDeleted(handleCardDeleted);
    socketService.onListCreated(handleListCreated);
    socketService.onListUpdated(handleListUpdated);
    socketService.onListDeleted(handleListDeleted);

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
      socketService.removeAllListeners('list:created');
      socketService.removeAllListeners('list:updated');
      socketService.removeAllListeners('list:deleted');
      socketService.leaveBoard(boardId);
    };
  }, [boardId, queryClient]);

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
    } else if (type === 'card') {
      const sourceList = boardData.lists.find(l => String(l.id) === source.droppableId);
      const card = sourceList?.cards?.find(c => String(c.id) === draggableId);
      startDrag(card, 'card', source.droppableId);
    }
  };

  const handleDragUpdate = (update) => {
    if (update.destination) {
      updateDrag(update.destination.droppableId);
    }
  };

  const handleDragEnd = async (result) => {
    endDrag();
    
    // Don't allow drag if data isn't ready
    if (!boardData?.lists || boardLoading) {
      return;
    }
    
    const { destination, source, type, draggableId } = result;

    // Check if drag was cancelled or no position change
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    try {
      if (type === 'list') {
        // Reorder lists
        const listId = parseInt(draggableId);
        const listToMove = boardData.lists.find(list => list.id === listId);
        
        if (!listToMove) return;

        // Calculate new position using utility
        const newPosition = calculateNewPosition(
          boardData.lists,
          destination.index
        );

        await reorderListsMutation.mutateAsync({ 
          boardId, 
          listOrder: [{ id: listId, position: newPosition }]
        });
        
      } else if (type === 'card') {
        // Move card
        const sourceListId = source.droppableId;
        const targetListId = destination.droppableId;
        const cardId = parseInt(draggableId);
        
        // Find the target list to get its cards for position calculation
        const targetList = boardData.lists.find(list => String(list.id) === targetListId);
        const sourceList = boardData.lists.find(list => String(list.id) === sourceListId);
        
        if (!targetList || !sourceList) {
          console.error('Could not find source or target list:', { sourceListId, targetListId, lists: boardData.lists });
          return;
        }
        
        const targetCards = targetList.cards || [];
        
        let newPosition;
        
        if (sourceListId === targetListId) {
          // Same list reordering - remove the card from consideration
          const cardToMove = targetCards.find(card => card.id === cardId);
          newPosition = calculateNewPosition(
            targetCards,
            destination.index,
            cardToMove
          );
        } else {
          // Moving between lists
          newPosition = calculateNewPosition(
            targetCards,
            destination.index
          );
        }

        await moveCardMutation.mutateAsync({
          boardId,
          sourceListId,
          cardId: draggableId,
          targetListId,
          position: newPosition
        });
      }
    } catch (error) {
      console.error('Drag operation failed:', error);
    }
  };

  // Event handlers
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
        onToggleActivity={() => {
          // Toggle activity sidebar using UI context
          // This would be handled by the UI context
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={membersLoading}
      />

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
                        draggableId={String(list.id)} 
                        index={index}
                        isDragDisabled={!boardData?.lists || boardLoading}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1
                            }}
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
        <div className="activity-sidebar">
          <div className="activity-header">
            <h3>
              <FiActivity />
              Activity
            </h3>
            <button
              className="close-activity"
              onClick={() => {
                // Close activity sidebar using UI context
                // This would be handled by the UI context
              }}
            >
              ×
            </button>
          </div>
          <div className="activity-list">
            {activitiesLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
    </div>
  );
};

export default BoardPageNew;
