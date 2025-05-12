
import React, { useEffect, useState } from 'react';
import { preloadCriticalAssets } from '../utils/assetUtils';

interface PreloaderProps {
  children: React.ReactNode;
}

const Preloader: React.FC<PreloaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start preloading critical assets
    preloadCriticalAssets();
    
    // Set up a maximum timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Assets preloaded (or timed out)');
      setIsLoading(false);
    }, 2000); // 2 seconds max loading time
    
    return () => clearTimeout(timeoutId);
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

  return <>{children}</>;
};

export default Preloader;
