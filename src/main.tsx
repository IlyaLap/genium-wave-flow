
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
  } catch (e) {
    console.log("WebGL check failed:", e);
  }
  
  // Check for routing
  console.log("Current URL:", window.location.href);
  console.log("Current pathname:", window.location.pathname);
  
  // Check for environment variables
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("=== End diagnostics ===");
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
  
  // Display a visible error message on the page for easier debugging
  const errorElement = document.createElement('div')
  errorElement.style.color = 'red'
  errorElement.style.padding = '20px'
  errorElement.style.maxWidth = '800px'
  errorElement.style.margin = '0 auto'
  errorElement.innerHTML = `
    <h2>Application Error</h2>
    <p>The application failed to initialize. Please check the console for more details.</p>
    <pre>${error instanceof Error ? error.message : String(error)}</pre>
  `
  
  document.body.appendChild(errorElement)
}
