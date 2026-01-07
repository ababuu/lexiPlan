import React from "react";
import { Button } from "../ui/Button";
import { LogOut, User, Menu } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { ThemeToggle } from "../ThemeToggle";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-[hsl(var(--nav-background))] border-b-[0.5px] border-border px-3 sm:px-6 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile hamburger menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden p-2 h-auto"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-start">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text">
              LexiPlan
            </h1>
            <div className="text-xs text-muted-foreground hidden sm:block">
              <span>Smart Document Assistant</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2 text-sm text-foreground/80">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            </div>
            <span className="hidden md:inline text-xs sm:text-sm truncate max-w-[150px]">
              {user?.email}
            </span>
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] sm:text-xs font-medium">
              {user?.role}
            </span>
          </div>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all p-2 h-auto"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
