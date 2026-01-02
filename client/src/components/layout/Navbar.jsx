import React from "react";
import { Button } from "../ui/Button";
import { LogOut, User, Building } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { ThemeToggle } from "../ThemeToggle";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-[hsl(var(--nav-background))] border-b-[0.5px] border-border px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text">
            Deep Forest AI
          </h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>Org: {user?.orgId?.slice(-8)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-foreground/80">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="hidden sm:inline">{user?.email}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
              {user?.role}
            </span>
          </div>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
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
