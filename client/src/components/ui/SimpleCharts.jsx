import React from "react";
import { BarChart3 } from "lucide-react";

// Lightweight chart primitives that honor dataKey props
export const BarChart = ({ children }) => children;
export const Bar = ({ dataKey }) => null;
export const XAxis = ({ dataKey }) => null;
export const YAxis = () => null;
export const CartesianGrid = () => null;
export const Tooltip = () => null;

// Ensure stable identification in production builds
Bar.displayName = "Bar";
XAxis.displayName = "XAxis";

export const ResponsiveContainer = ({
  width = "100%",
  height = 250,
  children,
  data = [],
}) => {
  // Extract keys from children (Bar/XAxis) even when nested inside BarChart
  const flattenChildren = (nodes) =>
    React.Children.toArray(nodes).flatMap((child) =>
      React.isValidElement(child) && child.props?.children
        ? [child, ...flattenChildren(child.props.children)]
        : [child]
    );

  const allChildren = flattenChildren(children);
  const isBar = (c) =>
    c?.type === Bar ||
    c?.type?.displayName === "Bar" ||
    c?.type?.name === "Bar";
  const isXAxis = (c) =>
    c?.type === XAxis ||
    c?.type?.displayName === "XAxis" ||
    c?.type?.name === "XAxis";

  const barChild = allChildren.find(isBar);
  const xAxisChild = allChildren.find(isXAxis);
  const barValueKey = barChild?.props?.dataKey;
  const labelKey = xAxisChild?.props?.dataKey;

  const validData = Array.isArray(data)
    ? data.filter(
        (item) => item && typeof item === "object" && Object.keys(item).length
      )
    : [];

  // Auto-detect a numeric key if none was provided or if values resolve to zero
  const autoValueKey = (() => {
    if (validData.length === 0) return null;
    const sample = validData.find((item) => item && typeof item === "object");
    if (!sample) return null;
    return Object.keys(sample).find((key) => {
      const val = sample[key];
      if (typeof val === "number" && !isNaN(val)) return true;
      if (
        typeof val === "string" &&
        val.trim() !== "" &&
        Number.isFinite(Number(val))
      )
        return true;
      return false;
    });
  })();

  const valueKey = barValueKey || autoValueKey;

  if (validData.length === 0 || !valueKey) {
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

  const getNumericValue = (item) => {
    const val = item?.[valueKey];
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string" && val.trim() !== "") {
      const num = Number(val);
      return Number.isFinite(num) ? num : 0;
    }
    // If the selected key fails, try another numeric key on this item
    const fallbackKey = Object.keys(item || {}).find((key) => {
      const v = item[key];
      if (typeof v === "number" && !isNaN(v)) return true;
      if (
        typeof v === "string" &&
        v.trim() !== "" &&
        Number.isFinite(Number(v))
      )
        return true;
      return false;
    });
    if (fallbackKey) {
      const v = item[fallbackKey];
      return typeof v === "number" ? v : Number(v) || 0;
    }
    return 0;
  };

  const getLabel = (item, index) => {
    if (labelKey && item?.[labelKey]) {
      const val = item[labelKey];
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(val).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      if (typeof val === "string") return val;
    }
    // Fallback: find a short string field
    const candidate = Object.values(item).find(
      (v) => typeof v === "string" && v.length < 30
    );
    if (candidate) return candidate;
    return `Item ${index + 1}`;
  };

  const values = validData.map(getNumericValue);
  const maxValue = Math.max(...values, 0);

  // If everything is zero, log a hint to aid debugging without breaking UI
  if (maxValue === 0 && typeof console !== "undefined") {
    console.debug("SimpleCharts: all zero values", {
      valueKey,
      sample: validData.slice(0, 3),
    });
  }

  return (
    <div style={{ width, height }} className="relative">
      <div className="flex items-end justify-center h-full gap-1 px-4 py-2">
        {validData.map((item, index) => {
          const value = getNumericValue(item);
          const label = getLabel(item, index);
          const barHeight =
            maxValue > 0 ? Math.max((value / maxValue) * (height - 80), 2) : 2;
          const intensity = maxValue > 0 ? value / maxValue : 0.5;
          const opacity = 0.3 + intensity * 0.7;

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 max-w-16"
            >
              <div className="text-xs text-muted-foreground mb-1 opacity-0 hover:opacity-100 transition-opacity">
                {value}
              </div>
              <div
                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40 cursor-pointer shadow-sm"
                style={{
                  height: `${barHeight}px`,
                  minHeight: value > 0 ? "4px" : "2px",
                  opacity: opacity,
                }}
                title={`${label}: ${value}`}
              />
              <div className="text-xs text-muted-foreground mt-2 text-center truncate w-full">
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[0.25, 0.5, 0.75].map((ratio, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-border/20"
            style={{ bottom: `${20 + ratio * (height - 80)}px` }}
          />
        ))}
      </div>

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
