import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 hover:bg-primary hover:text-white transition-colors"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`cursor-pointer flex items-center gap-2 ${
            theme === "light" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`cursor-pointer flex items-center gap-2 ${
            theme === "dark" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`cursor-pointer flex items-center gap-2 ${
            theme === "system" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 rounded-full bg-primary"></div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
