import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-info">
          <h2>User Information</h2>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p>Profile management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
