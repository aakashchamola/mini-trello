import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './GoogleSignIn.css';

const GoogleSignIn = ({ mode = 'signin', onSuccess, onError }) => {
  const googleButtonRef = useRef(null);
  const { loginWithGoogle } = useAuth();

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      console.log('Google response received:', response);
      
      // Always use loginWithGoogle since it now handles both login and signup
      await loginWithGoogle(response.credential);
      
      if (onSuccess) onSuccess(response);
    } catch (error) {
      console.error('Google authentication error:', error);
      if (onError) onError(error);
    }
  }, [loginWithGoogle, onSuccess, onError]);

  useEffect(() => {
    const loadGoogleSignIn = () => {
      if (!window.google || !window.google.accounts) {
        // Wait for Google script to load
        setTimeout(loadGoogleSignIn, 100);
        return;
      }

      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '647172303794-lv8m47q1kbffqa3mhj2s99p9utfdc4jg.apps.googleusercontent.com';
      
      if (!clientId) {
        console.error('Google Client ID not configured');
        if (onError) {
          onError(new Error('Google Client ID not configured'));
        }
        return;
      }

      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
        });

        // Render Google button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: mode === 'signin' ? 'signin_with' : 'signup_with',
            width: 300,
          });
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        if (onError) onError(error);
      }
    };

    loadGoogleSignIn();
  }, [mode, handleGoogleResponse, onError]);

  return (
    <div className="google-signin-container">
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default GoogleSignIn;
