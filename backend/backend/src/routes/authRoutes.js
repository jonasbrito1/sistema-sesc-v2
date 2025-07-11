const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Rotas públicas
router.post('/login', authController.login);
router.post('/registrar-cliente', validate('cliente'), authController.registrarCliente);

// Rotas protegidas
router.use(verifyToken);
router.get('/verificar-token', authController.verificarToken);
router.post('/logout', authController.logout);
router.post('/criar-admin', authController.criarAdmin);

module.exports = router;
