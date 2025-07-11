const { Responsavel } = require('../models');

class ResponsavelController {
  async criar(req, res) {
    try {
      const resultado = await Responsavel.criar(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async listar(req, res) {
    try {
      const filtros = {
        status: req.query.status,
        unidade: req.query.unidade,
        departamento: req.query.departamento,
        ordenacao: req.query.ordenacao,
        direcao: req.query.direcao,
        limite: req.query.limite
      };

      const resultado = await Responsavel.buscarTodos(filtros);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await Responsavel.buscarPorId(req.params.id);
      
      if (!resultado.success) {
        return res.status(404).json(resultado);
      }
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async atualizar(req, res) {
    try {
      const resultado = await Responsavel.atualizar(req.params.id, req.body);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async excluir(req, res) {
    try {
      const resultado = await Responsavel.excluir(req.params.id);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorMatricula(req, res) {
    try {
      const resultado = await Responsavel.buscarPorMatricula(req.params.matricula);
      
      if (!resultado.success) {
        return res.status(404).json(resultado);
      }
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorUnidade(req, res) {
    try {
      const resultado = await Responsavel.buscarPorUnidade(req.params.unidade);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async adicionarEspecialidade(req, res) {
    try {
      const { especialidade } = req.body;
      const resultado = await Responsavel.adicionarEspecialidade(req.params.id, especialidade);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async removerEspecialidade(req, res) {
    try {
      const { especialidade } = req.body;
      const resultado = await Responsavel.removerEspecialidade(req.params.id, especialidade);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async obterEstatisticas(req, res) {
    try {
      const resultado = await Responsavel.obterEstatisticas();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new ResponsavelController();
