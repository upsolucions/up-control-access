"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Mail, MessageCircle, Edit, Trash2, Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface EmpresaFornecedora {
  id: string
  nome: string
  endereco: string
  email: string
  telefone: string
  whatsapp: string
  servicos: string
  observacoes?: string
  condominioId?: string
}

interface EmpresasFornecedorasProps {
  condominioId?: string
}

export default function EmpresasFornecedoras({ condominioId }: EmpresasFornecedorasProps) {
  const { canModifyData } = useAuth()
  const [empresas, setEmpresas] = useState<EmpresaFornecedora[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaFornecedora | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    email: "",
    telefone: "",
    whatsapp: "",
    servicos: "",
    observacoes: "",
    condominioId: condominioId || "",
  })

  useEffect(() => {
    // Carregar empresas do localStorage
    const savedEmpresas = localStorage.getItem("empresasFornecedoras")
    if (savedEmpresas) {
      let allEmpresas = JSON.parse(savedEmpresas)
      // Se condominioId for fornecido, filtrar apenas empresas desse condomínio
      if (condominioId) {
        allEmpresas = allEmpresas.filter((e: EmpresaFornecedora) => e.condominioId === condominioId)
      }
      setEmpresas(allEmpresas)
    }
  }, [condominioId])

  const saveEmpresas = (newEmpresas: EmpresaFornecedora[]) => {
    setEmpresas(newEmpresas)
    localStorage.setItem("empresasFornecedoras", JSON.stringify(newEmpresas))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEmpresa) {
      // Atualizar empresa existente
      const updatedEmpresas = empresas.map((emp) => (emp.id === editingEmpresa.id ? { ...emp, ...formData } : emp))
      saveEmpresas(updatedEmpresas)
    } else {
      // Adicionar nova empresa
      const newEmpresa = {
        id: Date.now().toString(),
        ...formData,
        condominioId: condominioId || formData.condominioId,
      }
      // Se condominioId for fornecido, salvar apenas no contexto local
      if (condominioId) {
        const allEmpresas = JSON.parse(localStorage.getItem("empresasFornecedoras") || "[]")
        const updatedAllEmpresas = [...allEmpresas, newEmpresa]
        localStorage.setItem("empresasFornecedoras", JSON.stringify(updatedAllEmpresas))
        setEmpresas([...empresas, newEmpresa])
      } else {
        saveEmpresas([...empresas, newEmpresa])
      }
    }

    // Resetar formulário
    setShowForm(false)
    setEditingEmpresa(null)
    setFormData({
      nome: "",
      endereco: "",
      email: "",
      telefone: "",
      whatsapp: "",
      servicos: "",
      observacoes: "",
      condominioId: condominioId || "",
    })
  }

  const handleEdit = (empresa: EmpresaFornecedora) => {
    setEditingEmpresa(empresa)
    setFormData({
      nome: empresa.nome,
      endereco: empresa.endereco,
      email: empresa.email,
      telefone: empresa.telefone,
      whatsapp: empresa.whatsapp,
      servicos: empresa.servicos,
      observacoes: empresa.observacoes || "",
      condominioId: empresa.condominioId || "",
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta empresa?")) {
      const filteredEmpresas = empresas.filter((emp) => emp.id !== id)
      saveEmpresas(filteredEmpresas)
    }
  }

  const enviarEmail = (email: string, nome: string) => {
    const subject = encodeURIComponent(`Contato - ${nome}`)
    const body = encodeURIComponent(
      `Olá ${nome},\n\nGostaria de solicitar um orçamento para serviços.\n\nAtenciosamente,`,
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }

  const enviarWhatsApp = (whatsapp: string, nome: string) => {
    const message = encodeURIComponent(`Olá ${nome}, gostaria de solicitar um orçamento para serviços.`)
    // Remover caracteres não numéricos
    const cleanWhatsapp = whatsapp.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanWhatsapp}?text=${message}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Empresas Fornecedoras</h2>
        {canModifyData() && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        )}
      </div>

      {showForm && canModifyData() && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEmpresa ? "Editar Empresa" : "Nova Empresa Fornecedora"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Empresa</Label>
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
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="5511999999999"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicos">Serviços Oferecidos</Label>
                <Textarea
                  id="servicos"
                  rows={3}
                  value={formData.servicos}
                  onChange={(e) => setFormData({ ...formData, servicos: e.target.value })}
                  placeholder="Ex: Instalação de câmeras, manutenção de leitores RFID, etc."
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
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editingEmpresa ? "Atualizar" : "Cadastrar"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingEmpresa(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {empresas.map((empresa) => (
          <Card key={empresa.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{empresa.nome}</h3>
                  <div className="flex space-x-2">
                    {canModifyData() && (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(empresa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canModifyData() && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(empresa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>{empresa.endereco}</p>
                  <p>{empresa.email}</p>
                  <p>{empresa.telefone}</p>
                  <p>WhatsApp: {empresa.whatsapp}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Serviços:</p>
                  <p className="text-sm text-gray-600">{empresa.servicos}</p>
                </div>

                {empresa.observacoes && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Observações:</p>
                    <p className="text-sm text-gray-600">{empresa.observacoes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => enviarEmail(empresa.email, empresa.nome)}
                    className="flex items-center space-x-1"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    <span>E-mail</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => enviarWhatsApp(empresa.whatsapp, empresa.nome)}
                    className="flex items-center space-x-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>WhatsApp</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {empresas.length === 0 && (
          <div className="col-span-2 text-center py-10 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma empresa fornecedora cadastrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
