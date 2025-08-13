"use client"

// Simulação de banco de dados local para persistência
class LocalDatabase {
  private storage: Storage

  constructor() {
    this.storage = typeof window !== "undefined" ? window.localStorage : ({} as Storage)
  }

  // Salvar dados
  save(key: string, data: any): void {
    try {
      this.storage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    }
  }

  // Carregar dados
  load(key: string): any {
    try {
      const data = this.storage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      return null
    }
  }

  // Remover dados
  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error("Erro ao remover dados:", error)
    }
  }

  // Limpar todos os dados
  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.error("Erro ao limpar dados:", error)
    }
  }

  // Listar todas as chaves
  keys(): string[] {
    try {
      return Object.keys(this.storage)
    } catch (error) {
      console.error("Erro ao listar chaves:", error)
      return []
    }
  }
}

export const db = new LocalDatabase()

// Funções específicas para cada entidade
export const DatabaseService = {
  // Usuários
  saveUsers: (users: any[]) => db.save("control_access_users", users),
  loadUsers: () => db.load("control_access_users") || [],

  // Condomínios
  saveCondominios: (condominios: any[]) => db.save("control_access_condominios", condominios),
  loadCondominios: () => db.load("control_access_condominios") || [],

  // Dispositivos
  saveDispositivos: (dispositivos: any[]) => db.save("control_access_dispositivos", dispositivos),
  loadDispositivos: () => db.load("control_access_dispositivos") || [],

  // Empresas
  saveEmpresas: (empresas: any[]) => db.save("control_access_empresas", empresas),
  loadEmpresas: () => db.load("control_access_empresas") || [],

  // Relatórios
  saveRelatorios: (relatorios: any[]) => db.save("control_access_relatorios", relatorios),
  loadRelatorios: () => db.load("control_access_relatorios") || [],

  // Defeitos
  saveDefeitos: (defeitos: any[]) => db.save("control_access_defeitos", defeitos),
  loadDefeitos: () => db.load("control_access_defeitos") || [],

  // Ordens de Serviço
  saveOrdens: (ordens: any[]) => db.save("control_access_ordens", ordens),
  loadOrdens: () => db.load("control_access_ordens") || [],

  // Logs de acesso
  saveLogs: (logs: any[]) => db.save("control_access_logs", logs),
  loadLogs: () => db.load("control_access_logs") || [],

  // Configurações do sistema
  saveConfig: (config: any) => db.save("control_access_config", config),
  loadConfig: () => db.load("control_access_config") || {},

  // Backup completo
  createBackup: () => {
    const backup = {
      timestamp: new Date().toISOString(),
      users: DatabaseService.loadUsers(),
      condominios: DatabaseService.loadCondominios(),
      dispositivos: DatabaseService.loadDispositivos(),
      empresas: DatabaseService.loadEmpresas(),
      relatorios: DatabaseService.loadRelatorios(),
      defeitos: DatabaseService.loadDefeitos(),
      ordens: DatabaseService.loadOrdens(),
      logs: DatabaseService.loadLogs(),
      config: DatabaseService.loadConfig(),
    }

    db.save("control_access_backup", backup)
    return backup
  },

  // Restaurar backup
  restoreBackup: (backup: any) => {
    try {
      DatabaseService.saveUsers(backup.users || [])
      DatabaseService.saveCondominios(backup.condominios || [])
      DatabaseService.saveDispositivos(backup.dispositivos || [])
      DatabaseService.saveEmpresas(backup.empresas || [])
      DatabaseService.saveRelatorios(backup.relatorios || [])
      DatabaseService.saveDefeitos(backup.defeitos || [])
      DatabaseService.saveOrdens(backup.ordens || [])
      DatabaseService.saveLogs(backup.logs || [])
      DatabaseService.saveConfig(backup.config || {})
      return true
    } catch (error) {
      console.error("Erro ao restaurar backup:", error)
      return false
    }
  },
}
