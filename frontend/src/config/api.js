// src/config/api.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  API_PREFIX: '/api',
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    
    // Clientes
    CLIENTES: '/clientes',
    CLIENTE_BY_ID: (id) => `/clientes/${id}`,
    BUSCAR_CEP: (cep) => `/clientes/cep/${cep}`,
    
    // Atividades
    ATIVIDADES: '/atividades',
    ATIVIDADE_BY_ID: (id) => `/atividades/${id}`,
    
    // Inscrições
    INSCRICOES: '/inscricoes',
    INSCRICAO_BY_ID: (id) => `/inscricoes/${id}`,
    
    // Avaliações
    AVALIACOES: '/avaliacoes',
    
    // Dashboard
    DASHBOARD_STATS: '/dashboard/stats',
    
    // Sistema
    HEALTH: '/health',
    TEST: '/test',
    ROUTES: '/routes'
  }
};

class ApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`✅ API Response:`, data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error(`❌ API Error: ${error.message}`);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos
  async checkHealth() {
    return this.get(API_CONFIG.ENDPOINTS.HEALTH);
  }

  async login(email, password) {
    return this.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
  }

  async register(userData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
  }

  async getAtividades() {
    return this.get(API_CONFIG.ENDPOINTS.ATIVIDADES);
  }

  async getAtividadeById(id) {
    return this.get(API_CONFIG.ENDPOINTS.ATIVIDADE_BY_ID(id));
  }

  async createInscricao(inscricaoData) {
    return this.post(API_CONFIG.ENDPOINTS.INSCRICOES, inscricaoData);
  }

  async getDashboardStats() {
    return this.get(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
  }

  async buscarCEP(cep) {
    return this.get(API_CONFIG.ENDPOINTS.BUSCAR_CEP(cep));
  }
}

const apiService = new ApiService();

export { API_CONFIG, ApiService };
export default apiService;
