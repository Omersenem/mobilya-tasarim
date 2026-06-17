import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Babylon.js epey büyük; ayrı bir chunk'a alarak ilk yükü hızlandırıyoruz.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      // Geliştirmede API isteklerini Go Fiber backend'ine yönlendir.
      "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ["@babylonjs/core", "@babylonjs/gui"],
        },
      },
    },
  },
});
