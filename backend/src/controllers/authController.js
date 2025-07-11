const { auth } = require('../config/firebase');
const database = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // Login
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      // Verificar se é um administrador (usuário customizado)
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

      // Verificar se é um cliente (Firebase Auth)
      const cliente = await this.verificarCliente(email);
      if (cliente) {
        // Para clientes, usar Firebase Auth
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

  // Registrar cliente
  registrarCliente = asyncHandler(async (req, res) => {
    const { email, password, ...dadosCliente } = req.body;

    try {
      // Criar usuário no Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: dadosCliente.nomeCliente
      });

      // Criar cliente no Firestore
      const cliente = await database.create('clientes', {
        ...dadosCliente,
        email,
        status: 'ativo'
      });

      // Criar registro de usuário
      await database.create('usuarios', {
        id: userRecord.uid,
        email,
        nome: dadosCliente.nomeCliente,
        tipo: 'cliente',
        status: 'ativo'
      });

      // Gerar token customizado
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

  // Criar administrador
  criarAdmin = asyncHandler(async (req, res) => {
    const { email, password, nome, permissoes = [] } = req.body;

    // Verificar se email já existe
    const adminExistente = await database.findAll('usuarios', {
      email: { operator: '==', value: email }
    });

    if (adminExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar administrador
    const admin = await database.create('usuarios', {
      email,
      password: hashedPassword,
      nome,
      tipo: 'admin',
      permissoes,
      status: 'ativo'
    });

    // Remover senha da resposta
    delete admin.password;

    res.status(201).json({
      success: true,
      message: 'Administrador criado com sucesso',
      data: admin
    });
  });

  // Logout
  logout = asyncHandler(async (req, res) => {
    // Para Firebase, o logout é feito no frontend
    // Aqui podemos invalidar tokens ou registrar o logout
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  });

  // Verificar token
  verificarToken = asyncHandler(async (req, res) => {
    const usuario = req.user;

    // Buscar dados atualizados do usuário
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

  // Alterar senha
  alterarSenha = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const usuario = req.user;

    if (usuario.tipo === 'admin') {
      // Para administradores, verificar senha atual
      const admin = await database.findById('usuarios', usuario.id);
      const senhaValida = await bcrypt.compare(currentPassword, admin.password);
      
      if (!senhaValida) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Atualizar senha
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await database.update('usuarios', usuario.id, {
        password: hashedPassword
      });

    } else {
      // Para clientes, usar Firebase Auth
      await auth.updateUser(usuario.uid, {
        password: newPassword
      });
    }

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  });

  // Recuperar senha
  recuperarSenha = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
      // Verificar se é cliente (Firebase Auth)
      const cliente = await this.verificarCliente(email);
      if (cliente) {
        // Gerar link de recuperação do Firebase
        const link = await auth.generatePasswordResetLink(email);
        
        // Aqui você enviaria o email com o link
        // await emailService.enviarEmailRecuperacaoSenha(email, link);
        
        return res.json({
          success: true,
          message: 'Email de recuperação enviado'
        });
      }

      // Para administradores, implementar lógica customizada
      const admin = await database.findAll('usuarios', {
        email: { operator: '==', value: email },
        tipo: { operator: '==', value: 'admin' }
      });

      if (admin.length > 0) {
        // Gerar token de recuperação
        const resetToken = jwt.sign(
          { id: admin[0].id, email: admin[0].email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        // Aqui você enviaria o email com o token
        // await emailService.enviarEmailRecuperacaoSenhaAdmin(email, resetToken);

        return res.json({
          success: true,
          message: 'Email de recuperação enviado'
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Email não encontrado'
      });

    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar recuperação de senha'
      });
    }
  });

  // Métodos auxiliares
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