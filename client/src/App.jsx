import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ChatPage from "./pages/ChatPage";
import DocumentsPage from "./pages/DocumentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import useAuthStore from "./store/useAuthStore";
import "./globals.css";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Skip auth check for public routes to avoid auth store errors
    const publicRoutes = ["/login", "/signup", "/accept-invite"];
    const isPublicRoute = publicRoutes.some((route) =>
      window.location.pathname.startsWith(route)
    );

    if (!isPublicRoute) {
      checkAuth();
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route
                path="projects/:projectId"
                element={<ProjectDetailPage />}
              />
              <Route path="chat" element={<ChatPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route
                path="settings/team"
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <TeamSettingsPage />
                  </RoleProtectedRoute>
                }
              />
            </Route>

            {/* 404 Not Found - Catch all unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
