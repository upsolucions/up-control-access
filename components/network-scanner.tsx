"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Wifi,
  Monitor,
  Smartphone,
  Router,
  Camera,
  Laptop,
  Server,
  Printer,
  RefreshCw,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react"

interface DispositivoRede {
  id: string
  ip: string
  mac?: string
  hostname?: string
  tipo:
    | "telefone"
    | "computador"
    | "roteador"
    | "switch"
    | "camera"
    | "rfid"
    | "telefone_ip"
    | "facial"
    | "biometria"
    | "notebook"
    | "impressora"
    | "servidor"
    | "outros"
  status: "online" | "offline" | "erro"
  ultimaPing: Date
  fabricante?: string
  modelo?: string
  servicos?: string[]
  nomeCustomizado?: string
  condominioId?: string
}

interface Condominio {
  id: string
  nome: string
}

interface NetworkScannerProps {
  condominioId?: string
}

export default function NetworkScanner({ condominioId }: NetworkScannerProps) {
  const [dispositivos, setDispositivos] = useState<DispositivoRede[]>([])
  const [dispositivosCadastrados, setDispositivosCadastrados] = useState<DispositivoRede[]>([])
  const [escaneando, setEscaneando] = useState(false)
  const [redeLocal, setRedeLocal] = useState("192.168.1")
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState<DispositivoRede | null>(null)
  const [testando, setTestando] = useState<string | null>(null)
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [condominioSelecionado, setCondominioSelecionado] = useState<string>("")
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nomeCustomizado: "",
    condominioId: "",
  })

  const iconesPorTipo = {
    telefone: Smartphone,
    computador: Monitor,
    roteador: Router,
    switch: Server,
    camera: Camera,
    rfid: Settings,
    telefone_ip: Smartphone,
    facial: Camera,
    biometria: Settings,
    notebook: Laptop,
    impressora: Printer,
    servidor: Server,
    outros: Monitor,
  }

  const coresPorStatus = {
    online: "bg-green-100 border-green-300 text-green-800",
    offline: "bg-red-100 border-red-300 text-red-800",
    erro: "bg-yellow-100 border-yellow-300 text-yellow-800",
  }

  useEffect(() => {
    // Carregar condominios
    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    } else {
      // Dados de exemplo
      const exemploCondominios = [
        { id: "1", nome: "Residencial Jardim das Flores" },
        { id: "2", nome: "Condomínio Solar" },
      ]
      setCondominios(exemploCondominios)
      localStorage.setItem("condominios", JSON.stringify(exemploCondominios))
    }

    // Carregar dispositivos cadastrados
    const savedDispositivos = localStorage.getItem("dispositivosCadastrados")
    if (savedDispositivos) {
      let allDispositivos = JSON.parse(savedDispositivos)
      // Se condominioId for fornecido, filtrar apenas dispositivos desse condomínio
      if (condominioId) {
        allDispositivos = allDispositivos.filter((d: DispositivoRede) => d.condominioId === condominioId)
      }
      setDispositivosCadastrados(allDispositivos)
    }

    // Se condominioId for fornecido, definir como padrão no formulário
    if (condominioId) {
      setCondominioSelecionado(condominioId)
      setFormData(prev => ({ ...prev, condominioId }))
    }
  }, [condominioId])

  // Simular escaneamento da rede local
  const escanearRede = async () => {
    setEscaneando(true)

    // Simular descoberta de dispositivos
    const dispositivosEncontrados: DispositivoRede[] = [
      {
        id: "1",
        ip: `${redeLocal}.1`,
        mac: "00:11:22:33:44:55",
        hostname: "router.local",
        tipo: "roteador",
        status: "online",
        ultimaPing: new Date(),
        fabricante: "TP-Link",
        modelo: "Archer C7",
        servicos: ["HTTP", "HTTPS", "SSH"],
      },
      {
        id: "2",
        ip: `${redeLocal}.10`,
        mac: "00:11:22:33:44:66",
        hostname: "camera-portaria",
        tipo: "camera",
        status: "online",
        ultimaPing: new Date(),
        fabricante: "Hikvision",
        modelo: "DS-2CD2042WD-I",
        servicos: ["HTTP", "RTSP"],
      },
      {
        id: "3",
        ip: `${redeLocal}.15`,
        mac: "00:11:22:33:44:77",
        hostname: "leitor-rfid-01",
        tipo: "rfid",
        status: "offline",
        ultimaPing: new Date(Date.now() - 300000),
        fabricante: "Intelbras",
        modelo: "FR 1242",
        servicos: ["TCP/IP"],
      },
      {
        id: "4",
        ip: `${redeLocal}.20`,
        mac: "00:11:22:33:44:88",
        hostname: "facial-entrada",
        tipo: "facial",
        status: "online",
        ultimaPing: new Date(),
        fabricante: "ZKTeco",
        modelo: "SpeedFace-V5L",
        servicos: ["HTTP", "SDK"],
      },
      {
        id: "5",
        ip: `${redeLocal}.25`,
        mac: "00:11:22:33:44:99",
        hostname: "pc-recepcao",
        tipo: "computador",
        status: "online",
        ultimaPing: new Date(),
        fabricante: "Dell",
        modelo: "OptiPlex 3070",
        servicos: ["RDP", "SMB"],
      },
    ]

    // Simular tempo de escaneamento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setDispositivos(dispositivosEncontrados)
    setEscaneando(false)
  }

  // Testar conectividade do dispositivo
  const testarDispositivo = async (dispositivo: DispositivoRede) => {
    setTestando(dispositivo.ip)

    // Simular teste de conectividade
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const sucesso = Math.random() > 0.3 // 70% de chance de sucesso

    setDispositivos((prev) =>
      prev.map((d) =>
        d.ip === dispositivo.ip
          ? {
              ...d,
              status: sucesso ? "online" : "erro",
              ultimaPing: new Date(),
            }
          : d,
      ),
    )

    setTestando(null)
    alert(sucesso ? "Dispositivo respondeu com sucesso!" : "Dispositivo não respondeu ao teste")
  }

  // Cadastrar dispositivo no sistema
  const cadastrarDispositivo = (dispositivo: DispositivoRede) => {
    if (!formData.condominioId) {
      alert("Selecione um condomínio para cadastrar o dispositivo")
      return
    }

    const novoDispositivo = {
      ...dispositivo,
      nomeCustomizado: formData.nomeCustomizado || dispositivo.hostname || `Dispositivo ${dispositivo.ip}`,
      condominioId: formData.condominioId,
    }

    const novosDispositivos = [...dispositivosCadastrados, novoDispositivo]
    setDispositivosCadastrados(novosDispositivos)
    localStorage.setItem("dispositivosCadastrados", JSON.stringify(novosDispositivos))

    setDispositivoSelecionado(null)
    setFormData({ nomeCustomizado: "", condominioId: "" })
    alert("Dispositivo cadastrado com sucesso!")
  }

  // Editar dispositivo cadastrado
  const editarDispositivo = (dispositivo: DispositivoRede) => {
    setDispositivoSelecionado(dispositivo)
    setFormData({
      nomeCustomizado: dispositivo.nomeCustomizado || "",
      condominioId: dispositivo.condominioId || "",
    })
    setEditMode(true)
  }

  // Salvar edição de dispositivo
  const salvarEdicao = () => {
    if (!dispositivoSelecionado) return

    const dispositivosAtualizados = dispositivosCadastrados.map((d) =>
      d.id === dispositivoSelecionado.id
        ? {
            ...d,
            nomeCustomizado: formData.nomeCustomizado,
            condominioId: formData.condominioId,
          }
        : d,
    )

    setDispositivosCadastrados(dispositivosAtualizados)
    localStorage.setItem("dispositivosCadastrados", JSON.stringify(dispositivosAtualizados))

    setDispositivoSelecionado(null)
    setFormData({ nomeCustomizado: "", condominioId: "" })
    setEditMode(false)
    alert("Dispositivo atualizado com sucesso!")
  }

  // Excluir dispositivo cadastrado
  const excluirDispositivo = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este dispositivo?")) {
      const dispositivosAtualizados = dispositivosCadastrados.filter((d) => d.id !== id)
      setDispositivosCadastrados(dispositivosAtualizados)
      localStorage.setItem("dispositivosCadastrados", JSON.stringify(dispositivosAtualizados))
    }
  }

  // Filtrar dispositivos por condomínio
  const dispositivosFiltrados = condominioId
    ? dispositivosCadastrados // Já filtrados no useEffect
    : condominioSelecionado
    ? dispositivosCadastrados.filter((d) => d.condominioId === condominioSelecionado)
    : dispositivosCadastrados

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scanner de Rede Local</h2>
        <div className="flex gap-2">
          <Button onClick={escanearRede} disabled={escaneando} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${escaneando ? "animate-spin" : ""}`} />
            {escaneando ? "Escaneando..." : "Escanear Rede"}
          </Button>
        </div>
      </div>

      {/* Configurações de rede */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Escaneamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rede">Rede Local (primeiros 3 octetos)</Label>
              <Input
                id="rede"
                value={redeLocal}
                onChange={(e) => setRedeLocal(e.target.value)}
                placeholder="192.168.1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={escanearRede} disabled={escaneando}>
                Aplicar e Escanear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa visual da rede */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Encontrados na Rede</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {dispositivos.map((dispositivo) => {
              const IconeDispositivo = iconesPorTipo[dispositivo.tipo]

              return (
                <div
                  key={dispositivo.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${coresPorStatus[dispositivo.status]}`}
                  onClick={() => setDispositivoSelecionado(dispositivo)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <IconeDispositivo className="h-8 w-8" />
                    <div>
                      <p className="font-semibold text-sm">{dispositivo.hostname || dispositivo.ip}</p>
                      <p className="text-xs opacity-75">{dispositivo.ip}</p>
                      <Badge
                        variant={dispositivo.status === "online" ? "default" : "destructive"}
                        className="text-xs mt-1"
                      >
                        {dispositivo.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {dispositivos.length === 0 && !escaneando && (
            <div className="text-center py-8 text-gray-500">
              <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo encontrado. Clique em "Escanear Rede" para buscar dispositivos.</p>
            </div>
          )}

          {escaneando && (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
              <p>Escaneando rede local...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes do dispositivo selecionado */}
      {dispositivoSelecionado && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Detalhes do Dispositivo</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDispositivoSelecionado(null)}>
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Endereço IP</Label>
                <p className="font-mono text-sm">{dispositivoSelecionado.ip}</p>
              </div>
              <div>
                <Label>Endereço MAC</Label>
                <p className="font-mono text-sm">{dispositivoSelecionado.mac || "N/A"}</p>
              </div>
              <div>
                <Label>Hostname</Label>
                <p className="text-sm">{dispositivoSelecionado.hostname || "N/A"}</p>
              </div>
              <div>
                <Label>Tipo</Label>
                <p className="text-sm capitalize">{dispositivoSelecionado.tipo}</p>
              </div>
              <div>
                <Label>Fabricante</Label>
                <p className="text-sm">{dispositivoSelecionado.fabricante || "Desconhecido"}</p>
              </div>
              <div>
                <Label>Modelo</Label>
                <p className="text-sm">{dispositivoSelecionado.modelo || "N/A"}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={dispositivoSelecionado.status === "online" ? "default" : "destructive"}>
                  {dispositivoSelecionado.status === "online" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {dispositivoSelecionado.status !== "online" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {dispositivoSelecionado.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label>Última Resposta</Label>
                <p className="text-sm">{dispositivoSelecionado.ultimaPing.toString()}</p>
              </div>
            </div>

            {dispositivoSelecionado.servicos && dispositivoSelecionado.servicos.length > 0 && (
              <div>
                <Label>Serviços Detectados</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dispositivoSelecionado.servicos.map((servico) => (
                    <Badge key={servico} variant="outline">
                      {servico}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="nomeCustomizado">Nome Personalizado</Label>
              <Input
                id="nomeCustomizado"
                value={formData.nomeCustomizado}
                onChange={(e) => setFormData({ ...formData, nomeCustomizado: e.target.value })}
                placeholder="Digite um nome personalizado"
              />
            </div>

            <div>
              <Label htmlFor="condominio">Condomínio</Label>
              <select
                id="condominio"
                className="w-full p-2 border rounded"
                value={formData.condominioId}
                onChange={(e) => setFormData({ ...formData, condominioId: e.target.value })}
              >
                <option value="">Selecione um condomínio</option>
                {condominios.map((cond) => (
                  <option key={cond.id} value={cond.id}>
                    {cond.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => testarDispositivo(dispositivoSelecionado)}
                disabled={testando === dispositivoSelecionado.ip}
                variant="outline"
              >
                {testando === dispositivoSelecionado.ip ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Testar Conectividade
                  </>
                )}
              </Button>

              {editMode ? (
                <Button onClick={salvarEdicao}>
                  <Edit className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              ) : (
                <Button onClick={() => cadastrarDispositivo(dispositivoSelecionado)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar no Sistema
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispositivos Cadastrados */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Label htmlFor="filtroCondominio">Filtrar por Condomínio:</Label>
            <select
              id="filtroCondominio"
              className="p-2 border rounded"
              value={condominioSelecionado}
              onChange={(e) => setCondominioSelecionado(e.target.value)}
            >
              <option value="">Todos os Condomínios</option>
              {condominios.map((cond) => (
                <option key={cond.id} value={cond.id}>
                  {cond.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {dispositivosFiltrados.map((dispositivo) => {
              const IconeDispositivo = iconesPorTipo[dispositivo.tipo]
              const condominio = condominios.find((c) => c.id === dispositivo.condominioId)

              return (
                <div key={dispositivo.id} className={`p-4 rounded-lg border ${coresPorStatus[dispositivo.status]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconeDispositivo className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">
                          {dispositivo.nomeCustomizado || dispositivo.hostname || dispositivo.ip}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dispositivo.ip} - {dispositivo.tipo}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={dispositivo.status === "online" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {dispositivo.status}
                          </Badge>
                          {condominio && (
                            <Badge variant="outline" className="text-xs">
                              {condominio.nome}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => editarDispositivo(dispositivo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => excluirDispositivo(dispositivo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {dispositivosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum dispositivo cadastrado{condominioSelecionado ? " para este condomínio" : ""}.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
