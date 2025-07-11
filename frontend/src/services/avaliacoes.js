import api from './api';

export const avaliacaoService = {
  // Listar avaliações
  listar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/avaliacoes?${queryString}`);
  },

  // Buscar avaliação por ID
  buscarPorId: async (id) => {
    return await api.get(`/avaliacoes/${id}`);
  },

  // Criar avaliação
  criar: async (avaliacaoData) => {
    return await api.post('/avaliacoes', avaliacaoData);
  },

  // Responder avaliação
  responder: async (id, resposta, gerarComIA = false) => {
    return await api.put(`/avaliacoes/${id}/responder`, { resposta, gerarComIA });
  },

  // Estatísticas de avaliações
  estatisticas: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/avaliacoes/admin/estatisticas?${queryString}`);
  },

  // Análise de sentimentos
  analiseSentimentos: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/avaliacoes/admin/sentimentos?${queryString}`);
  },
};