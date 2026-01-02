import React from "react";
import { Navigate } from "react-router-dom";

const SignupPage = () => {
  // Redirect to login page with signup mode
  return <Navigate to="/login" replace />;
};

export default SignupPage;
