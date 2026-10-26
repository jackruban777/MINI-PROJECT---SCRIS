import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from './LoadingState';
import { UserRole } from '../../types';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Verifying session authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RequireRole: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Checking portal permissions..." />;
  }

  if (!user || !role || !roles.includes(role)) {
    // If authenticated as student trying to access teacher, go to student dashboard
    if (role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If authenticated as teacher trying to access student, go to teacher dashboard
    if (role === 'TEACHER' || role === 'ADMIN') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
