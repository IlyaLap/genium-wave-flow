
import React from 'react';

// Enhanced visual error component with better retry options
export const createVisualError = (error: unknown) => {
  // Display for any environment to help debug deployment issues
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
    <div style="margin-top: 0.5rem; display: flex; gap: 8px;">
      <button id="try-fallback" style="background: #2563eb; color: white; border: none; border-radius: 4px; padding: 4px 8px;">Try Fallback Mode</button>
      <button id="try-clear-cache" style="background: #4b5563; color: white; border: none; border-radius: 4px; padding: 4px 8px;">Clear Cache & Reload</button>
    </div>
  `;
  
  document.body.appendChild(errorElement);
  
  // Add event listeners to buttons
  document.getElementById('dismiss-error')?.addEventListener('click', () => {
    document.body.removeChild(errorElement);
  });
  
  document.getElementById('try-fallback')?.addEventListener('click', () => {
    window.location.href = '/?forceFallback=true&skipPreloader=true';
  });
  
  document.getElementById('try-clear-cache')?.addEventListener('click', () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    window.location.reload();
  });
  
  return errorElement;
};

// Function to create a fallback UI if the app fails to mount
export const createFallbackUI = (error: unknown) => {
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
        <div style="margin-top: 2rem; display: flex; gap: 8px;">
          <button onclick="window.location.reload(true)" style="background: #2196f3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
          <button onclick="window.location.href='/?skipPreloader=true'" style="background: transparent; border: 1px solid #2196f3; color: #2196f3; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Skip Preloader
          </button>
          <button onclick="window.location.href='/?forceFallback=true'" style="background: #9c27b0; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Fallback Mode
          </button>
        </div>
      </div>
    `;
  }
};

// Set up global error handlers
export const setupErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    createVisualError(event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    createVisualError(event.reason);
  });
};
