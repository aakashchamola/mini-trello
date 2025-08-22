import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiClock, FiMoreHorizontal } from 'react-icons/fi';
import Avatar from 'react-avatar';
import dayjs from 'dayjs';
import './BoardCard.css';

const BoardCard = ({ board, onStarToggle, viewMode = 'grid' }) => {
  const handleStarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onStarToggle(board.id, board.isStarred);
  };

  const formatLastActivity = (date) => {
    if (!date) return 'No recent activity';
    return `Active ${dayjs(date).fromNow()}`;
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/board/${board.id}`} className="board-card list-view">
        <div className="board-header">
          <div 
            className="board-color-indicator"
            style={{ backgroundColor: board.background_color || '#0079bf' }}
          />
          <div className="board-info">
            <h3 className="board-title">{board.title}</h3>
            {board.description && (
              <p className="board-description">{board.description}</p>
            )}
          </div>
        </div>
        
        <div className="board-meta">
          <div className="board-stats">
            {board.memberCount > 0 && (
              <span className="stat">
                <FiUsers />
                {board.memberCount}
              </span>
            )}
            
            {board.listCount > 0 && (
              <span className="stat">
                {board.listCount} lists
              </span>
            )}
            
            {board.cardCount > 0 && (
              <span className="stat">
                {board.cardCount} cards
              </span>
            )}
          </div>
          
          <div className="board-actions">
            <span className="last-activity">
              <FiClock />
              {formatLastActivity(board.lastActivity)}
            </span>
            
            <button
              className={`star-btn ${board.isStarred ? 'starred' : ''}`}
              onClick={handleStarClick}
              title={board.isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              <FiStar />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/board/${board.id}`} className="board-card grid-view">
      <div 
        className="board-background"
        style={{ backgroundColor: board.background_color || '#0079bf' }}
      >
        <div className="board-overlay">
          <div className="board-header">
            <h3 className="board-title">{board.title}</h3>
            <button
              className={`star-btn ${board.isStarred ? 'starred' : ''}`}
              onClick={handleStarClick}
              title={board.isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              <FiStar />
            </button>
          </div>
          
          {board.description && (
            <p className="board-description">{board.description}</p>
          )}
        </div>
      </div>
      
      <div className="board-footer">
        <div className="board-meta">
          <div className="board-stats">
            {board.listCount > 0 && (
              <span className="stat">{board.listCount} lists</span>
            )}
            {board.cardCount > 0 && (
              <span className="stat">{board.cardCount} cards</span>
            )}
          </div>
          
          <div className="board-members">
            {board.members && board.members.length > 0 && (
              <div className="member-avatars">
                {board.members.slice(0, 3).map((member, index) => (
                  <Avatar
                    key={member.id || index}
                    name={member.username || member.email}
                    src={member.avatar_url}
                    size="24"
                    round={true}
                    className="member-avatar"
                  />
                ))}
                {board.members.length > 3 && (
                  <span className="more-members">+{board.members.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="board-footer-info">
          <span className="last-activity">
            <FiClock />
            {formatLastActivity(board.lastActivity)}
          </span>
          
          {board.visibility && (
            <span className={`visibility-badge ${board.visibility}`}>
              {board.visibility === 'private' ? 'Private' : 
               board.visibility === 'workspace' ? 'Workspace' : 'Public'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BoardCard;
