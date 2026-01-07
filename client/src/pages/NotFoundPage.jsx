import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6">
      <div className="text-center space-y-5 sm:space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <FileQuestion className="h-24 w-24 sm:h-32 sm:w-32 text-muted-foreground/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl sm:text-7xl font-bold text-muted-foreground/50">
                404
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Page Not Found
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 sm:pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
