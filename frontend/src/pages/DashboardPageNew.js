import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiStar,
  FiClock,
  FiUsers,
  FiTrello,
  FiSearch,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useUserBoards, useUserWorkspaces, useToggleStarBoard } from "../hooks";
import LoadingSpinner from "../components/common/LoadingSpinner";
import BoardCard from "../components/board/BoardCard";
import CreateBoardModal from "../components/forms/CreateBoardModal";
import "./Dashboard.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // React Query hooks
  const {
    data: boards = [],
    isLoading: boardsLoading,
    error: boardsError,
  } = useUserBoards();

  const { data: workspaces = [], isLoading: workspacesLoading } =
    useUserWorkspaces();

  const toggleStarMutation = useToggleStarBoard();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Derived data
  const recentBoards = boards.slice(0, 8);
  const starredBoards = boards.filter((board) => board.isStarred);
  const filteredBoards = getFilteredBoards();

  function getFilteredBoards() {
    let filtered = boards;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (board) =>
          board.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          board.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case "starred":
        filtered = filtered.filter((board) => board.isStarred);
        break;
      case "recent":
        filtered = filtered.slice(0, 10);
        break;
      default:
        break;
    }

    return filtered;
  }

  const handleBoardCreated = (newBoard) => {
    setShowCreateModal(false);
    navigate(`/boards/${newBoard.id}`);
  };

  const handleStarToggle = async (boardId, isStarred) => {
    try {
      await toggleStarMutation.mutateAsync({ boardId, isStarred });
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  // Loading state
  if (boardsLoading || workspacesLoading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Loading your boards...</p>
      </div>
    );
  }

  // Error state with fallback
  if (boardsError) {
    console.error("Dashboard error:", boardsError);
  }

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>
            <FiTrello className="dashboard-icon" />
            Welcome back, {user?.firstName || user?.name || "User"}!
          </h1>
          <p className="dashboard-subtitle">
            You have {boards.length} board{boards.length !== 1 ? "s" : ""}
            {workspaces.length > 0 &&
              ` across ${workspaces.length} workspace${
                workspaces.length !== 1 ? "s" : ""
              }`}
          </p>
        </div>
        <button
          className="btn btn-primary create-board-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus /> Create New Board
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Stats */}
        {!searchQuery && filterType === "all" && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <FiTrello className="stat-icon" />
              <div>
                <h3>{boards.length}</h3>
                <p>Total Boards</p>
              </div>
            </div>
            <div className="stat-card">
              <FiStar className="stat-icon" />
              <div>
                <h3>{starredBoards.length}</h3>
                <p>Starred Boards</p>
              </div>
            </div>
            <div className="stat-card">
              <FiUsers className="stat-icon" />
              <div>
                <h3>{workspaces.length}</h3>
                <p>Workspaces</p>
              </div>
            </div>
          </div>
        )}

        {/* Starred Boards Section */}
        {!searchQuery && filterType === "all" && starredBoards.length > 0 && (
          <div className="boards-section">
            <div className="section-header">
              <h2>
                <FiStar /> Starred Boards
              </h2>
            </div>
            <div className={`boards-grid ${viewMode}`}>
              {starredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onStarToggle={handleStarToggle}
                  isStarLoading={toggleStarMutation.isLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="dashboard-controls">
          <div className="search-section">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-buttons">
              <button
                className={`filter-btn1 ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All Boards
              </button>
              <button
                className={`filter-btn1 ${
                  filterType === "starred" ? "active" : ""
                }`}
                onClick={() => setFilterType("starred")}
              >
                <FiStar /> Starred
              </button>
              <button
                className={`filter-btn1 ${
                  filterType === "recent" ? "active" : ""
                }`}
                onClick={() => setFilterType("recent")}
              >
                <FiClock /> Recent
              </button>
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Boards Section */}
        {!searchQuery && filterType === "all" && (
          <div className="boards-section">
            <div className="board-heading">
              <h2>
                All Boards
              </h2>
              {boards.length > 8 && (
                <button
                  className="view-all-btn"
                  onClick={() => setFilterType("all")}
                >
                  View All
                </button>
              )}
            </div>
            <div className={`boards-grid ${viewMode}`}>
              {recentBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onStarToggle={handleStarToggle}
                  isStarLoading={toggleStarMutation.isLoading}
                />
              ))}
              {/* Create Board Card */}
              <div
                className="create-board-card"
                onClick={() => setShowCreateModal(true)}
              >
                <div className="create-board-content">
                  <FiPlus className="create-board-icon" />
                  <span>Create new board</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All/Filtered Boards */}
        {(searchQuery || filterType !== "all") && (
          <div className="boards-section">
            <div className="section-header">
              <h2>
                {searchQuery
                  ? `Search Results (${filteredBoards.length})`
                  : filterType === "starred"
                  ? "Starred Boards"
                  : filterType === "recent"
                  ? "Recent Boards"
                  : "All Boards"}
              </h2>
            </div>
            {filteredBoards.length > 0 ? (
              <div className={`boards-grid ${viewMode}`}>
                {filteredBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onStarToggle={handleStarToggle}
                    isStarLoading={toggleStarMutation.isLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiTrello className="empty-icon" />
                <h3>No boards found</h3>
                <p>
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first board to get started!"}
                </p>
                {!searchQuery && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FiPlus /> Create Board
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State for new users */}
        {boards.length === 0 && !boardsLoading && (
          <div className="empty-state-main">
            <FiTrello className="empty-icon-large" />
            <h2>Welcome to Mini Trello!</h2>
            <p>Create your first board to start organizing your work</p>
            <button
              className="btn btn-primary btn-large"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus /> Create Your First Board
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onBoardCreated={handleBoardCreated}
          workspaces={workspaces}
        />
      )}
    </div>
  );
};

export default DashboardPage;
