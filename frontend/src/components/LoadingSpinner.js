﻿import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Carregando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {message && <p className="mt-2 text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
