
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs';

// Simple plugin to copy Netlify configuration files
function copyNetlifyConfigPlugin() {
  return {
    name: 'copy-netlify-config',
    closeBundle: () => {
      // Ensure _redirects file exists in the dist directory
      const redirectsContent = '/* /index.html 200';
      const redirectsPath = path.resolve(__dirname, 'dist', '_redirects');
      
      try {
        fs.writeFileSync(redirectsPath, redirectsContent);
        console.log('✅ Created _redirects file for Netlify deployment');
      } catch (error) {
        console.error('❌ Failed to create _redirects file:', error);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  
  // Optimized build configuration
  build: {
    outDir: "dist",
    sourcemap: mode === 'development', // Only in development
    minify: true,
    
    // Simplified rollup options to avoid path resolution issues
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router-dom') || 
                id.includes('@tanstack/react-query')) {
              return 'vendor';
            }
          }
          return null;
        },
      },
    },
  },
  
  // Use a static base path for reliable deployments
  base: '/',
  
  plugins: [
    // React plugin with explicit configuration
    react({
      jsxImportSource: 'react'
    }),
    
    // Development-only plugins
    mode === 'development' && (() => {
      try {
        // Only attempt to load in development mode
        const { componentTagger } = require("lovable-tagger");
        return componentTagger();
      } catch (e) {
        console.warn("Development plugin not available:", e.message);
        return null;
      }
    })(),
    
    // Always include the Netlify config plugin
    copyNetlifyConfigPlugin(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Environment variables
  envPrefix: 'VITE_',
  
  // Define custom options for the build - using safe values
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  }
}));
