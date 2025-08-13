"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Eye,
  FileText,
  Mail,
  Plus,
  Search,
  Shield,
  User,
  Calendar,
  Clock,
  Activity,
  Send,
  Download,
  Filter,
  RefreshCw
} from "lucide-react"

interface LogAuditoria {
  id: string
  tipo: 'inclusao' | 'exclusao' | 'edicao' | 'criacao' | 'login' | 'logout'
  entidade: string // pessoas, usuarios, condominios, etc.
  descricao: string
  usuarioId: string
  usuarioNome: string
  usuarioPerfil: string
  dataHora: Date
  detalhes: any
  ip?: string
  navegador?: string
  status: 'pendente' | 'notificado' | 'visualizado'
  criticidade: 'baixa' | 'media' | 'alta' | 'critica'
}

interface NotificacaoAdmin {
  id: string
  logId: string
  adminId: string
  dataEnvio: Date
  dataVisualizacao?: Date
  status: 'enviada' | 'visualizada' | 'respondida'
  resposta?: string
}

const tiposOperacao = [
  { value: 'inclusao', label: 'Inclusão', color: 'bg-green-100 text-green-800' },
  { value: 'exclusao', label: 'Exclusão', color: 'bg-red-100 text-red-800' },
  { value: 'edicao', label: 'Edição', color: 'bg-blue-100 text-blue-800' },
  { value: 'criacao', label: 'Criação', color: 'bg-purple-100 text-purple-800' },
  { value: 'login', label: 'Login', color: 'bg-gray-100 text-gray-800' },
  { value: 'logout', label: 'Logout', color: 'bg-gray-100 text-gray-800' },
]

