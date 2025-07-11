const axios = require('axios');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
  }

  async gerarRespostaAvaliacao(avaliacao) {
    try {
      let resposta;

      // Priorizar Gemini se disponível, senão usar OpenAI
      if (this.geminiApiKey) {
        resposta = await this.gerarRespostaGemini(avaliacao);
      } else if (this.openaiApiKey) {
        resposta = await this.gerarRespostaOpenAI(avaliacao);
      } else {
        return this.gerarRespostaPadrao(avaliacao);
      }

      return resposta;
    } catch (error) {
      console.error('Erro ao gerar resposta com IA:', error);
      return this.gerarRespostaPadrao(avaliacao);
    }
  }

  async gerarRespostaGemini(avaliacao) {
    const prompt = this.criarPromptResposta(avaliacao);
    
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw new Error('Erro ao comunicar com Gemini API');
    }
  }

  async gerarRespostaOpenAI(avaliacao) {
    const prompt = this.criarPromptResposta(avaliacao);
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente do SESC que responde avaliações de clientes de forma profissional e empática.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error('Erro ao comunicar com OpenAI API');
    }
  }

  criarPromptResposta(avaliacao) {
    const tipoTexto = {
      'elogio': 'elogio',
      'critica': 'crítica',
      'sugestao': 'sugestão'
    };

    return `
      Como representante do SESC, responda de forma profissional e empática a seguinte ${tipoTexto[avaliacao.tipo]}:

      Título: ${avaliacao.titulo}
      Comentário: ${avaliacao.comentario}
      Nota: ${avaliacao.nota}/5 estrelas
      Tipo: ${avaliacao.tipo}

      Diretrizes para a resposta:
      1. Seja cordial e profissional
      2. Demonstre empatia e acolhimento
      3. Para elogios: agradeça e valorize o feedback
      4. Para críticas: reconheça o problema e apresente soluções
      5. Para sugestões: agradeça a contribuição e considere a implementação
      6. Mantenha um tom institucional do SESC
      7. Limite a resposta a 2-3 parágrafos
      8. Use linguagem formal mas acessível
      
      Resposta:
    `;
  }

  gerarRespostaPadrao(avaliacao) {
    const respostasPadrao = {
      'elogio': `Prezado(a) cliente,

Ficamos muito felizes com seu elogio! Sua satisfação é nossa maior recompensa e nos motiva a continuar oferecendo atividades e serviços de qualidade.

Agradecemos por escolher o SESC e esperamos continuar proporcionando experiências positivas.

Atenciosamente,
Equipe SESC`,

      'critica': `Prezado(a) cliente,

Agradecemos seu feedback e pedimos desculpas por qualquer inconveniente causado. Sua opinião é muito importante para nós e nos ajuda a melhorar nossos serviços.

Tomaremos as medidas necessárias para corrigir os pontos levantados e garantir uma melhor experiência em suas próximas visitas.

Atenciosamente,
Equipe SESC`,

      'sugestao': `Prezado(a) cliente,

Agradecemos sua valiosa sugestão! Feedback como o seu nos ajuda a evoluir e oferecer serviços cada vez melhores.

Sua contribuição será analisada por nossa equipe e considerada em futuras melhorias e implementações.

Atenciosamente,
Equipe SESC`
    };

    return respostasPadrao[avaliacao.tipo] || respostasPadrao['critica'];
  }

  async analisarSentimentoAvaliacoes(avaliacoes) {
    const sentimentos = avaliacoes.map(avaliacao => {
      // Análise simples baseada em nota e palavras-chave
      let sentimento = 'neutro';
      
      if (avaliacao.nota >= 4) {
        sentimento = 'positivo';
      } else if (avaliacao.nota <= 2) {
        sentimento = 'negativo';
      }

      // Ajustar baseado em palavras-chave
      const texto = `${avaliacao.titulo} ${avaliacao.comentario}`.toLowerCase();
      
      const palavrasPositivas = ['excelente', 'ótimo', 'maravilhoso', 'perfeito', 'adorei', 'recomendo'];
      const palavrasNegativas = ['ruim', 'péssimo', 'horrível', 'decepcionante', 'insatisfeito'];
      
      const temPositiva = palavrasPositivas.some(palavra => texto.includes(palavra));
      const temNegativa = palavrasNegativas.some(palavra => texto.includes(palavra));
      
      if (temPositiva && !temNegativa) sentimento = 'positivo';
      if (temNegativa && !temPositiva) sentimento = 'negativo';

      return {
        id: avaliacao.id,
        sentimento,
        nota: avaliacao.nota,
        tipo: avaliacao.tipo
      };
    });

    return sentimentos;
  }
}

module.exports = new AIService();