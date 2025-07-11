const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class InscricaoController {
  criar = asyncHandler(async (req, res) => {
    const dadosInscricao = req.body;

    const [cliente, atividade] = await Promise.all([
      database.findById('clientes', dadosInscricao.idCliente),
      database.findById('atividades', dadosInscricao.idAtividade)
    ]);

    if (!cliente) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    if (!atividade) {
      return res.status(400).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    const vagasDisponiveis = (atividade.vagasTotal || 0) - (atividade.vagasOcupadas || 0);
    if (vagasDisponiveis <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Não há vagas disponíveis para esta atividade'
      });
    }

    const inscricao = await database.create('inscricoes', {
      ...dadosInscricao,
      statusInscricao: 'pendente',
      dataInscricao: new Date().toISOString()
    });

    await database.update('atividades', dadosInscricao.idAtividade, {
      vagasOcupadas: (atividade.vagasOcupadas || 0) + 1
    });

    res.status(201).json({
      success: true,
      message: 'Inscrição criada com sucesso',
      data: inscricao
    });
  });

  listar = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, idCliente, idAtividade } = req.query;
    
    const filters = {};
    
    if (status) filters.statusInscricao = { operator: '==', value: status };
    if (idCliente) filters.idCliente = { operator: '==', value: idCliente };
    if (idAtividade) filters.idAtividade = { operator: '==', value: idAtividade };

    const resultado = await database.findWithPagination(
      'inscricoes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataInscricao', direction: 'desc' }
    );

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const inscricao = await database.findById('inscricoes', id);
    
    if (!inscricao) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada'
      });
    }

    const [cliente, atividade] = await Promise.all([
      database.findById('clientes', inscricao.idCliente),
      database.findById('atividades', inscricao.idAtividade)
    ]);

    inscricao.cliente = cliente;
    inscricao.atividade = atividade;

    res.json({
      success: true,
      data: inscricao
    });
  });

  confirmar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const inscricao = await database.findById('inscricoes', id);
    if (!inscricao) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada'
      });
    }

    const inscricaoAtualizada = await database.update('inscricoes', id, {
      statusInscricao: 'confirmada',
      dataConfirmacao: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Inscrição confirmada com sucesso',
      data: inscricaoAtualizada
    });
  });

  cancelar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;

    const inscricao = await database.findById('inscricoes', id);
    if (!inscricao) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada'
      });
    }

    const inscricaoAtualizada = await database.update('inscricoes', id, {
      statusInscricao: 'cancelada',
      dataCancelamento: new Date().toISOString(),
      motivoCancelamento: motivo
    });

    if (inscricao.statusInscricao === 'confirmada') {
      const atividade = await database.findById('atividades', inscricao.idAtividade);
      await database.update('atividades', inscricao.idAtividade, {
        vagasOcupadas: Math.max(0, (atividade.vagasOcupadas || 0) - 1)
      });
    }

    res.json({
      success: true,
      message: 'Inscrição cancelada com sucesso',
      data: inscricaoAtualizada
    });
  });

  buscarPorCliente = asyncHandler(async (req, res) => {
    const { idCliente } = req.params;
    const { status } = req.query;

    const filters = { idCliente: { operator: '==', value: idCliente } };
    if (status) filters.statusInscricao = { operator: '==', value: status };

    const inscricoes = await database.findAll('inscricoes', filters);

    res.json({
      success: true,
      data: inscricoes
    });
  });

  buscarPorAtividade = asyncHandler(async (req, res) => {
    const { idAtividade } = req.params;
    const { status } = req.query;

    const filters = { idAtividade: { operator: '==', value: idAtividade } };
    if (status) filters.statusInscricao = { operator: '==', value: status };

    const inscricoes = await database.findAll('inscricoes', filters);

    res.json({
      success: true,
      data: inscricoes
    });
  });

  obterEstatisticas = asyncHandler(async (req, res) => {
    const inscricoes = await database.findAll('inscricoes');
    
    const stats = {
      total: inscricoes.length,
      pendentes: inscricoes.filter(i => i.statusInscricao === 'pendente').length,
      confirmadas: inscricoes.filter(i => i.statusInscricao === 'confirmada').length,
      canceladas: inscricoes.filter(i => i.statusInscricao === 'cancelada').length
    };

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new InscricaoController();
