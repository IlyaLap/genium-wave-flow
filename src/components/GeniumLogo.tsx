
import React from 'react';
import { getImagePath, MAIN_ASSETS } from '../utils/assetUtils';

interface GeniumLogoProps {
  className?: string;
}

const GeniumLogo: React.FC<GeniumLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={getImagePath(MAIN_ASSETS.logo)} 
        alt="Genium Group Logo" 
        className="h-10 w-auto mr-2"
        onError={(e) => {
          console.error("Failed to load logo image");
          // Fallback to SVG version
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="text-white font-bold text-xl tracking-wide">
        GENIUM <span className="text-genium-purple">GROUP</span>
      </div>
    </div>
  );
};

export default GeniumLogo;
