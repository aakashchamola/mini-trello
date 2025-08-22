import React, { useState } from 'react';
import { FiStar, FiUsers, FiMoreHorizontal, FiSearch, FiFilter } from 'react-icons/fi';
import Avatar from 'react-avatar';
import './BoardHeader.css';

const BoardHeader = ({ board, members, onToggleActivity, onSearch, onFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="board-header">
      <div className="board-info">
        <h1 className="board-title">{board.title}</h1>
        {board.description && (
          <p className="board-description">{board.description}</p>
        )}
      </div>

      <div className="board-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filters
        </button>

        <div className="board-members">
          {members.slice(0, 5).map((member, index) => (
            <Avatar
              key={member.id || index}
              name={member.username || member.email}
              src={member.avatar_url}
              size="32"
              round={true}
              className="member-avatar"
              title={member.username}
            />
          ))}
          {members.length > 5 && (
            <span className="more-members">+{members.length - 5}</span>
          )}
        </div>

        <button className="activity-btn" onClick={onToggleActivity}>
          Activity
        </button>
      </div>
    </div>
  );
};

export default BoardHeader;
