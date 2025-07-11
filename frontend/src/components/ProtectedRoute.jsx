import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingPage } from './common/Loading';

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireCliente = false 
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage text="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.tipo !== 'admin') {
    return <Navigate to="/cliente" replace />;
  }

  if (requireCliente && user?.tipo !== 'cliente') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}