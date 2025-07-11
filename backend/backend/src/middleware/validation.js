const { body, validationResult } = require('express-validator');

const validate = (type) => {
  switch (type) {
    case 'cliente':
      return [
        body('nomeCliente').notEmpty().withMessage('Nome é obrigatório'),
        body('email').isEmail().withMessage('Email inválido'),
        body('dataNascimento').isISO8601().withMessage('Data de nascimento inválida'),
        body('cep').matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido'),
        handleValidationErrors
      ];
      
    case 'responsavel':
      return [
        body('nomeResponsavel').notEmpty().withMessage('Nome é obrigatório'),
        body('matricula').notEmpty().withMessage('Matrícula é obrigatória'),
        body('email').isEmail().withMessage('Email inválido'),
        handleValidationErrors
      ];
      
    case 'atividade':
      return [
        body('nomeAtividade').notEmpty().withMessage('Nome da atividade é obrigatório'),
        body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
        body('unidadeSesc').notEmpty().withMessage('Unidade SESC é obrigatória'),
        body('idResponsavel').notEmpty().withMessage('Responsável é obrigatório'),
        handleValidationErrors
      ];
      
    case 'inscricao':
      return [
        body('idCliente').notEmpty().withMessage('Cliente é obrigatório'),
        body('idAtividade').notEmpty().withMessage('Atividade é obrigatória'),
        handleValidationErrors
      ];
      
    case 'avaliacao':
      return [
        body('tipo').isIn(['elogio', 'critica', 'sugestao']).withMessage('Tipo inválido'),
        body('titulo').notEmpty().withMessage('Título é obrigatório'),
        body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
        handleValidationErrors
      ];
      
    default:
      return [handleValidationErrors];
  }
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

module.exports = { validate };
