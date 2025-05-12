
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyNetlifyFiles, buildInfoPlugin } from "./src/vitePlugins";

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
  base: process.env.VITE_PUBLIC_URL || '/',
  
  plugins: [
    react(),
    // Only use componentTagger in development mode
    mode === 'development' && componentTagger(),
    // Custom plugin to copy Netlify configuration files
    copyNetlifyFiles(),
    // Add build info plugin for debugging
    buildInfoPlugin(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Explicitly define environment variable handling
  envPrefix: 'VITE_',
  
  // Define custom options for the build
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  }
}));
