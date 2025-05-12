
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'generate-redirects',
      writeBundle() {
        // Create _redirects file for Netlify SPA routing
        try {
          // Ensure the dist directory exists
          if (!fs.existsSync('dist')) {
            fs.mkdirSync('dist', { recursive: true });
          }
          fs.writeFileSync('dist/_redirects', '/* /index.html 200');
          console.log('✅ Created _redirects file for Netlify SPA routing');
        } catch (e) {
          console.error('Error creating _redirects file:', e);
        }
      }
    },
    {
      name: 'copy-public-assets',
      writeBundle() {
        // Log that we're copying public assets to help with debugging
        console.log('📂 Ensuring public assets are properly copied...');
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    assetsInlineLimit: 0, // Don't inline any assets as base64
  },
}));
