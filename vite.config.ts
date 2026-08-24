import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "lucide": ["lucide-react"],
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": "http://127.0.0.1:3001",
      "/templates": "http://127.0.0.1:3001",
    },
  },
});
