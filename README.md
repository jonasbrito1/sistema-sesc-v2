Sistema de Inscrições SESC
Sistema web para gerenciamento de inscrições em atividades oferecidas pelo SESC (Serviço Social do Comércio).
Objetivos

Simplificar o processo de inscrição para os clientes
Otimizar a gestão administrativa das atividades
Integrar sistemas externos (CEP, email, IA)
Fornecer dashboards e relatórios analíticos
Garantir segurança e performance

Usuários do Sistema
Clientes: Realizam inscrições e acompanham atividades
Administradores: Gerenciam atividades, responsáveis e relatórios
Responsáveis: Instrutor/coordenadores das atividades
Funcionalidades
Área do Cliente

Cadastro completo com validação em tempo real
Busca automática de endereço por CEP (ViaCEP/Postmon)
Catálogo de atividades com filtros avançados
Sistema de inscrições com controle de vagas
Histórico pessoal de inscrições
Avaliações e feedback das atividades
Notificações por email

Área Administrativa

Dashboard analítico com gráficos interativos
CRUD completo de atividades e responsáveis
Gerenciamento de inscrições em tempo real
Sistema de relatórios exportáveis
Gestão de avaliações com resposta automatizada (IA)
Controle de usuários e permissões
Backup automático do banco de dados

Integrações

APIs de CEP (ViaCEP + Postmon como fallback)
Envio de emails automatizado (Nodemailer)
IA para respostas automáticas (OpenAI/Gemini) - opcional
Notificações em tempo real

Tecnologias
Backend
TecnologiaVersãoFinalidadeNode.js18+Runtime JavaScriptExpress^4.18.2Framework webFirebase^12.0.0Banco NoSQLJWT^9.0.2AutenticaçãoJest^29.7.0Testes
Frontend
TecnologiaVersãoFinalidadeReact^18.2.0Interface de usuárioBootstrap^3.3.6EstilizaçãoReact Router^6.30.1Roteamento SPARecharts^4.4.0GráficosAxios^1.6.2Cliente HTTP
Banco de Dados

Firestore: Dados principais
Realtime Database: Dados em tempo real

Ferramentas

Docker: Containerização
PowerShell: Scripts de automação
Git: Controle de versão

Pré-requisitos
Software Necessário

Node.js 18+ - Download aqui
NPM 9+ (incluso com Node.js)
Git - Download aqui
PowerShell 7+ (Windows) - Download aqui

Serviços Online (Obrigatórios)

Conta Firebase - Console Firebase
Projeto Firebase configurado com Firestore

Serviços Online (Opcionais)

Conta Gmail (para envio de emails)
API Key OpenAI (para IA - opcional)
API Key Google Gemini (para IA - opcional)

Instalação
1. Clone o Repositório
bashgit clone https://github.com/jonasbrito1/sistema-sesc-v2.git
cd sistema-sesc-v2
2. Configuração Automática (RECOMENDADO)
powershell# Windows PowerShell (Recomendado)
.\setup.ps1

# Para pular verificação do Node.js
.\setup.ps1 -SkipNodeCheck
3. Configuração Manual (Alternativa)
bash# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install

# Instalar dependências globais (scripts concorrentes)
cd ..
npm install
Quick Start
Método Rápido (Automático)
powershell# 1. Setup inicial
.\setup.ps1

# 2. Configurar Firebase (editar .env)
notepad .env

# 3. Executar em desenvolvimento
.\dev.ps1
Método Manual
bash# 1. Configurar variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Editar configurações (ver seção Configuração)
# 3. Executar backend
cd backend
npm run dev

# 4. Em outro terminal, executar frontend
cd frontend
npm start
URLs do Sistema:

Frontend: http://localhost:3000
Backend API: http://localhost:3001
Health Check: http://localhost:3001/api/health

Configuração
Arquivo .env (Raiz do Projeto)
env# FIREBASE CONFIGURATION
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40seu-projeto.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com/

# JWT SECRET (GERE UM NOVO!)
JWT_SECRET=SUA-CHAVE-SUPER-SECRETA-AQUI-256-BITS

# ENVIRONMENT
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# EMAIL CONFIGURATION (OPCIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-gmail
SMTP_FROM=Sistema SESC <noreply@sesc.com>

