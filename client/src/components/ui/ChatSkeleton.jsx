import React from "react";
import { Skeleton } from "./Skeleton";

const ChatSkeleton = ({ messageCount = 5 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: messageCount }, (_, i) => {
        const isUser = i % 2 === 0;
        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl space-y-2 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              {/* Message bubble */}
              <div
                className={`rounded-2xl p-4 space-y-2 min-w-[200px] ${
                  isUser
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50 border border-primary/10"
                }`}
              >
                <Skeleton className="h-4 w-full" />
                <Skeleton
                  className={`h-4 ${
                    i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-5/6" : "w-full"
                  }`}
                />
                {i % 4 === 0 && <Skeleton className="h-4 w-2/3" />}
              </div>

              {/* Timestamp */}
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatSkeleton;
