"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { getUsuarios } from '../lib/database'
import { runAllTests } from '../lib/supabase-test'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'sindico' | 'gerente' | 'operador' | 'gestor-seguranca' | 'tecnico' | 'prestador-servico' | 'temporario' | 'recepcao' | 'administrador-master' | 'administrador' | 'teste-sistema'
  senha: string
  condominioId?: string
  telefone?: string
  cpf?: string
  foto?: string
  ativo: boolean
  dataCadastro: Date
  permissoes?: string[]
}

interface SessaoAtiva {
  sessionId: string
  userId: string
  email: string
  loginTime: Date
  lastActivity: Date
  browserInfo: string
}

interface AuthContextType {
  usuarioLogado: Usuario | null
  login: (email: string, senha: string) => { success: boolean; message?: string }
  logout: () => void
  isAdminMaster: () => boolean
  canDeleteCondominio: () => boolean
  canCreateUser: () => boolean
  canManageLogo: () => boolean
  canAccessCondominio: (condominioId: string) => boolean
  getAccessibleCondominios: () => string[]
  getUserCondominio: () => any | null
  shouldRedirectToCondominioView: () => boolean
  getSessoesAtivas: () => SessaoAtiva[]
  getCurrentSessionId: () => string | null
  isTesteSystem: () => boolean
  canModifyData: () => boolean
  hasPermission: (permissionId: string) => boolean
  canEditUsers: () => boolean
  canCreateUsers: () => boolean
  canDeleteUsers: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Gerar ID único para a sessão
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Obter informações do navegador
  const getBrowserInfo = (): string => {
    if (typeof window === 'undefined') return 'Unknown'
    return `${navigator.userAgent.split(' ')[0]} - ${new Date().toLocaleString()}`
  }

  // Gerenciar sessões ativas
  const getSessoesAtivas = (): SessaoAtiva[] => {
    return JSON.parse(localStorage.getItem('sessoesAtivas') || '[]')
  }

  const setSessoesAtivas = (sessoes: SessaoAtiva[]): void => {
    localStorage.setItem('sessoesAtivas', JSON.stringify(sessoes))
  }

  // Verificar se usuário já está logado
  const isUserAlreadyLoggedIn = (userId: string): boolean => {
    const sessoes = getSessoesAtivas()
    return sessoes.some(sessao => sessao.userId === userId)
  }

  // Remover sessão específica
  const removeSession = (sessionId: string): void => {
    const sessoes = getSessoesAtivas().filter(s => s.sessionId !== sessionId)
    setSessoesAtivas(sessoes)
  }

  // Atualizar atividade da sessão
  const updateSessionActivity = (): void => {
    if (!currentSessionId) return
    
    const sessoes = getSessoesAtivas()
    const sessionIndex = sessoes.findIndex(s => s.sessionId === currentSessionId)
    
    if (sessionIndex !== -1) {
      sessoes[sessionIndex].lastActivity = new Date()
      setSessoesAtivas(sessoes)
    }
  }

