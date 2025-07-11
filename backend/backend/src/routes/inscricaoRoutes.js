const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');
const { verifyToken, verifyAdmin, verifyOwnerOrAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(verifyToken);

router.post('/', validate('inscricao'), inscricaoController.criar);
router.get('/', verifyAdmin, inscricaoController.listar);
router.get('/:id', verifyOwnerOrAdmin('idCliente'), inscricaoController.buscarPorId);

router.put('/:id/confirmar', verifyAdmin, inscricaoController.confirmar);
router.put('/:id/cancelar', verifyOwnerOrAdmin('idCliente'), inscricaoController.cancelar);

router.get('/cliente/:idCliente', verifyOwnerOrAdmin('idCliente'), inscricaoController.buscarPorCliente);
router.get('/atividade/:idAtividade', verifyAdmin, inscricaoController.buscarPorAtividade);
router.get('/admin/estatisticas', verifyAdmin, inscricaoController.obterEstatisticas);

module.exports = router;
