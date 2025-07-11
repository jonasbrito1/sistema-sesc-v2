import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Carregando...' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div 
        className={`animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 ${sizeClass}`}
        style={{
          width: size === 'sm' ? '16px' : size === 'lg' ? '48px' : '32px',
          height: size === 'sm' ? '16px' : size === 'lg' ? '48px' : '32px',
          border: '4px solid #dbeafe',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      ></div>
      {message && <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>{message}</p>}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
