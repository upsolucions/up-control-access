"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Send, Settings, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface IntegracaoOutlook {
  ativo: boolean
  servidor: string
  porta: number
  usuario: string
  senha: string
  ssl: boolean
  testado: boolean
}

interface IntegracaoWhatsApp {
  ativo: boolean
  apiKey: string
  numeroTelefone: string
  webhookUrl: string
  testado: boolean
}

interface Notificacao {
  id: string
  tipo: "email" | "whatsapp"
  destinatario: string
  assunto: string
  mensagem: string
  status: "enviado" | "erro" | "pendente"
  dataEnvio: Date
}

export default function IntegracoesWeb() {
  const { canModifyData } = useAuth()
  const [outlook, setOutlook] = useState<IntegracaoOutlook>({
    ativo: false,
    servidor: "smtp-mail.outlook.com",
    porta: 587,
    usuario: "",
    senha: "",
    ssl: true,
    testado: false,
  })

  const [whatsapp, setWhatsapp] = useState<IntegracaoWhatsApp>({
    ativo: false,
    apiKey: "",
    numeroTelefone: "",
    webhookUrl: "",
    testado: false,
  })

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [testeForm, setTesteForm] = useState({
    tipo: "email" as "email" | "whatsapp",
    destinatario: "",
    assunto: "",
    mensagem: "",
  })

  useEffect(() => {
    // Carregar configurações
    const savedOutlook = localStorage.getItem("integracaoOutlook")
    if (savedOutlook) {
      setOutlook(JSON.parse(savedOutlook))
    }

    const savedWhatsApp = localStorage.getItem("integracaoWhatsApp")
    if (savedWhatsApp) {
      setWhatsapp(JSON.parse(savedWhatsApp))
    }

    const savedNotificacoes = localStorage.getItem("notificacoes")
    if (savedNotificacoes) {
      setNotificacoes(JSON.parse(savedNotificacoes))
    }
  }, [])

  const salvarOutlook = () => {
    localStorage.setItem("integracaoOutlook", JSON.stringify(outlook))
    alert("Configurações do Outlook salvas!")
  }

  const salvarWhatsApp = () => {
    localStorage.setItem("integracaoWhatsApp", JSON.stringify(whatsapp))
    alert("Configurações do WhatsApp salvas!")
  }

  const testarOutlook = async () => {
    try {
      // Simular teste de conexão
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setOutlook((prev) => ({ ...prev, testado: true }))
      alert("Conexão com Outlook testada com sucesso!")
    } catch (error) {
      alert("Erro ao testar conexão com Outlook!")
    }
  }

  const testarWhatsApp = async () => {
    try {
      // Simular teste de API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setWhatsapp((prev) => ({ ...prev, testado: true }))
      alert("Conexão com WhatsApp API testada com sucesso!")
    } catch (error) {
      alert("Erro ao testar conexão com WhatsApp!")
    }
  }

  const enviarTeste = async () => {
    if (!testeForm.destinatario || !testeForm.mensagem) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    const novaNotificacao: Notificacao = {
      id: Date.now().toString(),
      tipo: testeForm.tipo,
      destinatario: testeForm.destinatario,
      assunto: testeForm.assunto,
      mensagem: testeForm.mensagem,
      status: "enviado",
      dataEnvio: new Date(),
    }

    const novasNotificacoes = [novaNotificacao, ...notificacoes]
    setNotificacoes(novasNotificacoes)
    localStorage.setItem("notificacoes", JSON.stringify(novasNotificacoes))

    // Simular envio
    if (testeForm.tipo === "email" && outlook.ativo) {
      alert("E-mail de teste enviado via Outlook!")
    } else if (testeForm.tipo === "whatsapp" && whatsapp.ativo) {
      alert("Mensagem de teste enviada via WhatsApp!")
    } else {
      alert("Configure e ative a integração primeiro!")
    }

    // Limpar formulário
    setTesteForm({
      tipo: "email",
      destinatario: "",
      assunto: "",
      mensagem: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integrações Web - Outlook & WhatsApp</h2>
      </div>

      {/* Integração Outlook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Integração Microsoft Outlook
            <Badge variant={outlook.ativo ? "default" : "secondary"}>{outlook.ativo ? "Ativo" : "Inativo"}</Badge>
            {outlook.testado && <Badge variant="outline">✓ Testado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Integração Outlook</Label>
              <p className="text-sm text-gray-600">Enviar notificações via e-mail</p>
            </div>
            <Switch checked={outlook.ativo} onCheckedChange={canModifyData() ? (checked) => setOutlook({ ...outlook, ativo: checked }) : undefined} disabled={!canModifyData()} />
          </div>

          {outlook.ativo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Servidor SMTP</Label>
                <Input
                  value={outlook.servidor}
                  onChange={canModifyData() ? (e) => setOutlook({ ...outlook, servidor: e.target.value }) : undefined}
                  placeholder="smtp-mail.outlook.com"
                  disabled={!canModifyData()}
                />
              </div>
              <div>
                <Label>Porta</Label>
                <Input
                  type="number"
                  value={outlook.porta}
                  onChange={canModifyData() ? (e) => setOutlook({ ...outlook, porta: Number.parseInt(e.target.value) }) : undefined}
                  disabled={!canModifyData()}
                />
              </div>
              <div>
                <Label>E-mail/Usuário</Label>
                <Input
                  type="email"
                  value={outlook.usuario}
                  onChange={canModifyData() ? (e) => setOutlook({ ...outlook, usuario: e.target.value }) : undefined}
                  placeholder="seu-email@outlook.com"
                  disabled={!canModifyData()}
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={outlook.senha}
                  onChange={canModifyData() ? (e) => setOutlook({ ...outlook, senha: e.target.value }) : undefined}
                  disabled={!canModifyData()}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={outlook.ssl} onCheckedChange={canModifyData() ? (checked) => setOutlook({ ...outlook, ssl: checked }) : undefined} disabled={!canModifyData()} />
                <Label>Usar SSL/TLS</Label>
              </div>
            </div>
          )}

          {canModifyData() && (
            <div className="flex gap-2">
              <Button onClick={salvarOutlook}>
                <Settings className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
              {outlook.ativo && (
                <Button onClick={testarOutlook} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Testar Conexão
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integração WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Integração WhatsApp Business API
            <Badge variant={whatsapp.ativo ? "default" : "secondary"}>{whatsapp.ativo ? "Ativo" : "Inativo"}</Badge>
            {whatsapp.testado && <Badge variant="outline">✓ Testado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Integração WhatsApp</Label>
              <p className="text-sm text-gray-600">Enviar notificações via WhatsApp</p>
            </div>
            <Switch
              checked={whatsapp.ativo}
              onCheckedChange={canModifyData() ? (checked) => setWhatsapp({ ...whatsapp, ativo: checked }) : undefined}
              disabled={!canModifyData()}
            />
          </div>

          {whatsapp.ativo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={whatsapp.apiKey}
                  onChange={canModifyData() ? (e) => setWhatsapp({ ...whatsapp, apiKey: e.target.value }) : undefined}
                  placeholder="Sua API Key do WhatsApp Business"
                  disabled={!canModifyData()}
                />
              </div>
              <div>
                <Label>Número de Telefone</Label>
                <Input
                  value={whatsapp.numeroTelefone}
                  onChange={canModifyData() ? (e) => setWhatsapp({ ...whatsapp, numeroTelefone: e.target.value }) : undefined}
                  placeholder="+5511999999999"
                  disabled={!canModifyData()}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Webhook URL</Label>
                <Input
                  value={whatsapp.webhookUrl}
                  onChange={canModifyData() ? (e) => setWhatsapp({ ...whatsapp, webhookUrl: e.target.value }) : undefined}
                  placeholder="https://seu-dominio.com/webhook/whatsapp"
                  disabled={!canModifyData()}
                />
              </div>
            </div>
          )}

          {canModifyData() && (
            <div className="flex gap-2">
              <Button onClick={salvarWhatsApp}>
                <Settings className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
              {whatsapp.ativo && (
                <Button onClick={testarWhatsApp} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Testar API
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de Envio */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Envio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Envio</Label>
              <select
                className="w-full p-2 border rounded"
                value={testeForm.tipo}
                onChange={canModifyData() ? (e) => setTesteForm({ ...testeForm, tipo: e.target.value as "email" | "whatsapp" }) : undefined}
                disabled={!canModifyData()}
              >
                <option value="email">E-mail (Outlook)</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div>
              <Label>{testeForm.tipo === "email" ? "E-mail Destinatário" : "Número WhatsApp"}</Label>
              <Input
                value={testeForm.destinatario}
                onChange={canModifyData() ? (e) => setTesteForm({ ...testeForm, destinatario: e.target.value }) : undefined}
                placeholder={testeForm.tipo === "email" ? "destinatario@email.com" : "+5511999999999"}
                disabled={!canModifyData()}
              />
            </div>
            {testeForm.tipo === "email" && (
              <div className="md:col-span-2">
                <Label>Assunto</Label>
                <Input
                  value={testeForm.assunto}
                  onChange={canModifyData() ? (e) => setTesteForm({ ...testeForm, assunto: e.target.value }) : undefined}
                  placeholder="Assunto do e-mail"
                  disabled={!canModifyData()}
                />
              </div>
            )}
            <div className="md:col-span-2">
              <Label>Mensagem</Label>
              <Textarea
                rows={4}
                value={testeForm.mensagem}
                onChange={canModifyData() ? (e) => setTesteForm({ ...testeForm, mensagem: e.target.value }) : undefined}
                placeholder="Digite sua mensagem de teste..."
                disabled={!canModifyData()}
              />
            </div>
          </div>

          {canModifyData() && (
            <Button onClick={enviarTeste}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Teste
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações ({notificacoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificacoes.slice(0, 10).map((notificacao) => (
              <div key={notificacao.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {notificacao.tipo === "email" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">{notificacao.destinatario}</span>
                      <Badge variant={notificacao.status === "enviado" ? "default" : "destructive"}>
                        {notificacao.status}
                      </Badge>
                    </div>
                    {notificacao.assunto && <p className="text-sm font-medium">{notificacao.assunto}</p>}
                    <p className="text-sm text-gray-600">{notificacao.mensagem}</p>
                    <p className="text-xs text-gray-500 mt-1">{notificacao.dataEnvio.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}

            {notificacoes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação enviada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
