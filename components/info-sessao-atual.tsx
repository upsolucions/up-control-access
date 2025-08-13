"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Monitor, Clock, User, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SessaoAtiva {
  sessionId: string
  userId: string
  email: string
  loginTime: Date
  lastActivity: Date
  browserInfo: string
}

export default function InfoSessaoAtual() {
  const { usuarioLogado, getCurrentSessionId, getSessoesAtivas, logout } = useAuth()
  const [sessaoAtual, setSessaoAtual] = useState<SessaoAtiva | null>(null)
  const [loading, setLoading] = useState(false)

  const carregarSessaoAtual = () => {
    setLoading(true)
    try {
      const currentSessionId = getCurrentSessionId()
      if (currentSessionId) {
        const sessoes = getSessoesAtivas()
        const sessao = sessoes.find(s => s.sessionId === currentSessionId)
        setSessaoAtual(sessao || null)
      }
    } catch (error) {
      console.error('Erro ao carregar sessão atual:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarSessaoAtual()
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarSessaoAtual, 30000)
    return () => clearInterval(interval)
  }, [usuarioLogado])

  const formatarTempo = (data: Date | string) => {
    const date = new Date(data)
    return date.toLocaleString('pt-BR')
  }

  const calcularTempoAtivo = (loginTime: Date | string) => {
    const login = new Date(loginTime)
    const agora = new Date()
    const diffMs = agora.getTime() - login.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  const getStatusSessao = (lastActivity: Date | string) => {
    const ultimaAtividade = new Date(lastActivity)
    const agora = new Date()
    const diffMinutes = (agora.getTime() - ultimaAtividade.getTime()) / (1000 * 60)
    
    if (diffMinutes < 5) {
      return { status: 'Ativo', color: 'bg-green-500' }
    } else if (diffMinutes < 30) {
      return { status: 'Inativo', color: 'bg-yellow-500' }
    } else {
      return { status: 'Expirado', color: 'bg-red-500' }
    }
  }

  if (!usuarioLogado) {
    return null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Sessão Atual</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={carregarSessaoAtual}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessaoAtual ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusSessao(sessaoAtual.lastActivity).color}`}></div>
                <span className="font-medium">{usuarioLogado.nome}</span>
              </div>
              <Badge variant="outline">
                {getStatusSessao(sessaoAtual.lastActivity).status}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Email:</span>
                <span>{sessaoAtual.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Login:</span>
                <span>{formatarTempo(sessaoAtual.loginTime)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Tempo ativo:</span>
                <span>{calcularTempoAtivo(sessaoAtual.loginTime)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Última atividade:</span>
                <span>{formatarTempo(sessaoAtual.lastActivity)}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 mb-2">Navegador:</p>
              <p className="text-xs bg-gray-100 p-2 rounded">{sessaoAtual.browserInfo}</p>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">ID da Sessão:</p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                {sessaoAtual.sessionId}
              </p>
            </div>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={logout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Encerrar Sessão
            </Button>
          </>
        ) : (
          <Alert>
            <AlertDescription>
              Não foi possível carregar as informações da sessão atual.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}