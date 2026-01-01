import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatWindow from "../ChatWindow";
import UploadZone from "../UploadZone";
import ProjectsView from "../ProjectsView";
import AnalyticsView from "../AnalyticsView";

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatWindow />;
      case "upload":
        return <UploadZone />;
      case "projects":
        return <ProjectsView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <ChatWindow />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default MainLayout;
