
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { runInitialDiagnostics } from './utils/diagnosticUtils';
import { runDiagnostics, setupContentCheck } from './utils/diagnostics';
import { createVisualError, createFallbackUI, setupErrorHandlers } from './utils/errorHandlers';

// Run diagnostics in production
if (import.meta.env.PROD) {
  runInitialDiagnostics();
}

// Run basic diagnostics
const diagnosticResults = runDiagnostics();

// Setup error handlers
setupErrorHandlers();

// Use this pattern to properly render the app with React 18
// Wrap in a try/catch to help debug any initialization errors that might occur
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Failed to find the root element. The page structure may be incorrect.');
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('Application successfully mounted');
} catch (error) {
  console.error('Failed to render the application:', error);
  createVisualError(error);
  createFallbackUI(error);
}

// Add content visibility check
setupContentCheck();

// Make diagnostics data available globally for debugging
(window as any).__appDiagnostics = diagnosticResults;
