import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { listAPI } from '../../services/api';
import './AddListForm.css';

const AddListForm = ({ boardId, onListAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await listAPI.create(boardId, {
        title: title.trim()
      });
      
      const newList = response.data?.list || response.data?.data || response.data;
      onListAdded(newList);
      setTitle('');
    } catch (error) {
      console.error('Failed to create list:', error);
      alert('Failed to create list. Please try again.');
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
    <div className="add-list-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter list title..."
          className="list-title-input"
          autoFocus
          maxLength={100}
        />
        <div className="form-actions">
          <button
            type="submit"
            className="add-btn"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add List'}
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

export default AddListForm;
