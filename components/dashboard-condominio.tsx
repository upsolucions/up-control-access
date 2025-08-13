"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

// Importar componentes específicos
import TodosUsuarios from "./todos-usuarios"
import GerenciarUsuariosCompleto from "./gerenciar-usuarios-completo"
import GerenciarPessoas from "./gerenciar-pessoas"
import RelatoriosProblemas from "./relatorios-problemas"
import ConfiguracaoRede from "./configuracao-rede"
import MapaRedeVisual from "./mapa-rede-visual"
import NetworkScanner from "./network-scanner"
import EmpresasFornecedoras from "./empresas-fornecedoras"
import OrdensServico from "./ordens-servico"
import RelatoriosAcesso from "./relatorios-acesso"
import IntegracaoWeb from "./integracoes-web"
import MonitoramentoSistema from "./monitoramento-sistema"
import ConfiguracoesAvancadas from "./configuracoes-avancadas"
import SistemaAuditoria from "./sistema-auditoria"

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: "administrador-master" | "administrador" | "gerente" | "operador" | "sindico" | "tecnico" | "gestor-seguranca" | "prestador-servico" | "temporario" | "recepcao" | "teste-sistema"
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

interface DashboardCondominioProps {
  usuario: Usuario
  condominio: Condominio
  onLogout: () => void
  logoAtivo?: string | null
}

