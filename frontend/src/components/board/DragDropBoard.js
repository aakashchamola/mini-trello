import React, { useEffect, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AuthContext } from '../../../contexts/AuthContext';
import useDragDrop from '../../../hooks/useDragDrop';

const DraggableBoardList = ({ list, index, socket, boardId }) => {
  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-100 rounded-lg p-4 w-80 h-fit ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : ''
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
          >
            <h3 className="font-semibold text-gray-800">{list.title}</h3>
            <div className="text-gray-500 text-sm">
              {list.cards?.length || 0} cards
            </div>
          </div>
          
          <Droppable droppableId={`cards-${list.id}`} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[100px] ${
                  snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
                }`}
              >
                {list.cards?.map((card, cardIndex) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    listId={list.id}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

const DraggableCard = ({ card, index, listId }) => {
  return (
    <Draggable draggableId={`card-${card.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-md p-3 mb-2 shadow-sm border cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : ''
          }`}
        >
          <h4 className="font-medium text-gray-800 mb-1">{card.title}</h4>
          {card.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{card.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={`px-2 py-1 rounded-full ${
              card.priority === 'high' ? 'bg-red-100 text-red-700' :
              card.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {card.priority}
            </span>
            
            {card.dueDate && (
              <span className="text-gray-400">
                Due: {new Date(card.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.labels.map((label, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const DragDropBoard = ({ board, lists, socket }) => {
  const { user } = useContext(AuthContext);
  const {
    moveCard,
    moveList,
    isMovingCard,
    isMovingList,
    handleSocketCardMoved,
    handleSocketListMoved,
    handleDragStart,
    handleDragEnd
  } = useDragDrop(board.id, socket);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('card-moved', handleSocketCardMoved);
    socket.on('list-moved', handleSocketListMoved);
    
    socket.on('drag-start', (data) => {
      console.log(`${data.draggedBy.username} started dragging ${data.type} ${data.id}`);
      // You can add visual indicators here for what other users are dragging
    });

    socket.on('drag-end', (data) => {
      console.log(`${data.draggedBy.username} stopped dragging ${data.type} ${data.id}`);
      // Remove visual indicators
    });

    return () => {
      socket.off('card-moved', handleSocketCardMoved);
      socket.off('list-moved', handleSocketListMoved);
      socket.off('drag-start');
      socket.off('drag-end');
    };
  }, [socket, handleSocketCardMoved, handleSocketListMoved]);

  const onDragStart = (start) => {
    const { draggableId, type } = start;
    
    // Extract ID from draggableId (format: "card-123" or "list-456")
    const id = draggableId.split('-')[1];
    
    handleDragStart({
      type: type === 'card' ? 'card' : 'list',
      id: parseInt(id)
    });
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    // Handle drag end event
    const id = draggableId.split('-')[1];
    handleDragEnd({
      type: type === 'card' ? 'card' : 'list',
      id: parseInt(id)
    });

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'list') {
      // Moving a list
      const listId = parseInt(draggableId.split('-')[1]);
      moveList({
        listId,
        targetIndex: destination.index
      });
    } else {
      // Moving a card
      const cardId = parseInt(draggableId.split('-')[1]);
      const sourceListId = parseInt(source.droppableId.split('-')[1]);
      const targetListId = parseInt(destination.droppableId.split('-')[1]);

      moveCard({
        cardId,
        targetListId,
        targetIndex: destination.index,
        sourceListId
      });
    }
  };

  if (!lists || lists.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No lists yet</p>
          <p className="text-sm">Create your first list to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" direction="horizontal" type="list">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex gap-6 overflow-x-auto pb-4 ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              }`}
            >
              {lists
                .sort((a, b) => a.position - b.position)
                .map((list, index) => (
                  <DraggableBoardList
                    key={list.id}
                    list={list}
                    index={index}
                    socket={socket}
                    boardId={board.id}
                  />
                ))}
              {provided.placeholder}
              
              {/* Add new list button */}
              <div className="w-80 bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <button className="text-gray-500 hover:text-gray-700 font-medium">
                  + Add another list
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Loading indicators */}
      {(isMovingCard || isMovingList) && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Moving {isMovingCard ? 'card' : 'list'}...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropBoard;
