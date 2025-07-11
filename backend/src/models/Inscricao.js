// backend/src/models/Inscricao.js
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
  limit,
  and 
} = require('firebase/firestore');

class Inscricao {
  constructor() {
    this.collectionName = 'inscricoes';
  }

  /**
   * Criar nova inscrição
   */
  async criar(dadosInscricao) {
    try {
      // Validar dados antes de criar
      const erros = this.validarDados(dadosInscricao);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      // Verificar se já existe inscrição ativa para este cliente/atividade
      const inscricaoExistente = await this.verificarInscricaoExistente(
        dadosInscricao.ID_CLIENTE, 
        dadosInscricao.ID_ATIVIDADE
      );

      if (inscricaoExistente.exists) {
        throw new Error('Cliente já possui inscrição ativa nesta atividade');
      }

      const inscricao = {
        ID_CLIENTE: dadosInscricao.ID_CLIENTE,
        ID_ATIVIDADE: dadosInscricao.ID_ATIVIDADE,
        STATUS: 'ATIVA',
        DATA_INSCRICAO: new Date().toISOString(),
        OBSERVACOES: dadosInscricao.OBSERVACOES || '',
        FORMA_PAGAMENTO: dadosInscricao.FORMA_PAGAMENTO || 'NAO_INFORMADO',
        VALOR_PAGO: dadosInscricao.VALOR_PAGO || 0,
        DATA_PAGAMENTO: dadosInscricao.DATA_PAGAMENTO || null,
        STATUS_PAGAMENTO: dadosInscricao.STATUS_PAGAMENTO || 'PENDENTE',
        PRIORIDADE: dadosInscricao.PRIORIDADE || 'NORMAL', // NORMAL, ALTA, BAIXA
        CANAL_INSCRICAO: dadosInscricao.CANAL_INSCRICAO || 'ONLINE', // ONLINE, PRESENCIAL, TELEFONE
        DATA_CRIACAO: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), inscricao);
      
      return { 
        ID_INSCRICAO: docRef.id, 
        ...inscricao,
        success: true,
        message: 'Inscrição realizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      throw new Error(`Erro ao criar inscrição: ${error.message}`);
    }
  }

