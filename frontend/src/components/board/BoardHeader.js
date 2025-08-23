import React, { useState } from "react";
import { FiSearch, FiUsers, FiActivity } from "react-icons/fi";
import "./BoardHeader.css";

const BoardHeader = ({
  board,
  members,
  onToggleActivity,
  onSearch,
  onFilter,
  onOpenMemberModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

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
{/* 
        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filters
        </button> */}

        <button
          className="members-btn"
          onClick={onOpenMemberModal}
          title="Manage members"
        >
          <FiUsers />
          Members ({members?.length || 0})
        </button>

        <button 
          className="activity-btn" 
          onClick={onToggleActivity}
          title="Toggle activity sidebar"
        >
          <FiActivity />
          Activity
        </button>
      </div>
    </div>
  );
};

export default BoardHeader;
