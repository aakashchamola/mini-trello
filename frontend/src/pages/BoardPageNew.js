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
import socketService from '../services/socket';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BoardHeader from '../components/board/BoardHeader';
import BoardListNew from '../components/board/BoardListNew';
import CardModal from '../components/board/CardModal';
import AddListForm from '../components/forms/AddListForm';
import BoardMemberManager from '../components/board/BoardMemberManager';
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
  const [showMemberModal, setShowMemberModal] = useState(false);

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
    console.log('🎉 Drag ended successfully!', result);
    
    const { destination, source, type, draggableId } = result;

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
        const listId = draggableId.replace('list-', '');
        
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
        onToggleActivity={() => {
          // Toggle activity sidebar using UI context
          // This would be handled by the UI context
        }}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onOpenMemberModal={handleOpenMemberModal}
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
            ) : activities.length > 0 ? (
              activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-avatar">
                    {activity.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-description">
                      <strong>{activity.user?.name || 'Unknown User'}</strong>
                      <span className="activity-action">{activity.description}</span>
                    </div>
                    <span className="activity-time">
                      {new Date(activity.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No recent activity</p>
                <p>Activity will appear here as you work on this board</p>
              </div>
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

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={handleCloseMemberModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
