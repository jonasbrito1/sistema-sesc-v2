const admin = require('firebase-admin');
const path = require('path');

// Carregar .env da raiz do projeto (2 níveis acima)
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

console.log('🔍 Firebase Debug Info:');
console.log('Current dir:', __dirname);
console.log('Env file path:', path.resolve(__dirname, '../../../.env'));
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');

// Verificar se as variáveis essenciais existem
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Variáveis Firebase não encontradas!');
  console.error('Verifique se o arquivo .env está na raiz do projeto');
  throw new Error('Firebase credentials not found in environment variables');
}

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Debug do serviceAccount (sem mostrar a chave privada)
console.log('Service Account Config:', {
  project_id: serviceAccount.project_id,
  client_email: serviceAccount.client_email,
  private_key: serviceAccount.private_key ? 'SET' : 'NOT SET'
});

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Configurações do Firestore
db.settings({
  timestampsInSnapshots: true
});

console.log('✅ Firebase Admin inicializado com sucesso!');

module.exports = {
  admin,
  db,
  auth
};