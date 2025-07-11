const admin = require('firebase-admin');

class Responsavel {
  constructor() {
    this.collectionName = 'responsaveis';
  }

  getCollection() {
    return admin.firestore().collection(this.collectionName);
  }

  async criar(dadosResponsavel) {
    try {
      const erros = this.validarDados(dadosResponsavel);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      const matriculaExiste = await this.buscarPorMatricula(dadosResponsavel.MATRICULA);
      if (matriculaExiste.success) {
        throw new Error('Matrícula já está cadastrada');
      }

      const responsavel = {
        NOME_RESPONSAVEL: dadosResponsavel.NOME_RESPONSAVEL,
        MATRICULA: dadosResponsavel.MATRICULA,
        EMAIL: dadosResponsavel.EMAIL || '',
        TELEFONE: dadosResponsavel.TELEFONE || '',
        CARGO: dadosResponsavel.CARGO || '',
        DEPARTAMENTO: dadosResponsavel.DEPARTAMENTO || '',
        UNIDADE_SESC: dadosResponsavel.UNIDADE_SESC || '',
        ESPECIALIDADES: dadosResponsavel.ESPECIALIDADES || [],
        BIOGRAFIA: dadosResponsavel.BIOGRAFIA || '',
        STATUS: 'ATIVO',
        DATA_ADMISSAO: dadosResponsavel.DATA_ADMISSAO || null,
        DATA_CRIACAO: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await this.getCollection().add(responsavel);
      
      return { 
        ID_RESPONSAVEL: docRef.id, 
        ...responsavel,
        success: true,
        message: 'Responsável criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar responsável:', error);
      throw new Error(`Erro ao criar responsável: ${error.message}`);
    }
  }

  async buscarTodos(filtros = {}) {
    try {
      let query = this.getCollection();
      
      if (filtros.status) {
        query = query.where("STATUS", "==", filtros.status);
      }
      
      if (filtros.unidade) {
        query = query.where("UNIDADE_SESC", "==", filtros.unidade);
      }

      const ordenacao = filtros.ordenacao || 'NOME_RESPONSAVEL';
      const direcao = filtros.direcao || 'asc';
      query = query.orderBy(ordenacao, direcao);

      if (filtros.limite) {
        query = query.limit(parseInt(filtros.limite));
      }

      const querySnapshot = await query.get();
      const responsaveis = querySnapshot.docs.map(doc => ({
        ID_RESPONSAVEL: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: responsaveis,
        total: responsaveis.length
      };
    } catch (error) {
      console.error('Erro ao buscar responsáveis:', error);
      throw new Error(`Erro ao buscar responsáveis: ${error.message}`);
    }
  }

  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID do responsável é obrigatório');
      }

      const doc = await this.getCollection().doc(id).get();
      
      if (doc.exists) {
        return {
          success: true,
          data: {
            ID_RESPONSAVEL: doc.id,
            ...doc.data()
          }
        };
      } else {
        return {
          success: false,
          message: 'Responsável não encontrado'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar responsável:', error);
      throw new Error(`Erro ao buscar responsável: ${error.message}`);
    }
  }

  async buscarPorMatricula(matricula) {
    try {
      const querySnapshot = await this.getCollection()
        .where("MATRICULA", "==", matricula)
        .get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          success: true,
          data: {
            ID_RESPONSAVEL: doc.id,
            ...doc.data()
          }
        };
      }
      
      return {
        success: false,
        message: 'Responsável não encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar responsável por matrícula:', error);
      throw new Error(`Erro ao buscar responsável por matrícula: ${error.message}`);
    }
  }

  validarDados(dados) {
    const erros = [];

    if (!dados.NOME_RESPONSAVEL || dados.NOME_RESPONSAVEL.trim() === '') {
      erros.push('Nome do responsável é obrigatório');
    }

    if (!dados.MATRICULA || dados.MATRICULA.trim() === '') {
      erros.push('Matrícula é obrigatória');
    }

    return erros;
  }
}

module.exports = new Responsavel();