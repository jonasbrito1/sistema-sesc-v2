import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={{
      backgroundColor: '#2563eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '24px',
          paddingBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <div style={{
                backgroundColor: 'white',
                color: '#2563eb',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '8px'
              }}>
                S
              </div>
              <div style={{ color: 'white' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>SESC</h1>
                <p style={{ color: '#bfdbfe', fontSize: '12px', margin: '0' }}>Sistema de Inscrições</p>
              </div>
            </Link>
          </div>

          <nav style={{ display: 'flex', gap: '16px' }}>
            <Link 
              to="/" 
              style={{ 
                color: '#bfdbfe', 
                textDecoration: 'none', 
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              🏠 Início
            </Link>
            <Link 
              to="/atividades" 
              style={{ 
                color: '#bfdbfe', 
                textDecoration: 'none', 
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              🏃 Atividades
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/inscricoes" 
                  style={{ 
                    color: '#bfdbfe', 
                    textDecoration: 'none', 
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  📋 Inscrições
                </Link>
                {isAdmin() && (
                  <Link 
                    to="/dashboard" 
                    style={{ 
                      color: '#bfdbfe', 
                      textDecoration: 'none', 
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    📊 Dashboard
                  </Link>
                )}
              </>
            ) : (
              <Link 
                to="/register" 
                style={{ 
                  color: '#bfdbfe', 
                  textDecoration: 'none', 
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                📝 Cadastre-se
              </Link>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <div style={{ color: 'white', fontSize: '14px' }}>
                  <p style={{ fontWeight: '500', margin: '0' }}>Olá, {user?.nome}</p>
                  <p style={{ color: '#bfdbfe', fontSize: '12px', margin: '0' }}>{user?.tipo}</p>
                </div>
                <Link
                  to="/profile"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                >
                  👤 Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🚪 Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={{
                  backgroundColor: 'white',
                  color: '#2563eb',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                🔐 Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
