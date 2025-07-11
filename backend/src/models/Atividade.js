const admin = require('firebase-admin');

class Atividade {
  constructor() {
    this.collectionName = 'atividades';
  }

  // Obter referência da coleção
  getCollection() {
    return admin.firestore().collection(this.collectionName);
  }

  /**
   * Criar nova atividade
   */
  async criar(dadosAtividade) {
    try {
      // Validar dados antes de criar
      const erros = this.validarDados(dadosAtividade);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      const atividade = {
        NOME_ATIVIDADE: dadosAtividade.NOME_ATIVIDADE,
        DESCRICAO: dadosAtividade.DESCRICAO || '',
        UNIDADE_SESC: dadosAtividade.UNIDADE_SESC,
        ID_RESPONSAVEL: dadosAtividade.ID_RESPONSAVEL,
        CATEGORIA: dadosAtividade.CATEGORIA || 'GERAL',
        VAGAS_TOTAL: dadosAtividade.VAGAS_TOTAL || 0,
        VAGAS_OCUPADAS: 0,
        DATA_INICIO: dadosAtividade.DATA_INICIO || null,
        DATA_FIM: dadosAtividade.DATA_FIM || null,
        HORARIO: dadosAtividade.HORARIO || '',
        LOCAL: dadosAtividade.LOCAL || '',
        IDADE_MINIMA: dadosAtividade.IDADE_MINIMA || 16,
        IDADE_MAXIMA: dadosAtividade.IDADE_MAXIMA || null,
        VALOR: dadosAtividade.VALOR || 0,
        STATUS: 'ATIVA',
        MODALIDADE: dadosAtividade.MODALIDADE || 'PRESENCIAL',
        MATERIAIS_NECESSARIOS: dadosAtividade.MATERIAIS_NECESSARIOS || '',
        OBSERVACOES: dadosAtividade.OBSERVACOES || '',
        DATA_CRIACAO: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await this.getCollection().add(atividade);
      
      return { 
        ID_ATIVIDADE: docRef.id, 
        ...atividade,
        success: true,
        message: 'Atividade criada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      throw new Error(`Erro ao criar atividade: ${error.message}`);
    }
  }

  /**
   * Buscar todas as atividades
   */
  async buscarTodos(filtros = {}) {
    try {
      let query = this.getCollection();
      
      // Aplicar filtros
      if (filtros.unidade) {
        query = query.where("UNIDADE_SESC", "==", filtros.unidade);
      }
      
      if (filtros.status) {
        query = query.where("STATUS", "==", filtros.status);
      }

      if (filtros.categoria) {
        query = query.where("CATEGORIA", "==", filtros.categoria);
      }

      if (filtros.modalidade) {
        query = query.where("MODALIDADE", "==", filtros.modalidade);
      }

      // Ordenar
      const ordenacao = filtros.ordenacao || 'DATA_CRIACAO';
      const direcao = filtros.direcao || 'desc';
      query = query.orderBy(ordenacao, direcao);

      // Limitar resultados
      if (filtros.limite) {
        query = query.limit(parseInt(filtros.limite));
      }

      const querySnapshot = await query.get();
      const atividades = querySnapshot.docs.map(doc => ({
        ID_ATIVIDADE: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: atividades,
        total: atividades.length
      };
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      throw new Error(`Erro ao buscar atividades: ${error.message}`);
    }
  }

  /**
   * Buscar atividade por ID
   */
  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID da atividade é obrigatório');
      }

      const doc = await this.getCollection().doc(id).get();
      
      if (doc.exists) {
        return {
          success: true,
          data: {
            ID_ATIVIDADE: doc.id,
            ...doc.data()
          }
        };
      } else {
        return {
          success: false,
          message: 'Atividade não encontrada'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar atividade:', error);
      throw new Error(`Erro ao buscar atividade: ${error.message}`);
    }
  }

  /**
   * Buscar atividades por unidade SESC
   */
  async buscarPorUnidade(unidadeSesc) {
    try {
      const querySnapshot = await this.getCollection()
        .where("UNIDADE_SESC", "==", unidadeSesc)
        .where("STATUS", "==", "ATIVA")
        .orderBy("DATA_CRIACAO", "desc")
        .get();
      
      const atividades = querySnapshot.docs.map(doc => ({
        ID_ATIVIDADE: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: atividades,
        total: atividades.length
      };
    } catch (error) {
      console.error('Erro ao buscar atividades por unidade:', error);
      throw new Error(`Erro ao buscar atividades por unidade: ${error.message}`);
    }
  }

  /**
   * Atualizar atividade
   */
  async atualizar(id, dadosAtualizados) {
    try {
      if (!id) {
        throw new Error('ID da atividade é obrigatório');
      }

      // Verificar se atividade existe
      const atividadeExistente = await this.buscarPorId(id);
      if (!atividadeExistente.success) {
        throw new Error('Atividade não encontrada');
      }

      // Remover campos que não devem ser atualizados diretamente
      const { ID_ATIVIDADE, DATA_CRIACAO, VAGAS_OCUPADAS, ...dadosParaAtualizar } = dadosAtualizados;
      
      dadosParaAtualizar.DATA_ATUALIZACAO = admin.firestore.FieldValue.serverTimestamp();

      await this.getCollection().doc(id).update(dadosParaAtualizar);
      
      return {
        success: true,
        data: {
          ID_ATIVIDADE: id,
          ...atividadeExistente.data,
          ...dadosParaAtualizar
        },
        message: 'Atividade atualizada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      throw new Error(`Erro ao atualizar atividade: ${error.message}`);
    }
  }

  /**
   * Excluir atividade (soft delete)
   */
  async excluir(id) {
    try {
      if (!id) {
        throw new Error('ID da atividade é obrigatório');
      }

      // Verificar se atividade existe
      const atividadeExistente = await this.buscarPorId(id);
      if (!atividadeExistente.success) {
        throw new Error('Atividade não encontrada');
      }

      // Verificar se há inscrições ativas
      if (atividadeExistente.data.VAGAS_OCUPADAS > 0) {
        throw new Error('Não é possível excluir atividade com inscrições ativas');
      }

      // Soft delete
      await this.getCollection().doc(id).update({
        STATUS: 'INATIVA',
        DATA_EXCLUSAO: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Atividade excluída com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      throw new Error(`Erro ao excluir atividade: ${error.message}`);
    }
  }

  /**
   * Incrementar vagas ocupadas
   */
  async incrementarVagas(id) {
    try {
      const atividade = await this.buscarPorId(id);
      if (!atividade.success) {
        throw new Error('Atividade não encontrada');
      }

      const novoNumero = atividade.data.VAGAS_OCUPADAS + 1;
      
      if (novoNumero > atividade.data.VAGAS_TOTAL) {
        throw new Error('Não há vagas disponíveis');
      }

      await this.getCollection().doc(id).update({
        VAGAS_OCUPADAS: novoNumero
      });

      return {
        success: true,
        message: 'Vaga ocupada com sucesso',
        vagasRestantes: atividade.data.VAGAS_TOTAL - novoNumero
      };
    } catch (error) {
      console.error('Erro ao incrementar vagas:', error);
      throw new Error(`Erro ao incrementar vagas: ${error.message}`);
    }
  }

  /**
   * Validar dados da atividade
   */
  validarDados(dados) {
    const erros = [];

    // Campos obrigatórios
    if (!dados.NOME_ATIVIDADE || dados.NOME_ATIVIDADE.trim() === '') {
      erros.push('Nome da atividade é obrigatório');
    }

    if (!dados.UNIDADE_SESC || dados.UNIDADE_SESC.trim() === '') {
      erros.push('Unidade SESC é obrigatória');
    }

    if (!dados.ID_RESPONSAVEL || dados.ID_RESPONSAVEL.trim() === '') {
      erros.push('Responsável é obrigatório');
    }

    // Validações de vagas
    if (dados.VAGAS_TOTAL !== undefined) {
      if (!Number.isInteger(dados.VAGAS_TOTAL) || dados.VAGAS_TOTAL < 0) {
        erros.push('Número total de vagas deve ser um número inteiro positivo');
      }
    }

    return erros;
  }
}

module.exports = new Atividade();