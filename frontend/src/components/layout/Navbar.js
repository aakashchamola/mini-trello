import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiUser, FiLogOut, FiMenu, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Avatar from 'react-avatar';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();
  const { toggleSidebar, searchQuery, setSearchQuery } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const notificationsMenuRef = useRef(null);
  const notificationsButtonRef = useRef(null);
  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      // User menu
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
      // Notifications menu
      if (
        showNotifications &&
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(event.target) &&
        notificationsButtonRef.current &&
        !notificationsButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

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
        {/* <button className="menu-toggle" onClick={toggleSidebar}>
          <FiMenu />
        </button> */}
        
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-text">Mini Trello</span>
        </Link>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        {/* <div className="navbar-item notification-item">
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            ref={notificationsButtonRef}
          >
            <FiBell />
            <span className="notification-badge">3</span>
          </button>
          {showNotifications && (
            <div className="dropdown-menu notifications-menu" ref={notificationsMenuRef}>
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
        </div> */}

        {/* User Menu */}
        <div className="navbar-item user-item">
            {isLoading ? (
            <div className="user-loading">
              <div className="loading-avatar"></div>
              <span className="loading-text">Loading...</span>
            </div>
          ) : user ? (
            <>
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            ref={userButtonRef}
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
            <div className="dropdown-menu user-menu" ref={userMenuRef}>
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
            </>
          ) : (
            <div className="user-placeholder">
              <FiUser size="32" />
              <span>Guest</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
