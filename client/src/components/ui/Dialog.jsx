import React, { createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

const DialogContext = createContext({});

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="dialog-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useContext(DialogContext);

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onOpenChange?.(false);
      }
    };

    return createPortal(
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={handleBackdropClick}
          >
            <motion.div
              key="dialog-content"
              ref={ref}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(
                "relative z-50 grid w-full max-w-lg gap-3 sm:gap-4 bg-background p-4 sm:p-6 rounded-lg sm:rounded-lg",
                className
              )}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
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
      "text-base sm:text-lg font-semibold leading-none tracking-tight",
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
