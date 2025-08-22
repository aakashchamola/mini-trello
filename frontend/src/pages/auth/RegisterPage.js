import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GoogleSignIn from '../../components/common/GoogleSignIn';
import './AuthPages.css';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is handled by the context
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" message="Creating your account..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <h1>📋 Mini Trello</h1>
          </div>
          <h2>Join Mini Trello</h2>
          <p>Create your account to start organizing</p>
        </div>

        <Formik
          initialValues={{ 
            username: '', 
            email: '', 
            password: '', 
            confirmPassword: '' 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="auth-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Google Sign-Up */}
              <GoogleSignIn 
                mode="signup" 
                onSuccess={() => navigate('/dashboard', { replace: true })}
                onError={(error) => console.error('Google Sign-Up error:', error)}
              />

              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-container">
                  <FiUser className="input-icon" />
                  <Field
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Choose a username"
                    className={`form-input ${touched.username && errors.username ? 'error' : ''}`}
                  />
                </div>
                <ErrorMessage name="username" component="div" className="field-error" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-container">
                  <FiMail className="input-icon" />
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
                  />
                </div>
                <ErrorMessage name="email" component="div" className="field-error" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <FiLock className="input-icon" />
                  <Field
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    placeholder="Create a password"
                    className={`form-input ${touched.password && errors.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="field-error" />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container">
                  <FiLock className="input-icon" />
                  <Field
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="div" className="field-error" />
              </div>

              <div className="terms-notice">
                <p>
                  By creating an account, you agree to our{' '}
                  <Link to="/terms">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </p>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Create Account'
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
