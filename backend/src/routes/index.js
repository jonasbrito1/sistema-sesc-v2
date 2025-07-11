const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./authRoutes');
const clienteRoutes = require('./clienteRoutes');
const responsavelRoutes = require('./responsavelRoutes');
const atividadeRoutes = require('./atividadeRoutes');
const inscricaoRoutes = require('./inscricaoRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');

// Rota de saúde da API
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

// Rota para estatísticas gerais (admin)
router.get('/dashboard/stats', async (req, res) => {
  try {
    const database = require('../config/database');
    
    // Buscar estatísticas básicas
    const totalClientes = await database.findAll('clientes');
    const totalAtividades = await database.findAll('atividades');
    const totalInscricoes = await database.findAll('inscricoes');
    const totalAvaliacoes = await database.findAll('avaliacoes');
    
    // Estatísticas por status
    const clientesAtivos = totalClientes.filter(c => c.status === 'ativo').length;
    const atividadesAtivas = totalAtividades.filter(a => a.status === 'ativa').length;
    const inscricoesConfirmadas = totalInscricoes.filter(i => i.statusInscricao === 'confirmada').length;
    
    // Receita total
    const receitaTotal = totalInscricoes
      .filter(i => i.statusInscricao === 'confirmada')
      .reduce((sum, i) => sum + (i.valorPago || 0), 0);
    
    // Média de avaliações
    const mediaAvaliacoes = totalAvaliacoes.length > 0 
      ? (totalAvaliacoes.reduce((sum, a) => sum + a.nota, 0) / totalAvaliacoes.length).toFixed(2)
      : 0;

    const stats = {
      resumo: {
        totalClientes: totalClientes.length,
        clientesAtivos,
        totalAtividades: totalAtividades.length,
        atividadesAtivas,
        totalInscricoes: totalInscricoes.length,
        inscricoesConfirmadas,
        totalAvaliacoes: totalAvaliacoes.length,
        receitaTotal,
        mediaAvaliacoes
      },
      inscricoesPorStatus: {
        pendente: totalInscricoes.filter(i => i.statusInscricao === 'pendente').length,
        confirmada: inscricoesConfirmadas,
        cancelada: totalInscricoes.filter(i => i.statusInscricao === 'cancelada').length
      },
      avaliacoesPorTipo: {
        elogio: totalAvaliacoes.filter(a => a.tipo === 'elogio').length,
        critica: totalAvaliacoes.filter(a => a.tipo === 'critica').length,
        sugestao: totalAvaliacoes.filter(a => a.tipo === 'sugestao').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

module.exports = router;