# Sistema de Controle de Acesso e Segurança - Up Control

Sistema completo de gerenciamento de segurança e controle de acesso para condomínios, desenvolvido com Next.js 14 e TypeScript.

## 🚀 Funcionalidades

### Gestão de Usuários
- Sistema de autenticação com múltiplos perfis
- Gerenciamento completo de usuários e permissões
- Controle de sessões ativas
- Auditoria de ações do sistema

### Gestão de Condomínios
- Cadastro e gerenciamento de condomínios
- Dashboard específico por condomínio
- Relatórios de acesso e problemas
- Integração com empresas fornecedoras

### Monitoramento de Rede
- Scanner de dispositivos em tempo real
- Mapa visual da rede
- Monitoramento de status dos dispositivos
- Configuração de rede avançada

### Sistema de Logos
- Gerenciamento de logos personalizados
- Suporte a múltiplos tipos (principal, secundário, favicon, PDF)
- Compressão automática de imagens
- Aplicação automática em relatórios PDF

### Relatórios e Documentação
- Geração de relatórios em PDF
- Sistema de ordens de serviço
- Relatórios de problemas e incidentes
- Exportação de dados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Autenticação**: Context API personalizado
- **Armazenamento**: localStorage (cliente)
- **PDF**: jsPDF para geração de relatórios
- **Ícones**: Lucide React

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd up-control
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Execute o projeto em desenvolvimento:
```bash
npm run dev
# ou
pnpm dev
```

4. Acesse o sistema em `http://localhost:3000`

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente (se necessário)
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure o comando de build: `npm run build`
3. Configure o diretório de publicação: `out`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 👥 Perfis de Usuário

- **Administrador Master**: Acesso total ao sistema
- **Administrador**: Gestão de condomínios e usuários
- **Gestor de Segurança**: Monitoramento e relatórios
- **Síndico**: Gestão do próprio condomínio
- **Gerente**: Operações administrativas
- **Operador**: Operações básicas
- **Técnico**: Suporte técnico
- **Prestador de Serviço**: Acesso limitado
- **Temporário**: Acesso temporário
- **Recepção**: Atendimento

## 🔧 Configuração

### Usuário Padrão
- **Email**: teste@sistema.com
- **Senha**: teste123
- **Perfil**: Teste de Sistema

### Estrutura de Dados
O sistema utiliza localStorage para armazenamento local dos dados, incluindo:
- Usuários e perfis
- Condomínios
- Dispositivos de rede
- Logos e configurações
- Relatórios e auditoria

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- Desktop (1920x1080+)
- Tablet (768px+)
- Mobile (320px+)

## 🔒 Segurança

- Autenticação baseada em contexto
- Controle de permissões por perfil
- Validação de dados no frontend
- Sanitização de inputs
- Gestão segura de sessões

## 📄 Licença

Este projeto é propriedade da Up Soluções e está protegido por direitos autorais.

## 🤝 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da Up Soluções.
