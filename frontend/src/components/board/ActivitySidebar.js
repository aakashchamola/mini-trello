import React, { useState, useMemo } from 'react';
import { 
  FiActivity, 
  FiX, 
  FiFilter, 
  FiClock, 
  FiUser, 
  FiMessageCircle, 
  FiMove, 
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiLogOut,
  FiFolder
} from 'react-icons/fi';
import Avatar from 'react-avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './ActivitySidebar.css';

dayjs.extend(relativeTime);

const ActivitySidebar = ({ 
  activities = [], 
  isLoading = false, 
  onClose,
  boardMembers = []
}) => {
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: FiActivity },
    { value: 'created', label: 'Created', icon: FiPlus },
    { value: 'updated', label: 'Updated', icon: FiEdit },
    { value: 'moved', label: 'Moved', icon: FiMove },
    { value: 'commented', label: 'Comments', icon: FiMessageCircle },
    { value: 'deleted', label: 'Deleted', icon: FiTrash2 },
    { value: 'member', label: 'Members', icon: FiUser }
  ];

  // Get action icon based on activity type
  const getActionIcon = (action, entityType) => {
    const iconMap = {
      created: FiPlus,
      updated: FiEdit,
      moved: FiMove,
      deleted: FiTrash2,
      commented: FiMessageCircle,
      assigned: FiUser,
      invited: FiUserPlus,
      joined: FiUserPlus,
      left: FiLogOut,
      archived: FiFolder
    };
    
    return iconMap[action] || FiActivity;
  };

  // Get action color based on activity type
  const getActionColor = (action) => {
    const colorMap = {
      created: '#10b981', // green
      updated: '#3b82f6', // blue
      moved: '#8b5cf6', // purple
      deleted: '#ef4444', // red
      commented: '#f59e0b', // amber
      assigned: '#06b6d4', // cyan
      invited: '#84cc16', // lime
      joined: '#84cc16', // lime
      left: '#6b7280', // gray
      archived: '#9ca3af' // gray
    };
    
    return colorMap[action] || '#6b7280';
  };

  // Format activity description with better context
  const formatActivityDescription = (activity) => {
    const { action, entityType, details, oldValue, newValue } = activity;
    const entityName = newValue?.title || oldValue?.title || 'item';
    
    switch (action) {
      case 'created':
        return `created ${entityType} "${entityName}"`;
      
      case 'updated':
        if (entityType === 'card' && oldValue?.title !== newValue?.title) {
          return `renamed "${oldValue?.title}" to "${newValue?.title}"`;
        }
        return `updated ${entityType} "${entityName}"`;
      
      case 'moved':
        if (entityType === 'card' && oldValue?.listName && newValue?.listName) {
          return `moved "${entityName}" from "${oldValue.listName}" to "${newValue.listName}"`;
        }
        return `moved ${entityType} "${entityName}"`;
      
      case 'deleted':
        return `deleted ${entityType} "${entityName}"`;
      
      case 'commented':
        return `commented on "${entityName}"`;
      
      case 'assigned':
        return `assigned to "${entityName}"`;
      
      case 'invited':
        return `invited to board`;
      
      case 'joined':
        return `joined the board`;
      
      case 'left':
        return `left the board`;
      
      default:
        return details || `${action} ${entityType}`;
    }
  };

  // Filter activities based on selected filter
  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    
    return activities.filter(activity => {
      if (filterType === 'member') {
        return ['invited', 'joined', 'left', 'assigned'].includes(activity.action);
      }
      return activity.action === filterType;
    });
  }, [activities, filterType]);

  // Format time with better readability
  const formatTime = (timestamp) => {
    const date = dayjs(timestamp);
    const now = dayjs();
    
    if (date.isSame(now, 'day')) {
      return date.format('h:mm A');
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return 'Yesterday ' + date.format('h:mm A');
    } else if (date.isAfter(now.subtract(7, 'day'))) {
      return date.format('ddd h:mm A');
    } else {
      return date.format('MMM D, h:mm A');
    }
  };

  return (
    <div className="activity-sidebar">
      {/* Header */}
      <div className="activity-header">
        <div className="activity-title">
          <FiActivity className="activity-title-icon" />
          <h3>Activity</h3>
          <span className="activity-count">({filteredActivities.length})</span>
        </div>
        <div className="activity-controls">
          {/* <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filter activities"
          >
            <FiFilter />
          </button> */}
          <button
            className="close-activity"
            onClick={onClose}
            title="Close activity sidebar"
          >
            <FiX />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="activity-filters">
          <div className="filter-options">
            {filterOptions.map(option => {
              const Icon = option.icon;
              const count = option.value === 'all' 
                ? activities.length 
                : option.value === 'member'
                  ? activities.filter(a => ['invited', 'joined', 'left', 'assigned'].includes(a.action)).length
                  : activities.filter(a => a.action === option.value).length;
              
              return (
                <button
                  key={option.value}
                  className={`filter-option ${filterType === option.value ? 'active' : ''}`}
                  onClick={() => setFilterType(option.value)}
                >
                  <Icon className="filter-icon" />
                  <span>{option.label}</span>
                  <span className="filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="activity-list">
        {isLoading ? (
          <div className="activity-loading">
            <div className="loading-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-item">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="activity-items">
            {filteredActivities.map((activity, index) => {
              const ActionIcon = getActionIcon(activity.action, activity.entityType);
              const actionColor = getActionColor(activity.action);
              
              return (
                <div key={activity.id || index} className="activity-item">
                  <div className="activity-meta">
                    <div className="activity-avatar">
                      <Avatar
                        name={activity.user?.username || activity.user?.first_name || 'User'}
                        src={activity.user?.avatar_url}
                        size="32"
                        round={true}
                      />
                      <div 
                        className="action-badge"
                        style={{ backgroundColor: actionColor }}
                      >
                        <ActionIcon size={10} />
                      </div>
                    </div>
                    <div className="activity-time">
                      <FiClock size={12} />
                      <span>{formatTime(activity.createdAt || activity.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-description">
                      <span className="activity-user">
                        {activity.user?.first_name 
                          ? `${activity.user.first_name} ${activity.user.last_name || ''}`.trim()
                          : activity.user?.username || 'Unknown User'
                        }
                      </span>
                      <span className="activity-action">
                        {formatActivityDescription(activity)}
                      </span>
                    </div>
                    
                    {/* Additional context for certain actions */}
                    {activity.action === 'commented' && activity.newValue?.text && (
                      <div className="activity-comment-preview">
                        "{activity.newValue.text.substring(0, 100)}{activity.newValue.text.length > 100 ? '...' : ''}"
                      </div>
                    )}
                    
                    {activity.action === 'moved' && activity.oldValue?.listName && activity.newValue?.listName && (
                      <div className="activity-move-detail">
                        <span className="move-from">{activity.oldValue.listName}</span>
                        <span className="move-arrow">→</span>
                        <span className="move-to">{activity.newValue.listName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-activities">
            <div className="no-activities-icon">
              <FiActivity size={48} />
            </div>
            <h4>No activity yet</h4>
            <p>
              {filterType === 'all' 
                ? "Activity will appear here as you work on this board" 
                : `No ${filterOptions.find(f => f.value === filterType)?.label.toLowerCase()} activities found`
              }
            </p>
            {filterType !== 'all' && (
              <button 
                className="clear-filter-btn"
                onClick={() => setFilterType('all')}
              >
                Show all activity
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySidebar;
