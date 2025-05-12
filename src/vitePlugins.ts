
import fs from 'fs';
import path from 'path';

/**
 * Custom Vite plugin to ensure Netlify configuration files are copied to the build directory
 */
export const copyNetlifyFiles = () => ({
  name: 'copy-netlify-files',
  closeBundle: () => {
    // Files to copy from public to dist
    const filesToCopy = ['_redirects', '_headers', 'robots.txt'];
    
    filesToCopy.forEach(file => {
      try {
        const sourcePath = path.resolve('public', file);
        const destPath = path.resolve('dist', file);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Successfully copied ${file} to dist folder`);
        } else {
          console.warn(`Warning: ${file} not found in public folder`);
        }
      } catch (err) {
        console.error(`Error copying ${file}:`, err);
      }
    });
    
    // Also create a _redirects file if it doesn't exist
    const redirectsPath = path.resolve('dist', '_redirects');
    if (!fs.existsSync(redirectsPath)) {
      try {
        fs.writeFileSync(redirectsPath, '/* /index.html 200\n');
        console.log('Created _redirects file in dist folder');
      } catch (err) {
        console.error('Error creating _redirects file:', err);
      }
    }
  }
});

/**
 * Plugin to log build information for debugging
 */
export const buildInfoPlugin = () => ({
  name: 'build-info',
  buildStart() {
    console.log('Build starting...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Base directory:', process.cwd());
  },
  buildEnd() {
    console.log('Build completed');
  }
});
