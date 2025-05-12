
import React from 'react';

interface GeniumLogoProps {
  className?: string;
}

const GeniumLogo: React.FC<GeniumLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="mr-2">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M20 0C8.954 0 0 8.954 0 20C0 31.046 8.954 40 20 40C31.046 40 40 31.046 40 20C40 8.954 31.046 0 20 0ZM20 8C26.627 8 32 13.373 32 20C32 26.627 26.627 32 20 32C13.373 32 8 26.627 8 20C8 13.373 13.373 8 20 8Z" 
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6F36E5" />
              <stop offset="100%" stopColor="#9B70FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="text-white font-bold text-xl tracking-wide">
        GENIUM <span className="text-genium-purple">GROUP</span>
      </div>
    </div>
  );
};

export default GeniumLogo;