const nivelCriticidade = [
  { value: 'baixa', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-800' },
]

export default function SistemaAuditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [notificacoes, setNotificacoes] = useState<NotificacaoAdmin[]>([])
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    entidade: 'todos',
    criticidade: 'todos',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
    usuario: ''
  })
  const [showDetalhes, setShowDetalhes] = useState<LogAuditoria | null>(null)
  const [showNotificar, setShowNotificar] = useState(false)
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('')

  useEffect(() => {
    carregarLogs()
    carregarNotificacoes()
  }, [])

  const carregarLogs = () => {
    // Carregar logs do localStorage ou API
    const logsStorage = localStorage.getItem('logs_auditoria')
    if (logsStorage) {
      const logsData = JSON.parse(logsStorage).map((log: any) => ({
        ...log,
        dataHora: new Date(log.dataHora)
      }))
      setLogs(logsData)
    } else {
      // Logs de exemplo
      const logsExemplo: LogAuditoria[] = [
        {
          id: '1',
          tipo: 'inclusao',
          entidade: 'pessoas',
          descricao: 'Nova pessoa cadastrada: João Silva',
          usuarioId: 'user1',
          usuarioNome: 'Admin Local',
          usuarioPerfil: 'gerente',
          dataHora: new Date(),
          detalhes: { nome: 'João Silva', cpf: '123.456.789-00' },
          ip: '192.168.1.100',
          navegador: 'Chrome 120.0',
          status: 'pendente',
          criticidade: 'media'
        },
        {
          id: '2',
          tipo: 'exclusao',
          entidade: 'usuarios',
          descricao: 'Usuário removido: Maria Santos',
          usuarioId: 'user2',
          usuarioNome: 'Gestor Segurança',
          usuarioPerfil: 'gestor-seguranca',
          dataHora: new Date(Date.now() - 3600000),
          detalhes: { nome: 'Maria Santos', email: 'maria@email.com' },
          ip: '192.168.1.101',
          navegador: 'Firefox 119.0',
          status: 'notificado',
          criticidade: 'alta'
        }
      ]
      setLogs(logsExemplo)
      localStorage.setItem('logs_auditoria', JSON.stringify(logsExemplo))
    }
  }

  const carregarNotificacoes = () => {
    const notificacoesStorage = localStorage.getItem('notificacoes_admin')
    if (notificacoesStorage) {
      const notificacoesData = JSON.parse(notificacoesStorage).map((notif: any) => ({
        ...notif,
        dataEnvio: new Date(notif.dataEnvio),
        dataVisualizacao: notif.dataVisualizacao ? new Date(notif.dataVisualizacao) : undefined
      }))
      setNotificacoes(notificacoesData)
    }
  }

  // Função para registrar nova atividade (será chamada por outros componentes)
  const registrarAtividade = (atividade: Omit<LogAuditoria, 'id' | 'dataHora' | 'status'>) => {
    const novoLog: LogAuditoria = {
      ...atividade,
      id: Date.now().toString(),
      dataHora: new Date(),
      status: 'pendente'
    }

    const logsAtualizados = [novoLog, ...logs]
    setLogs(logsAtualizados)
    localStorage.setItem('logs_auditoria', JSON.stringify(logsAtualizados))

    // Enviar notificação automática para admin master
    enviarNotificacaoAutomatica(novoLog)
  }

  const enviarNotificacaoAutomatica = async (log: LogAuditoria) => {
    // Buscar todos os usuários com perfil admin-master
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const adminsMaster = usuarios.filter((u: any) => u.perfil === 'administrador-master')

    for (const admin of adminsMaster) {
      const notificacao: NotificacaoAdmin = {
        id: Date.now().toString() + Math.random(),
        logId: log.id,
        adminId: admin.id,
        dataEnvio: new Date(),
        status: 'enviada'
      }

      // Simular envio de email
      await enviarEmailNotificacao(admin, log)
      
      const notificacoesAtualizadas = [...notificacoes, notificacao]
      setNotificacoes(notificacoesAtualizadas)
      localStorage.setItem('notificacoes_admin', JSON.stringify(notificacoesAtualizadas))
    }

    // Atualizar status do log
    const logsAtualizados = logs.map(l => 
      l.id === log.id ? { ...l, status: 'notificado' as const } : l
    )
    setLogs(logsAtualizados)
    localStorage.setItem('logs_auditoria', JSON.stringify(logsAtualizados))
  }

  const enviarEmailNotificacao = async (admin: any, log: LogAuditoria) => {
    const assunto = `[AUDITORIA] ${log.tipo.toUpperCase()} - ${log.entidade}`
    const corpo = `
      NOTIFICAÇÃO DE AUDITORIA DO SISTEMA
      
      Tipo de Operação: ${tiposOperacao.find(t => t.value === log.tipo)?.label}
      Entidade: ${log.entidade}
      Descrição: ${log.descricao}
      
      Usuário Responsável:
      - Nome: ${log.usuarioNome}
      - Perfil: ${log.usuarioPerfil}
      - ID: ${log.usuarioId}
      
      Detalhes Técnicos:
      - Data/Hora: ${log.dataHora.toLocaleString()}
      - IP: ${log.ip || 'N/A'}
      - Navegador: ${log.navegador || 'N/A'}
      - Criticidade: ${nivelCriticidade.find(n => n.value === log.criticidade)?.label}
      
      Detalhes da Operação:
      ${JSON.stringify(log.detalhes, null, 2)}
      
      ---
      Sistema de Controle de Acesso
      Notificação automática - Não responder
    `

    // Simular envio de email
    console.log(`Email enviado para ${admin.email}:`, { assunto, corpo })
    
    // Em produção, aqui seria feita a integração com serviço de email
    // await emailService.send(admin.email, assunto, corpo)
  }

  const exportarRelatorio = () => {
    const dadosExport = logs.map(log => ({
      'Data/Hora': log.dataHora.toLocaleString(),
      'Tipo': tiposOperacao.find(t => t.value === log.tipo)?.label,
      'Entidade': log.entidade,
      'Descrição': log.descricao,
      'Usuário': log.usuarioNome,
      'Perfil': log.usuarioPerfil,
      'Criticidade': nivelCriticidade.find(n => n.value === log.criticidade)?.label,
      'Status': log.status,
      'IP': log.ip || 'N/A'
    }))

    const csv = [
      Object.keys(dadosExport[0]).join(','),
      ...dadosExport.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const logsFiltrados = logs.filter(log => {
    if (filtros.tipo !== 'todos' && log.tipo !== filtros.tipo) return false
    if (filtros.entidade !== 'todos' && log.entidade !== filtros.entidade) return false
    if (filtros.criticidade !== 'todos' && log.criticidade !== filtros.criticidade) return false
    if (filtros.status !== 'todos' && log.status !== filtros.status) return false
    if (filtros.usuario && !log.usuarioNome.toLowerCase().includes(filtros.usuario.toLowerCase())) return false
    if (filtros.dataInicio && log.dataHora < new Date(filtros.dataInicio)) return false
    if (filtros.dataFim && log.dataHora > new Date(filtros.dataFim + 'T23:59:59')) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Auditoria</h2>
          <p className="text-gray-600">Monitoramento e notificação automática de atividades</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportarRelatorio} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={carregarLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {logs.filter(l => l.status === 'pendente').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(l => l.criticidade === 'critica').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notificados</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(l => l.status === 'notificado').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros({...filtros, tipo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {tiposOperacao.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entidade</Label>
              <Select value={filtros.entidade} onValueChange={(value) => setFiltros({...filtros, entidade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="pessoas">Pessoas</SelectItem>
                  <SelectItem value="usuarios">Usuários</SelectItem>
                  <SelectItem value="condominios">Condomínios</SelectItem>
                  <SelectItem value="dispositivos">Dispositivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Criticidade</Label>
              <Select value={filtros.criticidade} onValueChange={(value) => setFiltros({...filtros, criticidade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {nivelCriticidade.map(nivel => (
                    <SelectItem key={nivel.value} value={nivel.value}>{nivel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="notificado">Notificado</SelectItem>
                  <SelectItem value="visualizado">Visualizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              />
            </div>

            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              />
            </div>

            <div>
              <Label>Usuário</Label>
              <Input
                placeholder="Nome do usuário"
                value={filtros.usuario}
                onChange={(e) => setFiltros({...filtros, usuario: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria ({logsFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsFiltrados.map((log) => {
                const tipoInfo = tiposOperacao.find(t => t.value === log.tipo)
                const criticidadeInfo = nivelCriticidade.find(n => n.value === log.criticidade)
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.dataHora.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={tipoInfo?.color}>
                        {tipoInfo?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{log.entidade}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.descricao}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.usuarioNome}</p>
                        <p className="text-sm text-gray-500 capitalize">{log.usuarioPerfil.replace('-', ' ')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={criticidadeInfo?.color}>
                        {criticidadeInfo?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'pendente' ? 'destructive' : log.status === 'notificado' ? 'default' : 'secondary'}>
                        {log.status === 'pendente' ? 'Pendente' : log.status === 'notificado' ? 'Notificado' : 'Visualizado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetalhes(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!showDetalhes} onOpenChange={() => setShowDetalhes(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
          </DialogHeader>
          {showDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Operação</Label>
                  <p className="font-medium">{tiposOperacao.find(t => t.value === showDetalhes.tipo)?.label}</p>
                </div>
                <div>
                  <Label>Entidade</Label>
                  <p className="font-medium capitalize">{showDetalhes.entidade}</p>
                </div>
                <div>
                  <Label>Data/Hora</Label>
                  <p className="font-medium">{showDetalhes.dataHora.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Criticidade</Label>
                  <Badge className={nivelCriticidade.find(n => n.value === showDetalhes.criticidade)?.color}>
                    {nivelCriticidade.find(n => n.value === showDetalhes.criticidade)?.label}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <p className="font-medium">{showDetalhes.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usuário Responsável</Label>
                  <p className="font-medium">{showDetalhes.usuarioNome}</p>
                  <p className="text-sm text-gray-500 capitalize">{showDetalhes.usuarioPerfil.replace('-', ' ')}</p>
                </div>
                <div>
                  <Label>ID do Usuário</Label>
                  <p className="font-mono text-sm">{showDetalhes.usuarioId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Endereço IP</Label>
                  <p className="font-mono text-sm">{showDetalhes.ip || 'N/A'}</p>
                </div>
                <div>
                  <Label>Navegador</Label>
                  <p className="text-sm">{showDetalhes.navegador || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <Label>Detalhes da Operação</Label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(showDetalhes.detalhes, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Função utilitária para ser usada por outros componentes
export const registrarAtividadeAuditoria = (atividade: {
  tipo: 'inclusao' | 'exclusao' | 'edicao' | 'criacao' | 'login' | 'logout'
  entidade: string
  descricao: string
  usuarioId: string
  usuarioNome: string
  usuarioPerfil: string
  detalhes: any
  criticidade: 'baixa' | 'media' | 'alta' | 'critica'
  ip?: string
  navegador?: string
}) => {
  const novoLog: LogAuditoria = {
    ...atividade,
    id: Date.now().toString(),
    dataHora: new Date(),
    status: 'pendente'
  }

  // Salvar no localStorage
  const logs = JSON.parse(localStorage.getItem('logs_auditoria') || '[]')
  const logsAtualizados = [novoLog, ...logs]
  localStorage.setItem('logs_auditoria', JSON.stringify(logsAtualizados))

  // Enviar notificação automática
  enviarNotificacaoAutomaticaUtil(novoLog)
}

const enviarNotificacaoAutomaticaUtil = async (log: LogAuditoria) => {
  // Buscar todos os usuários com perfil admin-master
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
  const adminsMaster = usuarios.filter((u: any) => u.perfil === 'administrador-master')

  for (const admin of adminsMaster) {
    const notificacao: NotificacaoAdmin = {
      id: Date.now().toString() + Math.random(),
      logId: log.id,
      adminId: admin.id,
      dataEnvio: new Date(),
      status: 'enviada'
    }

    // Simular envio de email
    console.log(`[AUDITORIA] Email enviado para ${admin.email}:`, {
      assunto: `[AUDITORIA] ${log.tipo.toUpperCase()} - ${log.entidade}`,
      log: log
    })
    
    // Salvar notificação
    const notificacoes = JSON.parse(localStorage.getItem('notificacoes_admin') || '[]')
    const notificacoesAtualizadas = [...notificacoes, notificacao]
    localStorage.setItem('notificacoes_admin', JSON.stringify(notificacoesAtualizadas))
  }

  // Atualizar status do log
  const logs = JSON.parse(localStorage.getItem('logs_auditoria') || '[]')
  const logsAtualizados = logs.map((l: LogAuditoria) => 
    l.id === log.id ? { ...l, status: 'notificado' } : l
  )
  localStorage.setItem('logs_auditoria', JSON.stringify(logsAtualizados))
}