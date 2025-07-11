const { db } = require('./firebase');

class Database {
  constructor() {
    this.db = db;
  }

  // Métodos genéricos para CRUD
  async create(collection, data) {
    try {
      const docRef = await this.db.collection(collection).add({
        ...data,
        dataCriacao: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Erro ao criar documento: ${error.message}`);
    }
  }

  async findById(collection, id) {
    try {
      const doc = await this.db.collection(collection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }
  }

  async findAll(collection, filters = {}, orderBy = null, limit = null) {
    try {
      let query = this.db.collection(collection);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        const filter = filters[key];
        if (filter.operator && filter.value !== undefined) {
          query = query.where(key, filter.operator, filter.value);
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      // Aplicar limite
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }
  }

  async update(collection, id, data) {
    try {
      const docRef = this.db.collection(collection).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Documento não encontrado');
      }

      await docRef.update({
        ...data,
        dataAtualizacao: new Date()
      });

      return { id, ...data };
    } catch (error) {
      throw new Error(`Erro ao atualizar documento: ${error.message}`);
    }
  }

  async delete(collection, id) {
    try {
      const docRef = this.db.collection(collection).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Documento não encontrado');
      }

      await docRef.delete();
      return { id, deleted: true };
    } catch (error) {
      throw new Error(`Erro ao deletar documento: ${error.message}`);
    }
  }

  // Método para busca com paginação
  async findWithPagination(collection, page = 1, limit = 10, filters = {}, orderBy = null) {
    try {
      let query = this.db.collection(collection);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        const filter = filters[key];
        if (filter.operator && filter.value !== undefined) {
          query = query.where(key, filter.operator, filter.value);
        }
      });

      // Aplicar ordenação
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      // Calcular offset
      const offset = (page - 1) * limit;
      
      // Buscar total de documentos
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      // Aplicar paginação
      const snapshot = await query.offset(offset).limit(limit).get();
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Erro na busca paginada: ${error.message}`);
    }
  }

  // Método para transações
  async runTransaction(operations) {
    return this.db.runTransaction(async (transaction) => {
      const results = [];
      
      for (const operation of operations) {
        const { type, collection, id, data } = operation;
        const docRef = this.db.collection(collection).doc(id);

        switch (type) {
          case 'create':
            transaction.set(docRef, { ...data, dataCriacao: new Date() });
            results.push({ id, ...data });
            break;
          case 'update':
            transaction.update(docRef, { ...data, dataAtualizacao: new Date() });
            results.push({ id, ...data });
            break;
          case 'delete':
            transaction.delete(docRef);
            results.push({ id, deleted: true });
            break;
        }
      }
      
      return results;
    });
  }
}

module.exports = new Database();