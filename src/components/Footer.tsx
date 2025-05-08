
import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full z-10 bg-black bg-opacity-40 backdrop-blur-sm py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Genium Group. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 hover:text-genium-purple transition-colors duration-300"
            >
              <Facebook size={18} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-gray-400 hover:text-genium-purple transition-colors duration-300"
            >
              <Twitter size={18} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-genium-purple transition-colors duration-300"
            >
              <Linkedin size={18} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-400 hover:text-genium-purple transition-colors duration-300"
            >
              <Instagram size={18} />
            </a>
          </div>
          
          <div className="mt-4 md:mt-0">
            <a 
              href="mailto:info@geniumgroup.com" 
              className="text-gray-400 hover:text-genium-purple transition-colors duration-300 text-sm"
            >
              info@geniumgroup.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
