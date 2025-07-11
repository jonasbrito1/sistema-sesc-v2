const jwt = require('jsonwebtoken');
const { auth } = require('../config/firebase');
const database = require('../config/database');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    try {
      // Tentar verificar como JWT (administradores)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const usuario = await database.findById('usuarios', decoded.id);
      if (!usuario || usuario.status !== 'ativo') {
        return res.status(401).json({
          success: false,
          message: 'Usuário inválido ou inativo'
        });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        tipo: decoded.tipo,
        nome: decoded.nome
      };

      return next();

    } catch (jwtError) {
      // Tentar verificar como token do Firebase
      try {
        const decodedToken = await auth.verifyIdToken(token);
        
        const cliente = await database.findAll('clientes', {
          email: { operator: '==', value: decodedToken.email }
        });

        if (cliente.length === 0 || cliente[0].status !== 'ativo') {
          return res.status(401).json({
            success: false,
            message: 'Cliente inválido ou inativo'
          });
        }

        req.user = {
          uid: decodedToken.uid,
          id: cliente[0].id,
          email: decodedToken.email,
          tipo: 'cliente',
          nome: cliente[0].nomeCliente,
          clienteId: cliente[0].id
        };

        return next();

      } catch (firebaseError) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    }

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.tipo !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões de administrador requeridas.'
    });
  }
  next();
};

const verifyCliente = (req, res, next) => {
  if (req.user?.tipo !== 'cliente') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas clientes podem acessar esta rota.'
    });
  }
  next();
};

const verifyOwnerOrAdmin = (paramField = 'id') => {
  return (req, res, next) => {
    const userId = req.params[paramField];
    
    if (req.user.tipo === 'admin') {
      return next();
    }
    
    if (req.user.tipo === 'cliente' && req.user.id === userId) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode acessar seus próprios dados.'
    });
  };
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyCliente,
  verifyOwnerOrAdmin
};
