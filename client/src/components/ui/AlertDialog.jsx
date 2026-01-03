import React from "react";
import { Button } from "./Button";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";

export const AlertDialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">{children}</div>
    </div>
  );
};

export const AlertDialogContent = ({ children, className = "" }) => {
  return <Card className={`shadow-2xl ${className}`}>{children}</Card>;
};

export const AlertDialogHeader = ({ children }) => {
  return <CardHeader>{children}</CardHeader>;
};

export const AlertDialogTitle = ({ children, className = "" }) => {
  return (
    <CardTitle className={`text-lg font-semibold ${className}`}>
      {children}
    </CardTitle>
  );
};

export const AlertDialogDescription = ({ children, className = "" }) => {
  return (
    <p className={`text-sm text-muted-foreground mt-2 ${className}`}>
      {children}
    </p>
  );
};

export const AlertDialogFooter = ({ children, className = "" }) => {
  return (
    <CardContent className={`flex justify-end gap-2 pt-4 ${className}`}>
      {children}
    </CardContent>
  );
};

export const AlertDialogCancel = ({ children, onClick, ...props }) => {
  return (
    <Button variant="outline" onClick={onClick} {...props}>
      {children}
    </Button>
  );
};

export const AlertDialogAction = ({
  children,
  onClick,
  className = "",
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};
