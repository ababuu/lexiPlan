import React from "react";
import { BarChart3 } from "lucide-react";

// Enhanced Bar Chart implementation with better styling and data handling
export const BarChart = ({ children, data, ...props }) => {
  return (
    <div className="w-full h-64 flex items-end gap-2 p-4 bg-card rounded-lg border">
      {children}
    </div>
  );
};

export const Bar = ({ dataKey, fill }) => {
  return null; // This is handled by the ResponsiveContainer
};

export const XAxis = ({ dataKey }) => {
  return null;
};

export const YAxis = () => {
  return null;
};

export const CartesianGrid = ({ strokeDasharray }) => {
  return null;
};

export const Tooltip = () => {
  return null;
};

export const ResponsiveContainer = ({
  width = "100%",
  height = 250,
  children,
  data = [],
}) => {
  // Ensure data is an array and has valid entries
  const validData = Array.isArray(data)
    ? data.filter((item) => item && typeof item === "object")
    : [];

  if (validData.length === 0) {
    return (
      <div style={{ width, height }} className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No data available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Data will appear here once you have activity
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find numeric values more reliably
  const getNumericValue = (item) => {
    const keys = Object.keys(item);
    for (const key of keys) {
      const value = item[key];
      if (typeof value === "number" && !isNaN(value) && key !== "_id") {
        return value;
      }
    }
    return 0;
  };

  // Find string labels more reliably
  const getLabel = (item, index) => {
    const keys = Object.keys(item);
    for (const key of keys) {
      const value = item[key];
      if (typeof value === "string" && value.length < 20) {
        // For dates in _id field, format them nicely
        if (key === "_id" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
        // For other string values, use them directly
        if (key !== "_id") {
          return value;
        }
      }
    }
    // If _id looks like a date, use it
    if (
      item._id &&
      typeof item._id === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(item._id)
    ) {
      return new Date(item._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return `Item ${index + 1}`;
  };

  const maxValue = Math.max(...validData.map(getNumericValue));
  const minValue = Math.min(...validData.map(getNumericValue));
  const range = maxValue - minValue || 1;

  return (
    <div style={{ width, height }} className="relative">
      {/* Chart container */}
      <div className="flex items-end justify-center h-full gap-1 px-4 py-2">
        {validData.map((item, index) => {
          const value = getNumericValue(item);
          const label = getLabel(item, index);
          const barHeight =
            maxValue > 0 ? Math.max((value / maxValue) * (height - 80), 2) : 2;

          // Color gradient based on value
          const intensity = maxValue > 0 ? value / maxValue : 0.5;
          const opacity = 0.3 + intensity * 0.7;

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 max-w-16"
            >
              {/* Value label on hover */}
              <div className="text-xs text-muted-foreground mb-1 opacity-0 hover:opacity-100 transition-opacity">
                {value}
              </div>

              {/* Bar */}
              <div
                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40 cursor-pointer shadow-sm"
                style={{
                  height: `${barHeight}px`,
                  minHeight: value > 0 ? "4px" : "2px",
                  opacity: opacity,
                }}
                title={`${label}: ${value}`}
              />

              {/* Label */}
              <div className="text-xs text-muted-foreground mt-2 text-center truncate w-full">
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[0.25, 0.5, 0.75].map((ratio, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-border/20"
            style={{ bottom: `${20 + ratio * (height - 80)}px` }}
          />
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 text-xs text-muted-foreground">
        <span>{maxValue}</span>
        <span>{Math.round(maxValue * 0.75)}</span>
        <span>{Math.round(maxValue * 0.5)}</span>
        <span>{Math.round(maxValue * 0.25)}</span>
        <span>0</span>
      </div>
    </div>
  );
};
