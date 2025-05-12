
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
    
    // Make sure dist directory exists
    const distDir = path.resolve('dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
      console.log('Created dist directory');
    }
    
    filesToCopy.forEach(file => {
      try {
        const sourcePath = path.resolve('public', file);
        const destPath = path.resolve('dist', file);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Successfully copied ${file} to dist folder`);
        } else {
          console.warn(`Warning: ${file} not found in public folder`);
          
          // If redirects file doesn't exist, create a default one
          if (file === '_redirects' && !fs.existsSync(destPath)) {
            fs.writeFileSync(destPath, '/* /index.html 200\n');
            console.log('Created default _redirects file');
          }
        }
      } catch (err) {
        console.error(`Error copying ${file}:`, err);
      }
    });
    
    // Create a diagnostic file for debugging
    try {
      const diagnosticData = {
        buildTime: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        viteEnv: process.env.VITE_APP_ENV || 'undefined',
        publicUrl: process.env.VITE_PUBLIC_URL || '/',
        files: fs.readdirSync(distDir)
      };
      
      fs.writeFileSync(
        path.resolve(distDir, 'build-info.json'), 
        JSON.stringify(diagnosticData, null, 2)
      );
      console.log('Created build-info.json for debugging');
    } catch (err) {
      console.error('Error creating diagnostic file:', err);
    }
  }
});

/**
 * Plugin to log build information for debugging
 */
export const buildInfoPlugin = () => {
  const startTime = Date.now();
  
  return {
    name: 'build-info',
    buildStart() {
      console.log('=== Build starting ===');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('Base directory:', process.cwd());
      console.log('Environment variables:');
      
      // Log all VITE_ prefixed environment variables (without values for security)
      Object.keys(process.env)
        .filter(key => key.startsWith('VITE_'))
        .forEach(key => {
          console.log(`- ${key} is defined`);
        });
    },
    buildEnd() {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`=== Build completed in ${duration}s ===`);
    }
  };
};
