import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI,} from '../services/api';
import './SettingsPage.css';

const SettingsPage = ({ currentUser }) => {
  // Username change state
  const [newUsername, setNewUsername] = useState('');
  const [currentPasswordForUsername, setCurrentPasswordForUsername] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Username update handler
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !currentPasswordForUsername.trim()) {
      toast.error('Please enter all fields');
      return;
    }
    setIsUpdatingUsername(true);
    try {
      await authAPI.updateProfile({
        username: newUsername,
        currentPassword: currentPasswordForUsername
      });
      toast.success('Username updated successfully!');
      setNewUsername('');
      setCurrentPasswordForUsername('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update username');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // Password update handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Please enter all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await authAPI.changePassword({
        oldPassword,
        newPassword
      });
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>
      <div className="settings-section">
        <h3>Change Username</h3>
        <form onSubmit={handleUsernameUpdate} className="settings-form">
          <label>New Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="Enter new username"
            required
          />
          <label>Current Password</label>
          <input
            type="password"
            value={currentPasswordForUsername}
            onChange={e => setCurrentPasswordForUsername(e.target.value)}
            placeholder="Enter current password"
            required
          />
          <button type="submit" disabled={isUpdatingUsername}>
            {isUpdatingUsername ? 'Updating...' : 'Update Username'}
          </button>
        </form>
      </div>
      <div className="settings-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="settings-form">
          <label>Current Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <button type="submit" disabled={isUpdatingPassword}>
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
