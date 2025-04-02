import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // 這是你 Express 後端的 port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
