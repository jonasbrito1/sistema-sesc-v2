﻿const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin, verifyOwnerOrAdmin } = require('../middleware/auth');

// Buscar endereço por CEP (rota pública)
router.get('/cep/:cep', clienteController.buscarCEP);

// Rotas protegidas
router.use(verifyToken);

// CRUD básico
router.post('/', validate('cliente'), clienteController.criar);
router.get('/', verifyAdmin, clienteController.listar);
router.get('/estatisticas', verifyAdmin, clienteController.obterEstatisticas);
router.get('/:id', verifyOwnerOrAdmin('id'), clienteController.buscarPorId);
router.put('/:id', verifyOwnerOrAdmin('id'), validate('cliente'), clienteController.atualizar);
router.delete('/:id', verifyOwnerOrAdmin('id'), clienteController.excluir);

module.exports = router;
