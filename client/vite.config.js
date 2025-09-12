import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/wings-cafe/',
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
