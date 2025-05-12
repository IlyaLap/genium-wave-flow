
import React, { useEffect, useState } from 'react';
import { preloadCriticalAssets, runAssetDiagnostics } from '../utils/assetUtils';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface PreloaderProps {
  children: React.ReactNode;
}

const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, boolean> | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Add URL parameters to control behavior
  // e.g. ?skipPreloader=true to bypass preloading
  const searchParams = new URLSearchParams(window.location.search);
  const skipPreloader = searchParams.get('skipPreloader') === 'true';
  const forceFallback = searchParams.get('forceFallback') === 'true';

  useEffect(() => {
    if (skipPreloader) {
      console.log('Skipping preloader due to URL parameter');
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    
    // Capture console errors during loading
    const originalError = console.error;
    console.error = (...args) => {
      // Capture asset loading errors
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Failed to load')) {
        if (isMounted) {
          setLoadError("Some assets failed to load but we'll continue anyway");
        }
      }
      originalError.apply(console, args);
    };

    // Start preloading critical assets
    const loadAssets = async () => {
      try {
        // Log environment information for debugging
        console.log('Preloader environment:');
        console.log('- NODE_ENV:', process.env.NODE_ENV);
        console.log('- VITE_MODE:', import.meta.env.MODE);
        console.log('- VITE_BASE_URL:', import.meta.env.BASE_URL);
        console.log('- VITE_PUBLIC_URL:', import.meta.env.VITE_PUBLIC_URL);
        console.log('- Window Location:', window.location.href);
        
        // Run diagnostics first
        const { success, results } = await runAssetDiagnostics();
        if (isMounted) {
          setDiagnosticResults(results);
        }
        
        if (!success) {
          console.warn('Some assets may be missing, but continuing');
        }
        
        // Preload assets
        await preloadCriticalAssets();
        console.log('Assets preloading completed');
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error in preloading assets:', err);
        if (isMounted) {
          setLoadError(`Error loading assets: ${err instanceof Error ? err.message : 'Unknown error'}`);
          
          // Allow retry if we haven't retried too many times
          if (retryCount < 2) {
            console.log(`Retrying asset loading (attempt ${retryCount + 1})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => loadAssets(), 1500);
          } else {
            // Continue anyway after exhausting retries
            setTimeout(() => {
              if (isMounted) {
                setIsLoading(false);
              }
            }, 1000);
          }
        }
      }
    };
    
    loadAssets();
    
    // Set up a maximum timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Preloader timeout reached, continuing anyway');
      if (isMounted) {
        setIsLoading(false);
      }
    }, 10000); // 10 seconds max loading time (increased from 5s)
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.error = originalError;
    };
  }, [skipPreloader, retryCount]);

  // Helper function to get environment info for diagnostics
  const getEnvironmentInfo = () => {
    return {
      mode: import.meta.env.MODE || 'unknown',
      baseUrl: import.meta.env.BASE_URL || '/',
      publicUrl: import.meta.env.VITE_PUBLIC_URL || '/',
      host: window.location.host,
      pathname: window.location.pathname,
      href: window.location.href,
    };
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading Genium Group...</p>
          {loadError && (
            <p className="mt-2 text-yellow-400 text-sm">{loadError}</p>
          )}
          <Button 
            variant="link" 
            className="mt-4 text-gray-400 text-xs"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </Button>
          
          {showDiagnostics && (
            <div className="mt-4 bg-black bg-opacity-70 p-4 rounded-md text-xs max-w-sm overflow-auto max-h-60">
              <h4 className="text-white font-semibold mb-2">Asset Check Results:</h4>
              {diagnosticResults ? (
                <ul className="text-white">
                  {Object.entries(diagnosticResults).map(([key, success]) => (
                    <li key={key} className={success ? "text-green-400" : "text-red-400"}>
                      {key}: {success ? "✓" : "✗"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Running diagnostics...</p>
              )}
              
              <h4 className="text-white font-semibold mt-3 mb-2">Environment:</h4>
              {Object.entries(getEnvironmentInfo()).map(([key, value]) => (
                <p key={key} className="text-gray-400 break-all">
                  {key}: {String(value)}
                </p>
              ))}
              
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsLoading(false);
                  }}
                >
                  Continue Anyway
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    window.location.href = '/?skipPreloader=true';
                  }}
                >
                  Skip Preloader
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadError) {
    console.warn('Loading completed with errors:', loadError);
  }

  return (
    <>
      {children}
      {loadError && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
          <Alert variant="destructive" className="pointer-events-auto max-w-md mx-auto">
            <AlertTitle>Asset Loading Issue</AlertTitle>
            <AlertDescription>
              {loadError} - The site may not display correctly.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
};

export default Preloader;
