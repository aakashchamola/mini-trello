import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Query Client
import { queryClient } from './config/queryClient';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { UIProvider } from './contexts/UIContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPageNew'; // Updated to use React Query version
import BoardPage from './pages/BoardPageNew'; // Updated to use React Query version
import WorkspacePage from './pages/WorkspacePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Debug Components
import MutationTester from './components/debug/MutationTester';

// Styles
import './App.css';

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <UIProvider>
              <Router>
                <div className="app-container">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <DashboardPage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <DashboardPage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/workspaces/:workspaceId" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <WorkspacePage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/boards/:boardId" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <BoardPage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ProfilePage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 Page */}
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </div>
              </Router>
              
              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </UIProvider>
          </AppProvider>
        </AuthProvider>
        
        {/* React Query DevTools */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

// App Layout Component
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default App;
