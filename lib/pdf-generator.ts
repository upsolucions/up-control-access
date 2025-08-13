"use client"

// Biblioteca para geração de PDF real
export class PDFGenerator {
  // Função auxiliar para converter File para base64
  static async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      // Verificar se o arquivo é válido
      if (!file || !(file instanceof File || file instanceof Blob)) {
        reject(new Error('Arquivo inválido: deve ser um File ou Blob'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Falha ao ler o arquivo'))
        }
      }
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo: ' + reader.error?.message))
      
      try {
        reader.readAsDataURL(file)
      } catch (error) {
        reject(new Error('Erro ao iniciar leitura do arquivo: ' + error))
      }
    })
  }

  // Função para buscar logo do tipo PDF
  static getLogoPDF(): string | null {
    try {
      const savedLogos = localStorage.getItem('logos')
      if (savedLogos) {
        const logos = JSON.parse(savedLogos)
        const logoPDF = logos.find((logo: any) => logo.tipo === 'pdf' && logo.ativo)
        return logoPDF ? logoPDF.url : null
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar logo PDF:', error)
      return null
    }
  }

  static async gerarRelatorioPDF(dados: any, titulo: string, tipo: string, usuarioLogado: string = "Sistema", logoAtivo: string | null = null) {
    try {
      // Buscar logo PDF automaticamente se não foi fornecido
      const logoParaPDF = logoAtivo || this.getLogoPDF()
      
      // Criar conteúdo HTML para o PDF
      const htmlContent = await this.criarHTMLRelatorio(dados, titulo, tipo, usuarioLogado, logoParaPDF)

      // Criar um elemento temporário para impressão
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Popup bloqueado. Permita popups para gerar PDF.")
      }

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Aguardar carregamento e imprimir
      printWindow.onload = () => {
        printWindow.print()
        // Fechar janela após impressão
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }

      return true
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar PDF: " + error)
      return false
    }
  }

  static async criarHTMLRelatorio(dados: any, titulo: string, tipo: string, usuarioLogado: string = "Sistema", logoAtivo: string | null = null): Promise<string> {
    const dataAtual = new Date().toLocaleString("pt-BR")

    let conteudoTabela = ""

    if (tipo === "acesso") {
      conteudoTabela = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Usuário</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Local</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Dispositivo</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Horário</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map(
                (item: any) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.usuario}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.local}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.dispositivo}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.horario}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.status}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
    } else if (tipo === "dispositivos") {
      conteudoTabela = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Nome</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">IP</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Tipo</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Status</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Condomínio</th>
            </tr>
          </thead>
          <tbody>
            ${dados
              .map(
                (item: any) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.nomeCustomizado || item.hostname}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.ip}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.tipo}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.status}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.condominio || "N/A"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
    } else if (tipo === "problemas") {
      // Gerar relatórios detalhados com evidências
      const relatoriosDetalhados = await Promise.all(dados.map(async (item: any, index: number) => {
        const evidenciasHTML = item.evidencias && item.evidencias.length > 0 
          ? `
            <div style="margin-top: 15px; padding: 10px; background-color: #f8fafc; border-radius: 5px;">
              <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">📸 Evidências Anexadas (${item.evidencias.length} foto(s)):</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                ${await Promise.all(item.evidencias.map(async (evidencia: File, imgIndex: number) => {
                   try {
                     // Converter File para base64 para incluir no PDF
                     const base64String = await this.fileToBase64(evidencia)
                     
                     return `
                       <div style="text-align: center; border: 1px solid #e5e7eb; padding: 5px; border-radius: 3px;">
                         <img src="${base64String}" 
                              alt="Evidência ${imgIndex + 1} - ${evidencia.name}" 
                              style="max-width: 180px; max-height: 120px; object-fit: cover; border-radius: 3px;" 
                              onerror="this.src='/placeholder.svg'" />
                         <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280;">Evidência ${imgIndex + 1}</p>
                         <p style="margin: 2px 0 0 0; font-size: 9px; color: #9ca3af;">${evidencia.name}</p>
                       </div>
                     `
                   } catch (error) {
                     console.error('Erro ao converter imagem:', error)
                     return `
                       <div style="text-align: center; border: 1px solid #e5e7eb; padding: 5px; border-radius: 3px; background-color: #fef2f2;">
                         <div style="width: 180px; height: 120px; display: flex; align-items: center; justify-content: center; background-color: #fee2e2; border-radius: 3px;">
                           <span style="color: #dc2626; font-size: 12px;">❌ Erro ao carregar</span>
                         </div>
                         <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280;">Evidência ${imgIndex + 1}</p>
                         <p style="margin: 2px 0 0 0; font-size: 9px; color: #9ca3af;">${evidencia.name}</p>
                       </div>
                     `
                   }
                 })).then(results => results.join(''))}
              </div>
            </div>
          `
          : '<div style="margin-top: 10px; padding: 8px; background-color: #fef3c7; border-radius: 3px; font-size: 12px; color: #92400e;">⚠️ Nenhuma evidência fotográfica anexada</div>'

        return `
          <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; page-break-inside: avoid;">
            <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 15px;">
              <h3 style="margin: 0; color: #1f2937; font-size: 16px;">📋 Relatório #${index + 1}: ${item.titulo}</h3>
              <div style="margin-top: 5px; display: flex; gap: 10px; flex-wrap: wrap;">
                <span style="background-color: ${item.gravidade === 'critica' ? '#fecaca' : item.gravidade === 'alta' ? '#fed7aa' : item.gravidade === 'media' ? '#fef3c7' : '#d1fae5'}; 
                             color: ${item.gravidade === 'critica' ? '#991b1b' : item.gravidade === 'alta' ? '#c2410c' : item.gravidade === 'media' ? '#92400e' : '#065f46'}; 
                             padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                  ${item.gravidade.toUpperCase()}
                </span>
                <span style="background-color: ${item.status === 'resolvido' ? '#d1fae5' : item.status === 'investigando' ? '#fef3c7' : '#fecaca'}; 
                             color: ${item.status === 'resolvido' ? '#065f46' : item.status === 'investigando' ? '#92400e' : '#991b1b'}; 
                             padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                  ${item.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
              <div>
                <p style="margin: 5px 0; font-size: 13px;"><strong>🏷️ Tipo:</strong> ${item.tipo.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>📍 Local:</strong> ${item.local}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>🏢 Condomínio:</strong> ${item.condominio}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>📅 Data da Ocorrência:</strong> ${item.dataOcorrencia}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>🕐 Horário:</strong> ${item.horarioOcorrencia}</p>
              </div>
              <div>
                <p style="margin: 5px 0; font-size: 13px;"><strong>👤 Reportado por:</strong> ${usuarioLogado}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>📝 Data do Relatório:</strong> ${new Date(item.criadoEm).toLocaleString('pt-BR')}</p>
                ${item.resolvidoEm ? `<p style="margin: 5px 0; font-size: 13px;"><strong>✅ Resolvido em:</strong> ${new Date(item.resolvidoEm).toLocaleString('pt-BR')}</p>` : ''}
                ${item.responsavel ? `<p style="margin: 5px 0; font-size: 13px;"><strong>👨‍💼 Responsável:</strong> ${item.responsavel}</p>` : ''}
              </div>
            </div>
            
            <div style="margin-bottom: 15px; padding: 12px; background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 0 4px 4px 0;">
              <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">📄 Descrição Detalhada:</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #4b5563;">${item.descricao}</p>
            </div>
            
            ${evidenciasHTML}
            
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: right;">
              🔒 Relatório gerado com fidelidade total dos dados • ID: ${item.id}
            </div>
          </div>
        `
      }))

      conteudoTabela = `
        <div style="margin-top: 20px;">
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📊 Resumo Executivo</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; font-size: 13px;">
              <div><strong>Total de Relatórios:</strong> ${dados.length}</div>
              <div><strong>Críticos:</strong> ${dados.filter((item: any) => item.gravidade === 'critica').length}</div>
              <div><strong>Resolvidos:</strong> ${dados.filter((item: any) => item.status === 'resolvido').length}</div>
              <div><strong>Em Aberto:</strong> ${dados.filter((item: any) => item.status === 'aberto').length}</div>
            </div>
          </div>
          
          <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">📋 Relatórios Detalhados com Evidências</h3>
          ${relatoriosDetalhados}
        </div>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${titulo}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
          }
          .info { 
            margin-bottom: 20px; 
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
          }
          table { 
            font-size: 12px; 
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
            ${logoAtivo ? `<img src="${logoAtivo}" alt="Logo" style="max-height: 80px; max-width: 300px; object-fit: contain;" />` : ''}
            <div style="text-align: center;">
              <h1 style="margin: 0; color: #1f2937;">🛡️ Up Control Access</h1>
            </div>
          </div>
          <h2>${titulo}</h2>
        </div>
        
        <div class="info">
          <p><strong>Data de Geração:</strong> ${dataAtual}</p>
          <p><strong>Total de Registros:</strong> ${dados.length}</p>
          <p><strong>Tipo de Relatório:</strong> ${tipo.toUpperCase()}</p>
        </div>

        ${conteudoTabela}

        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema Up Control Access</p>
          <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
      </body>
      </html>
    `
  }

  static async baixarCSV(dados: any[], nomeArquivo: string) {
    try {
      // Converter dados para CSV
      const headers = Object.keys(dados[0] || {})
      const csvContent = [
        headers.join(","),
        ...dados.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              // Escapar aspas e vírgulas
              if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value
            })
            .join(","),
        ),
      ].join("\n")

      // Criar blob e download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `${nomeArquivo}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return true
    } catch (error) {
      console.error("Erro ao gerar CSV:", error)
      return false
    }
  }
}
