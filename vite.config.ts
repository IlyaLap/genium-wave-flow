
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  
  // Optimized build configuration
  build: {
    outDir: "dist",
    sourcemap: mode === 'development', // Only generate sourcemaps in development
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          ui: ['@/components/ui'],
        },
      },
    },
  },
  
  // Base path configuration - this is critical for routing
  base: '/',
  
  plugins: [
    react(),
    // Only use componentTagger in development mode
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Explicitly define environment variable handling
  envPrefix: 'VITE_',
}));
