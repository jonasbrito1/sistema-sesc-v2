const database = require('../config/database');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../middleware/errorHandler');

class AtividadeController {
  // Criar atividade
  criar = asyncHandler(async (req, res) => {
    const dadosAtividade = req.body;

    // Verificar se responsável existe
    const responsavel = await database.findById('responsaveis', dadosAtividade.idResponsavel);
    if (!responsavel) {
      return res.status(404).json({
        success: false,
        message: 'Responsável não encontrado'
      });
    }

    const atividade = await database.create('atividades', {
      ...dadosAtividade,
      vagasOcupadas: 0,
      status: 'ativa'
    });

    // Enviar notificação para clientes interessados (opcional)
    // await this.notificarClientesNovaAtividade(atividade);

    res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: atividade
    });
  });

  // Listar atividades
  listar = asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      nome, 
      unidade, 
      status, 
      disponivel,
      dataInicio,
      dataFim 
    } = req.query;
    
    const filters = {};
    
    if (nome) {
      filters.nomeAtividade = { operator: '>=', value: nome };
    }
    if (unidade) {
      filters.unidadeSesc = { operator: '==', value: unidade };
    }
    if (status) {
      filters.status = { operator: '==', value: status };
    }
    if (dataInicio) {
      filters.dataInicio = { operator: '>=', value: new Date(dataInicio) };
    }
    if (dataFim) {
      filters.dataFim = { operator: '<=', value: new Date(dataFim) };
    }

    let resultado = await database.findWithPagination(
      'atividades',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataInicio', direction: 'asc' }
    );

    // Filtrar atividades com vagas disponíveis se solicitado
    if (disponivel === 'true') {
      resultado.data = resultado.data.filter(atividade => 
        atividade.vagasOcupadas < atividade.vagas
      );
    }

    // Buscar dados dos responsáveis
    for (let atividade of resultado.data) {
      const responsavel = await database.findById('responsaveis', atividade.idResponsavel);
      atividade.responsavel = responsavel;
    }

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  // Buscar atividade por ID
  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const atividade = await database.findById('atividades', id);
    
    if (!atividade) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    // Buscar dados do responsável
    const responsavel = await database.findById('responsaveis', atividade.idResponsavel);
    atividade.responsavel = responsavel;

    // Buscar inscrições da atividade
    const inscricoes = await database.findAll('inscricoes', {
      idAtividade: { operator: '==', value: id }
    });
    
    atividade.inscricoes = inscricoes;
    atividade.vagasDisponiveis = atividade.vagas - atividade.vagasOcupadas;

    res.json({
      success: true,
      data: atividade
    });
  });

  // Atualizar atividade
  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    // Verificar se atividade existe
    const atividadeExistente = await database.findById('atividades', id);
    if (!atividadeExistente) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    // Verificar se responsável existe (se foi alterado)
    if (dadosAtualizacao.idResponsavel) {
      const responsavel = await database.findById('responsaveis', dadosAtualizacao.idResponsavel);
      if (!responsavel) {
        return res.status(404).json({
          success: false,
          message: 'Responsável não encontrado'
        });
      }
    }

    // Verificar se a redução de vagas não afeta inscrições confirmadas
    if (dadosAtualizacao.vagas && dadosAtualizacao.vagas < atividadeExistente.vagasOcupadas) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível reduzir vagas abaixo do número de inscrições confirmadas'
      });
    }

    const atividade = await database.update('atividades', id, dadosAtualizacao);

    res.json({
      success: true,
      message: 'Atividade atualizada com sucesso',
      data: atividade
    });
  });

  // Deletar atividade
  deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se atividade existe
    const atividade = await database.findById('atividades', id);
    if (!atividade) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    // Verificar se há inscrições confirmadas
    const inscricoesConfirmadas = await database.findAll('inscricoes', {
      idAtividade: { operator: '==', value: id },
      statusInscricao: { operator: '==', value: 'confirmada' }
    });

    if (inscricoesConfirmadas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar atividade com inscrições confirmadas'
      });
    }

    await database.delete('atividades', id);

    res.json({
      success: true,
      message: 'Atividade deletada com sucesso'
    });
  });

  // Listar atividades por unidade
  listarPorUnidade = asyncHandler(async (req, res) => {
    const { unidade } = req.params;
    const { page = 1, limit = 10, status = 'ativa' } = req.query;

    const resultado = await database.findWithPagination(
      'atividades',
      parseInt(page),
      parseInt(limit),
      {
        unidadeSesc: { operator: '==', value: unidade },
        status: { operator: '==', value: status }
      },
      { field: 'dataInicio', direction: 'asc' }
    );

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  // Estatísticas da atividade
  estatisticas = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se atividade existe
    const atividade = await database.findById('atividades', id);
    if (!atividade) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    // Buscar inscrições
    const inscricoes = await database.findAll('inscricoes', {
      idAtividade: { operator: '==', value: id }
    });

    // Buscar avaliações
    const avaliacoes = await database.findAll('avaliacoes', {
      idAtividade: { operator: '==', value: id }
    });

    const estatisticas = {
      totalInscricoes: inscricoes.length,
      inscricoesConfirmadas: inscricoes.filter(i => i.statusInscricao === 'confirmada').length,
      inscricoesPendentes: inscricoes.filter(i => i.statusInscricao === 'pendente').length,
      inscricoesCanceladas: inscricoes.filter(i => i.statusInscricao === 'cancelada').length,
      vagasDisponiveis: atividade.vagas - atividade.vagasOcupadas,
      percentualOcupacao: ((atividade.vagasOcupadas / atividade.vagas) * 100).toFixed(2),
      totalAvaliacoes: avaliacoes.length,
      mediaAvaliacoes: avaliacoes.length > 0 
        ? (avaliacoes.reduce((sum, av) => sum + av.nota, 0) / avaliacoes.length).toFixed(2)
        : 0,
      receitaTotal: inscricoes
        .filter(i => i.statusInscricao === 'confirmada')
        .reduce((sum, i) => sum + (i.valorPago || atividade.preco), 0)
    };

    res.json({
      success: true,
      data: estatisticas
    });
  });

  // Notificar clientes sobre nova atividade
  notificarClientesNovaAtividade = async (atividade) => {
    try {
      // Buscar clientes ativos
      const clientes = await database.findAll('clientes', {
        status: { operator: '==', value: 'ativo' }
      });

      // Enviar emails em lotes para não sobrecarregar
      const batchSize = 10;
      for (let i = 0; i < clientes.length; i += batchSize) {
        const batch = clientes.slice(i, i + batchSize);
        const promises = batch.map(cliente => 
          emailService.enviarEmailNovaAtividade(cliente, atividade)
            .catch(error => console.error(`Erro ao enviar email para ${cliente.email}:`, error))
        );
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Erro ao notificar clientes:', error);
    }
  };
}

module.exports = new AtividadeController();