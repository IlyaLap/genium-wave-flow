
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full z-10 bg-black bg-opacity-40 backdrop-blur-sm py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Genium Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
