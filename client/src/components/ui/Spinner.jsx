import React from "react";

const Spinner = ({ size = "h-12 w-12", className = "" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${size} ${className}`}
      ></div>
    </div>
  );
};

export default Spinner;
