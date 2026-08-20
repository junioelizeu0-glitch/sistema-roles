-- ============================================================
-- Sistema de Rolês — Schema PostgreSQL / Supabase
-- ============================================================

-- 1. Tabela de Qualificações
CREATE TABLE IF NOT EXISTS qualificacoes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    preco_padrao NUMERIC(10, 2) NOT NULL
);

INSERT INTO qualificacoes (id, nome, preco_padrao) VALUES
('ALTO', 'ALTO', 250.00),
('MEDIA', 'MÉDIA', 120.00),
('DE_BOAS', 'DE BOAS', 60.00),
('PASSEIO', 'PASSEIO', 30.00)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabela de Categorias Dinâmicas
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT UNIQUE NOT NULL
);

INSERT INTO categorias (nome) VALUES
('Restaurante'), ('Pizzaria'), ('Hamburgueria'), ('Japonês'),
('Italiano'), ('Bar / Pub'), ('Café & Doceria'), ('Mexicano'),
('Passeio ao Ar Livre'), ('Sorveteria')
ON CONFLICT (nome) DO NOTHING;

-- 3. Tabela de Regiões Dinâmicas
CREATE TABLE IF NOT EXISTS regioes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT UNIQUE NOT NULL
);

INSERT INTO regioes (nome) VALUES
('Zona Sul'), ('Zona Norte'), ('Zona Oeste'), ('Zona Leste'),
('Centro'), ('Região Metropolitana')
ON CONFLICT (nome) DO NOTHING;

-- 4. Tabela de Estabelecimentos (com endereço completo)
CREATE TABLE IF NOT EXISTS estabelecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    regiao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    qualificacao_id TEXT REFERENCES qualificacoes(id),
    preco_medio NUMERIC(10, 2) NOT NULL,
    endereco TEXT, -- Campo de endereço para integração com Waze
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'AGENDADO', 'VISITADO', 'DESCARTADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna endereco caso a tabela já existisse
ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS endereco TEXT;

-- 5. Tabela de Saldo Mensal
CREATE TABLE IF NOT EXISTS saldo_mensal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ano_mes VARCHAR(7) UNIQUE NOT NULL, -- Formato: 'YYYY-MM'
    valor_disponivel NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Visitas (com foto_url para guardar foto da experiência)
CREATE TABLE IF NOT EXISTS visitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    data_visita DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_gasto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    nota INT CHECK (nota >= 1 AND nota <= 5),
    voltariam BOOLEAN NOT NULL DEFAULT true,
    comentario TEXT,
    foto_url TEXT, -- URL ou Base64 da foto da visita
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna foto_url caso a tabela já existisse
ALTER TABLE visitas ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- 7. Trigger para atualizar status do estabelecimento automaticamente para VISITADO
CREATE OR REPLACE FUNCTION fn_marcar_estabelecimento_visitado()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE estabelecimentos
    SET status = 'VISITADO'
    WHERE id = NEW.estabelecimento_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualiza_status_visitado ON visitas;
CREATE TRIGGER trg_atualiza_status_visitado
AFTER INSERT ON visitas
FOR EACH ROW
EXECUTE FUNCTION fn_marcar_estabelecimento_visitado();

-- 8. View para Cálculo do Saldo Atual do Mês (v_saldo_atual)
CREATE OR REPLACE VIEW v_saldo_atual AS
SELECT 
    sm.ano_mes,
    sm.valor_disponivel,
    COALESCE(SUM(v.valor_gasto), 0) AS valor_gasto_total,
    (sm.valor_disponivel - COALESCE(SUM(v.valor_gasto), 0)) AS valor_restante
FROM saldo_mensal sm
LEFT JOIN visitas v ON TO_CHAR(v.data_visita, 'YYYY-MM') = sm.ano_mes
GROUP BY sm.ano_mes, sm.valor_disponivel;

-- 9. Habilitar RLS (Row Level Security) e Políticas de Acesso
ALTER TABLE qualificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE regioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldo_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total a qualificacoes" ON qualificacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a regioes" ON regioes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a estabelecimentos" ON estabelecimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a saldo_mensal" ON saldo_mensal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
