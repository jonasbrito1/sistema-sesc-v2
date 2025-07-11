// backend/src/models/Responsavel.js
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

class Responsavel {
  constructor() {
    this.collectionName = 'responsaveis';
  }

  /**
   * Criar novo responsável
   */
  async criar(dadosResponsavel) {
    try {
      // Validar dados antes de criar
      const erros = this.validarDados(dadosResponsavel);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      // Verificar se matrícula já existe
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
        DATA_CRIACAO: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), responsavel);
      
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

  /**
   * Buscar todos os responsáveis
   */
  async buscarTodos(filtros = {}) {
    try {
      let q = collection(db, this.collectionName);
      
      // Aplicar filtros
      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }
      
      if (filtros.unidade) {
        q = query(q, where("UNIDADE_SESC", "==", filtros.unidade));
      }

      if (filtros.departamento) {
        q = query(q, where("DEPARTAMENTO", "==", filtros.departamento));
      }

      // Ordenar
      const ordenacao = filtros.ordenacao || 'NOME_RESPONSAVEL';
      const direcao = filtros.direcao || 'asc';
      q = query(q, orderBy(ordenacao, direcao));

      // Limitar resultados
      if (filtros.limite) {
        q = query(q, limit(parseInt(filtros.limite)));
      }

      const querySnapshot = await getDocs(q);
      const responsaveis = querySnapshot.docs.map(docSnapshot => ({
        ID_RESPONSAVEL: docSnapshot.id,
        ...docSnapshot.data()
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

  /**
   * Buscar responsável por ID
   */
  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID do responsável é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            ID_RESPONSAVEL: docSnap.id,
            ...docSnap.data()
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

  /**
   * Buscar responsável por matrícula
   */
  async buscarPorMatricula(matricula) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("MATRICULA", "==", matricula)
      );
      
      const querySnapshot = await getDocs(q);
      
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

  /**
   * Buscar responsável por email
   */
  async buscarPorEmail(email) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("EMAIL", "==", email)
      );
      
      const querySnapshot = await getDocs(q);
      
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
      console.error('Erro ao buscar responsável por email:', error);
      throw new Error(`Erro ao buscar responsável por email: ${error.message}`);
    }
  }

