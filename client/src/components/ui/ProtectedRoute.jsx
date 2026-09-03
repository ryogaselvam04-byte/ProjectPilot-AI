import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../layout/Loader.jsx';

// Wrap any route element with this to require a logged-in user.
// Usage: <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
