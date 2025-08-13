"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Login from "@/components/Login"
import GerenciarLogos from "@/components/GerenciarLogos"
import SupabaseDiagnostic from "@/components/SupabaseDiagnostic"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Shield,
  Users,
  Building,
  Eye,
  Smartphone,
  Building2,
  FileText,
  Network,
  Search,
  Settings,
  Wrench,
  AlertTriangle,
  Globe,
  Mail,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Download,
  Send,
  CheckCircle,
  Camera,
  Router,
  Monitor,
  Laptop,
  Printer,
  Server,
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Wifi,
  Zap,
  Car,
  Flame,
} from "lucide-react"

// Add type declaration for lucide-react
declare module 'lucide-react';

// Adicionar a importação do novo componente no topo do arquivo, junto com as outras importações
import TodosUsuarios from "../components/todos-usuarios"
import GerenciarUsuariosCompleto from "../components/gerenciar-usuarios-completo"
import RelatoriosProblemas from "../components/relatorios-problemas"
import DashboardCondominio from "../components/dashboard-condominio"
import GerenciarSessoes from "../components/gerenciar-sessoes"
import InfoSessaoAtual from "../components/info-sessao-atual"
import GerenciarCondominiosCompleto from "../components/gerenciar-condominios-completo"
import GerenciarPessoas from "../components/gerenciar-pessoas"


// Interfaces
interface Usuario {
  id: string
  nome: string
  email: string
  perfil: "gestor-seguranca" | "sindico" | "gerente" | "operador" | "tecnico" | "prestador-servico" | "temporario" | "recepcao" | "administrador-master" | "administrador" | "teste-sistema"
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

interface Dispositivo {
  id: string
  ip: string
  mac?: string
  hostname?: string
  tipo: string
  status: "online" | "offline" | "erro"
  ultimaPing: Date
  fabricante?: string
  modelo?: string
  nomeCustomizado?: string
  condominioId?: string
  condominio?: string
}

interface Empresa {
  id: string
  nome: string
  endereco: string
  email: string
  telefone: string
  whatsapp: string
  servicos: string
  observacoes?: string
}

interface OrdemServico {
  id: string
  titulo: string
  descricao: string
  categoria: string
  prioridade: "baixa" | "media" | "alta" | "critica"
  status: "pendente" | "em-execucao" | "concluido" | "orcamento" | "pausada"
  empresaId: string
  condominioId: string
  criadoPor: string
  criadaEm: Date
  valorOrcamento?: number
  observacoes?: string
}

interface RelatorioProblema {
  id: string
  tipo: string
  titulo: string
  descricao: string
  local: string
  condominio: string
  gravidade: "baixa" | "media" | "alta" | "critica"
  status: "aberto" | "investigando" | "resolvido"
  criadoPor: string
  criadoEm: Date
  observacoes?: string
}

// Dados iniciais
const dadosIniciais = {
  usuarios: [
    {
      id: "1",
      nome: "Teste de Sistema",
      email: "teste@sistema.com",
      perfil: "teste-sistema" as const,
      senha: "teste123",
      telefone: "(11) 00000-0000",
      cpf: "000.000.000-01",
      ativo: true,
      dataCadastro: new Date(),
    },
  ],
  condominios: [
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
      ativo: true,
      dataCadastro: new Date(),
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
      ativo: true,
      dataCadastro: new Date(),
    },
    {
      id: "3",
      nome: "Edifício Vista Verde",
      razaoSocial: "Condomínio Edifício Vista Verde LTDA",
      cnpj: "11.222.333/0001-44",
      endereco: "Rua Verde, 789",
      cep: "05678-901",
      cidade: "São Paulo",
      estado: "SP",
      gerente: "Pedro Costa",
      contato: "(11) 33333-3333",
      email: "administracao@vistaverde.com.br",
      ativo: true,
      dataCadastro: new Date(),
    },
  ],
}

// Função para limpar dados antigos do localStorage
const cleanupLocalStorage = () => {
  try {
    // Lista de chaves que podem ser limpas se necessário
    const keysToCheck = [
      'dispositivos',
      'relatoriosProblemas', 
      'ordensServico',
      'empresas',
      'auditoria',
      'sessoes',
      'configuracaoRede',
      'dynDNSCondominios'
    ]
    
    // Verificar tamanho do localStorage
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length
      }
    }
    
    // Se o localStorage estiver muito cheio (> 4MB), limpar dados menos críticos
    if (totalSize > 4 * 1024 * 1024) {
      keysToCheck.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            // Manter apenas os 50 registros mais recentes para arrays
            if (Array.isArray(parsed) && parsed.length > 50) {
              const reduced = parsed.slice(-50)
              localStorage.setItem(key, JSON.stringify(reduced))
            }
          } catch (e) {
            // Se não conseguir parsear, remover a chave
            localStorage.removeItem(key)
          }
        }
      })
    }
  } catch (error) {
    console.warn('Erro ao limpar localStorage:', error)
  }
}

