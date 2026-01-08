import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_BASE_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    build: {
      // Optimize chunk splitting
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor dependencies into separate chunks
            if (id.includes("node_modules")) {
              // React core libraries - keep together to avoid circular dependency issues
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router") ||
                id.includes("scheduler")
              ) {
                return "react-vendor";
              }
              // UI libraries (Radix UI)
              if (id.includes("@radix-ui")) {
                return "ui-vendor";
              }
              // Markdown rendering
              if (
                id.includes("react-markdown") ||
                id.includes("remark") ||
                id.includes("rehype") ||
                id.includes("unified") ||
                id.includes("micromark") ||
                id.includes("mdast")
              ) {
                return "markdown-vendor";
              }
              // Animation libraries
              if (id.includes("framer-motion")) {
                return "animation-vendor";
              }
              // State management and utilities
              if (id.includes("zustand") || id.includes("axios")) {
                return "utils-vendor";
              }
              // All other node_modules
              return "vendor";
            }
          },
        },
      },
      // Increase chunk size warning limit (default is 500kb)
      chunkSizeWarningLimit: 600,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Minify options
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
        },
      },
    },
    // Ensure proper module resolution
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    server: {
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          secure: false,
          // Important for cookies to work in development
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              // Forward cookies properly
              proxyReq.setHeader("Origin", "http://localhost:5173");
            });
          },
        },
      },
    },
  };
});
