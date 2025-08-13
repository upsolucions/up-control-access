"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "../contexts/AuthContext"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Building, User, Users, MapPin, Phone, Mail, FileText, Camera } from "lucide-react"
import { registrarAtividadeAuditoria } from './sistema-auditoria'

interface Bloco {
  id: string
  nome: string
  quantidadeApartamentos: number
}

interface Pessoa {
  id: string
  nome: string
  telefone: string
  cpf: string
  email: string
  foto?: string
  tipo: 'proprietario' | 'condomino'
}

interface Proprietario extends Pessoa {
  tipo: 'proprietario'
}

interface Condomino extends Pessoa {
  tipo: 'condomino'
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
  foto?: string
  observacoes?: string
  ativo: boolean
  dataCadastro: Date
  blocos: Bloco[]
  proprietarios: Proprietario[]
  condominos: Condomino[]
}

export default function GerenciarCondominiosCompleto() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null)
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null)
  const [showPessoaForm, setShowPessoaForm] = useState(false)
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null)
  const [tipoPessoa, setTipoPessoa] = useState<'proprietario' | 'condomino'>('proprietario')
  const { canDeleteCondominio, canModifyData, usuarioLogado } = useAuth()
  const usuarioAtual = usuarioLogado
  
  const [formData, setFormData] = useState({
    nome: "",
    razaoSocial: "",
    cnpj: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",
    gerente: "",
    contato: "",
    email: "",
    foto: "",
    observacoes: "",
    ativo: true,
    blocos: [] as Bloco[],
    proprietarios: [] as Proprietario[],
    condominos: [] as Condomino[],
  })
  
  const [pessoaFormData, setPessoaFormData] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
    foto: "",
  })
  
  const [novoBloco, setNovoBloco] = useState({ nome: "", quantidadeApartamentos: 0 })

  useEffect(() => {
    // Carregar condomínios do localStorage
    const savedCondominios = localStorage.getItem("condominios-completo")
    let condominiosData = null
    
    try {
      if (savedCondominios) {
        condominiosData = JSON.parse(savedCondominios)
        // Verificar se os dados têm a propriedade blocos
        if (condominiosData.length > 0 && !condominiosData[0].hasOwnProperty('blocos')) {
          // Dados antigos sem blocos, limpar localStorage
          localStorage.removeItem("condominios-completo")
          condominiosData = null
        }
      }
    } catch (error) {
      // Erro ao parsear, limpar localStorage
      localStorage.removeItem("condominios-completo")
      condominiosData = null
    }
    
    if (condominiosData) {
      setCondominios(condominiosData)
    } else {
      // Dados de exemplo
      const exemploCondominios: Condominio[] = [
        {
          id: "1",
          nome: "Residencial Jardim das Flores",
          razaoSocial: "Condomínio Jardim das Flores Ltda",
          cnpj: "12.345.678/0001-90",
          endereco: "Rua das Flores, 123",
          cep: "12345-678",
          cidade: "São Paulo",
          estado: "SP",
          gerente: "João Silva",
          contato: "(11) 99999-9999",
          email: "contato@jardimflores.com.br",
          foto: "/placeholder.svg?height=100&width=100",
          observacoes: "Condomínio residencial com 5 blocos",
          ativo: true,
          dataCadastro: new Date("2023-01-15"),
          blocos: [
            { id: "1", nome: "Bloco A", quantidadeApartamentos: 20 },
            { id: "2", nome: "Bloco B", quantidadeApartamentos: 20 },
          ],
          proprietarios: [
            {
              id: "1",
              nome: "Maria Santos",
              telefone: "(11) 88888-8888",
              cpf: "123.456.789-00",
              email: "maria@email.com",
              foto: "/placeholder.svg?height=50&width=50",
              tipo: 'proprietario'
            }
          ],
          condominos: [
            {
              id: "1",
              nome: "Pedro Oliveira",
              telefone: "(11) 77777-7777",
              cpf: "987.654.321-00",
              email: "pedro@email.com",
              foto: "/placeholder.svg?height=50&width=50",
              tipo: 'condomino'
            }
          ]
        },
      ]
      setCondominios(exemploCondominios)
      localStorage.setItem("condominios-completo", JSON.stringify(exemploCondominios))
    }
  }, [])

  const saveCondominios = (newCondominios: Condominio[]) => {
    setCondominios(newCondominios)
    localStorage.setItem("condominios-completo", JSON.stringify(newCondominios))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isEditing = !!editingCondominio
    let condominioProcessado: Condominio

    if (isEditing) {
      // Atualizar condomínio existente
      condominioProcessado = { ...editingCondominio, ...formData, dataCadastro: editingCondominio.dataCadastro }
      const updatedCondominios = condominios.map((cond) =>
        cond.id === editingCondominio.id ? condominioProcessado : cond,
      )
      saveCondominios(updatedCondominios)
    } else {
      // Adicionar novo condomínio
      condominioProcessado = {
        id: Date.now().toString(),
        ...formData,
        dataCadastro: new Date(),
      }
      saveCondominios([...condominios, condominioProcessado])
    }

    // Registrar atividade de auditoria
    registrarAtividadeAuditoria({
      tipo: isEditing ? 'edicao' : 'inclusao',
      entidade: 'condominio',
      detalhes: `${isEditing ? 'Editou' : 'Criou'} condomínio: ${condominioProcessado.nome}`,
      usuarioNome: usuarioAtual?.nome || 'Usuário não identificado',
      usuarioPerfil: usuarioAtual?.perfil || 'Perfil não identificado'
    })

    resetForm()
  }

  const handlePessoaSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCondominio) return

    const novaPessoa = {
      id: editingPessoa?.id || Date.now().toString(),
      ...pessoaFormData,
      tipo: tipoPessoa,
    }

    const updatedCondominios = condominios.map((cond) => {
      if (cond.id === selectedCondominio.id) {
        if (editingPessoa) {
          // Editar pessoa existente
          if (tipoPessoa === 'proprietario') {
            return {
              ...cond,
              proprietarios: cond.proprietarios.map((p) =>
                p.id === editingPessoa.id ? { ...novaPessoa, tipo: 'proprietario' as const } : p
              ),
            }
          } else {
            return {
              ...cond,
              condominos: cond.condominos.map((c) =>
                c.id === editingPessoa.id ? { ...novaPessoa, tipo: 'condomino' as const } : c
              ),
            }
          }
        } else {
          // Adicionar nova pessoa
          if (tipoPessoa === 'proprietario') {
            return {
              ...cond,
              proprietarios: [...cond.proprietarios, { ...novaPessoa, tipo: 'proprietario' as const }],
            }
          } else {
            return {
              ...cond,
              condominos: [...cond.condominos, { ...novaPessoa, tipo: 'condomino' as const }],
            }
          }
        }
      }
      return cond
    })

    saveCondominios(updatedCondominios)
    setSelectedCondominio(updatedCondominios.find(c => c.id === selectedCondominio.id) || null)
    resetPessoaForm()
  }

  const handleDelete = (id: string) => {
    if (canDeleteCondominio()) {
      const condominioExcluido = condominios.find(cond => cond.id === id)
      const updatedCondominios = condominios.filter((cond) => cond.id !== id)
      saveCondominios(updatedCondominios)
      
      // Registrar atividade de auditoria
      if (condominioExcluido) {
        registrarAtividadeAuditoria({
          tipo: 'exclusao',
          entidade: 'condominio',
          detalhes: `Excluiu condomínio: ${condominioExcluido.nome}`,
          usuarioNome: usuarioAtual?.nome || 'Usuário não identificado',
          usuarioPerfil: usuarioAtual?.perfil || 'Perfil não identificado'
        })
      }
    }
  }

  const handleDeletePessoa = (pessoaId: string, tipo: 'proprietario' | 'condomino') => {
    if (!selectedCondominio) return

    const updatedCondominios = condominios.map((cond) => {
      if (cond.id === selectedCondominio.id) {
        if (tipo === 'proprietario') {
          return {
            ...cond,
            proprietarios: cond.proprietarios.filter((p) => p.id !== pessoaId),
          }
        } else {
          return {
            ...cond,
            condominos: cond.condominos.filter((c) => c.id !== pessoaId),
          }
        }
      }
      return cond
    })

    saveCondominios(updatedCondominios)
    setSelectedCondominio(updatedCondominios.find(c => c.id === selectedCondominio.id) || null)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCondominio(null)
    setFormData({
      nome: "",
      razaoSocial: "",
      cnpj: "",
      endereco: "",
      cep: "",
      cidade: "",
      estado: "",
      gerente: "",
      contato: "",
      email: "",
      foto: "",
      observacoes: "",
      ativo: true,
      blocos: [],
      proprietarios: [],
      condominos: [],
    })
  }

  const resetPessoaForm = () => {
    setShowPessoaForm(false)
    setEditingPessoa(null)
    setPessoaFormData({
      nome: "",
      telefone: "",
      cpf: "",
      email: "",
      foto: "",
    })
  }

  const adicionarBloco = () => {
    if (novoBloco.nome && novoBloco.quantidadeApartamentos > 0) {
      setFormData({
        ...formData,
        blocos: [...formData.blocos, { id: Date.now().toString(), ...novoBloco }]
      })
      setNovoBloco({ nome: "", quantidadeApartamentos: 0 })
    }
  }

  const removerBloco = (blocoId: string) => {
    setFormData({
      ...formData,
      blocos: formData.blocos.filter(bloco => bloco.id !== blocoId)
    })
  }

  const handleEdit = (condominio: Condominio) => {
    setEditingCondominio(condominio)
    setFormData({
      nome: condominio.nome,
      razaoSocial: condominio.razaoSocial,
      cnpj: condominio.cnpj,
      endereco: condominio.endereco,
      cep: condominio.cep,
      cidade: condominio.cidade,
      estado: condominio.estado,
      gerente: condominio.gerente,
      contato: condominio.contato,
      email: condominio.email,
      foto: condominio.foto || "",
      observacoes: condominio.observacoes || "",
      ativo: condominio.ativo,
      blocos: condominio.blocos || [],
      proprietarios: condominio.proprietarios || [],
      condominos: condominio.condominos || [],
    })
    setShowForm(true)
  }

  const handleEditPessoa = (pessoa: Pessoa, tipo: 'proprietario' | 'condomino') => {
    setEditingPessoa(pessoa)
    setTipoPessoa(tipo)
    setPessoaFormData({
      nome: pessoa.nome,
      telefone: pessoa.telefone,
      cpf: pessoa.cpf,
      email: pessoa.email,
      foto: pessoa.foto || "",
    })
    setShowPessoaForm(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'condominio' | 'pessoa') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (tipo === 'condominio') {
          setFormData({ ...formData, foto: result })
        } else {
          setPessoaFormData({ ...pessoaFormData, foto: result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatarCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatarTelefone = (telefone: string) => {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Condomínios Completo</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Condomínio
        </Button>
      </div>

      {/* Formulário de Condomínio */}
      {showForm && canModifyData() && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCondominio ? "Editar Condomínio" : "Novo Condomínio"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Condomínio</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    required
                  />
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
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="SP"
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gerente">Gerente</Label>
                  <Input
                    id="gerente"
                    value={formData.gerente}
                    onChange={(e) => setFormData({ ...formData, gerente: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato">Contato</Label>
                  <Input
                    id="contato"
                    value={formData.contato}
                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                    placeholder="(00) 00000-0000"
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foto">Foto do Condomínio</Label>
                <Input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'condominio')}
                />
                {formData.foto && (
                  <img src={formData.foto} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
              </div>

              {/* Seção de Blocos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Blocos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nome do bloco"
                    value={novoBloco.nome}
                    onChange={(e) => setNovoBloco({ ...novoBloco, nome: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Qtd. apartamentos"
                    value={novoBloco.quantidadeApartamentos}
                    onChange={(e) => setNovoBloco({ ...novoBloco, quantidadeApartamentos: parseInt(e.target.value) || 0 })}
                  />
                  <Button type="button" onClick={adicionarBloco}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Bloco
                  </Button>
                </div>
                
                {formData.blocos.length > 0 && (
                  <div className="space-y-2">
                    {formData.blocos.map((bloco) => (
                      <div key={bloco.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{bloco.nome} - {bloco.quantidadeApartamentos} apartamentos</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removerBloco(bloco.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingCondominio ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Condomínios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {condominios.map((condominio) => (
          <Card key={condominio.id} className={!condominio.ativo ? "opacity-50" : ""}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {condominio.foto && (
                    <img
                      src={condominio.foto || "/placeholder.svg"}
                      alt={condominio.nome}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{condominio.nome}</h3>
                    <p className="text-sm text-gray-600">{condominio.razaoSocial}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* Botão Gerenciar Pessoas - Disponível para perfis específicos */}
                  {(usuarioLogado?.perfil === "administrador-master" || 
                    usuarioLogado?.perfil === "administrador" || 
                    usuarioLogado?.perfil === "administrador-local" || 
                    usuarioLogado?.perfil === "operador") && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedCondominio(condominio)} title="Gerenciar Pessoas">
                          <Users className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Gerenciar Pessoas - {condominio.nome}</DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="proprietarios" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="proprietarios">Proprietários</TabsTrigger>
                            <TabsTrigger value="condominos">Condôminos</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="proprietarios" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">Proprietários</h3>
                              <Button
                                onClick={() => {
                                  setTipoPessoa('proprietario')
                                  setShowPessoaForm(true)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Proprietário
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedCondominio?.proprietarios.map((proprietario) => (
                                <Card key={proprietario.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <Avatar>
                                        <AvatarImage src={proprietario.foto} />
                                        <AvatarFallback>
                                          <User className="h-4 w-4" />
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <h4 className="font-medium">{proprietario.nome}</h4>
                                        <p className="text-sm text-gray-600">{formatarCPF(proprietario.cpf)}</p>
                                        <p className="text-sm text-gray-600">{formatarTelefone(proprietario.telefone)}</p>
                                        <p className="text-sm text-gray-600">{proprietario.email}</p>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditPessoa(proprietario, 'proprietario')}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeletePessoa(proprietario.id, 'proprietario')}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            
                            {selectedCondominio?.proprietarios.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum proprietário cadastrado</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="condominos" className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">Condôminos</h3>
                              <Button
                                onClick={() => {
                                  setTipoPessoa('condomino')
                                  setShowPessoaForm(true)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Condômino
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedCondominio?.condominos.map((condomino) => (
                                <Card key={condomino.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <Avatar>
                                        <AvatarImage src={condomino.foto} />
                                        <AvatarFallback>
                                          <User className="h-4 w-4" />
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <h4 className="font-medium">{condomino.nome}</h4>
                                        <p className="text-sm text-gray-600">{formatarCPF(condomino.cpf)}</p>
                                        <p className="text-sm text-gray-600">{formatarTelefone(condomino.telefone)}</p>
                                        <p className="text-sm text-gray-600">{condomino.email}</p>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditPessoa(condomino, 'condomino')}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDeletePessoa(condomino.id, 'condomino')}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            
                            {selectedCondominio?.condominos.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum condômino cadastrado</p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {canModifyData() && (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(condominio)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canModifyData() && (
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(condominio.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{formatarCNPJ(condominio.cnpj)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{condominio.endereco}, {condominio.cidade}/{condominio.estado}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{formatarTelefone(condominio.contato)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{condominio.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Gerente: {condominio.gerente}</span>
                  </div>
                  {condominio.blocos.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{condominio.blocos.length} bloco(s)</span>
                    </div>
                  )}
                  {condominio.observacoes && (
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-xs">{condominio.observacoes}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de Pessoa */}
      {showPessoaForm && (
        <Dialog open={showPessoaForm} onOpenChange={setShowPessoaForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPessoa ? "Editar" : "Adicionar"} {tipoPessoa === 'proprietario' ? 'Proprietário' : 'Condômino'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePessoaSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pessoaNome">Nome</Label>
                <Input
                  id="pessoaNome"
                  value={pessoaFormData.nome}
                  onChange={(e) => setPessoaFormData({ ...pessoaFormData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoaTelefone">Telefone</Label>
                <Input
                  id="pessoaTelefone"
                  value={pessoaFormData.telefone}
                  onChange={(e) => setPessoaFormData({ ...pessoaFormData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoaCpf">CPF</Label>
                <Input
                  id="pessoaCpf"
                  value={pessoaFormData.cpf}
                  onChange={(e) => setPessoaFormData({ ...pessoaFormData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoaEmail">E-mail</Label>
                <Input
                  id="pessoaEmail"
                  type="email"
                  value={pessoaFormData.email}
                  onChange={(e) => setPessoaFormData({ ...pessoaFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoaFoto">Foto</Label>
                <Input
                  id="pessoaFoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'pessoa')}
                />
                {pessoaFormData.foto && (
                  <img src={pessoaFormData.foto} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingPessoa ? "Atualizar" : "Adicionar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetPessoaForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}