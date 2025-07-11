import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Home className="w-4 h-4 text-gray-400" />
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={`${
              index === items.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600'
            }`}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;