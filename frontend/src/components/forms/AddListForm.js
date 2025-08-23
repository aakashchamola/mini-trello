import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCreateList } from '../../hooks/useLists';
import './AddListForm.css';

const AddListForm = ({ boardId, onListAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  
  const createListMutation = useCreateList();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newList = await createListMutation.mutateAsync({
        boardId,
        listData: {
          title: title.trim()
        }
      });
      
      console.log('List created successfully:', newList);
      
      // The React Query mutation already handles cache updates
      // Just notify parent component if needed
      if (onListAdded) {
        onListAdded(newList);
      }
      setTitle('');
    } catch (error) {
      console.error('Failed to create list:', error);
      toast.error('Unable to create list. Please try again.');
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
            disabled={!title.trim() || createListMutation.isPending}
          >
            {createListMutation.isPending ? 'Adding...' : 'Add List'}
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
