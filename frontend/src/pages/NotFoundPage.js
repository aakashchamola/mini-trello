import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <div className="error-code">404</div>
          <div className="error-message">Page Not Found</div>
        </div>
        
        <div className="not-found-text">
          <h1>Oops! This page doesn't exist</h1>
          <p>
            The page you're looking for might have been moved, deleted, 
            or you might have entered the wrong URL.
          </p>
        </div>
        
        <div className="not-found-actions">
          <Link to="/dashboard" className="primary-btn">
            <FiHome />
            Go to Dashboard
          </Link>
          
          <button onClick={() => window.history.back()} className="secondary-btn">
            <FiArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
