"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, FileText, Calendar } from "lucide-react"
import { PDFGenerator } from "@/lib/pdf-generator"
import { useAuth } from "@/contexts/AuthContext"

interface RegistroAcesso {
  id: string
  usuario: string
  local: string
  dispositivo: string
  condominio: string
  horario: string
  status: "Autorizado" | "Negado"
  condominioId: string
}

interface Condominio {
  id: string
  nome: string
}

export default function RelatoriosAcesso() {
  const { canModifyData, getAccessibleCondominios, canAccessCondominio } = useAuth()
  const [registros, setRegistros] = useState<RegistroAcesso[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [filtros, setFiltros] = useState({
    usuario: "",
    local: "",
    status: "",
    condominioId: "",
    dataInicio: "",
    dataFim: "",
  })

  useEffect(() => {
    // Carregar condominios baseado nas permissões do usuário
    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      const allCondominios = JSON.parse(savedCondominios)
      const accessibleCondominioIds = getAccessibleCondominios()
      const filteredCondominios = allCondominios.filter((c: Condominio) => 
        accessibleCondominioIds.includes(c.id)
      )
      setCondominios(filteredCondominios)
    }

    // Dados de exemplo para registros de acesso
    const exemploRegistros: RegistroAcesso[] = [
      {
        id: "1",
        usuario: "João Silva",
        local: "Portaria Principal",
        dispositivo: "Leitor Facial 01",
        condominio: "Residencial Jardim das Flores",
        horario: "2023-06-08 14:30:25",
        status: "Autorizado",
        condominioId: "1",
      },
      {
        id: "2",
        usuario: "Maria Santos",
        local: "Garagem",
        dispositivo: "Leitor RFID 02",
        condominio: "Residencial Jardim das Flores",
        horario: "2023-06-08 14:25:10",
        status: "Autorizado",
        condominioId: "1",
      },
      {
        id: "3",
        usuario: "Pedro Costa",
        local: "Salão de Festas",
        dispositivo: "Leitor Facial 03",
        condominio: "Residencial Jardim das Flores",
        horario: "2023-06-08 14:20:45",
        status: "Negado",
        condominioId: "1",
      },
      {
        id: "4",
        usuario: "Ana Oliveira",
        local: "Portaria Principal",
        dispositivo: "Leitor Facial 01",
        condominio: "Condomínio Solar",
        horario: "2023-06-08 13:15:30",
        status: "Autorizado",
        condominioId: "2",
      },
      {
        id: "5",
        usuario: "Carlos Mendes",
        local: "Academia",
        dispositivo: "Leitor RFID 01",
        condominio: "Condomínio Solar",
        horario: "2023-06-08 12:45:20",
        status: "Negado",
        condominioId: "2",
      },
    ]

    // Filtrar registros baseado nas permissões do usuário
    const registrosFiltrados = exemploRegistros.filter(registro => 
      canAccessCondominio(registro.condominioId)
    )

    setRegistros(registrosFiltrados)
  }, [])

  // Filtrar registros
  const registrosFiltrados = registros.filter((registro) => {
    const matchUsuario = !filtros.usuario || registro.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
    const matchLocal = !filtros.local || registro.local.toLowerCase().includes(filtros.local.toLowerCase())
    const matchStatus = !filtros.status || registro.status === filtros.status
    const matchCondominio = !filtros.condominioId || registro.condominioId === filtros.condominioId

    let matchData = true
    if (filtros.dataInicio) {
      matchData = matchData && new Date(registro.horario) >= new Date(filtros.dataInicio)
    }
    if (filtros.dataFim) {
      matchData = matchData && new Date(registro.horario) <= new Date(filtros.dataFim)
    }

    return matchUsuario && matchLocal && matchStatus && matchCondominio && matchData
  })

  // Gerar relatório em PDF (simulado)
  const gerarRelatorioPDF = async () => {
    const sucesso = await PDFGenerator.gerarRelatorioPDF(registrosFiltrados, "Relatório de Acessos", "acesso", usuarioLogado?.nome || "Sistema")

    if (sucesso) {
      alert("Relatório PDF gerado e enviado para impressão!")
    }
  }

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      usuario: "",
      local: "",
      status: "",
      condominioId: "",
      dataInicio: "",
      dataFim: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios de Acesso</h2>
        {canModifyData() && (
          <Button onClick={gerarRelatorioPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                value={filtros.usuario}
                onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={filtros.local}
                onChange={(e) => setFiltros({ ...filtros, local: e.target.value })}
                placeholder="Local de acesso"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border rounded"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value as any })}
              >
                <option value="">Todos</option>
                <option value="Autorizado">Autorizado</option>
                <option value="Negado">Negado</option>
              </select>
            </div>
            <div>
              <Label htmlFor="condominio">Condomínio</Label>
              <select
                id="condominio"
                className="w-full p-2 border rounded"
                value={filtros.condominioId}
                onChange={(e) => setFiltros({ ...filtros, condominioId: e.target.value })}
              >
                <option value="">Todos os Condomínios</option>
                {condominios.map((cond) => (
                  <option key={cond.id} value={cond.id}>
                    {cond.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Registros de Acesso ({registrosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Usuário</th>
                  <th className="p-2 text-left">Local</th>
                  <th className="p-2 text-left">Dispositivo</th>
                  <th className="p-2 text-left">Condomínio</th>
                  <th className="p-2 text-left">Horário</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((registro) => (
                  <tr key={registro.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{registro.usuario}</td>
                    <td className="p-2">{registro.local}</td>
                    <td className="p-2">{registro.dispositivo}</td>
                    <td className="p-2">{registro.condominio}</td>
                    <td className="p-2">{registro.horario}</td>
                    <td className="p-2">
                      <Badge variant={registro.status === "Autorizado" ? "default" : "destructive"}>
                        {registro.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {registrosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Acessos por Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Autorizados</span>
                <Badge variant="default">{registrosFiltrados.filter((r) => r.status === "Autorizado").length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Negados</span>
                <Badge variant="destructive">{registrosFiltrados.filter((r) => r.status === "Negado").length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Acessos por Local</h3>
            <div className="space-y-2">
              {Array.from(new Set(registrosFiltrados.map((r) => r.local))).map((local) => (
                <div key={local} className="flex justify-between items-center">
                  <span>{local}</span>
                  <Badge variant="outline">{registrosFiltrados.filter((r) => r.local === local).length}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Acessos por Condomínio</h3>
            <div className="space-y-2">
              {Array.from(new Set(registrosFiltrados.map((r) => r.condominio))).map((condominio) => (
                <div key={condominio} className="flex justify-between items-center">
                  <span>{condominio}</span>
                  <Badge variant="outline">
                    {registrosFiltrados.filter((r) => r.condominio === condominio).length}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
