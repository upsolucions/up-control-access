# Integração com Supabase - Up Control

## 📋 Visão Geral

O sistema Up Control foi integrado com o Supabase para substituir o armazenamento local (localStorage) por um banco de dados PostgreSQL real, proporcionando:

- ✅ Persistência de dados confiável
- ✅ Sincronização entre dispositivos
- ✅ Backup automático
- ✅ Escalabilidade
- ✅ Segurança aprimorada
- ✅ Fallback para localStorage

## 🔧 Configuração

### Variáveis de Ambiente

O arquivo `.env.local` contém as configurações do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zhswrlcoskljdsdottxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estrutura do Banco de Dados

O arquivo `database/schema.sql` contém a estrutura completa das tabelas:

#### Tabelas Principais

1. **condominios** - Dados dos condomínios
2. **usuarios** - Usuários do sistema
3. **pessoas** - Moradores, visitantes, prestadores
4. **logos** - Logos personalizados
5. **sessoes** - Controle de sessões ativas
6. **relatorios_acesso** - Registros de entrada/saída
7. **configuracoes_rede** - Configurações de rede
8. **auditoria** - Log de auditoria

## 📁 Arquivos Modificados

### 1. `lib/supabase.ts`
- Cliente Supabase configurado
- Interfaces TypeScript para as tabelas
- Funções auxiliares de autenticação

### 2. `lib/database.ts`
- Funções CRUD com integração Supabase
- Fallback automático para localStorage
- Compatibilidade com código existente

### 3. `contexts/AuthContext.tsx`
- Login assíncrono com Supabase
- Manutenção da compatibilidade

### 4. `components/Login.tsx`
- Atualizado para usar login assíncrono

## 🔄 Funcionamento Híbrido

### Estratégia de Fallback

1. **Primeira tentativa**: Buscar dados no Supabase
2. **Em caso de erro**: Usar localStorage como backup
3. **Sincronização**: Dados são salvos em ambos os locais

### Exemplo de Uso

```typescript
// Buscar usuários
const usuarios = await getUsuarios()

// Salvar usuário
await salvarUsuario(novoUsuario)

// Remover usuário
await removerUsuario(userId)
```

## 🚀 Configuração no Supabase

### 1. Executar Schema SQL

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Execute o conteúdo do arquivo `database/schema.sql`

### 2. Configurar Políticas RLS

As políticas de Row Level Security já estão incluídas no schema:

```sql
-- Exemplo de política
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON usuarios FOR SELECT 
USING (auth.uid()::text = id::text);
```

### 3. Configurar Autenticação

O sistema usa autenticação personalizada, mas pode ser migrado para Supabase Auth:

```typescript
// Login com Supabase Auth (futuro)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

## 📊 Benefícios da Integração

### Performance
- Consultas otimizadas com índices
- Cache automático
- Paginação eficiente

### Segurança
- Row Level Security (RLS)
- Criptografia em trânsito e repouso
- Auditoria completa

### Escalabilidade
- Suporte a múltiplos usuários simultâneos
- Backup automático
- Replicação de dados

### Desenvolvimento
- API REST automática
- Realtime subscriptions
- Dashboard administrativo

## 🔍 Monitoramento

### Logs de Erro

Todos os erros são logados no console:

```typescript
console.error('Erro ao buscar usuários no Supabase:', error)
```

### Fallback Automático

Quando o Supabase não está disponível:

```typescript
try {
  // Tentar Supabase
  const data = await supabase.from('usuarios').select('*')
} catch (error) {
  // Usar localStorage
  return db.load('usuarios') || []
}
```

## 🛠️ Manutenção

### Backup Local

O sistema mantém backup automático no localStorage:

```typescript
// Backup automático após cada operação
db.save('usuarios', usuarios)
```

### Limpeza de Dados

Funções de limpeza automática para evitar sobrecarga:

```typescript
private cleanupOldData(): void {
  // Remove dados antigos do localStorage
}
```

## 🔮 Próximos Passos

### Melhorias Futuras

1. **Migração completa para Supabase Auth**
2. **Realtime subscriptions** para atualizações em tempo real
3. **Storage para arquivos** (logos, documentos)
4. **Edge Functions** para lógica de negócio
5. **Dashboard de analytics** com dados do Supabase

### Otimizações

1. **Cache inteligente** com TTL configurável
2. **Paginação** para grandes volumes de dados
3. **Índices compostos** para consultas complexas
4. **Compressão** de dados grandes

## 📞 Suporte

Para dúvidas sobre a integração Supabase:

- Documentação: [supabase.com/docs](https://supabase.com/docs)
- Dashboard: [app.supabase.com](https://app.supabase.com)
- Logs do sistema: Console do navegador

---

**Status**: ✅ Integração completa e funcional
**Compatibilidade**: 100% com código existente
**Fallback**: localStorage automático