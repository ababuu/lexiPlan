import React from "react";
import { Card, CardContent } from "./Card";
import { Skeleton } from "./Skeleton";

const StatCardSkeleton = ({ className = "" }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-8 w-16" /> {/* Value */}
          </div>
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon */}
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-32" /> {/* Description */}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCardSkeleton;
