import React from "react";

// Simple Bar Chart implementation until recharts can be installed
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

export const ResponsiveContainer = ({ width = "100%", height = 250, children, data = [] }) => {
  const maxValue = Math.max(...data.map(item => Object.values(item).find(val => typeof val === 'number') || 0));
  
  return (
    <div style={{ width, height }} className="relative">
      <div className="flex items-end justify-center h-full gap-2 px-4 py-2">
        {data.map((item, index) => {
          const value = Object.values(item).find(val => typeof val === 'number') || 0;
          const label = Object.values(item).find(val => typeof val === 'string') || `Item ${index + 1}`;
          const barHeight = maxValue > 0 ? (value / maxValue) * (height - 60) : 0;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-8 bg-primary rounded-t-sm transition-all hover:bg-primary/80"
                style={{ height: `${barHeight}px`, minHeight: value > 0 ? '4px' : '0px' }}
                title={`${label}: ${value}`}
              />
              <div className="text-xs text-muted-foreground mt-2 max-w-16 text-center truncate">
                {label}
              </div>
            </div>
          );
        })}
      </div>
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No data available</p>
        </div>
      )}
    </div>
  );
};