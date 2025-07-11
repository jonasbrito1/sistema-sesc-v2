const database = require('../config/database');
const aiService = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorHandler');

class AvaliacaoController {
  // Criar avaliação
  criar = asyncHandler(async (req, res) => {
    const { idCliente, idAtividade, titulo, comentario, nota, tipo } = req.body;

    // Verificar se cliente existe
    const cliente = await database.findById('clientes', idCliente);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Verificar se atividade existe (se fornecida)
    if (idAtividade) {
      const atividade = await database.findById('atividades', idAtividade);
      if (!atividade) {
        return res.status(404).json({
          success: false,
          message: 'Atividade não encontrada'
        });
      }

      // Verificar se cliente tem inscrição confirmada na atividade
      const inscricao = await database.findAll('inscricoes', {
        idCliente: { operator: '==', value: idCliente },
        idAtividade: { operator: '==', value: idAtividade },
        statusInscricao: { operator: '==', value: 'confirmada' }
      });

      if (inscricao.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cliente deve ter inscrição confirmada para avaliar a atividade'
        });
      }
    }

    const avaliacao = await database.create('avaliacoes', {
      idCliente,
      idAtividade: idAtividade || null,
      titulo,
      comentario,
      nota,
      tipo,
      respondida: false
    });

    res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: avaliacao
    });
  });

  // Listar avaliações
  listar = asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      idCliente, 
      idAtividade, 
      tipo,
      nota,
      respondida 
    } = req.query;
    
    const filters = {};
    
    if (idCliente) {
      filters.idCliente = { operator: '==', value: idCliente };
    }
    if (idAtividade) {
      filters.idAtividade = { operator: '==', value: idAtividade };
    }
    if (tipo) {
      filters.tipo = { operator: '==', value: tipo };
    }
    if (nota) {
      filters.nota = { operator: '==', value: parseInt(nota) };
    }
    if (respondida !== undefined) {
      filters.respondida = { operator: '==', value: respondida === 'true' };
    }

    const resultado = await database.findWithPagination(
      'avaliacoes',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'dataCriacao', direction: 'desc' }
    );

    // Buscar dados do cliente e atividade para cada avaliação
    for (let avaliacao of resultado.data) {
      const cliente = await database.findById('clientes', avaliacao.idCliente);
      avaliacao.cliente = cliente;
      
      if (avaliacao.idAtividade) {
        const atividade = await database.findById('atividades', avaliacao.idAtividade);
        avaliacao.atividade = atividade;
      }
    }

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  // Responder avaliação
  responder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { resposta, gerarComIA = false } = req.body;

    const avaliacao = await database.findById('avaliacoes', id);
    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    let respostaFinal = resposta;

    // Gerar resposta com IA se solicitado
    if (gerarComIA && !resposta) {
      try {
        respostaFinal = await aiService.gerarRespostaAvaliacao(avaliacao);
      } catch (error) {
        console.error('Erro ao gerar resposta com IA:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao gerar resposta automática'
        });
      }
    }

    const avaliacaoAtualizada = await database.update('avaliacoes', id, {
      resposta: respostaFinal,
      dataResposta: new Date(),
      respondida: true
    });

    res.json({
      success: true,
      message: 'Resposta enviada com sucesso',
      data: avaliacaoAtualizada
    });
  });

  // Buscar avaliação por ID
  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const avaliacao = await database.findById('avaliacoes', id);
    
    if (!avaliacao) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Buscar dados do cliente e atividade
    const cliente = await database.findById('clientes', avaliacao.idCliente);
    avaliacao.cliente = cliente;
    
    if (avaliacao.idAtividade) {
      const atividade = await database.findById('atividades', avaliacao.idAtividade);
      avaliacao.atividade = atividade;
    }

    res.json({
      success: true,
      data: avaliacao
    });
  });

  // Estatísticas de avaliações
  estatisticas = asyncHandler(async (req, res) => {
    const { idAtividade, unidadeSesc } = req.query;

    let filters = {};
    if (idAtividade) {
      filters.idAtividade = { operator: '==', value: idAtividade };
    }

    const avaliacoes = await database.findAll('avaliacoes', filters);

    // Filtrar por unidade se especificado
    let avaliacoesFiltradas = avaliacoes;
    if (unidadeSesc) {
      avaliacoesFiltradas = [];
      for (let avaliacao of avaliacoes) {
        if (avaliacao.idAtividade) {
          const atividade = await database.findById('atividades', avaliacao.idAtividade);
          if (atividade && atividade.unidadeSesc === unidadeSesc) {
            avaliacoesFiltradas.push(avaliacao);
          }
        } else {
          // Avaliações gerais (sem atividade específica)
          avaliacoesFiltradas.push(avaliacao);
        }
      }
    }

    const estatisticas = {
      totalAvaliacoes: avaliacoesFiltradas.length,
      avaliacoesPorTipo: {
        elogio: avaliacoesFiltradas.filter(a => a.tipo === 'elogio').length,
        critica: avaliacoesFiltradas.filter(a => a.tipo === 'critica').length,
        sugestao: avaliacoesFiltradas.filter(a => a.tipo === 'sugestao').length
      },
      avaliacoesPorNota: {
        1: avaliacoesFiltradas.filter(a => a.nota === 1).length,
        2: avaliacoesFiltradas.filter(a => a.nota === 2).length,
        3: avaliacoesFiltradas.filter(a => a.nota === 3).length,
        4: avaliacoesFiltradas.filter(a => a.nota === 4).length,
        5: avaliacoesFiltradas.filter(a => a.nota === 5).length
      },
      mediaNotas: avaliacoesFiltradas.length > 0 
        ? (avaliacoesFiltradas.reduce((sum, a) => sum + a.nota, 0) / avaliacoesFiltradas.length).toFixed(2)
        : 0,
      percentualRespondidas: avaliacoesFiltradas.length > 0 
        ? ((avaliacoesFiltradas.filter(a => a.respondida).length / avaliacoesFiltradas.length) * 100).toFixed(2)
        : 0
    };

    res.json({
      success: true,
      data: estatisticas
    });
  });

  // Análise de sentimentos das avaliações
  analiseSentimentos = asyncHandler(async (req, res) => {
    const { idAtividade, unidadeSesc } = req.query;

    let filters = {};
    if (idAtividade) {
      filters.idAtividade = { operator: '==', value: idAtividade };
    }

    const avaliacoes = await database.findAll('avaliacoes', filters);

    // Filtrar por unidade se especificado
    let avaliacoesFiltradas = avaliacoes;
    if (unidadeSesc) {
      avaliacoesFiltradas = [];
      for (let avaliacao of avaliacoes) {
        if (avaliacao.idAtividade) {
          const atividade = await database.findById('atividades', avaliacao.idAtividade);
          if (atividade && atividade.unidadeSesc === unidadeSesc) {
            avaliacoesFiltradas.push(avaliacao);
          }
        }
      }
    }

    const sentimentos = await aiService.analisarSentimentoAvaliacoes(avaliacoesFiltradas);

    const analise = {
      totalAnalisadas: sentimentos.length,
      distribuicaoSentimentos: {
        positivo: sentimentos.filter(s => s.sentimento === 'positivo').length,
        neutro: sentimentos.filter(s => s.sentimento === 'neutro').length,
        negativo: sentimentos.filter(s => s.sentimento === 'negativo').length
      },
      sentimentos
    };

    res.json({
      success: true,
      data: analise
    });
  });
}

module.exports = new AvaliacaoController();