import api from './api';

export const atividadeService = {
  // Listar atividades
  listar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/atividades?${queryString}`);
  },

  // Buscar atividade por ID
  buscarPorId: async (id) => {
    return await api.get(`/atividades/${id}`);
  },

  // Criar atividade
  criar: async (atividadeData) => {
    return await api.post('/atividades', atividadeData);
  },

  // Atualizar atividade
  atualizar: async (id, atividadeData) => {
    return await api.put(`/atividades/${id}`, atividadeData);
  },

  // Deletar atividade
  deletar: async (id) => {
    return await api.delete(`/atividades/${id}`);
  },

  // Listar por unidade
  listarPorUnidade: async (unidade, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/atividades/unidade/${unidade}?${queryString}`);
  },

  // Estatísticas da atividade
  estatisticas: async (id) => {
    return await api.get(`/atividades/${id}/estatisticas`);
  },
};