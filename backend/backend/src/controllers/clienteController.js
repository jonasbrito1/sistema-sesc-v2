const database = require('../config/database');
const axios = require('axios');
const { asyncHandler } = require('../middleware/errorHandler');

class ClienteController {
  criar = asyncHandler(async (req, res) => {
    const dadosCliente = req.body;

    if (dadosCliente.cep) {
      const enderecoCompleto = await this.buscarEnderecoPorCEP(dadosCliente.cep);
      if (enderecoCompleto) {
        dadosCliente = { ...dadosCliente, ...enderecoCompleto };
      }
    }

    const emailExistente = await database.findAll('clientes', {
      email: { operator: '==', value: dadosCliente.email }
    });

    if (emailExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const cliente = await database.create('clientes', {
      ...dadosCliente,
      status: 'ativo'
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: cliente
    });
  });

  listar = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, nome, email, cidade, status } = req.query;
    
    const filters = {};
    
    if (nome) filters.nomeCliente = { operator: '>=', value: nome };
    if (email) filters.email = { operator: '==', value: email };
    if (cidade) filters.cidade = { operator: '==', value: cidade };
    if (status) filters.status = { operator: '==', value: status };

    const resultado = await database.findWithPagination(
      'clientes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'nomeCliente', direction: 'asc' }
    );

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const cliente = await database.findById('clientes', id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  });

  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    const clienteExistente = await database.findById('clientes', id);
    if (!clienteExistente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    if (dadosAtualizacao.cep) {
      const enderecoCompleto = await this.buscarEnderecoPorCEP(dadosAtualizacao.cep);
      if (enderecoCompleto) {
        dadosAtualizacao = { ...dadosAtualizacao, ...enderecoCompleto };
      }
    }

    const cliente = await database.update('clientes', id, dadosAtualizacao);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: cliente
    });
  });

  excluir = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cliente = await database.findById('clientes', id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    const inscricoesAtivas = await database.findAll('inscricoes', {
      idCliente: { operator: '==', value: id },
      statusInscricao: { operator: '==', value: 'confirmada' }
    });

    if (inscricoesAtivas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir cliente com inscrições ativas'
      });
    }

    await database.delete('clientes', id);

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  });

  buscarCEP = asyncHandler(async (req, res) => {
    const { cep } = req.params;
    
    const endereco = await this.buscarEnderecoPorCEP(cep);
    
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
  });

  obterEstatisticas = asyncHandler(async (req, res) => {
    const clientes = await database.findAll('clientes');
    
    const stats = {
      total: clientes.length,
      ativos: clientes.filter(c => c.status === 'ativo').length,
      inativos: clientes.filter(c => c.status === 'inativo').length,
      porCidade: {}
    };

    clientes.forEach(cliente => {
      if (cliente.cidade) {
        stats.porCidade[cliente.cidade] = (stats.porCidade[cliente.cidade] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  });

  async buscarEnderecoPorCEP(cep) {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
          timeout: 5000
        });
        
        if (response.data && !response.data.erro) {
          return {
            logradouro: response.data.logradouro,
            bairro: response.data.bairro,
            cidade: response.data.localidade,
            estado: response.data.uf
          };
        }
      } catch (error) {
        console.log('ViaCEP falhou, tentando Postmon...');
      }

      try {
        const response = await axios.get(`https://api.postmon.com.br/v1/cep/${cepLimpo}`, {
          timeout: 5000
        });
        
        if (response.data) {
          return {
            logradouro: response.data.logradouro,
            bairro: response.data.distrito,
            cidade: response.data.cidade,
            estado: response.data.estado
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

module.exports = new ClienteController();
