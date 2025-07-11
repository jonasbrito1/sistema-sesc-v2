const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class AvaliacaoController {
  criar = asyncHandler(async (req, res) => {
    const dadosAvaliacao = req.body;

    dadosAvaliacao.ipOrigem = req.ip || req.connection.remoteAddress;
    dadosAvaliacao.userAgent = req.get('User-Agent');

    const avaliacao = await database.create('avaliacoes', {
      ...dadosAvaliacao,
      status: 'pendente',
      publico: false,
      prioridade: 'normal'
    });

    res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: avaliacao
    });
  });

  listar = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, tipo, categoria, status, prioridade } = req.query;
    
    const filters = {};
    
    if (tipo) filters.tipo = { operator: '==', value: tipo };
    if (categoria) filters.categoria = { operator: '==', value: categoria };
    if (status) filters.status = { operator: '==', value: status };
    if (prioridade) filters.prioridade = { operator: '==', value: prioridade };

    const resultado = await database.findWithPagination(
      'avaliacoes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataCriacao', direction: 'desc' }
    );

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const avaliacao = await database.findById('avaliacoes', id);
    
    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    res.json({
      success: true,
      data: avaliacao
    });
  });

  responder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { resposta, respondidoPor } = req.body;

    const avaliacao = await database.findById('avaliacoes', id);
    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    const avaliacaoAtualizada = await database.update('avaliacoes', id, {
      resposta,
      respondidoPor: respondidoPor || 'Administrador',
      dataResposta: new Date().toISOString(),
      status: 'respondida'
    });

    res.json({
      success: true,
      message: 'Resposta adicionada com sucesso',
      data: avaliacaoAtualizada
    });
  });

  buscarPendentes = asyncHandler(async (req, res) => {
    const { prioridade } = req.query;

    const filters = { status: { operator: '==', value: 'pendente' } };
    if (prioridade) filters.prioridade = { operator: '==', value: prioridade };

    const avaliacoes = await database.findAll('avaliacoes', filters);

    res.json({
      success: true,
      data: avaliacoes
    });
  });

  obterEstatisticas = asyncHandler(async (req, res) => {
    const avaliacoes = await database.findAll('avaliacoes');
    
    const stats = {
      total: avaliacoes.length,
      pendentes: avaliacoes.filter(a => a.status === 'pendente').length,
      respondidas: avaliacoes.filter(a => a.status === 'respondida').length,
      porTipo: {
        elogio: avaliacoes.filter(a => a.tipo === 'elogio').length,
        critica: avaliacoes.filter(a => a.tipo === 'critica').length,
        sugestao: avaliacoes.filter(a => a.tipo === 'sugestao').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new AvaliacaoController();
