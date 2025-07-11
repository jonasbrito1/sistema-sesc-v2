import api from './api';

export const dashboardService = {
  // Estatísticas gerais
  estatisticas: async () => {
    return await api.get('/dashboard/stats');
  },

  // Health check
  health: async () => {
    return await api.get('/health');
  },
};