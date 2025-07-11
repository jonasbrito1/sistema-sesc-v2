# SESC - Script de Produção
Write-Host "🏗️ Construindo SESC para produção..." -ForegroundColor Green

# Build do frontend
Write-Host "📦 Construindo frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# Build do backend (se necessário)
Write-Host "📦 Preparando backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host "Execute: npm start" -ForegroundColor Yellow
