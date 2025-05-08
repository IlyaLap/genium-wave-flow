
import React from 'react';
import { Link } from 'react-router-dom';
import GeniumLogo from './GeniumLogo';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-10 bg-black bg-opacity-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <GeniumLogo className="h-10 w-auto" />
        </Link>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link 
                to="/" 
                className="text-white hover:text-genium-purple transition-colors duration-300 font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="text-white hover:text-genium-purple transition-colors duration-300 font-medium"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="text-white hover:text-genium-purple transition-colors duration-300 font-medium"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
