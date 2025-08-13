"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { registrarAtividadeAuditoria } from "./sistema-auditoria"
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Home,
  Briefcase,
  Truck,
  UserCheck,
  Building,
  Eye,
  Lock,
  Search,
  Filter,
  Car,
  Plus
} from "lucide-react"

interface Veiculo {
  id: string
  placa: string
  modelo: string
  cor: string
  tipo: "carro" | "moto" | "bicicleta" | "outro"
}

interface Pessoa {
  id: string
  nome: string
  cpf: string
  telefone: string
  email?: string
  tipo: "proprietario" | "morador" | "funcionario" | "prestador-servico" | "entregador"
  unidades: string[]
  veiculos?: Veiculo[]
  foto?: string
  observacoes?: string
  ativo: boolean
  dataCadastro: Date
  condominioId?: string
}

interface GerenciarPessoasProps {
  condominioId?: string
}

// Definição de permissões por perfil
const getPermissoesPorPerfil = (perfil: string) => {
  const permissoes = {
    "administrador-master": { incluir: true, editar: true, excluir: true, visualizar: true },
    "administrador": { incluir: true, editar: true, excluir: true, visualizar: true },
    "gerente": { incluir: true, editar: true, excluir: false, visualizar: true },
    "operador": { incluir: true, editar: true, excluir: false, visualizar: true },
    "tecnico": { incluir: false, editar: false, excluir: false, visualizar: true },
    "recepcao": { incluir: false, editar: false, excluir: false, visualizar: true },
    "prestador-servico": { incluir: false, editar: false, excluir: false, visualizar: true },
    "sindico": { incluir: false, editar: false, excluir: false, visualizar: true },
    "gestor-seguranca": { incluir: false, editar: false, excluir: false, visualizar: true },
    "temporario": { incluir: false, editar: false, excluir: false, visualizar: true },
    "teste-sistema": { incluir: true, editar: true, excluir: true, visualizar: true }
  }
  return permissoes[perfil as keyof typeof permissoes] || { incluir: false, editar: false, excluir: false, visualizar: true }
}

