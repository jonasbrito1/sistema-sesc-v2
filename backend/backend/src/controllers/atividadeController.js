const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class AtividadeController {
  criar = asyncHandler(async (req, res) => {
    const dadosAtividade = req.body;

    const responsavel = await database.findById('responsaveis', dadosAtividade.idResponsavel);
    if (!responsavel) {
      return res.status(400).json({
        success: false,
        message: 'Responsável não encontrado'
      });
    }

    const atividade = await database.create('atividades', {
      ...dadosAtividade,
      status: 'ativa',
      vagasOcupadas: 0
    });

    res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: atividade
    });
  });

  listar = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, nome, unidade, status, categoria } = req.query;
    
    const filters = {};
    
    if (nome) filters.nomeAtividade = { operator: '>=', value: nome };
    if (unidade) filters.unidadeSesc = { operator: '==', value: unidade };
    if (status) filters.status = { operator: '==', value: status };
    if (categoria) filters.categoria = { operator: '==', value: categoria };

    const resultado = await database.findWithPagination(
      'atividades',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'nomeAtividade', direction: 'asc' }
    );

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const atividade = await database.findById('atividades', id);
    
    if (!atividade) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    const responsavel = await database.findById('responsaveis', atividade.idResponsavel);
    atividade.responsavel = responsavel;

    res.json({
      success: true,
      data: atividade
    });
  });

  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    const atividadeExistente = await database.findById('atividades', id);
    if (!atividadeExistente) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    if (dadosAtualizacao.idResponsavel) {
      const responsavel = await database.findById('responsaveis', dadosAtualizacao.idResponsavel);
      if (!responsavel) {
        return res.status(400).json({
          success: false,
          message: 'Responsável não encontrado'
        });
      }
    }

    const atividade = await database.update('atividades', id, dadosAtualizacao);

    res.json({
      success: true,
      message: 'Atividade atualizada com sucesso',
      data: atividade
    });
  });

  excluir = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const atividade = await database.findById('atividades', id);
    if (!atividade) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    const inscricoesAtivas = await database.findAll('inscricoes', {
      idAtividade: { operator: '==', value: id },
      statusInscricao: { operator: '==', value: 'confirmada' }
    });

    if (inscricoesAtivas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir atividade com inscrições ativas'
      });
    }

    await database.delete('atividades', id);

    res.json({
      success: true,
      message: 'Atividade excluída com sucesso'
    });
  });

  obterEstatisticas = asyncHandler(async (req, res) => {
    const atividades = await database.findAll('atividades');
    
    const stats = {
      total: atividades.length,
      ativas: atividades.filter(a => a.status === 'ativa').length,
      inativas: atividades.filter(a => a.status === 'inativa').length,
      porUnidade: {}
    };

    atividades.forEach(atividade => {
      if (atividade.unidadeSesc) {
        stats.porUnidade[atividade.unidadeSesc] = (stats.porUnidade[atividade.unidadeSesc] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new AtividadeController();
