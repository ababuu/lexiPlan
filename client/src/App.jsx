import React, { useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./components/layout/MainLayout";
import useAuthStore from "./store/useAuthStore";
import "./globals.css";

function App() {
  const { isAuthenticated, isInitializing, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app mount
    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  // Show loading spinner while checking authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">{isAuthenticated ? <MainLayout /> : <AuthPage />}</div>
  );
}

export default App;