export default function GerenciarPessoas({ condominioId }: GerenciarPessoasProps) {
  const { usuarioLogado, isAdminMaster, getUserCondominio } = useAuth()
  const usuarioAtual = usuarioLogado
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  
  // Determinar o condomínio a ser usado (prop ou do usuário logado)
  const condominioAtivo = condominioId || usuarioLogado?.condominioId
  
  // Obter permissões do usuário atual
  const permissoes = usuarioLogado ? getPermissoesPorPerfil(usuarioLogado.perfil) : { incluir: false, editar: false, excluir: false, visualizar: false }
  
  // Verificar se o usuário tem pelo menos uma permissão
  const temAlgumaPermissao = permissoes.incluir || permissoes.editar || permissoes.excluir || permissoes.visualizar
  
  const [showDialog, setShowDialog] = useState(false)
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null)
  const [activeTab, setActiveTab] = useState("proprietario")
  const [formData, setFormData] = useState<Partial<Pessoa>>({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    tipo: "proprietario",
    unidades: [],
    veiculos: [],
    observacoes: "",
    ativo: true
  })
  const [novaUnidade, setNovaUnidade] = useState("")
  const [novoVeiculo, setNovoVeiculo] = useState<Partial<Veiculo>>({
    placa: "",
    modelo: "",
    cor: "",
    tipo: "carro"
  })
  
  // Estados para busca avançada
  const [showBuscaAvancada, setShowBuscaAvancada] = useState(false)
  const [filtros, setFiltros] = useState({
    nome: "",
    cpf: "",
    unidade: "",
    apartamento: "",
    casa: ""
  })

  useEffect(() => {
    carregarPessoas()
  }, [])

  const carregarPessoas = () => {
    const pessoasSalvas = localStorage.getItem("pessoas")
    if (pessoasSalvas) {
      const todasPessoas = JSON.parse(pessoasSalvas)
      
      if (isAdminMaster()) {
        // Admin master vê todas as pessoas ou filtra por condomínio específico se fornecido
        if (condominioAtivo) {
          setPessoas(todasPessoas.filter((p: Pessoa) => p.condominioId === condominioAtivo))
        } else {
          setPessoas(todasPessoas)
        }
      } else {
        // Usuários específicos só veem pessoas do seu condomínio
        const condominioUsuario = condominioAtivo || usuarioLogado?.condominioId
        if (condominioUsuario) {
          setPessoas(todasPessoas.filter((p: Pessoa) => p.condominioId === condominioUsuario))
        } else {
          setPessoas([])
        }
      }
    }
  }

  const salvarPessoas = (novasPessoas: Pessoa[]) => {
    const pessoasSalvas = localStorage.getItem("pessoas")
    let todasPessoas = pessoasSalvas ? JSON.parse(pessoasSalvas) : []
    
    const condominioParaSalvar = condominioAtivo || usuarioLogado?.condominioId
    
    if (condominioParaSalvar) {
      // Remove pessoas antigas do condomínio e adiciona as novas
      todasPessoas = todasPessoas.filter((p: Pessoa) => p.condominioId !== condominioParaSalvar)
      todasPessoas = [...todasPessoas, ...novasPessoas]
    } else if (isAdminMaster()) {
      // Admin master pode salvar sem filtro de condomínio apenas se não houver condomínio específico
      todasPessoas = novasPessoas
    }
    
    localStorage.setItem("pessoas", JSON.stringify(todasPessoas))
    setPessoas(novasPessoas)
  }

  const formatarCPF = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, "")
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatarTelefone = (telefone: string) => {
    const apenasNumeros = telefone.replace(/\D/g, "")
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    } else if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return telefone
  }

  const validarCPF = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, "")
    if (apenasNumeros.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(apenasNumeros)) return false
    
    // Validação do primeiro dígito verificador
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(apenasNumeros.charAt(i)) * (10 - i)
    }
    let resto = soma % 11
    let digito1 = resto < 2 ? 0 : 11 - resto
    
    if (parseInt(apenasNumeros.charAt(9)) !== digito1) return false
    
    // Validação do segundo dígito verificador
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(apenasNumeros.charAt(i)) * (11 - i)
    }
    resto = soma % 11
    let digito2 = resto < 2 ? 0 : 11 - resto
    
    return parseInt(apenasNumeros.charAt(10)) === digito2
  }

  const handleSubmit = () => {
    if (!formData.nome || !formData.cpf || !formData.telefone) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (!validarCPF(formData.cpf)) {
      alert("CPF inválido. Por favor, verifique o número digitado.")
      return
    }

    const novaPessoa: Pessoa = {
      id: editingPessoa?.id || Date.now().toString(),
      nome: formData.nome!,
      cpf: formatarCPF(formData.cpf!),
      telefone: formatarTelefone(formData.telefone!),
      email: formData.email || "",
      tipo: formData.tipo as Pessoa["tipo"],
      unidades: formData.unidades || [],
      veiculos: formData.veiculos || [],
      foto: formData.foto,
      observacoes: formData.observacoes,
      ativo: formData.ativo ?? true,
      dataCadastro: editingPessoa?.dataCadastro || new Date(),
      condominioId: condominioAtivo || usuarioLogado?.condominioId
    }

    let novasPessoas
    const isEditing = !!editingPessoa
    if (isEditing) {
      novasPessoas = pessoas.map(p => p.id === editingPessoa.id ? novaPessoa : p)
    } else {
      novasPessoas = [...pessoas, novaPessoa]
    }

    salvarPessoas(novasPessoas)
    
    // Registrar atividade de auditoria
    registrarAtividadeAuditoria({
      tipo: isEditing ? 'edicao' : 'inclusao',
      entidade: 'pessoa',
      detalhes: `${isEditing ? 'Editou' : 'Criou'} pessoa: ${novaPessoa.nome} (${novaPessoa.tipo})`,
      usuarioNome: usuarioAtual?.nome || 'Usuário não identificado',
      usuarioPerfil: usuarioAtual?.perfil || 'Perfil não identificado'
    })
    
    resetForm()
    setShowDialog(false)
  }

  const handleEdit = (pessoa: Pessoa) => {
    setEditingPessoa(pessoa)
    setFormData({
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      telefone: pessoa.telefone,
      email: pessoa.email,
      tipo: pessoa.tipo,
      unidades: pessoa.unidades,
      veiculos: pessoa.veiculos || [],
      foto: pessoa.foto,
      observacoes: pessoa.observacoes,
      ativo: pessoa.ativo
    })
    setActiveTab(pessoa.tipo)
    setShowDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pessoa?")) {
      const pessoaExcluida = pessoas.find(p => p.id === id)
      const novasPessoas = pessoas.filter(p => p.id !== id)
      salvarPessoas(novasPessoas)
      
      // Registrar atividade de auditoria
      if (pessoaExcluida) {
        registrarAtividadeAuditoria({
          tipo: 'exclusao',
          entidade: 'pessoa',
          detalhes: `Excluiu pessoa: ${pessoaExcluida.nome} (${pessoaExcluida.tipo})`,
          usuarioNome: usuarioAtual?.nome || 'Usuário não identificado',
          usuarioPerfil: usuarioAtual?.perfil || 'Perfil não identificado'
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      tipo: activeTab as Pessoa["tipo"],
      unidades: [],
      veiculos: [],
      observacoes: "",
      ativo: true
    })
    setEditingPessoa(null)
    setNovaUnidade("")
    setNovoVeiculo({
      placa: "",
      modelo: "",
      cor: "",
      tipo: "carro"
    })
  }

  const adicionarUnidade = () => {
    if (novaUnidade.trim() && !formData.unidades?.includes(novaUnidade.trim())) {
      setFormData({
        ...formData,
        unidades: [...(formData.unidades || []), novaUnidade.trim()]
      })
      setNovaUnidade("")
    }
  }

  const removerUnidade = (unidade: string) => {
    setFormData({
      ...formData,
      unidades: formData.unidades?.filter(u => u !== unidade) || []
    })
  }

  const adicionarVeiculo = () => {
    if (!novoVeiculo.placa || !novoVeiculo.modelo || !novoVeiculo.cor) {
      alert("Por favor, preencha todos os campos do veículo.")
      return
    }

    if ((formData.veiculos?.length || 0) >= 3) {
      alert("Máximo de 3 veículos por pessoa.")
      return
    }

    const veiculo: Veiculo = {
      id: Date.now().toString(),
      placa: novoVeiculo.placa!.toUpperCase(),
      modelo: novoVeiculo.modelo!,
      cor: novoVeiculo.cor!,
      tipo: novoVeiculo.tipo as Veiculo["tipo"]
    }

    setFormData({
      ...formData,
      veiculos: [...(formData.veiculos || []), veiculo]
    })

    setNovoVeiculo({
      placa: "",
      modelo: "",
      cor: "",
      tipo: "carro"
    })
  }

  const removerVeiculo = (veiculoId: string) => {
    setFormData({
      ...formData,
      veiculos: formData.veiculos?.filter(v => v.id !== veiculoId) || []
    })
  }

  const formatarPlaca = (placa: string) => {
    // Remove caracteres não alfanuméricos
    const apenasAlfanumericos = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
    
    // Formato brasileiro: ABC1234 ou ABC1D23
    if (apenasAlfanumericos.length <= 7) {
      return apenasAlfanumericos.replace(/^([A-Z]{3})([0-9]{1,4})$/, "$1-$2")
    }
    
    return apenasAlfanumericos.substring(0, 7)
  }

  const getTipoVeiculoIcon = (tipo: string) => {
    switch (tipo) {
      case "carro": return <Car className="w-4 h-4" />
      case "moto": return <Car className="w-4 h-4" />
      case "bicicleta": return <Car className="w-4 h-4" />
      default: return <Car className="w-4 h-4" />
    }
  }

  const getTipoVeiculoLabel = (tipo: string) => {
    switch (tipo) {
      case "carro": return "Carro"
      case "moto": return "Moto"
      case "bicicleta": return "Bicicleta"
      case "outro": return "Outro"
      default: return tipo
    }
  }

  const getTipoVeiculoColor = (tipo: string) => {
    switch (tipo) {
      case "carro": return "bg-blue-100 text-blue-800"
      case "moto": return "bg-green-100 text-green-800"
      case "bicicleta": return "bg-yellow-100 text-yellow-800"
      case "outro": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, foto: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "proprietario": return <Home className="w-4 h-4" />
      case "morador": return <Users className="w-4 h-4" />
      case "funcionario": return <UserCheck className="w-4 h-4" />
      case "prestador-servico": return <Briefcase className="w-4 h-4" />
      case "entregador": return <Truck className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "proprietario": return "Proprietário"
      case "morador": return "Morador"
      case "funcionario": return "Funcionário"
      case "prestador-servico": return "Prestador de Serviço"
      case "entregador": return "Entregador"
      default: return tipo
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "proprietario": return "bg-blue-100 text-blue-800"
      case "morador": return "bg-green-100 text-green-800"
      case "funcionario": return "bg-purple-100 text-purple-800"
      case "prestador-servico": return "bg-orange-100 text-orange-800"
      case "entregador": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Função para filtrar pessoas com base nos critérios de busca
  const filtrarPessoas = (pessoasList: Pessoa[]) => {
    return pessoasList.filter(pessoa => {
      const nomeMatch = !filtros.nome || pessoa.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      const cpfMatch = !filtros.cpf || pessoa.cpf.replace(/\D/g, "").includes(filtros.cpf.replace(/\D/g, ""))
      
      // Busca em todas as unidades da pessoa
      const unidadeMatch = !filtros.unidade || pessoa.unidades.some(unidade => 
        unidade.toLowerCase().includes(filtros.unidade.toLowerCase())
      )
      
      // Busca específica por apartamento
      const apartamentoMatch = !filtros.apartamento || pessoa.unidades.some(unidade => 
        unidade.toLowerCase().includes("apto") && unidade.toLowerCase().includes(filtros.apartamento.toLowerCase())
      ) || pessoa.unidades.some(unidade => 
        unidade.toLowerCase().includes("apartamento") && unidade.toLowerCase().includes(filtros.apartamento.toLowerCase())
      )
      
      // Busca específica por casa
      const casaMatch = !filtros.casa || pessoa.unidades.some(unidade => 
        unidade.toLowerCase().includes("casa") && unidade.toLowerCase().includes(filtros.casa.toLowerCase())
      )
      
      return nomeMatch && cpfMatch && unidadeMatch && apartamentoMatch && casaMatch
    })
  }

  const pessoasPorTipo = {
    proprietario: filtrarPessoas(pessoas.filter(p => p.tipo === "proprietario")),
    morador: filtrarPessoas(pessoas.filter(p => p.tipo === "morador")),
    funcionario: filtrarPessoas(pessoas.filter(p => p.tipo === "funcionario")),
    "prestador-servico": filtrarPessoas(pessoas.filter(p => p.tipo === "prestador-servico")),
    entregador: filtrarPessoas(pessoas.filter(p => p.tipo === "entregador"))
  }

  const limparFiltros = () => {
    setFiltros({
      nome: "",
      cpf: "",
      unidade: "",
      apartamento: "",
      casa: ""
    })
  }

  const renderBuscaAvancada = () => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Busca Avançada
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBuscaAvancada(!showBuscaAvancada)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showBuscaAvancada ? "Ocultar" : "Mostrar"} Filtros
          </Button>
        </div>
      </CardHeader>
      {showBuscaAvancada && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtro-nome">Nome</Label>
              <Input
                id="filtro-nome"
                placeholder="Buscar por nome..."
                value={filtros.nome}
                onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtro-cpf">CPF</Label>
              <Input
                id="filtro-cpf"
                placeholder="Buscar por CPF..."
                value={filtros.cpf}
                onChange={(e) => setFiltros({ ...filtros, cpf: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtro-unidade">Unidade (Geral)</Label>
              <Input
                id="filtro-unidade"
                placeholder="Buscar por unidade..."
                value={filtros.unidade}
                onChange={(e) => setFiltros({ ...filtros, unidade: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtro-apartamento">Apartamento</Label>
              <Input
                id="filtro-apartamento"
                placeholder="Buscar por apartamento..."
                value={filtros.apartamento}
                onChange={(e) => setFiltros({ ...filtros, apartamento: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtro-casa">Casa</Label>
              <Input
                id="filtro-casa"
                placeholder="Buscar por casa..."
                value={filtros.casa}
                onChange={(e) => setFiltros({ ...filtros, casa: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={limparFiltros}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )

  const renderTabela = (pessoasTipo: Pessoa[]) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {getTipoLabel(activeTab)} ({pessoasTipo.length})
        </h3>
        {permissoes.incluir ? (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm()
                  setFormData({ ...formData, tipo: activeTab as Pessoa["tipo"] })
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar {getTipoLabel(activeTab)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPessoa ? 
                  (permissoes.editar ? "Editar" : "Visualizar") : 
                  "Adicionar"
                } {getTipoLabel(activeTab)}
              </DialogTitle>
              <DialogDescription>
                {editingPessoa && !permissoes.editar ? 
                  "Visualizando informações da pessoa (somente leitura)." :
                  "Preencha as informações da pessoa."
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Digite o nome completo"
                    disabled={editingPessoa && !permissoes.editar}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatarCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    disabled={editingPessoa && !permissoes.editar}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    disabled={editingPessoa && !permissoes.editar}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    disabled={editingPessoa && !permissoes.editar}
                  />
                </div>
              </div>

              <div>
                <Label>Unidades (Apartamento/Casa/Sala)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={novaUnidade}
                    onChange={(e) => setNovaUnidade(e.target.value)}
                    placeholder="Ex: Apto 101, Casa 5, Sala 203"
                    onKeyPress={(e) => e.key === 'Enter' && adicionarUnidade()}
                    disabled={editingPessoa && !permissoes.editar}
                  />
                  <Button 
                    type="button" 
                    onClick={adicionarUnidade}
                    disabled={editingPessoa && !permissoes.editar}
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.unidades?.map((unidade, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {unidade}
                      {(!editingPessoa || permissoes.editar) && (
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removerUnidade(unidade)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Veículos (Máximo 3)
                </Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <Input
                        placeholder="Placa (ABC-1234)"
                        value={novoVeiculo.placa}
                        onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: formatarPlaca(e.target.value) })}
                        maxLength={8}
                        disabled={editingPessoa && !permissoes.editar}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Modelo"
                        value={novoVeiculo.modelo}
                        onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                        disabled={editingPessoa && !permissoes.editar}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Cor"
                        value={novoVeiculo.cor}
                        onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })}
                        disabled={editingPessoa && !permissoes.editar}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={novoVeiculo.tipo}
                        onValueChange={(value) => setNovoVeiculo({ ...novoVeiculo, tipo: value as Veiculo["tipo"] })}
                        disabled={editingPessoa && !permissoes.editar}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="carro">Carro</SelectItem>
                          <SelectItem value="moto">Moto</SelectItem>
                          <SelectItem value="bicicleta">Bicicleta</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        onClick={adicionarVeiculo}
                        disabled={editingPessoa && !permissoes.editar || (formData.veiculos?.length || 0) >= 3}
                        title={"Adicionar veículo"}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {formData.veiculos && formData.veiculos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Veículos cadastrados:</p>
                      <div className="space-y-2">
                        {formData.veiculos.map((veiculo) => (
                          <div key={veiculo.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Badge className={getTipoVeiculoColor(veiculo.tipo)}>
                                {getTipoVeiculoIcon(veiculo.tipo)}
                                <span className="ml-1">{getTipoVeiculoLabel(veiculo.tipo)}</span>
                              </Badge>
                              <div>
                                <p className="font-medium">{veiculo.placa}</p>
                                <p className="text-sm text-gray-600">{veiculo.modelo} - {veiculo.cor}</p>
                              </div>
                            </div>
                            {(!editingPessoa || permissoes.editar) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removerVeiculo(veiculo.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Remover veículo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(formData.veiculos?.length || 0) >= 3 && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      Limite máximo de 3 veículos atingido.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="foto">Foto</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="flex-1"
                    disabled={editingPessoa && !permissoes.editar}
                  />
                  {formData.foto && (
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={formData.foto} />
                      <AvatarFallback>{formData.nome?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais..."
                  rows={3}
                  disabled={editingPessoa && !permissoes.editar}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {editingPessoa && !permissoes.editar ? "Fechar" : "Cancelar"}
              </Button>
              {(!editingPessoa && permissoes.incluir) || (editingPessoa && permissoes.editar) ? (
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingPessoa ? "Atualizar" : "Salvar"}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Sem permissão para adicionar</span>
          </div>
        )}
      </div>

      {pessoasTipo.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum {getTipoLabel(activeTab).toLowerCase()} cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Veículos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pessoasTipo.map((pessoa) => (
                  <TableRow key={pessoa.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={pessoa.foto} />
                          <AvatarFallback>{pessoa.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{pessoa.nome}</p>
                          {pessoa.email && (
                            <p className="text-sm text-gray-500">{pessoa.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{pessoa.cpf}</TableCell>
                    <TableCell>{pessoa.telefone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pessoa.unidades.map((unidade, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Building className="w-3 h-3 mr-1" />
                            {unidade}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pessoa.veiculos && pessoa.veiculos.length > 0 ? (
                          pessoa.veiculos.map((veiculo, index) => (
                            <Badge key={index} variant="outline" className={`text-xs ${getTipoVeiculoColor(veiculo.tipo)}`}>
                              {getTipoVeiculoIcon(veiculo.tipo)}
                              <span className="ml-1">{veiculo.placa}</span>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Nenhum</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={pessoa.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {pessoa.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {permissoes.editar ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pessoa)}
                            title="Editar pessoa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        ) : permissoes.visualizar ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pessoa)}
                            title="Visualizar pessoa (somente leitura)"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : null}
                        
                        {permissoes.excluir ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(pessoa.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Excluir pessoa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : null}
                        
                        {!permissoes.editar && !permissoes.excluir && !permissoes.visualizar && (
                          <div className="flex items-center text-gray-400">
                            <Lock className="w-4 h-4" title="Sem permissões" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Verificar se o usuário tem acesso
  if (!temAlgumaPermissao) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-500">Você não tem permissão para acessar o gerenciamento de pessoas.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Pessoas</h2>
        <div className="flex gap-2">
          {Object.entries(pessoasPorTipo).map(([tipo, lista]) => (
            <Badge key={tipo} className={getTipoColor(tipo)}>
              {getTipoIcon(tipo)}
              <span className="ml-1">{getTipoLabel(tipo)}: {lista.length}</span>
            </Badge>
          ))}
        </div>
      </div>

      {renderBuscaAvancada()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="proprietario" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Proprietários
          </TabsTrigger>
          <TabsTrigger value="morador" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Moradores
          </TabsTrigger>
          <TabsTrigger value="funcionario" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger value="prestador-servico" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Prestadores
          </TabsTrigger>
          <TabsTrigger value="entregador" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Entregadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proprietario">
          {renderTabela(pessoasPorTipo.proprietario)}
        </TabsContent>
        
        <TabsContent value="morador">
          {renderTabela(pessoasPorTipo.morador)}
        </TabsContent>
        
        <TabsContent value="funcionario">
          {renderTabela(pessoasPorTipo.funcionario)}
        </TabsContent>
        
        <TabsContent value="prestador-servico">
          {renderTabela(pessoasPorTipo["prestador-servico"])}
        </TabsContent>
        
        <TabsContent value="entregador">
          {renderTabela(pessoasPorTipo.entregador)}
        </TabsContent>
      </Tabs>
    </div>
  )
}