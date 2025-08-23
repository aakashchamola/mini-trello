import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, handleAPIError } from '../services/api';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user: currentUser } = useAuth();
  
  // Debug: Log current user data
  console.log('SettingsPage - Current User:', currentUser);
  console.log('SettingsPage - Provider:', currentUser?.provider);
  console.log('SettingsPage - Has Password:', currentUser?.hasPassword);
  
  // Username change state
  const [newUsername, setNewUsername] = useState('');
  const [currentPasswordForUsername, setCurrentPasswordForUsername] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Set password state for Google users
  const [googleNewPassword, setGoogleNewPassword] = useState('');
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Username update handler
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    
    // Check if username is provided
    if (!newUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    // For Google users, require them to set a password first
    if (currentUser?.provider === 'google' && !currentUser?.hasPassword) {
      toast.error('Please set a password first before changing your username');
      return;
    }
    
    // For all users with passwords (local users and Google users who have set a password), password is required
    if ((currentUser?.provider === 'local' || (currentUser?.provider === 'google' && currentUser?.hasPassword)) && !currentPasswordForUsername.trim()) {
      toast.error('Please enter your current password');
      return;
    }
    
    setIsUpdatingUsername(true);
    try {
      const updateData = { username: newUsername };
      
      // Include password for local users and Google users who have set a password
      if (currentUser?.provider === 'local' || (currentUser?.provider === 'google' && currentUser?.hasPassword)) {
        updateData.currentPassword = currentPasswordForUsername;
      }
      
      await authAPI.updateProfile(updateData);
      toast.success('Username updated successfully!');
      setNewUsername('');
      setCurrentPasswordForUsername('');
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // Password update handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
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
      toast.error(handleAPIError(error));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Set password handler for Google users
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!googleNewPassword.trim() || !googleConfirmPassword.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (googleNewPassword !== googleConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSettingPassword(true);
    try {
      await authAPI.setPassword({
        newPassword: googleNewPassword,
        confirmPassword: googleConfirmPassword
      });
      toast.success('Password set successfully! You can now log in with email and password.');
      setGoogleNewPassword('');
      setGoogleConfirmPassword('');
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>
      
      {/* For Google users without password: Show Set Password section first */}
      {currentUser?.provider === 'google' && !currentUser?.hasPassword && (
        <div className="settings-section priority-section">
          <h3>🔐 Set Password (Required)</h3>
          <p className="warning-text">
            ⚠️ You must set a password to unlock all account features, including the ability to change your username.
          </p>
          <p className="info-text">
            Since you signed in with Google, you don't have a password for this app. 
            Setting a password will allow you to log in with your email and password, and unlock additional account management features.
          </p>
          <form onSubmit={handleSetPassword} className="settings-form">
            <label>New Password</label>
            <input
              type="password"
              value={googleNewPassword}
              onChange={e => setGoogleNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <label>Confirm New Password</label>
            <input
              type="password"
              value={googleConfirmPassword}
              onChange={e => setGoogleConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <button type="submit" disabled={isSettingPassword} className="primary-button">
              {isSettingPassword ? 'Setting Password...' : 'Set Password Now'}
            </button>
          </form>
        </div>
      )}
      
      {/* Change Username Section */}
      <div className="settings-section">
        <h3>Change Username</h3>
        {currentUser?.provider === 'google' && !currentUser?.hasPassword ? (
          <div className="disabled-section">
            <p className="warning-text">
              ⚠️ You must set a password first before you can change your username.
            </p>
            <form className="settings-form disabled-form">
              <label>New Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                disabled
                className="disabled-input"
              />
              <button type="button" disabled className="disabled-button">
                Set Password First
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleUsernameUpdate} className="settings-form">
            <label>New Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              required
            />
            {(currentUser?.provider === 'local' || (currentUser?.provider === 'google' && currentUser?.hasPassword)) && (
              <>
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPasswordForUsername}
                  onChange={e => setCurrentPasswordForUsername(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </>
            )}
            <button type="submit" disabled={isUpdatingUsername}>
              {isUpdatingUsername ? 'Updating...' : 'Update Username'}
            </button>
          </form>
        )}
      </div>
      {currentUser?.provider === 'local' && (
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
      )}
      
      {currentUser?.provider === 'google' && currentUser?.hasPassword && (
        <div className="settings-section">
          <h3>Change Password</h3>
          <p className="info-text">
            You have set a password for your account. You can change it here.
          </p>
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
      )}
    </div>
  );
};

export default SettingsPage;
