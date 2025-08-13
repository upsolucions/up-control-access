"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, User, Eye, EyeOff, Upload, Image } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LoginProps {
  onLoginSuccess: () => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoAtivo, setLogoAtivo] = useState<string | null>(null)
  const [showLogoUpload, setShowLogoUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const { login } = useAuth()

  useEffect(() => {
    // Carregar logo ativo do localStorage
    const savedLogos = localStorage.getItem('logos')
    if (savedLogos) {
      const logos = JSON.parse(savedLogos)
      const logoPrincipal = logos.find((logo: any) => logo.tipo === 'principal' && logo.ativo)
      if (logoPrincipal) {
        setLogoAtivo(logoPrincipal.url)
      }
    }
  }, [])

  const resizeImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Converter para base64 com qualidade reduzida
        const resizedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(resizedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      try {
        // Redimensionar imagem para evitar problemas de quota no localStorage
        const resizedDataUrl = await resizeImage(file)
        setPreviewUrl(resizedDataUrl)
      } catch (error) {
        console.error('Erro ao processar imagem:', error)
        alert('Erro ao processar imagem. Tente uma imagem menor.')
      }
    }
  }

  const handleLogoUpload = () => {
    if (!selectedFile || !previewUrl) {
      alert('Selecione uma imagem primeiro')
      return
    }

    try {
      // Verificar tamanho da imagem antes de salvar
      const imageSizeKB = Math.round((previewUrl.length * 3) / 4 / 1024)
      if (imageSizeKB > 500) {
        alert('Imagem muito grande. Tente uma imagem menor ou com menor qualidade.')
        return
      }

      // Carregar logos existentes
      const savedLogos = localStorage.getItem('logos')
      let logos = savedLogos ? JSON.parse(savedLogos) : []
      
      // Limitar número de logos para evitar problemas de quota
      if (logos.length >= 10) {
        // Remover logos mais antigos
        logos = logos.slice(-5)
      }
      
      // Desativar logos principais existentes
      logos = logos.map((logo: any) => 
        logo.tipo === 'principal' ? { ...logo, ativo: false } : logo
      )
      
      // Adicionar novo logo
      const novoLogo = {
        id: Date.now().toString(),
        nome: `Logo Upload - ${selectedFile.name}`,
        url: previewUrl,
        tipo: 'principal',
        ativo: true,
        dataCriacao: new Date()
      }
      
      logos.push(novoLogo)
      
      // Tentar salvar no localStorage com tratamento de erro
      try {
        localStorage.setItem('logos', JSON.stringify(logos))
      } catch (storageError) {
        // Se falhar, tentar com menos logos
        logos = logos.slice(-3)
        localStorage.setItem('logos', JSON.stringify(logos))
      }
      
      // Atualizar estado
      setLogoAtivo(previewUrl)
      setShowLogoUpload(false)
      setSelectedFile(null)
      setPreviewUrl('')
      
      alert('Logo atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar logo:', error)
      if (error instanceof Error && error.message.includes('quota')) {
        alert('Erro: Espaço de armazenamento insuficiente. Tente uma imagem menor.')
      } else {
        alert('Erro ao salvar logo. Tente novamente.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, senha)
      if (result.success) {
        onLoginSuccess()
      } else {
        setError(result.message || 'Erro ao fazer login')
      }
    } catch (err) {
      console.error('Erro durante o login:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 relative group cursor-pointer">
            {logoAtivo ? (
              <img 
                src={logoAtivo} 
                alt="Logo" 
                className="mx-auto h-[200px] w-[200px] object-contain"
                onError={() => setLogoAtivo(null)}
              />
            ) : (
              <div className="mx-auto w-[200px] h-[200px] bg-blue-600 rounded-full flex items-center justify-center">
                <Lock className="h-16 w-16 text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowLogoUpload(!showLogoUpload)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Alterar logo"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
          
          {showLogoUpload && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-3">
                <Label htmlFor="logo-upload" className="text-sm font-medium">Fazer upload do logo</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm"
                />
                {previewUrl && (
                  <div className="text-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto max-h-12 max-w-32 object-contain border rounded"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleLogoUpload}
                    size="sm"
                    disabled={!selectedFile}
                  >
                    Salvar Logo
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowLogoUpload(false)
                      setSelectedFile(null)
                      setPreviewUrl('')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Up Control Access
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Faça login para acessar o sistema
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Usuários de exemplo:</p>
            <div className="mt-2 space-y-1 text-xs">
              <p><strong>Teste de Sistema:</strong> teste@sistema.com / admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}