# Script de Deploy Automatizado - Up Control (PowerShell)
# Este script automatiza o processo de deploy do sistema no Windows

Write-Host "🚀 Iniciando processo de deploy..." -ForegroundColor Green

# Verificar se há mudanças não commitadas
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Há mudanças não commitadas. Commitando automaticamente..." -ForegroundColor Yellow
    git add .
    $commitMessage = Read-Host "📝 Digite a mensagem do commit"
    git commit -m $commitMessage
} else {
    Write-Host "✅ Working directory limpo" -ForegroundColor Green
}

# Verificar se o build funciona
Write-Host "🔨 Testando build..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build bem-sucedido" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build. Abortando deploy." -ForegroundColor Red
    exit 1
}

# Push para o repositório
Write-Host "📤 Fazendo push para o repositório..." -ForegroundColor Blue
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push realizado com sucesso" -ForegroundColor Green
    Write-Host "🎉 Deploy concluído! O Vercel irá automaticamente fazer o deploy da nova versão." -ForegroundColor Green
} else {
    Write-Host "❌ Erro no push. Verifique a configuração do repositório remoto." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse o dashboard do Vercel para acompanhar o deploy" -ForegroundColor White
Write-Host "2. Teste a aplicação em produção" -ForegroundColor White
Write-Host "3. Monitore os logs para possíveis erros" -ForegroundColor White

Pause