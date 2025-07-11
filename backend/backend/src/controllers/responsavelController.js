const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class ResponsavelController {
  criar = asyncHandler(async (req, res) => {
    const dadosResponsavel = req.body;

    const responsavelExistente = await database.findAll('responsaveis', {
      matricula: { operator: '==', value: dadosResponsavel.matricula }
    });

    if (responsavelExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Matrícula já cadastrada'
      });
    }

    const emailExistente = await database.findAll('responsaveis', {
      email: { operator: '==', value: dadosResponsavel.email }
    });

    if (emailExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const responsavel = await database.create('responsaveis', {
      ...dadosResponsavel,
      status: 'ativo'
    });

    res.status(201).json({
      success: true,
      message: 'Responsável criado com sucesso',
      data: responsavel
    });
  });

  listar = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, nome, matricula, unidade, status } = req.query;
    
    const filters = {};
    
    if (nome) filters.nomeResponsavel = { operator: '>=', value: nome };
    if (matricula) filters.matricula = { operator: '==', value: matricula };
    if (unidade) filters.unidadeSesc = { operator: '==', value: unidade };
    if (status) filters.status = { operator: '==', value: status };

    const resultado = await database.findWithPagination(
      'responsaveis',
      parseInt(page),
      parseInt(limit),
      filters,
      { field: 'nomeResponsavel', direction: 'asc' }
    );

    res.json({
      success: true,
      data: resultado.data,
      pagination: resultado.pagination
    });
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const responsavel = await database.findById('responsaveis', id);
    
    if (!responsavel) {
      return res.status(404).json({
        success: false,
        message: 'Responsável não encontrado'
      });
    }

    const atividades = await database.findAll('atividades', {
      idResponsavel: { operator: '==', value: id }
    });

    responsavel.atividades = atividades;

    res.json({
      success: true,
      data: responsavel
    });
  });

  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    const responsavelExistente = await database.findById('responsaveis', id);
    if (!responsavelExistente) {
      return res.status(404).json({
        success: false,
        message: 'Responsável não encontrado'
      });
    }

    const responsavel = await database.update('responsaveis', id, dadosAtualizacao);

    res.json({
      success: true,
      message: 'Responsável atualizado com sucesso',
      data: responsavel
    });
  });

  excluir = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const responsavel = await database.findById('responsaveis', id);
    if (!responsavel) {
      return res.status(404).json({
        success: false,
        message: 'Responsável não encontrado'
      });
    }

    const atividadesAtivas = await database.findAll('atividades', {
      idResponsavel: { operator: '==', value: id },
      status: { operator: '==', value: 'ativa' }
    });

    if (atividadesAtivas.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir responsável com atividades ativas'
      });
    }

    await database.delete('responsaveis', id);

    res.json({
      success: true,
      message: 'Responsável excluído com sucesso'
    });
  });

  obterEstatisticas = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const responsavel = await database.findById('responsaveis', id);
    if (!responsavel) {
      return res.status(404).json({
        success: false,
        message: 'Responsável não encontrado'
      });
    }

    const atividades = await database.findAll('atividades', {
      idResponsavel: { operator: '==', value: id }
    });

    const estatisticas = {
      totalAtividades: atividades.length,
      atividadesAtivas: atividades.filter(a => a.status === 'ativa').length,
      atividadesInativas: atividades.filter(a => a.status === 'inativa').length
    };

    res.json({
      success: true,
      data: estatisticas
    });
  });
}

module.exports = new ResponsavelController();
