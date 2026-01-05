import React from "react";
import { Card, CardContent, CardHeader } from "./Card";
import { Skeleton } from "./Skeleton";

const ChartSkeleton = ({ title = true, height = "h-64", className = "" }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {/* Chart area */}
          <Skeleton className={`${height} w-full rounded-lg`} />

          {/* Legend */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSkeleton;
