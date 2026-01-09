import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  FolderOpen,
  BarChart3,
  FileText,
  Building,
  Home,
  Users,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";
import useAuthStore from "../../store/useAuthStore";
import HasAccess, { AdminOnly } from "../HasAccess";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    { id: "home", name: "Home", icon: Home, path: "/" },
    { id: "projects", name: "Projects", icon: FolderOpen, path: "/projects" },
    { id: "chat", name: "AI Chat", icon: MessageSquare, path: "/chat" },
    { id: "documents", name: "Documents", icon: FileText, path: "/documents" },
    { id: "analytics", name: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  const adminNavigation = [
    { id: "team", name: "Team Settings", icon: Users, path: "/settings/team" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile sidebar - slides in from left */}
      <div
        className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-40 w-64 sm:w-72 lg:w-60 bg-[hsl(var(--nav-background))] border-r-[0.5px] border-border h-full flex flex-col backdrop-blur-sm overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="p-2 h-auto"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-1 mb-6">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text truncate">
              {user?.orgName || "Organization"}
            </h2>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 relative text-sm ${
                    active
                      ? "bg-primary/10 text-primary border-l-4 border-l-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-white dark:border-l-primary dark:hover:bg-primary/25"
                      : "hover:bg-muted/50 text-foreground/80 hover:text-foreground border-l-4 border-l-transparent"
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Button>
              );
            })}

            {/* Admin-only navigation */}
            <AdminOnly>
              <div className="pt-4 mt-4 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-2">
                  Administration
                </p>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Button
                      key={item.id}
                      variant={active ? "default" : "ghost"}
                      className={`w-full justify-start transition-all duration-200 relative text-sm ${
                        active
                          ? "bg-primary/10 text-primary border-l-4 border-l-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-white dark:border-l-primary dark:hover:bg-primary/25"
                          : "hover:bg-muted/50 text-foreground/80 hover:text-foreground border-l-4 border-l-transparent"
                      }`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Button>
                  );
                })}
              </div>
            </AdminOnly>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
