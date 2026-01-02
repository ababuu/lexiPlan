import React from "react";
import { Navigate } from "react-router-dom";

const HomePage = () => {
  // Home redirects to projects as per requirements
  return <Navigate to="/projects" replace />;
};

export default HomePage;
