#!/bin/bash

# Script de Deploy Automatizado - Up Control
# Este script automatiza o processo de deploy do sistema

echo "🚀 Iniciando processo de deploy..."

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Há mudanças não commitadas. Commitando automaticamente..."
    git add .
    echo "📝 Digite a mensagem do commit:"
    read commit_message
    git commit -m "$commit_message"
else
    echo "✅ Working directory limpo"
fi

# Verificar se o build funciona
echo "🔨 Testando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build bem-sucedido"
else
    echo "❌ Erro no build. Abortando deploy."
    exit 1
fi

# Push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin master

if [ $? -eq 0 ]; then
    echo "✅ Push realizado com sucesso"
    echo "🎉 Deploy concluído! O Vercel irá automaticamente fazer o deploy da nova versão."
else
    echo "❌ Erro no push. Verifique a configuração do repositório remoto."
    exit 1
fi

echo "📋 Próximos passos:"
echo "1. Acesse o dashboard do Vercel para acompanhar o deploy"
echo "2. Teste a aplicação em produção"
echo "3. Monitore os logs para possíveis erros"