# IA CONFIGURATION (OPCIONAL)
OPENAI_API_KEY=sk-sua-chave-openai
GEMINI_API_KEY=sua-chave-gemini
Configuração do Firebase

Acesse o Firebase Console
Crie um novo projeto ou use um existente
Ative o Firestore Database
Gere uma chave de serviço:

Vá em Configurações → Contas de serviço
Clique em Gerar nova chave privada
Baixe o arquivo JSON


Configure as variáveis no .env com os dados do JSON

Configuração de Email (Opcional)
Para Gmail:

Ative a verificação em 2 etapas
Gere uma senha de app:

Google Account → Segurança → Senhas de app
Selecione "Email" e "Computador"


Use a senha gerada no SMTP_PASS

Como Executar
Desenvolvimento (Recomendado)
powershell# Execução completa (backend + frontend)
.\dev.ps1

# Apenas backend
.\dev.ps1 -BackendOnly

# Apenas frontend
.\dev.ps1 -FrontendOnly

# Com porta customizada
.\dev.ps1 -BackendPort 3001 -FrontendPort 3000
Desenvolvimento Manual
bash# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
Produção
powershell# Build completo
.\deploy.ps1 -Environment production

# Com Docker
.\deploy.ps1 -Docker -DockerTag v1.0.0

# Apenas build (sem deploy)
.\deploy.ps1 -SkipTests -Deploy
Docker
bash# Desenvolvimento
docker-compose up

# Produção
docker-compose -f docker-compose.prod.yml up
Estrutura do Projeto
sistema-sesc-v2/
│
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middlewares personalizados
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Utilitários
│   │   └── config/          # Configurações
│   ├── tests/               # Testes do backend
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                # Interface React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── contexts/        # Context API (estado global)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Chamadas para API
│   │   ├── utils/           # Utilitários
│   │   └── styles/          # Estilos globais
│   ├── public/              # Arquivos públicos
│   ├── package.json
│   └── Dockerfile
│
├── docs/                    # Documentação
├── scripts/                 # Scripts PowerShell
│   ├── setup.ps1           # Configuração inicial
│   ├── dev.ps1             # Desenvolvimento
│   ├── deploy.ps1          # Deploy e build
│   ├── database.ps1        # Gerenciamento do banco
│   └── test.ps1            # Testes automatizados
│
├── docker-compose.yml       # Orquestração Docker
├── package.json            # Dependências globais
├── .env.example            # Template de configuração
└── README.md               # Este arquivo
API Endpoints
Autenticação
httpPOST   /api/auth/login         # Login de usuário
POST   /api/auth/register      # Registro de cliente
POST   /api/auth/refresh       # Refresh token
POST   /api/auth/logout        # Logout
Clientes
httpGET    /api/clientes           # Listar clientes (admin)
POST   /api/clientes           # Criar cliente
GET    /api/clientes/:id       # Buscar cliente
PUT    /api/clientes/:id       # Atualizar cliente
DELETE /api/clientes/:id       # Deletar cliente
Atividades
httpGET    /api/atividades         # Listar atividades
POST   /api/atividades         # Criar atividade
GET    /api/atividades/:id     # Buscar atividade
PUT    /api/atividades/:id     # Atualizar atividade
DELETE /api/atividades/:id     # Deletar atividade
Responsáveis
httpGET    /api/responsaveis       # Listar responsáveis
POST   /api/responsaveis       # Criar responsável
GET    /api/responsaveis/:id   # Buscar responsável
PUT    /api/responsaveis/:id   # Atualizar responsável
DELETE /api/responsaveis/:id   # Deletar responsável
Inscrições
httpGET    /api/inscricoes         # Listar inscrições
POST   /api/inscricoes         # Criar inscrição
GET    /api/inscricoes/:id     # Buscar inscrição
PUT    /api/inscricoes/:id     # Atualizar inscrição
DELETE /api/inscricoes/:id     # Deletar inscrição
Testes
Executar Testes
powershell# Todos os testes
.\test.ps1

# Apenas backend
.\test.ps1 -BackendOnly

# Apenas frontend
.\test.ps1 -FrontendOnly

# Com coverage
.\test.ps1 -Coverage
Testes Manuais
bash# Backend
cd backend
npm test

# Frontend
cd frontend
npm test