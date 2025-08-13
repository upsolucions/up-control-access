import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhswrlcoskljdsdottxu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoc3dybGNvc2tsamRzZG90dHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDgzMTAsImV4cCI6MjA3MDY4NDMxMH0.qAvuvPz48f-H4aMUMbeJv-T7YZvtwhqYrNH4dW7liy0'

// Verificar se as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não configuradas. Usando valores padrão.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Tipos para as tabelas do banco de dados
export interface Usuario {
  id?: string
  nome: string
  email: string
  senha: string
  perfil: 'admin' | 'operador' | 'visualizador'
  ativo: boolean
  condominio_id?: string
  created_at?: string
  updated_at?: string
}

export interface Condominio {
  id?: string
  nome: string
  endereco: string
  telefone: string
  email: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface Pessoa {
  id?: string
  nome: string
  cpf: string
  telefone: string
  email: string
  tipo: 'morador' | 'visitante' | 'prestador' | 'funcionario'
  condominio_id: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface Logo {
  id?: string
  nome: string
  url: string
  ativo: boolean
  condominio_id?: string
  created_at?: string
  updated_at?: string
}

export interface Sessao {
  id?: string
  usuario_id: string
  token: string
  expires_at: string
  created_at?: string
}

export interface RelatorioAcesso {
  id?: string
  pessoa_id: string
  condominio_id: string
  tipo_acesso: 'entrada' | 'saida'
  data_hora: string
  observacoes?: string
  created_at?: string
}

// Funções auxiliares para operações comuns
export const supabaseHelpers = {
  // Verificar se o usuário está autenticado
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Fazer login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Criar usuário
  async signUp(email: string, password: string, userData: Partial<Usuario>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }
}