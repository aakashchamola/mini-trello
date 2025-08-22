import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { cardAPI } from '../../services/api';
import './AddCardForm.css';

const AddCardForm = ({ listId, boardId, onCardAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

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
      setIsSubmitting(true);
      setError('');
      
      console.log('Creating card with data:', {
        title: title.trim(),
        description: '',
        position: 65536
      });
      
      const response = await cardAPI.create(boardId, listId, {
        title: title.trim(),
        description: '',
        position: 65536 // Default position
      });
      
      console.log('Card creation response:', response);
      
      const newCard = response.data?.card || response.data?.data || response.data;
      console.log('Parsed new card:', newCard);
      
      if (newCard && newCard.id) {
        onCardAdded(newCard);
        setTitle('');
      } else {
        throw new Error('Invalid card data received from server');
      }
    } catch (error) {
      console.error('Failed to create card:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create card. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Card'}
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