  /**
   * Buscar todas as inscrições
   */
  async buscarTodos(filtros = {}) {
    try {
      let q = collection(db, this.collectionName);
      
      // Aplicar filtros
      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }
      
      if (filtros.statusPagamento) {
        q = query(q, where("STATUS_PAGAMENTO", "==", filtros.statusPagamento));
      }

      if (filtros.canal) {
        q = query(q, where("CANAL_INSCRICAO", "==", filtros.canal));
      }

      if (filtros.prioridade) {
        q = query(q, where("PRIORIDADE", "==", filtros.prioridade));
      }

      // Ordenar
      const ordenacao = filtros.ordenacao || 'DATA_INSCRICAO';
      const direcao = filtros.direcao || 'desc';
      q = query(q, orderBy(ordenacao, direcao));

      // Limitar resultados
      if (filtros.limite) {
        q = query(q, limit(parseInt(filtros.limite)));
      }

      const querySnapshot = await getDocs(q);
      const inscricoes = querySnapshot.docs.map(docSnapshot => ({
        ID_INSCRICAO: docSnapshot.id,
        ...docSnapshot.data()
      }));

      return {
        success: true,
        data: inscricoes,
        total: inscricoes.length
      };
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      throw new Error(`Erro ao buscar inscrições: ${error.message}`);
    }
  }

  /**
   * Buscar inscrição por ID
   */
  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            ID_INSCRICAO: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          message: 'Inscrição não encontrada'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar inscrição:', error);
      throw new Error(`Erro ao buscar inscrição: ${error.message}`);
    }
  }

  /**
   * Buscar inscrições por cliente
   */
  async buscarPorCliente(idCliente, filtros = {}) {
    try {
      let q = query(
        collection(db, this.collectionName),
        where("ID_CLIENTE", "==", idCliente)
      );

      // Aplicar filtros adicionais
      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }

      q = query(q, orderBy("DATA_INSCRICAO", "desc"));

      const querySnapshot = await getDocs(q);
      const inscricoes = querySnapshot.docs.map(doc => ({
        ID_INSCRICAO: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: inscricoes,
        total: inscricoes.length
      };
    } catch (error) {
      console.error('Erro ao buscar inscrições por cliente:', error);
      throw new Error(`Erro ao buscar inscrições por cliente: ${error.message}`);
    }
  }

  /**
   * Buscar inscrições por atividade
   */
  async buscarPorAtividade(idAtividade, filtros = {}) {
    try {
      let q = query(
        collection(db, this.collectionName),
        where("ID_ATIVIDADE", "==", idAtividade)
      );

      // Aplicar filtros adicionais
      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }

      q = query(q, orderBy("DATA_INSCRICAO", "asc"));

      const querySnapshot = await getDocs(q);
      const inscricoes = querySnapshot.docs.map(doc => ({
        ID_INSCRICAO: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: inscricoes,
        total: inscricoes.length
      };
    } catch (error) {
      console.error('Erro ao buscar inscrições por atividade:', error);
      throw new Error(`Erro ao buscar inscrições por atividade: ${error.message}`);
    }
  }

  /**
   * Verificar se já existe inscrição ativa
   */
  async verificarInscricaoExistente(idCliente, idAtividade) {
    try {
      const q = query(
        collection(db, this.collectionName),
        and(
          where("ID_CLIENTE", "==", idCliente),
          where("ID_ATIVIDADE", "==", idAtividade),
          where("STATUS", "in", ["ATIVA", "PENDENTE"])
        )
      );

      const querySnapshot = await getDocs(q);
      
      return {
        exists: !querySnapshot.empty,
        data: querySnapshot.empty ? null : {
          ID_INSCRICAO: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        }
      };
    } catch (error) {
      console.error('Erro ao verificar inscrição existente:', error);
      return { exists: false, data: null };
    }
  }

  /**
   * Atualizar inscrição
   */
  async atualizar(id, dadosAtualizados) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      // Verificar se inscrição existe
      const inscricaoExistente = await this.buscarPorId(id);
      if (!inscricaoExistente.success) {
        throw new Error('Inscrição não encontrada');
      }

      // Remover campos que não devem ser atualizados
      const { ID_INSCRICAO, DATA_CRIACAO, DATA_INSCRICAO, ...dadosParaAtualizar } = dadosAtualizados;
      
      dadosParaAtualizar.DATA_ATUALIZACAO = new Date().toISOString();

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dadosParaAtualizar);
      
      return {
        success: true,
        data: {
          ID_INSCRICAO: id,
          ...inscricaoExistente.data,
          ...dadosParaAtualizar
        },
        message: 'Inscrição atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar inscrição:', error);
      throw new Error(`Erro ao atualizar inscrição: ${error.message}`);
    }
  }

  /**
   * Cancelar inscrição
   */
  async cancelar(id, motivo = '') {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      // Verificar se inscrição existe e está ativa
      const inscricaoExistente = await this.buscarPorId(id);
      if (!inscricaoExistente.success) {
        throw new Error('Inscrição não encontrada');
      }

      if (inscricaoExistente.data.STATUS === 'CANCELADA') {
        throw new Error('Inscrição já está cancelada');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'CANCELADA',
        DATA_CANCELAMENTO: new Date().toISOString(),
        MOTIVO_CANCELAMENTO: motivo,
        DATA_ATUALIZACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Inscrição cancelada com sucesso',
        data: {
          ID_INSCRICAO: id,
          STATUS: 'CANCELADA'
        }
      };
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      throw new Error(`Erro ao cancelar inscrição: ${error.message}`);
    }
  }

  /**
   * Confirmar inscrição
   */
  async confirmar(id) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const inscricaoExistente = await this.buscarPorId(id);
      if (!inscricaoExistente.success) {
        throw new Error('Inscrição não encontrada');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'CONFIRMADA',
        DATA_CONFIRMACAO: new Date().toISOString(),
        DATA_ATUALIZACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Inscrição confirmada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao confirmar inscrição:', error);
      throw new Error(`Erro ao confirmar inscrição: ${error.message}`);
    }
  }

  /**
   * Marcar como lista de espera
   */
  async adicionarListaEspera(id) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'LISTA_ESPERA',
        DATA_LISTA_ESPERA: new Date().toISOString(),
        DATA_ATUALIZACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Inscrição adicionada à lista de espera'
      };
    } catch (error) {
      console.error('Erro ao adicionar à lista de espera:', error);
      throw new Error(`Erro ao adicionar à lista de espera: ${error.message}`);
    }
  }

  /**
   * Atualizar status de pagamento
   */
  async atualizarPagamento(id, statusPagamento, dadosPagamento = {}) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const statusValidos = ['PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO'];
      if (!statusValidos.includes(statusPagamento)) {
        throw new Error('Status de pagamento inválido');
      }

      const dadosParaAtualizar = {
        STATUS_PAGAMENTO: statusPagamento,
        DATA_ATUALIZACAO: new Date().toISOString(),
        ...dadosPagamento
      };

      if (statusPagamento === 'PAGO') {
        dadosParaAtualizar.DATA_PAGAMENTO = new Date().toISOString();
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dadosParaAtualizar);
      
      return {
        success: true,
        message: `Status de pagamento atualizado para ${statusPagamento}`
      };
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw new Error(`Erro ao atualizar pagamento: ${error.message}`);
    }
  }

  /**
   * Excluir inscrição permanentemente
   */
  async excluir(id) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Inscrição excluída permanentemente'
      };
    } catch (error) {
      console.error('Erro ao excluir inscrição:', error);
      throw new Error(`Erro ao excluir inscrição: ${error.message}`);
    }
  }

  /**
   * Validar dados da inscrição
   */
  validarDados(dados) {
    const erros = [];

    // Campos obrigatórios
    if (!dados.ID_CLIENTE || dados.ID_CLIENTE.trim() === '') {
      erros.push('ID do cliente é obrigatório');
    }

    if (!dados.ID_ATIVIDADE || dados.ID_ATIVIDADE.trim() === '') {
      erros.push('ID da atividade é obrigatório');
    }

    // Validações de valor
    if (dados.VALOR_PAGO !== undefined) {
      if (typeof dados.VALOR_PAGO !== 'number' || dados.VALOR_PAGO < 0) {
        erros.push('Valor pago deve ser um número positivo');
      }
    }

    // Validações de status
    const statusValidos = ['ATIVA', 'PENDENTE', 'CONFIRMADA', 'CANCELADA', 'LISTA_ESPERA'];
    if (dados.STATUS && !statusValidos.includes(dados.STATUS)) {
      erros.push('Status inválido');
    }

    const statusPagamentoValidos = ['PENDENTE', 'PAGO', 'CANCELADO', 'ESTORNADO'];
    if (dados.STATUS_PAGAMENTO && !statusPagamentoValidos.includes(dados.STATUS_PAGAMENTO)) {
      erros.push('Status de pagamento inválido');
    }

    const prioridadesValidas = ['NORMAL', 'ALTA', 'BAIXA'];
    if (dados.PRIORIDADE && !prioridadesValidas.includes(dados.PRIORIDADE)) {
      erros.push('Prioridade inválida');
    }

    const canaisValidos = ['ONLINE', 'PRESENCIAL', 'TELEFONE'];
    if (dados.CANAL_INSCRICAO && !canaisValidos.includes(dados.CANAL_INSCRICAO)) {
      erros.push('Canal de inscrição inválido');
    }

    return erros;
  }

  /**
   * Obter estatísticas das inscrições
   */
  async obterEstatisticas(filtros = {}) {
    try {
      const inscricoes = await this.buscarTodos(filtros);
      
      // Estatísticas por status
      const porStatus = inscricoes.data.reduce((acc, inscricao) => {
        const status = inscricao.STATUS;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por status de pagamento
      const porStatusPagamento = inscricoes.data.reduce((acc, inscricao) => {
        const status = inscricao.STATUS_PAGAMENTO;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por canal
      const porCanal = inscricoes.data.reduce((acc, inscricao) => {
        const canal = inscricao.CANAL_INSCRICAO || 'ONLINE';
        acc[canal] = (acc[canal] || 0) + 1;
        return acc;
      }, {});

      // Valor total arrecadado
      const valorTotal = inscricoes.data.reduce((acc, inscricao) => {
        if (inscricao.STATUS_PAGAMENTO === 'PAGO') {
          return acc + (inscricao.VALOR_PAGO || 0);
        }
        return acc;
      }, 0);

      // Inscrições por mês (últimos 12 meses)
      const porMes = this.agruparPorMes(inscricoes.data);

      return {
        success: true,
        data: {
          total: inscricoes.data.length,
          porStatus,
          porStatusPagamento,
          porCanal,
          valorTotal,
          porMes
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Agrupar inscrições por mês
   */
  agruparPorMes(inscricoes) {
    const porMes = {};
    
    inscricoes.forEach(inscricao => {
      const data = new Date(inscricao.DATA_INSCRICAO);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      porMes[mesAno] = (porMes[mesAno] || 0) + 1;
    });

    return porMes;
  }

  /**
   * Buscar inscrições com dados completos (join com cliente e atividade)
   */
  async buscarComDetalhes(filtros = {}) {
    try {
      // Esta função retornaria dados combinados com cliente e atividade
      // Por limitações do Firestore, seria necessário fazer consultas separadas
      const inscricoes = await this.buscarTodos(filtros);
      
      // Aqui você faria consultas adicionais para obter dados do cliente e atividade
      // Por agora, retornamos apenas as inscrições
      
      return {
        success: true,
        data: inscricoes.data,
        total: inscricoes.data.length,
        message: 'Para dados completos, consulte os endpoints específicos de cliente e atividade'
      };
    } catch (error) {
      console.error('Erro ao buscar inscrições com detalhes:', error);
      throw new Error(`Erro ao buscar inscrições com detalhes: ${error.message}`);
    }
  }

  /**
   * Buscar inscrições por período
   */
  async buscarPorPeriodo(dataInicio, dataFim, filtros = {}) {
    try {
      const todasInscricoes = await this.buscarTodos(filtros);
      
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      const inscricoesPeriodo = todasInscricoes.data.filter(inscricao => {
        const dataInscricao = new Date(inscricao.DATA_INSCRICAO);
        return dataInscricao >= inicio && dataInscricao <= fim;
      });

      return {
        success: true,
        data: inscricoesPeriodo,
        total: inscricoesPeriodo.length
      };
    } catch (error) {
      console.error('Erro ao buscar inscrições por período:', error);
      throw new Error(`Erro ao buscar inscrições por período: ${error.message}`);
    }
  }

  /**
   * Obter próximas inscrições a vencer
   */
  async obterProximasVencimentos(dias = 7) {
    try {
      const inscricoes = await this.buscarTodos({ status: 'ATIVA' });
      const hoje = new Date();
      const dataLimite = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));
      
      // Esta função seria mais útil se houvesse uma data de vencimento na inscrição
      // Por agora, retornamos inscrições pendentes de pagamento
      const pendentes = inscricoes.data.filter(inscricao => 
        inscricao.STATUS_PAGAMENTO === 'PENDENTE'
      );

      return {
        success: true,
        data: pendentes,
        total: pendentes.length
      };
    } catch (error) {
      console.error('Erro ao obter próximos vencimentos:', error);
      throw new Error(`Erro ao obter próximos vencimentos: ${error.message}`);
    }
  }
}

module.exports = new Inscricao();