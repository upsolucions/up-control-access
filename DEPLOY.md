# 🚀 Guia de Deploy - Up Control

Este documento contém instruções detalhadas para fazer o deploy do Sistema de Controle de Acesso e Segurança em diferentes plataformas.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Git configurado
- Conta na plataforma de deploy escolhida
- Repositório Git (GitHub, GitLab, Bitbucket)

## 🔧 Preparação do Projeto

### 1. Verificar Dependências
```bash
npm install
npm run build
```

### 2. Configurar Repositório Git
```bash
# Se ainda não foi inicializado
git init
git add .
git commit -m "Initial commit"

# Adicionar repositório remoto
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin master
```

## 🌐 Deploy no Vercel (Recomendado)

### Método 1: Interface Web
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em "New Project"
4. Selecione o repositório do Up Control
5. Configure as seguintes opções:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
6. Clique em "Deploy"

### Método 2: Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para deploy em produção
vercel --prod
```

### Configurações Avançadas Vercel
- O arquivo `vercel.json` já está configurado com:
  - Headers de segurança
  - Timeout de 30 segundos
  - Rewrites para API routes

## 🔷 Deploy no Netlify

### Método 1: Interface Web
1. Acesse [netlify.com](https://netlify.com)
2. Conecte sua conta Git
3. Clique em "New site from Git"
4. Selecione o repositório
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
6. Adicione variável de ambiente se necessário
7. Deploy

### Método 2: Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy em produção
netlify deploy --prod
```

### Configuração para Netlify
Crie um arquivo `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🐳 Deploy com Docker

### 1. Criar Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Build e Run
```bash
# Build da imagem
docker build -t up-control .

# Executar container
docker run -p 3000:3000 up-control
```

### 3. Docker Compose
```yaml
version: '3.8'
services:
  up-control:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## ☁️ Deploy em Outras Plataformas

### Railway
1. Conecte seu repositório no [railway.app](https://railway.app)
2. Configure as variáveis de ambiente
3. Deploy automático

### Render
1. Conecte seu repositório no [render.com](https://render.com)
2. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Deploy

### DigitalOcean App Platform
1. Conecte seu repositório
2. Configure o app spec
3. Deploy

## 🔧 Scripts Automatizados

### Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
./deploy.sh
```

## 🔍 Verificação Pós-Deploy

### Checklist
- [ ] Aplicação carrega corretamente
- [ ] Login funciona (teste@sistema.com / teste123)
- [ ] Todas as páginas são acessíveis
- [ ] Upload de logos funciona
- [ ] Geração de PDF funciona
- [ ] Responsividade em mobile
- [ ] Performance adequada

### Monitoramento
- Configure alertas de uptime
- Monitore logs de erro
- Verifique métricas de performance
- Configure backup se necessário

## 🚨 Troubleshooting

### Problemas Comuns

**Build falha**
- Verificar versão do Node.js
- Limpar cache: `npm ci`
- Verificar dependências

**Aplicação não carrega**
- Verificar logs do servidor
- Verificar configurações de ambiente
- Verificar permissões

**Problemas de localStorage**
- Verificar se o domínio permite localStorage
- Verificar quotas de armazenamento

## 📞 Suporte

Para problemas específicos de deploy, consulte:
- Documentação da plataforma escolhida
- Logs de build e runtime
- Equipe de desenvolvimento Up Soluções

---

**Última atualização**: $(Get-Date -Format "dd/MM/yyyy")