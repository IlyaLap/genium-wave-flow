
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SubsidiaryCardProps {
  title: string;
  description: string;
  logoSrc: string;
  url: string;
}

const SubsidiaryCard: React.FC<SubsidiaryCardProps> = ({
  title,
  description,
  logoSrc,
  url
}) => {
  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-lg p-6 border border-gray-800 hover:border-genium-purple transition-all duration-300 animate-fade-in flex flex-col h-full">
      <div className="flex items-center mb-4">
        <img src={logoSrc} alt={`${title} logo`} className="w-12 h-12 mr-3" />
        <h3 className="text-white text-xl font-bold">{title}</h3>
      </div>
      
      <p className="text-gray-300 mb-6 flex-grow">
        {description}
      </p>
      
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="group flex items-center text-genium-purple hover:text-genium-purple-light transition-colors duration-300"
      >
        <span className="mr-2">Learn More</span>
        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
      </a>
    </div>
  );
};

export default SubsidiaryCard;
