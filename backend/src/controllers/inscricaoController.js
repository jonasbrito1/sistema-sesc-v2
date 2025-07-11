// backend/src/controllers/inscricaoController.js
const Inscricao = require('../models/Inscricao');
const Cliente = require('../models/Cliente');
const Atividade = require('../models/Atividade');

class InscricaoController {
  async criar(req, res) {
    try {
      const resultado = await Inscricao.criar(req.body);
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
        idCliente: req.query.idCliente,
        idAtividade: req.query.idAtividade
      };

      const resultado = await Inscricao.buscarTodos(filtros);
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
      const resultado = await Inscricao.buscarPorId(req.params.id);
      
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

  async confirmar(req, res) {
    try {
      const resultado = await Inscricao.atualizar(req.params.id, { 
        STATUS_INSCRICAO: 'confirmada' 
      });
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async cancelar(req, res) {
    try {
      const resultado = await Inscricao.cancelar(req.params.id);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorCliente(req, res) {
    try {
      const filtros = { 
        idCliente: req.params.idCliente,
        status: req.query.status
      };
      
      const resultado = await Inscricao.buscarTodos(filtros);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async buscarPorAtividade(req, res) {
    try {
      const filtros = { 
        idAtividade: req.params.idAtividade,
        status: req.query.status
      };
      
      const resultado = await Inscricao.buscarTodos(filtros);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async obterEstatisticas(req, res) {
    try {
      const resultado = { 
        success: true, 
        data: { 
          message: 'Estatísticas de inscrições em desenvolvimento',
          total: 0,
          confirmadas: 0,
          pendentes: 0,
          canceladas: 0
        } 
      };
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new InscricaoController();
