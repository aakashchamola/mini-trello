import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  FiPlus, 
  FiMoreHorizontal, 
  FiStar, 
  FiUsers,
  FiFilter,
  FiSearch,
  FiActivity
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { boardAPI, listAPI, cardAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BoardHeader from '../components/board/BoardHeader';
import BoardList from '../components/board/BoardList';
import CardModal from '../components/board/CardModal';
import AddListForm from '../components/forms/AddListForm';
import './BoardPage.css';

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentBoard, 
    setCurrentBoard, 
    selectedCard, 
    setSelectedCard,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters 
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [showAddList, setShowAddList] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);

  useEffect(() => {
    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  const fetchBoardData = async () => {
    try {
      setIsLoading(true);
      const [boardRes, membersRes, activitiesRes] = await Promise.all([
        boardAPI.getBoardById(boardId, { include: 'lists,cards,members' }),
        boardAPI.getBoardMembers(boardId),
        boardAPI.getBoardActivities(boardId, { limit: 20 })
      ]);

      setCurrentBoard(boardRes.data.board);
      setBoardMembers(membersRes.data.members || []);
      setActivities(activitiesRes.data.activities || []);
    } catch (error) {
      console.error('Failed to fetch board data:', error);
      if (error.response?.status === 404) {
        navigate('/404');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      if (type === 'list') {
        // Reorder lists
        const newLists = Array.from(currentBoard.lists);
        const [movedList] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, movedList);

        // Update local state optimistically
        setCurrentBoard({ ...currentBoard, lists: newLists });

        // Update positions on server
        const listOrder = newLists.map((list, index) => ({
          id: list.id,
          position: index * 1024
        }));

        await listAPI.reorderLists(boardId, { listOrder });
      } else if (type === 'card') {
        // Move card between lists or reorder within list
        const sourceListId = source.droppableId;
        const destinationListId = destination.droppableId;

        if (sourceListId === destinationListId) {
          // Reorder within the same list
          const list = currentBoard.lists.find(l => l.id === sourceListId);
          const newCards = Array.from(list.cards);
          const [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, movedCard);

          // Update local state
          const newLists = currentBoard.lists.map(l =>
            l.id === sourceListId ? { ...l, cards: newCards } : l
          );
          setCurrentBoard({ ...currentBoard, lists: newLists });

          // Update position on server
          await cardAPI.updateCard(boardId, sourceListId, draggableId, {
            position: destination.index * 1024
          });
        } else {
          // Move to different list
          const sourceList = currentBoard.lists.find(l => l.id === sourceListId);
          const destinationList = currentBoard.lists.find(l => l.id === destinationListId);
          
          const sourceCards = Array.from(sourceList.cards);
          const destinationCards = Array.from(destinationList.cards);
          
          const [movedCard] = sourceCards.splice(source.index, 1);
          destinationCards.splice(destination.index, 0, { 
            ...movedCard, 
            listId: destinationListId 
          });

          // Update local state
          const newLists = currentBoard.lists.map(l => {
            if (l.id === sourceListId) {
              return { ...l, cards: sourceCards };
            } else if (l.id === destinationListId) {
              return { ...l, cards: destinationCards };
            }
            return l;
          });
          setCurrentBoard({ ...currentBoard, lists: newLists });

          // Move card on server
          await cardAPI.moveCard(boardId, sourceListId, draggableId, {
            targetListId: destinationListId,
            position: destination.index * 1024
          });
        }
      }
    } catch (error) {
      console.error('Failed to move item:', error);
      // Revert optimistic update by refetching
      fetchBoardData();
    }
  };

  const handleListAdded = (newList) => {
    setCurrentBoard({
      ...currentBoard,
      lists: [...currentBoard.lists, newList]
    });
    setShowAddList(false);
  };

  const handleCardClick = (card, listId) => {
    setSelectedCard({ ...card, listId });
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null);
  };

  const filteredLists = currentBoard?.lists?.map(list => ({
    ...list,
    cards: list.cards?.filter(card => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesDescription = card.description?.toLowerCase().includes(query);
        const matchesLabels = card.labels?.some(label => 
          label.toLowerCase().includes(query)
        );
        
        if (!matchesTitle && !matchesDescription && !matchesLabels) {
          return false;
        }
      }

      // Apply filters
      if (activeFilters.assignees?.length > 0) {
        if (!card.assignedUserId || !activeFilters.assignees.includes(card.assignedUserId)) {
          return false;
        }
      }

      if (activeFilters.labels?.length > 0) {
        if (!card.labels?.some(label => activeFilters.labels.includes(label))) {
          return false;
        }
      }

      if (activeFilters.dueDate) {
        if (!card.due_date) return false;
        // Apply due date filter logic here
      }

      return true;
    }) || []
  })) || [];

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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                className="board-lists"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredLists.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <BoardList
                          list={list}
                          onCardClick={handleCardClick}
                          boardId={boardId}
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
          members={boardMembers}
        />
      )}
    </div>
  );
};

export default BoardPage;
