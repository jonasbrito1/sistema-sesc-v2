import React from 'react';

const ErrorMessage = ({ message, details, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-500 text-2xl mb-2">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Oops! Algo deu errado
      </h3>
      <p className="text-red-600 mb-2">{message}</p>
      {details && (
        <p className="text-red-500 text-sm opacity-75">{details}</p>
      )}
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          🔄 Tentar Novamente
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
