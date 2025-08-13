"use client"

// Integração com Supabase para persistência de dados
import { supabase, Usuario, Condominio, Pessoa, Logo, Sessao, RelatorioAcesso } from './supabase';

// Re-exportar interfaces para compatibilidade
export type { Usuario, Condominio, Pessoa, Logo, Sessao, RelatorioAcesso };

// Interface para compatibilidade com código existente
export interface UsuarioLegacy {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin' | 'operador' | 'visualizador';
  ativo: boolean;
  condominioId?: string;
}

export interface PessoaLegacy {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  tipo: 'morador' | 'visitante' | 'prestador' | 'funcionario';
  condominioId: string;
  ativo: boolean;
}

export interface LogoLegacy {
  id: string;
  nome: string;
  url: string;
  ativo: boolean;
}

export interface SessaoLegacy {
  id: string;
  usuarioId: string;
  token: string;
  expiresAt: Date;
}

export interface RelatorioAcessoLegacy {
  id: string;
  pessoaId: string;
  condominioId: string;
  tipoAcesso: 'entrada' | 'saida';
  dataHora: Date;
  observacoes?: string;
}

// Classe para integração com Supabase
class SupabaseDatabase {
  // Método auxiliar para converter dados do Supabase para formato legacy
  private convertToLegacy<T extends Record<string, any>>(data: T[], mapping: Record<string, string>): any[] {
    return data.map(item => {
      const converted: any = {};
      Object.keys(mapping).forEach(legacyKey => {
        const supabaseKey = mapping[legacyKey];
        converted[legacyKey] = item[supabaseKey];
      });
      return converted;
    });
  }

  // Método auxiliar para converter dados legacy para formato Supabase
  private convertFromLegacy<T extends Record<string, any>>(data: T, mapping: Record<string, string>): any {
    const converted: any = {};
    Object.keys(mapping).forEach(legacyKey => {
      const supabaseKey = mapping[legacyKey];
      if (data[legacyKey] !== undefined) {
        converted[supabaseKey] = data[legacyKey];
      }
    });
    return converted;
  }

  // Fallback para localStorage em caso de erro do Supabase
  private getStorageKey(table: string): string {
    return `upcontrol_${table}`;
  }

  private getLocalData<T>(table: string): T[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erro ao carregar dados locais da tabela ${table}:`, error);
      return [];
    }
  }

  private setLocalData<T>(table: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Erro ao salvar dados locais na tabela ${table}:`, error);
      this.cleanupOldData();
    }
  }

  private cleanupOldData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      const oldKeys = keys.filter(key => key.startsWith('control_access_'));
      oldKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
    }
  }

  // Métodos de compatibilidade com a interface antiga
  save(key: string, data: any): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }

  load(key: string): any {
    try {
      if (typeof window !== "undefined") {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Erro ao remover dados:", error);
    }
  }

  clear(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
    }
  }

  keys(): string[] {
    try {
      if (typeof window !== "undefined") {
        return Object.keys(localStorage);
      }
      return [];
    } catch (error) {
      console.error("Erro ao listar chaves:", error);
      return [];
    }
  }
}

export const db = new SupabaseDatabase()

// Funções específicas para cada entidade com integração Supabase

// Mapeamento de campos para compatibilidade
const usuarioMapping = {
  id: 'id',
  nome: 'nome',
  email: 'email',
  senha: 'senha',
  perfil: 'perfil',
  ativo: 'ativo',
  condominioId: 'condominio_id'
};

// Usuários
export const getUsuarios = async (): Promise<UsuarioLegacy[]> => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários no Supabase:', error);
      // Fallback para localStorage
      return db.load('usuarios') || [
        {
          id: '1',
          nome: 'Administrador',
          email: 'admin@upcontrol.com',
          senha: 'admin123',
          perfil: 'admin',
          ativo: true
        },
        {
          id: '2',
          nome: 'Operador',
          email: 'operador@upcontrol.com',
          senha: 'op123',
          perfil: 'operador',
          ativo: true
        }
      ];
    }

    const usuarios = data?.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      senha: user.senha,
      perfil: user.perfil,
      ativo: user.ativo,
      condominioId: user.condominio_id
    })) || [];

    // Backup no localStorage
    db.save('usuarios', usuarios);
    return usuarios;
  } catch (error) {
    console.error('Erro de conexão com Supabase:', error);
    return db.load('usuarios') || [];
  }
};

export const salvarUsuario = async (usuario: UsuarioLegacy): Promise<void> => {
  try {
    const userData = {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
      condominio_id: usuario.condominioId
    };

    if (usuario.id && usuario.id !== 'new') {
      // Atualizar usuário existente
      const { error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', usuario.id);

      if (error) {
        console.error('Erro ao atualizar usuário no Supabase:', error);
        throw error;
      }
    } else {
      // Criar novo usuário
      const { error } = await supabase
        .from('usuarios')
        .insert([userData]);

      if (error) {
        console.error('Erro ao criar usuário no Supabase:', error);
        throw error;
      }
    }

    // Backup no localStorage
    const usuarios = await getUsuarios();
    db.save('usuarios', usuarios);
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    // Fallback para localStorage
    const usuarios = db.load('usuarios') || [];
    const index = usuarios.findIndex((u: UsuarioLegacy) => u.id === usuario.id);
    
    if (index >= 0) {
      usuarios[index] = usuario;
    } else {
      usuario.id = Date.now().toString();
      usuarios.push(usuario);
    }
    
    db.save('usuarios', usuarios);
  }
};

export const removerUsuario = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover usuário no Supabase:', error);
      throw error;
    }

    // Backup no localStorage
    const usuarios = await getUsuarios();
    db.save('usuarios', usuarios);
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    // Fallback para localStorage
    const usuarios = db.load('usuarios') || [];
    const usuariosFiltrados = usuarios.filter((u: UsuarioLegacy) => u.id !== id);
    db.save('usuarios', usuariosFiltrados);
  }
};

