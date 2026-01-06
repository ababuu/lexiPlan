import React, { createContext, useContext } from "react";
import { cn } from "../../lib/utils";

const DialogContext = createContext({});

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      )}
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useContext(DialogContext);

    if (!open) return null;

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onOpenChange?.(false);
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={ref}
          className={cn(
            "relative z-[60] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

const DialogTrigger = React.forwardRef(
  ({ className, children, asChild, ...props }, ref) => {
    const { onOpenChange } = useContext(DialogContext);

    const handleClick = () => {
      onOpenChange?.(true);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: handleClick,
      });
    }

    return (
      <button ref={ref} className={className} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);

Dialog.displayName = "Dialog";
DialogContent.displayName = "DialogContent";
DialogHeader.displayName = "DialogHeader";
DialogTitle.displayName = "DialogTitle";
DialogTrigger.displayName = "DialogTrigger";

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger };
