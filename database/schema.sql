-- Criação das tabelas para o sistema Up Control

-- Tabela de condomínios
CREATE TABLE condominios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) CHECK (perfil IN ('admin', 'operador', 'visualizador')) DEFAULT 'visualizador',
  ativo BOOLEAN DEFAULT true,
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pessoas (moradores, visitantes, etc.)
CREATE TABLE pessoas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  tipo VARCHAR(20) CHECK (tipo IN ('morador', 'visitante', 'prestador', 'funcionario')) NOT NULL,
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logos
CREATE TABLE logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões
CREATE TABLE sessoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios de acesso
CREATE TABLE relatorios_acesso (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE NOT NULL,
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE NOT NULL,
  tipo_acesso VARCHAR(10) CHECK (tipo_acesso IN ('entrada', 'saida')) NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de rede
CREATE TABLE configuracoes_rede (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  ip VARCHAR(15),
  porta INTEGER,
  protocolo VARCHAR(10),
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de auditoria
CREATE TABLE auditoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  acao VARCHAR(100) NOT NULL,
  tabela VARCHAR(50) NOT NULL,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_condominio ON usuarios(condominio_id);
CREATE INDEX idx_pessoas_cpf ON pessoas(cpf);
CREATE INDEX idx_pessoas_condominio ON pessoas(condominio_id);
CREATE INDEX idx_relatorios_pessoa ON relatorios_acesso(pessoa_id);
CREATE INDEX idx_relatorios_condominio ON relatorios_acesso(condominio_id);
CREATE INDEX idx_relatorios_data ON relatorios_acesso(data_hora);
CREATE INDEX idx_sessoes_usuario ON sessoes(usuario_id);
CREATE INDEX idx_sessoes_token ON sessoes(token);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_tabela ON auditoria(tabela);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_condominios_updated_at BEFORE UPDATE ON condominios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logos_updated_at BEFORE UPDATE ON logos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_rede_updated_at BEFORE UPDATE ON configuracoes_rede FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_rede ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (podem ser ajustadas conforme necessário)
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid()::text = id::text);

-- Inserir dados iniciais
INSERT INTO condominios (nome, endereco, telefone, email) VALUES 
('Condomínio Exemplo', 'Rua das Flores, 123', '(11) 99999-9999', 'contato@exemplo.com');

INSERT INTO usuarios (nome, email, senha, perfil, condominio_id) VALUES 
('Administrador', 'admin@upcontrol.com', '$2b$10$rQZ9QmjlQ8K8K8K8K8K8K8', 'admin', (SELECT id FROM condominios LIMIT 1)),
('Bruno Vieira', 'bruno.vieira@sistema.com', '$2b$10$JDIvPO0EqRwxUSn3Wt0C1udmO0lHh2MPdBvurpMdmvaf11AIw3w5.', 'admin', (SELECT id FROM condominios LIMIT 1));

-- Comentários nas tabelas
COMMENT ON TABLE condominios IS 'Tabela de condomínios cadastrados no sistema';
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema com diferentes perfis de acesso';
COMMENT ON TABLE pessoas IS 'Tabela de pessoas (moradores, visitantes, prestadores, funcionários)';
COMMENT ON TABLE logos IS 'Tabela de logos personalizados por condomínio';
COMMENT ON TABLE sessoes IS 'Tabela de controle de sessões ativas dos usuários';
COMMENT ON TABLE relatorios_acesso IS 'Tabela de registros de entrada e saída de pessoas';
COMMENT ON TABLE configuracoes_rede IS 'Tabela de configurações de rede e dispositivos';
COMMENT ON TABLE auditoria IS 'Tabela de auditoria para rastreamento de ações no sistema';