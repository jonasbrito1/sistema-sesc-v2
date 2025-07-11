// backend/src/models/Avaliacao.js
const { db } = require('../config/firebase');
const { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  where,
  orderBy,
  limit 
} = require('firebase/firestore');

class Avaliacao {
  constructor() {
    this.collectionName = 'avaliacoes';
  }

  /**
   * Criar nova avaliação
   */
  async criar(dadosAvaliacao) {
    try {
      // Validar dados antes de criar
      const erros = this.validarDados(dadosAvaliacao);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      const avaliacao = {
        ID_CLIENTE: dadosAvaliacao.ID_CLIENTE || null,
        ID_ATIVIDADE: dadosAvaliacao.ID_ATIVIDADE || null,
        NOME_AVALIADOR: dadosAvaliacao.NOME_AVALIADOR || 'Anônimo',
        EMAIL_AVALIADOR: dadosAvaliacao.EMAIL_AVALIADOR || '',
        TIPO: dadosAvaliacao.TIPO, // CRITICA, SUGESTAO, ELOGIO
        CATEGORIA: dadosAvaliacao.CATEGORIA || 'GERAL', // PORTAL, ATIVIDADE, ATENDIMENTO, INSTALACOES, etc.
        TITULO: dadosAvaliacao.TITULO,
        MENSAGEM: dadosAvaliacao.MENSAGEM,
        NOTA: dadosAvaliacao.NOTA || null, // 1-5 estrelas
        STATUS: 'PENDENTE', // PENDENTE, RESPONDIDA, ARQUIVADA
        PRIORIDADE: dadosAvaliacao.PRIORIDADE || 'NORMAL', // BAIXA, NORMAL, ALTA, URGENTE
        PUBLICO: dadosAvaliacao.PUBLICO || false, // Se pode ser exibida publicamente
        ANONIMA: dadosAvaliacao.ANONIMA || false,
        IP_ORIGEM: dadosAvaliacao.IP_ORIGEM || '',
        USER_AGENT: dadosAvaliacao.USER_AGENT || '',
        DATA_CRIACAO: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), avaliacao);
      
      return { 
        ID_AVALIACAO: docRef.id, 
        ...avaliacao,
        success: true,
        message: 'Avaliação enviada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw new Error(`Erro ao criar avaliação: ${error.message}`);
    }
  }

  /**
   * Buscar todas as avaliações
   */
  async buscarTodos(filtros = {}) {
    try {
      let q = collection(db, this.collectionName);
      
      // Aplicar filtros
      if (filtros.tipo) {
        q = query(q, where("TIPO", "==", filtros.tipo));
      }
      
      if (filtros.categoria) {
        q = query(q, where("CATEGORIA", "==", filtros.categoria));
      }

      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }

      if (filtros.prioridade) {
        q = query(q, where("PRIORIDADE", "==", filtros.prioridade));
      }

      if (filtros.publico !== undefined) {
        q = query(q, where("PUBLICO", "==", filtros.publico));
      }

      if (filtros.idAtividade) {
        q = query(q, where("ID_ATIVIDADE", "==", filtros.idAtividade));
      }

      if (filtros.idCliente) {
        q = query(q, where("ID_CLIENTE", "==", filtros.idCliente));
      }

      // Ordenar
      const ordenacao = filtros.ordenacao || 'DATA_CRIACAO';
      const direcao = filtros.direcao || 'desc';
      q = query(q, orderBy(ordenacao, direcao));

      // Limitar resultados
      if (filtros.limite) {
        q = query(q, limit(parseInt(filtros.limite)));
      }

      const querySnapshot = await getDocs(q);
      const avaliacoes = querySnapshot.docs.map(docSnapshot => ({
        ID_AVALIACAO: docSnapshot.id,
        ...docSnapshot.data()
      }));

      return {
        success: true,
        data: avaliacoes,
        total: avaliacoes.length
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      throw new Error(`Erro ao buscar avaliações: ${error.message}`);
    }
  }