  /**
   * Buscar responsáveis por unidade
   */
  async buscarPorUnidade(unidadeSesc) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("UNIDADE_SESC", "==", unidadeSesc),
        where("STATUS", "==", "ATIVO"),
        orderBy("NOME_RESPONSAVEL", "asc")
      );
      
      const querySnapshot = await getDocs(q);
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
      console.error('Erro ao buscar responsáveis por unidade:', error);
      throw new Error(`Erro ao buscar responsáveis por unidade: ${error.message}`);
    }
  }

  /**
   * Buscar responsáveis por especialidade
   */
  async buscarPorEspecialidade(especialidade) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("ESPECIALIDADES", "array-contains", especialidade),
        where("STATUS", "==", "ATIVO")
      );
      
      const querySnapshot = await getDocs(q);
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
      console.error('Erro ao buscar responsáveis por especialidade:', error);
      throw new Error(`Erro ao buscar responsáveis por especialidade: ${error.message}`);
    }
  }

  /**
   * Atualizar responsável
   */
  async atualizar(id, dadosAtualizados) {
    try {
      if (!id) {
        throw new Error('ID do responsável é obrigatório');
      }

      // Verificar se responsável existe
      const responsavelExistente = await this.buscarPorId(id);
      if (!responsavelExistente.success) {
        throw new Error('Responsável não encontrado');
      }

      // Se estiver alterando a matrícula, verificar se não existe
      if (dadosAtualizados.MATRICULA && 
          dadosAtualizados.MATRICULA !== responsavelExistente.data.MATRICULA) {
        const matriculaExiste = await this.buscarPorMatricula(dadosAtualizados.MATRICULA);
        if (matriculaExiste.success) {
          throw new Error('Matrícula já está sendo utilizada por outro responsável');
        }
      }

      // Remover campos que não devem ser atualizados
      const { ID_RESPONSAVEL, DATA_CRIACAO, ...dadosParaAtualizar } = dadosAtualizados;
      
      dadosParaAtualizar.DATA_ATUALIZACAO = new Date().toISOString();

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dadosParaAtualizar);
      
      return {
        success: true,
        data: {
          ID_RESPONSAVEL: id,
          ...responsavelExistente.data,
          ...dadosParaAtualizar
        },
        message: 'Responsável atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      throw new Error(`Erro ao atualizar responsável: ${error.message}`);
    }
  }

  /**
   * Excluir responsável (soft delete)
   */
  async excluir(id) {
    try {
      if (!id) {
        throw new Error('ID do responsável é obrigatório');
      }

      // Verificar se responsável existe
      const responsavelExistente = await this.buscarPorId(id);
      if (!responsavelExistente.success) {
        throw new Error('Responsável não encontrado');
      }

      // Verificar se responsável tem atividades ativas
      // (Esta verificação seria feita consultando a collection de atividades)
      // Por agora, apenas fazemos o soft delete

      // Soft delete
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'INATIVO',
        DATA_EXCLUSAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Responsável excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir responsável:', error);
      throw new Error(`Erro ao excluir responsável: ${error.message}`);
    }
  }

  /**
   * Reativar responsável
   */
  async reativar(id) {
    try {
      if (!id) {
        throw new Error('ID do responsável é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'ATIVO',
        DATA_REATIVACAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Responsável reativado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao reativar responsável:', error);
      throw new Error(`Erro ao reativar responsável: ${error.message}`);
    }
  }

  /**
   * Adicionar especialidade
   */
  async adicionarEspecialidade(id, especialidade) {
    try {
      const responsavel = await this.buscarPorId(id);
      if (!responsavel.success) {
        throw new Error('Responsável não encontrado');
      }

      const especialidadesAtuais = responsavel.data.ESPECIALIDADES || [];
      
      if (especialidadesAtuais.includes(especialidade)) {
        throw new Error('Especialidade já cadastrada');
      }

      const novasEspecialidades = [...especialidadesAtuais, especialidade];

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ESPECIALIDADES: novasEspecialidades,
        DATA_ATUALIZACAO: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Especialidade adicionada com sucesso',
        especialidades: novasEspecialidades
      };
    } catch (error) {
      console.error('Erro ao adicionar especialidade:', error);
      throw new Error(`Erro ao adicionar especialidade: ${error.message}`);
    }
  }

  /**
   * Remover especialidade
   */
  async removerEspecialidade(id, especialidade) {
    try {
      const responsavel = await this.buscarPorId(id);
      if (!responsavel.success) {
        throw new Error('Responsável não encontrado');
      }

      const especialidadesAtuais = responsavel.data.ESPECIALIDADES || [];
      const novasEspecialidades = especialidadesAtuais.filter(esp => esp !== especialidade);

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ESPECIALIDADES: novasEspecialidades,
        DATA_ATUALIZACAO: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Especialidade removida com sucesso',
        especialidades: novasEspecialidades
      };
    } catch (error) {
      console.error('Erro ao remover especialidade:', error);
      throw new Error(`Erro ao remover especialidade: ${error.message}`);
    }
  }

  /**
   * Validar dados do responsável
   */
  validarDados(dados) {
    const erros = [];

    // Campos obrigatórios
    if (!dados.NOME_RESPONSAVEL || dados.NOME_RESPONSAVEL.trim() === '') {
      erros.push('Nome do responsável é obrigatório');
    }

    if (!dados.MATRICULA || dados.MATRICULA.trim() === '') {
      erros.push('Matrícula é obrigatória');
    } else if (!this.validarMatricula(dados.MATRICULA)) {
      erros.push('Matrícula deve ter formato válido (apenas números e letras)');
    }

    // Validações opcionais
    if (dados.EMAIL && !this.validarEmail(dados.EMAIL)) {
      erros.push('Email inválido');
    }

    if (dados.TELEFONE && !this.validarTelefone(dados.TELEFONE)) {
      erros.push('Telefone inválido');
    }

    if (dados.DATA_ADMISSAO && !this.validarData(dados.DATA_ADMISSAO)) {
      erros.push('Data de admissão deve estar no formato YYYY-MM-DD');
    }

    if (dados.ESPECIALIDADES && !Array.isArray(dados.ESPECIALIDADES)) {
      erros.push('Especialidades devem ser fornecidas como array');
    }

    return erros;
  }

  /**
   * Validar matrícula
   */
  validarMatricula(matricula) {
    // Aceita apenas números e letras, entre 3 e 20 caracteres
    const regex = /^[A-Za-z0-9]{3,20}$/;
    return regex.test(matricula);
  }

  /**
   * Validar email
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar telefone
   */
  validarTelefone(telefone) {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
  }

  /**
   * Validar formato de data
   */
  validarData(data) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(data)) return false;
    
    const date = new Date(data);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Obter estatísticas dos responsáveis
   */
  async obterEstatisticas() {
    try {
      const responsaveis = await this.buscarTodos();
      const responsaveisAtivos = responsaveis.data.filter(r => r.STATUS === 'ATIVO');
      
      // Estatísticas por unidade
      const porUnidade = responsaveisAtivos.reduce((acc, responsavel) => {
        const unidade = responsavel.UNIDADE_SESC || 'Não informado';
        acc[unidade] = (acc[unidade] || 0) + 1;
        return acc;
      }, {});

      // Estatísticas por departamento
      const porDepartamento = responsaveisAtivos.reduce((acc, responsavel) => {
        const departamento = responsavel.DEPARTAMENTO || 'Não informado';
        acc[departamento] = (acc[departamento] || 0) + 1;
        return acc;
      }, {});

      // Especialidades mais comuns
      const especialidades = responsaveisAtivos.reduce((acc, responsavel) => {
        (responsavel.ESPECIALIDADES || []).forEach(esp => {
          acc[esp] = (acc[esp] || 0) + 1;
        });
        return acc;
      }, {});

      return {
        success: true,
        data: {
          total: responsaveis.data.length,
          ativos: responsaveisAtivos.length,
          inativos: responsaveis.data.length - responsaveisAtivos.length,
          porUnidade,
          porDepartamento,
          especialidades
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Buscar responsáveis com filtros avançados
   */
  async buscarAvancado(filtros) {
    try {
      const todosResponsaveis = await this.buscarTodos();
      let resultado = todosResponsaveis.data;

      // Filtrar por texto (busca em nome, cargo, departamento)
      if (filtros.texto) {
        const texto = filtros.texto.toLowerCase();
        resultado = resultado.filter(responsavel => {
          const nome = (responsavel.NOME_RESPONSAVEL || '').toLowerCase();
          const cargo = (responsavel.CARGO || '').toLowerCase();
          const departamento = (responsavel.DEPARTAMENTO || '').toLowerCase();
          const matricula = (responsavel.MATRICULA || '').toLowerCase();
          
          return nome.includes(texto) || 
                 cargo.includes(texto) || 
                 departamento.includes(texto) ||
                 matricula.includes(texto);
        });
      }

      // Filtrar por múltiplas especialidades
      if (filtros.especialidades && Array.isArray(filtros.especialidades)) {
        resultado = resultado.filter(responsavel => {
          const especialidadesResp = responsavel.ESPECIALIDADES || [];
          return filtros.especialidades.some(esp => especialidadesResp.includes(esp));
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

  /**
   * Obter responsáveis disponíveis para nova atividade
   */
  async obterDisponiveis() {
    try {
      return await this.buscarTodos({ status: 'ATIVO' });
    } catch (error) {
      console.error('Erro ao buscar responsáveis disponíveis:', error);
      throw new Error(`Erro ao buscar responsáveis disponíveis: ${error.message}`);
    }
  }
}

module.exports = new Responsavel();