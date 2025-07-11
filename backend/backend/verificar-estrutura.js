const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando estrutura do backend...\n');

const requiredFiles = [
  'src/controllers/authController.js',
  'src/controllers/clienteController.js',
  'src/controllers/responsavelController.js',
  'src/controllers/atividadeController.js',
  'src/controllers/inscricaoController.js',
  'src/controllers/avaliacaoController.js',
  'src/routes/index.js',
  'src/routes/authRoutes.js',
  'src/routes/clienteRoutes.js',
  'src/routes/responsavelRoutes.js',
  'src/routes/atividadeRoutes.js',
  'src/routes/inscricaoRoutes.js',
  'src/routes/avaliacaoRoutes.js',
  'src/middleware/auth.js',
  'src/middleware/validation.js',
  'src/middleware/errorHandler.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NÃO ENCONTRADO`);
    allFilesExist = false;
  }
});

console.log(`\n${allFilesExist ? ' Todos os arquivos foram criados com sucesso!' : '❌ Alguns arquivos estão faltando'}`);
console.log('\n Para testar o servidor: npm run dev');
