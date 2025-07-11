// backend/src/models/Atividade.js
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

class Atividade {
  constructor() {
    this.collectionName = 'atividades';
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
        MODALIDADE: dadosAtividade.MODALIDADE || 'PRESENCIAL', // PRESENCIAL, ONLINE, HIBRIDA
        MATERIAIS_NECESSARIOS: dadosAtividade.MATERIAIS_NECESSARIOS || '',
        OBSERVACOES: dadosAtividade.OBSERVACOES || '',
        DATA_CRIACAO: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), atividade);
      
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
      let q = collection(db, this.collectionName);
      
      // Aplicar filtros
      if (filtros.unidade) {
        q = query(q, where("UNIDADE_SESC", "==", filtros.unidade));
      }
      
      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }

      if (filtros.categoria) {
        q = query(q, where("CATEGORIA", "==", filtros.categoria));
      }

      if (filtros.modalidade) {
        q = query(q, where("MODALIDADE", "==", filtros.modalidade));
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
      const atividades = querySnapshot.docs.map(docSnapshot => ({
        ID_ATIVIDADE: docSnapshot.id,
        ...docSnapshot.data()
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

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            ID_ATIVIDADE: docSnap.id,
            ...docSnap.data()
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
      const q = query(
        collection(db, this.collectionName),
        where("UNIDADE_SESC", "==", unidadeSesc),
        where("STATUS", "==", "ATIVA"),
        orderBy("DATA_CRIACAO", "desc")
      );
      
      const querySnapshot = await getDocs(q);
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
   * Buscar atividades por responsável
   */
  async buscarPorResponsavel(idResponsavel) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("ID_RESPONSAVEL", "==", idResponsavel),
        orderBy("DATA_CRIACAO", "desc")
      );
      
      const querySnapshot = await getDocs(q);
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
      console.error('Erro ao buscar atividades por responsável:', error);
      throw new Error(`Erro ao buscar atividades por responsável: ${error.message}`);
    }
  }

  /**
   * Buscar atividades com vagas disponíveis
   */
  async buscarComVagas() {
    try {
      const todasAtividades = await this.buscarTodos({ status: 'ATIVA' });
      
      const comVagas = todasAtividades.data.filter(atividade => {
        const vagasDisponiveis = atividade.VAGAS_TOTAL - atividade.VAGAS_OCUPADAS;
        return vagasDisponiveis > 0;
      });

      return {
        success: true,
        data: comVagas,
        total: comVagas.length
      };
    } catch (error) {
      console.error('Erro ao buscar atividades com vagas:', error);
      throw new Error(`Erro ao buscar atividades com vagas: ${error.message}`);
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
      
      dadosParaAtualizar.DATA_ATUALIZACAO = new Date().toISOString();

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dadosParaAtualizar);
      
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
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'INATIVA',
        DATA_EXCLUSAO: new Date().toISOString()
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

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
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
   * Decrementar vagas ocupadas
   */
  async decrementarVagas(id) {
    try {
      const atividade = await this.buscarPorId(id);
      if (!atividade.success) {
        throw new Error('Atividade não encontrada');
      }

      const novoNumero = Math.max(0, atividade.data.VAGAS_OCUPADAS - 1);

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        VAGAS_OCUPADAS: novoNumero
      });

      return {
        success: true,
        message: 'Vaga liberada com sucesso',
        vagasRestantes: atividade.data.VAGAS_TOTAL - novoNumero
      };
    } catch (error) {
      console.error('Erro ao decrementar vagas:', error);
      throw new Error(`Erro ao decrementar vagas: ${error.message}`);
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

    // Validações de idade
    if (dados.IDADE_MINIMA !== undefined) {
      if (!Number.isInteger(dados.IDADE_MINIMA) || dados.IDADE_MINIMA < 0) {
        erros.push('Idade mínima deve ser um número inteiro positivo');
      }
    }

    if (dados.IDADE_MAXIMA !== undefined && dados.IDADE_MAXIMA !== null) {
      if (!Number.isInteger(dados.IDADE_MAXIMA) || dados.IDADE_MAXIMA < 0) {
        erros.push('Idade máxima deve ser um número inteiro positivo');
      }
      
      if (dados.IDADE_MINIMA && dados.IDADE_MAXIMA < dados.IDADE_MINIMA) {
        erros.push('Idade máxima deve ser maior que a idade mínima');
      }
    }

    // Validações de data
    if (dados.DATA_INICIO && dados.DATA_FIM) {
      const dataInicio = new Date(dados.DATA_INICIO);
      const dataFim = new Date(dados.DATA_FIM);
      
      if (dataFim <= dataInicio) {
        erros.push('Data de fim deve ser posterior à data de início');
      }
    }

    // Validações de valor
    if (dados.VALOR !== undefined) {
      if (typeof dados.VALOR !== 'number' || dados.VALOR < 0) {
        erros.push('Valor deve ser um número positivo');
      }
    }

    // Validações de modalidade
    const modalidadesValidas = ['PRESENCIAL', 'ONLINE', 'HIBRIDA'];
    if (dados.MODALIDADE && !modalidadesValidas.includes(dados.MODALIDADE)) {
      erros.push('Modalidade deve ser PRESENCIAL, ONLINE ou HIBRIDA');
    }

    return erros;
  }

  /**
   * Obter estatísticas das atividades
   */
  async obterEstatisticas() {
    try {
      const atividades = await this.buscarTodos();
      const atividadesAtivas = atividades.data.filter(a => a.STATUS === 'ATIVA');
      
      // Estatísticas por unidade
      const porUnidade = atividadesAtivas.reduce((acc, atividade) => {
        const unidade = atividade.UNIDADE_SESC;
        if (!acc[unidade]) {
          acc[unidade] = {
            total: 0,
            vagasTotal: 0,
            vagasOcupadas: 0
          };
        }
        acc[unidade].total++;
        acc[unidade].vagasTotal += atividade.VAGAS_TOTAL;
        acc[unidade].vagasOcupadas += atividade.VAGAS_OCUPADAS;
        return acc;
      }, {});

      // Estatísticas por categoria
      const porCategoria = atividadesAtivas.reduce((acc, atividade) => {
        const categoria = atividade.CATEGORIA || 'GERAL';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por modalidade
      const porModalidade = atividadesAtivas.reduce((acc, atividade) => {
        const modalidade = atividade.MODALIDADE || 'PRESENCIAL';
        acc[modalidade] = (acc[modalidade] || 0) + 1;
        return acc;
      }, {});

      const totalVagas = atividadesAtivas.reduce((acc, a) => acc + a.VAGAS_TOTAL, 0);
      const totalOcupadas = atividadesAtivas.reduce((acc, a) => acc + a.VAGAS_OCUPADAS, 0);

      return {
        success: true,
        data: {
          total: atividades.data.length,
          ativas: atividadesAtivas.length,
          inativas: atividades.data.length - atividadesAtivas.length,
          totalVagas,
          totalOcupadas,
          vagasDisponiveis: totalVagas - totalOcupadas,
          taxaOcupacao: totalVagas > 0 ? ((totalOcupadas / totalVagas) * 100).toFixed(2) : 0,
          porUnidade,
          porCategoria,
          porModalidade
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Buscar atividades por filtros avançados
   */
  async buscarAvancado(filtros) {
    try {
      const todasAtividades = await this.buscarTodos();
      let resultado = todasAtividades.data;

      // Filtrar por faixa de idade do cliente
      if (filtros.idadeCliente) {
        resultado = resultado.filter(atividade => {
          const idadeMin = atividade.IDADE_MINIMA || 0;
          const idadeMax = atividade.IDADE_MAXIMA || 999;
          return filtros.idadeCliente >= idadeMin && filtros.idadeCliente <= idadeMax;
        });
      }

      // Filtrar por disponibilidade de vagas
      if (filtros.apenasComVagas) {
        resultado = resultado.filter(atividade => {
          return (atividade.VAGAS_TOTAL - atividade.VAGAS_OCUPADAS) > 0;
        });
      }

      // Filtrar por faixa de valor
      if (filtros.valorMin !== undefined || filtros.valorMax !== undefined) {
        resultado = resultado.filter(atividade => {
          const valor = atividade.VALOR || 0;
          const min = filtros.valorMin || 0;
          const max = filtros.valorMax || Infinity;
          return valor >= min && valor <= max;
        });
      }

      // Filtrar por texto (busca em nome e descrição)
      if (filtros.texto) {
        const texto = filtros.texto.toLowerCase();
        resultado = resultado.filter(atividade => {
          const nome = (atividade.NOME_ATIVIDADE || '').toLowerCase();
          const descricao = (atividade.DESCRICAO || '').toLowerCase();
          return nome.includes(texto) || descricao.includes(texto);
        });
      }

      return {
        success: true,
        data: resultado,
        total: resultado.length
      };
    } catch (error) {
      console.error('Erro na busca avançada:', error);
      throw new Error(`Erro na busca avançada: ${error.message}`);
    }
  }
}

module.exports = new Atividade();