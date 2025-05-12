
import React, { useEffect, useState } from 'react';
import { preloadCriticalAssets } from '../utils/assetUtils';

interface PreloaderProps {
  children: React.ReactNode;
}

const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Capture console errors during loading
    const originalError = console.error;
    console.error = (...args) => {
      // Capture asset loading errors
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Failed to load')) {
        setLoadError("Some assets failed to load but we'll continue anyway");
      }
      originalError.apply(console, args);
    };

    // Start preloading critical assets
    try {
      preloadCriticalAssets();
      console.log('Assets preloading started');
    } catch (err) {
      console.error('Error preloading assets:', err);
    }
    
    // Set up a maximum timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Assets preloaded (or timed out)');
      setIsLoading(false);
      // Restore original console.error
      console.error = originalError;
    }, 2000); // 2 seconds max loading time
    
    return () => {
      clearTimeout(timeoutId);
      console.error = originalError;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading Genium Group...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    console.warn('Loading completed with errors:', loadError);
  }

  return <>{children}</>;
};

export default Preloader;
