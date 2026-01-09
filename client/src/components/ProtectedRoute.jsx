import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Spinner from "./ui/Spinner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  // Show loading while checking authentication
  if (isInitializing) {
    return <Spinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Only preserve location if not coming from login/register pages
    const from =
      location.pathname === "/login" || location.pathname === "/signup"
        ? "/"
        : location;
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return children;
};

export default ProtectedRoute;
