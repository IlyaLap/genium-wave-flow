
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-black bg-opacity-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/be65f2cb-3d5e-43e1-bc86-d287f2d35c09.png" 
            alt="Genium Group Logo" 
            className="h-10 w-auto" 
          />
          <div className="text-white font-bold text-xl tracking-wide ml-2">
            GENIUM <span className="text-genium-purple">GROUP</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
