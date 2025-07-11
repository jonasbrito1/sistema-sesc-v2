const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(verifyToken);

router.post('/', validate('avaliacao'), avaliacaoController.criar);
router.get('/', verifyAdmin, avaliacaoController.listar);
router.get('/:id', avaliacaoController.buscarPorId);

router.put('/:id/responder', verifyAdmin, avaliacaoController.responder);
router.get('/pendentes', verifyAdmin, avaliacaoController.buscarPendentes);
router.get('/admin/estatisticas', verifyAdmin, avaliacaoController.obterEstatisticas);

module.exports = router;
