import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import socketService from '../../services/socket';
import './PresenceAvatars.css';

const PresenceAvatars = ({ boardId, currentUser }) => {
  const [connectedUsers, setConnectedUsers] = useState([]);

  useEffect(() => {
    // Handle initial board join - get list of connected users
    const handleBoardJoined = (data) => {
      console.log('Board joined with connected users:', data);
      if (data.connectedUsers && Array.isArray(data.connectedUsers)) {
        setConnectedUsers(data.connectedUsers.filter(user => user && user.id !== currentUser?.id));
      }
    };

    // Handle when a user joins the board
    const handleUserJoined = (data) => {
      console.log('User joined board:', data);
      if (data.user && data.user.id !== currentUser?.id) {
        setConnectedUsers(prev => {
          // Avoid duplicates
          const exists = prev.find(user => user.id === data.user.id);
          if (exists) return prev;
          return [...prev, data.user];
        });
      }
    };

    // Handle when a user leaves the board
    const handleUserLeft = (data) => {
      console.log('User left board:', data);
      if (data.user) {
        setConnectedUsers(prev => prev.filter(user => user.id !== data.user.id));
      }
    };

    // Set up socket listeners
    socketService.onBoardJoined(handleBoardJoined);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);

    // Cleanup function
    return () => {
      socketService.off('board-joined', handleBoardJoined);
      socketService.off('user-joined', handleUserJoined);
      socketService.off('user-left', handleUserLeft);
    };
  }, [boardId, currentUser?.id]);

  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || user.email || 'Unknown User';
  };

  const getAvatarColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[userId % colors.length];
  };

  if (connectedUsers.length === 0) {
    return null;
  }

  return (
    <div className="presence-avatars">
      <div className="presence-label">
        <span>Active now ({connectedUsers.length})</span>
      </div>
      <div className="avatars-container">
        {connectedUsers.slice(0, 8).map((user) => (
          <div
            key={user.id}
            className="presence-avatar"
            title={getDisplayName(user)}
            style={{
              backgroundColor: getAvatarColor(user.id)
            }}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={getDisplayName(user)}
                className="avatar-image"
              />
            ) : (
              <span className="avatar-initials">
                {getInitials(user)}
              </span>
            )}
            <div className="presence-indicator" />
          </div>
        ))}
        {connectedUsers.length > 8 && (
          <div
            className="presence-avatar overflow-indicator"
            title={`+${connectedUsers.length - 8} more users`}
          >
            <span className="overflow-count">+{connectedUsers.length - 8}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceAvatars;
