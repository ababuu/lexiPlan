import React from "react";
import { MessageSquare, Upload, FolderOpen, BarChart3 } from "lucide-react";
import { Button } from "../ui/Button";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigation = [
    { id: "chat", name: "AI Chat", icon: MessageSquare },
    { id: "upload", name: "Upload Documents", icon: Upload },
    { id: "projects", name: "Projects", icon: FolderOpen },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
