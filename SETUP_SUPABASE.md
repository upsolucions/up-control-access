# 🚀 Configuração do Supabase - Guia Passo a Passo

## ❌ Problema Atual

O erro no console indica que a tabela `usuarios` não existe no banco de dados Supabase. Isso significa que o schema SQL ainda não foi executado.

```
Erro ao buscar usuários no Supabase: {}
```

## ✅ Solução: Executar o Schema SQL

### Passo 1: Acessar o Painel do Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Faça login na sua conta
3. Selecione o projeto: **zhswrlcoskljdsdottxu**

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

### Passo 3: Executar o Schema

1. Copie todo o conteúdo do arquivo `database/schema.sql`
2. Cole no editor SQL do Supabase
3. Clique em **"Run"** para executar

### Passo 4: Verificar se as Tabelas foram Criadas

Após executar o schema, você deve ver as seguintes tabelas criadas:

- ✅ `condominios`
- ✅ `usuarios`
- ✅ `pessoas`
- ✅ `logos`
- ✅ `sessoes`
- ✅ `relatorios_acesso`
- ✅ `configuracoes_rede`
- ✅ `auditoria`

## 🔧 Conteúdo do Schema SQL

```sql
-- Criação das tabelas para o sistema Up Control

-- Tabela de condomínios
CREATE TABLE condominios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) CHECK (perfil IN ('admin', 'operador', 'visualizador')) DEFAULT 'visualizador',
  ativo BOOLEAN DEFAULT true,
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E mais tabelas...
```

## 🔍 Como Verificar se Funcionou

### Método 1: Console do Navegador

1. Abra o sistema Up Control
2. Abra o Console do navegador (F12)
3. Procure pelas mensagens:
   - ✅ `🔧 Resultados dos testes do Supabase:`
   - ✅ `✅ Conexão com Supabase estabelecida!`
   - ✅ `✅ Tabela 'usuarios' existe e está acessível`

### Método 2: Painel do Supabase

1. Vá para **"Table Editor"** no painel do Supabase
2. Você deve ver todas as tabelas listadas
3. Clique em `usuarios` para ver a estrutura da tabela

## 🛠️ Configurações Adicionais

### Row Level Security (RLS)

O schema já inclui políticas básicas de segurança. Para configurações mais avançadas:

1. Vá para **"Authentication"** > **"Policies"**
2. Revise as políticas criadas automaticamente
3. Ajuste conforme necessário

### Dados Iniciais (Opcional)

Para inserir usuários iniciais:

```sql
-- Inserir usuário administrador
INSERT INTO usuarios (nome, email, senha, perfil, ativo) VALUES
('Administrador', 'admin@upcontrol.com', 'admin123', 'admin', true),
('Operador', 'operador@upcontrol.com', 'op123', 'operador', true);
```

## 🚨 Troubleshooting

### Erro: "relation does not exist"

**Causa**: As tabelas não foram criadas
**Solução**: Execute o schema SQL completo

### Erro: "permission denied"

**Causa**: Políticas RLS muito restritivas
**Solução**: Ajuste as políticas ou desabilite RLS temporariamente

### Erro: "invalid input syntax for type uuid"

**Causa**: Formato de ID incorreto
**Solução**: Use UUIDs válidos ou deixe o banco gerar automaticamente

## 📞 Suporte

- **Documentação Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Dashboard**: [app.supabase.com](https://app.supabase.com)
- **Logs do Sistema**: Console do navegador (F12)

---

**⚡ Próximo Passo**: Execute o schema SQL no painel do Supabase e recarregue a aplicação!