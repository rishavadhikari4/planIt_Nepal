import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
      '/api': 'http://localhost:5050'
    }
    },
    plugins: [
      react(),
      tailwindcss(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/',

    build: {
      rollupOptions: {
        output: {
          /* Split the libraries out of the app chunk. They change on an npm
             upgrade, the app changes every deploy — sharing one file meant
             every deploy re-downloaded React and framer-motion too. */
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
          },
        },
      },
      // The vendor chunks below are known and deliberate.
      chunkSizeWarningLimit: 700,
    },
  };
});
