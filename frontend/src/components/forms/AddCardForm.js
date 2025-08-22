import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { cardAPI } from '../../services/api';
import './AddCardForm.css';

const AddCardForm = ({ listId, boardId, onCardAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await cardAPI.createCard(boardId, listId, {
        title: title.trim()
      });
      onCardAdded(response.data.card);
      setTitle('');
    } catch (error) {
      console.error('Failed to create card:', error);
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this card..."
          className="card-title-input"
          autoFocus
          rows="2"
          maxLength={500}
        />
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
