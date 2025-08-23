import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiTrash2, FiUser, FiEye, FiEdit } from 'react-icons/fi';
import { boardAPI, handleAPIError } from '../../services/api';
import { toast } from 'react-toastify';
import './BoardMemberManager.css';

const BoardMemberManager = ({ boardId, members = [], onMembersUpdate, currentUser, boardOwner }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [identifier, setIdentifier] = useState(''); // email or username
  const [role, setRole] = useState('editor');
  const [isAdding, setIsAdding] = useState(false);

  // Check if current user can manage members (owner or admin)
  const currentUserMember = members.find(m => m.userId === currentUser?.id || m.user?.id === currentUser?.id);
  const isOwner = boardOwner?.id === currentUser?.id || boardOwner === currentUser?.id;
  const isAdmin = currentUserMember?.role === 'admin';
  const canManageMembers = isOwner || isAdmin;

  // Handle ESC key to close add member form
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAddForm) {
        setShowAddForm(false);
        setIdentifier('');
        setRole('editor');
      }
    };

    if (showAddForm) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAddForm]);

  const handleAddMember = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter an email or username');
      return;
    }

    setIsAdding(true);
    try {
      // Use the existing invite endpoint but with direct addition
      await boardAPI.invite(boardId, {
        email: identifier.includes('@') ? identifier : undefined,
        username: !identifier.includes('@') ? identifier : undefined,
        role: role,
        directAdd: true // Skip invitation process and add directly
      });

      toast.success('Member added successfully!');
      setIdentifier('');
      setRole('editor');
      setShowAddForm(false);

      // Refresh members list
      if (onMembersUpdate) {
        onMembersUpdate();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      const message = error.response?.data?.message || 'Failed to add member';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this board?`)) {
      return;
    }

    try {
      await boardAPI.removeMember(boardId, memberId);
      toast.success('Member removed successfully!');
      
      if (onMembersUpdate) {
        onMembersUpdate();
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(handleAPIError(error));
    }
  };

  const handleRoleChange = async (memberId, newRole, memberName) => {
    try {
      if (newRole === "viewer") {
        toast.error("Viewers cannot make changes to the board.");
        return;
      }
      await boardAPI.updateMemberRole(boardId, memberId, { role: newRole });
      toast.success(`${memberName}'s role updated to ${newRole}`);
      
      if (onMembersUpdate) {
        onMembersUpdate();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(handleAPIError(error));
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiUser className="role-icon admin" />;
      case 'editor':
        return <FiEdit className="role-icon editor" />;
      case 'viewer':
        return <FiEye className="role-icon viewer" />;
      default:
        return <FiUser className="role-icon" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#e74c3c';
      case 'editor':
        return '#3498db';
      case 'viewer':
        return '#95a5a6';
      default:
        return '#3498db';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format members data consistently
  const formattedMembers = members.map(member => ({
    id: member.id,
    userId: member.userId || member.user?.id,
    user: {
      id: member.user?.id || member.userId,
      name: member.user?.name || member.user?.username || member.name || member.username || 'Unknown User',
      email: member.user?.email || member.email,
      avatar_url: member.user?.avatar_url || member.user?.avatar || member.avatar_url
    },
    role: member.role || 'viewer'
  }));

  return (
    <div className="board-member-manager">
      <div className="members-header">
        <h3>
          <FiUsers />
          Board Members ({formattedMembers.length})
        </h3>
        {canManageMembers && (
          <button
            className="add-member-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            title="Add member"
          >
            <FiPlus />
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-member-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Enter email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="identifier-input"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-select"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-actions">
            <button
              onClick={handleAddMember}
              disabled={isAdding || !identifier.trim()}
              className="btn btn-primary"
            >
              {isAdding ? 'Adding...' : 'Add Member'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setIdentifier('');
                setRole('editor');
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="members-list">
        {formattedMembers.map(member => (
          <div key={member.id} className="member-item">
            <div className="member-avatar">
              {member.user.avatar_url ? (
                <img 
                  src={member.user.avatar_url} 
                  alt={member.user.name}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-initials">
                  {getInitials(member.user.name)}
                </div>
              )}
            </div>
            
            <div className="member-info">
              <div className="member-name">{member.user.name}</div>
              <div className="member-email">{member.user.email}</div>
            </div>

            <div className="member-role">
              {canManageMembers && member.userId !== currentUser?.id && !member.isOwner ? (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value, member.user.name)}
                  className="role-select-inline"
                  style={{ color: getRoleColor(member.role) }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span 
                  className="role-badge"
                  style={{ backgroundColor: getRoleColor(member.role) }}
                >
                  {getRoleIcon(member.role)}
                  {member.role}
                  {member.isOwner && ' (Owner)'}
                </span>
              )}
            </div>

            {canManageMembers && member.userId !== currentUser?.id && !member.isOwner && (
              <button
                onClick={() => handleRemoveMember(member.id, member.user.name)}
                className="remove-member-btn"
                title="Remove member"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="role-descriptions">
        <h4>Role Permissions</h4>
        <div className="role-list">
          <div className="role-item">
            <span className="role-badge" style={{ backgroundColor: '#e74c3c' }}>
              <FiUser className="role-icon" />
              Admin
            </span>
            <span>Can manage board, add/remove members, and edit everything</span>
          </div>
          <div className="role-item">
            <span className="role-badge" style={{ backgroundColor: '#3498db' }}>
              <FiEdit className="role-icon" />
              Editor
            </span>
            <span>Can create, edit, and manage lists and cards</span>
          </div>
          <div className="role-item">
            <span className="role-badge" style={{ backgroundColor: '#95a5a6' }}>
              <FiEye className="role-icon" />
              Viewer
            </span>
            <span>Can view the board and add comments only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardMemberManager;
