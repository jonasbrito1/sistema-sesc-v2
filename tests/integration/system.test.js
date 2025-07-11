// Teste de Integração - Sistema SESC
// Este arquivo demonstra como criar testes de integração

const request = require('supertest');
const app = require('../../backend/src/app');

describe('Integração SESC', () => {
  test('Sistema deve estar online', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('ONLINE');
  });

  test('API deve retornar lista de atividades', async () => {
    const response = await request(app)
      .get('/api/atividades')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('Sistema deve validar CEP', async () => {
    const response = await request(app)
      .get('/api/clientes/cep/01310-100')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.cidade).toBeDefined();
  });
});
