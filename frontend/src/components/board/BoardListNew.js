import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiCheck, FiX, FiMove } from 'react-icons/fi';
import CardItem from './CardItem';
import AddCardForm from '../forms/AddCardForm';
import { useUpdateList, useDeleteList } from '../../hooks';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import './BoardList.css';
import './BoardEnhancements.css';

const BoardListNew = ({ 
  list, 
  onCardClick, 
  boardId, 
  onCardAdded, 
  onCardUpdated, 
  onCardDeleted, 
  onListUpdated, 
  onListDeleted,
  isLoading = false,
  isDragging = false,
  dragHandleProps = null
}) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const listMenuRef = useRef(null);
  const listMenuBtnRef = useRef(null);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showListMenu &&
        listMenuRef.current &&
        !listMenuRef.current.contains(event.target) &&
        listMenuBtnRef.current &&
        !listMenuBtnRef.current.contains(event.target)
      ) {
        setShowListMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListMenu]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const updateInProgress = useRef(false); // Prevent duplicate updates

  // React Query mutations
  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();

  const handleCardAdded = (newCard) => {
    console.log('BoardList: handleCardAdded called with:', newCard, 'for list:', list.id);
    if (onCardAdded) {
      onCardAdded(newCard, list.id);
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

    // Prevent duplicate calls
    if (updateInProgress.current || updateListMutation.isLoading) {
      console.log('List update already in progress, skipping...');
      return;
    }

    updateInProgress.current = true;

    try {
      await updateListMutation.mutateAsync({
        boardId,
        listId: list.id,
        updates: { title: editTitle.trim() }
      });
      setIsEditingTitle(false);
      
      // Notify parent if needed
      if (onListUpdated) {
        onListUpdated(list.id, { title: editTitle.trim() });
      }
    } catch (error) {
      console.error('Failed to update list title:', error);
      setEditTitle(list.title);
      setIsEditingTitle(false);
    } finally {
      updateInProgress.current = false;
    }
  };

  // Debounced update to prevent duplicate API calls
  const debouncedUpdateTitle = useDebouncedCallback(handleUpdateTitle, 300);

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list? All cards in it will be deleted.')) {
      return;
    }

    try {
      await deleteListMutation.mutateAsync({ boardId, listId: list.id });
      
      // Notify parent if needed
      if (onListDeleted) {
        onListDeleted(list.id);
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
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

  const isUpdating = updateListMutation.isLoading || deleteListMutation.isLoading;

  return (
    <div className={`board-list ${isLoading ? 'loading' : ''} ${isDragging ? 'dragging' : ''}`}>
      <div className="list-header">
        {dragHandleProps && (
          <div className="list-drag-handle" {...dragHandleProps}>
            <FiMove />
          </div>
        )}
        <div className="list-header-content">
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
                {list.cards && (
                  <span className="card-count">{list.cards.length}</span>
                )}
              </h3>
              <div className="list-actions">
                <button 
                  className="list-menu-btn"
                  onClick={() => setShowListMenu(!showListMenu)}
                  disabled={isUpdating}
                  ref={listMenuBtnRef}
                >
                  <FiMoreHorizontal />
                </button>
                {showListMenu && (
                  <div className="list-menu" ref={listMenuRef}>
                    <button 
                      onClick={() => {
                        setIsEditingTitle(true);
                        setShowListMenu(false);
                      }}
                      className="menu-item"
                      disabled={isUpdating}
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
                      disabled={isUpdating}
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
      </div>

      <Droppable droppableId={String(list.id)} type="card" isDropDisabled={isLoading}>
        {(provided, snapshot) => (
          <div
            className={`list-cards ${snapshot.isDraggingOver ? 'dragging-over' : ''} ${isLoading ? 'loading' : ''}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {list.cards?.map((card, index) => (
              <Draggable 
                key={String(card.id)} 
                draggableId={`card-${String(card.id)}`} 
                index={index}
                isDragDisabled={isLoading}
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
                    onClick={(e) => e.stopPropagation()} // Prevent event bubbling to list
                  >
                    <CardItem
                      card={card}
                      onClick={() => onCardClick(card, list.id)}
                      onUpdated={handleCardUpdated}
                      onDeleted={handleCardDeleted}
                      boardId={boardId}
                      listId={list.id}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {/* Loading indicator for cards */}
            {isLoading && (
              <div className="list-loading">
                <div className="loading-placeholder">Loading cards...</div>
              </div>
            )}
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
            isLoading={isLoading}
          />
        ) : (
          <button
            className="add-card-btn"
            onClick={() => setShowAddCard(true)}
            disabled={isLoading || isUpdating}
          >
            <FiPlus />
            Add a card
          </button>
        )}
      </div>

      {/* Mutation loading overlay */}
      {isUpdating && (
        <div className="list-updating-overlay">
          <div className="updating-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default BoardListNew;
