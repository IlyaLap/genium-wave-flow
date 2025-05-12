
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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
