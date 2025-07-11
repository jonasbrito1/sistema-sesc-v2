// backend/src/controllers/atividadeController.js  
const Atividade = require('../models/Atividade');

class AtividadeController {
  async criar(req, res) {
    try {
      const resultado = await Atividade.criar(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async listar(req, res) {
    try {
      const resultado = await Atividade.buscarTodos(req.query);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await Atividade.buscarPorId(req.params.id);
      if (!resultado.success) return res.status(404).json(resultado);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const resultado = await Atividade.atualizar(req.params.id, req.body);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async excluir(req, res) {
    try {
      const resultado = await Atividade.excluir(req.params.id);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async obterEstatisticas(req, res) {
    try {
      const resultado = await Atividade.obterEstatisticas();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AtividadeController();
