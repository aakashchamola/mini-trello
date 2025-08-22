import React, { useState, useEffect } from 'react';
import { FiX, FiEdit, FiCalendar, FiUser, FiMessageCircle } from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { commentAPI, handleAPIError } from '../../services/api';
import { toast } from 'react-toastify';
import './CardModal.css';

const CardModal = ({ card, boardId, listId, onClose, members = [] }) => {
  const { updateCard } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByCard(boardId, listId, card.id);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, listId, card.id]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Card title cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        title: title.trim(),
        description: description.trim()
      };

      const result = await updateCard(boardId, listId, card.id, updateData);
      
      if (result.success) {
        toast.success('Card updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await commentAPI.create(boardId, listId, card.id, {
        content: newComment.trim()
      });

      setComments(prev => [...prev, response.data.data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(handleAPIError(error));
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="card-modal">
        <div className="modal-header">
          <div className="card-title-section">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="title-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    setTitle(card.title);
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <h2 className="card-title" onClick={() => setIsEditing(true)}>
                {card.title}
              </h2>
            )}
            <button
              className="edit-title-btn"
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              <FiEdit />
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-content">
          <div className="card-details">
            <div className="description-section">
              <h3>Description</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="description-textarea"
                rows="4"
                disabled={loading}
              />
            </div>

            <div className="comments-section">
              <h3>
                <FiMessageCircle />
                Comments ({comments.length})
              </h3>
              <div className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="comment-input"
                  rows="3"
                  disabled={commentLoading}
                />
                <button 
                  className="comment-btn" 
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                >
                  {commentLoading ? 'Adding...' : 'Comment'}
                </button>
              </div>
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">No comments yet</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author?.name || 'Unknown User'}</span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card-sidebar">
            <div className="card-actions">
              <h4>Actions</h4>
              <button className="action-btn">
                <FiUser />
                Assign Member
              </button>
              <button className="action-btn">
                <FiCalendar />
                Set Due Date
              </button>
            </div>

            <div className="card-info">
              <h4>Card Info</h4>
              <div className="info-item">
                <span>Created:</span>
                <span>{new Date(card.createdAt).toLocaleDateString()}</span>
              </div>
              {card.due_date && (
                <div className="info-item">
                  <span>Due Date:</span>
                  <span className={`due-date ${new Date(card.due_date) < new Date() ? 'overdue' : ''}`}>
                    {new Date(card.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {card.position !== undefined && (
                <div className="info-item">
                  <span>Position:</span>
                  <span>{card.position + 1}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
