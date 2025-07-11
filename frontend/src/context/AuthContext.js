import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: () => ({ success: false }),
      register: () => ({ success: false }),
      logout: () => {},
      checkAuthStatus: () => {},
      isAdmin: () => false
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    try {
      const mockUser = {
        id: 1,
        nome: email.split('@')[0] || 'Usuário',
        email: email,
        tipo: email.includes('admin') ? 'admin' : 'cliente'
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      console.log('Login realizado:', mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, message: 'Erro no login' };
    }
  };

  const register = async (userData) => {
    try {
      const mockUser = {
        id: Date.now(),
        nome: userData.nomeCliente || 'Novo Usuário',
        email: userData.email,
        tipo: 'cliente'
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, message: 'Erro no registro' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => user?.tipo === 'admin';

  const value = {
    user,
    isAuthenticated,
    loading: false,
    login,
    register,
    logout,
    checkAuthStatus: () => {},
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
