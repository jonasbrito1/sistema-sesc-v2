const Joi = require('joi');

// Esquemas de validação
const schemas = {
  cliente: Joi.object({
    nomeCliente: Joi.string().min(2).max(100).required(),
    dataNascimento: Joi.date().max('now').required(),
    logradouro: Joi.string().min(5).max(200).required(),
    numero: Joi.string().max(10).required(),
    bairro: Joi.string().min(2).max(100).required(),
    cidade: Joi.string().min(2).max(100).required(),
    estado: Joi.string().length(2).required(),
    cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).required(),
    email: Joi.string().email().required(),
    telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required()
  }),

  atividade: Joi.object({
    nomeAtividade: Joi.string().min(3).max(150).required(),
    descricao: Joi.string().min(10).max(1000).required(),
    unidadeSesc: Joi.string().min(2).max(100).required(),
    idResponsavel: Joi.string().required(),
    dataInicio: Joi.date().min('now').required(),
    dataFim: Joi.date().greater(Joi.ref('dataInicio')).required(),
    vagas: Joi.number().integer().min(1).max(1000).required(),
    preco: Joi.number().min(0).required()
  }),

  responsavel: Joi.object({
    nomeResponsavel: Joi.string().min(2).max(100).required(),
    matricula: Joi.string().min(5).max(20).required(),
    email: Joi.string().email().required(),
    telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required(),
    unidadeSesc: Joi.string().min(2).max(100).required()
  }),

  inscricao: Joi.object({
    idCliente: Joi.string().required(),
    idAtividade: Joi.string().required(),
    observacoes: Joi.string().max(500).optional()
  }),

  avaliacao: Joi.object({
    idCliente: Joi.string().required(),
    idAtividade: Joi.string().optional(),
    titulo: Joi.string().min(5).max(100).required(),
    comentario: Joi.string().min(10).max(1000).required(),
    nota: Joi.number().integer().min(1).max(5).required(),
    tipo: Joi.string().valid('elogio', 'critica', 'sugestao').required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }

    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Parâmetros de consulta inválidos',
        errors
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  schemas
};