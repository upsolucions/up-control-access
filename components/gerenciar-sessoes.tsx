"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Users, Clock, Monitor, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SessaoAtiva {
  sessionId: string
  userId: string
  email: string
  loginTime: Date
  lastActivity: Date
  browserInfo: string
}

export default function GerenciarSessoes() {
  const { getSessoesAtivas, isAdminMaster } = useAuth()
  const [sessoes, setSessoes] = useState<SessaoAtiva[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const carregarSessoes = () => {
    setLoading(true)
    try {
      const sessoesAtivas = getSessoesAtivas()
      setSessoes(sessoesAtivas)
    } catch (error) {
      setMessage('Erro ao carregar sessões ativas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarSessoes()
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarSessoes, 30000)
    return () => clearInterval(interval)
  }, [])

  const removerSessao = (sessionId: string) => {
    try {
      const sessoesAtivas = getSessoesAtivas()
      const novasSessoes = sessoesAtivas.filter(s => s.sessionId !== sessionId)
      localStorage.setItem('sessoesAtivas', JSON.stringify(novasSessoes))
      setSessoes(novasSessoes)
      setMessage('Sessão removida com sucesso')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Erro ao remover sessão')
    }
  }

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

  if (!isAdminMaster()) {
    return (
      <Alert>
        <AlertDescription>
          Acesso negado. Apenas administradores master podem gerenciar sessões.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gerenciar Sessões Ativas</h1>
        </div>
        <Button onClick={carregarSessoes} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Sessões Ativas ({sessoes.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessoes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma sessão ativa encontrada
              </p>
            ) : (
              <div className="space-y-4">
                {sessoes.map((sessao) => {
                  const statusInfo = getStatusSessao(sessao.lastActivity)
                  return (
                    <div
                      key={sessao.sessionId}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                          <div>
                            <p className="font-medium">{sessao.email}</p>
                            <p className="text-sm text-gray-500">ID: {sessao.userId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{statusInfo.status}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerSessao(sessao.sessionId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Login:</p>
                          <p className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatarTempo(sessao.loginTime)}</span>
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Última Atividade:</p>
                          <p>{formatarTempo(sessao.lastActivity)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Tempo Ativo:</p>
                          <p>{calcularTempoAtivo(sessao.loginTime)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 text-sm">Navegador:</p>
                        <p className="text-sm">{sessao.browserInfo}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 text-sm">ID da Sessão:</p>
                        <p className="text-xs font-mono bg-gray-100 p-1 rounded">
                          {sessao.sessionId}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}