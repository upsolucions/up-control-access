"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Image, Trash2, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Logo {
  id: string
  nome: string
  url: string
  tipo: 'principal' | 'secundario' | 'favicon' | 'pdf'
  ativo: boolean
  dataCriacao: Date
  tamanho?: number
}

export default function GerenciarLogos() {
  const [logos, setLogos] = useState<Logo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'principal' as const,
    ativo: true,
    tamanho: 300
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const { canManageLogo } = useAuth()

  useEffect(() => {
    // Carregar logos do localStorage
    const savedLogos = localStorage.getItem('logos')
    if (savedLogos) {
      setLogos(JSON.parse(savedLogos))
    } else {
      // Logo padrão
      const defaultLogo: Logo = {
        id: '1',
        nome: 'Logo Principal',
        url: '/placeholder.svg?height=100&width=200',
        tipo: 'principal',
        ativo: true,
        dataCriacao: new Date()
      }
      setLogos([defaultLogo])
      localStorage.setItem('logos', JSON.stringify([defaultLogo]))
    }
  }, [])

  const cleanupBeforeSave = () => {
    try {
      // Verificar espaço disponível no localStorage
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length
        }
      }
      
      // Se estiver próximo do limite (> 3.5MB), limpar dados menos críticos
      if (totalSize > 3.5 * 1024 * 1024) {
        const keysToClean = [
          'dispositivos',
          'relatoriosProblemas',
          'ordensServico',
          'auditoria',
          'sessoes'
        ]
        
        keysToClean.forEach(key => {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const parsed = JSON.parse(data)
              if (Array.isArray(parsed) && parsed.length > 20) {
                localStorage.setItem(key, JSON.stringify(parsed.slice(-20)))
              }
            } catch (e) {
              localStorage.removeItem(key)
            }
          }
        })
      }
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error)
    }
  }

  const saveLogos = (newLogos: Logo[]) => {
    try {
      // Limpar espaço antes de salvar
      cleanupBeforeSave()
      
      setLogos(newLogos)
      localStorage.setItem('logos', JSON.stringify(newLogos))
    } catch (error) {
      console.error('Erro ao salvar logos:', error)
      
      // Tentar limpar mais dados e salvar novamente
      try {
        cleanupBeforeSave()
        // Remover logos inativos antigos
        const activeLogos = newLogos.filter(logo => logo.ativo || 
          new Date().getTime() - new Date(logo.dataCriacao).getTime() < 7 * 24 * 60 * 60 * 1000)
        localStorage.setItem('logos', JSON.stringify(activeLogos))
        setLogos(activeLogos)
      } catch (secondError) {
        alert('Erro ao salvar: Espaço de armazenamento insuficiente. Tente uma imagem menor ou limpe o cache do navegador.')
      }
    }
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = document.createElement('img')
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Converter para base64 com qualidade reduzida
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        
        // Limpar URL do objeto para evitar vazamentos de memória
        URL.revokeObjectURL(img.src)
        resolve(compressedDataUrl)
      }
      
      img.onerror = (error) => {
        URL.revokeObjectURL(img.src)
        reject(error)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Selecione uma imagem menor que 5MB.')
        return
      }
      
      setSelectedFile(file)
      
      try {
        // Comprimir imagem para evitar problemas de quota
        const compressedUrl = await compressImage(file)
        setPreviewUrl(compressedUrl)
      } catch (error) {
        console.error('Erro ao processar imagem:', error)
        alert('Erro ao processar imagem. Tente outro arquivo.')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile && !editingLogo) {
      alert('Selecione um arquivo de imagem')
      return
    }

    const logoData: Logo = {
      id: editingLogo?.id || Date.now().toString(),
      nome: formData.nome,
      url: previewUrl || editingLogo?.url || '',
      tipo: formData.tipo,
      ativo: formData.ativo,
      dataCriacao: editingLogo?.dataCriacao || new Date(),
      tamanho: formData.tamanho
    }

    if (editingLogo) {
      const updatedLogos = logos.map(logo => 
        logo.id === editingLogo.id ? logoData : logo
      )
      saveLogos(updatedLogos)
    } else {
      saveLogos([...logos, logoData])
    }

    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingLogo(null)
    setFormData({
      nome: '',
      tipo: 'principal',
      ativo: true,
      tamanho: 300
    })
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const handleEdit = (logo: Logo) => {
    setEditingLogo(logo)
    setFormData({
      nome: logo.nome,
      tipo: logo.tipo,
      ativo: logo.ativo,
      tamanho: logo.tamanho || 300
    })
    setPreviewUrl(logo.url)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este logo?')) {
      const filteredLogos = logos.filter(logo => logo.id !== id)
      saveLogos(filteredLogos)
    }
  }

  const toggleActive = (id: string) => {
    const updatedLogos = logos.map(logo => 
      logo.id === id ? { ...logo, ativo: !logo.ativo } : logo
    )
    saveLogos(updatedLogos)
  }

  if (!canManageLogo()) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Acesso negado. Apenas administradores master podem gerenciar logos.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Logos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Upload className="h-4 w-4 mr-2" />
          ADM
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLogo ? 'Editar Logo' : 'Novo Logo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Logo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Logo Principal"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    className="w-full p-2 border rounded"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  >
                    <option value="principal">Principal</option>
                    <option value="secundario">Secundário</option>
                    <option value="favicon">Favicon</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Arquivo de Imagem</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ width: `${formData.tamanho}px`, height: 'auto' }}
                      className="object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamanho">Tamanho do Logo (px)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="tamanho"
                    type="number"
                    min="200"
                    max="1000"
                    value={formData.tamanho}
                    onChange={(e) => setFormData({ ...formData, tamanho: parseInt(e.target.value) || 300 })}
                    className="w-24"
                  />
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    value={formData.tamanho}
                    onChange={(e) => setFormData({ ...formData, tamanho: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 w-16">{formData.tamanho}px</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <Label htmlFor="ativo">Logo Ativo</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingLogo ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map((logo) => (
          <Card key={logo.id} className={!logo.ativo ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{logo.nome}</h3>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(logo)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(logo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <img
                    src={logo.url}
                    alt={logo.nome}
                    style={{ width: `${logo.tamanho || 300}px`, height: 'auto', maxWidth: '100%' }}
                    className="object-contain"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="capitalize">{logo.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanho:</span>
                    <span>{logo.tamanho || 300}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Button
                      size="sm"
                      variant={logo.ativo ? 'default' : 'secondary'}
                      onClick={() => toggleActive(logo.id)}
                    >
                      {logo.ativo ? 'Ativo' : 'Inativo'}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 border-t pt-2">
                    Criado em: {new Date(logo.dataCriacao).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {logos.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum logo encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}