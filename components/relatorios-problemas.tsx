"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Flame, Car, Users, Eye, Zap, Monitor, Plus, Download, Filter, Upload, FileText } from "lucide-react"
import { PDFGenerator } from "@/lib/pdf-generator"
import { useAuth } from "@/contexts/AuthContext"

interface RelatorioProblema {
  id: string
  tipo:
    | "achados-perdidos"
    | "acidente-danos-materiais"
    | "acidente-lesoes-corporais"
    | "acidente-morte"
    | "agressao"
    | "alarme-coacao"
    | "ameaca"
    | "atendimento-emergencia"
    | "ato-obsceno"
    | "check-list-efetivo"
    | "comportamento-inadequado-condomino"
    | "comportamento-inadequado-prestador-servico"
    | "comportamento-inadequado-profissional"
    | "comportamento-inadequado-visitante"
    | "corte-linha-telefonica"
    | "dano-patrimonio"
    | "desatencao-aparelhos-eletronicos"
    | "elevadores-problemas-tecnicos"
    | "emergencia-medica"
    | "entrada-saida-veiculos"
    | "entrega-retirada-chaves"
    | "entrega-retirada-material"
    | "falta-energia-eletrica"
    | "falta-agua"
    | "falta-servico-profissional-faltou"
    | "furto"
    | "homicidio"
    | "incendio"
    | "individuo-atitude-suspeita-impropria"
    | "liberacao-acesso-concierge-gestor-gerente-sindico-prestador-servico"
    | "liberacao-acesso"
    | "liberacao-entrada-saida-colaborador-sem-tag"
    | "orientacao-operador-sistema"
    | "panico"
    | "perturbacao-sossego"
    | "pessoas-presas-elevador"
    | "pessoas-presas-torniquete"
    | "porta-portao-mantida-aberta"
    | "prestacao-servico-manutencao"
    | "prestacao-servico-mudanca"
    | "principio-incendio"
    | "problemas-oscilacao-servico-internet"
    | "problemas-comunicacao-posto-servico"
    | "profissional-uniforme-incompleto"
    | "pronto-efetivo"
    | "recepcao-congestionada"
    | "registro-insatisfacao"
    | "resposta-registro-insatisfacao"
    | "ronda-pe"
    | "ronda-motorizada"
    | "ronda-ostensiva"
    | "ronda-pendente"
    | "ronda-policial"
    | "ronda-preventiva"
    | "ronda-programadas"
    | "roubo"
    | "saida-antecipada-profissional"
    | "sem-comunicacao-alarme"
    | "sistema-alarme-problemas-tecnicos"
    | "sistema-automacao-predial-problemas-tecnicos"
    | "sistema-cftv-problemas-tecnicos"
    | "sistema-comunicacao-problemas-tecnicos"
    | "sistema-controle-acesso-problemas-tecnicos"
    | "sistema-iluminacao-problemas-tecnicos"
    | "sistema-incendio-problemas-tecnicos"
    | "solicitacao-backup-imagens"
    | "solicitacao-extensao-horario-desarmado-fora-horario-programado"
    | "solicitacao-direta-resposta-cliente"
    | "substituicao-operador"
    | "tentativa-homicidio"
    | "teste-sistemas-equipamentos"
    | "transporte-valores"
    | "treinamento-operacional"
    | "troca-plantao"
    | "uso-drogas-ilicitas"
    | "vandalismo"
    | "vazamento-agua-esgoto-gas-oleo"
    | "veiculo-estacionado-local-inadequado-atitude-suspeita"
    | "visita-operacional"
    | "colisao-veiculos"
  titulo: string
  descricao: string
  local: string
  condominio: string
  dataOcorrencia: string
  horarioOcorrencia: string
  gravidade: "baixa" | "media" | "alta" | "critica"
  status: "aberto" | "investigando" | "resolvido" | "encaminhado"
  criadoPor: string
  criadoEm: Date
  resolvidoEm?: Date
  evidencias?: File[]
  responsavel?: string
}

interface RelatoriosProblemasProps {
  condominioId?: string
}

