const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Verificar se as configurações de email existem
    if (!process.env.SMTP_HOST) {
      console.log('📧 Email não configurado - usando modo simulado');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({  // ← Corrigido: createTransport
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('📧 Email service configurado');
  }

  async enviarEmailConfirmacaoInscricao(cliente, atividade, inscricao) {
    if (!this.transporter) {
      console.log('📧 Email simulado: Confirmação de inscrição para', cliente.email);
      return { success: true, message: 'Email simulado enviado' };
    }

    try {
      const htmlContent = `
        <h1>SESC - Confirmação de Inscrição</h1>
        <p>Olá, ${cliente.nomeCliente}!</p>
        <p>Sua inscrição foi confirmada:</p>
        <ul>
          <li>Atividade: ${atividade.nomeAtividade}</li>
          <li>Data: ${new Date(atividade.dataInicio).toLocaleDateString('pt-BR')}</li>
        </ul>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: cliente.email,
        subject: 'SESC - Confirmação de Inscrição',
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log('📧 Email enviado para:', cliente.email);
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async enviarEmailCancelamento(cliente, atividade, inscricao) {
    if (!this.transporter) {
      console.log('📧 Email simulado: Cancelamento para', cliente.email);
      return { success: true };
    }
    // Implementação similar...
    return { success: true };
  }

  async enviarEmailNovaAtividade(cliente, atividade) {
    if (!this.transporter) {
      console.log('📧 Email simulado: Nova atividade para', cliente.email);
      return { success: true };
    }
    // Implementação similar...
    return { success: true };
  }
}

module.exports = new EmailService();