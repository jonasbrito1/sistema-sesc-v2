import api from './api';

export const auth = {
  // Login
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  // Cadastro de cliente
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Logout
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Verificar token
  verifyToken: async () => {
    return await api.get('/auth/verify');
  },

  // Alterar senha
  changePassword: async (passwords) => {
    return await api.put('/auth/change-password', passwords);
  },

  // Recuperar senha
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Criar administrador
  createAdmin: async (adminData) => {
    return await api.post('/auth/admin', adminData);
  },
};