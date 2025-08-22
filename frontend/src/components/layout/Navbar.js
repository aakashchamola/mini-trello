import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiUser, FiLogOut, FiMenu, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Avatar from 'react-avatar';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleSidebar, searchQuery, setSearchQuery } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Trigger search in current board or navigate to search results
      const currentPath = location.pathname;
      if (currentPath.includes('/board/')) {
        // Search within current board
        // This will be handled by the board component
      } else {
        // Navigate to global search
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-text">Mini Trello</span>
        </Link>
      </div>

      <div className="navbar-center">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search cards, boards, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="navbar-item notification-item">
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
              <div className="dropdown-header">
                <h4>Notifications</h4>
              </div>
              <div className="dropdown-content">
                <div className="notification-item">
                  <p>You were added to "Project Alpha" board</p>
                  <span className="notification-time">2 min ago</span>
                </div>
                <div className="notification-item">
                  <p>New comment on "Design Review" card</p>
                  <span className="notification-time">1 hour ago</span>
                </div>
                <div className="notification-item">
                  <p>Due date reminder: "API Implementation"</p>
                  <span className="notification-time">3 hours ago</span>
                </div>
              </div>
              <div className="dropdown-footer">
                <Link to="/notifications">View all notifications</Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="navbar-item user-item">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <Avatar
              name={user?.username || user?.email || 'User'}
              src={user?.avatar_url}
              size="32"
              round={true}
            />
            <span className="user-name">{user?.username || 'User'}</span>
          </button>
          
          {showUserMenu && (
            <div className="dropdown-menu user-menu">
              <div className="dropdown-header">
                <div className="user-info">
                  <Avatar
                    name={user?.username || user?.email || 'User'}
                    src={user?.avatar_url}
                    size="48"
                    round={true}
                  />
                  <div className="user-details">
                    <h4>{user?.username}</h4>
                    <p>{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="dropdown-content">
                <Link to="/profile" className="dropdown-item">
                  <FiUser />
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <FiSettings />
                  <span>Settings</span>
                </Link>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
