const admin = require('firebase-admin');

class Avaliacao {
  constructor() {
    this.collectionName = 'avaliacoes';
  }

  getCollection() {
    return admin.firestore().collection(this.collectionName);
  }

  async criar(dadosAvaliacao) {
    try {
      const erros = this.validarDados(dadosAvaliacao);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      const avaliacao = {
        ID_CLIENTE: dadosAvaliacao.ID_CLIENTE || null,
        ID_ATIVIDADE: dadosAvaliacao.ID_ATIVIDADE || null,
        NOME_AVALIADOR: dadosAvaliacao.NOME_AVALIADOR || 'Anônimo',
        EMAIL_AVALIADOR: dadosAvaliacao.EMAIL_AVALIADOR || '',
        TIPO: dadosAvaliacao.TIPO,
        CATEGORIA: dadosAvaliacao.CATEGORIA || 'GERAL',
        TITULO: dadosAvaliacao.TITULO,
        MENSAGEM: dadosAvaliacao.MENSAGEM,
        NOTA: dadosAvaliacao.NOTA || null,
        STATUS: 'PENDENTE',
        PRIORIDADE: dadosAvaliacao.PRIORIDADE || 'NORMAL',
        PUBLICO: dadosAvaliacao.PUBLICO || false,
        ANONIMA: dadosAvaliacao.ANONIMA || false,
        DATA_CRIACAO: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await this.getCollection().add(avaliacao);
      
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

  async buscarTodos(filtros = {}) {
    try {
      let query = this.getCollection();
      
      if (filtros.tipo) {
        query = query.where("TIPO", "==", filtros.tipo);
      }
      
      if (filtros.categoria) {
        query = query.where("CATEGORIA", "==", filtros.categoria);
      }

      if (filtros.status) {
        query = query.where("STATUS", "==", filtros.status);
      }

      const ordenacao = filtros.ordenacao || 'DATA_CRIACAO';
      const direcao = filtros.direcao || 'desc';
      query = query.orderBy(ordenacao, direcao);

      if (filtros.limite) {
        query = query.limit(parseInt(filtros.limite));
      }

      const querySnapshot = await query.get();
      const avaliacoes = querySnapshot.docs.map(doc => ({
        ID_AVALIACAO: doc.id,
        ...doc.data()
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

  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID da avaliação é obrigatório');
      }

      const doc = await this.getCollection().doc(id).get();
      
      if (doc.exists) {
        return {
          success: true,
          data: {
            ID_AVALIACAO: doc.id,
            ...doc.data()
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
        DATA_RESPOSTA: admin.firestore.FieldValue.serverTimestamp(),
        RESPOSTA_AUTOMATICA: dadosResposta.RESPOSTA_AUTOMATICA || false
      };

      await this.getCollection().doc(id).update(resposta);
      
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

  validarDados(dados) {
    const erros = [];

    if (!dados.TIPO || dados.TIPO.trim() === '') {
      erros.push('Tipo da avaliação é obrigatório');
    }

    if (!dados.TITULO || dados.TITULO.trim() === '') {
      erros.push('Título é obrigatório');
    }

    if (!dados.MENSAGEM || dados.MENSAGEM.trim() === '') {
      erros.push('Mensagem é obrigatória');
    }

    const tiposValidos = ['CRITICA', 'SUGESTAO', 'ELOGIO'];
    if (dados.TIPO && !tiposValidos.includes(dados.TIPO)) {
      erros.push('Tipo deve ser CRITICA, SUGESTAO ou ELOGIO');
    }

    return erros;
  }
}

module.exports = new Avaliacao();