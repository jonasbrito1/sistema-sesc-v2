const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin, verifyOwnerOrAdmin } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// CRUD básico
router.post('/', validate('avaliacao'), avaliacaoController.criar);
router.get('/', verifyAdmin, avaliacaoController.listar);
router.get('/:id', avaliacaoController.buscarPorId);

// Ações específicas
router.put('/:id/responder', verifyAdmin, avaliacaoController.responder);

// Estatísticas e análises
router.get('/admin/estatisticas', verifyAdmin, avaliacaoController.estatisticas);
router.get('/admin/sentimentos', verifyAdmin, avaliacaoController.analiseSentimentos);

module.exports = router;