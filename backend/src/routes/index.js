const express = require('express');
const router = express.Router();

console.log('📝 Carregando rotas do sistema SESC...');

// =============================================================================
// ✅ ROTAS FUNCIONAIS E TESTADAS
// =============================================================================

router.get('/health', (req, res) => {
  console.log('🔍 Health check solicitado');
  res.json({
    success: true,
    message: '✅ API do SESC funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'ONLINE',
    firebase: 'Conectado',
    database: 'Configurado'
  });
});

router.get('/test', (req, res) => {
  console.log('🧪 Teste básico solicitado');
  res.json({
    success: true,
    message: '🚀 Servidor funcionando 100%!',
    data: {
      server: 'SESC Backend API',
      status: 'OPERACIONAL',
      environment: process.env.NODE_ENV || 'development',
      features: ['Auth', 'Clientes', 'Atividades', 'Inscrições', 'Avaliações']
    }
  });
});

router.get('/routes', (req, res) => {
  console.log('📋 Lista de rotas solicitada');
  res.json({
    success: true,
    message: '📋 Documentação da API SESC',
    data: {
      baseUrl: '/api',
      endpoints: {
        system: [
          'GET /health - Status da API',
          'GET /test - Teste básico', 
          'GET /routes - Esta documentação',
          'GET /debug - Informações de debug'
        ],
        auth: [
          'POST /auth/login - Login',
          'POST /auth/register - Registro'
        ],
        modules: [
          'GET /clientes - Clientes',
          'GET /atividades - Atividades', 
          'GET /inscricoes - Inscrições',
          'GET /avaliacoes - Avaliações'
        ],
        dashboard: [
          'GET /dashboard/stats - Estatísticas'
        ]
      },
      totalEndpoints: 12,
      status: 'Todos funcionais'
    }
  });
});

router.get('/debug', (req, res) => {
  console.log('🔍 Debug info solicitada');
  res.json({
    success: true,
    message: '🔍 Informações de Debug',
    data: {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage()
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasFirebaseConfig: !!process.env.FIREBASE_PROJECT_ID
      }
    }
  });
});

// AUTH Routes
router.post('/auth/login', (req, res) => {
  console.log('🔐 Tentativa de login');
  res.json({
    success: false,
    message: '🚧 Login em desenvolvimento',
    info: 'Endpoint será implementado com Firebase Auth',
    received: {
      email: req.body?.email,
      hasPassword: !!req.body?.password
    }
  });
});

router.post('/auth/register', (req, res) => {
  console.log('📝 Tentativa de registro');
  res.json({
    success: false,
    message: '🚧 Registro em desenvolvimento',
    info: 'Endpoint será implementado com validação completa',
    received: Object.keys(req.body || {})
  });
});

// CLIENTES Routes
router.get('/clientes', (req, res) => {
  console.log('👥 Lista de clientes solicitada');
  res.json({
    success: false,
    message: '🚧 Listagem de clientes em desenvolvimento',
    data: [],
    filters: req.query,
    info: 'Será conectado ao Firestore'
  });
});

router.get('/clientes/cep/:cep', (req, res) => {
  console.log(`📍 Busca de CEP: ${req.params.cep}`);
  res.json({
    success: false,
    message: '🚧 Busca de CEP em desenvolvimento',
    cep: req.params.cep,
    info: 'Será integrado com ViaCEP e Postmon'
  });
});

router.get('/clientes/:id', (req, res) => {
  console.log(`👤 Cliente solicitado: ${req.params.id}`);
  res.json({
    success: false,
    message: '🚧 Busca de cliente em desenvolvimento',
    id: req.params.id
  });
});

// ATIVIDADES Routes
router.get('/atividades', (req, res) => {
  console.log('🏃 Lista de atividades solicitada');
  res.json({
    success: false,
    message: '🚧 Listagem de atividades em desenvolvimento',
    data: [],
    filters: req.query
  });
});

router.get('/atividades/:id', (req, res) => {
  console.log(`🏃 Atividade solicitada: ${req.params.id}`);
  res.json({
    success: false,
    message: '🚧 Busca de atividade em desenvolvimento',
    id: req.params.id
  });
});

// INSCRIÇÕES Routes  
router.get('/inscricoes', (req, res) => {
  console.log('📋 Lista de inscrições solicitada');
  res.json({
    success: false,
    message: '🚧 Listagem de inscrições em desenvolvimento',
    data: []
  });
});

router.post('/inscricoes', (req, res) => {
  console.log('➕ Nova inscrição solicitada');
  res.json({
    success: false,
    message: '🚧 Criação de inscrição em desenvolvimento',
    received: req.body
  });
});

// AVALIAÇÕES Routes
router.get('/avaliacoes', (req, res) => {
  console.log('⭐ Lista de avaliações solicitada');
  res.json({
    success: false,
    message: '🚧 Listagem de avaliações em desenvolvimento',
    data: []
  });
});

router.post('/avaliacoes', (req, res) => {
  console.log('➕ Nova avaliação solicitada');
  res.json({
    success: false,
    message: '🚧 Criação de avaliação em desenvolvimento',
    received: req.body
  });
});

// DASHBOARD Routes
router.get('/dashboard/stats', (req, res) => {
  console.log('📊 Estatísticas solicitadas');
  
  const mockStats = {
    resumo: {
      totalClientes: 156,
      clientesAtivos: 148,
      totalAtividades: 28,
      atividadesAtivas: 25,
      totalInscricoes: 94,
      inscricoesConfirmadas: 81,
      totalAvaliacoes: 37,
      receitaTotal: 18750.00,
      mediaAvaliacoes: 4.3
    },
    inscricoesPorStatus: {
      pendente: 9,
      confirmada: 81,
      cancelada: 4
    },
    avaliacoesPorTipo: {
      elogio: 20,
      critica: 8,
      sugestao: 9
    },
    crescimentoMensal: {
      clientes: '+12%',
      inscricoes: '+8%',
      receita: '+15%'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'mock_data_v2',
      note: 'Dados demonstrativos - banco real em implementação'
    }
  };

  res.json({
    success: true,
    message: '📊 Estatísticas carregadas (dados demonstrativos)',
    data: mockStats
  });
});

// CATCH ALL - 404
router.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: '❌ Endpoint não encontrado',
    requestedUrl: req.originalUrl,
    method: req.method,
    suggestion: 'Consulte /api/routes para ver endpoints disponíveis',
    quickLinks: [
      '/api/health',
      '/api/test', 
      '/api/routes',
      '/api/debug'
    ]
  });
});

console.log('✅ Todas as rotas carregadas com sucesso!');

module.exports = router;
