import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ServiceRequest from '@/pages/ServiceRequest.jsx';
import TrackingPage from '@/pages/TrackingPage.jsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MessageProvider } from '@/contexts/MessageContext';
import MyVehiclesPage from '@/pages/MyVehiclesPage';
import ServiceHistoryPage from '@/pages/ServiceHistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ServiceProvider>
          <MessageProvider>
            <Router>
              <div className="min-h-screen">
                <Helmet>
                  <title>AutoCare Pro - Premium Car Management System</title>
                  <meta name="description" content="Professional car management and service system with real-time tracking, automated reminders, and comprehensive admin controls." />
                </Helmet>
              
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/request-service" 
                  element={
                    <ProtectedRoute>
                      <ServiceRequest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tracking/:requestId" 
                  element={
                    <ProtectedRoute>
                      <TrackingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/my-vehicles"
                  element={
                    <ProtectedRoute>
                      <MyVehiclesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-history"
                  element={
                    <ProtectedRoute>
                      <ServiceHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              
                <Toaster />
              </div>
            </Router>
          </MessageProvider>
        </ServiceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;