"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, Plus, Mail, MessageCircle } from "lucide-react"

interface Defeito {
  id: string
  dispositivoId: string
  nomeDispositivo: string
  descricao: string
  categoria: string
  status: "pendente" | "executando" | "finalizado"
  criadoPor: string
  criadoEm: Date
  resolvidoEm?: Date
  observacoes?: string
}

interface OrdemServico {
  id: string
  defeitoId: string
  titulo: string
  descricao: string
  categoria: string
  valor?: number
  empresaId?: string
  status: "aberta" | "em_andamento" | "finalizada"
  criadaEm: Date
}

interface Props {
  usuarioLogado: any
  dispositivos: any[]
  empresas: any[]
}

export default function SistemaDefeitos({ usuarioLogado, dispositivos, empresas }: Props) {
  const [defeitos, setDefeitos] = useState<Defeito[]>([])
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([])
  const [novoDefeito, setNovoDefeito] = useState({
    dispositivoId: "",
    descricao: "",
    categoria: "",
    observacoes: "",
  })
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")

  const categorias = ["Hardware", "Software", "Conectividade", "Configuração", "Manutenção", "Outros"]

  const adicionarDefeito = () => {
    if (novoDefeito.dispositivoId && novoDefeito.descricao && novoDefeito.categoria) {
      const dispositivo = dispositivos.find((d) => d.id === novoDefeito.dispositivoId)
      const defeito: Defeito = {
        id: Date.now().toString(),
        ...novoDefeito,
        nomeDispositivo: dispositivo?.nome || "Dispositivo não encontrado",
        status: "pendente",
        criadoPor: usuarioLogado.nome,
        criadoEm: new Date(),
      }
      setDefeitos([...defeitos, defeito])
      setNovoDefeito({
        dispositivoId: "",
        descricao: "",
        categoria: "",
        observacoes: "",
      })
    }
  }

  const atualizarStatusDefeito = (defeitoId: string, novoStatus: "pendente" | "executando" | "finalizado") => {
    setDefeitos(
      defeitos.map((d) =>
        d.id === defeitoId
          ? {
              ...d,
              status: novoStatus,
              resolvidoEm: novoStatus === "finalizado" ? new Date() : undefined,
            }
          : d,
      ),
    )
  }

  const gerarOrdemServico = (defeito: Defeito) => {
    const ordem: OrdemServico = {
      id: Date.now().toString(),
      defeitoId: defeito.id,
      titulo: `OS - ${defeito.nomeDispositivo}`,
      descricao: defeito.descricao,
      categoria: defeito.categoria,
      status: "aberta",
      criadaEm: new Date(),
    }
    setOrdensServico([...ordensServico, ordem])
    alert("Ordem de serviço gerada com sucesso!")
  }

  const enviarPorEmail = (defeito: Defeito) => {
    const assunto = `Defeito - ${defeito.nomeDispositivo}`
    const corpo = `
      Descrição: ${defeito.descricao}
      Categoria: ${defeito.categoria}
      Status: ${defeito.status}
      Criado por: ${defeito.criadoPor}
      Data: ${defeito.criadoEm.toLocaleString()}
    `
    window.open(`mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`)
  }

  const enviarPorWhatsApp = (defeito: Defeito) => {
    const mensagem = `*Defeito Reportado*\n\nDispositivo: ${defeito.nomeDispositivo}\nDescrição: ${defeito.descricao}\nCategoria: ${defeito.categoria}\nStatus: ${defeito.status}`
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`)
  }

  const defeitosFiltrados = defeitos.filter((defeito) => {
    const statusMatch = filtroStatus === "todos" || defeito.status === filtroStatus
    const categoriaMatch = filtroCategoria === "todos" || defeito.categoria === filtroCategoria
    return statusMatch && categoriaMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sistema de Defeitos</h2>
      </div>

      {/* Formulário para adicionar defeito */}
      {(usuarioLogado.perfil === "operador" ||
        usuarioLogado.perfil === "admin_geral" ||
        usuarioLogado.perfil === "admin_local") && (
        <Card>
          <CardHeader>
            <CardTitle>Reportar Novo Defeito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dispositivo">Dispositivo</Label>
                <select
                  id="dispositivo"
                  className="w-full p-2 border rounded"
                  value={novoDefeito.dispositivoId}
                  onChange={(e) => setNovoDefeito({ ...novoDefeito, dispositivoId: e.target.value })}
                >
                  <option value="">Selecione um dispositivo</option>
                  {dispositivos
                    .filter(
                      (d) => usuarioLogado.perfil === "admin_geral" || d.condominioId === usuarioLogado.condominioId,
                    )
                    .map((dispositivo) => (
                      <option key={dispositivo.id} value={dispositivo.id}>
                        {dispositivo.nome} - {dispositivo.ip}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  className="w-full p-2 border rounded"
                  value={novoDefeito.categoria}
                  onChange={(e) => setNovoDefeito({ ...novoDefeito, categoria: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição do Defeito</Label>
              <Textarea
                id="descricao"
                value={novoDefeito.descricao}
                onChange={(e) => setNovoDefeito({ ...novoDefeito, descricao: e.target.value })}
                placeholder="Descreva detalhadamente o problema encontrado"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                value={novoDefeito.observacoes}
                onChange={(e) => setNovoDefeito({ ...novoDefeito, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o defeito"
                rows={2}
              />
            </div>
            <Button onClick={adicionarDefeito}>
              <Plus className="h-4 w-4 mr-2" />
              Reportar Defeito
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="executando">Executando</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="todos">Todas</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroStatus("todos")
                  setFiltroCategoria("todos")
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de defeitos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {defeitosFiltrados.map((defeito) => (
          <Card key={defeito.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{defeito.nomeDispositivo}</CardTitle>
                  <CardDescription>{defeito.categoria}</CardDescription>
                </div>
                <Badge
                  variant={
                    defeito.status === "pendente"
                      ? "destructive"
                      : defeito.status === "executando"
                        ? "secondary"
                        : "default"
                  }
                >
                  {defeito.status === "pendente" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {defeito.status === "executando" && <Clock className="h-3 w-3 mr-1" />}
                  {defeito.status === "finalizado" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {defeito.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Descrição:</h4>
                <p className="text-sm text-gray-600">{defeito.descricao}</p>
              </div>

              {defeito.observacoes && (
                <div>
                  <h4 className="font-semibold text-sm">Observações:</h4>
                  <p className="text-sm text-gray-600">{defeito.observacoes}</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>Reportado por: {defeito.criadoPor}</p>
                <p>Data: {defeito.criadoEm.toLocaleString()}</p>
                {defeito.resolvidoEm && <p>Resolvido em: {defeito.resolvidoEm.toLocaleString()}</p>}
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                {(usuarioLogado.perfil === "operador" ||
                  usuarioLogado.perfil === "admin_geral" ||
                  usuarioLogado.perfil === "admin_local") && (
                  <>
                    {defeito.status === "pendente" && (
                      <Button size="sm" onClick={() => atualizarStatusDefeito(defeito.id, "executando")}>
                        Iniciar Execução
                      </Button>
                    )}
                    {defeito.status === "executando" && (
                      <Button size="sm" onClick={() => atualizarStatusDefeito(defeito.id, "finalizado")}>
                        Finalizar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => gerarOrdemServico(defeito)}>
                      Gerar O.S.
                    </Button>
                  </>
                )}

                <Button size="sm" variant="outline" onClick={() => enviarPorEmail(defeito)}>
                  <Mail className="h-3 w-3 mr-1" />
                  E-mail
                </Button>

                <Button size="sm" variant="outline" onClick={() => enviarPorWhatsApp(defeito)}>
                  <MessageCircle className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ordens de Serviço Geradas */}
      {ordensServico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço Geradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordensServico.map((ordem) => (
                <div key={ordem.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-semibold">{ordem.titulo}</h3>
                    <p className="text-sm text-gray-600">{ordem.descricao}</p>
                    <p className="text-xs text-gray-500">
                      Categoria: {ordem.categoria} | Criada em: {ordem.criadaEm.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        ordem.status === "aberta"
                          ? "destructive"
                          : ordem.status === "em_andamento"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {ordem.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    {ordem.valor && <Badge variant="outline">R$ {ordem.valor.toFixed(2)}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
