import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_BASE_URL || "http://localhost:5000";

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
    ],

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // Group Radix UI
            if (id.includes("@radix-ui")) {
              return "radix-ui";
            }

            // Icons
            if (id.includes("lucide-react")) {
              return "icons";
            }

            // Animations
            if (id.includes("framer-motion")) {
              return "animation";
            }

            // Markdown tooling
            if (id.includes("react-markdown")) {
              return "markdown";
            }

            // State + HTTP
            if (id.includes("zustand")) {
              return "state";
            }

            if (id.includes("axios")) {
              return "http";
            }
          },
        },
      },

      chunkSizeWarningLimit: 1000,

      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
          pure_funcs:
            mode === "production"
              ? ["console.info", "console.debug", "console.warn"]
              : [],
        },
        format: {
          comments: false,
        },
      },

      sourcemap: mode !== "production",
    },

    /**
     * CRITICAL:
     * Deduplicate ONLY React core packages
     */
    resolve: {
      dedupe: ["react", "react-dom"],
    },

    /**
     * Let Vite prebundle deps properly
     * (do NOT exclude lucide-react)
     */
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom", "next-themes"],
    },

    server: {
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
