import React from 'react';

const ErrorMessage = ({ message, details, onRetry }) => {
  return (
    <div style={{
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      margin: '16px'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#991b1b', 
        marginBottom: '8px' 
      }}>
        Algo deu errado
      </h3>
      <p style={{ color: '#dc2626', marginBottom: '8px' }}>{message}</p>
      {details && (
        <p style={{ color: '#ef4444', fontSize: '14px', opacity: '0.75' }}>{details}</p>
      )}
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            marginTop: '16px',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔄 Tentar Novamente
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
