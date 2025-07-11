const { auth } = require('../config/firebase');
const database = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await this.verificarAdministrador(email, password);
      if (admin) {
        const token = jwt.sign(
          { 
            id: admin.id, 
            email: admin.email, 
            tipo: 'admin',
            nome: admin.nome 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            token,
            usuario: {
              id: admin.id,
              email: admin.email,
              nome: admin.nome,
              tipo: 'admin'
            }
          }
        });
      }

      const cliente = await this.verificarCliente(email);
      if (cliente) {
        const userRecord = await auth.getUserByEmail(email);
        const customToken = await auth.createCustomToken(userRecord.uid, {
          tipo: 'cliente',
          clienteId: cliente.id
        });

        return res.json({
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            token: customToken,
            usuario: {
              id: cliente.id,
              email: cliente.email,
              nome: cliente.nomeCliente,
              tipo: 'cliente'
            }
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });

    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(401).json({
        success: false,
        message: 'Erro na autenticação'
      });
    }
  });

  registrarCliente = asyncHandler(async (req, res) => {
    const { email, password, ...dadosCliente } = req.body;

    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: dadosCliente.nomeCliente
      });

      const cliente = await database.create('clientes', {
        ...dadosCliente,
        email,
        status: 'ativo'
      });

      const customToken = await auth.createCustomToken(userRecord.uid, {
        tipo: 'cliente',
        clienteId: cliente.id
      });

      res.status(201).json({
        success: true,
        message: 'Cliente registrado com sucesso',
        data: {
          token: customToken,
          usuario: {
            id: cliente.id,
            email: cliente.email,
            nome: cliente.nomeCliente,
            tipo: 'cliente'
          }
        }
      });

    } catch (error) {
      console.error('Erro ao registrar cliente:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar cliente'
      });
    }
  });

  criarAdmin = asyncHandler(async (req, res) => {
    const { email, password, nome, permissoes = [] } = req.body;

    const adminExistente = await database.findAll('usuarios', {
      email: { operator: '==', value: email }
    });

    if (adminExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await database.create('usuarios', {
      email,
      password: hashedPassword,
      nome,
      tipo: 'admin',
      permissoes,
      status: 'ativo'
    });

    delete admin.password;

    res.status(201).json({
      success: true,
      message: 'Administrador criado com sucesso',
      data: admin
    });
  });

  logout = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  });

  verificarToken = asyncHandler(async (req, res) => {
    const usuario = req.user;

    let dadosUsuario;
    if (usuario.tipo === 'cliente') {
      dadosUsuario = await database.findById('clientes', usuario.clienteId);
    } else {
      dadosUsuario = await database.findById('usuarios', usuario.id);
    }

    res.json({
      success: true,
      data: {
        usuario: {
          id: dadosUsuario.id,
          email: dadosUsuario.email,
          nome: dadosUsuario.nomeCliente || dadosUsuario.nome,
          tipo: usuario.tipo
        }
      }
    });
  });

  async verificarAdministrador(email, password) {
    const admins = await database.findAll('usuarios', {
      email: { operator: '==', value: email },
      tipo: { operator: '==', value: 'admin' },
      status: { operator: '==', value: 'ativo' }
    });

    if (admins.length === 0) return null;

    const admin = admins[0];
    const senhaValida = await bcrypt.compare(password, admin.password);
    
    return senhaValida ? admin : null;
  }

  async verificarCliente(email) {
    const clientes = await database.findAll('clientes', {
      email: { operator: '==', value: email },
      status: { operator: '==', value: 'ativo' }
    });

    return clientes.length > 0 ? clientes[0] : null;
  }
}

module.exports = new AuthController();