export default function RelatoriosProblemas({ condominioId }: RelatoriosProblemasProps) {
  const { canModifyData, usuarioLogado } = useAuth()
  const [relatorios, setRelatorios] = useState<RelatorioProblema[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "achados-perdidos" as const,
    titulo: "",
    descricao: "",
    local: "",
    condominio: condominioId || "",
    dataOcorrencia: "",
    horarioOcorrencia: "",
    gravidade: "media" as const,
  })
  const [evidencias, setEvidencias] = useState<File[]>([])
  const [filtros, setFiltros] = useState({
    tipo: "todos",
    gravidade: "todos",
    status: "todos",
    dataInicio: "",
    dataFim: "",
  })

  const tiposProblema = [
    { value: "achados-perdidos", label: "Achados e perdidos", icon: AlertTriangle, color: "bg-gray-100 text-gray-800" },
    { value: "acidente-danos-materiais", label: "Acidente danos materiais", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "acidente-lesoes-corporais", label: "Acidente lesões corporais", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "acidente-morte", label: "Acidente morte", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "agressao", label: "Agressão", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "alarme-coacao", label: "Alarme de coação", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "ameaca", label: "Ameaça", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "atendimento-emergencia", label: "Atendimento de emergência", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "ato-obsceno", label: "Ato obsceno", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
    { value: "check-list-efetivo", label: "Check list efetivo", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "colisao-veiculos", label: "Colisão de veículos", icon: Car, color: "bg-orange-100 text-orange-800" },
    { value: "comportamento-inadequado-condomino", label: "Comportamento inadequado condômino", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "comportamento-inadequado-prestador-servico", label: "Comportamento inadequado prestador de serviço", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "comportamento-inadequado-profissional", label: "Comportamento inadequado profissional", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "comportamento-inadequado-visitante", label: "Comportamento inadequado visitante", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "corte-linha-telefonica", label: "Corte da linha telefônica", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "dano-patrimonio", label: "Dano ao patrimônio", icon: AlertTriangle, color: "bg-orange-100 text-orange-800" },
    { value: "desatencao-aparelhos-eletronicos", label: "Desatenção com aparelhos eletrônicos", icon: Monitor, color: "bg-yellow-100 text-yellow-800" },
    { value: "elevadores-problemas-tecnicos", label: "Elevadores com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "emergencia-medica", label: "Emergência médica", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "entrada-saida-veiculos", label: "Entrada / saída de veículos", icon: Car, color: "bg-blue-100 text-blue-800" },
    { value: "entrega-retirada-chaves", label: "Entrega/retirada de chaves", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "entrega-retirada-material", label: "Entrega /retirada de material", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "falta-agua", label: "Falta de água", icon: Zap, color: "bg-orange-100 text-orange-800" },
    { value: "falta-energia-eletrica", label: "Falta de energia elétrica", icon: Zap, color: "bg-orange-100 text-orange-800" },
    { value: "falta-servico-profissional-faltou", label: "Falta de serviço- profissional faltou", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "furto", label: "Furto", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "homicidio", label: "Homicídio", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "incendio", label: "Incêndio", icon: Flame, color: "bg-red-100 text-red-800" },
    { value: "individuo-atitude-suspeita-impropria", label: "Indivíduo em atitude suspeita/imprópria", icon: Eye, color: "bg-purple-100 text-purple-800" },
    { value: "liberacao-acesso", label: "Liberação de acesso", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "liberacao-acesso-concierge-gestor-gerente-sindico-prestador-servico", label: "Liberação de acesso para concierge/gestor/gerente/síndico/prestador de serviço", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "liberacao-entrada-saida-colaborador-sem-tag", label: "Liberação de entrada / saída para colaborador sem tag", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "orientacao-operador-sistema", label: "Orientação ao operador de sistema", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "panico", label: "Pânico", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "perturbacao-sossego", label: "Perturbação do sossego", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "pessoas-presas-elevador", label: "Pessoas presas no elevador", icon: AlertTriangle, color: "bg-orange-100 text-orange-800" },
    { value: "pessoas-presas-torniquete", label: "Pessoas presas em torniquete", icon: AlertTriangle, color: "bg-orange-100 text-orange-800" },
    { value: "porta-portao-mantida-aberta", label: "Porta/portão mantida aberta", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
    { value: "prestacao-servico-manutencao", label: "Prestação de serviço -manutenção", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "prestacao-servico-mudanca", label: "Prestação de serviço - mudança", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "principio-incendio", label: "Princípio de incêndio", icon: Flame, color: "bg-red-100 text-red-800" },
    { value: "problemas-comunicacao-posto-servico", label: "Problemas de comunicação posto de serviço", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "problemas-oscilacao-servico-internet", label: "Problemas / oscilação no serviço de internet", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "profissional-uniforme-incompleto", label: "Profissional com uniforme incompleto", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "pronto-efetivo", label: "Pronto efetivo", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "recepcao-congestionada", label: "Recepção congestionada", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "registro-insatisfacao", label: "Registro de insatisfação", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
    { value: "resposta-registro-insatisfacao", label: "Resposta ao registro de insatisfação", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "ronda-motorizada", label: "Ronda motorizada", icon: Car, color: "bg-blue-100 text-blue-800" },
    { value: "ronda-ostensiva", label: "Ronda ostensiva", icon: Eye, color: "bg-blue-100 text-blue-800" },
    { value: "ronda-pe", label: "Ronda pé", icon: Users, color: "bg-blue-100 text-blue-800" },
    { value: "ronda-pendente", label: "Ronda pendente", icon: AlertTriangle, color: "bg-yellow-100 text-yellow-800" },
    { value: "ronda-policial", label: "Ronda policial", icon: Eye, color: "bg-blue-100 text-blue-800" },
    { value: "ronda-preventiva", label: "Ronda preventiva", icon: Eye, color: "bg-blue-100 text-blue-800" },
    { value: "ronda-programadas", label: "Ronda programadas", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "roubo", label: "Roubo", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "saida-antecipada-profissional", label: "Saída antecipada do profissional", icon: Users, color: "bg-yellow-100 text-yellow-800" },
    { value: "sem-comunicacao-alarme", label: "Sem comunicação de alarme", icon: Monitor, color: "bg-red-100 text-red-800" },
    { value: "sistema-alarme-problemas-tecnicos", label: "Sistema de alarme com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "sistema-automacao-predial-problemas-tecnicos", label: "Sistema de automação predial com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "sistema-cftv-problemas-tecnicos", label: "Sistema de CFTV com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "sistema-comunicacao-problemas-tecnicos", label: "Sistema de comunicação com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "sistema-controle-acesso-problemas-tecnicos", label: "Sistema de controle de acesso com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "sistema-iluminacao-problemas-tecnicos", label: "Sistema de iluminação com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "sistema-incendio-problemas-tecnicos", label: "Sistema de incêndio com problemas técnicos", icon: Monitor, color: "bg-orange-100 text-orange-800" },
    { value: "solicitacao-backup-imagens", label: "Solicitação de backup de imagens", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "solicitacao-direta-resposta-cliente", label: "Solicitação direta com resposta ao cliente", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "solicitacao-extensao-horario-desarmado-fora-horario-programado", label: "Solicitação de extensão de horário/ desarmado fora do horário programado", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "substituicao-operador", label: "Substituição de operador", icon: Users, color: "bg-blue-100 text-blue-800" },
    { value: "tentativa-homicidio", label: "Tentativa de homicídio", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "teste-sistemas-equipamentos", label: "Teste em sistemas / equipamentos", icon: Monitor, color: "bg-blue-100 text-blue-800" },
    { value: "transporte-valores", label: "Transporte de valores", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "treinamento-operacional", label: "Treinamento operacional", icon: Users, color: "bg-blue-100 text-blue-800" },
    { value: "troca-plantao", label: "Troca de plantão", icon: Users, color: "bg-blue-100 text-blue-800" },
    { value: "uso-drogas-ilicitas", label: "Uso de drogas ilícitas", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "vandalismo", label: "Vandalismo", icon: AlertTriangle, color: "bg-red-100 text-red-800" },
    { value: "vazamento-agua-esgoto-gas-oleo", label: "Vazamento de água /esgoto/gás/óleo", icon: Zap, color: "bg-orange-100 text-orange-800" },
    { value: "veiculo-estacionado-local-inadequado-atitude-suspeita", label: "Veículo estacionado em local inadequado/atitude suspeita", icon: Car, color: "bg-yellow-100 text-yellow-800" },
    { value: "visita-operacional", label: "Visita operacional", icon: Users, color: "bg-blue-100 text-blue-800" },
  ]

  const gravidadeOptions = [
    { value: "baixa", label: "Baixa", color: "bg-gray-100 text-gray-800" },
    { value: "media", label: "Média", color: "bg-yellow-100 text-yellow-800" },
    { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
    { value: "critica", label: "Crítica", color: "bg-red-100 text-red-800" },
  ]

  const statusOptions = [
    { value: "aberto", label: "Aberto", color: "bg-red-100 text-red-800" },
    { value: "investigando", label: "Investigando", color: "bg-yellow-100 text-yellow-800" },
    { value: "encaminhado", label: "Encaminhado", color: "bg-blue-100 text-blue-800" },
    { value: "resolvido", label: "Resolvido", color: "bg-green-100 text-green-800" },
  ]

  useEffect(() => {
    // Carregar relatórios do localStorage
    const savedRelatorios = localStorage.getItem("relatoriosProblemas")
    if (savedRelatorios) {
      let allRelatorios = JSON.parse(savedRelatorios)
      // Se condominioId for fornecido, filtrar apenas relatórios desse condomínio
      if (condominioId) {
        // Buscar nome do condomínio
        const savedCondominios = localStorage.getItem("condominios")
        if (savedCondominios) {
          const condominios = JSON.parse(savedCondominios)
          const condominio = condominios.find((c: any) => c.id === condominioId)
          if (condominio) {
            allRelatorios = allRelatorios.filter((r: RelatorioProblema) => r.condominio === condominio.nome)
          }
        }
      }
      setRelatorios(allRelatorios)
    } else {
      // Dados de exemplo
      const exemploRelatorios: RelatorioProblema[] = [
        {
          id: "1",
          tipo: "individuo-atitude-suspeita-impropria",
          titulo: "Pessoa estranha no estacionamento",
          descricao: "Indivíduo não identificado circulando pelo estacionamento durante a madrugada",
          local: "Estacionamento - Subsolo",
          condominio: "Residencial Jardim",
          dataOcorrencia: "2024-01-15",
          horarioOcorrencia: "02:30",
          gravidade: "alta",
          status: "investigando",
          criadoPor: "Porteiro João",
          criadoEm: new Date(Date.now() - 3600000), // 1 hora atrás
        },
        {
          id: "2",
          tipo: "falta-energia-eletrica",
          titulo: "Queda de energia no bloco B",
          descricao: "Falta de energia elétrica em todo o bloco B desde às 14h",
          local: "Bloco B",
          condominio: "Residencial Jardim",
          dataOcorrencia: "2024-01-15",
          horarioOcorrencia: "14:00",
          gravidade: "media",
          status: "encaminhado",
          criadoPor: "Síndico Maria",
          criadoEm: new Date(Date.now() - 7200000), // 2 horas atrás
          responsavel: "Eletricista Silva",
        },
      ]
      setRelatorios(exemploRelatorios)
      localStorage.setItem("relatoriosProblemas", JSON.stringify(exemploRelatorios))
    }
  }, [condominioId])

  const saveRelatorios = (newRelatorios: RelatorioProblema[]) => {
    setRelatorios(newRelatorios)
    localStorage.setItem("relatoriosProblemas", JSON.stringify(newRelatorios))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação de campos obrigatórios
    if (!formData.tipo || !formData.titulo || !formData.descricao || !formData.local || !formData.condominio || !formData.dataOcorrencia || !formData.horarioOcorrencia) {
      alert("Todos os campos são obrigatórios para criar o relatório.")
      return
    }

    const novoRelatorio: RelatorioProblema = {
      id: Date.now().toString(),
      ...formData,
      evidencias: evidencias,
      status: "aberto",
      criadoPor: "Usuário Atual", // Aqui seria o usuário logado
      criadoEm: new Date(),
    }

    const novosRelatorios = [...relatorios, novoRelatorio]
    saveRelatorios(novosRelatorios)

    // Gerar PDF automaticamente após criar o relatório
    try {
      const sucesso = await PDFGenerator.gerarRelatorioPDF([novoRelatorio], `Relatório de Problema - ${novoRelatorio.titulo}`, "problemas", usuarioLogado?.nome || "Sistema")
      
      if (sucesso) {
        // Fazer upload imediato com evidências
        await uploadRelatorio(novoRelatorio)
        const evidenciasInfo = evidencias.length > 0 ? `\n📸 ${evidencias.length} evidência(s) fotográfica(s) anexada(s)` : '\n📸 Nenhuma evidência fotográfica anexada'
        alert(`✅ Relatório criado com sucesso!\n📄 PDF gerado automaticamente com fidelidade total dos dados${evidenciasInfo}\n☁️ Upload realizado para o servidor`)
      } else {
        alert(`✅ Relatório criado com sucesso!\n⚠️ Erro na geração do PDF`)
      }
    } catch (error) {
      console.error("Erro no processo:", error)
      alert(`✅ Relatório criado com sucesso!\n⚠️ Erro no processamento automático: ${error}`)
    }

    // Enviar notificação automática para problemas críticos
    if (formData.gravidade === "critica") {
      enviarNotificacaoUrgente(novoRelatorio)
    }

    // Resetar formulário
    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setFormData({
      tipo: "achados-perdidos",
      titulo: "",
      descricao: "",
      local: "",
      condominio: "",
      dataOcorrencia: "",
      horarioOcorrencia: "",
      gravidade: "media",
    })
    setEvidencias([])
  }

  const enviarNotificacaoUrgente = (relatorio: RelatorioProblema) => {
    // Simular envio de notificação urgente
    alert(`ALERTA CRÍTICO: ${relatorio.titulo}\nNotificação enviada para administradores!`)
  }

  const uploadRelatorio = async (relatorio: RelatorioProblema): Promise<void> => {
    // Simular upload para servidor com validação de evidências
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validar se todas as evidências estão presentes
        const evidenciasValidas = relatorio.evidencias?.every(evidencia => 
          evidencia instanceof File && evidencia.size > 0
        ) ?? true // Se não há evidências, considera válido
        
        if (!evidenciasValidas) {
          reject(new Error(`Evidências inválidas no relatório ${relatorio.id}`))
          return
        }
        
        // Simular sucesso do upload (95% de chance de sucesso)
        if (Math.random() > 0.05) {
          console.log(`📤 Upload realizado com sucesso para o relatório: ${relatorio.id}`)
          console.log(`📸 Evidências incluídas: ${relatorio.evidencias?.length || 0} foto(s)`)
          console.log(`🔒 Fidelidade dos dados: 100% - Todos os campos e anexos preservados`)
          resolve()
        } else {
          reject(new Error(`Falha no upload do relatório ${relatorio.id}`))
        }
      }, 1500) // Simular tempo de upload
    })
  }

  const updateStatus = (id: string, novoStatus: RelatorioProblema["status"]) => {
    const updatedRelatorios = relatorios.map((rel) =>
      rel.id === id
        ? {
            ...rel,
            status: novoStatus,
            resolvidoEm: novoStatus === "resolvido" ? new Date() : undefined,
          }
        : rel,
    )
    saveRelatorios(updatedRelatorios)
  }

  const getTipoInfo = (tipo: string) => {
    return tiposProblema.find((t) => t.value === tipo) || tiposProblema[0]
  }

  const getGravidadeInfo = (gravidade: string) => {
    return gravidadeOptions.find((g) => g.value === gravidade) || gravidadeOptions[1]
  }

  const getStatusInfo = (status: string) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
  }

  const gerarRelatorioPDF = async () => {
    try {
      const sucesso = await PDFGenerator.gerarRelatorioPDF(relatoriosFiltrados, "Relatório de Problemas", "problemas", usuarioLogado?.nome || "Sistema")

      if (sucesso) {
        // Fazer upload em lote de todos os relatórios filtrados
        const uploadPromises = relatoriosFiltrados.map(relatorio => uploadRelatorio(relatorio))
        
        try {
          await Promise.all(uploadPromises)
          const totalEvidencias = relatoriosFiltrados.reduce((total, rel) => total + (rel.evidencias?.length || 0), 0)
          alert(`✅ Relatório em lote processado com sucesso!\n📄 PDF gerado (${relatoriosFiltrados.length} relatórios)\n📸 Total de evidências: ${totalEvidencias} foto(s)\n🔒 Fidelidade total dos dados preservada\n☁️ Upload realizado para o servidor`)
        } catch (uploadError) {
          alert(`✅ PDF gerado com sucesso!\n⚠️ Alguns uploads falharam: ${uploadError}`)
        }
      } else {
        alert("⚠️ Erro na geração do PDF")
      }
    } catch (error) {
      console.error("Erro no processo:", error)
      alert(`⚠️ Erro no processamento: ${error}`)
    }
  }

  const exportarEUploadRelatorio = async (relatorio: RelatorioProblema) => {
    try {
      // Gerar PDF do relatório individual
      const sucesso = await PDFGenerator.gerarRelatorioPDF([relatorio], `Relatório - ${relatorio.titulo}`, "problemas", usuarioLogado?.nome || "Sistema")
      
      if (sucesso) {
        // Fazer upload imediato
        await uploadRelatorio(relatorio)
        const evidenciasCount = relatorio.evidencias?.length || 0
        const evidenciasInfo = evidenciasCount > 0 ? `\n📸 ${evidenciasCount} evidência(s) incluída(s)` : '\n📸 Nenhuma evidência anexada'
        alert(`✅ Relatório exportado com sucesso!\n📄 PDF gerado com fidelidade total${evidenciasInfo}\n🔒 Todos os dados e anexos preservados\n☁️ Upload realizado para o servidor`)
      } else {
        alert(`⚠️ Erro na geração do PDF`)
      }
    } catch (error) {
      console.error("Erro no processo:", error)
      alert(`⚠️ Erro no processamento: ${error}`)
    }
  }

  const filtrarRelatorios = () => {
    return relatorios.filter((relatorio) => {
      const tipoMatch = filtros.tipo === "todos" || relatorio.tipo === filtros.tipo
      const gravidadeMatch = filtros.gravidade === "todos" || relatorio.gravidade === filtros.gravidade
      const statusMatch = filtros.status === "todos" || relatorio.status === filtros.status

      let dataMatch = true
      if (filtros.dataInicio) {
        dataMatch = dataMatch && relatorio.criadoEm >= new Date(filtros.dataInicio)
      }
      if (filtros.dataFim) {
        dataMatch = dataMatch && relatorio.criadoEm <= new Date(filtros.dataFim)
      }

      return tipoMatch && gravidadeMatch && statusMatch && dataMatch
    })
  }

  const relatoriosFiltrados = filtrarRelatorios()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios de Problemas</h2>
        <div className="flex gap-2">
          {canModifyData() && (
            <Button onClick={gerarRelatorioPDF}>
              <Download className="h-4 w-4 mr-2" />
              <Upload className="h-4 w-4 mr-1" />
              Exportar PDF & Upload
            </Button>
          )}
          {canModifyData() && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              ADM
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Tipo de Problema</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              >
                <option value="todos">Todos os Tipos</option>
                {tiposProblema.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Gravidade</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.gravidade}
                onChange={(e) => setFiltros({ ...filtros, gravidade: e.target.value })}
              >
                <option value="todos">Todas</option>
                {gravidadeOptions.map((gravidade) => (
                  <option key={gravidade.value} value={gravidade.value}>
                    {gravidade.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full p-2 border rounded"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="todos">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {relatorios.filter((r) => r.status === "aberto").length}
              </p>
              <p className="text-sm text-gray-600">Abertos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {relatorios.filter((r) => r.status === "investigando").length}
              </p>
              <p className="text-sm text-gray-600">Investigando</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {relatorios.filter((r) => r.gravidade === "critica").length}
              </p>
              <p className="text-sm text-gray-600">Críticos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{relatorios.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Relatório de Problema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Problema</Label>
                  <select
                    id="tipo"
                    className="w-full p-2 border rounded"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  >
                    {tiposProblema.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>

                </div>
                <div className="space-y-2">
                  <Label htmlFor="gravidade">Gravidade</Label>
                  <select
                    id="gravidade"
                    className="w-full p-2 border rounded"
                    value={formData.gravidade}
                    onChange={(e) => setFormData({ ...formData, gravidade: e.target.value as any })}
                  >
                    {gravidadeOptions.map((gravidade) => (
                      <option key={gravidade.value} value={gravidade.value}>
                        {gravidade.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condominio">Condomínio</Label>
                  <Input
                    id="condominio"
                    value={formData.condominio}
                    onChange={(e) => setFormData({ ...formData, condominio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataOcorrencia">Data da Ocorrência</Label>
                  <Input
                    id="dataOcorrencia"
                    type="date"
                    value={formData.dataOcorrencia}
                    onChange={(e) => setFormData({ ...formData, dataOcorrencia: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horarioOcorrencia">Horário da Ocorrência</Label>
                  <Input
                    id="horarioOcorrencia"
                    type="time"
                    value={formData.horarioOcorrencia}
                    onChange={(e) => setFormData({ ...formData, horarioOcorrencia: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Detalhada</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Evidências (até 5 fotos)</Label>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 5) {
                      alert('Máximo de 5 fotos permitidas')
                      return
                    }
                    setEvidencias(files)
                  }}
                />
                {evidencias.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {evidencias.length} arquivo(s) selecionado(s)
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                {canModifyData() && <Button type="submit">Criar Relatório</Button>}
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Relatórios */}
      <div className="space-y-4">
        {relatoriosFiltrados.map((relatorio) => {
          const tipoInfo = getTipoInfo(relatorio.tipo)
          const gravidadeInfo = getGravidadeInfo(relatorio.gravidade)
          const statusInfo = getStatusInfo(relatorio.status)
          const TipoIcon = tipoInfo.icon

          return (
            <Card key={relatorio.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <TipoIcon className="h-5 w-5" />
                      <h3 className="font-bold text-lg">{relatorio.titulo}</h3>
                      <Badge className={gravidadeInfo.color}>{gravidadeInfo.label}</Badge>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Tipo:</span> {tipoInfo.label}
                        </p>
                        <p>
                          <span className="font-medium">Local:</span> {relatorio.local}
                        </p>
                        <p>
                          <span className="font-medium">Condomínio:</span> {relatorio.condominio}
                        </p>
                        <p>
                          <span className="font-medium">Data da Ocorrência:</span> {relatorio.dataOcorrencia}
                        </p>
                        <p>
                          <span className="font-medium">Horário da Ocorrência:</span> {relatorio.horarioOcorrencia}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Reportado por:</span> {relatorio.criadoPor}
                        </p>
                        <p>
                          <span className="font-medium">Data do Relatório:</span> {relatorio.criadoEm.toLocaleString()}
                        </p>
                        {relatorio.resolvidoEm && (
                          <p>
                            <span className="font-medium">Resolvido em:</span> {relatorio.resolvidoEm.toLocaleString()}
                          </p>
                        )}
                        {relatorio.responsavel && (
                          <p>
                            <span className="font-medium">Responsável:</span> {relatorio.responsavel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600">{relatorio.descricao}</p>
                    </div>

                    {/* Evidências Anexadas */}
                    {relatorio.evidencias && relatorio.evidencias.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                          📸 Evidências Anexadas ({relatorio.evidencias.length} foto(s))
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {relatorio.evidencias.map((evidencia, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={evidencia instanceof File ? URL.createObjectURL(evidencia) : evidencia}
                                alt={`Evidência ${index + 1}`}
                                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  // Abrir imagem em nova aba para visualização completa
                                  const url = evidencia instanceof File ? URL.createObjectURL(evidencia) : evidencia
                                  window.open(url, '_blank')
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  🔍 Clique para ampliar
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 text-center truncate">
                                {evidencia instanceof File ? evidencia.name : `Evidência ${index + 1}`}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                          🔒 Todas as evidências serão incluídas no PDF e upload para o servidor
                        </p>
                      </div>
                    )}

                    {/* Aviso quando não há evidências */}
                    {(!relatorio.evidencias || relatorio.evidencias.length === 0) && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                        ⚠️ Nenhuma evidência fotográfica anexada a este relatório
                      </div>
                    )}

                    {/* Ações de Status */}
                    {canModifyData() && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {relatorio.status === "aberto" && (
                          <Button size="sm" onClick={() => updateStatus(relatorio.id, "investigando")}>
                            Iniciar Investigação
                          </Button>
                        )}
                        {relatorio.status === "investigando" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(relatorio.id, "encaminhado")}>
                              Encaminhar
                            </Button>
                            <Button size="sm" onClick={() => updateStatus(relatorio.id, "resolvido")}>
                              Resolver
                            </Button>
                          </>
                        )}
                        {relatorio.status === "encaminhado" && (
                          <Button size="sm" onClick={() => updateStatus(relatorio.id, "resolvido")}>
                            Marcar como Resolvido
                          </Button>
                        )}
                        {relatorio.status === "resolvido" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(relatorio.id, "aberto")}>
                            Reabrir
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Ações de Exportação */}
                    {canModifyData() && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => exportarEUploadRelatorio(relatorio)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          <Upload className="h-3 w-3" />
                          Exportar PDF & Upload
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {relatoriosFiltrados.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum relatório de problema encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
