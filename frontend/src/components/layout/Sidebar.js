import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiTrello, 
  FiUsers, 
  FiPlus, 
  FiStar, 
  FiClock,
  FiSettings,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { boardAPI, workspaceAPI } from '../../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const { isSidebarOpen } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const [boards, setBoards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [starredBoards, setStarredBoards] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    boards: true,
    workspaces: true,
    starred: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      setLoading(true);
      const [boardsRes, workspacesRes] = await Promise.all([
        boardAPI.getUserBoards(),
        workspaceAPI.getUserWorkspaces()
      ]);

      setBoards(boardsRes.data.boards || []);
      setWorkspaces(workspacesRes.data.workspaces || []);
      
      // Filter starred boards
      const starred = (boardsRes.data.boards || []).filter(board => board.isStarred);
      setStarredBoards(starred);
    } catch (error) {
      console.error('Failed to fetch sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Main Navigation */}
        <div className="nav-section">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <FiHome />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/my-tasks" 
            className={`nav-item ${isActive('/my-tasks') ? 'active' : ''}`}
          >
            <FiClock />
            <span>My Tasks</span>
          </Link>
        </div>

        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <div className="nav-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('starred')}
            >
              {expandedSections.starred ? <FiChevronDown /> : <FiChevronRight />}
              <FiStar />
              <span>Starred Boards</span>
            </div>
            
            {expandedSections.starred && (
              <div className="section-content">
                {starredBoards.map(board => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className={`nav-item board-item ${isActive(`/board/${board.id}`) ? 'active' : ''}`}
                  >
                    <div 
                      className="board-color" 
                      style={{ backgroundColor: board.background_color || '#0079bf' }}
                    />
                    <span className="board-title">{board.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Boards */}
        <div className="nav-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('boards')}
          >
            {expandedSections.boards ? <FiChevronDown /> : <FiChevronRight />}
            <FiTrello />
            <span>Recent Boards</span>
            <Link to="/boards/new" className="add-button" title="Create new board">
              <FiPlus />
            </Link>
          </div>
          
          {expandedSections.boards && (
            <div className="section-content">
              {loading ? (
                <div className="loading-item">Loading boards...</div>
              ) : boards.length > 0 ? (
                boards.slice(0, 10).map(board => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className={`nav-item board-item ${isActive(`/board/${board.id}`) ? 'active' : ''}`}
                  >
                    <div 
                      className="board-color" 
                      style={{ backgroundColor: board.background_color || '#0079bf' }}
                    />
                    <span className="board-title">{board.title}</span>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <p>No boards yet</p>
                  <Link to="/boards/new" className="create-board-link">
                    Create your first board
                  </Link>
                </div>
              )}
              
              {boards.length > 10 && (
                <Link to="/boards" className="nav-item view-all">
                  View all boards ({boards.length})
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Workspaces */}
        <div className="nav-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('workspaces')}
          >
            {expandedSections.workspaces ? <FiChevronDown /> : <FiChevronRight />}
            <FiUsers />
            <span>Workspaces</span>
            <Link to="/workspaces/new" className="add-button" title="Create new workspace">
              <FiPlus />
            </Link>
          </div>
          
          {expandedSections.workspaces && (
            <div className="section-content">
              {loading ? (
                <div className="loading-item">Loading workspaces...</div>
              ) : workspaces.length > 0 ? (
                workspaces.map(workspace => (
                  <div key={workspace.id} className="workspace-item">
                    <Link
                      to={`/workspace/${workspace.id}`}
                      className={`nav-item ${isActive(`/workspace/${workspace.id}`) ? 'active' : ''}`}
                    >
                      <div className="workspace-avatar">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="workspace-name">{workspace.name}</span>
                    </Link>
                    
                    {workspace.boards && workspace.boards.length > 0 && (
                      <div className="workspace-boards">
                        {workspace.boards.slice(0, 5).map(board => (
                          <Link
                            key={board.id}
                            to={`/board/${board.id}`}
                            className={`workspace-board ${isActive(`/board/${board.id}`) ? 'active' : ''}`}
                          >
                            <div 
                              className="board-color-mini" 
                              style={{ backgroundColor: board.background_color || '#0079bf' }}
                            />
                            <span>{board.title}</span>
                          </Link>
                        ))}
                        {workspace.boards.length > 5 && (
                          <Link 
                            to={`/workspace/${workspace.id}`} 
                            className="view-more"
                          >
                            +{workspace.boards.length - 5} more
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No workspaces yet</p>
                  <Link to="/workspaces/new" className="create-workspace-link">
                    Create a workspace
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="nav-section">
          <Link 
            to="/settings" 
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          >
            <FiSettings />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