  /**
   * Buscar avaliação por ID
   */
  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            ID_AVALIACAO: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          message: 'Avaliação não encontrada'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      throw new Error(`Erro ao buscar avaliação: ${error.message}`);
    }
  }

  /**
   * Buscar avaliações públicas
   */
  async buscarPublicas(filtros = {}) {
    try {
      const filtrosPublicos = {
        ...filtros,
        publico: true,
        status: 'RESPONDIDA'
      };

      return await this.buscarTodos(filtrosPublicos);
    } catch (error) {
      console.error('Erro ao buscar avaliações públicas:', error);
      throw new Error(`Erro ao buscar avaliações públicas: ${error.message}`);
    }
  }

  /**
   * Buscar avaliações por atividade
   */
  async buscarPorAtividade(idAtividade, filtros = {}) {
    try {
      const filtrosAtividade = {
        ...filtros,
        idAtividade
      };

      return await this.buscarTodos(filtrosAtividade);
    } catch (error) {
      console.error('Erro ao buscar avaliações por atividade:', error);
      throw new Error(`Erro ao buscar avaliações por atividade: ${error.message}`);
    }
  }

  /**
   * Buscar avaliações por cliente
   */
  async buscarPorCliente(idCliente, filtros = {}) {
    try {
      const filtrosCliente = {
        ...filtros,
        idCliente
      };

      return await this.buscarTodos(filtrosCliente);
    } catch (error) {
      console.error('Erro ao buscar avaliações por cliente:', error);
      throw new Error(`Erro ao buscar avaliações por cliente: ${error.message}`);
    }
  }

  /**
   * Atualizar avaliação
   */
  async atualizar(id, dadosAtualizados) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      // Verificar se avaliação existe
      const avaliacaoExistente = await this.buscarPorId(id);
      if (!avaliacaoExistente.success) {
        throw new Error('Avaliação não encontrada');
      }

      // Remover campos que não devem ser atualizados
      const { ID_AVALIACAO, DATA_CRIACAO, ...dadosParaAtualizar } = dadosAtualizados;
      
      dadosParaAtualizar.DATA_ATUALIZACAO = new Date().toISOString();

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dadosParaAtualizar);
      
      return {
        success: true,
        data: {
          ID_AVALIACAO: id,
          ...avaliacaoExistente.data,
          ...dadosParaAtualizar
        },
        message: 'Avaliação atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw new Error(`Erro ao atualizar avaliação: ${error.message}`);
    }
  }

  /**
   * Responder avaliação
   */
  async responder(id, dadosResposta) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const avaliacaoExistente = await this.buscarPorId(id);
      if (!avaliacaoExistente.success) {
        throw new Error('Avaliação não encontrada');
      }

      const resposta = {
        STATUS: 'RESPONDIDA',
        RESPOSTA: dadosResposta.RESPOSTA,
        RESPONDIDO_POR: dadosResposta.RESPONDIDO_POR,
        DATA_RESPOSTA: new Date().toISOString(),
        RESPOSTA_AUTOMATICA: dadosResposta.RESPOSTA_AUTOMATICA || false,
        DATA_ATUALIZACAO: new Date().toISOString()
      };

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, resposta);
      
      return {
        success: true,
        message: 'Resposta enviada com sucesso',
        data: resposta
      };
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
      throw new Error(`Erro ao responder avaliação: ${error.message}`);
    }
  }

  /**
   * Arquivar avaliação
   */
  async arquivar(id, motivo = '') {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'ARQUIVADA',
        DATA_ARQUIVAMENTO: new Date().toISOString(),
        MOTIVO_ARQUIVAMENTO: motivo,
        DATA_ATUALIZACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Avaliação arquivada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao arquivar avaliação:', error);
      throw new Error(`Erro ao arquivar avaliação: ${error.message}`);
    }
  }

  /**
   * Marcar como pública
   */
  async tornarPublica(id, publico = true) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        PUBLICO: publico,
        DATA_ATUALIZACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: publico ? 'Avaliação marcada como pública' : 'Avaliação marcada como privada'
      };
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      throw new Error(`Erro ao alterar visibilidade: ${error.message}`);
    }
  }

  /**
   * Alterar prioridade
   */
  async alterarPrioridade(id, prioridade) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const prioridadesValidas = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];
      if (!prioridadesValidas.includes(prioridade)) {
        throw new Error('Prioridade inválida');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        PRIORIDADE: prioridade,
        DATA_ATUALIZACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: `Prioridade alterada para ${prioridade}`
      };
    } catch (error) {
      console.error('Erro ao alterar prioridade:', error);
      throw new Error(`Erro ao alterar prioridade: ${error.message}`);
    }
  }

  /**
   * Excluir avaliação
   */
  async excluir(id) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Avaliação excluída permanentemente'
      };
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      throw new Error(`Erro ao excluir avaliação: ${error.message}`);
    }
  }

  /**
   * Validar dados da avaliação
   */
  validarDados(dados) {
    const erros = [];

    // Campos obrigatórios
    if (!dados.TIPO || dados.TIPO.trim() === '') {
      erros.push('Tipo da avaliação é obrigatório');
    }

    if (!dados.TITULO || dados.TITULO.trim() === '') {
      erros.push('Título é obrigatório');
    }

    if (!dados.MENSAGEM || dados.MENSAGEM.trim() === '') {
      erros.push('Mensagem é obrigatória');
    }

    // Validações de tipo
    const tiposValidos = ['CRITICA', 'SUGESTAO', 'ELOGIO'];
    if (dados.TIPO && !tiposValidos.includes(dados.TIPO)) {
      erros.push('Tipo deve ser CRITICA, SUGESTAO ou ELOGIO');
    }

    // Validações de prioridade
    const prioridadesValidas = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];
    if (dados.PRIORIDADE && !prioridadesValidas.includes(dados.PRIORIDADE)) {
      erros.push('Prioridade inválida');
    }

    // Validações de nota
    if (dados.NOTA !== undefined && dados.NOTA !== null) {
      if (!Number.isInteger(dados.NOTA) || dados.NOTA < 1 || dados.NOTA > 5) {
        erros.push('Nota deve ser um número inteiro entre 1 e 5');
      }
    }

    // Validação de email
    if (dados.EMAIL_AVALIADOR && !this.validarEmail(dados.EMAIL_AVALIADOR)) {
      erros.push('Email inválido');
    }

    // Validação de tamanho da mensagem
    if (dados.MENSAGEM && dados.MENSAGEM.length > 2000) {
      erros.push('Mensagem deve ter no máximo 2000 caracteres');
    }

    if (dados.TITULO && dados.TITULO.length > 200) {
      erros.push('Título deve ter no máximo 200 caracteres');
    }

    return erros;
  }

  /**
   * Validar email
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Obter estatísticas das avaliações
   */
  async obterEstatisticas() {
    try {
      const avaliacoes = await this.buscarTodos();
      
      // Estatísticas por tipo
      const porTipo = avaliacoes.data.reduce((acc, avaliacao) => {
        const tipo = avaliacao.TIPO;
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por categoria
      const porCategoria = avaliacoes.data.reduce((acc, avaliacao) => {
        const categoria = avaliacao.CATEGORIA || 'GERAL';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por status
      const porStatus = avaliacoes.data.reduce((acc, avaliacao) => {
        const status = avaliacao.STATUS;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por prioridade
      const porPrioridade = avaliacoes.data.reduce((acc, avaliacao) => {
        const prioridade = avaliacao.PRIORIDADE || 'NORMAL';
        acc[prioridade] = (acc[prioridade] || 0) + 1;
        return acc;
      }, {});

      // Média das notas
      const avaliacoesComNota = avaliacoes.data.filter(a => a.NOTA !== null && a.NOTA !== undefined);
      const mediaNota = avaliacoesComNota.length > 0 
        ? (avaliacoesComNota.reduce((acc, a) => acc + a.NOTA, 0) / avaliacoesComNota.length).toFixed(2)
        : 0;

      // Taxa de resposta
      const respondidas = avaliacoes.data.filter(a => a.STATUS === 'RESPONDIDA').length;
      const taxaResposta = avaliacoes.data.length > 0 
        ? ((respondidas / avaliacoes.data.length) * 100).toFixed(2)
        : 0;

      // Avaliações por mês
      const porMes = this.agruparPorMes(avaliacoes.data);

      return {
        success: true,
        data: {
          total: avaliacoes.data.length,
          porTipo,
          porCategoria,
          porStatus,
          porPrioridade,
          mediaNota: parseFloat(mediaNota),
          totalComNota: avaliacoesComNota.length,
          taxaResposta: parseFloat(taxaResposta),
          porMes
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Agrupar avaliações por mês
   */
  agruparPorMes(avaliacoes) {
    const porMes = {};
    
    avaliacoes.forEach(avaliacao => {
      const data = new Date(avaliacao.DATA_CRIACAO);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      porMes[mesAno] = (porMes[mesAno] || 0) + 1;
    });

    return porMes;
  }

  /**
   * Buscar avaliações pendentes de resposta
   */
  async buscarPendentes(prioridade = null) {
    try {
      const filtros = { status: 'PENDENTE' };
      
      if (prioridade) {
        filtros.prioridade = prioridade;
      }

      return await this.buscarTodos(filtros);
    } catch (error) {
      console.error('Erro ao buscar avaliações pendentes:', error);
      throw new Error(`Erro ao buscar avaliações pendentes: ${error.message}`);
    }
  }

  /**
   * Buscar avaliações urgentes
   */
  async buscarUrgentes() {
    try {
      return await this.buscarTodos({ 
        prioridade: 'URGENTE',
        status: 'PENDENTE'
      });
    } catch (error) {
      console.error('Erro ao buscar avaliações urgentes:', error);
      throw new Error(`Erro ao buscar avaliações urgentes: ${error.message}`);
    }
  }

  /**
   * Gerar relatório de avaliações
   */
  async gerarRelatorio(dataInicio, dataFim) {
    try {
      const todasAvaliacoes = await this.buscarTodos();
      
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      const avaliacoesPeriodo = todasAvaliacoes.data.filter(avaliacao => {
        const dataAvaliacao = new Date(avaliacao.DATA_CRIACAO);
        return dataAvaliacao >= inicio && dataAvaliacao <= fim;
      });

      // Estatísticas do período
      const estatisticas = {
        total: avaliacoesPeriodo.length,
        tipos: {},
        categorias: {},
        prioridades: {},
        mediaNota: 0
      };

      avaliacoesPeriodo.forEach(avaliacao => {
        // Contar tipos
        estatisticas.tipos[avaliacao.TIPO] = (estatisticas.tipos[avaliacao.TIPO] || 0) + 1;
        
        // Contar categorias
        const categoria = avaliacao.CATEGORIA || 'GERAL';
        estatisticas.categorias[categoria] = (estatisticas.categorias[categoria] || 0) + 1;
        
        // Contar prioridades
        const prioridade = avaliacao.PRIORIDADE || 'NORMAL';
        estatisticas.prioridades[prioridade] = (estatisticas.prioridades[prioridade] || 0) + 1;
      });

      // Calcular média das notas
      const comNota = avaliacoesPeriodo.filter(a => a.NOTA !== null && a.NOTA !== undefined);
      if (comNota.length > 0) {
        estatisticas.mediaNota = (comNota.reduce((acc, a) => acc + a.NOTA, 0) / comNota.length).toFixed(2);
      }

      return {
        success: true,
        data: {
          periodo: { inicio: dataInicio, fim: dataFim },
          avaliacoes: avaliacoesPeriodo,
          estatisticas
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }

  /**
   * Buscar avaliações por palavra-chave
   */
  async buscarPorPalavraChave(palavraChave, filtros = {}) {
    try {
      const todasAvaliacoes = await this.buscarTodos(filtros);
      const termo = palavraChave.toLowerCase();
      
      const resultado = todasAvaliacoes.data.filter(avaliacao => {
        const titulo = (avaliacao.TITULO || '').toLowerCase();
        const mensagem = (avaliacao.MENSAGEM || '').toLowerCase();
        const resposta = (avaliacao.RESPOSTA || '').toLowerCase();
        
        return titulo.includes(termo) || 
               mensagem.includes(termo) || 
               resposta.includes(termo);
      });

      return {
        success: true,
        data: resultado,
        total: resultado.length
      };
    } catch (error) {
      console.error('Erro na busca por palavra-chave:', error);
      throw new Error(`Erro na busca por palavra-chave: ${error.message}`);
    }
  }
}

module.exports = new Avaliacao();