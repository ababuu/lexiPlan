import React from "react";
import { Button } from "../ui/Button";
import { LogOut, User, Building } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">lexiPlan</h1>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <Building className="w-4 h-4" />
            <span>Organization ID: {user?.orgId}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {user?.role}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
