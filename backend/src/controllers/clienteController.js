const { Cliente } = require('../models');
const axios = require('axios');

class ClienteController {
  async criar(req, res) {
    try {
      // Buscar endereço pelo CEP se fornecido
      if (req.body.CEP) {
        const enderecoCompleto = await this.buscarEnderecoPorCEP(req.body.CEP);
        if (enderecoCompleto) {
          req.body = { ...req.body, ...enderecoCompleto };
        }
      }

      const resultado = await Cliente.criar(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async listar(req, res) {
    try {
      const filtros = {
        status: req.query.status,
        cidade: req.query.cidade,
        limite: req.query.limite
      };

      const resultado = await Cliente.buscarTodos(filtros);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await Cliente.buscarPorId(req.params.id);
      
      if (!resultado.success) {
        return res.status(404).json(resultado);
      }
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async atualizar(req, res) {
    try {
      // Buscar endereço pelo CEP se alterado
      if (req.body.CEP) {
        const enderecoCompleto = await this.buscarEnderecoPorCEP(req.body.CEP);
        if (enderecoCompleto) {
          req.body = { ...req.body, ...enderecoCompleto };
        }
      }

      const resultado = await Cliente.atualizar(req.params.id, req.body);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async excluir(req, res) {
    try {
      const resultado = await Cliente.excluir(req.params.id);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorEmail(req, res) {
    try {
      const resultado = await Cliente.buscarPorEmail(req.params.email);
      
      if (!resultado.success) {
        return res.status(404).json(resultado);
      }
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async obterEstatisticas(req, res) {
    try {
      const resultado = await Cliente.obterEstatisticas();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarCEP(req, res) {
    try {
      const endereco = await this.buscarEnderecoPorCEP(req.params.cep);
      
      if (!endereco) {
        return res.status(404).json({ 
          success: false, 
          message: 'CEP não encontrado' 
        });
      }
      
      res.json({ 
        success: true, 
        data: endereco 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarEnderecoPorCEP(cep) {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      
      // Tentar ViaCEP primeiro
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
          timeout: 5000
        });
        
        if (response.data && !response.data.erro) {
          return {
            LOGRADOURO: response.data.logradouro,
            BAIRRO: response.data.bairro,
            CIDADE: response.data.localidade,
            ESTADO: response.data.uf
          };
        }
      } catch (error) {
        console.log('ViaCEP falhou, tentando Postmon...');
      }

      // Fallback para Postmon
      try {
        const response = await axios.get(`https://api.postmon.com.br/v1/cep/${cepLimpo}`, {
          timeout: 5000
        });
        
        if (response.data) {
          return {
            LOGRADOURO: response.data.logradouro,
            BAIRRO: response.data.distrito,
            CIDADE: response.data.cidade,
            ESTADO: response.data.estado
          };
        }
      } catch (error) {
        console.log('Postmon também falhou');
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error.message);
      return null;
    }
  }
}