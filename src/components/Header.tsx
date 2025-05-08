
import React from 'react';
import { Link } from 'react-router-dom';
import GeniumLogo from './GeniumLogo';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-10 bg-black bg-opacity-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center">
          <GeniumLogo className="h-10 w-auto" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
