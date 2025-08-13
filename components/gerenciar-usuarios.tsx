"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Plus, Edit, Trash2, Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  perfil: "admin_geral" | "gerente" | "operador" | "sindico" | "teste-sistema"
  condominioId?: string
  foto?: string
  ativo: boolean
  permissoes: string[]
}

interface Props {
  usuarios: Usuario[]
  setUsuarios: (usuarios: Usuario[]) => void
  usuarioLogado: Usuario
  condominios: any[]
}

export default function GerenciarUsuarios({ usuarios, setUsuarios, usuarioLogado, condominios }: Props) {
  const { canModifyData } = useAuth()
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "sindico" as const,
    condominioId: "",
    foto: "",
    ativo: true,
    permissoes: [] as string[],
  })

  const [editandoUsuario, setEditandoUsuario] = useState<string | null>(null)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string[]>([])

  const permissoesDisponiveis = ["relatorios", "ordem_servico", "monitoramento", "dispositivos", "usuarios"]

  const adicionarUsuario = () => {
    if (novoUsuario.nome && novoUsuario.email && novoUsuario.senha) {
      const usuario: Usuario = {
        id: Date.now().toString(),
        ...novoUsuario,
      }
      setUsuarios([...usuarios, usuario])
      setNovoUsuario({
        nome: "",
        email: "",
        senha: "",
        perfil: "cliente",
        condominioId: "",
        foto: "",
        ativo: true,
        permissoes: [],
      })
    }
  }

  const excluirUsuarios = () => {
    if (usuarioSelecionado.length > 0) {
      const novosUsuarios = usuarios.filter((u) => !usuarioSelecionado.includes(u.id))
      setUsuarios(novosUsuarios)
      setUsuarioSelecionado([])
    }
  }

  const alternarSelecao = (userId: string) => {
    setUsuarioSelecionado((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selecionarTodos = () => {
    const todosIds = usuarios.map((u) => u.id)
    setUsuarioSelecionado(usuarioSelecionado.length === usuarios.length ? [] : todosIds)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        {usuarioLogado.perfil === "admin_geral" && usuarioSelecionado.length > 0 && canModifyData() && (
          <Button variant="destructive" onClick={excluirUsuarios}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Selecionados ({usuarioSelecionado.length})
          </Button>
        )}
      </div>

      {/* Formulário para adicionar usuário */}
      {(usuarioLogado.perfil === "admin_geral" || usuarioLogado.perfil === "admin_local") && canModifyData() && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  placeholder="Digite o e-mail"
                />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  placeholder="Digite a senha"
                />
              </div>
              <div>
                <Label htmlFor="perfil">Perfil</Label>
                <select
                  id="perfil"
                  className="w-full p-2 border rounded"
                  value={novoUsuario.perfil}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, perfil: e.target.value as any })}
                >
                  {usuarioLogado.perfil === "admin_geral" && (
                    <>
                      <option value="admin_local">Administrador Local</option>
                      <option value="operador">Operador</option>
                    </>
                  )}
                  <option value="cliente">Cliente</option>
                </select>
              </div>
              <div>
                <Label htmlFor="condominio">Condomínio</Label>
                <select
                  id="condominio"
                  className="w-full p-2 border rounded"
                  value={novoUsuario.condominioId}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, condominioId: e.target.value })}
                >
                  <option value="">Selecione um condomínio</option>
                  {condominios.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="foto">Foto do Usuário</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" />
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Permissões específicas */}
            <div>
              <Label>Permissões Específicas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {permissoesDisponiveis.map((permissao) => (
                  <div key={permissao} className="flex items-center space-x-2">
                    <Checkbox
                      id={permissao}
                      checked={novoUsuario.permissoes.includes(permissao)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNovoUsuario({
                            ...novoUsuario,
                            permissoes: [...novoUsuario.permissoes, permissao],
                          })
                        } else {
                          setNovoUsuario({
                            ...novoUsuario,
                            permissoes: novoUsuario.permissoes.filter((p) => p !== permissao),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={permissao} className="text-sm">
                      {permissao.replace("_", " ").toUpperCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={adicionarUsuario}>
              <Plus className="h-4 w-4 mr-2" />
              ADM
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Usuários Cadastrados</CardTitle>
            {usuarioLogado.perfil === "admin_geral" && (
              <div className="flex items-center space-x-2">
                <Checkbox checked={usuarioSelecionado.length === usuarios.length} onCheckedChange={selecionarTodos} />
                <Label className="text-sm">Selecionar Todos</Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usuarios
              .filter((u) => usuarioLogado.perfil === "admin_geral" || u.condominioId === usuarioLogado.condominioId)
              .map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {usuarioLogado.perfil === "admin_geral" && (
                      <Checkbox
                        checked={usuarioSelecionado.includes(usuario.id)}
                        onCheckedChange={() => alternarSelecao(usuario.id)}
                      />
                    )}
                    <Avatar>
                      <AvatarImage src={usuario.foto || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{usuario.nome}</h3>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={usuario.ativo ? "default" : "secondary"}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline">{usuario.perfil.replace("_", " ").toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(usuarioLogado.perfil === "admin_geral" || usuarioLogado.perfil === "admin_local") && canModifyData() && (
                      <>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
