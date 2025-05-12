
import fs from 'fs';
import path from 'path';

/**
 * Custom Vite plugin to ensure Netlify configuration files are copied to the build directory
 */
export const copyNetlifyFiles = () => ({
  name: 'copy-netlify-files',
  closeBundle: () => {
    // Files to copy from public to dist
    const filesToCopy = ['_redirects', '_headers'];
    
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
  }
});
