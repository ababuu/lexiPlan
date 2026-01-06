import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * RoleProtectedRoute - Protects routes based on user role
 * @param {Array} allowedRoles - Array of roles that can access the route (e.g., ['admin', 'editor'])
 * @param {React.ReactNode} children - The component to render if authorized
 */
const RoleProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in the allowed roles
  const hasPermission = allowedRoles.includes(user?.role);

  // If user doesn't have permission, redirect to home
  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
