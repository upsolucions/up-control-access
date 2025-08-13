"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, Network, Globe, Wifi } from "lucide-react"

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

interface DynDNSCondominio {
  condominioId: string
  nomeCondominio: string
  subdominio: string
  urlCompleta: string
  status: "ativo" | "inativo" | "pendente"
  criadoEm: Date
}

export default function ConfiguracaoRede() {
  const [config, setConfig] = useState<ConfiguracaoRede>({
    ipLocal: "",
    mascaraRede: "255.255.255.0",
    gateway: "",
    dnsServers: ["8.8.8.8", "8.8.4.4"],
    alcanceDHCP: {
      inicio: "",
      fim: "",
    },
    deteccaoAutomatica: true,
    redeAtiva: false,
  })

  const [dynDNSList, setDynDNSList] = useState<DynDNSCondominio[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  const [salvando, setSalvando] = useState(false)
  const [testando, setTestando] = useState(false)

  useEffect(() => {
    // Carregar configurações salvas
    const savedConfig = localStorage.getItem("configuracaoRede")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    // Carregar DynDNS
    const savedDynDNS = localStorage.getItem("dynDNSCondominios")
    if (savedDynDNS) {
      setDynDNSList(JSON.parse(savedDynDNS))
    }

    // Carregar condomínios
    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [])

  const salvarConfiguracoes = async () => {
    setSalvando(true)

    // Validar configurações
    if (!validarIP(config.ipLocal) || !validarIP(config.gateway)) {
      alert("IPs inválidos! Verifique os endereços inseridos.")
      setSalvando(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    localStorage.setItem("configuracaoRede", JSON.stringify(config))
    setSalvando(false)
    alert("Configurações de rede salvas com sucesso!")
  }

  const testarConexao = async () => {
    setTestando(true)

    try {
      // Simular teste de conectividade
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Atualizar status da rede
      setConfig((prev) => ({ ...prev, redeAtiva: true }))
      alert("Teste de conectividade realizado com sucesso!")
    } catch (error) {
      setConfig((prev) => ({ ...prev, redeAtiva: false }))
      alert("Erro no teste de conectividade!")
    } finally {
      setTestando(false)
    }
  }

  const gerarDynDNS = async (condominioId: string) => {
    const condominio = condominios.find((c) => c.id === condominioId)
    if (!condominio) return

    // Gerar subdomínio baseado no nome do condomínio
    const subdominio = condominio.nome
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20)

    const novoDynDNS: DynDNSCondominio = {
      condominioId,
      nomeCondominio: condominio.nome,
      subdominio: `${subdominio}-${Date.now()}`,
      urlCompleta: `https://${subdominio}-${Date.now()}.controleacesso.dyndns.org`,
      status: "ativo",
      criadoEm: new Date(),
    }

    const novaLista = [...dynDNSList, novoDynDNS]
    setDynDNSList(novaLista)
    localStorage.setItem("dynDNSCondominios", JSON.stringify(novaLista))

    alert(`DynDNS gerado com sucesso!\nURL: ${novoDynDNS.urlCompleta}`)
  }

  const validarIP = (ip: string): boolean => {
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!regex.test(ip)) return false

    const parts = ip.split(".")
    return parts.every((part) => {
      const num = Number.parseInt(part)
      return num >= 0 && num <= 255
    })
  }

  const calcularRede = () => {
    if (config.ipLocal && config.mascaraRede) {
      const ipParts = config.ipLocal.split(".").map(Number)
      const maskParts = config.mascaraRede.split(".").map(Number)

      const networkParts = ipParts.map((ip, i) => ip & maskParts[i])
      const rede = networkParts.join(".")

      // Auto-configurar gateway e DHCP
      setConfig((prev) => ({
        ...prev,
        gateway: `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.1`,
        alcanceDHCP: {
          inicio: `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.100`,
          fim: `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.200`,
        },
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuração de Rede - Admin Master</h2>
        <div className="flex gap-2">
          <Button onClick={testarConexao} disabled={testando} variant="outline">
            <Network className={`h-4 w-4 mr-2 ${testando ? "animate-spin" : ""}`} />
            {testando ? "Testando..." : "Testar Rede"}
          </Button>
          <Button onClick={salvarConfiguracoes} disabled={salvando}>
            {salvando ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status da Rede */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Status da Rede
            <Badge variant={config.redeAtiva ? "default" : "destructive"}>
              {config.redeAtiva ? "Ativa" : "Inativa"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Detecção Automática</Label>
              <p className="text-sm text-gray-600">Permitir detecção automática de rede</p>
            </div>
            <Switch
              checked={config.deteccaoAutomatica}
              onCheckedChange={(checked) => setConfig({ ...config, deteccaoAutomatica: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações Manuais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Rede Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ipLocal">IP Local</Label>
              <Input
                id="ipLocal"
                value={config.ipLocal}
                onChange={(e) => setConfig({ ...config, ipLocal: e.target.value })}
                onBlur={calcularRede}
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="mascaraRede">Máscara de Rede</Label>
              <select
                id="mascaraRede"
                className="w-full p-2 border rounded"
                value={config.mascaraRede}
                onChange={(e) => setConfig({ ...config, mascaraRede: e.target.value })}
              >
                <option value="255.255.255.0">/24 - 255.255.255.0</option>
                <option value="255.255.0.0">/16 - 255.255.0.0</option>
                <option value="255.0.0.0">/8 - 255.0.0.0</option>
              </select>
            </div>
            <div>
              <Label htmlFor="gateway">Gateway/Portal</Label>
              <Input
                id="gateway"
                value={config.gateway}
                onChange={(e) => setConfig({ ...config, gateway: e.target.value })}
                placeholder="192.168.1.1"
              />
            </div>
            <div>
              <Label htmlFor="dns1">DNS Primário</Label>
              <Input
                id="dns1"
                value={config.dnsServers[0] || ""}
                onChange={(e) => {
                  const newDNS = [...config.dnsServers]
                  newDNS[0] = e.target.value
                  setConfig({ ...config, dnsServers: newDNS })
                }}
                placeholder="8.8.8.8"
              />
            </div>
            <div>
              <Label htmlFor="dns2">DNS Secundário</Label>
              <Input
                id="dns2"
                value={config.dnsServers[1] || ""}
                onChange={(e) => {
                  const newDNS = [...config.dnsServers]
                  newDNS[1] = e.target.value
                  setConfig({ ...config, dnsServers: newDNS })
                }}
                placeholder="8.8.4.4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dhcpInicio">Alcance DHCP - Início</Label>
              <Input
                id="dhcpInicio"
                value={config.alcanceDHCP.inicio}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alcanceDHCP: { ...config.alcanceDHCP, inicio: e.target.value },
                  })
                }
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="dhcpFim">Alcance DHCP - Fim</Label>
              <Input
                id="dhcpFim"
                value={config.alcanceDHCP.fim}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alcanceDHCP: { ...config.alcanceDHCP, fim: e.target.value },
                  })
                }
                placeholder="192.168.1.200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DynDNS para Condomínios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            DynDNS dos Condomínios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Gerar DynDNS */}
            <div className="flex gap-2 flex-wrap">
              {condominios.map((condominio) => {
                const jaTemDynDNS = dynDNSList.some((dns) => dns.condominioId === condominio.id)

                return (
                  <Button
                    key={condominio.id}
                    size="sm"
                    variant={jaTemDynDNS ? "outline" : "default"}
                    onClick={() => !jaTemDynDNS && gerarDynDNS(condominio.id)}
                    disabled={jaTemDynDNS}
                  >
                    {jaTemDynDNS ? "✓" : "+"} {condominio.nome}
                  </Button>
                )
              })}
            </div>

            {/* Lista de DynDNS */}
            <div className="space-y-2">
              {dynDNSList.map((dns) => (
                <div key={dns.condominioId} className="p-3 border rounded-lg bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{dns.nomeCondominio}</p>
                      <p className="text-sm text-blue-600 font-mono">{dns.urlCompleta}</p>
                      <p className="text-xs text-gray-500">Criado em: {dns.criadoEm.toLocaleDateString()}</p>
                    </div>
                    <Badge variant={dns.status === "ativo" ? "default" : "secondary"}>{dns.status}</Badge>
                  </div>
                </div>
              ))}
            </div>

            {dynDNSList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum DynDNS configurado ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
