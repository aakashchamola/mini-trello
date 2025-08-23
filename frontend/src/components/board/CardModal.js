import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiEdit, FiMessageCircle } from 'react-icons/fi';
import { commentAPI, handleAPIError } from '../../services/api';
import { useUpdateCard } from '../../hooks/useCards';
import socketService from '../../services/socket';
import { toast } from 'react-toastify';
import './CardModal.css';

// Helper function to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

const CardModal = ({ card: initialCard, boardId, listId, onClose, onCardUpdated, members = [] }) => {
  const [card, setCard] = useState(initialCard); // Keep updated card state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialCard.title);
  const [description, setDescription] = useState(initialCard.description || '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const saveInProgress = useRef(false); // Prevent duplicate saves

  const updateCardMutation = useUpdateCard();

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByCard(boardId, listId, card.id);
      // Backend returns {comments: [...], cardId: ..., totalComments: ...}
      const commentsData = response.data.comments || [];
      
      const validComments = Array.isArray(commentsData) ? commentsData.filter(c => c && c.id) : [];
      setComments(validComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Don't show error to user for comments - just show empty state
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, listId, card.id]);

  // Real-time comment updates
  useEffect(() => {
    const handleCommentCreated = (data) => {
      console.log('📝 Socket event - Comment created:', data);
      if (data.comment && data.comment.card_id === card.id) {
        setComments(prev => {
          // Avoid duplicates and don't add if it's an optimistic comment that already exists
          const exists = prev.find(c => c.id === data.comment.id);
          if (exists) {
            console.log('Comment already exists, not adding duplicate');
            return prev;
          }
          
          // Also check if this might be replacing an optimistic comment
          const optimisticIndex = prev.findIndex(c => c.isOptimistic && c.content === data.comment.content);
          if (optimisticIndex !== -1) {
            console.log('Replacing optimistic comment with real comment');
            // Replace the optimistic comment with the real one
            const newComments = [...prev];
            newComments[optimisticIndex] = data.comment;
            return newComments;
          }
          
          console.log('Adding new comment from socket event');
          return [...prev, data.comment];
        });
      }
    };

    const handleCommentUpdated = (data) => {
      console.log('📝 Socket event - Comment updated:', data);
      if (data.comment && data.comment.card_id === card.id) {
        setComments(prev => prev.map(comment => 
          comment.id === data.comment.id ? data.comment : comment
        ));
      }
    };

    const handleCommentDeleted = (data) => {
      console.log('🗑️ Socket event - Comment deleted:', data);
      if (data.commentId) {
        setComments(prev => prev.filter(comment => comment.id !== data.commentId));
      }
    };

    // Set up socket listeners
    socketService.onCommentCreated(handleCommentCreated);
    socketService.onCommentUpdated(handleCommentUpdated);
    socketService.onCommentDeleted(handleCommentDeleted);

    // Cleanup function
    return () => {
      socketService.off('comment:created', handleCommentCreated);
      socketService.off('comment:updated', handleCommentUpdated);
      socketService.off('comment:deleted', handleCommentDeleted);
    };
  }, [card.id]);

  // Sync form state with card state whenever card changes
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
  }, [card]);

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

    // Prevent duplicate calls
    if (saveInProgress.current || loading) {
      console.log('Save already in progress, skipping...');
      return;
    }

    saveInProgress.current = true;
    setLoading(true);
    
    try {
      const updateData = {
        title: title.trim(),
        description: description.trim()
      };

      console.log('Updating card with data:', updateData);
      console.log('Current card being updated:', card);
      
      // Use React Query mutation
      const updatedCardData = await updateCardMutation.mutateAsync({
        boardId,
        listId,
        cardId: card.id,
        cardData: updateData
      });
      console.log('Card update response:', updatedCardData);
      
      // Update the internal card state to ensure subsequent updates work
      const newCardData = { 
        ...card, 
        ...updatedCardData,
        // Ensure we have the updated values
        title: updateData.title,
        description: updateData.description
      };
      
      console.log('Setting new card data:', newCardData);
      setCard(newCardData);
      
      setIsEditing(false);
      
      // The form state will be automatically updated by the useEffect
      
      // Update the card in the parent component's state
      if (onCardUpdated) {
        console.log('Calling onCardUpdated with cardId:', card.id, 'listId:', listId, 'updates:', updateData);
        onCardUpdated(card.id, listId, updateData);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating card:', error);
      // Error is already handled by the hook with toast
    } finally {
      setLoading(false);
      saveInProgress.current = false;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    const tempCommentId = `temp-${Date.now()}`; // Temporary ID for optimistic update
    const tempComment = {
      id: tempCommentId,
      content: newComment.trim(),
      card_id: card.id,
      author: {
        id: 'current-user', // We don't have current user context here, but this is temporary
        username: 'You',
        email: ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isOptimistic: true // Flag to identify optimistic comments
    };

    try {
      console.log('Adding comment to card:', card.id);
      
      // Optimistic update - add temporary comment immediately
      setComments(prev => [...prev, tempComment]);
      setNewComment(''); // Clear input immediately for better UX
      
      const response = await commentAPI.create(boardId, listId, card.id, {
        content: tempComment.content
      });

      console.log('Raw API response:', response.data);
      
      // Extract comment from response - backend returns {comment: {...}, message: '...'}
      const newCommentData = response.data.comment || response.data.data || response.data;
      
      console.log('Extracted comment data:', newCommentData);
      
      // Replace the optimistic comment with the real one
      if (newCommentData && newCommentData.id) {
        setComments(prev => prev.map(comment => 
          comment.id === tempCommentId ? newCommentData : comment
        ));
        toast.success('Comment added');
      } else {
        console.error('Invalid comment data received:', response.data);
        // Remove the optimistic comment if API failed
        setComments(prev => prev.filter(comment => comment.id !== tempCommentId));
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Remove the optimistic comment on error
      setComments(prev => prev.filter(comment => comment.id !== tempCommentId));
      setNewComment(tempComment.content); // Restore the comment text
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
              <div className="edit-mode">
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
                      setDescription(card.description || '');
                      setIsEditing(false);
                    }
                  }}
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn-1" 
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setTitle(card.title);
                      setDescription(card.description || '');
                      setIsEditing(false);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h2 className="card-title" onClick={() => setIsEditing(true)}>
                {title}
              </h2>
            )}
            {!isEditing && (
              <button
                className="edit-title-btn"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <FiEdit />
              </button>
            )}
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
                  comments
                    .filter(comment => comment && comment.id) // Filter out invalid comments
                    .map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">
                            {comment.author?.username || comment.authorName || 'Unknown User'}
                          </span>
                          <span className="comment-date">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="comment-content">{comment.content || ''}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          <div className="card-sidebar">
            {/* <div className="card-actions">
              <h4>Actions</h4>
              <button className="action-btn">
                <FiUser />
                Assign Member
              </button>
              <button className="action-btn">
                <FiCalendar />
                Set Due Date
              </button>
            </div> */}

            <div className="card-info">
              <h4>Card Info</h4>
              <div className="info-item">
                <span>Created:</span>
                <span>{formatDate(card.createdAt)}</span>
              </div>
              {card.due_date && (
                <div className="info-item">
                  <span>Due Date:</span>
                  <span className={`due-date ${new Date(card.due_date) < new Date() ? 'overdue' : ''}`}>
                    {formatDate(card.due_date)}
                  </span>
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
