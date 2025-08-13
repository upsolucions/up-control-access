"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Download, RefreshCw, Eye, Trash2, CheckCircle, XCircle, Filter } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: "administrador-master" | "administrador" | "gerente" | "operador" | "sindico" | "teste-sistema"
  senha: string
  condominioId?: string
  telefone?: string
  cpf?: string
  ativo: boolean
  dataCadastro: Date
}

interface Condominio {
  id: string
  nome: string
  razaoSocial: string
  cnpj: string
  endereco: string
  cep: string
  cidade: string
  estado: string
  gerente: string
  contato: string
  email: string
  ativo: boolean
  dataCadastro: Date
}

export default function TodosUsuarios() {
  const { canModifyData } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null)
  const [filtroPerfil, setFiltroPerfil] = useState<string>("")
  const [filtroCondominio, setFiltroCondominio] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Usuario | null
    direction: "ascending" | "descending"
  }>({
    key: null,
    direction: "ascending",
  })

  useEffect(() => {
    // Carregar usuários e condominios do localStorage
    const loadData = () => {
      setIsLoading(true)
      try {
        const savedUsuarios = localStorage.getItem("usuarios")
        const savedCondominios = localStorage.getItem("condominios")

        if (savedUsuarios) {
          const parsedUsuarios = JSON.parse(savedUsuarios).map((user: any) => ({
            ...user,
            dataCadastro: new Date(user.dataCadastro),
          }))
          setUsuarios(parsedUsuarios)
          setFilteredUsuarios(parsedUsuarios)
        }

        if (savedCondominios) {
          setCondominios(JSON.parse(savedCondominios))
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Aplicar filtros e busca
    let result = [...usuarios]

    // Aplicar busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.nome.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.cpf?.toLowerCase().includes(term) ||
          user.telefone?.toLowerCase().includes(term),
      )
    }

    // Filtrar por status ativo/inativo
    if (filtroAtivo !== null) {
      result = result.filter((user) => user.ativo === filtroAtivo)
    }

    // Filtrar por perfil
    if (filtroPerfil) {
      result = result.filter((user) => user.perfil === filtroPerfil)
    }

    // Filtrar por condomínio
    if (filtroCondominio) {
      result = result.filter((user) => user.condominioId === filtroCondominio)
    }

    // Aplicar ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Usuario]
        const bValue = b[sortConfig.key as keyof Usuario]

        if (aValue === undefined || bValue === undefined) return 0

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredUsuarios(result)
  }, [usuarios, searchTerm, filtroAtivo, filtroPerfil, filtroCondominio, sortConfig])

  const handleSort = (key: keyof Usuario) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      const updatedUsuarios = usuarios.filter((user) => user.id !== id)
      setUsuarios(updatedUsuarios)
      localStorage.setItem("usuarios", JSON.stringify(updatedUsuarios))
    }
  }

  const handleToggleStatus = (id: string) => {
    const updatedUsuarios = usuarios.map((user) => (user.id === id ? { ...user, ativo: !user.ativo } : user))
    setUsuarios(updatedUsuarios)
    localStorage.setItem("usuarios", JSON.stringify(updatedUsuarios))
  }

  const exportarCSV = () => {
    // Criar cabeçalho CSV
    const headers = ["ID", "Nome", "Email", "Perfil", "Telefone", "CPF", "Condomínio", "Status", "Data Cadastro"]

    // Criar linhas de dados
    const rows = filteredUsuarios.map((user) => {
      const condominio = condominios.find((c) => c.id === user.condominioId)
      return [
        user.id,
        user.nome,
        user.email,
        user.perfil,
        user.telefone || "",
        user.cpf || "",
        condominio?.nome || "",
        user.ativo ? "Ativo" : "Inativo",
        new Date(user.dataCadastro).toLocaleDateString(),
      ]
    })

    // Combinar cabeçalho e linhas
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `usuarios_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFiltroAtivo(null)
    setFiltroPerfil("")
    setFiltroCondominio("")
    setSortConfig({ key: null, direction: "ascending" })
  }

  const getPerfilLabel = (perfil: string) => {
    const perfis: Record<string, string> = {
      "administrador-master": "Admin Master",
      administrador: "Administrador",
      "gerente": "Gerente",
      operador: "Operador",
      sindico: "Síndico",
      "teste-sistema": "Teste de Sistema",
    }
    return perfis[perfil] || perfil
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Todos os Usuários Cadastrados</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
          <Button onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Nome, email, CPF..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border rounded"
                value={filtroAtivo === null ? "" : filtroAtivo ? "ativo" : "inativo"}
                onChange={(e) => {
                  if (e.target.value === "") setFiltroAtivo(null)
                  else setFiltroAtivo(e.target.value === "ativo")
                }}
              >
                <option value="">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>

            <div>
              <Label htmlFor="perfil">Perfil</Label>
              <select
                id="perfil"
                className="w-full p-2 border rounded"
                value={filtroPerfil}
                onChange={(e) => setFiltroPerfil(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="administrador-master">Admin Master</option>
                <option value="administrador">Administrador</option>
                <option value="administrador-local">Admin Local</option>
                <option value="operador">Operador</option>
                <option value="cliente">Cliente</option>
                <option value="teste-sistema">Teste de Sistema</option>
              </select>
            </div>

            <div>
              <Label htmlFor="condominio">Condomínio</Label>
              <select
                id="condominio"
                className="w-full p-2 border rounded"
                value={filtroCondominio}
                onChange={(e) => setFiltroCondominio(e.target.value)}
              >
                <option value="">Todos</option>
                {condominios.map((cond) => (
                  <option key={cond.id} value={cond.id}>
                    {cond.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Carregando usuários...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("nome")}>
                      Nome {sortConfig.key === "nome" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("email")}>
                      Email {sortConfig.key === "email" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("perfil")}>
                      Perfil {sortConfig.key === "perfil" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Condomínio</TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("ativo")}>
                      Status {sortConfig.key === "ativo" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("dataCadastro")}>
                      Cadastro {sortConfig.key === "dataCadastro" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.length > 0 ? (
                    filteredUsuarios.map((usuario) => {
                      const condominio = condominios.find((c) => c.id === usuario.condominioId)

                      return (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.perfil === "administrador-master" ? "destructive" : "outline"}>
                              {getPerfilLabel(usuario.perfil)}
                            </Badge>
                          </TableCell>
                          <TableCell>{usuario.telefone || "-"}</TableCell>
                          <TableCell>{condominio?.nome || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.ativo ? "default" : "secondary"}>
                              {usuario.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(usuario.dataCadastro).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canModifyData() && (
                                <Button
                                  size="sm"
                                  variant={usuario.ativo ? "outline" : "default"}
                                  onClick={() => handleToggleStatus(usuario.id)}
                                >
                                  {usuario.ativo ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                              )}
                              {usuario.perfil !== "administrador-master" && canModifyData() && (
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(usuario.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum usuário encontrado com os filtros aplicados</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Exibindo {filteredUsuarios.length} de {usuarios.length} usuários
        </p>
      </div>
    </div>
  )
}
