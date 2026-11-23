import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
// Configura o servidor de desenvolvimento, o proxy da API e o alias de imports do frontend.
const rootDir = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    watch: { usePolling: true, interval: 300 },
    proxy: {
      // O navegador chama /api no Vite; o proxy encaminha a requisição ao Express.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src/frontend"),
    },
  },
});
