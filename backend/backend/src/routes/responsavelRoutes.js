const express = require('express');
const router = express.Router();
const responsavelController = require('../controllers/responsavelController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(verifyToken);

router.get('/', responsavelController.listar);
router.get('/:id', responsavelController.buscarPorId);

router.post('/', verifyAdmin, validate('responsavel'), responsavelController.criar);
router.put('/:id', verifyAdmin, validate('responsavel'), responsavelController.atualizar);
router.delete('/:id', verifyAdmin, responsavelController.excluir);
router.get('/:id/estatisticas', verifyAdmin, responsavelController.obterEstatisticas);

module.exports = router;
