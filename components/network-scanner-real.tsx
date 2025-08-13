"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PDFGenerator } from "@/lib/pdf-generator"
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
  Trash2,
  Download,
  AlertTriangle,
} from "lucide-react"

interface DispositivoRede {
  id: string
  ip: string
  mac?: string
  hostname?: string
  tipo: string
  status: "online" | "offline" | "erro"
  ultimaPing: Date
  fabricante?: string
  modelo?: string
  servicos?: string[]
  nomeCustomizado?: string
  condominioId?: string
  condominio?: string
}

interface ConfiguracaoRede {
  ipLocal: string
  mascaraRede: string
  gateway: string
  dnsServers: string[]
  alcanceDHCP: {
    inicio: string
    fim: string
  }
  deteccaoAutomatica: boolean
  redeAtiva: boolean
}

export default function NetworkScannerReal() {
  const [dispositivos, setDispositivos] = useState<DispositivoRede[]>([])
  const [dispositivosCadastrados, setDispositivosCadastrados] = useState<DispositivoRede[]>([])
  const [escaneando, setEscaneando] = useState(false)
  const [configRede, setConfigRede] = useState<ConfiguracaoRede | null>(null)
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState<DispositivoRede | null>(null)
  const [condominios, setCondominios] = useState<any[]>([])
  const [formData, setFormData] = useState({
    nomeCustomizado: "",
    condominioId: "",
  })

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

  useEffect(() => {
    // Carregar configuração de rede
    const savedConfig = localStorage.getItem("configuracaoRede")
    if (savedConfig) {
      setConfigRede(JSON.parse(savedConfig))
    }

    // Carregar condominios
    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }

    // Carregar dispositivos cadastrados
    const savedDispositivos = localStorage.getItem("dispositivosCadastrados")
    if (savedDispositivos) {
      setDispositivosCadastrados(JSON.parse(savedDispositivos))
    }
  }, [])

  const escanearRede = async () => {
    if (!configRede || !configRede.redeAtiva) {
      alert("Configure a rede primeiro na aba 'Configuração de Rede'")
      return
    }

    setEscaneando(true)
    const dispositivosEncontrados: DispositivoRede[] = []

    try {
      // Calcular range de IPs baseado na configuração
      const baseIP = calcularRedeBase(configRede.ipLocal, configRede.mascaraRede)
      const rangeInicio = Number.parseInt(configRede.alcanceDHCP.inicio.split(".").pop() || "1")
      const rangeFim = Number.parseInt(configRede.alcanceDHCP.fim.split(".").pop() || "254")

      const promises = []

      // Escanear apenas o range configurado
      for (let i = rangeInicio; i <= rangeFim; i++) {
        const ip = `${baseIP}.${i}`
        promises.push(testarIP(ip))
      }

      // Sempre incluir o gateway
      promises.push(testarIP(configRede.gateway))

      const resultados = await Promise.allSettled(promises)

      resultados.forEach((resultado) => {
        if (resultado.status === "fulfilled" && resultado.value) {
          dispositivosEncontrados.push(resultado.value)
        }
      })

      setDispositivos(dispositivosEncontrados)
    } catch (error) {
      console.error("Erro no escaneamento:", error)
      alert("Erro durante o escaneamento da rede")
    } finally {
      setEscaneando(false)
    }
  }

  const calcularRedeBase = (ip: string, mascara: string): string => {
    const ipParts = ip.split(".").map(Number)
    const maskParts = mascara.split(".").map(Number)

    const networkParts = ipParts.map((ipPart, i) => ipPart & maskParts[i])
    return `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}`
  }

  const testarIP = async (ip: string): Promise<DispositivoRede | null> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null)
      }, 2000)

      // Simular ping usando diferentes métodos
      const img = new Image()

      img.onload = () => {
        clearTimeout(timeout)
        resolve(criarDispositivo(ip, "online"))
      }

      img.onerror = () => {
        // Tentar fetch como fallback
        fetch(`http://${ip}:80`, {
          mode: "no-cors",
          signal: AbortSignal.timeout(1000),
        })
          .then(() => {
            clearTimeout(timeout)
            resolve(criarDispositivo(ip, "online"))
          })
          .catch(() => {
            clearTimeout(timeout)
            resolve(null)
          })
      }

      // Tentar carregar favicon
      img.src = `http://${ip}/favicon.ico?${Date.now()}`
    })
  }

  const criarDispositivo = (ip: string, status: "online" | "offline"): DispositivoRede => {
    const tipo = identificarTipoDispositivo(ip)

    return {
      id: Date.now().toString() + Math.random(),
      ip,
      hostname: `device-${ip.split(".").pop()}`,
      tipo,
      status,
      ultimaPing: new Date(),
      fabricante: "Detectado",
      modelo: "Scanner de Rede",
      servicos: ["HTTP"],
    }
  }

  const identificarTipoDispositivo = (ip: string): string => {
    if (!configRede) return "outros"

    // Gateway é sempre roteador
    if (ip === configRede.gateway) return "roteador"

    const ultimoOcteto = Number.parseInt(ip.split(".").pop() || "0")
    const dhcpInicio = Number.parseInt(configRede.alcanceDHCP.inicio.split(".").pop() || "100")
    const dhcpFim = Number.parseInt(configRede.alcanceDHCP.fim.split(".").pop() || "200")

    // Fora do range DHCP - provavelmente servidores/equipamentos fixos
    if (ultimoOcteto < dhcpInicio) {
      if (ultimoOcteto <= 10) return "switch"
      if (ultimoOcteto <= 50) return "camera"
      return "servidor"
    }

    // Dentro do range DHCP - dispositivos dinâmicos
    if (ultimoOcteto >= dhcpInicio && ultimoOcteto <= dhcpFim) {
      const range = dhcpFim - dhcpInicio
      const posicao = ultimoOcteto - dhcpInicio
      const percentual = posicao / range

      if (percentual < 0.3) return "computador"
      if (percentual < 0.6) return "notebook"
      if (percentual < 0.8) return "smartphone"
      return "impressora"
    }

    return "outros"
  }

  const cadastrarDispositivo = (dispositivo: DispositivoRede) => {
    if (!formData.condominioId) {
      alert("Selecione um condomínio para cadastrar o dispositivo")
      return
    }

    const condominio = condominios.find((c) => c.id === formData.condominioId)
    const novoDispositivo = {
      ...dispositivo,
      nomeCustomizado: formData.nomeCustomizado || dispositivo.hostname,
      condominioId: formData.condominioId,
      condominio: condominio?.nome || "Não definido",
    }

    const novosDispositivos = [...dispositivosCadastrados, novoDispositivo]
    setDispositivosCadastrados(novosDispositivos)
    localStorage.setItem("dispositivosCadastrados", JSON.stringify(novosDispositivos))

    setDispositivoSelecionado(null)
    setFormData({ nomeCustomizado: "", condominioId: "" })
    alert("Dispositivo cadastrado com sucesso!")
  }

  const excluirDispositivo = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este dispositivo?")) {
      const dispositivosAtualizados = dispositivosCadastrados.filter((d) => d.id !== id)
      setDispositivosCadastrados(dispositivosAtualizados)
      localStorage.setItem("dispositivosCadastrados", JSON.stringify(dispositivosAtualizados))
    }
  }

  const gerarRelatorioPDF = async () => {
    const sucesso = await PDFGenerator.gerarRelatorioPDF(
      dispositivosFiltrados,
      "Relatório de Dispositivos de Rede",
      "dispositivos",
      usuarioLogado?.nome || "Sistema"
    )

    if (sucesso) {
      alert("Relatório PDF gerado com sucesso!")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scanner de Rede Configurada</h2>
        <div className="flex gap-2">
          <Button onClick={gerarRelatorioPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button onClick={escanearRede} disabled={escaneando || !configRede?.redeAtiva}>
            <RefreshCw className={`h-4 w-4 mr-2 ${escaneando ? "animate-spin" : ""}`} />
            {escaneando ? "Escaneando..." : "Escanear Rede"}
          </Button>
        </div>
      </div>

      {/* Status da Configuração */}
      {!configRede?.redeAtiva && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Rede não configurada</p>
                <p className="text-sm">Configure a rede na aba "Configuração de Rede" antes de escanear.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações da Rede Configurada */}
      {configRede?.redeAtiva && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">🌐 Rede Configurada pelo Admin Master</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>IP Local</Label>
                <p className="font-mono text-sm bg-green-50 p-2 rounded">{configRede.ipLocal}</p>
              </div>
              <div>
                <Label>Máscara</Label>
                <p className="font-mono text-sm bg-green-50 p-2 rounded">{configRede.mascaraRede}</p>
              </div>
              <div>
                <Label>Gateway</Label>
                <p className="font-mono text-sm bg-green-50 p-2 rounded">{configRede.gateway}</p>
              </div>
              <div>
                <Label>DNS</Label>
                <p className="font-mono text-sm bg-green-50 p-2 rounded">{configRede.dnsServers.join(", ")}</p>
              </div>
              <div>
                <Label>Range DHCP</Label>
                <p className="font-mono text-sm bg-green-50 p-2 rounded">
                  {configRede.alcanceDHCP.inicio} - {configRede.alcanceDHCP.fim}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispositivos Encontrados */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Encontrados na Rede Configurada ({dispositivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {dispositivos.map((dispositivo) => {
              const IconeDispositivo = iconesPorTipo[dispositivo.tipo] || Monitor

              return (
                <div
                  key={dispositivo.id}
                  className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md bg-green-50 border-green-300"
                  onClick={() => setDispositivoSelecionado(dispositivo)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative">
                      <IconeDispositivo className="h-8 w-8" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{dispositivo.hostname}</p>
                      <p className="text-xs text-gray-600">{dispositivo.ip}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {dispositivo.tipo}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {dispositivos.length === 0 && !escaneando && configRede?.redeAtiva && (
            <div className="text-center py-8 text-gray-500">
              <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo encontrado na rede configurada.</p>
              <p className="text-sm">Clique em "Escanear Rede" para buscar dispositivos.</p>
            </div>
          )}

          {escaneando && (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
              <p>Escaneando rede configurada...</p>
              <p className="text-sm text-gray-600">
                Range: {configRede?.alcanceDHCP.inicio} - {configRede?.alcanceDHCP.fim}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Cadastro */}
      {dispositivoSelecionado && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Dispositivo: {dispositivoSelecionado.ip}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome Personalizado</Label>
                <Input
                  value={formData.nomeCustomizado}
                  onChange={(e) => setFormData({ ...formData, nomeCustomizado: e.target.value })}
                  placeholder="Digite um nome personalizado"
                />
              </div>
              <div>
                <Label>Condomínio</Label>
                <select
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
            </div>

            <div className="flex gap-2">
              <Button onClick={() => cadastrarDispositivo(dispositivoSelecionado)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar
              </Button>
              <Button variant="outline" onClick={() => setDispositivoSelecionado(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispositivos Cadastrados por Condomínio */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Cadastrados ({dispositivosCadastrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {condominios.map((condominio) => {
            const dispositivosCondominio = dispositivosCadastrados.filter((d) => d.condominioId === condominio.id)

            if (dispositivosCondominio.length === 0) return null

            return (
              <div key={condominio.id} className="mb-6">
                <h3 className="font-bold text-lg mb-3 text-blue-600">
                  🏢 {condominio.nome} ({dispositivosCondominio.length} dispositivos)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dispositivosCondominio.map((dispositivo) => {
                    const IconeDispositivo = iconesPorTipo[dispositivo.tipo] || Monitor

                    return (
                      <div key={dispositivo.id} className="p-3 rounded border bg-blue-50 border-blue-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <IconeDispositivo className="h-6 w-6" />
                            <div>
                              <p className="font-medium text-sm">
                                {dispositivo.nomeCustomizado || dispositivo.hostname}
                              </p>
                              <p className="text-xs text-gray-600">{dispositivo.ip}</p>
                              <Badge variant="outline" className="text-xs">
                                {dispositivo.tipo}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => excluirDispositivo(dispositivo.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {dispositivosCadastrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo cadastrado ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
