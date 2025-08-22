import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiMoreHorizontal } from 'react-icons/fi';
import CardItem from './CardItem';
import AddCardForm from '../forms/AddCardForm';
import './BoardList.css';

const BoardList = ({ list, onCardClick, boardId }) => {
  const [showAddCard, setShowAddCard] = useState(false);

  const handleCardAdded = (newCard) => {
    // Card will be added via context/API
    setShowAddCard(false);
  };

  return (
    <div className="board-list">
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <button className="list-menu-btn">
          <FiMoreHorizontal />
        </button>
      </div>

      <Droppable droppableId={list.id} type="card">
        {(provided, snapshot) => (
          <div
            className={`list-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {list.cards?.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'dragging' : ''}
                  >
                    <CardItem
                      card={card}
                      onClick={() => onCardClick(card, list.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="list-footer">
        {showAddCard ? (
          <AddCardForm
            listId={list.id}
            boardId={boardId}
            onCardAdded={handleCardAdded}
            onCancel={() => setShowAddCard(false)}
          />
        ) : (
          <button
            className="add-card-btn"
            onClick={() => setShowAddCard(true)}
          >
            <FiPlus />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardList;
