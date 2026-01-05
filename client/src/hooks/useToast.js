import { useState, useCallback } from "react";

// Simple toast management hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((options) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || "default",
      duration: options.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove
    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Convenience methods
  toast.success = (options) => toast({ ...options, variant: "success" });
  toast.error = (options) => toast({ ...options, variant: "destructive" });
  toast.info = (options) => toast({ ...options, variant: "default" });

  return {
    toast,
    dismiss,
    toasts,
  };
};

// Global toast notification functions for easy use
let globalToast = null;

export const setGlobalToast = (toastFn) => {
  globalToast = toastFn;
};

export const showToast = {
  success: (title, description) => {
    if (globalToast) {
      globalToast.success({ title, description });
    } else {
      console.log("✅", title, description);
    }
  },
  error: (title, description) => {
    if (globalToast) {
      globalToast.error({ title, description });
    } else {
      console.error("❌", title, description);
    }
  },
  info: (title, description) => {
    if (globalToast) {
      globalToast.info({ title, description });
    } else {
      console.info("ℹ️", title, description);
    }
  },
};
