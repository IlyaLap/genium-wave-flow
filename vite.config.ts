
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
          
          // Copy robots.txt to dist if it exists in public
          if (fs.existsSync('public/robots.txt')) {
            fs.copyFileSync('public/robots.txt', 'dist/robots.txt');
            console.log('✅ Copied robots.txt to dist folder');
          }
          
          // Copy sitemap.xml to dist if it exists in public
          if (fs.existsSync('public/sitemap.xml')) {
            fs.copyFileSync('public/sitemap.xml', 'dist/sitemap.xml');
            console.log('✅ Copied sitemap.xml to dist folder');
          }
          
          // Ensure favicon is copied to the dist folder
          const faviconSources = [
            'public/lovable-uploads/3ed4d1d7-a481-4832-b144-81e6d655a8c8.png'
          ];
          
          faviconSources.forEach(source => {
            if (fs.existsSync(source)) {
              const dest = `dist/${source.replace('public/', '')}`;
              // Ensure directory exists
              const dir = path.dirname(dest);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              fs.copyFileSync(source, dest);
              console.log(`✅ Copied favicon from ${source} to ${dest}`);
            } else {
              console.warn(`⚠️ Favicon source not found: ${source}`);
            }
          });
        } catch (e) {
          console.error('Error in build process:', e);
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
    rollupOptions: {
      // Ensure assets in the public folder are correctly handled
      onwarn(warning, warn) {
        // Suppress specific warnings if needed
        if (warning.code === 'MISSING_EXPORT') return;
        warn(warning);
      }
    }
  },
}));