  useEffect(() => {
    // Executar teste do Supabase na inicialização
    runAllTests().then(results => {
      console.log('🔧 Resultados dos testes do Supabase:', results)
    }).catch(err => {
      console.error('💥 Erro ao executar testes do Supabase:', err)
    })
    
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('usuarioLogado')
    const savedSessionId = localStorage.getItem('currentSessionId')
    
    if (savedUser && savedSessionId) {
      const user = JSON.parse(savedUser)
      const sessoes = getSessoesAtivas()
      
      // Verificar se a sessão ainda é válida
      const sessionExists = sessoes.some(s => s.sessionId === savedSessionId && s.userId === user.id)
      
      if (sessionExists) {
        setUsuarioLogado(user)
        setCurrentSessionId(savedSessionId)
        updateSessionActivity()
      } else {
        // Sessão inválida, fazer logout
        localStorage.removeItem('usuarioLogado')
        localStorage.removeItem('currentSessionId')
      }
    }

    // Atualizar atividade da sessão a cada 30 segundos
    const interval = setInterval(updateSessionActivity, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Limpar sessões expiradas (mais de 24 horas inativas)
  useEffect(() => {
    const cleanExpiredSessions = () => {
      const sessoes = getSessoesAtivas()
      const now = new Date()
      const validSessions = sessoes.filter(sessao => {
        const lastActivity = new Date(sessao.lastActivity)
        const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
        return hoursDiff < 24 // Manter sessões ativas por 24 horas
      })
      
      if (validSessions.length !== sessoes.length) {
        setSessoesAtivas(validSessions)
      }
    }

    // Limpar sessões expiradas a cada hora
    const interval = setInterval(cleanExpiredSessions, 60 * 60 * 1000)
    cleanExpiredSessions() // Executar imediatamente
    
    return () => clearInterval(interval)
  }, [])

  const login = async (email: string, senha: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Tentar buscar usuários do Supabase primeiro
      const usuarios = await getUsuarios()
      let usuario = usuarios.find((u: UsuarioLegacy) => u.email === email && u.senha === senha && u.ativo)
      
      // Se não encontrar no Supabase, buscar no localStorage como fallback
      if (!usuario) {
        const usuariosLocal = JSON.parse(localStorage.getItem('usuarios') || '[]')
        usuario = usuariosLocal.find((u: Usuario) => u.email === email && u.senha === senha && u.ativo)
      }
      
      if (!usuario) {
        return { success: false, message: 'Email ou senha inválidos' }
      }

      // Converter para formato Usuario se necessário
      const usuarioFormatado: Usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        perfil: usuario.perfil as any,
        condominioId: usuario.condominioId,
        ativo: usuario.ativo,
        dataCadastro: new Date(),
        permissoes: []
      }

      // Verificar se o usuário já está logado (apenas para perfis que não são admin-master)
      if (usuarioFormatado.perfil !== 'administrador-master' && isUserAlreadyLoggedIn(usuarioFormatado.id)) {
        return { success: false, message: 'Este usuário já está logado em outra sessão. Apenas administradores master podem fazer login em múltiplos equipamentos.' }
      }

      // Criar nova sessão
      const sessionId = generateSessionId()
      const novaSessao: SessaoAtiva = {
        sessionId,
        userId: usuarioFormatado.id,
        email: usuarioFormatado.email,
        loginTime: new Date(),
        lastActivity: new Date(),
        browserInfo: getBrowserInfo()
      }

      // Adicionar sessão às sessões ativas
      const sessoesAtivas = getSessoesAtivas()
      sessoesAtivas.push(novaSessao)
      setSessoesAtivas(sessoesAtivas)

      // Definir usuário logado e sessão atual
      setUsuarioLogado(usuarioFormatado)
      setCurrentSessionId(sessionId)
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioFormatado))
      localStorage.setItem('currentSessionId', sessionId)

      return { success: true }
    } catch (error) {
      console.error('Erro durante o login:', error)
      return { success: false, message: 'Erro interno do sistema. Tente novamente.' }
    }
  }

  const logout = () => {
    // Remover sessão atual das sessões ativas
    if (currentSessionId) {
      removeSession(currentSessionId)
    }
    
    setUsuarioLogado(null)
    setCurrentSessionId(null)
    localStorage.removeItem('usuarioLogado')
    localStorage.removeItem('currentSessionId')
  }

  const isAdminMaster = (): boolean => {
    return usuarioLogado?.perfil === 'administrador-master'
  }

  const canDeleteCondominio = (): boolean => {
    return isAdminMaster()
  }

  const canCreateUser = (): boolean => {
    return isAdminMaster()
  }

  const canManageLogo = (): boolean => {
    return isAdminMaster()
  }

  const isTesteSystem = (): boolean => {
    return usuarioLogado?.perfil === 'teste-sistema'
  }

  const canModifyData = (): boolean => {
    // Perfil teste-sistema tem apenas acesso de leitura
    if (isTesteSystem()) return false
    
    // Admin master sempre pode modificar dados
    if (isAdminMaster()) return true
    
    // Verificar se o usuário tem pelo menos uma permissão de edição/criação/exclusão
    if (!usuarioLogado?.permissoes || usuarioLogado.permissoes.length === 0) {
      return false
    }
    
    // Se o usuário tem apenas permissões de visualização (view_), não pode modificar
    const hasEditPermissions = usuarioLogado.permissoes.some(permissao => 
      !permissao.includes('view_') && !permissao.includes('visualizar')
    )
    
    return hasEditPermissions
  }
  
  const hasPermission = (permissionId: string): boolean => {
    if (isAdminMaster()) return true
    return usuarioLogado?.permissoes?.includes(permissionId) || false
  }
  
  const canEditUsers = (): boolean => {
    return isAdminMaster() || hasPermission('edit_users')
  }
  
  const canCreateUsers = (): boolean => {
    return isAdminMaster() || hasPermission('create_users')
  }
  
  const canDeleteUsers = (): boolean => {
    return isAdminMaster() || hasPermission('delete_users')
  }

  const canAccessCondominio = (condominioId: string): boolean => {
    if (isAdminMaster()) return true
    return usuarioLogado?.condominioId === condominioId
  }

  const getAccessibleCondominios = (): string[] => {
    if (isAdminMaster() || isTesteSystem()) {
      // Admin master e teste-sistema podem acessar todos os condomínios
      const condominios = JSON.parse(localStorage.getItem('condominios') || '[]')
      return condominios.map((c: any) => c.id)
    }
    // Outros usuários só podem acessar seu condomínio específico
    return usuarioLogado?.condominioId ? [usuarioLogado.condominioId] : []
  }

  const getUserCondominio = () => {
    if (!usuarioLogado?.condominioId) return null
    const condominios = JSON.parse(localStorage.getItem('condominios') || '[]')
    return condominios.find((c: any) => c.id === usuarioLogado.condominioId)
  }

  const shouldRedirectToCondominioView = (): boolean => {
    // Usuários que não são admin master devem ser redirecionados para o dashboard específico do condomínio
    return !isAdminMaster() && !!usuarioLogado?.condominioId
  }

  const getCurrentSessionId = (): string | null => {
    return currentSessionId
  }

  const value: AuthContextType = {
    usuarioLogado,
    login,
    logout,
    isAdminMaster,
    canDeleteCondominio,
    canCreateUser,
    canManageLogo,
    canAccessCondominio,
    getAccessibleCondominios,
    getUserCondominio,
    shouldRedirectToCondominioView,
    getSessoesAtivas,
    getCurrentSessionId,
    isTesteSystem,
    canModifyData,
    hasPermission,
    canEditUsers,
    canCreateUsers,
    canDeleteUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}