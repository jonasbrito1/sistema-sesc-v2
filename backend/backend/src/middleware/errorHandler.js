const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('🚨 Erro:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: message.join(', ')
    };
  }

  // Erro de recurso não encontrado
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = {
      statusCode: 404,
      message
    };
  }

  // Erro de duplicação
  if (err.code === 11000) {
    const message = 'Dados duplicados';
    error = {
      statusCode: 400,
      message
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor'
  });
};

module.exports = {
  asyncHandler,
  errorHandler
};
