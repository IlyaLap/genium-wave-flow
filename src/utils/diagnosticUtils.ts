
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Diagnostic utilities for troubleshooting deployment issues
 */

// Run comprehensive diagnostics on page load
export function runInitialDiagnostics() {
  console.group("Deployment Diagnostics");
  
  // Log environment information
  console.log("Environment:", {
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV,
    baseUrl: import.meta.env.BASE_URL,
    publicUrl: import.meta.env.VITE_PUBLIC_URL
  });
  
  // Check browser features
  console.log("Browser Features:", {
    webGL: checkWebGLSupport(),
    localStorage: checkLocalStorageSupport(),
    sessionStorage: checkSessionStorageSupport(),
    webWorkers: "Worker" in window,
    serviceWorker: "serviceWorker" in navigator,
  });
  
  // Log location information
  console.log("Location:", {
    href: window.location.href,
    origin: window.location.origin,
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search
  });
  
  // Check for common errors
  detectCommonErrors();
  
  // Check asset loading
  checkCriticalAssets();
  
  console.groupEnd();
  
  // Add an unobtrusive debug element to the page
  addDebugElement();
}

// Check for WebGL support
function checkWebGLSupport(): {supported: boolean, renderer?: string, vendor?: string} {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
    
    if (!gl) {
      return { supported: false };
    }
    
    // Try to get additional info if available
    let renderer, vendor;
    try {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      }
    } catch (e) {
      console.warn("Could not get detailed WebGL info:", e);
    }
    
    return { 
      supported: true,
      renderer,
      vendor
    };
  } catch (e) {
    console.error("WebGL check failed:", e);
    return { supported: false };
  }
}

// Check for localStorage support
function checkLocalStorageSupport(): boolean {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch (e) {
    return false;
  }
}

// Check for sessionStorage support
function checkSessionStorageSupport(): boolean {
  try {
    sessionStorage.setItem("test", "test");
    sessionStorage.removeItem("test");
    return true;
  } catch (e) {
    return false;
  }
}

// Check if important assets are loading
function checkCriticalAssets() {
  // Try to load a sample image
  const testImage = new Image();
  testImage.onload = () => console.log("Test image loaded successfully");
  testImage.onerror = (e) => console.error("Test image failed to load:", e);
  
  // Use a simple test image from the public folder
  testImage.src = `${import.meta.env.VITE_PUBLIC_URL || ''}/favicon.ico`;
  
  // Check if important scripts are loaded
  console.log("Script loading:", {
    react: typeof React !== 'undefined',
    reactDOM: typeof ReactDOM !== 'undefined',
    tanstackQuery: typeof window.__REACT_QUERY_GLOBAL_CALLBACKS__ !== 'undefined'
  });
}

// Detect common deployment errors
function detectCommonErrors() {
  // Check for 404 errors in console
  if (window.performance) {
    const resources = window.performance.getEntriesByType("resource");
    const failed = resources.filter(res => {
      // Filter for failed requests where possible
      return res.name.includes("404") || res.name.includes("failed");
    });
    
    if (failed.length > 0) {
      console.warn("Potentially failed resources:", failed);
    }
  }
  
  // Check for route issues
  if (window.location.pathname !== "/" && !document.querySelector('main')) {
    console.warn("Possible routing issue: Main content not found on non-root path");
  }
}

// Add a subtle debug element to the page
function addDebugElement() {
  // Only in production to help diagnose issues
  if (import.meta.env.PROD) {
    const debugElem = document.createElement("div");
    debugElem.style.position = "fixed";
    debugElem.style.bottom = "0";
    debugElem.style.right = "0";
    debugElem.style.background = "rgba(0,0,0,0.5)";
    debugElem.style.color = "#fff";
    debugElem.style.padding = "2px 5px";
    debugElem.style.fontSize = "10px";
    debugElem.style.zIndex = "9999";
    debugElem.style.borderTopLeftRadius = "4px";
    
    // Add version info
    const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
    debugElem.textContent = `v${appVersion} | ${import.meta.env.MODE}`;
    
    // Add click handler to show more details
    debugElem.addEventListener("click", () => {
      console.log("Environment:", {
        mode: import.meta.env.MODE,
        baseUrl: import.meta.env.BASE_URL,
        buildTime: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'unknown'
      });
      
      // Toggle display of diagnostic panel
      const existingPanel = document.getElementById("diagnostics-panel");
      if (existingPanel) {
        existingPanel.remove();
      } else {
        const panel = document.createElement("div");
        panel.id = "diagnostics-panel";
        panel.style.position = "fixed";
        panel.style.bottom = "20px";
        panel.style.right = "20px";
        panel.style.background = "rgba(0,0,0,0.8)";
        panel.style.color = "#fff";
        panel.style.padding = "10px";
        panel.style.borderRadius = "4px";
        panel.style.zIndex = "10000";
        panel.style.maxWidth = "300px";
        panel.style.maxHeight = "400px";
        panel.style.overflow = "auto";
        panel.style.fontSize = "12px";
        panel.style.fontFamily = "monospace";
        
        const webGLInfo = checkWebGLSupport();
        const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0';
        const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'unknown';
        
        panel.innerHTML = `
          <h4 style="margin-top:0;margin-bottom:8px;color:#45f;">Deployment Info</h4>
          <p>Version: ${appVersion}</p>
          <p>Environment: ${import.meta.env.MODE}</p>
          <p>Base URL: ${import.meta.env.BASE_URL}</p>
          <p>Build Time: ${buildTime}</p>
          <h4 style="margin-top:10px;margin-bottom:8px;color:#45f;">WebGL</h4>
          <p>Supported: ${webGLInfo.supported ? 'Yes' : 'No'}</p>
          ${webGLInfo.renderer ? `<p>Renderer: ${webGLInfo.renderer}</p>` : ''}
          ${webGLInfo.vendor ? `<p>Vendor: ${webGLInfo.vendor}</p>` : ''}
          <button id="close-diag" style="margin-top:10px;padding:4px 8px;background:#333;border:1px solid #666;color:#fff;border-radius:4px;">Close</button>
        `;
        
        document.body.appendChild(panel);
        
        document.getElementById("close-diag")?.addEventListener("click", (e) => {
          e.stopPropagation();
          panel.remove();
        });
      }
    });
    
    document.body.appendChild(debugElem);
  }
}
