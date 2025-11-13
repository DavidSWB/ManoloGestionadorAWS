import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Only import Express server in dev mode
function expressPlugin() {
  if (process.env.NODE_ENV === "production") {
    return null; // Do not include backend in build
  }

  // Lazy import inside the function so it doesn't run during build
  const { createServer } = require("./server");

  return {
    name: "express-plugin",
    apply: "serve" as const,
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  } satisfies Plugin;
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "./"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    react(),
    expressPlugin(), // <-- Now safe
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
