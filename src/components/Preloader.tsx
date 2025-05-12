
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
  
  // Add URL parameters to control behavior
  // e.g. ?skipPreloader=true to bypass preloading
  const searchParams = new URLSearchParams(window.location.search);
  const skipPreloader = searchParams.get('skipPreloader') === 'true';

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
          // Continue anyway after a short delay
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          }, 1000);
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
    }, 5000); // 5 seconds max loading time
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.error = originalError;
    };
  }, [skipPreloader]);

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
          
          {showDiagnostics && diagnosticResults && (
            <div className="mt-4 bg-black bg-opacity-70 p-4 rounded-md text-xs">
              <h4 className="text-white font-semibold mb-2">Asset Check Results:</h4>
              <ul className="text-white">
                {Object.entries(diagnosticResults).map(([key, success]) => (
                  <li key={key} className={success ? "text-green-400" : "text-red-400"}>
                    {key}: {success ? "✓" : "✗"}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-gray-400">
                Env: {import.meta.env.MODE || 'unknown'}
                {import.meta.env.VITE_PUBLIC_URL && `, Base: ${import.meta.env.VITE_PUBLIC_URL}`}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => {
                  setShowDiagnostics(false);
                  setIsLoading(false);
                }}
              >
                Skip Preloading
              </Button>
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