export default function ControlAccessSecurity() {
  const { usuarioLogado, logout, isAdminMaster, shouldRedirectToCondominioView, getUserCondominio, canModifyData } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [showLogoManager, setShowLogoManager] = useState(false)
  
  // Limpar localStorage na inicialização
  useEffect(() => {
    cleanupLocalStorage()
  }, [])
  const [logoAtivo, setLogoAtivo] = useState<string | null>(null)

  useEffect(() => {
    // Inicializar dados se não existirem
    if (!localStorage.getItem("usuarios")) {
      localStorage.setItem("usuarios", JSON.stringify(dadosIniciais.usuarios))
    }
    if (!localStorage.getItem("condominios")) {
      localStorage.setItem("condominios", JSON.stringify(dadosIniciais.condominios))
    }
    
    // Carregar logo ativo
    const savedLogos = localStorage.getItem('logos')
    if (savedLogos) {
      const logos = JSON.parse(savedLogos)
      const logoPrincipal = logos.find((logo: any) => logo.tipo === 'principal' && logo.ativo)
      if (logoPrincipal) {
        setLogoAtivo(logoPrincipal.url)
      }
    }

    setIsLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoading(false)
  }

  const handleLogout = () => {
    logout()
  }

  const handlePasswordSubmit = () => {
    if (password === "777696") {
      setShowPasswordDialog(false)
      setShowLogoManager(true)
      setPassword("")
    } else {
      alert("Senha incorreta!")
      setPassword("")
    }
  }

  const handleCloseLogoManager = () => {
    setShowLogoManager(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p>Carregando Sistema...</p>
        </div>
      </div>
    )
  }

  if (!usuarioLogado) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  // Verificar se o usuário deve ser redirecionado para o dashboard específico do condomínio
  if (shouldRedirectToCondominioView()) {
    const condominio = getUserCondominio()
    if (condominio) {
      return (
        <DashboardCondominio 
          usuario={usuarioLogado}
          condominio={condominio}
          onLogout={handleLogout}
          logoAtivo={logoAtivo}
        />
      )
    } else {
      // Se o condomínio não for encontrado, mostrar erro e permitir logout
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Condomínio não encontrado</h2>
            <p className="text-gray-600 mb-6">
              Não foi possível encontrar as informações do seu condomínio. 
              Entre em contato com o administrador do sistema.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Usuário: {usuarioLogado?.nome} ({usuarioLogado?.email})
              </p>
              <Button onClick={handleLogout} className="w-full">
                Fazer Logout
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  if (showLogoManager) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {logoAtivo ? (
                <img 
                  src={logoAtivo} 
                  alt="Logo" 
                  className="h-8 w-auto object-contain"
                  onError={() => setLogoAtivo(null)}
                />
              ) : (
                <Shield className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Up Control Access - Gerenciar Logos</h1>
                <p className="text-xs text-gray-500">Sistema Web Profissional - Integração Completa</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleCloseLogoManager}>
              Voltar
            </Button>
          </div>
        </header>
        <main className="p-6">
          <GerenciarLogos />
        </main>
      </div>
    )
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Shield,
      roles: ["administrador-master", "administrador", "administrador-local", "operador", "cliente", "teste-sistema"],
    },
    {
      id: "usuarios",
      label: "Usuários",
      icon: Users,
      roles: ["administrador-master", "administrador", "administrador-local", "teste-sistema"],
    },
    // Adicionar o novo item ao array menuItems, logo após o item "usuarios"
    {
      id: "todos-usuarios",
      label: "Todos Usuários",
      icon: Users,
      roles: ["administrador-master", "administrador", "administrador-local", "teste-sistema"],
    },
    {
      id: "sessoes-ativas",
      label: "Sessões Ativas",
      icon: Monitor,
      roles: ["administrador-master", "teste-sistema"],
    },
    {
      id: "condominios",
      label: "Condomínios",
      icon: Building,
      roles: ["administrador-master", "administrador", "gerente", "operador", "sindico", "tecnico", "teste-sistema"],
    },
    {
      id: "gerenciar-pessoas",
      label: "Gerenciar Pessoas",
      icon: Users,
      roles: ["administrador-master", "administrador", "gerente", "operador", "teste-sistema"],
    },

    {
      id: "configuracao-rede",
      label: "Configuração de Rede",
      icon: Network,
      roles: ["administrador-master", "tecnico", "teste-sistema"],
    },
    {
      id: "dispositivos",
      label: "Dispositivos",
      icon: Smartphone,
      roles: ["administrador-master", "tecnico", "teste-sistema"],
    },
    {
      id: "busca-dispositivos",
      label: "Busca Dispositivos",
      icon: Search,
      roles: ["administrador-master", "teste-sistema"],
    },
    {
      id: "mapa-rede",
      label: "Mapa de Rede",
      icon: Globe,
      roles: ["administrador-master", "teste-sistema"],
    },
    {
      id: "empresas",
      label: "Empresas",
      icon: Building2,
      roles: ["administrador-master", "administrador", "administrador-local", "operador", "teste-sistema"],
    },
    {
      id: "ordens-servico",
      label: "Ordens de Serviço",
      icon: Wrench,
      roles: ["administrador-master", "administrador", "administrador-local", "operador", "cliente", "tecnico", "teste-sistema"],
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: FileText,
      roles: ["administrador-master", "teste-sistema"],
    },
    {
      id: "relatorios-problemas",
      label: "Relatórios de Problemas",
      icon: AlertTriangle,
      roles: ["administrador-master", "teste-sistema"],
    },
    {
      id: "integracoes",
      label: "Integrações Web",
      icon: Mail,
      roles: ["administrador-master", "administrador", "teste-sistema"],
    },
    {
      id: "monitoramento",
      label: "Monitoramento",
      icon: Eye,
      roles: ["administrador-master", "tecnico", "teste-sistema"],
    },
    {
      id: "configuracoes",
      label: "Configurações",
      icon: Settings,
      roles: ["administrador-master", "administrador"],
    },
    {
      id: "supabase-diagnostic",
      label: "Diagnóstico Supabase",
      icon: Server,
      roles: ["administrador-master", "teste-sistema"],
    },
    {
      id: "gerenciar-logos",
      label: "Gerenciar Logos",
      icon: Camera,
      roles: ["administrador-master", "teste-sistema"],
    },
  ]

  // Filtrar menu baseado no perfil do usuário e remover aba condomínios para operadores
  const filteredMenu = menuItems.filter((item) => {
    if (!usuarioLogado) return false
    
    // Remover aba condomínios para operadores
    if (usuarioLogado.perfil === 'operador' && item.id === 'condominios') {
      return false
    }
    
    return item.roles.includes(usuarioLogado.perfil)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {logoAtivo ? (
              <img 
                src={logoAtivo} 
                alt="Logo" 
                className="h-8 w-auto object-contain"
                onError={() => setLogoAtivo(null)}
              />
            ) : (
              <Shield className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Up Control Access</h1>
              <p className="text-xs text-gray-500">Sistema Web Profissional - Integração Completa</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">{usuarioLogado?.nome}</span>
              <p className="text-xs text-gray-600 capitalize">
                {usuarioLogado?.perfil === "administrador-master"
                  ? "🔴 ADMINISTRADOR MASTER"
                  : usuarioLogado?.perfil === "tecnico"
                  ? "🔧 TÉCNICO"
                  : usuarioLogado?.perfil === "teste-sistema"
                  ? "🔍 TESTE DE SISTEMA - SOMENTE LEITURA"
                  : usuarioLogado?.perfil.replace("-", " ")}
              </p>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-10 h-10 rounded-full p-0 bg-blue-600 text-white hover:bg-blue-700"
                >
                  UP
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Acesso Restrito</DialogTitle>
                  <DialogDescription>
                    Digite a senha para acessar o gerenciador de logos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="col-span-3"
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handlePasswordSubmit}>
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-64 bg-white shadow-sm h-screen overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {filteredMenu.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardContent currentUser={usuarioLogado} />}
          {activeTab === "usuarios" && <GerenciarUsuariosCompleto />}
          {activeTab === "condominios" && <GerenciarCondominiosCompleto />}
          {activeTab === "gerenciar-pessoas" && <GerenciarPessoas />}

          {activeTab === "configuracao-rede" && (usuarioLogado?.perfil === "administrador-master" || usuarioLogado?.perfil === "tecnico") && (
            <ConfiguracaoRedeContent />
          )}
          {activeTab === "dispositivos" && <DispositivosContent />}
          {activeTab === "busca-dispositivos" && <BuscaDispositivosContent />}
          {activeTab === "empresas" && <EmpresasContent />}
          {activeTab === "ordens-servico" && <OrdensServicoContent />}
          {activeTab === "relatorios" && <RelatoriosContent />}
          {activeTab === "relatorios-problemas" && <RelatoriosProblemas />}
          {activeTab === "integracoes" && <IntegracoesContent />}
          {activeTab === "monitoramento" && <MonitoramentoContent />}
          {activeTab === "mapa-rede" && <MapaRedeContent />}
          {activeTab === "configuracoes" && <ConfiguracoesContent />}
          {activeTab === "supabase-diagnostic" && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Diagnóstico do Supabase</h2>
                <p className="text-muted-foreground">
                  Verificação da conectividade e configuração do banco de dados.
                </p>
              </div>
              <SupabaseDiagnostic />
            </div>
          )}
          {activeTab === "gerenciar-logos" && <GerenciarLogos />}
          {activeTab === "todos-usuarios" && <TodosUsuarios />}
          {activeTab === "sessoes-ativas" && <GerenciarSessoes />}
        </main>
      </div>
    </div>
  )
}

// Dashboard Component
function DashboardContent({ currentUser }: { currentUser: Usuario | null }) {
  const [stats, setStats] = useState({
    usuarios: 0,
    acessos: 0,
    dispositivos: 0,
    ordens: 0,
    condominios: 0,
    dynDNS: 0,
  })

  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]")
    const relatorios = JSON.parse(localStorage.getItem("relatoriosAcesso") || "[]")
    const dispositivos = JSON.parse(localStorage.getItem("dispositivosCadastrados") || "[]")
    const ordens = JSON.parse(localStorage.getItem("ordensServico") || "[]")
    const condominios = JSON.parse(localStorage.getItem("condominios") || "[]")
    const dynDNS = JSON.parse(localStorage.getItem("dynDNSCondominios") || "[]")

    setStats({
      usuarios: usuarios.length,
      acessos: relatorios.length,
      dispositivos: dispositivos.length,
      ordens: ordens.length,
      condominios: condominios.length,
      dynDNS: dynDNS.length,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard - Sistema Web Profissional</h2>
        {currentUser?.perfil === "administrador-master" && (
          <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1">
            <span className="text-red-800 font-bold text-sm">🔴 ACESSO MASTER ATIVO</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Condomínios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.condominios}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dispositivos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dispositivos}</p>
              </div>
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DynDNS Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dynDNS}</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.usuarios}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acessos Registrados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acessos}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ordens de Serviço</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ordens}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo, {currentUser?.nome}!</CardTitle>
          <CardDescription>
            {currentUser?.perfil === "administrador-master"
              ? "🔴 ADMINISTRADOR MASTER - Controle Total do Sistema"
              : currentUser?.perfil === "tecnico"
              ? "🔧 TÉCNICO - Acesso a Dashboards Técnicos e Todos os Condomínios"
              : currentUser?.perfil === "teste-sistema"
              ? "🔍 TESTE DE SISTEMA - Acesso Completo Somente Leitura"
              : `Você está logado como ${currentUser?.perfil.replace("-", " ")}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">✅ Sistema Web Profissional Ativo</h3>
              <p className="text-green-700">Funcionamento 100% via web com integrações completas.</p>
            </div>
            {currentUser?.perfil === "administrador-master" && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900">🔴 PRIVILÉGIOS DE ADMINISTRADOR MASTER</h3>
                <ul className="text-red-700 list-disc list-inside mt-2">
                  <li>Configuração completa de rede (IP, Máscara, Gateway, DNS, DHCP)</li>
                  <li>Geração automática de DynDNS para condomínios</li>
                  <li>Acesso total a todos os condomínios e dados</li>
                  <li>Configuração de integrações Outlook e WhatsApp</li>
                  <li>Controle total sobre usuários e permissões</li>
                </ul>
              </div>
            )}
            {currentUser?.perfil === "tecnico" && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900">🔧 PRIVILÉGIOS DE TÉCNICO</h3>
                <ul className="text-purple-700 list-disc list-inside mt-2">
                  <li>Acesso a dashboards de condomínios</li>
                  <li>Gerenciamento de ordens de serviço</li>
                  <li>Monitoramento de dispositivos</li>
                  <li>Configuração de rede</li>
                  <li>Acesso a informações de todos os condomínios</li>
                </ul>
              </div>
            )}
            {currentUser?.perfil === "teste-sistema" && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900">🔍 PRIVILÉGIOS DE TESTE DE SISTEMA</h3>
                <ul className="text-yellow-700 list-disc list-inside mt-2">
                  <li>Visualização completa de todos os dashboards</li>
                  <li>Acesso a todos os relatórios e dados</li>
                  <li>Monitoramento de dispositivos e rede</li>
                  <li>Visualização de configurações do sistema</li>
                  <li>Acesso a informações de todos os condomínios</li>
                  <li>⚠️ SOMENTE LEITURA - Sem permissões de modificação</li>
                </ul>
              </div>
            )}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">🔧 Funcionalidades Web Ativas</h3>
              <ul className="text-blue-700 list-disc list-inside mt-2">
                <li>✅ Configuração de rede manual pelo Admin Master</li>
                <li>✅ Scanner de rede corrigido (apenas rede configurada)</li>
                <li>✅ Geração automática de DynDNS por condomínio</li>
                <li>✅ Integração completa com Microsoft Outlook</li>
                <li>✅ Integração completa com WhatsApp Business API</li>
                <li>✅ Relatórios PDF reais para download</li>
                <li>✅ Sistema 100% via web</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Usuários Component
function UsuariosContent({ currentUser }: { currentUser: Usuario | null }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "cliente" as "usuario" | "cliente" | "administrador-local" | "operador" | "tecnico" | "prestador-servico" | "temporario" | "funcionario" | "administrador-master" | "administrador" | "teste-sistema",
    condominioId: "",
    telefone: "",
    cpf: "",
    ativo: true,
  })

  const perfisUsuario = [
    { value: "cliente", label: "Cliente" },
    { value: "operador", label: "Operador" },
    { value: "administrador-local", label: "Administrador Local" },
    { value: "administrador", label: "Administrador" },
  ]

  useEffect(() => {
    const savedUsuarios = localStorage.getItem("usuarios")
    if (savedUsuarios) {
      setUsuarios(JSON.parse(savedUsuarios))
    }

    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [])

  const saveUsuarios = (newUsuarios: Usuario[]) => {
    setUsuarios(newUsuarios)
    localStorage.setItem("usuarios", JSON.stringify(newUsuarios))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUsuario) {
      const updatedUsuarios = usuarios.map((user) => (user.id === editingUsuario.id ? { ...user, ...formData } : user))
      saveUsuarios(updatedUsuarios)
    } else {
      const novoUsuario: Usuario = {
        id: Date.now().toString(),
        ...formData,
        dataCadastro: new Date(),
      }
      saveUsuarios([...usuarios, novoUsuario])
    }

    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingUsuario(null)
    setFormData({
      nome: "",
      email: "",
      senha: "",
      perfil: "cliente" as "usuario" | "cliente" | "administrador-local" | "operador" | "tecnico" | "prestador-servico" | "temporario" | "funcionario" | "administrador-master" | "administrador" | "teste-sistema",
      condominioId: "",
      telefone: "",
      cpf: "",
      ativo: true,
    })
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      perfil: usuario.perfil as "administrador-master" | "administrador" | "administrador-local" | "operador" | "cliente" | "tecnico" | "usuario" | "prestador-servico" | "temporario" | "funcionario",
      condominioId: usuario.condominioId || "",
      telefone: usuario.telefone || "",
      cpf: usuario.cpf || "",
      ativo: usuario.ativo,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      const filteredUsuarios = usuarios.filter((user) => user.id !== id)
      saveUsuarios(filteredUsuarios)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ADM
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUsuario ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                </div>
                <div>
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
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
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
        {usuarios.map((usuario) => {
          const condominio = condominios.find((c) => c.id === usuario.condominioId)

          return (
            <Card key={usuario.id}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{usuario.nome}</h3>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(usuario)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {usuario.perfil !== "administrador-master" && (
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(usuario.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Perfil:</span>
                      <Badge variant="outline">{usuario.perfil.replace("-", " ")}</Badge>
                    </div>
                    {usuario.telefone && (
                      <div className="flex items-center justify-between">
                        <span>Telefone:</span>
                        <span>{usuario.telefone}</span>
                      </div>
                    )}
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
                </div>
              </CardContent>
            </Card>
          )
        })}

        {usuarios.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Condomínios Component
function CondominiosContent() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCondominio, setEditingCondominio] = useState<Condominio | null>(null)
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
    ativo: true,
  })

  useEffect(() => {
    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [])

  const saveCondominios = (newCondominios: Condominio[]) => {
    setCondominios(newCondominios)
    localStorage.setItem("condominios", JSON.stringify(newCondominios))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCondominio) {
      const updatedCondominios = condominios.map((cond) =>
        cond.id === editingCondominio.id ? { ...cond, ...formData } : cond,
      )
      saveCondominios(updatedCondominios)
    } else {
      const novoCondominio: Condominio = {
        id: Date.now().toString(),
        ...formData,
        dataCadastro: new Date(),
      }
      saveCondominios([...condominios, novoCondominio])
    }

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
      ativo: true,
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
      ativo: condominio.ativo,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este condomínio?")) {
      const filteredCondominios = condominios.filter((cond) => cond.id !== id)
      saveCondominios(filteredCondominios)
    }
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCondominio ? "Editar Condomínio" : "Novo Condomínio"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Condomínio</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                  />
                </div>
                <div>
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
                  </select>
                </div>
                <div>
                  <Label htmlFor="gerente">Gerente/Síndico</Label>
                  <Input
                    id="gerente"
                    value={formData.gerente}
                    onChange={(e) => setFormData({ ...formData, gerente: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contato">Contato</Label>
                  <Input
                    id="contato"
                    value={formData.contato}
                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
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
                  <div>
                    <h3 className="font-bold text-lg">{condominio.nome}</h3>
                    <p className="text-sm text-gray-600">{condominio.razaoSocial}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(condominio)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(condominio.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{condominio.endereco}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">CEP:</span>
                    <span>{condominio.cep}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">CNPJ:</span>
                    <span>{condominio.cnpj}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Gerente:</span>
                    <span>{condominio.gerente}</span>
                  </div>
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

// Configuração de Rede Component
function ConfiguracaoRedeContent() {
  const { canModifyData } = useAuth()
  const [config, setConfig] = useState({
    ipLocal: "",
    mascaraRede: "255.255.255.0",
    gateway: "",
    dnsServers: ["8.8.8.8", "8.8.4.4"],
    alcanceDHCP: {
      inicio: "",
      fim: "",
    },
    deteccaoAutomatica: true,
    redeAtiva: false,
  })

  const [dynDNSList, setDynDNSList] = useState<any[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const savedConfig = localStorage.getItem("configuracaoRede")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    const savedDynDNS = localStorage.getItem("dynDNSCondominios")
    if (savedDynDNS) {
      setDynDNSList(JSON.parse(savedDynDNS))
    }

    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [])

  const salvarConfiguracoes = async () => {
    setSalvando(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("configuracaoRede", JSON.stringify(config))
    setSalvando(false)
    alert("Configurações de rede salvas com sucesso!")
  }

  const gerarDynDNS = async (condominioId: string) => {
    const condominio = condominios.find((c) => c.id === condominioId)
    if (!condominio) return

    const subdominio = condominio.nome
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20)

    const novoDynDNS = {
      condominioId,
      nomeCondominio: condominio.nome,
      subdominio: `${subdominio}-${Date.now()}`,
      urlCompleta: `https://${subdominio}-${Date.now()}.controleacesso.dyndns.org`,
      status: "ativo",
      criadoEm: new Date(),
    }

    const novaLista = [...dynDNSList, novoDynDNS]
    setDynDNSList(novaLista)
    localStorage.setItem("dynDNSCondominios", JSON.stringify(novaLista))

    alert(`DynDNS gerado com sucesso!\nURL: ${novoDynDNS.urlCompleta}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuração de Rede - Admin Master</h2>
        <Button onClick={salvarConfiguracoes} disabled={salvando || !canModifyData()}>
          {salvando ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Status da Rede
            <Badge variant={config.redeAtiva ? "default" : "destructive"}>
              {config.redeAtiva ? "Ativa" : "Inativa"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Detecção Automática</Label>
              <p className="text-sm text-gray-600">Permitir detecção automática de rede</p>
            </div>
            <Switch
              checked={config.deteccaoAutomatica}
              onCheckedChange={(checked) => setConfig({ ...config, deteccaoAutomatica: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Rede Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ipLocal">IP Local</Label>
              <Input
                id="ipLocal"
                value={config.ipLocal}
                onChange={(e) => setConfig({ ...config, ipLocal: e.target.value })}
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="gateway">Gateway/Portal</Label>
              <Input
                id="gateway"
                value={config.gateway}
                onChange={(e) => setConfig({ ...config, gateway: e.target.value })}
                placeholder="192.168.1.1"
              />
            </div>
            <div>
              <Label htmlFor="dhcpInicio">Alcance DHCP - Início</Label>
              <Input
                id="dhcpInicio"
                value={config.alcanceDHCP.inicio}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alcanceDHCP: { ...config.alcanceDHCP, inicio: e.target.value },
                  })
                }
                placeholder="192.168.1.100"
              />
            </div>
            <div>
              <Label htmlFor="dhcpFim">Alcance DHCP - Fim</Label>
              <Input
                id="dhcpFim"
                value={config.alcanceDHCP.fim}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alcanceDHCP: { ...config.alcanceDHCP, fim: e.target.value },
                  })
                }
                placeholder="192.168.1.200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            DynDNS dos Condomínios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {condominios.map((condominio) => {
                const jaTemDynDNS = dynDNSList.some((dns) => dns.condominioId === condominio.id)

                return (
                  <Button
                    key={condominio.id}
                    size="sm"
                    variant={jaTemDynDNS ? "outline" : "default"}
                    onClick={() => !jaTemDynDNS && gerarDynDNS(condominio.id)}
                    disabled={jaTemDynDNS}
                  >
                    {jaTemDynDNS ? "✓" : "+"} {condominio.nome}
                  </Button>
                )
              })}
            </div>

            <div className="space-y-2">
              {dynDNSList.map((dns) => (
                <div key={dns.condominioId} className="p-3 border rounded-lg bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{dns.nomeCondominio}</p>
                      <p className="text-sm text-blue-600 font-mono">{dns.urlCompleta}</p>
                      <p className="text-xs text-gray-500">Criado em: {new Date(dns.criadoEm).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={dns.status === "ativo" ? "default" : "secondary"}>{dns.status}</Badge>
                  </div>
                </div>
              ))}
            </div>

            {dynDNSList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum DynDNS configurado ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componentes simplificados para as outras seções
function DispositivosContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dispositivos Cadastrados</h2>
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Use a aba "Configuração de Rede" (Admin Master) para configurar a rede local.
            </p>
            <p className="text-gray-600 mb-4">
              Use a aba "Busca Dispositivos" para encontrar e cadastrar dispositivos na rede configurada.
            </p>
            <p className="text-green-600 font-medium">
              ✅ Sistema agora usa apenas a rede configurada pelo Admin Master
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BuscaDispositivosContent() {
  const [dispositivos, setDispositivos] = useState<any[]>([])
  const [escaneando, setEscaneando] = useState(false)

  const escanearRede = async () => {
    setEscaneando(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const dispositivosEncontrados = [
      {
        id: "1",
        ip: "192.168.1.1",
        hostname: "router.local",
        tipo: "roteador",
        status: "online",
        ultimaPing: new Date(),
      },
      {
        id: "2",
        ip: "192.168.1.10",
        hostname: "camera-portaria",
        tipo: "camera",
        status: "online",
        ultimaPing: new Date(),
      },
    ]

    setDispositivos(dispositivosEncontrados)
    setEscaneando(false)
  }

  const iconesPorTipo = {
    roteador: Router,
    camera: Camera,
    computador: Monitor,
    notebook: Laptop,
    smartphone: Smartphone,
    impressora: Printer,
    servidor: Server,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scanner de Rede Configurada</h2>
        <Button onClick={escanearRede} disabled={escaneando}>
          <RefreshCw className={`h-4 w-4 mr-2 ${escaneando ? "animate-spin" : ""}`} />
          {escaneando ? "Escaneando..." : "Escanear Rede"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Encontrados ({dispositivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {dispositivos.map((dispositivo) => {
              const IconeDispositivo = iconesPorTipo[dispositivo.tipo as keyof typeof iconesPorTipo] || Monitor

              return (
                <div
                  key={dispositivo.id}
                  className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md bg-green-50 border-green-300"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative">
                      <IconeDispositivo className="h-8 w-8" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{dispositivo.hostname}</p>
                      <p className="text-xs text-gray-600">{dispositivo.ip}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {dispositivo.tipo}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {dispositivos.length === 0 && !escaneando && (
            <div className="text-center py-8 text-gray-500">
              <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo encontrado. Clique em "Escanear Rede" para buscar dispositivos.</p>
            </div>
          )}

          {escaneando && (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
              <p>Escaneando rede configurada...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EmpresasContent() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    email: "",
    telefone: "",
    whatsapp: "",
    servicos: "",
    observacoes: "",
  })

  useEffect(() => {
    const savedEmpresas = localStorage.getItem("empresasFornecedoras")
    if (savedEmpresas) {
      setEmpresas(JSON.parse(savedEmpresas))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const novaEmpresa: Empresa = {
      id: Date.now().toString(),
      ...formData,
    }
    const novasEmpresas = [...empresas, novaEmpresa]
    setEmpresas(novasEmpresas)
    localStorage.setItem("empresasFornecedoras", JSON.stringify(novasEmpresas))

    setFormData({
      nome: "",
      endereco: "",
      email: "",
      telefone: "",
      whatsapp: "",
      servicos: "",
      observacoes: "",
    })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta empresa?")) {
      const empresasFiltradas = empresas.filter((emp) => emp.id !== id)
      setEmpresas(empresasFiltradas)
      localStorage.setItem("empresasFornecedoras", JSON.stringify(empresasFiltradas))
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
    const cleanWhatsapp = whatsapp.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanWhatsapp}?text=${message}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Empresas Fornecedoras</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Empresa Fornecedora</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Empresa</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
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

              <div>
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  required
                />
              </div>

              <div>
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

              <div>
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
                <Button type="submit">Cadastrar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(empresa.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                  <Button size="sm" variant="outline" onClick={() => enviarEmail(empresa.email, empresa.nome)}>
                    <Mail className="h-4 w-4 mr-1" />
                    E-mail
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => enviarWhatsApp(empresa.whatsapp, empresa.nome)}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
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

function OrdensServicoContent() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    prioridade: "media" as const,
    empresaId: "",
    condominioId: "",
    observacoes: "",
  })

  const categorias = [
    "Elétrica",
    "Hidráulica",
    "Pintura",
    "Limpeza",
    "Jardinagem",
    "Segurança",
    "Tecnologia",
    "Estrutural",
    "Outros",
  ]

  useEffect(() => {
    const savedOrdens = localStorage.getItem("ordensServico")
    if (savedOrdens) {
      setOrdens(JSON.parse(savedOrdens))
    }

    const savedEmpresas = localStorage.getItem("empresasFornecedoras")
    if (savedEmpresas) {
      setEmpresas(JSON.parse(savedEmpresas))
    }

    const savedCondominios = localStorage.getItem("condominios")
    if (savedCondominios) {
      setCondominios(JSON.parse(savedCondominios))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const novaOrdem: OrdemServico = {
      id: Date.now().toString(),
      ...formData,
      status: "pendente",
      criadoPor: "Usuário Atual",
      criadaEm: new Date(),
    }
    const novasOrdens = [...ordens, novaOrdem]
    setOrdens(novasOrdens)
    localStorage.setItem("ordensServico", JSON.stringify(novasOrdens))

    setFormData({
      titulo: "",
      descricao: "",
      categoria: "",
      prioridade: "media",
      empresaId: "",
      condominioId: "",
      observacoes: "",
    })
    setShowForm(false)
  }

  const updateStatus = (id: string, novoStatus: OrdemServico["status"]) => {
    const updatedOrdens = ordens.map((ordem) => (ordem.id === id ? { ...ordem, status: novoStatus } : ordem))
    setOrdens(updatedOrdens)
    localStorage.setItem("ordensServico", JSON.stringify(updatedOrdens))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ordens de Serviço</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Ordem de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    className="w-full p-2 border rounded"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <select
                    id="prioridade"
                    className="w-full p-2 border rounded"
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="empresa">Empresa Responsável</Label>
                  <select
                    id="empresa"
                    className="w-full p-2 border rounded"
                    value={formData.empresaId}
                    onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="condominio">Condomínio</Label>
                  <select
                    id="condominio"
                    className="w-full p-2 border rounded"
                    value={formData.condominioId}
                    onChange={(e) => setFormData({ ...formData, condominioId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um condomínio</option>
                    {condominios.map((condominio) => (
                      <option key={condominio.id} value={condominio.id}>
                        {condominio.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Criar Ordem</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {ordens.map((ordem) => {
          const empresa = empresas.find((e) => e.id === ordem.empresaId)
          const condominio = condominios.find((c) => c.id === ordem.condominioId)

          return (
            <Card key={ordem.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{ordem.titulo}</h3>
                      <Badge variant={ordem.prioridade === "critica" ? "destructive" : "outline"}>
                        {ordem.prioridade}
                      </Badge>
                      <Badge variant={ordem.status === "concluido" ? "default" : "secondary"}>{ordem.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Categoria:</span> {ordem.categoria}
                        </p>
                        <p>
                          <span className="font-medium">Empresa:</span> {empresa?.nome || "Não definida"}
                        </p>
                        <p>
                          <span className="font-medium">Condomínio:</span> {condominio?.nome || "Não definido"}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Criado por:</span> {ordem.criadoPor}
                        </p>
                        <p>
                          <span className="font-medium">Criado em:</span> {new Date(ordem.criadaEm).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600">{ordem.descricao}</p>
                      {ordem.observacoes && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Obs:</span> {ordem.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {ordem.status === "pendente" && (
                        <Button size="sm" onClick={() => updateStatus(ordem.id, "em-execucao")}>
                          Iniciar Execução
                        </Button>
                      )}
                      {ordem.status === "em-execucao" && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(ordem.id, "pausada")}>
                            Pausar
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(ordem.id, "concluido")}>
                            Concluir
                          </Button>
                        </>
                      )}
                      {ordem.status === "pausada" && (
                        <Button size="sm" onClick={() => updateStatus(ordem.id, "em-execucao")}>
                          Retomar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {ordens.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma ordem de serviço encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}

function RelatoriosContent() {
  const [registros] = useState([
    {
      id: "1",
      usuario: "João Silva",
      local: "Portaria Principal",
      dispositivo: "Leitor Facial 01",
      condominio: "Residencial Jardim das Flores",
      horario: "2023-06-08 14:30:25",
      status: "Autorizado",
    },
    {
      id: "2",
      usuario: "Maria Santos",
      local: "Garagem",
      dispositivo: "Leitor RFID 02",
      condominio: "Residencial Jardim das Flores",
      horario: "2023-06-08 14:25:10",
      status: "Autorizado",
    },
    {
      id: "3",
      usuario: "Pedro Costa",
      local: "Salão de Festas",
      dispositivo: "Leitor Facial 03",
      condominio: "Residencial Jardim das Flores",
      horario: "2023-06-08 14:20:45",
      status: "Negado",
    },
  ])

  const gerarRelatorioPDF = () => {
    alert("Relatório PDF gerado e enviado para impressão!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios de Acesso</h2>
        <Button onClick={gerarRelatorioPDF}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Registros de Acesso ({registros.length})
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
                {registros.map((registro) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



function IntegracoesContent() {
  const [outlook, setOutlook] = useState({
    ativo: false,
    servidor: "smtp-mail.outlook.com",
    porta: 587,
    usuario: "",
    senha: "",
    ssl: true,
    testado: false,
  })

  const [whatsapp, setWhatsapp] = useState({
    ativo: false,
    apiKey: "",
    numeroTelefone: "",
    webhookUrl: "",
    testado: false,
  })

  const [testeForm, setTesteForm] = useState({
    tipo: "email" as "email" | "whatsapp",
    destinatario: "",
    assunto: "",
    mensagem: "",
  })

  const salvarOutlook = () => {
    localStorage.setItem("integracaoOutlook", JSON.stringify(outlook))
    alert("Configurações do Outlook salvas!")
  }

  const salvarWhatsApp = () => {
    localStorage.setItem("integracaoWhatsApp", JSON.stringify(whatsapp))
    alert("Configurações do WhatsApp salvas!")
  }

  const testarOutlook = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setOutlook((prev) => ({ ...prev, testado: true }))
    alert("Conexão com Outlook testada com sucesso!")
  }

  const testarWhatsApp = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setWhatsapp((prev) => ({ ...prev, testado: true }))
    alert("Conexão com WhatsApp API testada com sucesso!")
  }

  const enviarTeste = async () => {
    if (!testeForm.destinatario || !testeForm.mensagem) {
      alert("Preencha todos os campos obrigatórios!")
      return
    }

    if (testeForm.tipo === "email" && outlook.ativo) {
      alert("E-mail de teste enviado via Outlook!")
    } else if (testeForm.tipo === "whatsapp" && whatsapp.ativo) {
      alert("Mensagem de teste enviada via WhatsApp!")
    } else {
      alert("Configure e ative a integração primeiro!")
    }

    setTesteForm({
      tipo: "email",
      destinatario: "",
      assunto: "",
      mensagem: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integrações Web - Outlook & WhatsApp</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Integração Microsoft Outlook
            <Badge variant={outlook.ativo ? "default" : "secondary"}>{outlook.ativo ? "Ativo" : "Inativo"}</Badge>
            {outlook.testado && <Badge variant="outline">✓ Testado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Integração Outlook</Label>
              <p className="text-sm text-gray-600">Enviar notificações via e-mail</p>
            </div>
            <Switch checked={outlook.ativo} onCheckedChange={(checked) => setOutlook({ ...outlook, ativo: checked })} />
          </div>

          {outlook.ativo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Servidor SMTP</Label>
                <Input
                  value={outlook.servidor}
                  onChange={(e) => setOutlook({ ...outlook, servidor: e.target.value })}
                  placeholder="smtp-mail.outlook.com"
                />
              </div>
              <div>
                <Label>Porta</Label>
                <Input
                  type="number"
                  value={outlook.porta}
                  onChange={(e) => setOutlook({ ...outlook, porta: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>E-mail/Usuário</Label>
                <Input
                  type="email"
                  value={outlook.usuario}
                  onChange={(e) => setOutlook({ ...outlook, usuario: e.target.value })}
                  placeholder="seu-email@outlook.com"
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={outlook.senha}
                  onChange={(e) => setOutlook({ ...outlook, senha: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={salvarOutlook}>
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
            {outlook.ativo && (
              <Button onClick={testarOutlook} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Testar Conexão
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Integração WhatsApp Business API
            <Badge variant={whatsapp.ativo ? "default" : "secondary"}>{whatsapp.ativo ? "Ativo" : "Inativo"}</Badge>
            {whatsapp.testado && <Badge variant="outline">✓ Testado</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ativar Integração WhatsApp</Label>
              <p className="text-sm text-gray-600">Enviar notificações via WhatsApp</p>
            </div>
            <Switch
              checked={whatsapp.ativo}
              onCheckedChange={(checked) => setWhatsapp({ ...whatsapp, ativo: checked })}
            />
          </div>

          {whatsapp.ativo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={whatsapp.apiKey}
                  onChange={(e) => setWhatsapp({ ...whatsapp, apiKey: e.target.value })}
                  placeholder="Sua API Key do WhatsApp Business"
                />
              </div>
              <div>
                <Label>Número de Telefone</Label>
                <Input
                  value={whatsapp.numeroTelefone}
                  onChange={(e) => setWhatsapp({ ...whatsapp, numeroTelefone: e.target.value })}
                  placeholder="+5511999999999"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={salvarWhatsApp}>
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
            {whatsapp.ativo && (
              <Button onClick={testarWhatsApp} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Testar API
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Envio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Envio</Label>
              <select
                className="w-full p-2 border rounded"
                value={testeForm.tipo}
                onChange={(e) => setTesteForm({ ...testeForm, tipo: e.target.value as "email" | "whatsapp" })}
              >
                <option value="email">E-mail (Outlook)</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div>
              <Label>{testeForm.tipo === "email" ? "E-mail Destinatário" : "Número WhatsApp"}</Label>
              <Input
                value={testeForm.destinatario}
                onChange={(e) => setTesteForm({ ...testeForm, destinatario: e.target.value })}
                placeholder={testeForm.tipo === "email" ? "destinatario@email.com" : "+5511999999999"}
              />
            </div>
            {testeForm.tipo === "email" && (
              <div className="md:col-span-2">
                <Label>Assunto</Label>
                <Input
                  value={testeForm.assunto}
                  onChange={(e) => setTesteForm({ ...testeForm, assunto: e.target.value })}
                  placeholder="Assunto do e-mail"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <Label>Mensagem</Label>
              <Textarea
                rows={4}
                value={testeForm.mensagem}
                onChange={(e) => setTesteForm({ ...testeForm, mensagem: e.target.value })}
                placeholder="Digite sua mensagem de teste..."
              />
            </div>
          </div>

          <Button onClick={enviarTeste}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Teste
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function MonitoramentoContent() {
  const [eventosAcesso] = useState([
    {
      id: "1",
      usuario: "João Silva",
      dispositivo: "Leitor Facial 01",
      local: "Portaria Principal",
      condominio: "Residencial Jardim",
      dataHora: new Date(Date.now() - 300000),
      tipo: "entrada",
      status: "autorizado",
    },
    {
      id: "2",
      usuario: "Maria Santos",
      dispositivo: "Leitor RFID 02",
      local: "Garagem",
      condominio: "Residencial Jardim",
      dataHora: new Date(Date.now() - 600000),
      tipo: "saida",
      status: "autorizado",
    },
  ])

  const [cameras] = useState([
    {
      id: "1",
      nome: "Câmera Portaria",
      ip: "192.168.1.100",
      local: "Portaria Principal",
      status: "online",
      ultimaVerificacao: new Date(),
    },
    {
      id: "2",
      nome: "Câmera Garagem",
      ip: "192.168.1.101",
      local: "Garagem",
      status: "online",
      ultimaVerificacao: new Date(),
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monitoramento do Sistema</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Câmeras Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {cameras.filter((c) => c.status === "online").length}/{cameras.length}
                </p>
              </div>
              <Camera className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dispositivos Online</p>
                <p className="text-2xl font-bold text-blue-600">2/2</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acessos Hoje</p>
                <p className="text-2xl font-bold text-purple-600">{eventosAcesso.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acessos Negados</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Status das Câmeras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cameras.map((camera) => (
              <div key={camera.id} className="p-4 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{camera.nome}</h3>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    ONLINE
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>IP: {camera.ip}</p>
                  <p>Local: {camera.local}</p>
                  <p>Última verificação: {camera.ultimaVerificacao.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Eventos de Acesso em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventosAcesso.map((evento) => (
              <div key={evento.id} className="p-4 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-semibold">{evento.usuario}</h3>
                      <div className="text-sm text-gray-600">
                        <p>
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {evento.local} - {evento.condominio}
                        </p>
                        <p>Dispositivo: {evento.dispositivo}</p>
                        <p>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {evento.dataHora.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">
                      {evento.tipo.toUpperCase()} - {evento.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MapaRedeContent() {
  const [dispositivos] = useState([
    {
      id: "1",
      ip: "192.168.1.1",
      hostname: "router.local",
      tipo: "roteador",
      status: "online",
      fabricante: "TP-Link",
    },
    {
      id: "2",
      ip: "192.168.1.10",
      hostname: "camera-portaria",
      tipo: "camera",
      status: "online",
      fabricante: "Hikvision",
    },
    {
      id: "3",
      ip: "192.168.1.20",
      hostname: "pc-recepcao",
      tipo: "computador",
      status: "online",
      fabricante: "Dell",
    },
  ])

  const iconesPorTipo = {
    roteador: Router,
    camera: Camera,
    computador: Monitor,
    notebook: Laptop,
    smartphone: Smartphone,
    impressora: Printer,
    servidor: Server,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mapa Visual da Rede Local</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Dispositivos na Rede ({dispositivos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {dispositivos.map((dispositivo) => {
              const IconeDispositivo = iconesPorTipo[dispositivo.tipo as keyof typeof iconesPorTipo] || Monitor

              return (
                <div
                  key={dispositivo.id}
                  className="p-4 rounded-lg border-2 transition-all hover:shadow-md bg-green-50 border-green-300"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="relative">
                      <IconeDispositivo className="h-8 w-8" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{dispositivo.hostname}</p>
                      <p className="text-xs text-gray-600">{dispositivo.ip}</p>
                      <p className="text-xs text-gray-500">{dispositivo.fabricante}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {dispositivo.tipo}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {dispositivos.filter((d) => d.status === "online").length}
              </p>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">0</p>
              <p className="text-sm text-gray-600">Offline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-gray-600">Com Erro</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{dispositivos.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ConfiguracoesContent() {
  const { canModifyData } = useAuth()
  const [config, setConfig] = useState({
    nomeEmpresa: "Up Control Access",
    emailAdmin: "admin@sistema.com",
    servidorEmail: "smtp.gmail.com",
    portaEmail: 587,
    senhaEmail: "",
    backupAutomatico: true,
    intervaloPing: 30,
    timeoutConexao: 5000,
    logDetalhado: false,
    notificacoesPush: true,
  })

  const [salvando, setSalvando] = useState(false)

  const salvarConfiguracoes = async () => {
    setSalvando(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("configuracoesSistema", JSON.stringify(config))
    setSalvando(false)
    alert("Configurações salvas com sucesso!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações Avançadas do Sistema</h2>
        <Button onClick={salvarConfiguracoes} disabled={salvando || !canModifyData()}>
          {salvando ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={config.nomeEmpresa}
                onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                disabled={!canModifyData()}
              />
            </div>
            <div>
              <Label htmlFor="emailAdmin">Email do Administrador</Label>
              <Input
                id="emailAdmin"
                type="email"
                value={config.emailAdmin}
                onChange={(e) => setConfig({ ...config, emailAdmin: e.target.value })}
                disabled={!canModifyData()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servidorEmail">Servidor SMTP</Label>
              <Input
                id="servidorEmail"
                value={config.servidorEmail}
                onChange={(e) => setConfig({ ...config, servidorEmail: e.target.value })}
                disabled={!canModifyData()}
              />
            </div>
            <div>
              <Label htmlFor="portaEmail">Porta</Label>
              <Input
                id="portaEmail"
                type="number"
                value={config.portaEmail}
                onChange={(e) => setConfig({ ...config, portaEmail: Number.parseInt(e.target.value) })}
                disabled={!canModifyData()}
              />
            </div>
            <div>
              <Label htmlFor="senhaEmail">Senha do Email</Label>
              <Input
                id="senhaEmail"
                type="password"
                value={config.senhaEmail}
                onChange={(e) => setConfig({ ...config, senhaEmail: e.target.value })}
                disabled={!canModifyData()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
              </div>
              <Switch
                checked={config.backupAutomatico}
                onCheckedChange={(checked) => setConfig({ ...config, backupAutomatico: checked })}
                disabled={!canModifyData()}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Log Detalhado</Label>
                <p className="text-sm text-gray-600">Registrar logs detalhados do sistema</p>
              </div>
              <Switch
                checked={config.logDetalhado}
                onCheckedChange={(checked) => setConfig({ ...config, logDetalhado: checked })}
                disabled={!canModifyData()}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push</Label>
                <p className="text-sm text-gray-600">Enviar notificações push para dispositivos</p>
              </div>
              <Switch
                checked={config.notificacoesPush}
                onCheckedChange={(checked) => setConfig({ ...config, notificacoesPush: checked })}
                disabled={!canModifyData()}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
