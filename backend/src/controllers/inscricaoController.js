const database = require('../config/database');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../middleware/errorHandler');

class InscricaoController {
  // Criar inscrição
  criar = asyncHandler(async (req, res) => {
    const { idCliente, idAtividade, observacoes } = req.body;

    // Verificar se cliente existe
    const cliente = await database.findById('clientes', idCliente);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Verificar se atividade existe e está ativa
    const atividade = await database.findById('atividades', idAtividade);
    if (!atividade) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    if (atividade.status !== 'ativa') {
      return res.status(400).json({
        success: false,
        message: 'Atividade não está disponível para inscrição'
      });
    }

    // Verificar se há vagas disponíveis
    if (atividade.vagasOcupadas >= atividade.vagas) {
      return res.status(400).json({
        success: false,
        message: 'Não há vagas disponíveis para esta atividade'
      });
    }

    // Verificar se cliente já está inscrito na atividade
    const inscricaoExistente = await database.findAll('inscricoes', {
      idCliente: { operator: '==', value: idCliente },
      idAtividade: { operator: '==', value: idAtividade },
      statusInscricao: { operator: 'in', value: ['pendente', 'confirmada'] }
    });

    if (inscricaoExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cliente já inscrito nesta atividade'
      });
    }

    // Verificar conflito de horários (se a atividade for no mesmo período)
    const inscricoesCliente = await database.findAll('inscricoes', {
      idCliente: { operator: '==', value: idCliente },
      statusInscricao: { operator: '==', value: 'confirmada' }
    });

    for (let inscricao of inscricoesCliente) {
      const atividadeInscrita = await database.findById('atividades', inscricao.idAtividade);
      if (this.verificarConflitoPeriodo(atividade, atividadeInscrita)) {
        return res.status(400).json({
          success: false,
          message: `Conflito de horário com a atividade: ${atividadeInscrita.nomeAtividade}`
        });
      }
    }

    // Criar transação para inscrição + atualizar vagas
    const inscricaoData = {
      idCliente,
      idAtividade,
      dataInscricao: new Date(),
      statusInscricao: 'pendente',
      valorPago: atividade.preco,
      observacoes: observacoes || ''
    };

    const operacoes = [
      {
        type: 'create',
        collection: 'inscricoes',
        id: database.db.collection('inscricoes').doc().id,
        data: inscricaoData
      },
      {
        type: 'update',
        collection: 'atividades',
        id: idAtividade,
        data: { vagasOcupadas: atividade.vagasOcupadas + 1 }
      }
    ];

    const resultados = await database.runTransaction(operacoes);
    const inscricao = resultados[0];

