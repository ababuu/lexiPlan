import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_BASE_URL || "http://localhost:5000";

  return {
    plugins: [react()],
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
