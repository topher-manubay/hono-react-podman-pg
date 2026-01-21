import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // listen on 0.0.0.0
    port: 5173,
    // strictPort: true,
    watch: {
      usePolling: true, // important for Podman volume mounts
      interval: 100, // check every 100ms
    },
    hmr: {
      host: "localhost", // your browser connects here
      port: 5173,
    },
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: "http://backend:3000",
              // target: "http://localhost:3000",
              changeOrigin: true,
            },
          }
        : undefined,
  },
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    minify: mode === "production" ? "esbuild" : false,
  },
}));
