import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import CardItem from './CardItem';
import AddCardForm from '../forms/AddCardForm';
import { listAPI } from '../../services/api';
import { useDeleteList, useUpdateList } from '../../hooks/useLists';
import './BoardList.css';

const BoardList = ({ 
  list, 
  onCardClick, 
  boardId, 
  onCardAdded, 
  onCardUpdated, 
  onCardDeleted, 
  onListUpdated, 
  onListDeleted 
}) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteListMutation = useDeleteList();
  const updateListMutation = useUpdateList();

  const handleCardAdded = (newCard) => {
    console.log('BoardList: handleCardAdded called with:', newCard, 'for list:', list.id);
    // Notify parent component to update the board state
    if (onCardAdded) {
      onCardAdded(newCard, list.id);
    } else {
      console.error('BoardList: onCardAdded callback not provided');
    }
    setShowAddCard(false);
  };

  const handleCardUpdated = (updatedCard) => {
    if (onCardUpdated) {
      onCardUpdated(updatedCard, list.id);
    }
  };

  const handleCardDeleted = (cardId) => {
    if (onCardDeleted) {
      onCardDeleted(cardId, list.id);
    }
  };

  const handleUpdateTitle = async () => {
    if (!editTitle.trim() || editTitle === list.title) {
      setIsEditingTitle(false);
      setEditTitle(list.title);
      return;
    }

    try {
      setIsUpdating(true);
      const updatedList = await updateListMutation.mutateAsync({
        boardId,
        listId: list.id,
        listData: { title: editTitle.trim() }
      });
      
      if (onListUpdated) {
        onListUpdated(updatedList);
      }
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update list title:', error);
      setEditTitle(list.title);
      setIsEditingTitle(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list? All cards in it will be deleted.')) {
      return;
    }

    try {
      await deleteListMutation.mutateAsync({ boardId, listId: list.id });
      if (onListDeleted) {
        onListDeleted(list.id);
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
      // Error is already handled by the hook with toast
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleUpdateTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditTitle(list.title);
    }
  };

  return (
    <div className="board-list">
      <div className="list-header">
        {isEditingTitle ? (
          <div className="list-title-edit">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleUpdateTitle}
              className="list-title-input"
              autoFocus
              disabled={isUpdating}
            />
            <div className="edit-actions">
              <button 
                onClick={handleUpdateTitle} 
                className="save-btn"
                disabled={isUpdating}
              >
                <FiCheck />
              </button>
              <button 
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditTitle(list.title);
                }} 
                className="cancel-btn"
                disabled={isUpdating}
              >
                <FiX />
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 
              className="list-title" 
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit"
            >
              {list.title}
            </h3>
            <div className="list-actions">
              <button 
                className="list-menu-btn"
                onClick={() => setShowListMenu(!showListMenu)}
              >
                <FiMoreHorizontal />
              </button>
              {showListMenu && (
                <div className="list-menu">
                  <button 
                    onClick={() => {
                      setIsEditingTitle(true);
                      setShowListMenu(false);
                    }}
                    className="menu-item"
                  >
                    <FiEdit2 />
                    Edit Title
                  </button>
                  <button 
                    onClick={() => {
                      handleDeleteList();
                      setShowListMenu(false);
                    }}
                    className="menu-item delete"
                  >
                    <FiTrash2 />
                    Delete List
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Droppable droppableId={String(list.clientId || list.id)} type="card" isDropDisabled={false}>
        {(provided, snapshot) => (
          <div
            className={`list-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {list.cards?.map((card, index) => (
              <Draggable 
                key={String(card.clientId || card.id)} 
                draggableId={String(card.clientId || card.id)} 
                index={index}
                isDragDisabled={false}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'dragging' : ''}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1
                    }}
                  >
                    <CardItem
                      card={card}
                      onClick={() => onCardClick(card, list.id)}
                      onUpdated={handleCardUpdated}
                      onDeleted={handleCardDeleted}
                      boardId={boardId}
                      listId={list.id}
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
