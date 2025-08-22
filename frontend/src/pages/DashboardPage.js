import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiStar, 
  FiClock, 
  FiUsers, 
  FiTrello,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { boardAPI, workspaceAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BoardCard from '../components/board/BoardCard';
import CreateBoardModal from '../components/forms/CreateBoardModal';
import './Dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setLoading } = useApp();
  
  const [boards, setBoards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [recentBoards, setRecentBoards] = useState([]);
  const [starredBoards, setStarredBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // First try to fetch boards and workspaces
      try {
        const [boardsRes, workspacesRes] = await Promise.all([
          boardAPI.getUserBoards(),
          workspaceAPI.getUserWorkspaces()
        ]);

        const allBoards = boardsRes.data?.boards || boardsRes.data?.data || [];
        setBoards(allBoards);
        setWorkspaces(workspacesRes.data?.workspaces || workspacesRes.data?.data || []);
        
        // Separate boards by type
        setRecentBoards(allBoards.slice(0, 8)); // Show 8 most recent
        setStarredBoards(allBoards.filter(board => board.isStarred));
      } catch (apiError) {
        console.error('API Error:', apiError);
        // If API fails, show demo data for UI testing
        const demoBoards = [
          {
            id: 1,
            title: 'Sample Project Board',
            description: 'A demo board for testing',
            color: '#0079bf',
            isStarred: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Marketing Campaign',
            description: 'Track marketing tasks',
            color: '#d29034',
            isStarred: false,
            createdAt: new Date().toISOString()
          }
        ];
        setBoards(demoBoards);
        setRecentBoards(demoBoards);
        setStarredBoards(demoBoards.filter(board => board.isStarred));
        setWorkspaces([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoardCreated = (newBoard) => {
    setBoards(prev => [newBoard, ...prev]);
    setRecentBoards(prev => [newBoard, ...prev.slice(0, 7)]);
    setShowCreateModal(false);
    navigate(`/board/${newBoard.id}`);
  };

  const handleStarToggle = async (boardId, isStarred) => {
    try {
      await boardAPI.toggleStar(boardId);
      
      // Update local state
      setBoards(prev => prev.map(board => 
        board.id === boardId ? { ...board, isStarred: !isStarred } : board
      ));
      
      if (isStarred) {
        setStarredBoards(prev => prev.filter(board => board.id !== boardId));
      } else {
        const boardToStar = boards.find(board => board.id === boardId);
        if (boardToStar) {
          setStarredBoards(prev => [...prev, { ...boardToStar, isStarred: true }]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const filteredBoards = () => {
    let result = boards;
    
    // Apply filter type
    switch (filterType) {
      case 'starred':
        result = starredBoards;
        break;
      case 'recent':
        result = recentBoards;
        break;
      default:
        result = boards;
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  };

  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.username}!</h1>
          <p>Here's what's happening with your boards and workspaces</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="create-board-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            Create Board
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrello />
          </div>
          <div className="stat-content">
            <h3>{boards.length}</h3>
            <p>Total Boards</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{workspaces.length}</h3>
            <p>Workspaces</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiStar />
          </div>
          <div className="stat-content">
            <h3>{starredBoards.length}</h3>
            <p>Starred Boards</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>12</h3>
            <p>Tasks Due</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <FiTrello />
            </div>
            <div className="activity-content">
              <p><strong>You</strong> created a new board "Project Alpha"</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <FiUsers />
            </div>
            <div className="activity-content">
              <p><strong>John Doe</strong> added you to "Marketing Campaign"</p>
              <span className="activity-time">4 hours ago</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <FiClock />
            </div>
            <div className="activity-content">
              <p>Card "API Documentation" is due tomorrow</p>
              <span className="activity-time">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boards Section */}
      <div className="boards-section">
        <div className="section-header">
          <h2>Your Boards</h2>
          
          <div className="section-controls">
            {/* Search */}
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* Filter */}
            <div className="filter-container">
              <FiFilter className="filter-icon" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Boards</option>
                <option value="starred">Starred</option>
                <option value="recent">Recent</option>
              </select>
            </div>
            
            {/* View Mode */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Boards Grid/List */}
        <div className={`boards-container ${viewMode}`}>
          {filteredBoards().length > 0 ? (
            filteredBoards().map(board => (
              <BoardCard
                key={board.id}
                board={board}
                onStarToggle={handleStarToggle}
                viewMode={viewMode}
              />
            ))
          ) : (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <h3>No boards found</h3>
                  <p>Try adjusting your search or filters</p>
                </>
              ) : (
                <>
                  <h3>No boards yet</h3>
                  <p>Create your first board to get started organizing your work</p>
                  <button 
                    className="create-board-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FiPlus />
                    Create Your First Board
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Workspaces Section */}
      {workspaces.length > 0 && (
        <div className="workspaces-section">
          <div className="section-header">
            <h2>Your Workspaces</h2>
            <Link to="/workspaces/new" className="create-workspace-btn">
              <FiPlus />
              Create Workspace
            </Link>
          </div>
          
          <div className="workspaces-grid">
            {workspaces.map(workspace => (
              <div key={workspace.id} className="workspace-card">
                <div className="workspace-header">
                  <div className="workspace-avatar">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="workspace-info">
                    <h3>{workspace.name}</h3>
                    <p>{workspace.description}</p>
                  </div>
                </div>
                
                <div className="workspace-stats">
                  <span>{workspace.boardCount || 0} boards</span>
                  <span>{workspace.memberCount || 0} members</span>
                </div>
                
                <Link to={`/workspace/${workspace.id}`} className="workspace-link">
                  View Workspace
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

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
