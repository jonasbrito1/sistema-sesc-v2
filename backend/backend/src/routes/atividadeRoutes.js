const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Rotas públicas
router.get('/', atividadeController.listar);
router.get('/:id', atividadeController.buscarPorId);

// Rotas protegidas
router.use(verifyToken);

router.post('/', verifyAdmin, validate('atividade'), atividadeController.criar);
router.put('/:id', verifyAdmin, validate('atividade'), atividadeController.atualizar);
router.delete('/:id', verifyAdmin, atividadeController.excluir);
router.get('/admin/estatisticas', verifyAdmin, atividadeController.obterEstatisticas);

module.exports = router;
