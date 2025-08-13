"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Edit, Trash2, Clock, CheckCircle, AlertTriangle, Pause, Play, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface OrdemServico {
  id: string
  titulo: string
  descricao: string
  categoria: string
  prioridade: "baixa" | "media" | "alta" | "critica"
  status:
    | "pendente"
    | "em-execucao"
    | "concluido"
    | "orcamento"
    | "pausada"
    | "reaberta"
    | "implementacao"
    | "aprovado"
    | "reprovado"
  empresaId: string
  condominioId: string
  criadoPor: string
  criadaEm: Date
  prazoEstimado?: Date
  valorOrcamento?: number
  observacoes?: string
  anexos?: string[]
}

interface Empresa {
  id: string
  nome: string
  email: string
  telefone: string
}

interface Condominio {
  id: string
  nome: string
}

interface OrdensServicoProps {
  condominioId?: string
}

export default function OrdensServico({ condominioId }: OrdensServicoProps) {
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    prioridade: "media" as const,
    empresaId: "",
    condominioId: condominioId || "",
    prazoEstimado: "",
    valorOrcamento: "",
    observacoes: "",
  })

  const categorias = [
    "Elétrica",
    "Hidráulica",
    "Pintura",
    "Limpeza",
    "Jardinagem",
    "Segurança",
    "Tecnologia",
    "Estrutural",
    "Outros",
  ]

  const statusOrdem = [
    { value: "pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    { value: "em-execucao", label: "Em Execução", color: "bg-blue-100 text-blue-800", icon: Play },
    { value: "pausada", label: "Pausada", color: "bg-gray-100 text-gray-800", icon: Pause },
    { value: "orcamento", label: "Aguardando Orçamento", color: "bg-purple-100 text-purple-800", icon: DollarSign },
    { value: "aprovado", label: "Orçamento Aprovado", color: "bg-green-100 text-green-800", icon: CheckCircle },
    { value: "reprovado", label: "Orçamento Reprovado", color: "bg-red-100 text-red-800", icon: AlertTriangle },
    { value: "implementacao", label: "Em Implementação", color: "bg-indigo-100 text-indigo-800", icon: Play },
    { value: "reaberta", label: "Reaberta", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    { value: "concluido", label: "Concluído", color: "bg-green-100 text-green-800", icon: CheckCircle },
  ]

  const prioridades = [
    { value: "baixa", label: "Baixa", color: "bg-gray-100 text-gray-800" },
    { value: "media", label: "Média", color: "bg-yellow-100 text-yellow-800" },
    { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
    { value: "critica", label: "Crítica", color: "bg-red-100 text-red-800" },
  ]

  useEffect(() => {
    // Carregar dados do localStorage
    const savedOrdens = localStorage.getItem("ordensServico")
    if (savedOrdens) {
      let allOrdens = JSON.parse(savedOrdens)
      // Converter strings de data para objetos Date
      allOrdens = allOrdens.map((ordem: any) => ({
        ...ordem,
        criadaEm: new Date(ordem.criadaEm),
        prazoEstimado: ordem.prazoEstimado ? new Date(ordem.prazoEstimado) : undefined
      }))
      // Se condominioId for fornecido, filtrar apenas ordens desse condomínio
      if (condominioId) {
        allOrdens = allOrdens.filter((o: OrdemServico) => o.condominioId === condominioId)
      }
      setOrdens(allOrdens)
    }

    const savedEmpresas = localStorage.getItem("empresasFornecedoras")
    if (savedEmpresas) {
      let allEmpresas = JSON.parse(savedEmpresas)
      // Se condominioId for fornecido, filtrar apenas empresas desse condomínio
      if (condominioId) {
        allEmpresas = allEmpresas.filter((e: any) => e.condominioId === condominioId)
      }
      setEmpresas(allEmpresas)
    }

    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [condominioId])

  const saveOrdens = (newOrdens: OrdemServico[]) => {
    setOrdens(newOrdens)
    localStorage.setItem("ordensServico", JSON.stringify(newOrdens))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingOrdem) {
      // Atualizar ordem existente
      const updatedOrdens = ordens.map((ordem) =>
        ordem.id === editingOrdem.id
          ? {
              ...ordem,
              ...formData,
              prazoEstimado: formData.prazoEstimado ? new Date(formData.prazoEstimado) : undefined,
              valorOrcamento: formData.valorOrcamento ? Number.parseFloat(formData.valorOrcamento) : undefined,
            }
          : ordem,
      )
      saveOrdens(updatedOrdens)
    } else {
      // Adicionar nova ordem
      const novaOrdem: OrdemServico = {
        id: Date.now().toString(),
        ...formData,
        condominioId: condominioId || formData.condominioId,
        status: "pendente",
        criadoPor: "Usuário Atual", // Aqui seria o usuário logado
        criadaEm: new Date(),
        prazoEstimado: formData.prazoEstimado ? new Date(formData.prazoEstimado) : undefined,
        valorOrcamento: formData.valorOrcamento ? Number.parseFloat(formData.valorOrcamento) : undefined,
      }
      // Se condominioId for fornecido, salvar no contexto global mas filtrar localmente
      if (condominioId) {
        let allOrdens = JSON.parse(localStorage.getItem("ordensServico") || "[]")
        // Converter strings de data para objetos Date ao carregar
        allOrdens = allOrdens.map((ordem: any) => ({
          ...ordem,
          criadaEm: new Date(ordem.criadaEm),
          prazoEstimado: ordem.prazoEstimado ? new Date(ordem.prazoEstimado) : undefined
        }))
        const updatedAllOrdens = [...allOrdens, novaOrdem]
        localStorage.setItem("ordensServico", JSON.stringify(updatedAllOrdens))
        setOrdens([...ordens, novaOrdem])
      } else {
        saveOrdens([...ordens, novaOrdem])
      }
    }

    // Resetar formulário
    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingOrdem(null)
    setFormData({
      titulo: "",
      descricao: "",
      categoria: "",
      prioridade: "media",
      empresaId: "",
      condominioId: condominioId || "",
      prazoEstimado: "",
      valorOrcamento: "",
      observacoes: "",
    })
  }

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdem(ordem)
    setFormData({
      titulo: ordem.titulo,
      descricao: ordem.descricao,
      categoria: ordem.categoria,
      prioridade: ordem.prioridade,
      empresaId: ordem.empresaId,
      condominioId: ordem.condominioId,
      prazoEstimado: ordem.prazoEstimado ? ordem.prazoEstimado.toISOString().split("T")[0] : "",
      valorOrcamento: ordem.valorOrcamento?.toString() || "",
      observacoes: ordem.observacoes || "",
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      const filteredOrdens = ordens.filter((ordem) => ordem.id !== id)
      saveOrdens(filteredOrdens)
    }
  }

  const updateStatus = (id: string, novoStatus: OrdemServico["status"]) => {
    const updatedOrdens = ordens.map((ordem) => (ordem.id === id ? { ...ordem, status: novoStatus } : ordem))
    saveOrdens(updatedOrdens)
  }

  const getStatusInfo = (status: string) => {
    return statusOrdem.find((s) => s.value === status) || statusOrdem[0]
  }

  const getPrioridadeInfo = (prioridade: string) => {
    return prioridades.find((p) => p.value === prioridade) || prioridades[1]
  }

  // Filtrar ordens
  const ordensFiltradas = ordens.filter((ordem) => {
    const statusMatch = filtroStatus === "todos" || ordem.status === filtroStatus
    const categoriaMatch = filtroCategoria === "todos" || ordem.categoria === filtroCategoria
    return statusMatch && categoriaMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ordens de Serviço</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                {statusOrdem.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="todos">Todas as Categorias</option>
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

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {ordens.filter((o) => o.status === "pendente").length}
              </p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {ordens.filter((o) => o.status === "em-execucao").length}
              </p>
              <p className="text-sm text-gray-600">Em Execução</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {ordens.filter((o) => o.status === "concluido").length}
              </p>
              <p className="text-sm text-gray-600">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{ordens.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingOrdem ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    className="w-full p-2 border rounded"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <select
                    id="prioridade"
                    className="w-full p-2 border rounded"
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                  >
                    {prioridades.map((prioridade) => (
                      <option key={prioridade.value} value={prioridade.value}>
                        {prioridade.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa Responsável</Label>
                  <select
                    id="empresa"
                    className="w-full p-2 border rounded"
                    value={formData.empresaId}
                    onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condominio">Condomínio</Label>
                  <select
                    id="condominio"
                    className="w-full p-2 border rounded"
                    value={formData.condominioId}
                    onChange={(e) => setFormData({ ...formData, condominioId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um condomínio</option>
                    {condominios.map((condominio) => (
                      <option key={condominio.id} value={condominio.id}>
                        {condominio.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prazoEstimado">Prazo Estimado</Label>
                  <Input
                    id="prazoEstimado"
                    type="date"
                    value={formData.prazoEstimado}
                    onChange={(e) => setFormData({ ...formData, prazoEstimado: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorOrcamento">Valor do Orçamento (R$)</Label>
                  <Input
                    id="valorOrcamento"
                    type="number"
                    step="0.01"
                    value={formData.valorOrcamento}
                    onChange={(e) => setFormData({ ...formData, valorOrcamento: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editingOrdem ? "Atualizar" : "Criar Ordem"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ordens */}
      <div className="space-y-4">
        {ordensFiltradas.map((ordem) => {
          const statusInfo = getStatusInfo(ordem.status)
          const prioridadeInfo = getPrioridadeInfo(ordem.prioridade)
          const empresa = empresas.find((e) => e.id === ordem.empresaId)
          const condominio = condominios.find((c) => c.id === ordem.condominioId)
          const StatusIcon = statusInfo.icon

          return (
            <Card key={ordem.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className="h-5 w-5" />
                      <h3 className="font-bold text-lg">{ordem.titulo}</h3>
                      <Badge className={prioridadeInfo.color}>{prioridadeInfo.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Categoria:</span> {ordem.categoria}
                        </p>
                        <p>
                          <span className="font-medium">Empresa:</span> {empresa?.nome || "Não definida"}
                        </p>
                        <p>
                          <span className="font-medium">Condomínio:</span> {condominio?.nome || "Não definido"}
                        </p>
                        <p>
                          <span className="font-medium">Criado por:</span> {ordem.criadoPor}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Criado em:</span> {ordem.criadaEm.toLocaleDateString()}
                        </p>
                        {ordem.prazoEstimado && (
                          <p>
                            <span className="font-medium">Prazo:</span> {ordem.prazoEstimado.toLocaleDateString()}
                          </p>
                        )}
                        {ordem.valorOrcamento && (
                          <p>
                            <span className="font-medium">Valor:</span> R$ {ordem.valorOrcamento.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600">{ordem.descricao}</p>
                      {ordem.observacoes && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Obs:</span> {ordem.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>

                    {/* Ações de Status */}
                    <div className="flex flex-wrap gap-2">
                      {ordem.status === "pendente" && (
                        <Button size="sm" onClick={() => updateStatus(ordem.id, "em-execucao")}>
                          Iniciar Execução
                        </Button>
                      )}
                      {ordem.status === "em-execucao" && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(ordem.id, "pausada")}>
                            Pausar
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(ordem.id, "orcamento")}>
                            Solicitar Orçamento
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(ordem.id, "concluido")}>
                            Concluir
                          </Button>
                        </>
                      )}
                      {ordem.status === "pausada" && (
                        <Button size="sm" onClick={() => updateStatus(ordem.id, "em-execucao")}>
                          Retomar
                        </Button>
                      )}
                      {ordem.status === "orcamento" && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(ordem.id, "aprovado")}>
                            Aprovar Orçamento
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(ordem.id, "reprovado")}>
                            Reprovar Orçamento
                          </Button>
                        </>
                      )}
                      {ordem.status === "aprovado" && (
                        <Button size="sm" onClick={() => updateStatus(ordem.id, "implementacao")}>
                          Iniciar Implementação
                        </Button>
                      )}
                      {ordem.status === "implementacao" && (
                        <Button size="sm" onClick={() => updateStatus(ordem.id, "concluido")}>
                          Concluir
                        </Button>
                      )}
                      {ordem.status === "concluido" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(ordem.id, "reaberta")}>
                          Reabrir
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(ordem)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(ordem.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {ordensFiltradas.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma ordem de serviço encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