    // Enviar email de confirmação
    try {
      await emailService.enviarEmailConfirmacaoInscricao(cliente, atividade, inscricao);
    } catch (error) {
      console.error('Erro ao enviar email de confirmação:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso',
      data: inscricao
    });
  });

  // Confirmar inscrição
  confirmar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const inscricao = await database.findById('inscricoes', id);
    if (!inscricao) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada'
      });
    }

    if (inscricao.statusInscricao === 'confirmada') {
      return res.status(400).json({
        success: false,
        message: 'Inscrição já confirmada'
      });
    }

    const inscricaoAtualizada = await database.update('inscricoes', id, {
      statusInscricao: 'confirmada',
      dataConfirmacao: new Date()
    });

    res.json({
      success: true,
      message: 'Inscrição confirmada com sucesso',
      data: inscricaoAtualizada
    });
  });

  // Cancelar inscrição
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

    if (inscricao.statusInscricao === 'cancelada') {
      return res.status(400).json({
        success: false,
        message: 'Inscrição já cancelada'
      });
    }

    // Buscar atividade para liberar vaga
    const atividade = await database.findById('atividades', inscricao.idAtividade);
    
    // Transação para cancelar + liberar vaga
    const operacoes = [
      {
        type: 'update',
        collection: 'inscricoes',
        id: id,
        data: {
          statusInscricao: 'cancelada',
          dataCancelamento: new Date(),
          motivoCancelamento: motivo || ''
        }
      },
      {
        type: 'update',
        collection: 'atividades',
        id: inscricao.idAtividade,
        data: { vagasOcupadas: Math.max(0, atividade.vagasOcupadas - 1) }
      }
    ];

    const resultados = await database.runTransaction(operacoes);
    
    // Enviar email de cancelamento
    try {
      const cliente = await database.findById('clientes', inscricao.idCliente);
      await emailService.enviarEmailCancelamento(cliente, atividade, inscricao);
    } catch (error) {
      console.error('Erro ao enviar email de cancelamento:', error);
    }

    res.json({
      success: true,
      message: 'Inscrição cancelada com sucesso',
      data: resultados[0]
    });
  });

  // Listar inscrições
  listar = asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      idCliente, 
      idAtividade, 
      status,
      dataInicio,
      dataFim 
    } = req.query;
    
    const filters = {};
    
    if (idCliente) {
      filters.idCliente = { operator: '==', value: idCliente };
    }
    if (idAtividade) {
      filters.idAtividade = { operator: '==', value: idAtividade };
    }
    if (status) {
      filters.statusInscricao = { operator: '==', value: status };
    }
    if (dataInicio) {
      filters.dataInscricao = { operator: '>=', value: new Date(dataInicio) };
    }
    if (dataFim) {
      filters.dataInscricao = { operator: '<=', value: new Date(dataFim) };
    }

    const resultado = await database.findWithPagination(
      'inscricoes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataInscricao', direction: 'desc' }
    );

    // Buscar dados do cliente e atividade para cada inscrição
    for (let inscricao of resultado.data) {
      const cliente = await database.findById('clientes', inscricao.idCliente);
      const atividade = await database.findById('atividades', inscricao.idAtividade);
      inscricao.cliente = cliente;
      inscricao.atividade = atividade;
    }

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  // Buscar inscrição por ID
  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const inscricao = await database.findById('inscricoes', id);
    
    if (!inscricao) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada'
      });
    }

    // Buscar dados do cliente e atividade
    const cliente = await database.findById('clientes', inscricao.idCliente);
    const atividade = await database.findById('atividades', inscricao.idAtividade);
    
    inscricao.cliente = cliente;
    inscricao.atividade = atividade;

    res.json({
      success: true,
      data: inscricao
    });
  });

  // Listar inscrições do cliente
  listarPorCliente = asyncHandler(async (req, res) => {
    const { idCliente } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filters = {
      idCliente: { operator: '==', value: idCliente }
    };

    if (status) {
      filters.statusInscricao = { operator: '==', value: status };
    }

    const resultado = await database.findWithPagination(
      'inscricoes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataInscricao', direction: 'desc' }
    );

    // Buscar dados da atividade para cada inscrição
    for (let inscricao of resultado.data) {
      const atividade = await database.findById('atividades', inscricao.idAtividade);
      inscricao.atividade = atividade;
    }

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  // Listar inscrições da atividade
  listarPorAtividade = asyncHandler(async (req, res) => {
    const { idAtividade } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filters = {
      idAtividade: { operator: '==', value: idAtividade }
    };

    if (status) {
      filters.statusInscricao = { operator: '==', value: status };
    }

    const resultado = await database.findWithPagination(
      'inscricoes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataInscricao', direction: 'desc' }
    );

    // Buscar dados do cliente para cada inscrição
    for (let inscricao of resultado.data) {
      const cliente = await database.findById('clientes', inscricao.idCliente);
      inscricao.cliente = cliente;
    }

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  // Relatório de inscrições
  relatorio = asyncHandler(async (req, res) => {
    const { 
      dataInicio, 
      dataFim, 
      unidadeSesc, 
      tipoRelatorio = 'geral' 
    } = req.query;

    const filters = {};
    
    if (dataInicio) {
      filters.dataInscricao = { operator: '>=', value: new Date(dataInicio) };
    }
    if (dataFim) {
      filters.dataInscricao = { operator: '<=', value: new Date(dataFim) };
    }

    const inscricoes = await database.findAll('inscricoes', filters);

    // Filtrar por unidade se especificado
    let inscricoesFiltradas = inscricoes;
    if (unidadeSesc) {
      inscricoesFiltradas = [];
      for (let inscricao of inscricoes) {
        const atividade = await database.findById('atividades', inscricao.idAtividade);
        if (atividade && atividade.unidadeSesc === unidadeSesc) {
          inscricoesFiltradas.push(inscricao);
        }
      }
    }

    const relatorio = {
      periodo: { dataInicio, dataFim },
      unidadeSesc,
      totalInscricoes: inscricoesFiltradas.length,
      inscricoesPorStatus: {
        pendente: inscricoesFiltradas.filter(i => i.statusInscricao === 'pendente').length,
        confirmada: inscricoesFiltradas.filter(i => i.statusInscricao === 'confirmada').length,
        cancelada: inscricoesFiltradas.filter(i => i.statusInscricao === 'cancelada').length
      },
      receitaTotal: inscricoesFiltradas
        .filter(i => i.statusInscricao === 'confirmada')
        .reduce((sum, i) => sum + (i.valorPago || 0), 0)
    };

    if (tipoRelatorio === 'detalhado') {
      relatorio.inscricoes = inscricoesFiltradas;
    }

    res.json({
      success: true,
      data: relatorio
    });
  });

  // Verificar conflito de período entre atividades
  verificarConflitoPeriodo(atividade1, atividade2) {
    const inicio1 = new Date(atividade1.dataInicio);
    const fim1 = new Date(atividade1.dataFim);
    const inicio2 = new Date(atividade2.dataInicio);
    const fim2 = new Date(atividade2.dataFim);

    return (inicio1 <= fim2 && fim1 >= inicio2);
  }
}

module.exports = new InscricaoController();