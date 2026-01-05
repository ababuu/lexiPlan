import React from "react";
import { Card, CardContent, CardHeader } from "./Card";
import { Skeleton } from "./Skeleton";

const CardSkeleton = ({
  showHeader = true,
  headerHeight = "h-5",
  contentRows = 3,
  className = "",
}) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className={`${headerHeight} w-32`} />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentRows }, (_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === contentRows - 1 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default CardSkeleton;
