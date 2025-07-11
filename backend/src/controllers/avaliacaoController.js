// backend/src/controllers/avaliacaoController.js
const Avaliacao = require('../models/Avaliacao');

class AvaliacaoController {
  async criar(req, res) {
    try {
      const resultado = await Avaliacao.criar(req.body);
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
        tipo: req.query.tipo,
        categoria: req.query.categoria,
        status: req.query.status,
        idAtividade: req.query.idAtividade,
        idCliente: req.query.idCliente
      };

      const resultado = await Avaliacao.buscarTodos(filtros);
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
      const resultado = await Avaliacao.buscarPorId(req.params.id);
      
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

  async responder(req, res) {
    try {
      const dadosResposta = {
        RESPOSTA: req.body.resposta,
        RESPONDIDO_POR: req.body.respondidoPor || 'Administrador',
        RESPOSTA_AUTOMATICA: req.body.respostaAutomatica || false
      };

      const resultado = await Avaliacao.responder(req.params.id, dadosResposta);
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
      const resultado = await Avaliacao.obterEstatisticas();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPendentes(req, res) {
    try {
      const resultado = await Avaliacao.buscarPendentes();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new AvaliacaoController();
