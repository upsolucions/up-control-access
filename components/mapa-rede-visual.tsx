"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Network,
  Router,
  Monitor,
  Smartphone,
  Camera,
  Server,
  Laptop,
  Printer,
  RefreshCw,
  Wifi,
  Globe,
} from "lucide-react"

interface DispositivoRede {
  ip: string
  mac: string
  hostname: string
  tipo: string
  modelo: string
  fabricante: string
  status: "online" | "offline" | "erro"
  ultimoPing: Date
  servicos: string[]
  gateway?: boolean
  dhcp?: boolean
}

interface InfoRede {
  ip: string
  mascara: string
  gateway: string
  dns: string[]
  dhcpRange: string
}

export default function MapaRedeVisual() {
  const [dispositivos, setDispositivos] = useState<DispositivoRede[]>([])
  const [infoRede, setInfoRede] = useState<InfoRede>({
    ip: "192.168.1.100",
    mascara: "255.255.255.0",
    gateway: "192.168.1.1",
    dns: ["8.8.8.8", "8.8.4.4"],
    dhcpRange: "192.168.1.100-192.168.1.200",
  })
  const [escaneando, setEscaneando] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  const iconesPorTipo: { [key: string]: any } = {
    roteador: Router,
    switch: Server,
    computador: Monitor,
    notebook: Laptop,
    smartphone: Smartphone,
    tablet: Smartphone,
    camera: Camera,
    impressora: Printer,
    servidor: Server,
    outros: Monitor,
  }

  const coresPorStatus = {
    online: "bg-green-100 border-green-300 text-green-800",
    offline: "bg-red-100 border-red-300 text-red-800",
    erro: "bg-yellow-100 border-yellow-300 text-yellow-800",
  }

  const coresPorTipo = {
    roteador: "bg-blue-100 border-blue-300",
    switch: "bg-purple-100 border-purple-300",
    computador: "bg-gray-100 border-gray-300",
    notebook: "bg-gray-100 border-gray-300",
    smartphone: "bg-green-100 border-green-300",
    tablet: "bg-green-100 border-green-300",
    camera: "bg-red-100 border-red-300",
    impressora: "bg-orange-100 border-orange-300",
    servidor: "bg-indigo-100 border-indigo-300",
    outros: "bg-gray-100 border-gray-300",
  }

  useEffect(() => {
    // Detectar informações da rede automaticamente
    detectarInfoRede()
    escanearRede()
  }, [])

  const detectarInfoRede = async () => {
    // Simular detecção automática da rede
    const infoDetectada: InfoRede = {
      ip: "192.168.1.100",
      mascara: "255.255.255.0",
      gateway: "192.168.1.1",
      dns: ["192.168.1.1", "8.8.8.8"],
      dhcpRange: "192.168.1.100-192.168.1.200",
    }
    setInfoRede(infoDetectada)
  }

  const escanearRede = async () => {
    setEscaneando(true)

    // Simular escaneamento completo da rede
    const dispositivosEncontrados: DispositivoRede[] = [
      {
        ip: "192.168.1.1",
        mac: "00:11:22:33:44:55",
        hostname: "router.local",
        tipo: "roteador",
        modelo: "Archer C7",
        fabricante: "TP-Link",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["HTTP", "HTTPS", "SSH", "DHCP"],
        gateway: true,
        dhcp: true,
      },
      {
        ip: "192.168.1.2",
        mac: "00:11:22:33:44:66",
        hostname: "switch-principal",
        tipo: "switch",
        modelo: "SG200-08",
        fabricante: "Cisco",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["SNMP", "HTTP"],
      },
      {
        ip: "192.168.1.10",
        mac: "00:11:22:33:44:77",
        hostname: "camera-portaria",
        tipo: "camera",
        modelo: "DS-2CD2042WD-I",
        fabricante: "Hikvision",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["HTTP", "RTSP", "ONVIF"],
      },
      {
        ip: "192.168.1.11",
        mac: "00:11:22:33:44:88",
        hostname: "camera-garagem",
        tipo: "camera",
        modelo: "IPC-HFW4431R-Z",
        fabricante: "Dahua",
        status: "offline",
        ultimoPing: new Date(Date.now() - 1800000),
        servicos: ["HTTP", "RTSP"],
      },
      {
        ip: "192.168.1.20",
        mac: "00:11:22:33:44:99",
        hostname: "pc-recepcao",
        tipo: "computador",
        modelo: "OptiPlex 3070",
        fabricante: "Dell",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["RDP", "SMB", "HTTP"],
      },
      {
        ip: "192.168.1.21",
        mac: "00:11:22:33:44:AA",
        hostname: "notebook-admin",
        tipo: "notebook",
        modelo: "ThinkPad E14",
        fabricante: "Lenovo",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["SMB", "SSH"],
      },
      {
        ip: "192.168.1.30",
        mac: "00:11:22:33:44:BB",
        hostname: "smartphone-android",
        tipo: "smartphone",
        modelo: "Galaxy S21",
        fabricante: "Samsung",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["HTTP"],
      },
      {
        ip: "192.168.1.31",
        mac: "00:11:22:33:44:CC",
        hostname: "iphone-user",
        tipo: "smartphone",
        modelo: "iPhone 13",
        fabricante: "Apple",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["HTTP"],
      },
      {
        ip: "192.168.1.40",
        mac: "00:11:22:33:44:DD",
        hostname: "impressora-hp",
        tipo: "impressora",
        modelo: "LaserJet Pro M404n",
        fabricante: "HP",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["HTTP", "IPP", "SNMP"],
      },
      {
        ip: "192.168.1.50",
        mac: "00:11:22:33:44:EE",
        hostname: "servidor-local",
        tipo: "servidor",
        modelo: "PowerEdge T140",
        fabricante: "Dell",
        status: "online",
        ultimoPing: new Date(),
        servicos: ["HTTP", "HTTPS", "SSH", "FTP", "SMB"],
      },
    ]

    // Simular tempo de escaneamento
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setDispositivos(dispositivosEncontrados)
    setEscaneando(false)
  }

  const dispositivosFiltrados = dispositivos.filter((dispositivo) => {
    const tipoMatch = filtroTipo === "todos" || dispositivo.tipo === filtroTipo
    const statusMatch = filtroStatus === "todos" || dispositivo.status === filtroStatus
    return tipoMatch && statusMatch
  })

  const tiposDispositivos = Array.from(new Set(dispositivos.map((d) => d.tipo)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mapa Visual da Rede Local</h2>
        <Button onClick={escanearRede} disabled={escaneando}>
          <RefreshCw className={`h-4 w-4 mr-2 ${escaneando ? "animate-spin" : ""}`} />
          {escaneando ? "Escaneando..." : "Escanear Rede"}
        </Button>
      </div>

      {/* Informações da Rede */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Informações da Rede Local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label>IP Local</Label>
              <p className="font-mono text-sm">{infoRede.ip}</p>
            </div>
            <div>
              <Label>Máscara de Rede</Label>
              <p className="font-mono text-sm">{infoRede.mascara}</p>
            </div>
            <div>
              <Label>Gateway</Label>
              <p className="font-mono text-sm">{infoRede.gateway}</p>
            </div>
            <div>
              <Label>DNS</Label>
              <p className="font-mono text-sm">{infoRede.dns.join(", ")}</p>
            </div>
            <div>
              <Label>Range DHCP</Label>
              <p className="font-mono text-sm">{infoRede.dhcpRange}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Dispositivo</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos os Tipos</option>
                {tiposDispositivos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="erro">Erro</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroTipo("todos")
                  setFiltroStatus("todos")
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {dispositivos.filter((d) => d.status === "online").length}
              </p>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {dispositivos.filter((d) => d.status === "offline").length}
              </p>
              <p className="text-sm text-gray-600">Offline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {dispositivos.filter((d) => d.status === "erro").length}
              </p>
              <p className="text-sm text-gray-600">Com Erro</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dispositivos.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Mapa Visual dos Dispositivos ({dispositivosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {dispositivosFiltrados.map((dispositivo) => {
              const IconeDispositivo = iconesPorTipo[dispositivo.tipo] || Monitor
              const corTipo = coresPorTipo[dispositivo.tipo] || "bg-gray-100 border-gray-300"

              return (
                <div
                  key={dispositivo.ip}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${corTipo}`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative">
                      <IconeDispositivo className="h-8 w-8" />
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                          dispositivo.status === "online"
                            ? "bg-green-500"
                            : dispositivo.status === "offline"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{dispositivo.hostname}</p>
                      <p className="text-xs text-gray-600">{dispositivo.ip}</p>
                      <p className="text-xs text-gray-500">{dispositivo.fabricante}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {dispositivo.tipo}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {dispositivosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos por Tipo e Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tiposDispositivos.map((tipo) => {
              const dispositivosTipo = dispositivos.filter((d) => d.tipo === tipo)
              const IconeTipo = iconesPorTipo[tipo] || Monitor

              return (
                <div key={tipo} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <IconeTipo className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold capitalize">{tipo}</h3>
                    <Badge variant="outline" className="ml-2">
                      {dispositivosTipo.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dispositivosTipo.map((dispositivo) => (
                      <div key={dispositivo.ip} className={`p-3 rounded border ${coresPorStatus[dispositivo.status]}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{dispositivo.hostname}</p>
                            <p className="text-xs text-gray-600">{dispositivo.ip}</p>
                            <p className="text-xs text-gray-500">
                              {dispositivo.fabricante} {dispositivo.modelo}
                            </p>
                          </div>
                          <Badge
                            variant={
                              dispositivo.status === "online"
                                ? "default"
                                : dispositivo.status === "offline"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {dispositivo.status}
                          </Badge>
                        </div>
                        {dispositivo.servicos.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Serviços:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dispositivo.servicos.slice(0, 3).map((servico) => (
                                <Badge key={servico} variant="outline" className="text-xs">
                                  {servico}
                                </Badge>
                              ))}
                              {dispositivo.servicos.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{dispositivo.servicos.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
