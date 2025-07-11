import api from './api';

export const responsavelService = {
  // Listar responsáveis
  listar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/responsaveis?${queryString}`);
  },

  // Buscar responsável por ID
  buscarPorId: async (id) => {
    return await api.get(`/responsaveis/${id}`);
  },

  // Criar responsável
  criar: async (responsavelData) => {
    return await api.post('/responsaveis', responsavelData);
  },

  // Atualizar responsável
  atualizar: async (id, responsavelData) => {
    return await api.put(`/responsaveis/${id}`, responsavelData);
  },

  // Deletar responsável
  deletar: async (id) => {
    return await api.delete(`/responsaveis/${id}`);
  },

  // Listar por unidade
  listarPorUnidade: async (unidade, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/responsaveis/unidade/${unidade}?${queryString}`);
  },

  // Estatísticas do responsável
  estatisticas: async (id) => {
    return await api.get(`/responsaveis/${id}/estatisticas`);
  },
};