export default function DashboardCondominio({ usuario, condominio, onLogout, logoAtivo }: DashboardCondominioProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [ordensServico, setOrdensServico] = useState<any[]>([])
  const [relatoriosProblemas, setRelatoriosProblemas] = useState<any[]>([])

  useEffect(() => {
    carregarDadosCondominio()
  }, [condominio.id])

  const carregarDadosCondominio = () => {
    // Carregar dispositivos do condomínio
    const dispositivosSalvos = JSON.parse(localStorage.getItem('dispositivos') || '[]')
    const dispositivosCondominio = dispositivosSalvos.filter((d: Dispositivo) => d.condominioId === condominio.id)
    setDispositivos(dispositivosCondominio)

    // Carregar usuários do condomínio
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const usuariosCondominio = usuariosSalvos.filter((u: Usuario) => u.condominioId === condominio.id)
    setUsuarios(usuariosCondominio)

    // Carregar empresas
    const empresasSalvas = JSON.parse(localStorage.getItem('empresas') || '[]')
    setEmpresas(empresasSalvas)

    // Carregar ordens de serviço do condomínio
    const ordensSalvas = JSON.parse(localStorage.getItem('ordensServico') || '[]')
    const ordensCondominio = ordensSalvas.filter((o: any) => o.condominioId === condominio.id)
    setOrdensServico(ordensCondominio)

    // Carregar relatórios de problemas do condomínio
    const relatoriosSalvos = JSON.parse(localStorage.getItem('relatoriosProblemas') || '[]')
    const relatoriosCondominio = relatoriosSalvos.filter((r: any) => r.condominio === condominio.nome)
    setRelatoriosProblemas(relatoriosCondominio)
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Shield,
      roles: ["administrador", "gerente", "operador", "sindico", "teste-sistema"],
    },
    {
      id: "usuarios",
      label: "Usuários",
      icon: Users,
      roles: ["administrador", "administrador-local", "teste-sistema"],
    },
    {
      id: "gerenciar-pessoas",
      label: "Gerenciar Pessoas",
      icon: Users,
      roles: ["operador", "gestor-seguranca", "recepcao", "gerente", "teste-sistema"],
    },
    {
      id: "dispositivos",
      label: "Dispositivos",
      icon: Smartphone,
      roles: ["administrador", "gerente", "operador", "teste-sistema"],
    },
    {
      id: "busca-dispositivos",
      label: "Busca Dispositivos",
      icon: Search,
      roles: ["administrador", "administrador-local", "teste-sistema"],
    },
    {
      id: "mapa-rede",
      label: "Mapa de Rede",
      icon: Globe,
      roles: ["administrador", "administrador-local", "teste-sistema"],
    },
    {
      id: "empresas",
      label: "Empresas",
      icon: Building2,
      roles: ["administrador", "administrador-local", "operador", "teste-sistema"],
    },
    {
      id: "ordens-servico",
      label: "Ordens de Serviço",
      icon: Wrench,
      roles: ["administrador", "administrador-local", "operador", "sindico", "teste-sistema"],
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: FileText,
      roles: ["administrador", "administrador-local", "operador", "sindico", "teste-sistema"],
    },
    {
      id: "relatorios-problemas",
      label: "Relatórios de Problemas",
      icon: AlertTriangle,
      roles: ["administrador", "administrador-local", "operador", "teste-sistema"],
    },
    {
      id: "monitoramento",
      label: "Monitoramento",
      icon: Eye,
      roles: ["administrador", "administrador-local", "operador", "sindico", "teste-sistema"],
    },
    {
      id: "auditoria",
      label: "Auditoria",
      icon: FileText,
      roles: ["administrador-master"],
    },
  ]

  // Filtrar menu baseado no perfil do usuário
  const filteredMenu = menuItems.filter((item) => {
    return item.roles.includes(usuario.perfil)
  })

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dispositivos Online</CardTitle>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dispositivos.filter(d => d.status === 'online').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de {dispositivos.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usuarios.filter(u => u.ativo).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    usuários cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ordens Pendentes</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ordensServico.filter(o => o.status === 'pendente').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    aguardando execução
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Problemas Abertos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {relatoriosProblemas.filter(r => r.status === 'aberto').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    requerem atenção
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Condomínio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{condominio.nome}</h3>
                    <p className="text-sm text-gray-600">{condominio.razaoSocial}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">CNPJ:</span>
                      <p>{condominio.cnpj}</p>
                    </div>
                    <div>
                      <span className="font-medium">Gerente:</span>
                      <p>{condominio.gerente}</p>
                    </div>
                    <div>
                      <span className="font-medium">Endereço:</span>
                      <p>{condominio.endereco}</p>
                    </div>
                    <div>
                      <span className="font-medium">Contato:</span>
                      <p>{condominio.contato}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ordensServico.slice(0, 5).map((ordem, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{ordem.titulo}</p>
                          <p className="text-xs text-gray-500">
                            Status: {ordem.status} - {ordem.categoria}
                          </p>
                        </div>
                      </div>
                    ))}
                    {ordensServico.length === 0 && (
                      <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "usuarios":
        return <GerenciarUsuariosCompleto condominioId={condominio.id} />
      case "dispositivos":
        return <NetworkScanner condominioId={condominio.id} />
      case "busca-dispositivos":
        return <NetworkScanner condominioId={condominio.id} />
      case "mapa-rede":
        return <MapaRedeVisual condominioId={condominio.id} />
      case "empresas":
        return <EmpresasFornecedoras condominioId={condominio.id} />
      case "gerenciar-pessoas":
        return <GerenciarPessoas condominioId={condominio.id} />
      case "ordens-servico":
        return <OrdensServico condominioId={condominio.id} />
      case "relatorios":
        return <RelatoriosAcesso condominioId={condominio.id} />
      case "relatorios-problemas":
        return <RelatoriosProblemas condominioId={condominio.id} />
      case "monitoramento":
        return <MonitoramentoSistema condominioId={condominio.id} />
      case "auditoria":
        return <SistemaAuditoria />
      default:
        return <div>Conteúdo não encontrado</div>
    }
  }

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
                onError={() => {}}
              />
            ) : (
              <Shield className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{condominio.nome}</h1>
              <p className="text-xs text-gray-500">Dashboard do Condomínio</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">{usuario.nome}</span>
              <p className="text-xs text-gray-600 capitalize">
                {usuario.perfil.replace("-", " ")}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
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
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}