"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Plus, Edit, Trash2, Upload, Search, Users } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { registrarAtividadeAuditoria } from './sistema-auditoria'

interface Permissao {
  id: string
  nome: string
  descricao: string
  categoria: string
}

interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  perfil:
    | "sindico"
    | "gerente"
    | "operador"
    | "gestor-seguranca"
    | "tecnico"
    | "prestador-servico"
    | "temporario"
    | "recepcao"
    | "administrador-master"
    | "teste-sistema"
  condominioId?: string
  foto?: string
  ativo: boolean
  telefone: string
  cpf: string
  endereco: string
  observacoes?: string
  dataCadastro: Date
  dataExpiracao?: Date // Para usuários temporários
  permissoes?: string[] // IDs das permissões específicas
}

interface Condominio {
  id: string
  nome: string
}

interface GerenciarUsuariosCompletoProps {
  condominioId?: string
}

export default function GerenciarUsuariosCompleto({ condominioId }: GerenciarUsuariosCompletoProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPerfil, setFilterPerfil] = useState("todos")
  const { usuarioLogado, isAdminMaster, getAccessibleCondominios, canModifyData, canEditUsers, canCreateUsers, canDeleteUsers } = useAuth()
  const usuarioAtual = usuarioLogado
  
  // Determinar o condomínio a ser usado (prop ou do usuário logado)
  const condominioAtivo = condominioId || usuarioLogado?.condominioId
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "sindico" as "sindico" | "gerente" | "operador" | "gestor-seguranca" | "tecnico" | "prestador-servico" | "temporario" | "recepcao" | "administrador-master" | "teste-sistema",
    condominioId: "",
    foto: "",
    ativo: true,
    telefone: "",
    cpf: "",
    endereco: "",
    observacoes: "",
    dataExpiracao: "",
    permissoes: [] as string[],
  })

  // Definir permissões disponíveis
  const permissoesDisponiveis: Permissao[] = [
    // Dashboard e Visualização
    { id: "view_dashboard", nome: "Visualizar Dashboard", descricao: "Acesso ao painel principal", categoria: "Dashboard" },
    { id: "view_statistics", nome: "Visualizar Estatísticas", descricao: "Acesso a gráficos e estatísticas", categoria: "Dashboard" },
    
    // Usuários
    { id: "view_users", nome: "Visualizar Usuários", descricao: "Ver lista de usuários", categoria: "Usuários" },
    { id: "create_users", nome: "Criar Usuários", descricao: "Adicionar novos usuários", categoria: "Usuários" },
    { id: "edit_users", nome: "Editar Usuários", descricao: "Modificar dados de usuários", categoria: "Usuários" },
    { id: "delete_users", nome: "Excluir Usuários", descricao: "Remover usuários do sistema", categoria: "Usuários" },
    
    // Condomínios
    { id: "view_condominios", nome: "Visualizar Condomínios", descricao: "Ver lista de condomínios", categoria: "Condomínios" },
    { id: "create_condominios", nome: "Criar Condomínios", descricao: "Adicionar novos condomínios", categoria: "Condomínios" },
    { id: "edit_condominios", nome: "Editar Condomínios", descricao: "Modificar dados de condomínios", categoria: "Condomínios" },
    { id: "delete_condominios", nome: "Excluir Condomínios", descricao: "Remover condomínios", categoria: "Condomínios" },
    
    // Dispositivos
    { id: "view_devices", nome: "Visualizar Dispositivos", descricao: "Ver dispositivos conectados", categoria: "Dispositivos" },
    { id: "manage_devices", nome: "Gerenciar Dispositivos", descricao: "Configurar e controlar dispositivos", categoria: "Dispositivos" },
    { id: "scan_network", nome: "Escanear Rede", descricao: "Buscar novos dispositivos na rede", categoria: "Dispositivos" },
    
    // Relatórios
    { id: "view_reports", nome: "Visualizar Relatórios", descricao: "Acessar relatórios do sistema", categoria: "Relatórios" },
    { id: "export_reports", nome: "Exportar Relatórios", descricao: "Baixar relatórios em PDF", categoria: "Relatórios" },
    { id: "create_problem_reports", nome: "Criar Relatórios de Problemas", descricao: "Registrar novos problemas", categoria: "Relatórios" },
    { id: "manage_problem_reports", nome: "Gerenciar Relatórios de Problemas", descricao: "Editar status de problemas", categoria: "Relatórios" },
    
    // Ordens de Serviço
    { id: "view_service_orders", nome: "Visualizar Ordens de Serviço", descricao: "Ver ordens de serviço", categoria: "Ordens de Serviço" },
    { id: "create_service_orders", nome: "Criar Ordens de Serviço", descricao: "Registrar novas ordens", categoria: "Ordens de Serviço" },
    { id: "edit_service_orders", nome: "Editar Ordens de Serviço", descricao: "Modificar ordens existentes", categoria: "Ordens de Serviço" },
    
    // Configurações
    { id: "view_settings", nome: "Visualizar Configurações", descricao: "Acessar configurações do sistema", categoria: "Configurações" },
    { id: "edit_settings", nome: "Editar Configurações", descricao: "Modificar configurações", categoria: "Configurações" },
    { id: "manage_integrations", nome: "Gerenciar Integrações", descricao: "Configurar integrações externas", categoria: "Configurações" },
    { id: "network_config", nome: "Configuração de Rede", descricao: "Configurar parâmetros de rede", categoria: "Configurações" },
    
    // Monitoramento
    { id: "view_monitoring", nome: "Visualizar Monitoramento", descricao: "Acessar dados de monitoramento", categoria: "Monitoramento" },
    { id: "view_network_map", nome: "Visualizar Mapa de Rede", descricao: "Ver topologia da rede", categoria: "Monitoramento" },
    
    // Empresas
    { id: "view_companies", nome: "Visualizar Empresas", descricao: "Ver empresas fornecedoras", categoria: "Empresas" },
    { id: "manage_companies", nome: "Gerenciar Empresas", descricao: "Adicionar/editar empresas", categoria: "Empresas" },
    
    // Sistema
    { id: "manage_logos", nome: "Gerenciar Logos", descricao: "Alterar logos do sistema", categoria: "Sistema" },
    { id: "manage_sessions", nome: "Gerenciar Sessões", descricao: "Controlar sessões ativas", categoria: "Sistema" },
  ]

  const perfisUsuario = [
    { value: "sindico", label: "Síndico", color: "bg-blue-100 text-blue-800" },
    { value: "gerente", label: "Gerente", color: "bg-green-100 text-green-800" },
    { value: "operador", label: "Operador", color: "bg-yellow-100 text-yellow-800" },
    { value: "gestor-seguranca", label: "Gestor de Segurança", color: "bg-gray-100 text-gray-800" },
    { value: "tecnico", label: "Técnico", color: "bg-purple-100 text-purple-800" },
    { value: "prestador-servico", label: "Prestador de Serviço", color: "bg-orange-100 text-orange-800" },
    { value: "temporario", label: "Temporário", color: "bg-red-100 text-red-800" },
    { value: "recepcao", label: "Recepção", color: "bg-indigo-100 text-indigo-800" },
    { value: "administrador-master", label: "Administrador Master", color: "bg-red-100 text-red-800" },
    { value: "teste-sistema", label: "Teste de Sistema", color: "bg-cyan-100 text-cyan-800" },
  ]

  useEffect(() => {
    // Carregar usuários do localStorage
    const savedUsuarios = localStorage.getItem("usuarios")
    if (savedUsuarios) {
      let allUsuarios = JSON.parse(savedUsuarios)
      
      if (isAdminMaster()) {
        // Admin master vê todos os usuários ou filtra por condomínio específico se fornecido
        if (condominioAtivo) {
          allUsuarios = allUsuarios.filter((u: Usuario) => u.condominioId === condominioAtivo)
        }
        // Se não há condominioAtivo, admin master vê todos os usuários
      } else {
        // Usuários específicos só veem usuários do seu condomínio
        const condominioUsuario = condominioAtivo || usuarioLogado?.condominioId
        if (condominioUsuario) {
          allUsuarios = allUsuarios.filter((u: Usuario) => u.condominioId === condominioUsuario)
        } else {
          allUsuarios = []
        }
      }
      
      setUsuarios(allUsuarios)
    } else {
      // Dados de exemplo
      const exemploUsuarios: Usuario[] = [
        {
          id: "1",
          nome: "Administrador Master",
          email: "admin@sistema.com",
          senha: "admin123",
          perfil: "administrador-master",
          foto: "/placeholder.svg?height=50&width=50",
          ativo: true,
          telefone: "(11) 99999-9999",
          cpf: "123.456.789-00",
          endereco: "Rua Admin, 123",
          dataCadastro: new Date("2023-01-01"),
        },
        {
          id: "2",
          nome: "João Silva",
          email: "joao@email.com",
          senha: "123456",
          perfil: "cliente",
          condominioId: "1",
          foto: "/placeholder.svg?height=50&width=50",
          ativo: true,
          telefone: "(11) 88888-8888",
          cpf: "987.654.321-00",
          endereco: "Apt 101, Bloco A",
          observacoes: "Morador do apartamento 101",
          dataCadastro: new Date("2023-02-15"),
        },
      ]
      setUsuarios(exemploUsuarios)
      localStorage.setItem("usuarios", JSON.stringify(exemploUsuarios))
    }

    // Carregar condomínios
    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [])

  const clearOldData = () => {
    try {
      // Limpar dados desnecessários do localStorage
      const keysToCheck = ['condominios', 'sessoes', 'relatorios', 'logs']
      keysToCheck.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed) && parsed.length > 100) {
              // Manter apenas os 50 mais recentes
              const reduced = parsed.slice(-50)
              localStorage.setItem(key, JSON.stringify(reduced))
            }
          } catch (e) {
            // Se não conseguir parsear, remove o item
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error)
    }
  }

  const saveUsuarios = (newUsuarios: Usuario[]) => {
    try {
      // Se estamos em um contexto específico de condomínio, precisamos mesclar com todos os usuários
      if (condominioId) {
        const allUsuarios = JSON.parse(localStorage.getItem("usuarios") || "[]")
        // Remover usuários do condomínio atual da lista completa
        const otherUsuarios = allUsuarios.filter((u: Usuario) => u.condominioId !== condominioId && u.perfil !== "administrador-master")
        // Adicionar os usuários master de volta
        const masterUsuarios = allUsuarios.filter((u: Usuario) => u.perfil === "administrador-master")
        // Combinar todos
        const finalUsuarios = [...otherUsuarios, ...masterUsuarios, ...newUsuarios]
        localStorage.setItem("usuarios", JSON.stringify(finalUsuarios))
      } else {
        localStorage.setItem("usuarios", JSON.stringify(newUsuarios))
      }
      setUsuarios(newUsuarios)
    } catch (error) {
      console.error("Erro ao salvar usuários:", error)
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Tentar limpar dados antigos e tentar novamente
        clearOldData()
        try {
          if (condominioId) {
            const allUsuarios = JSON.parse(localStorage.getItem("usuarios") || "[]")
            const otherUsuarios = allUsuarios.filter((u: Usuario) => u.condominioId !== condominioId && u.perfil !== "administrador-master")
            const masterUsuarios = allUsuarios.filter((u: Usuario) => u.perfil === "administrador-master")
            const finalUsuarios = [...otherUsuarios, ...masterUsuarios, ...newUsuarios]
            localStorage.setItem("usuarios", JSON.stringify(finalUsuarios))
          } else {
            localStorage.setItem("usuarios", JSON.stringify(newUsuarios))
          }
          setUsuarios(newUsuarios)
          alert("Dados salvos com sucesso após limpeza automática do cache.")
        } catch (retryError) {
          alert("Erro: Espaço de armazenamento insuficiente. Por favor, limpe o cache do navegador ou contate o administrador.")
        }
      } else {
        alert("Erro ao salvar dados dos usuários. Tente novamente.")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isEditing = !!editingUsuario
    let usuarioProcessado: Usuario

    if (isEditing) {
      // Atualizar usuário existente
      usuarioProcessado = {
        ...editingUsuario,
        ...formData,
        dataCadastro: editingUsuario.dataCadastro,
        dataExpiracao: formData.dataExpiracao ? new Date(formData.dataExpiracao) : undefined,
      }
      const updatedUsuarios = usuarios.map((user) =>
        user.id === editingUsuario.id ? usuarioProcessado : user
      )
      saveUsuarios(updatedUsuarios)
    } else {
      // Adicionar novo usuário
      usuarioProcessado = {
        id: Date.now().toString(),
        ...formData,
        condominioId: condominioAtivo || formData.condominioId,
        dataCadastro: new Date(),
        dataExpiracao: formData.dataExpiracao ? new Date(formData.dataExpiracao) : undefined,
        permissoes: formData.permissoes,
      }
      saveUsuarios([...usuarios, usuarioProcessado])
    }

    // Registrar atividade de auditoria
    registrarAtividadeAuditoria({
      tipo: isEditing ? 'edicao' : 'inclusao',
      entidade: 'usuario',
      detalhes: `${isEditing ? 'Editou' : 'Criou'} usuário: ${usuarioProcessado.nome} (${usuarioProcessado.perfil})`,
      usuarioNome: usuarioAtual?.nome || 'Usuário não identificado',
      usuarioPerfil: usuarioAtual?.perfil || 'Perfil não identificado'
    })

    // Resetar formulário
    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingUsuario(null)
    setFormData({
        nome: "",
        email: "",
        senha: "",
        perfil: "sindico" as "sindico" | "gerente" | "operador" | "gestor-seguranca" | "tecnico" | "prestador-servico" | "temporario" | "recepcao" | "administrador-master" | "teste-sistema",
        condominioId: condominioAtivo || "",
        foto: "",
        ativo: true,
        telefone: "",
        cpf: "",
        endereco: "",
        observacoes: "",
        dataExpiracao: "",
        permissoes: [] as string[],
      })
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      perfil: usuario.perfil,
      condominioId: usuario.condominioId || "",
      foto: usuario.foto || "",
      ativo: usuario.ativo,
      telefone: usuario.telefone,
      cpf: usuario.cpf,
      endereco: usuario.endereco,
      observacoes: usuario.observacoes || "",
      dataExpiracao: usuario.dataExpiracao ? usuario.dataExpiracao.toISOString().split("T")[0] : "",
      permissoes: usuario.permissoes || [],
    })
    setShowForm(true)
  }

  // Função para alternar permissão
  const togglePermissao = (permissaoId: string) => {
    setFormData(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(permissaoId)
        ? prev.permissoes.filter(id => id !== permissaoId)
        : [...prev.permissoes, permissaoId]
    }))
  }

  // Função para selecionar todas as permissões de uma categoria
  const toggleCategoriaPermissoes = (categoria: string) => {
    const permissoesDaCategoria = permissoesDisponiveis
      .filter(p => p.categoria === categoria)
      .map(p => p.id)
    
    const todasSelecionadas = permissoesDaCategoria.every(id => 
      formData.permissoes.includes(id)
    )
    
    if (todasSelecionadas) {
      // Remove todas da categoria
      setFormData(prev => ({
        ...prev,
        permissoes: prev.permissoes.filter(id => !permissoesDaCategoria.includes(id))
      }))
    } else {
      // Adiciona todas da categoria
      setFormData(prev => ({
        ...prev,
        permissoes: [...new Set([...prev.permissoes, ...permissoesDaCategoria])]
      }))
    }
  }

  // Agrupar permissões por categoria
  const permissoesPorCategoria = permissoesDisponiveis.reduce((acc, permissao) => {
    if (!acc[permissao.categoria]) {
      acc[permissao.categoria] = []
    }
    acc[permissao.categoria].push(permissao)
    return acc
  }, {} as Record<string, Permissao[]>)

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const usuarioExcluido = usuarios.find(user => user.id === id)
        
        // Sempre trabalhar com a lista completa de usuários para manter consistência
        const allUsuarios = JSON.parse(localStorage.getItem("usuarios") || "[]")
        const filteredAllUsuarios = allUsuarios.filter((user: Usuario) => user.id !== id)
        localStorage.setItem("usuarios", JSON.stringify(filteredAllUsuarios))
        
        // Atualizar a lista local filtrada
        const filteredUsuarios = usuarios.filter((user) => user.id !== id)
        setUsuarios(filteredUsuarios)
        
        // Registrar atividade de auditoria
        if (usuarioExcluido) {
          registrarAtividadeAuditoria({
            tipo: 'exclusao',
            entidade: 'usuario',
            detalhes: `Excluiu usuário: ${usuarioExcluido.nome} (${usuarioExcluido.perfil})`,
            usuarioNome: usuarioAtual?.nome || 'Usuário não identificado',
            usuarioPerfil: usuarioAtual?.perfil || 'Perfil não identificado'
          })
        }
      } catch (error) {
        console.error("Erro ao excluir usuário:", error)
        alert("Erro ao excluir usuário. Tente novamente.")
      }
    }
  }

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const getPerfilInfo = (perfil: string) => {
    return perfisUsuario.find((p) => p.value === perfil) || perfisUsuario[0]
  }

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPerfil = filterPerfil === "todos" || usuario.perfil === filterPerfil
    return matchSearch && matchPerfil
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        {canCreateUsers() && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            ADM
          </Button>
        )}
      </div>

      {!canCreateUsers() && (
        <Alert>
          <AlertDescription>
            Apenas administradores master podem criar novos usuários.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                className="w-full p-2 border rounded"
                value={filterPerfil}
                onChange={(e) => setFilterPerfil(e.target.value)}
              >
                <option value="todos">Todos os Perfis</option>
                {perfisUsuario.map((perfil) => (
                  <option key={perfil.value} value={perfil.value}>
                    {perfil.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Total: {usuariosFiltrados.length} usuários</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUsuario ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perfil">Perfil</Label>
                  <select
                    id="perfil"
                    className="w-full p-2 border rounded"
                    value={formData.perfil}
                    onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
                  >
                    {perfisUsuario.map((perfil) => (
                      <option key={perfil.value} value={perfil.value}>
                        {perfil.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
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
                {formData.perfil === "temporario" && (
                  <div className="space-y-2">
                    <Label htmlFor="dataExpiracao">Data de Expiração</Label>
                    <Input
                      id="dataExpiracao"
                      type="date"
                      value={formData.dataExpiracao}
                      onChange={(e) => setFormData({ ...formData, dataExpiracao: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais"
                />
              </div>

              {/* Seção de Permissões - Apenas para Administrador Master */}
              {isAdminMaster() && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Permissões Específicas</Label>
                    <Badge variant="outline">Administrador Master</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Selecione as permissões específicas que este usuário terá no sistema.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <p className="text-amber-800">
                      <strong>💡 Dica:</strong> Use o botão "📖 Somente Leitura" para criar usuários que podem apenas visualizar informações, sem poder modificar, criar ou excluir dados no sistema.
                    </p>
                  </div>
                  
                  {/* Botões de Ação Rápida */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Selecionar apenas permissões de visualização (somente leitura)
                        const permissoesLeitura = permissoesDisponiveis
                          .filter(p => p.id.includes('view_') || p.id.includes('visualizar'))
                          .map(p => p.id)
                        setFormData(prev => ({ ...prev, permissoes: permissoesLeitura }))
                      }}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                    >
                      📖 Somente Leitura
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Selecionar todas as permissões
                        const todasPermissoes = permissoesDisponiveis.map(p => p.id)
                        setFormData(prev => ({ ...prev, permissoes: todasPermissoes }))
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                    >
                      🔓 Acesso Completo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Limpar todas as permissões
                        setFormData(prev => ({ ...prev, permissoes: [] }))
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                    >
                      🚫 Limpar Todas
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {Object.entries(permissoesPorCategoria).map(([categoria, permissoes]) => {
                      const todasSelecionadas = permissoes.every(p => formData.permissoes.includes(p.id))
                      const algumasSelecionadas = permissoes.some(p => formData.permissoes.includes(p.id))
                      
                      return (
                        <div key={categoria} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{categoria}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCategoriaPermissoes(categoria)}
                              className={algumasSelecionadas ? "bg-blue-50" : ""}
                            >
                              {todasSelecionadas ? "Desmarcar Todas" : "Selecionar Todas"}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 ml-4">
                            {permissoes.map((permissao) => (
                              <div key={permissao.id} className="flex items-start space-x-2">
                                <input
                                  type="checkbox"
                                  id={permissao.id}
                                  checked={formData.permissoes.includes(permissao.id)}
                                  onChange={() => togglePermissao(permissao.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <Label htmlFor={permissao.id} className="text-sm font-medium cursor-pointer">
                                    {permissao.nome}
                                  </Label>
                                  <p className="text-xs text-gray-500">{permissao.descricao}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Permissões selecionadas:</strong> {formData.permissoes.length} de {permissoesDisponiveis.length}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Foto do Usuário</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setFormData({ ...formData, foto: event.target?.result as string })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Button type="button" size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.foto && (
                  <div className="mt-2">
                    <img 
                      src={formData.foto} 
                      alt="Preview da foto" 
                      className="w-20 h-20 object-cover rounded-full border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <Label htmlFor="ativo">Usuário Ativo</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editingUsuario ? "Atualizar" : "Cadastrar"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuariosFiltrados.map((usuario) => {
          const perfilInfo = getPerfilInfo(usuario.perfil)
          const condominio = condominios.find((c) => c.id === usuario.condominioId)
          const isExpired = usuario.dataExpiracao && new Date() > new Date(usuario.dataExpiracao)

          return (
            <Card key={usuario.id} className={isExpired ? "border-red-300 bg-red-50" : ""}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={usuario.foto || "/placeholder.svg"} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold">{usuario.nome}</h3>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* Botão Gerenciar Pessoas - Disponível para perfis específicos */}
                      {(usuario.perfil === "administrador-master" || 
                        usuario.perfil === "administrador" || 
                        usuario.perfil === "gerente" || 
                        usuario.perfil === "operador") && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            // Redirecionar para o dashboard de gerenciar pessoas
                            window.location.href = '/gerenciar-pessoas'
                          }}
                          title="Autorizar acesso ao Gerenciar Pessoas"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      {canEditUsers() && (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(usuario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteUsers() && (
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(usuario.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Perfil:</span>
                      <Badge className={perfilInfo.color}>{perfilInfo.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>CPF:</span>
                      <span>{formatarCPF(usuario.cpf)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Telefone:</span>
                      <span>{usuario.telefone}</span>
                    </div>
                    {condominio && (
                      <div className="flex items-center justify-between">
                        <span>Condomínio:</span>
                        <span className="text-xs">{condominio.nome}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={usuario.ativo ? "default" : "secondary"}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>

                  {usuario.endereco && (
                    <div className="text-sm">
                      <span className="font-medium">Endereço:</span>
                      <p className="text-gray-600">{usuario.endereco}</p>
                    </div>
                  )}

                  {usuario.observacoes && (
                    <div className="text-sm">
                      <span className="font-medium">Observações:</span>
                      <p className="text-gray-600">{usuario.observacoes}</p>
                    </div>
                  )}

                  {/* Exibir permissões específicas - Apenas para Admin Master */}
                  {isAdminMaster() && usuario.permissoes && usuario.permissoes.length > 0 && (
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Permissões Específicas:</span>
                        {/* Verificar se é somente leitura */}
                        {usuario.permissoes.every(p => p.includes('view_') || p.includes('visualizar')) && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            📖 Somente Leitura
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {usuario.permissoes.slice(0, 3).map((permissaoId) => {
                          const permissao = permissoesDisponiveis.find(p => p.id === permissaoId)
                          return permissao ? (
                            <Badge key={permissaoId} variant="outline" className="text-xs mr-1 mb-1">
                              {permissao.nome}
                            </Badge>
                          ) : null
                        })}
                        {usuario.permissoes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{usuario.permissoes.length - 3} mais
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total: {usuario.permissoes.length} permissões
                      </p>
                    </div>
                  )}

                  {usuario.dataExpiracao && (
                    <div className="text-sm">
                      <span className="font-medium">Expira em:</span>
                      <p className={`${isExpired ? "text-red-600 font-bold" : "text-gray-600"}`}>
                        {new Date(usuario.dataExpiracao).toLocaleDateString()}
                        {isExpired && " (EXPIRADO)"}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 border-t pt-2">
                    Cadastrado em: {new Date(usuario.dataCadastro).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {usuariosFiltrados.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
