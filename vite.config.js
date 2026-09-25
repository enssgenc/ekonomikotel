import { defineConfig } from "vite";
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:4173",
      "/uploads": "http://127.0.0.1:4173",
    },
  },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: {
    chunkSizeWarningLimit: 450,
    rolldownOptions: { input: { site: "index.html", admin: "admin.html" } },
  },
});