// Condomínios
export const getCondominios = async (): Promise<Condominio[]> => {
  try {
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar condomínios no Supabase:', error);
      return db.load('condominios') || [];
    }

    const condominios = data || [];
    db.save('condominios', condominios);
    return condominios;
  } catch (error) {
    console.error('Erro de conexão com Supabase:', error);
    return db.load('condominios') || [];
  }
};

export const salvarCondominio = async (condominio: Condominio): Promise<void> => {
  try {
    const condominioData = {
      nome: condominio.nome,
      endereco: condominio.endereco,
      telefone: condominio.telefone,
      email: condominio.email,
      ativo: condominio.ativo
    };

    if (condominio.id && condominio.id !== 'new') {
      const { error } = await supabase
        .from('condominios')
        .update(condominioData)
        .eq('id', condominio.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('condominios')
        .insert([condominioData]);

      if (error) throw error;
    }

    const condominios = await getCondominios();
    db.save('condominios', condominios);
  } catch (error) {
    console.error('Erro ao salvar condomínio:', error);
    const condominios = db.load('condominios') || [];
    const index = condominios.findIndex((c: Condominio) => c.id === condominio.id);
    
    if (index >= 0) {
      condominios[index] = condominio;
    } else {
      condominio.id = Date.now().toString();
      condominios.push(condominio);
    }
    
    db.save('condominios', condominios);
  }
};

// Pessoas
export const getPessoas = async (): Promise<PessoaLegacy[]> => {
  try {
    const { data, error } = await supabase
      .from('pessoas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pessoas no Supabase:', error);
      return db.load('pessoas') || [];
    }

    const pessoas = data?.map(pessoa => ({
      id: pessoa.id,
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      telefone: pessoa.telefone,
      email: pessoa.email,
      tipo: pessoa.tipo,
      condominioId: pessoa.condominio_id,
      ativo: pessoa.ativo
    })) || [];

    db.save('pessoas', pessoas);
    return pessoas;
  } catch (error) {
    console.error('Erro de conexão com Supabase:', error);
    return db.load('pessoas') || [];
  }
};

export const salvarPessoa = async (pessoa: PessoaLegacy): Promise<void> => {
  try {
    const pessoaData = {
      nome: pessoa.nome,
      cpf: pessoa.cpf,
      telefone: pessoa.telefone,
      email: pessoa.email,
      tipo: pessoa.tipo,
      condominio_id: pessoa.condominioId,
      ativo: pessoa.ativo
    };

    if (pessoa.id && pessoa.id !== 'new') {
      const { error } = await supabase
        .from('pessoas')
        .update(pessoaData)
        .eq('id', pessoa.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('pessoas')
        .insert([pessoaData]);

      if (error) throw error;
    }

    const pessoas = await getPessoas();
    db.save('pessoas', pessoas);
  } catch (error) {
    console.error('Erro ao salvar pessoa:', error);
    const pessoas = db.load('pessoas') || [];
    const index = pessoas.findIndex((p: PessoaLegacy) => p.id === pessoa.id);
    
    if (index >= 0) {
      pessoas[index] = pessoa;
    } else {
      pessoa.id = Date.now().toString();
      pessoas.push(pessoa);
    }
    
    db.save('pessoas', pessoas);
  }
};

// Logos
export const getLogos = async (): Promise<LogoLegacy[]> => {
  try {
    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logos no Supabase:', error);
      return db.load('logos') || [];
    }

    const logos = data?.map(logo => ({
      id: logo.id,
      nome: logo.nome,
      url: logo.url,
      ativo: logo.ativo
    })) || [];

    db.save('logos', logos);
    return logos;
  } catch (error) {
    console.error('Erro de conexão com Supabase:', error);
    return db.load('logos') || [];
  }
};

export const salvarLogo = async (logo: LogoLegacy): Promise<void> => {
  try {
    const logoData = {
      nome: logo.nome,
      url: logo.url,
      ativo: logo.ativo
    };

    if (logo.id && logo.id !== 'new') {
      const { error } = await supabase
        .from('logos')
        .update(logoData)
        .eq('id', logo.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('logos')
        .insert([logoData]);

      if (error) throw error;
    }

    const logos = await getLogos();
    db.save('logos', logos);
  } catch (error) {
    console.error('Erro ao salvar logo:', error);
    const logos = db.load('logos') || [];
    const index = logos.findIndex((l: LogoLegacy) => l.id === logo.id);
    
    if (index >= 0) {
      logos[index] = logo;
    } else {
      logo.id = Date.now().toString();
      logos.push(logo);
    }
    
    db.save('logos', logos);
  }
};

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
