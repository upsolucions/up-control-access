"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building, Plus, Edit, Trash2, Upload, Mail, Phone } from "lucide-react"

interface Bloco {
  id: string
  nome: string
  quantidadeApartamentos: number
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
}

export default function GerenciarCondominios() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null)
  const { canDeleteCondominio, canModifyData } = useAuth()
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
  })
  const [novoBloco, setNovoBloco] = useState({ nome: "", quantidadeApartamentos: 0 })

  useEffect(() => {
    // Carregar condomínios do localStorage
    const savedCondominios = localStorage.getItem("condominios")
    let condominiosData = null
    
    try {
      if (savedCondominios) {
        condominiosData = JSON.parse(savedCondominios)
        // Verificar se os dados têm a propriedade blocos
        if (condominiosData.length > 0 && !condominiosData[0].hasOwnProperty('blocos')) {
          // Dados antigos sem blocos, limpar localStorage
          localStorage.removeItem("condominios")
          condominiosData = null
        }
      }
    } catch (error) {
      // Erro ao parsear, limpar localStorage
      localStorage.removeItem("condominios")
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
          razaoSocial: "Condomínio Residencial Jardim das Flores LTDA",
          cnpj: "12.345.678/0001-90",
          endereco: "Rua das Flores, 123",
          cep: "01234-567",
          cidade: "São Paulo",
          estado: "SP",
          gerente: "João Silva",
          contato: "(11) 99999-9999",
          email: "gerencia@jardimflores.com.br",
          foto: "/placeholder.svg?height=100&width=100",
          observacoes: "Condomínio residencial com 120 apartamentos",
          ativo: true,
          dataCadastro: new Date("2023-01-15"),
          blocos: [
            { id: "1", nome: "Bloco A", quantidadeApartamentos: 60 },
            { id: "2", nome: "Bloco B", quantidadeApartamentos: 60 }
          ],
        },
        {
          id: "2",
          nome: "Condomínio Solar",
          razaoSocial: "Condomínio Solar Residencial LTDA",
          cnpj: "98.765.432/0001-10",
          endereco: "Av. do Sol, 456",
          cep: "04567-890",
          cidade: "São Paulo",
          estado: "SP",
          gerente: "Maria Santos",
          contato: "(11) 88888-8888",
          email: "administracao@condominiosolar.com.br",
          observacoes: "Condomínio com área de lazer completa",
          ativo: true,
          dataCadastro: new Date("2023-02-20"),
          blocos: [
            { id: "1", nome: "Torre 1", quantidadeApartamentos: 80 },
            { id: "2", nome: "Torre 2", quantidadeApartamentos: 80 }
          ],
        },
      ]
      setCondominios(exemploCondominios)
      localStorage.setItem("condominios", JSON.stringify(exemploCondominios))
    }
  }, [])

  const saveCondominios = (newCondominios: Condominio[]) => {
    setCondominios(newCondominios)
    localStorage.setItem("condominios", JSON.stringify(newCondominios))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCondominio) {
      // Atualizar condomínio existente
      const updatedCondominios = condominios.map((cond) =>
        cond.id === editingCondominio.id ? { ...cond, ...formData, dataCadastro: cond.dataCadastro } : cond,
      )
      saveCondominios(updatedCondominios)
    } else {
      // Adicionar novo condomínio
      const novoCondominio: Condominio = {
        id: Date.now().toString(),
        ...formData,
        dataCadastro: new Date(),
      }
      saveCondominios([...condominios, novoCondominio])
    }

    // Resetar formulário
    resetForm()
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
    })
    setNovoBloco({ nome: "", quantidadeApartamentos: 0 })
  }

  const adicionarBloco = () => {
    if (novoBloco.nome && novoBloco.quantidadeApartamentos > 0) {
      const bloco: Bloco = {
        id: Date.now().toString(),
        nome: novoBloco.nome,
        quantidadeApartamentos: novoBloco.quantidadeApartamentos,
      }
      setFormData({ ...formData, blocos: [...formData.blocos, bloco] })
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
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!canDeleteCondominio()) {
      alert('Apenas administradores master podem excluir condomínios.')
      return
    }
    if (confirm("Tem certeza que deseja excluir este condomínio?")) {
      const filteredCondominios = condominios.filter((cond) => cond.id !== id)
      saveCondominios(filteredCondominios)
    }
  }

  const buscarCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        // Simular busca de CEP
        const dadosCEP = {
          logradouro: "Rua Exemplo",
          bairro: "Centro",
          localidade: "São Paulo",
          uf: "SP",
        }

        setFormData({
          ...formData,
          endereco: dadosCEP.logradouro,
          cidade: dadosCEP.localidade,
          estado: dadosCEP.uf,
        })
      } catch (error) {
        alert("CEP não encontrado")
      }
    }
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatarCEP = (cep: string) => {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Condomínios</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ADM
        </Button>
      </div>

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
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, "")
                      setFormData({ ...formData, cep })
                      if (cep.length === 8) {
                        buscarCEP(cep)
                      }
                    }}
                    placeholder="00000-000"
                    maxLength={8}
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
                  <select
                    id="estado"
                    className="w-full p-2 border rounded"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    {/* Adicionar outros estados */}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gerente">Gerente/Síndico</Label>
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
                    placeholder="(11) 99999-9999"
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
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais sobre o condomínio"
                />
              </div>

              {/* Seção de Blocos */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Blocos do Condomínio</Label>
                
                {/* Lista de blocos existentes */}
                {formData.blocos.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Blocos Cadastrados:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.blocos.map((bloco) => (
                        <div key={bloco.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div>
                            <span className="font-medium">{bloco.nome}</span>
                            <span className="text-sm text-gray-600 ml-2">({bloco.quantidadeApartamentos} apartamentos)</span>
                          </div>
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
                  </div>
                )}
                
                {/* Formulário para adicionar novo bloco */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">Adicionar Novo Bloco:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="nomeBloco">Nome do Bloco</Label>
                      <Input
                        id="nomeBloco"
                        value={novoBloco.nome}
                        onChange={(e) => setNovoBloco({ ...novoBloco, nome: e.target.value })}
                        placeholder="Ex: Bloco A, Torre 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantidadeApartamentos">Quantidade de Apartamentos</Label>
                      <Input
                        id="quantidadeApartamentos"
                        type="number"
                        min="1"
                        value={novoBloco.quantidadeApartamentos || ""}
                        onChange={(e) => setNovoBloco({ ...novoBloco, quantidadeApartamentos: parseInt(e.target.value) || 0 })}
                        placeholder="Ex: 24"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={adicionarBloco}
                        disabled={!novoBloco.nome || novoBloco.quantidadeApartamentos <= 0}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Bloco
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foto do Condomínio</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" />
                  <Button type="button" size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <Label htmlFor="ativo">Condomínio Ativo</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editingCondominio ? "Atualizar" : "Cadastrar"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {condominios.map((condominio) => (
          <Card key={condominio.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
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
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{condominio.endereco}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">CEP:</span>
                    <span>{formatarCEP(condominio.cep)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">CNPJ:</span>
                    <span>{formatarCNPJ(condominio.cnpj)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Gerente:</span>
                    <span>{condominio.gerente}</span>
                  </div>
                  
                  {/* Exibição dos blocos */}
                  {condominio.blocos && condominio.blocos.length > 0 && (
                    <div className="pt-2 border-t">
                      <span className="font-medium text-sm">Blocos:</span>
                      <div className="mt-1 space-y-1">
                        {condominio.blocos.map((bloco) => (
                          <div key={bloco.id} className="flex justify-between items-center text-xs bg-gray-100 px-2 py-1 rounded">
                            <span className="font-medium">{bloco.nome}</span>
                            <span className="text-gray-600">{bloco.quantidadeApartamentos} apts</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Total: {condominio.blocos.reduce((total, bloco) => total + bloco.quantidadeApartamentos, 0)} apartamentos
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={condominio.ativo ? "default" : "secondary"}>
                    {condominio.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${condominio.email}`)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`tel:${condominio.contato}`)}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {condominio.observacoes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">{condominio.observacoes}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Cadastrado em: {new Date(condominio.dataCadastro).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {condominios.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum condomínio cadastrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
