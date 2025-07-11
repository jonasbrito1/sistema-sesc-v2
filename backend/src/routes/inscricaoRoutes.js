const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin, verifyOwnerOrAdmin } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// CRUD básico
router.post('/', validate('inscricao'), inscricaoController.criar);
router.get('/', verifyAdmin, inscricaoController.listar);
router.get('/:id', verifyOwnerOrAdmin('idCliente'), inscricaoController.buscarPorId);

// Ações específicas
router.put('/:id/confirmar', verifyAdmin, inscricaoController.confirmar);
router.put('/:id/cancelar', verifyOwnerOrAdmin('idCliente'), inscricaoController.cancelar);

// Listagens específicas
router.get('/cliente/:idCliente', verifyOwnerOrAdmin('idCliente'), inscricaoController.listarPorCliente);
router.get('/atividade/:idAtividade', verifyAdmin, inscricaoController.listarPorAtividade);

// Relatórios
router.get('/admin/relatorio', verifyAdmin, inscricaoController.relatorio);

module.exports = router;