const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers/clienteController'); // ou authController se estiver separado
const { validate } = require('../middleware/validation');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Se AuthController não existir no arquivo, mantenha como está ou crie separado
