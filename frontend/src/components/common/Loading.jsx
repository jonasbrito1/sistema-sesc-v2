import React from 'react';

export function Loading({ size = 'md', text = 'Carregando...', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </div>
  );
}

export function LoadingPage({ text = 'Carregando página...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="xl" text={text} />
    </div>
  );
}

export function LoadingOverlay({ text = 'Processando...' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-strong">
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-4 w-full"></div>
      ))}
    </div>
  );
}