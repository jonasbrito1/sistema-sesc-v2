const { auth } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar se é um token JWT personalizado ou Firebase token
    if (token.startsWith('eyJ')) {
      // JWT personalizado
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } else {
      // Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões de administrador requeridas.'
    });
  }
  next();
};

const verifyOwnerOrAdmin = (resourceField = 'idCliente') => {
  return (req, res, next) => {
    const userId = req.user.uid || req.user.id;
    const resourceUserId = req.body[resourceField] || req.params[resourceField];
    
    if (req.user.tipo === 'admin' || userId === resourceUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos.'
      });
    }
  };
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyOwnerOrAdmin
};
