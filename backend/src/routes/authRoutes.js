const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rotas públicas
router.post('/login', validate('login'), authController.login);
router.post('/register', validate('cliente'), authController.registrarCliente);
router.post('/forgot-password', authController.recuperarSenha);

// Rotas protegidas
router.post('/logout', verifyToken, authController.logout);
router.get('/verify', verifyToken, authController.verificarToken);
router.put('/change-password', verifyToken, validate('updatePassword'), authController.alterarSenha);

// Rotas de administrador
router.post('/admin', verifyToken, verifyAdmin, authController.criarAdmin);

module.exports = router;