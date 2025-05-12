
// Enhanced diagnostic function to check for common issues
export const runDiagnostics = () => {
  console.log("=== Running startup diagnostics ===");
  
  // Log environment information
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("BASE_URL:", import.meta.env.BASE_URL);
  console.log("MODE:", import.meta.env.MODE);
  console.log("DEV:", import.meta.env.DEV);
  console.log("PROD:", import.meta.env.PROD);
  
  // Check for the root element
  const rootElement = document.getElementById('root');
  console.log("Root element exists:", !!rootElement);
  
  // Check for WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    console.log("WebGL supported:", !!gl);
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        console.log("WebGL Vendor:", vendor);
        console.log("WebGL Renderer:", renderer);
      }
    }
  } catch (e) {
    console.log("WebGL check failed:", e);
  }
  
  // Check for routing
  console.log("Current URL:", window.location.href);
  console.log("Current pathname:", window.location.pathname);
  
  // Check for Netlify environment
  console.log("Is Netlify:", typeof (window as any).netlify !== 'undefined');
  console.log("Is Deployed:", window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  
  // Check for environment variables
  const envVars = Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce((obj, key) => {
      obj[key] = import.meta.env[key];
      return obj;
    }, {} as Record<string, string>);
  
  console.log("Environment variables:", envVars);
  
  // Check for browser features
  console.log("LocalStorage available:", (() => {
    try {
      return !!window.localStorage;
    } catch (e) {
      return false;
    }
  })());
  
  console.log("=== End diagnostics ===");
  
  return {
    webGLSupported: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
      } catch (e) {
        return false;
      }
    })(),
    rootElement: !!rootElement
  };
};

// DOM content loaded check
export const setupContentCheck = () => {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    // Check if the page content is visible
    setTimeout(() => {
      const hasVisibleContent = document.body.offsetHeight > 0;
      console.log('Page has visible content:', hasVisibleContent);
      
      // If there's no visible content after 2 seconds, try to recover
      setTimeout(() => {
        const stillNoContent = document.body.offsetHeight === 0 || 
                              !document.querySelector('main') ||
                              window.getComputedStyle(document.body).display === 'none';
                              
        if (stillNoContent && !window.location.search.includes('forceFallback')) {
          console.error('No visible content detected, attempting recovery');
          window.location.href = '/?forceFallback=true&skipPreloader=true';
        }
      }, 2000);
    }, 1000);
  });
};
