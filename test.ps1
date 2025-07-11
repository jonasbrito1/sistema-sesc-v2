# SESC - Script de Testes
Write-Host "🧪 Executando testes do SESC..." -ForegroundColor Green

Write-Host "🔍 Testando backend..." -ForegroundColor Yellow
Set-Location backend
npm test
Set-Location ..

Write-Host "🔍 Testando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm test -- --coverage --watchAll=false
Set-Location ..

Write-Host "✅ Testes concluídos!" -ForegroundColor Green
