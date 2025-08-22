import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GoogleSignIn from "../../components/common/GoogleSignIn";
import "./AuthPages.css";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading, isAuthenticated, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login({ email: values.email, password: values.password });
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" message="Checking authentication..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <h1>📋 Mini Trello</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="auth-form">
              {/* {error && <div className="error-message">{error}</div>} */}
              {/* Google Sign-In */}
              <GoogleSignIn
                mode="signin"
                onSuccess={() => navigate(from, { replace: true })}
                onError={(error) =>
                  console.error("Google Sign-In error:", error)
                }
              />
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-group-fixed">
                  <span>
                    <FiMail className="input-icon-fixed" />
                  </span>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    className={`login-input-fixed ${
                      touched.email && errors.email ? "error" : ""
                    }`}
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="field-error"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group-fixed">
                  <span>
                    <FiLock className="input-icon-fixed" />
                  </span>
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    className={`login-input-fixed ${
                      touched.password && errors.password ? "error" : ""
                    }`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="field-error"
                />
              </div>

              <div className="form-actions">
                <Link to="/forgot-password" className="forgot-password">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="small" /> : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
