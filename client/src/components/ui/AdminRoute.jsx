import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Wrap admin-only routes with this (nest inside ProtectedRoute already
// guarantees a logged-in user; this additionally checks role === 'admin').
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;
