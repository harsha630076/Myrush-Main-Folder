import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { OTPVerification } from './pages/OTPVerification';
import { ProfileSetup } from './pages/ProfileSetup';
import { Venues } from './pages/Venues';
import { VenueDetails } from './pages/VenueDetails';
import { SlotSelection } from './pages/SlotSelection';
import { BookingSummary } from './pages/BookingSummary';
import { MyBookings } from './pages/MyBookings';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          <Route
            path="/venues"
            element={
              <ProtectedRoute>
                <Venues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/venues/:id"
            element={
              <ProtectedRoute>
                <VenueDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/slots"
            element={
              <ProtectedRoute>
                <SlotSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/summary"
            element={
              <ProtectedRoute>
                <BookingSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
