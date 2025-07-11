import api from './api';

export const cepService = {
  // Buscar CEP
  buscarCep: async (cep) => {
    // Remover formatação do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    return await api.get(`/clientes/cep/${cepLimpo}`);
  },

  // Validar CEP
  validarCep: (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  },

  // Formatar CEP
  formatarCep: (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  },
};