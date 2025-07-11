# SESC - Script de Desenvolvimento
Write-Host "🚀 Iniciando SESC em modo desenvolvimento..." -ForegroundColor Green

# Verificar se as dependências estão instaladas
if (!(Test-Path "backend/node_modules") -or !(Test-Path "frontend/node_modules")) {
    Write-Host "❌ Dependências não encontradas. Execute .\setup.ps1 primeiro" -ForegroundColor Red
    exit 1
}

# Iniciar em modo concorrente
npm run dev
