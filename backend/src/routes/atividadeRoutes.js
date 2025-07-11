const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rotas públicas
router.get('/', atividadeController.listar);
router.get('/:id', atividadeController.buscarPorId);
router.get('/unidade/:unidade', atividadeController.listarPorUnidade);

// Rotas protegidas
router.use(verifyToken);

// Rotas de administrador
router.post('/', verifyAdmin, validate('atividade'), atividadeController.criar);
router.put('/:id', verifyAdmin, validate('atividade'), atividadeController.atualizar);
router.delete('/:id', verifyAdmin, atividadeController.deletar);
router.get('/:id/estatisticas', verifyAdmin, atividadeController.estatisticas);

module.exports = router;