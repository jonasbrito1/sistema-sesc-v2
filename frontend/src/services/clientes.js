import api from './api';

export const clienteService = {
  // Listar clientes
  listar: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/clientes?${queryString}`);
  },

  // Buscar cliente por ID
  buscarPorId: async (id) => {
    return await api.get(`/clientes/${id}`);
  },

  // Criar cliente
  criar: async (clienteData) => {
    return await api.post('/clientes', clienteData);
  },

  // Atualizar cliente
  atualizar: async (id, clienteData) => {
    return await api.put(`/clientes/${id}`, clienteData);
  },

  // Deletar cliente
  deletar: async (id) => {
    return await api.delete(`/clientes/${id}`);
  },

  // Estatísticas do cliente
  estatisticas: async (id) => {
    return await api.get(`/clientes/${id}/estatisticas`);
  },
};