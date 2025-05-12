
import React, { useMemo } from 'react';

interface WebGLFallbackProps {
  message?: string;
  className?: string;
}

/**
 * A fallback component that displays when WebGL is not available
 */
export default function WebGLFallback({ 
  message = "WebGL not available - using fallback animation",
  className = "fixed inset-0 z-[-1]"
}: WebGLFallbackProps) {
  // Generate a unique ID for the gradient animation
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substring(2, 9)}`, []);
  
  return (
    <div className={`${className} overflow-hidden`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-black to-black">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(45deg, 
                        rgba(76, 29, 149, 0.3) 0%, 
                        rgba(0, 0, 0, 0) 70%,
                        rgba(124, 58, 237, 0.2) 100%)`,
            animation: 'pulse 5s ease-in-out infinite alternate'
          }}
        />
        
        {/* Animated circles */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{stopColor: 'rgba(139, 92, 246, 0.3)'}} />
              <stop offset="100%" style={{stopColor: 'rgba(67, 56, 202, 0)'}} />
            </radialGradient>
          </defs>
          
          <circle 
            cx="30%" 
            cy="70%" 
            r="10%" 
            fill={`url(#${gradientId})`} 
            style={{animation: 'float 15s ease-in-out infinite'}}
          />
          
          <circle 
            cx="70%" 
            cy="20%" 
            r="15%" 
            fill={`url(#${gradientId})`} 
            style={{animation: 'float 20s ease-in-out infinite reverse'}}
          />
          
          <circle 
            cx="80%" 
            cy="80%" 
            r="7%" 
            fill={`url(#${gradientId})`} 
            style={{animation: 'float 18s ease-in-out infinite 2s'}}
          />
        </svg>
        
        {/* Add a subtle grid pattern */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
      </div>
      
      {/* Optional message */}
      {message && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-500">
          {message}
        </div>
      )}
      
      {/* Add the CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-20px, 15px); }
          50% { transform: translate(10px, -15px); }
          75% { transform: translate(-15px, -10px); }
        }
      `}</style>
    </div>
  );
}
