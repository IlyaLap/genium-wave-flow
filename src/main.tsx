
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced diagnostic function to check for common issues
const runDiagnostics = () => {
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

// Enhanced visual error component
const createVisualError = (error: unknown) => {
  // Only show in development or if explicitly enabled for debugging
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('showErrors') === 'true') {
    const errorElement = document.createElement('div');
    errorElement.style.position = 'fixed';
    errorElement.style.bottom = '0';
    errorElement.style.left = '0';
    errorElement.style.right = '0';
    errorElement.style.padding = '1rem';
    errorElement.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
    errorElement.style.color = 'white';
    errorElement.style.zIndex = '9999';
    errorElement.style.fontFamily = 'monospace';
    errorElement.style.fontSize = '14px';
    
    // Add more detailed error information
    const errorMessage = error instanceof Error ? 
      `${error.name}: ${error.message}` : 
      String(error);
    
    const stackInfo = error instanceof Error && error.stack ? 
      `<details>
        <summary>View Stack Trace</summary>
        <pre style="overflow-x: auto; padding: 0.5rem; background: rgba(0,0,0,0.5);">${error.stack}</pre>
       </details>` : 
      '';
    
    errorElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>Runtime Error:</strong>
        <button id="dismiss-error" style="background: white; color: black; border: none; border-radius: 4px; padding: 4px 8px;">Dismiss</button>
      </div>
      <div style="margin-top: 0.5rem;">
        ${errorMessage}
        ${stackInfo}
      </div>
    `;
    
    document.body.appendChild(errorElement);
    
    // Add event listener to dismiss button
    document.getElementById('dismiss-error')?.addEventListener('click', () => {
      document.body.removeChild(errorElement);
    });
    
    return errorElement;
  }
  return null;
};

// Run diagnostics before mounting the app
const diagnosticResults = runDiagnostics();

// Function to create a fallback UI if the app fails to mount
const createFallbackUI = (error: unknown) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 3rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="color: #d32f2f; margin-top: 0;">Application Error</h1>
        <p>We're sorry, but the application failed to start properly.</p>
        <div style="background: rgba(211, 47, 47, 0.1); border-left: 4px solid #d32f2f; padding: 1rem; margin: 1rem 0; color: #333;">
          ${error instanceof Error ? error.message : String(error)}
        </div>
        <p>Please try the following:</p>
        <ul style="line-height: 1.5;">
          <li>Refresh the page</li>
          <li>Clear your browser cache</li>
          <li>Try a different browser</li>
        </ul>
        <div style="margin-top: 2rem;">
          <button onclick="window.location.reload()" style="background: #2196f3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
          <button onclick="window.location.href='/?skipPreloader=true'" style="background: transparent; border: 1px solid #2196f3; color: #2196f3; padding: 0.5rem 1rem; border-radius: 4px; margin-left: 0.5rem; cursor: pointer;">
            Skip Preloader
          </button>
        </div>
      </div>
    `;
  }
};

// Use this pattern to properly render the app with React 18
// Wrap in a try/catch to help debug any initialization errors that might occur
try {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Failed to find the root element. The page structure may be incorrect.')
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  
  console.log('Application successfully mounted')
} catch (error) {
  console.error('Failed to render the application:', error)
  createVisualError(error);
  createFallbackUI(error);
}

// Add window error handlers
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  createVisualError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  createVisualError(event.reason);
});

// Make diagnostics data available globally for debugging
(window as any).__appDiagnostics = diagnosticResults;

