const admin = require('firebase-admin');

class Inscricao {
  constructor() {
    this.collectionName = 'inscricoes';
  }

  getCollection() {
    return admin.firestore().collection(this.collectionName);
  }

  async criar(dadosInscricao) {
    try {
      const inscricao = {
        ID_CLIENTE: dadosInscricao.ID_CLIENTE,
        ID_ATIVIDADE: dadosInscricao.ID_ATIVIDADE,
        DATA_INSCRICAO: admin.firestore.FieldValue.serverTimestamp(),
        STATUS_INSCRICAO: dadosInscricao.STATUS_INSCRICAO || 'ativa',
        OBSERVACOES: dadosInscricao.OBSERVACOES || '',
        DATA_CRIACAO: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await this.getCollection().add(inscricao);
      
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

  async buscarTodos(filtros = {}) {
    try {
      let query = this.getCollection();
      
      if (filtros.idCliente) {
        query = query.where("ID_CLIENTE", "==", filtros.idCliente);
      }
      
      if (filtros.idAtividade) {
        query = query.where("ID_ATIVIDADE", "==", filtros.idAtividade);
      }

      if (filtros.status) {
        query = query.where("STATUS_INSCRICAO", "==", filtros.status);
      }

      query = query.orderBy("DATA_CRIACAO", "desc");

      const querySnapshot = await query.get();
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
      console.error('Erro ao buscar inscrições:', error);
      throw new Error(`Erro ao buscar inscrições: ${error.message}`);
    }
  }

  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const doc = await this.getCollection().doc(id).get();
      
      if (doc.exists) {
        return {
          success: true,
          data: {
            ID_INSCRICAO: doc.id,
            ...doc.data()
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

  async atualizar(id, dadosAtualizados) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      const { ID_INSCRICAO, DATA_CRIACAO, ...dadosParaAtualizar } = dadosAtualizados;
      
      dadosParaAtualizar.DATA_ATUALIZACAO = admin.firestore.FieldValue.serverTimestamp();

      await this.getCollection().doc(id).update(dadosParaAtualizar);
      
      return {
        success: true,
        message: 'Inscrição atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar inscrição:', error);
      throw new Error(`Erro ao atualizar inscrição: ${error.message}`);
    }
  }

  async cancelar(id) {
    try {
      if (!id) {
        throw new Error('ID da inscrição é obrigatório');
      }

      await this.getCollection().doc(id).update({
        STATUS_INSCRICAO: 'cancelada',
        DATA_CANCELAMENTO: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Inscrição cancelada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      throw new Error(`Erro ao cancelar inscrição: ${error.message}`);
    }
  }
}

module.exports = new Inscricao();