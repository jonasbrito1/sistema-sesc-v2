const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const responsavelRoutes = require('./responsavelRoutes');
const atividadeRoutes = require('./atividadeRoutes');
const inscricaoRoutes = require('./inscricaoRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API do SESC funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/responsaveis', responsavelRoutes);
router.use('/atividades', atividadeRoutes);
router.use('/inscricoes', inscricaoRoutes);
router.use('/avaliacoes', avaliacaoRoutes);

// Rota 404
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

module.exports = router;
