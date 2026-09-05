import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from a subpath, the dev server from the root.
  base: command === 'build' ? '/stargazing-room/' : '/',
  build: {
    outDir: '../docs',
    emptyOutDir: true
  },
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
}));
