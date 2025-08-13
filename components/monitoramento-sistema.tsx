"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Camera, Shield, Clock, User, MapPin, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface EventoAcesso {
  id: string
  usuario: string
  dispositivo: string
  local: string
  condominio: string
  dataHora: Date
  tipo: "entrada" | "saida"
  status: "autorizado" | "negado" | "erro"
  foto?: string
  observacoes?: string
}

interface StatusCamera {
  id: string
  nome: string
  ip: string
  local: string
  status: "online" | "offline" | "erro"
  ultimaVerificacao: Date
  resolucao: string
  fps: number
}

interface StatusDispositivo {
  id: string
  nome: string
  tipo: string
  ip: string
  status: "online" | "offline" | "erro"
  ultimoPing: Date
  condominio: string
  condominioId: string
}

export default function MonitoramentoSistema() {
  const { getAccessibleCondominios, canAccessCondominio } = useAuth()
  const [eventosAcesso, setEventosAcesso] = useState<EventoAcesso[]>([])
  const [cameras, setCameras] = useState<StatusCamera[]>([])
  const [dispositivos, setDispositivos] = useState<StatusDispositivo[]>([])
  const [filtroTempo, setFiltroTempo] = useState("hoje")
  const [monitorandoTempo, setMonitorandoTempo] = useState(true)

  useEffect(() => {
    // Dados de exemplo para eventos de acesso
    const exemploEventos: EventoAcesso[] = [
      {
        id: "1",
        usuario: "João Silva",
        dispositivo: "Leitor Facial 01",
        local: "Portaria Principal",
        condominio: "Residencial Jardim",
        dataHora: new Date(Date.now() - 300000), // 5 min atrás
        tipo: "entrada",
        status: "autorizado",
        foto: "/placeholder.svg?height=50&width=50",
      },
      {
        id: "2",
        usuario: "Maria Santos",
        dispositivo: "Leitor RFID 02",
        local: "Garagem",
        condominio: "Residencial Jardim",
        dataHora: new Date(Date.now() - 600000), // 10 min atrás
        tipo: "saida",
        status: "autorizado",
      },
      {
        id: "3",
        usuario: "Pedro Costa",
        dispositivo: "Leitor Facial 03",
        local: "Salão de Festas",
        condominio: "Condomínio Solar",
        dataHora: new Date(Date.now() - 900000), // 15 min atrás
        tipo: "entrada",
        status: "negado",
        observacoes: "Usuário não autorizado para este local",
      },
    ]

    // Filtrar eventos baseado nas permissões do usuário
    const accessibleCondominios = getAccessibleCondominios()
    const condominiosData = JSON.parse(localStorage.getItem('condominios') || '[]')
    const condominiosMap = new Map(condominiosData.map((c: any) => [c.nome, c.id]))
    
    const eventosFiltrados = exemploEventos.filter(evento => {
      const condominioId = condominiosMap.get(evento.condominio)
      return condominioId && canAccessCondominio(condominioId)
    })

    // Dados de exemplo para câmeras
    const exemploCameras: StatusCamera[] = [
      {
        id: "1",
        nome: "Câmera Portaria",
        ip: "192.168.1.100",
        local: "Portaria Principal",
        status: "online",
        ultimaVerificacao: new Date(),
        resolucao: "1920x1080",
        fps: 30,
      },
      {
        id: "2",
        nome: "Câmera Garagem",
        ip: "192.168.1.101",
        local: "Garagem",
        status: "online",
        ultimaVerificacao: new Date(),
        resolucao: "1280x720",
        fps: 25,
      },
      {
        id: "3",
        nome: "Câmera Playground",
        ip: "192.168.1.102",
        local: "Área de Lazer",
        status: "erro",
        ultimaVerificacao: new Date(Date.now() - 1800000), // 30 min atrás
        resolucao: "1920x1080",
        fps: 0,
      },
    ]

    // Dados de exemplo para dispositivos
    const exemploDispositivos: StatusDispositivo[] = [
      {
        id: "1",
        nome: "Leitor Facial 01",
        tipo: "facial",
        ip: "192.168.1.20",
        status: "online",
        ultimoPing: new Date(),
        condominio: "Residencial Jardim",
        condominioId: "1",
      },
      {
        id: "2",
        nome: "Leitor RFID 02",
        tipo: "rfid",
        ip: "192.168.1.21",
        status: "offline",
        ultimoPing: new Date(Date.now() - 3600000), // 1 hora atrás
        condominio: "Residencial Jardim",
        condominioId: "1",
      },
      {
        id: "3",
        nome: "Leitor RFID 03",
        tipo: "rfid",
        ip: "192.168.1.22",
        status: "online",
        ultimoPing: new Date(),
        condominio: "Condomínio Solar",
        condominioId: "2",
      },
    ]

    // Filtrar dispositivos baseado nas permissões do usuário
    const dispositivosFiltrados = exemploDispositivos.filter(dispositivo => 
      canAccessCondominio(dispositivo.condominioId)
    )

    setEventosAcesso(eventosFiltrados)
    setCameras(exemploCameras)
    setDispositivos(dispositivosFiltrados)

    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      if (monitorandoTempo) {
        // Adicionar novo evento ocasionalmente
        if (Math.random() > 0.8) {
          const novoEvento: EventoAcesso = {
            id: Date.now().toString(),
            usuario: `Usuário ${Math.floor(Math.random() * 100)}`,
            dispositivo: "Leitor Facial 01",
            local: "Portaria Principal",
            condominio: "Residencial Jardim",
            dataHora: new Date(),
            tipo: Math.random() > 0.5 ? "entrada" : "saida",
            status: Math.random() > 0.1 ? "autorizado" : "negado",
          }
          setEventosAcesso((prev) => [novoEvento, ...prev.slice(0, 19)]) // Manter apenas 20 eventos
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [monitorandoTempo])

  const filtrarEventos = () => {
    const agora = new Date()
    let dataLimite = new Date()

    switch (filtroTempo) {
      case "hoje":
        dataLimite.setHours(0, 0, 0, 0)
        break
      case "semana":
        dataLimite.setDate(agora.getDate() - 7)
        break
      case "mes":
        dataLimite.setMonth(agora.getMonth() - 1)
        break
      default:
        dataLimite = new Date(0) // Todos os eventos
    }

    return eventosAcesso.filter((evento) => evento.dataHora >= dataLimite)
  }

  const eventosFiltrados = filtrarEventos()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monitoramento do Sistema</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Monitoramento:</Label>
            <Button
              variant={monitorandoTempo ? "default" : "outline"}
              size="sm"
              onClick={() => setMonitorandoTempo(!monitorandoTempo)}
            >
              {monitorandoTempo ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Ativo
                </>
              ) : (
                "Pausado"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Câmeras Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {cameras.filter((c) => c.status === "online").length}/{cameras.length}
                </p>
              </div>
              <Camera className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dispositivos Online</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dispositivos.filter((d) => d.status === "online").length}/{dispositivos.length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acessos Hoje</p>
                <p className="text-2xl font-bold text-purple-600">{eventosFiltrados.length}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acessos Negados</p>
                <p className="text-2xl font-bold text-red-600">
                  {eventosFiltrados.filter((e) => e.status === "negado").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Câmeras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Status das Câmeras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className={`p-4 rounded-lg border ${
                  camera.status === "online"
                    ? "bg-green-50 border-green-200"
                    : camera.status === "offline"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{camera.nome}</h3>
                  <Badge
                    variant={
                      camera.status === "online" ? "default" : camera.status === "offline" ? "secondary" : "destructive"
                    }
                  >
                    {camera.status === "online" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {camera.status !== "online" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {camera.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>IP: {camera.ip}</p>
                  <p>Local: {camera.local}</p>
                  <p>Resolução: {camera.resolucao}</p>
                  <p>FPS: {camera.fps}</p>
                  <p>Última verificação: {camera.ultimaVerificacao.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status dos Dispositivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Status dos Dispositivos de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dispositivos.map((dispositivo) => (
              <div
                key={dispositivo.id}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  dispositivo.status === "online"
                    ? "bg-green-50 border-green-200"
                    : dispositivo.status === "offline"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <div>
                  <h3 className="font-semibold">{dispositivo.nome}</h3>
                  <div className="text-sm text-gray-600">
                    <p>
                      Tipo: {dispositivo.tipo} | IP: {dispositivo.ip}
                    </p>
                    <p>Condomínio: {dispositivo.condominio}</p>
                    <p>Último ping: {dispositivo.ultimoPing.toLocaleString()}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    dispositivo.status === "online"
                      ? "default"
                      : dispositivo.status === "offline"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {dispositivo.status === "online" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {dispositivo.status !== "online" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {dispositivo.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eventos de Acesso em Tempo Real */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Eventos de Acesso em Tempo Real
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label>Filtro:</Label>
              <select
                className="p-2 border rounded"
                value={filtroTempo}
                onChange={(e) => setFiltroTempo(e.target.value)}
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="todos">Todos</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {eventosFiltrados.map((evento) => (
              <div
                key={evento.id}
                className={`p-4 rounded-lg border ${
                  evento.status === "autorizado"
                    ? "bg-green-50 border-green-200"
                    : evento.status === "negado"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {evento.foto && (
                      <img
                        src={evento.foto || "/placeholder.svg"}
                        alt={evento.usuario}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{evento.usuario}</h3>
                      <div className="text-sm text-gray-600">
                        <p>
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {evento.local} - {evento.condominio}
                        </p>
                        <p>Dispositivo: {evento.dispositivo}</p>
                        <p>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {evento.dataHora.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        evento.status === "autorizado"
                          ? "default"
                          : evento.status === "negado"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {evento.tipo.toUpperCase()} - {evento.status.toUpperCase()}
                    </Badge>
                    {evento.observacoes && <p className="text-xs text-gray-500 mt-1 max-w-48">{evento.observacoes}</p>}
                  </div>
                </div>
              </div>
            ))}

            {eventosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento de acesso encontrado no período selecionado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
