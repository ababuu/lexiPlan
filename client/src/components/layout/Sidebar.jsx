import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, FolderOpen, BarChart3, FileText } from "lucide-react";
import { Button } from "../ui/Button";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { id: "projects", name: "Projects", icon: FolderOpen, path: "/projects" },
    { id: "chat", name: "AI Chat", icon: MessageSquare, path: "/chat" },
    { id: "documents", name: "Documents", icon: FileText, path: "/documents" },
    { id: "analytics", name: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path === "/projects" && location.pathname.startsWith("/projects"))
    );
  };

  return (
    <div className="w-60 bg-[hsl(var(--nav-background))] border-r-[0.5px] border-border h-full flex flex-col backdrop-blur-sm overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Deep Forest AI
          </h2>
          <p className="text-sm text-muted-foreground">
            Smart Document Assistant
          </p>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Button
                key={item.id}
                variant={active ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-200 relative ${
                  active
                    ? "bg-primary/10 text-primary border-l-4 border-l-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-white dark:border-l-primary dark:hover:bg-primary/25"
                    : "hover:bg-muted/50 text-foreground/80 hover:text-foreground border-l-4 border-l-transparent"
                }`}
                onClick={() => navigate(item.path)}
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
