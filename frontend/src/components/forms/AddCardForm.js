import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useCreateCard } from '../../hooks/useCards';
import './AddCardForm.css';

const AddCardForm = ({ listId, boardId, onCardAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  
  const createCardMutation = useCreateCard();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Card title is required');
      return;
    }

    try {
      setError('');
      
      console.log('Creating card with React Query mutation:', {
        title: title.trim(),
        description: '',
        position: 65536
      });
      
      const newCard = await createCardMutation.mutateAsync({
        boardId,
        listId,
        cardData: {
          title: title.trim(),
          description: '',
          position: 65536
        }
      });
      
      console.log('Card created successfully:', newCard);
      
      if (newCard && newCard.id) {
        // The React Query mutation already handles cache updates
        // Just notify parent component if needed
        if (onCardAdded) {
          onCardAdded(newCard);
        }
        setTitle('');
      } else {
        throw new Error('Invalid card data received from server');
      }
    } catch (error) {
      console.error('Failed to create card:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create card. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="add-card-form">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this card..."
          className="card-title-input"
          rows="3"
          maxLength={500}
        />
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions">
          <button
            type="submit"
            className="add-btn"
            disabled={!title.trim() || createCardMutation.isPending}
          >
            {createCardMutation.isPending ? 'Adding...' : 'Add Card'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
          >
            <FiX />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;
