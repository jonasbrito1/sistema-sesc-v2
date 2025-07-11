const axios = require('axios');

class CepService {
  constructor() {
    this.viaCepUrl = 'https://viacep.com.br/ws';
    this.postmonUrl = 'https://api.postmon.com.br/v1/cep';
  }

  async buscarCep(cep) {
    // Limpar CEP (remover caracteres especiais)
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }

    try {
      // Tentar primeiro com ViaCEP
      const endereco = await this.buscarViaCep(cepLimpo);
      if (endereco) {
        return endereco;
      }

      // Se ViaCEP falhar, tentar Postmon
      return await this.buscarPostmon(cepLimpo);
    } catch (error) {
      throw new Error(`Erro ao buscar CEP: ${error.message}`);
    }
  }

  async buscarViaCep(cep) {
    try {
      const response = await axios.get(`${this.viaCepUrl}/${cep}/json/`, {
        timeout: 5000
      });

      if (response.data.erro) {
        return null;
      }

      return {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        bairro: response.data.bairro,
        cidade: response.data.localidade,
        estado: response.data.uf,
        complemento: response.data.complemento,
        fonte: 'ViaCEP'
      };
    } catch (error) {
      console.warn('ViaCEP indisponível:', error.message);
      return null;
    }
  }

  async buscarPostmon(cep) {
    try {
      const response = await axios.get(`${this.postmonUrl}/${cep}`, {
        timeout: 5000
      });

      return {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        bairro: response.data.bairro,
        cidade: response.data.cidade,
        estado: response.data.estado,
        complemento: '',
        fonte: 'Postmon'
      };
    } catch (error) {
      throw new Error('CEP não encontrado ou serviços indisponíveis');
    }
  }

  validarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }

  formatarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

module.exports = new CepService();