// backend/src/models/Cliente.js
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

class Cliente {
  constructor() {
    this.collectionName = 'clientes';
  }

  /**
   * Criar novo cliente
   */
  async criar(dadosCliente) {
    try {
      // Validar dados antes de criar
      const erros = this.validarDados(dadosCliente);
      if (erros.length > 0) {
        throw new Error(`Dados inválidos: ${erros.join(', ')}`);
      }

      const cliente = {
        NOME_CLIENTE: dadosCliente.NOME_CLIENTE,
        DATA_NASCIMENTO: dadosCliente.DATA_NASCIMENTO,
        LOGRADOURO: dadosCliente.LOGRADOURO || '',
        NUMERO: dadosCliente.NUMERO || '',
        BAIRRO: dadosCliente.BAIRRO || '',
        CIDADE: dadosCliente.CIDADE || '',
        ESTADO: dadosCliente.ESTADO || '',
        CEP: dadosCliente.CEP.replace(/\D/g, ''), // Remove formatação do CEP
        EMAIL: dadosCliente.EMAIL || '',
        TELEFONE: dadosCliente.TELEFONE || '',
        DATA_CRIACAO: new Date().toISOString(),
        STATUS: 'ATIVO'
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), cliente);
      
      return { 
        ID_CLIENTE: docRef.id, 
        ...cliente,
        success: true,
        message: 'Cliente criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }
  }

  /**
   * Buscar todos os clientes
   */
  async buscarTodos(filtros = {}) {
    try {
      let q = collection(db, this.collectionName);
      
      // Aplicar filtros se fornecidos
      if (filtros.status) {
        q = query(q, where("STATUS", "==", filtros.status));
      }
      
      if (filtros.cidade) {
        q = query(q, where("CIDADE", "==", filtros.cidade));
      }

      // Ordenar por data de criação (mais recentes primeiro)
      q = query(q, orderBy("DATA_CRIACAO", "desc"));

      // Limitar resultados se especificado
      if (filtros.limite) {
        q = query(q, limit(parseInt(filtros.limite)));
      }

      const querySnapshot = await getDocs(q);
      const clientes = querySnapshot.docs.map(docSnapshot => ({
        ID_CLIENTE: docSnapshot.id,
        ...docSnapshot.data()
      }));

      return {
        success: true,
        data: clientes,
        total: clientes.length
      };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }
  }

  /**
   * Buscar cliente por ID
   */
  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            ID_CLIENTE: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          message: 'Cliente não encontrado'
        };
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
  }

  /**
   * Buscar cliente por email
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
            ID_CLIENTE: doc.id,
            ...doc.data()
          }
        };
      }
      
      return {
        success: false,
        message: 'Cliente não encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      throw new Error(`Erro ao buscar cliente por email: ${error.message}`);
    }
  }

  /**
   * Atualizar cliente
   */
  async atualizar(id, dadosAtualizados) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      // Verificar se cliente existe
      const clienteExistente = await this.buscarPorId(id);
      if (!clienteExistente.success) {
        throw new Error('Cliente não encontrado');
      }

      // Remover campos que não devem ser atualizados
      const { ID_CLIENTE, DATA_CRIACAO, ...dadosParaAtualizar } = dadosAtualizados;
      
      // Limpar CEP se fornecido
      if (dadosParaAtualizar.CEP) {
        dadosParaAtualizar.CEP = dadosParaAtualizar.CEP.replace(/\D/g, '');
      }

      dadosParaAtualizar.DATA_ATUALIZACAO = new Date().toISOString();

      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, dadosParaAtualizar);
      
      return {
        success: true,
        data: {
          ID_CLIENTE: id,
          ...clienteExistente.data,
          ...dadosParaAtualizar
        },
        message: 'Cliente atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }
  }

  /**
   * Excluir cliente (soft delete)
   */
  async excluir(id) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      // Verificar se cliente existe
      const clienteExistente = await this.buscarPorId(id);
      if (!clienteExistente.success) {
        throw new Error('Cliente não encontrado');
      }

      // Soft delete - apenas marca como inativo
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        STATUS: 'INATIVO',
        DATA_EXCLUSAO: new Date().toISOString()
      });
      
      return {
        success: true,
        message: 'Cliente excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw new Error(`Erro ao excluir cliente: ${error.message}`);
    }
  }

  /**
   * Excluir cliente permanentemente
   */
  async excluirPermanente(id) {
    try {
      if (!id) {
        throw new Error('ID do cliente é obrigatório');
      }

      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Cliente excluído permanentemente'
      };
    } catch (error) {
      console.error('Erro ao excluir cliente permanentemente:', error);
      throw new Error(`Erro ao excluir cliente permanentemente: ${error.message}`);
    }
  }

  /**
   * Validar dados do cliente
   */
  validarDados(dados) {
    const erros = [];

    // Campos obrigatórios
    if (!dados.NOME_CLIENTE || dados.NOME_CLIENTE.trim() === '') {
      erros.push('Nome do cliente é obrigatório');
    }

    if (!dados.DATA_NASCIMENTO) {
      erros.push('Data de nascimento é obrigatória');
    } else if (!this.validarData(dados.DATA_NASCIMENTO)) {
      erros.push('Data de nascimento deve estar no formato YYYY-MM-DD');
    }

    if (!dados.CEP) {
      erros.push('CEP é obrigatório');
    } else if (!this.validarCEP(dados.CEP)) {
      erros.push('CEP deve ter 8 dígitos');
    }

    // Validações opcionais
    if (dados.EMAIL && !this.validarEmail(dados.EMAIL)) {
      erros.push('Email inválido');
    }

    if (dados.TELEFONE && !this.validarTelefone(dados.TELEFONE)) {
      erros.push('Telefone inválido');
    }

    // Validar idade mínima (por exemplo, 16 anos para inscrições)
    if (dados.DATA_NASCIMENTO && this.calcularIdade(dados.DATA_NASCIMENTO) < 16) {
      erros.push('Cliente deve ter pelo menos 16 anos');
    }

    return erros;
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
   * Validar CEP
   */
  validarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
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
   * Calcular idade
   */
  calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diferenciaMes = hoje.getMonth() - nascimento.getMonth();
    
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }

  /**
   * Buscar clientes por cidade
   */
  async buscarPorCidade(cidade) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("CIDADE", "==", cidade),
        where("STATUS", "==", "ATIVO")
      );
      
      const querySnapshot = await getDocs(q);
      const clientes = querySnapshot.docs.map(doc => ({
        ID_CLIENTE: doc.id,
        ...doc.data()
      }));

      return {
        success: true,
        data: clientes,
        total: clientes.length
      };
    } catch (error) {
      console.error('Erro ao buscar clientes por cidade:', error);
      throw new Error(`Erro ao buscar clientes por cidade: ${error.message}`);
    }
  }

  /**
   * Estatísticas de clientes
   */
  async obterEstatisticas() {
    try {
      const clientes = await this.buscarTodos();
      const clientesAtivos = clientes.data.filter(c => c.STATUS === 'ATIVO');
      
      // Agrupar por cidade
      const porCidade = clientesAtivos.reduce((acc, cliente) => {
        const cidade = cliente.CIDADE || 'Não informado';
        acc[cidade] = (acc[cidade] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por faixa etária
      const porIdade = clientesAtivos.reduce((acc, cliente) => {
        const idade = this.calcularIdade(cliente.DATA_NASCIMENTO);
        let faixa;
        if (idade < 18) faixa = 'Menor de 18';
        else if (idade < 30) faixa = '18-29';
        else if (idade < 50) faixa = '30-49';
        else if (idade < 65) faixa = '50-64';
        else faixa = '65+';
        
        acc[faixa] = (acc[faixa] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          total: clientes.data.length,
          ativos: clientesAtivos.length,
          inativos: clientes.data.length - clientesAtivos.length,
          porCidade,
          porIdade
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }
}

module.exports = new Cliente();