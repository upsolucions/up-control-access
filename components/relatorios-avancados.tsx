"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Filter, Shield, AlertTriangle, Users, Camera, Car, Heart, Flame, Home } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface RelatorioSeguranca {
  id: string
  tipo:
    | "seguranca"
    | "sinistro"
    | "comportamento_inadequado"
    | "suspeita_roubo"
    | "arrombamento"
    | "colisao_veiculos"
    | "acidente_ferimento"
    | "invasao_perimetro"
    | "emergencia_medica"
    | "incendio"
  titulo: string
  descricao: string
  local: string
  dataHora: Date
  gravidade: "baixa" | "media" | "alta" | "critica"
  status: "aberto" | "investigando" | "resolvido"
  criadoPor: string
  condominioId: string
  evidencias?: string[]
  observacoes?: string
}

export default function RelatoriosAvancados() {
  const { usuarioLogado, getAccessibleCondominios, canAccessCondominio, isAdminMaster } = useAuth()
  const [relatorios, setRelatorios] = useState<RelatorioSeguranca[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  const [novoRelatorio, setNovoRelatorio] = useState({
    tipo: "seguranca" as const,
    titulo: "",
    descricao: "",
    local: "",
    gravidade: "media" as const,
    observacoes: "",
  })
  const [filtros, setFiltros] = useState({
    tipo: "todos",
    gravidade: "todos",
    status: "todos",
    dataInicio: "",
    dataFim: "",
    condominio: usuarioLogado?.condominioId || "",
  })

  useEffect(() => {
    // Carregar condomínios baseado nas permissões do usuário
    const condominiosData = JSON.parse(localStorage.getItem('condominios') || '[]')
    const accessibleCondominioIds = getAccessibleCondominios()
    const filteredCondominios = condominiosData.filter((c: any) => 
      accessibleCondominioIds.includes(c.id)
    )
    setCondominios(filteredCondominios)

    // Carregar relatórios de exemplo filtrados por permissão
    const relatoriosExemplo: RelatorioSeguranca[] = [
      {
        id: '1',
        tipo: 'seguranca',
        titulo: 'Suspeita de atividade irregular',
        descricao: 'Pessoa não identificada circulando pelo condomínio',
        local: 'Área comum',
        dataHora: new Date('2024-01-15T14:30:00'),
        gravidade: 'media',
        status: 'aberto',
        criadoPor: 'João Silva',
        condominioId: '1'
      },
      {
        id: '2',
        tipo: 'incendio',
        titulo: 'Princípio de incêndio na garagem',
        descricao: 'Fumaça detectada no subsolo',
        local: 'Garagem',
        dataHora: new Date('2024-01-14T09:15:00'),
        gravidade: 'alta',
        status: 'resolvido',
        criadoPor: 'Maria Santos',
        condominioId: '2'
      }
    ]

    // Filtrar relatórios baseado nas permissões do usuário
    const relatoriosFiltrados = relatoriosExemplo.filter(relatorio => 
      canAccessCondominio(relatorio.condominioId)
    )
    
    setRelatorios(relatoriosFiltrados)
  }, [getAccessibleCondominios, canAccessCondominio])

  const tiposRelatorio = [
    { value: "seguranca", label: "Segurança Geral", icon: Shield },
    { value: "sinistro", label: "Sinistro", icon: AlertTriangle },
    { value: "comportamento_inadequado", label: "Comportamento Inadequado", icon: Users },
    { value: "suspeita_roubo", label: "Suspeita de Roubo", icon: Shield },
    { value: "arrombamento", label: "Arrombamento", icon: Home },
    { value: "colisao_veiculos", label: "Colisão de Veículos", icon: Car },
    { value: "acidente_ferimento", label: "Acidente com Ferimento", icon: Heart },
    { value: "invasao_perimetro", label: "Invasão de Perímetro", icon: Shield },
    { value: "emergencia_medica", label: "Emergência Médica", icon: Heart },
    { value: "incendio", label: "Incêndio", icon: Flame },
  ]

  const adicionarRelatorio = () => {
    if (novoRelatorio.titulo && novoRelatorio.descricao && novoRelatorio.local) {
      const relatorio: RelatorioSeguranca = {
        id: Date.now().toString(),
        ...novoRelatorio,
        dataHora: new Date(),
        status: "aberto",
        criadoPor: usuarioLogado?.nome || '',
        condominioId: usuarioLogado?.condominioId || "",
        evidencias: [],
      }

      setRelatorios([...relatorios, relatorio])

      // Enviar email automático para problemas críticos
      if (novoRelatorio.gravidade === "critica") {
        enviarEmailAutomatico(relatorio)
      }

      setNovoRelatorio({
        tipo: "seguranca",
        titulo: "",
        descricao: "",
        local: "",
        gravidade: "media",
        observacoes: "",
      })
    }
  }

  const enviarEmailAutomatico = (relatorio: RelatorioSeguranca) => {
    const assunto = `PROBLEMA CRÍTICO - ${relatorio.titulo}`
    const corpo = `
      ATENÇÃO: Problema crítico reportado!
      
      Tipo: ${tiposRelatorio.find((t) => t.value === relatorio.tipo)?.label}
      Local: ${relatorio.local}
      Descrição: ${relatorio.descricao}
      Reportado por: ${relatorio.criadoPor}
      Data/Hora: ${relatorio.dataHora.toLocaleString()}
      
      Ação imediata necessária!
    `

    // Simular envio de email automático
    console.log("Email automático enviado para administrador geral:", { assunto, corpo })
    alert("Email automático enviado para o administrador geral devido à gravidade crítica!")
  }

  const gerarRelatorioPDF = () => {
    const relatoriosFiltrados = filtrarRelatorios()

    // Simular geração de PDF
    const dadosRelatorio = {
      titulo: "Relatório de Segurança Detalhado",
      dataGeracao: new Date().toLocaleString(),
      filtros: filtros,
      totalRegistros: relatoriosFiltrados.length,
      dados: relatoriosFiltrados,
    }

    console.log("Gerando PDF:", dadosRelatorio)
    alert(`Relatório PDF gerado com ${relatoriosFiltrados.length} registros e baixado com sucesso!`)
  }

  const filtrarRelatorios = () => {
    return relatorios.filter((relatorio) => {
      const tipoMatch = filtros.tipo === "todos" || relatorio.tipo === filtros.tipo
      const gravidadeMatch = filtros.gravidade === "todos" || relatorio.gravidade === filtros.gravidade
      const statusMatch = filtros.status === "todos" || relatorio.status === filtros.status
      const condominioMatch = !filtros.condominio || relatorio.condominioId === filtros.condominio

      let dataMatch = true
      if (filtros.dataInicio) {
        dataMatch = dataMatch && relatorio.dataHora >= new Date(filtros.dataInicio)
      }
      if (filtros.dataFim) {
        dataMatch = dataMatch && relatorio.dataHora <= new Date(filtros.dataFim)
      }

      return tipoMatch && gravidadeMatch && statusMatch && condominioMatch && dataMatch
    })
  }

  const relatoriosFiltrados = filtrarRelatorios()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios de Segurança Avançados</h2>
        <Button onClick={gerarRelatorioPDF}>
          <Download className="h-4 w-4 mr-2" />
          Gerar PDF ({relatoriosFiltrados.length} registros)
        </Button>
      </div>

      {/* Formulário para novo relatório */}
      {(usuarioLogado.perfil === "operador" ||
        usuarioLogado.perfil === "admin_geral" ||
        usuarioLogado.perfil === "admin_local") && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Relatório de Segurança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Ocorrência</Label>
                <select
                  id="tipo"
                  className="w-full p-2 border rounded"
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio({ ...novoRelatorio, tipo: e.target.value as any })}
                >
                  {tiposRelatorio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="gravidade">Gravidade</Label>
                <select
                  id="gravidade"
                  className="w-full p-2 border rounded"
                  value={novoRelatorio.gravidade}
                  onChange={(e) => setNovoRelatorio({ ...novoRelatorio, gravidade: e.target.value as any })}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novoRelatorio.titulo}
                  onChange={(e) => setNovoRelatorio({ ...novoRelatorio, titulo: e.target.value })}
                  placeholder="Título resumido da ocorrência"
                />
              </div>
              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={novoRelatorio.local}
                  onChange={(e) => setNovoRelatorio({ ...novoRelatorio, local: e.target.value })}
                  placeholder="Local específico da ocorrência"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descricao">Descrição Detalhada</Label>
              <Textarea
                id="descricao"
                value={novoRelatorio.descricao}
                onChange={(e) => setNovoRelatorio({ ...novoRelatorio, descricao: e.target.value })}
                placeholder="Descreva detalhadamente a ocorrência"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                value={novoRelatorio.observacoes}
                onChange={(e) => setNovoRelatorio({ ...novoRelatorio, observacoes: e.target.value })}
                placeholder="Informações complementares"
                rows={2}
              />
            </div>
            <div>
              <Label>Evidências (Fotos/Vídeos)</Label>
              <Input type="file" multiple accept="image/*,video/*" />
            </div>
            <Button onClick={adicionarRelatorio}>
              <FileText className="h-4 w-4 mr-2" />
              ADM
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtros avançados */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Filter className="h-5 w-5 mr-2 inline" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label>Tipo</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              >
                <option value="todos">Todos os Tipos</option>
                {tiposRelatorio.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Gravidade</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.gravidade}
                onChange={(e) => setFiltros({ ...filtros, gravidade: e.target.value })}
              >
                <option value="todos">Todas</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="todos">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="investigando">Investigando</option>
                <option value="resolvido">Resolvido</option>
              </select>
            </div>
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>
          {isAdminMaster() && (
            <div className="mt-4">
              <Label>Condomínio</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.condominio}
                onChange={(e) => setFiltros({ ...filtros, condominio: e.target.value })}
              >
                <option value="">Todos os Condomínios</option>
                {condominios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de relatórios */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Relatórios Encontrados ({relatoriosFiltrados.length})</h3>
        </div>

        {relatoriosFiltrados.map((relatorio) => {
          const TipoIcon = tiposRelatorio.find((t) => t.value === relatorio.tipo)?.icon || FileText

          return (
            <Card key={relatorio.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <TipoIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{relatorio.titulo}</CardTitle>
                      <CardDescription>
                        {tiposRelatorio.find((t) => t.value === relatorio.tipo)?.label} - {relatorio.local}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        relatorio.gravidade === "critica"
                          ? "destructive"
                          : relatorio.gravidade === "alta"
                            ? "secondary"
                            : relatorio.gravidade === "media"
                              ? "outline"
                              : "default"
                      }
                    >
                      {relatorio.gravidade.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        relatorio.status === "resolvido"
                          ? "default"
                          : relatorio.status === "investigando"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {relatorio.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">{relatorio.descricao}</p>

                  {relatorio.observacoes && (
                    <div>
                      <h4 className="font-semibold text-sm">Observações:</h4>
                      <p className="text-sm text-gray-600">{relatorio.observacoes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Reportado por: {relatorio.criadoPor}</span>
                    <span>{relatorio.dataHora.toLocaleString()}</span>
                  </div>

                  {relatorio.evidencias && relatorio.evidencias.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm">Evidências:</h4>
                      <div className="flex gap-2 mt-1">
                        {relatorio.evidencias.map((evidencia, index) => (
                          <Badge key={index} variant="outline">
                            <Camera className="h-3 w-3 mr-1" />
                            Evidência {index + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
