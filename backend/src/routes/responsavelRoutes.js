const express = require('express');
const router = express.Router();
const responsavelController = require('../controllers/responsavelController');
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Rotas públicas para usuários autenticados
router.get('/', responsavelController.listar);
router.get('/:id', responsavelController.buscarPorId);
router.get('/unidade/:unidade', responsavelController.listarPorUnidade);

// Rotas de administrador
router.post('/', verifyAdmin, validate('responsavel'), responsavelController.criar);
router.put('/:id', verifyAdmin, validate('responsavel'), responsavelController.atualizar);
router.delete('/:id', verifyAdmin, responsavelController.deletar);
router.get('/:id/estatisticas', verifyAdmin, responsavelController.estatisticas);

module.exports = router;