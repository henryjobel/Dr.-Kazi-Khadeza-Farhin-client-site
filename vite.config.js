import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false
    },
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**"]
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  }
});
