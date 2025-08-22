import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  FiPlus, 
  FiActivity
} from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { boardAPI, listAPI, cardAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BoardHeader from '../components/board/BoardHeader';
import BoardList from '../components/board/BoardList';
import CardModal from '../components/board/CardModal';
import AddListForm from '../components/forms/AddListForm';
import { toast } from 'react-toastify';
import './BoardPage.css';

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { 
    selectedCard, 
    setSelectedCard,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters
  } = useApp();

  // Use local state for currentBoard instead of context
  const [currentBoard, setCurrentBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddList, setShowAddList] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);

  // Real-time collaboration state (placeholder for future implementation)
  const [isDragging, setIsDragging] = useState(false);

  const fetchBoardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch board with lists and cards
      const boardRes = await boardAPI.getById(boardId);
      console.log('Board data:', boardRes.data);
      
      const boardData = boardRes.data?.board || boardRes.data?.data || boardRes.data;
      
      // If lists are not included in board response, fetch them separately
      let listsData = [];
      if (!boardData.lists) {
        try {
          const listsRes = await listAPI.getByBoard(boardId);
          listsData = listsRes.data?.lists || listsRes.data?.data || [];
          
          // Fetch cards for each list
          const listsWithCards = await Promise.all(
            listsData.map(async (list) => {
              try {
                const cardsRes = await cardAPI.getByList(boardId, list.id);
                const cards = cardsRes.data?.cards || cardsRes.data?.data || [];
                return { ...list, cards };
              } catch (err) {
                console.error(`Error fetching cards for list ${list.id}:`, err);
                return { ...list, cards: [] };
              }
            })
          );
          
          boardData.lists = listsWithCards;
        } catch (err) {
          console.error('Error fetching lists:', err);
          boardData.lists = [];
        }
      }

      setCurrentBoard(boardData);
      
      // Fetch board members
      try {
        const membersRes = await boardAPI.getMembers(boardId);
        setBoardMembers(membersRes.data?.members || membersRes.data?.data || []);
      } catch (err) {
        console.error('Error fetching board members:', err);
        setBoardMembers([]);
      }
      
      // Fetch board activities
      try {
        const activitiesRes = await boardAPI.getActivities(boardId, { limit: 20 });
        setActivities(activitiesRes.data?.activities || activitiesRes.data?.data || []);
      } catch (err) {
        console.error('Error fetching board activities:', err);
        setActivities([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch board data:', error);
      if (error.response?.status === 404) {
        navigate('/404');
      } else {
        // Set some demo data for development
        setCurrentBoard({
          id: boardId,
          title: 'Demo Board',
          description: 'A demo board for testing',
          background_color: '#0079bf',
          lists: [
            {
              id: 'demo-list-1',
              title: 'To Do',
              position: 0,
              cards: [
                {
                  id: 'demo-card-1',
                  title: 'Sample Task',
                  description: 'This is a sample task',
                  position: 0,
                  priority: 'medium',
                  labels: ['Feature']
                }
              ]
            },
            {
              id: 'demo-list-2',
              title: 'In Progress',
              position: 1,
              cards: []
            },
            {
              id: 'demo-list-3',
              title: 'Done',
              position: 2,
              cards: []
            }
          ]
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [boardId, navigate]);

  useEffect(() => {
    if (boardId) {
      fetchBoardData(); // eslint-disable-line no-use-before-define
    }
  }, [boardId, fetchBoardData]);

  const handleDragStart = (start) => {
    setIsDragging(true);
    console.log('Drag started:', start);
    
    // Safety timeout to reset drag state if something goes wrong
    setTimeout(() => {
      if (isDragging) {
        console.warn('Drag state timeout - resetting');
        setIsDragging(false);
      }
    }, 10000); // 10 second timeout
  };

  const handleDragEnd = async (result) => {
    setIsDragging(false);
    
    const { destination, source, type, draggableId } = result;

    console.log('Drag ended:', { destination, source, type, draggableId });

    // Check if drag was cancelled
    if (!destination) {
      console.log('No destination - drag cancelled');
      return;
    }

    // Check if position actually changed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('Same position - no change needed');
      return;
    }

    try {
      if (type === 'list') {
        console.log('Moving list from index', source.index, 'to index', destination.index);
        
        // Create new lists array with moved list
        const newLists = Array.from(currentBoard.lists);
        const [movedList] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, movedList);

        // Update local state optimistically
        setCurrentBoard(prevBoard => ({
          ...prevBoard,
          lists: newLists
        }));

        // Update positions on server
        const listOrder = newLists.map((list, index) => ({
          id: list.id,
          position: index * 1024
        }));

        await listAPI.reorder(boardId, { listOrder });
        console.log('List reorder completed successfully');
        
      } else if (type === 'card') {
        // Move card between lists or reorder within list
        const sourceListId = source.droppableId;
        const destinationListId = destination.droppableId;

        console.log('Moving card:', draggableId, 'from list', sourceListId, 'to list', destinationListId);

        if (sourceListId === destinationListId) {
          console.log('Reordering card within same list');
          
          // Find the source list
          const sourceList = currentBoard.lists.find(l => String(l.id) === sourceListId);
          if (!sourceList) {
            console.error('Source list not found:', sourceListId);
            return;
          }
          
          // Reorder cards within the same list
          const newCards = Array.from(sourceList.cards);
          const [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, movedCard);

          // Update local state
          setCurrentBoard(prevBoard => ({
            ...prevBoard,
            lists: prevBoard.lists.map(l =>
              String(l.id) === sourceListId ? { ...l, cards: newCards } : l
            )
          }));

          // Update position on server
          await cardAPI.update(boardId, sourceListId, draggableId, {
            position: destination.index * 1024
          });
          console.log('Card reorder completed successfully');
          
        } else {
          console.log('Moving card between different lists');
          
          // Find source and destination lists
          const sourceList = currentBoard.lists.find(l => String(l.id) === sourceListId);
          const destinationList = currentBoard.lists.find(l => String(l.id) === destinationListId);
          
          if (!sourceList || !destinationList) {
            console.error('Lists not found:', { sourceListId, destinationListId });
            return;
          }
          
          // Move card between lists
          const sourceCards = Array.from(sourceList.cards);
          const destinationCards = Array.from(destinationList.cards);
          
          const [movedCard] = sourceCards.splice(source.index, 1);
          destinationCards.splice(destination.index, 0, { 
            ...movedCard, 
            listId: destinationListId 
          });

          // Update local state
          setCurrentBoard(prevBoard => ({
            ...prevBoard,
            lists: prevBoard.lists.map(l => {
              if (String(l.id) === sourceListId) {
                return { ...l, cards: sourceCards };
              } else if (String(l.id) === destinationListId) {
                return { ...l, cards: destinationCards };
              }
              return l;
            })
          }));

          // Move card on server
          await cardAPI.move(boardId, sourceListId, draggableId, {
            targetListId: destinationListId,
            position: destination.index * 1024
          });
          console.log('Card move between lists completed successfully');
        }
      }
    } catch (error) {
      console.error('Failed to move item:', error);
      toast.error('Failed to move item. Please try again.');
      // Revert optimistic update by refetching
      await fetchBoardData();
    }
  };

  const handleListAdded = (newList) => {
    setCurrentBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) {
        console.error('Invalid board state when adding list');
        return prevBoard;
      }
      
      return {
        ...prevBoard,
        lists: [...prevBoard.lists, { ...newList, cards: [] }]
      };
    });
    setShowAddList(false);
  };

  const handleCardAdded = (newCard, listId) => {
    console.log('BoardPage: Adding new card:', newCard, 'to list:', listId);
    console.log('Current board before update:', currentBoard);
    
    setCurrentBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) {
        console.error('Invalid board state when adding card');
        return prevBoard;
      }
      
      const updatedBoard = {
        ...prevBoard,
        lists: prevBoard.lists.map(list => 
          list.id === listId 
            ? { 
                ...list, 
                cards: [...(list.cards || []), newCard] 
              }
            : list
        )
      };
      
      console.log('BoardPage: Updated board after adding card:', updatedBoard);
      return updatedBoard;
    });
  };

  const handleCardUpdated = (updatedCard, listId) => {
    console.log('BoardPage: Updating card:', updatedCard, 'in list:', listId);
    setCurrentBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) {
        console.error('Invalid board state when updating card');
        return prevBoard;
      }
      
      const updatedBoard = {
        ...prevBoard,
        lists: prevBoard.lists.map(list => 
          list.id === listId 
            ? { 
                ...list, 
                cards: (list.cards || []).map(card => 
                  card.id === updatedCard.id ? updatedCard : card
                )
              }
            : list
        )
      };
      
      console.log('BoardPage: Updated board after card update:', updatedBoard);
      return updatedBoard;
    });
    
    // Also update the selectedCard if it's the same card
    setSelectedCard(prevSelected => {
      if (prevSelected && prevSelected.id === updatedCard.id) {
        return { ...updatedCard, listId };
      }
      return prevSelected;
    });
  };

  const handleCardDeleted = (cardId, listId) => {
    setCurrentBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) {
        console.error('Invalid board state when deleting card');
        return prevBoard;
      }
      
      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list => 
          list.id === listId 
            ? { 
                ...list, 
                cards: (list.cards || []).filter(card => card.id !== cardId)
              }
            : list
        )
      };
    });
  };

  const handleListUpdated = (updatedList) => {
    setCurrentBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) {
        console.error('Invalid board state when updating list');
        return prevBoard;
      }
      
      return {
        ...prevBoard,
        lists: prevBoard.lists.map(list => 
          list.id === updatedList.id ? { ...list, ...updatedList } : list
        )
      };
    });
  };

  const handleListDeleted = (listId) => {
    setCurrentBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) {
        console.error('Invalid board state when deleting list');
        return prevBoard;
      }
      
      return {
        ...prevBoard,
        lists: prevBoard.lists.filter(list => list.id !== listId)
      };
    });
  };

  const handleCardClick = (card, listId) => {
    setSelectedCard({ ...card, listId });
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null);
  };

  const filteredLists = useMemo(() => {
    console.log('Recalculating filteredLists with currentBoard:', currentBoard);
    
    if (!currentBoard?.lists) {
      console.log('No lists found in currentBoard');
      return [];
    }
    
    const result = currentBoard.lists.map(list => ({
      ...list,
      cards: (list.cards || []).filter(card => {
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = card.title?.toLowerCase().includes(query) || false;
          const matchesDescription = card.description?.toLowerCase().includes(query) || false;
          const matchesLabels = card.labels?.some(label => 
            (typeof label === 'string' ? label : label.name || '')
              .toLowerCase().includes(query)
          ) || false;
          
          if (!matchesTitle && !matchesDescription && !matchesLabels) {
            return false;
          }
        }

        // Apply filters
        if (activeFilters?.assignees?.length > 0) {
          if (!card.assignedUserId || !activeFilters.assignees.includes(card.assignedUserId)) {
            return false;
          }
        }

        if (activeFilters?.labels?.length > 0) {
          if (!card.labels?.some(label => activeFilters.labels.includes(
            typeof label === 'string' ? label : label.name || ''
          ))) {
            return false;
          }
        }

        if (activeFilters?.dueDate) {
          if (!card.due_date) return false;
          // Apply due date filter logic here
        }

        return true;
      })
    }));
    
    console.log('Filtered lists result:', result);
    return result;
  }, [currentBoard, searchQuery, activeFilters]);

  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading board..." />;
  }

  if (!currentBoard) {
    return (
      <div className="board-error">
        <h2>Board not found</h2>
        <p>The board you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  console.log('Rendering BoardPage with filteredLists:', filteredLists);

  return (
    <div className="board-page">
      <BoardHeader
        board={currentBoard}
        members={boardMembers}
        onToggleActivity={() => setShowActivitySidebar(!showActivitySidebar)}
        onSearch={setSearchQuery}
        onFilter={setActiveFilters}
      />

      <div className="board-content">
        <DragDropContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          onBeforeCapture={(before) => {
            // Prevent multiple drag operations
            if (isDragging) {
              console.warn('Drag already in progress, preventing new drag');
              return;
            }
            console.log('Before capture:', before);
          }}
        >
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided, snapshot) => (
              <div
                className={`board-lists ${snapshot.isDraggingOver ? 'is-dragging-over' : ''} ${isDragging ? 'is-dragging' : ''}`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredLists.map((list, index) => {
                  console.log(`Rendering list ${list.id} with ${list.cards?.length || 0} cards`);
                  return (
                    <Draggable key={String(list.id)} draggableId={String(list.id)} index={index}>
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
                          <BoardList
                            list={list}
                            onCardClick={handleCardClick}
                            onCardAdded={handleCardAdded}
                            onCardUpdated={handleCardUpdated}
                            onCardDeleted={handleCardDeleted}
                            onListUpdated={handleListUpdated}
                            onListDeleted={handleListDeleted}
                            boardId={boardId}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                <div className="add-list-container">
                  {showAddList ? (
                    <AddListForm
                      boardId={boardId}
                      onListAdded={handleListAdded}
                      onCancel={() => setShowAddList(false)}
                    />
                  ) : (
                    <button
                      className="add-list-btn"
                      onClick={() => setShowAddList(true)}
                    >
                      <FiPlus />
                      Add another list
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Activity Sidebar */}
      {showActivitySidebar && (
        <div className="activity-sidebar">
          <div className="activity-header">
            <h3>
              <FiActivity />
              Activity
            </h3>
            <button
              className="close-activity"
              onClick={() => setShowActivitySidebar(false)}
            >
              ×
            </button>
          </div>
          <div className="activity-list">
            {activities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">{activity.createdAt}</span>
                </div>
              </div>
            ))}
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
        />
      )}
    </div>
  );
};

export default BoardPage;
