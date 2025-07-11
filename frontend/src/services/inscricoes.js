import api from './api';

export const inscricaoService = {
  // Listar inscrições
  listar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/inscricoes?${queryString}`);
  },

  // Buscar inscrição por ID
  buscarPorId: async (id) => {
    return await api.get(`/inscricoes/${id}`);
  },

  // Criar inscrição
  criar: async (inscricaoData) => {
    return await api.post('/inscricoes', inscricaoData);
  },

  // Confirmar inscrição
  confirmar: async (id) => {
    return await api.put(`/inscricoes/${id}/confirmar`);
  },

  // Cancelar inscrição
  cancelar: async (id, motivo = '') => {
    return await api.put(`/inscricoes/${id}/cancelar`, { motivo });
  },

  // Listar por cliente
  listarPorCliente: async (idCliente, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/inscricoes/cliente/${idCliente}?${queryString}`);
  },

  // Listar por atividade
  listarPorAtividade: async (idAtividade, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/inscricoes/atividade/${idAtividade}?${queryString}`);
  },

  // Relatório de inscrições
  relatorio: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/inscricoes/admin/relatorio?${queryString}`);
  },
};