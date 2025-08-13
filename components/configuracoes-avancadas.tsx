"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Download, Upload, RefreshCw } from "lucide-react"

interface ConfiguracaoSistema {
  nomeEmpresa: string
  emailAdmin: string
  servidorEmail: string
  portaEmail: number
  senhaEmail: string
  backupAutomatico: boolean
  intervaloPing: number
  timeoutConexao: number
  logDetalhado: boolean
  notificacoesPush: boolean
  integracaoWhatsApp: boolean
  tokenWhatsApp: string
  urlWebhook: string
}

export default function ConfiguracoesAvancadas() {
  const [config, setConfig] = useState<ConfiguracaoSistema>({
    nomeEmpresa: "Up Control Access",
    emailAdmin: "admin@sistema.com",
    servidorEmail: "smtp.gmail.com",
    portaEmail: 587,
    senhaEmail: "",
    backupAutomatico: true,
    intervaloPing: 30,
    timeoutConexao: 5000,
    logDetalhado: false,
    notificacoesPush: true,
    integracaoWhatsApp: false,
    tokenWhatsApp: "",
    urlWebhook: "",
  })

  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    // Carregar configurações salvas
    const savedConfig = localStorage.getItem("configuracoesSistema")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const salvarConfiguracoes = async () => {
    setSalvando(true)

    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    localStorage.setItem("configuracoesSistema", JSON.stringify(config))
    setSalvando(false)
    alert("Configurações salvas com sucesso!")
  }

  const exportarConfiguracoes = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "configuracoes-sistema.json"
    link.click()
  }

  const importarConfiguracoes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string)
          setConfig(importedConfig)
          alert("Configurações importadas com sucesso!")
        } catch (error) {
          alert("Erro ao importar configurações!")
        }
      }
      reader.readAsText(file)
    }
  }

  const testarConexaoEmail = async () => {
    alert("Testando conexão com servidor de email...")
    // Simular teste
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert("Conexão testada com sucesso!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações Avançadas do Sistema</h2>
        <div className="flex gap-2">
          <Button onClick={exportarConfiguracoes} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </span>
            </Button>
            <input type="file" accept=".json" onChange={importarConfiguracoes} className="hidden" />
          </label>
        </div>
      </div>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={config.nomeEmpresa}
                onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emailAdmin">Email do Administrador</Label>
              <Input
                id="emailAdmin"
                type="email"
                value={config.emailAdmin}
                onChange={(e) => setConfig({ ...config, emailAdmin: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Email */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servidorEmail">Servidor SMTP</Label>
              <Input
                id="servidorEmail"
                value={config.servidorEmail}
                onChange={(e) => setConfig({ ...config, servidorEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="portaEmail">Porta</Label>
              <Input
                id="portaEmail"
                type="number"
                value={config.portaEmail}
                onChange={(e) => setConfig({ ...config, portaEmail: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="senhaEmail">Senha do Email</Label>
              <Input
                id="senhaEmail"
                type="password"
                value={config.senhaEmail}
                onChange={(e) => setConfig({ ...config, senhaEmail: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={testarConexaoEmail} variant="outline">
            Testar Conexão
          </Button>
        </CardContent>
      </Card>

      {/* Configurações de Rede */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Rede</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervaloPing">Intervalo de Ping (segundos)</Label>
              <Input
                id="intervaloPing"
                type="number"
                value={config.intervaloPing}
                onChange={(e) => setConfig({ ...config, intervaloPing: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="timeoutConexao">Timeout de Conexão (ms)</Label>
              <Input
                id="timeoutConexao"
                type="number"
                value={config.timeoutConexao}
                onChange={(e) => setConfig({ ...config, timeoutConexao: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
              </div>
              <Switch
                checked={config.backupAutomatico}
                onCheckedChange={(checked) => setConfig({ ...config, backupAutomatico: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Log Detalhado</Label>
                <p className="text-sm text-gray-600">Registrar logs detalhados do sistema</p>
              </div>
              <Switch
                checked={config.logDetalhado}
                onCheckedChange={(checked) => setConfig({ ...config, logDetalhado: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push</Label>
                <p className="text-sm text-gray-600">Enviar notificações push para dispositivos</p>
              </div>
              <Switch
                checked={config.notificacoesPush}
                onCheckedChange={(checked) => setConfig({ ...config, notificacoesPush: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integração WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle>Integração WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Habilitar WhatsApp</Label>
              <p className="text-sm text-gray-600">Integração com API do WhatsApp</p>
            </div>
            <Switch
              checked={config.integracaoWhatsApp}
              onCheckedChange={(checked) => setConfig({ ...config, integracaoWhatsApp: checked })}
            />
          </div>
          {config.integracaoWhatsApp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tokenWhatsApp">Token da API</Label>
                <Input
                  id="tokenWhatsApp"
                  type="password"
                  value={config.tokenWhatsApp}
                  onChange={(e) => setConfig({ ...config, tokenWhatsApp: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="urlWebhook">URL do Webhook</Label>
                <Input
                  id="urlWebhook"
                  value={config.urlWebhook}
                  onChange={(e) => setConfig({ ...config, urlWebhook: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={salvarConfiguracoes} disabled={salvando}>
          {salvando ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
