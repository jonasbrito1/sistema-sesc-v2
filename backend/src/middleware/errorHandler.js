const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Erro de validação do Joi
  if (err.isJoi) {
    const errors = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Erro do Firebase
  if (err.code && err.code.startsWith('auth/')) {
    const firebaseErrors = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
    };

    return res.status(400).json({
      success: false,
      message: firebaseErrors[err.code] || 'Erro de autenticação',
      code: err.code
    });
  }

  // Erro de duplicação (MongoDB/Firestore)
  if (err.code === 11000 || err.message.includes('already exists')) {
    return res.status(409).json({
      success: false,
      message: 'Recurso já existe',
      field: Object.keys(err.keyPattern || {})[0]
    });
  }

  // Erro de casting/conversão
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      field: err.path
    });
  }

  // Erro de rate limit
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: err.retryAfter
    });
  }

  // Erro padrão
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};