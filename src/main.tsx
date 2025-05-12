
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Diagnostic function to check for common issues
const runDiagnostics = () => {
  console.log("=== Running startup diagnostics ===");
  
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
  console.log("Is Netlify:", typeof window.netlify !== 'undefined');
  
  // Check for environment variables
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("=== End diagnostics ===");
};

// Show visual error for debugging
const showVisualError = (error: unknown) => {
  // Only show in development or if explicitly enabled for production debugging
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('showErrors') === 'true') {
    const errorElement = document.createElement('div');
    errorElement.style.position = 'fixed';
    errorElement.style.bottom = '0';
    errorElement.style.left = '0';
    errorElement.style.right = '0';
    errorElement.style.padding = '1rem';
    errorElement.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
    errorElement.style.color = 'white';
    errorElement.style.zIndex = '9999';
    errorElement.style.fontFamily = 'monospace';
    errorElement.style.fontSize = '14px';
    errorElement.innerHTML = `<strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}`;
    
    document.body.appendChild(errorElement);
    
    // Add a button to dismiss
    const dismissButton = document.createElement('button');
    dismissButton.innerText = 'Dismiss';
    dismissButton.style.marginLeft = '1rem';
    dismissButton.style.padding = '0.25rem 0.5rem';
    dismissButton.style.backgroundColor = 'white';
    dismissButton.style.color = 'black';
    dismissButton.style.border = 'none';
    dismissButton.style.borderRadius = '4px';
    dismissButton.addEventListener('click', () => document.body.removeChild(errorElement));
    
    errorElement.appendChild(dismissButton);
  }
};

// Run diagnostics before mounting the app
runDiagnostics();

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
  showVisualError(error);
}

// Add window error handlers
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  showVisualError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showVisualError(event.reason);
});
