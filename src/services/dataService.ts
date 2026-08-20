import type {
  Estabelecimento,
  SaldoMensal,
  Visita,
  SaldoAtualView,
  CategoriaItem,
  RegiaoItem,
  Qualificacao,
  QualificacaoId,
} from '../types';
import { DEFAULT_CATEGORIAS, DEFAULT_REGIOES, QUALIFICACOES_PADRAO } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  ESTABELECIMENTOS: 'nossos_roles_estabelecimentos_v2',
  SALDO_MENSAL: 'nossos_roles_saldo_mensal_v2',
  VISITAS: 'nossos_roles_visitas_v2',
  CATEGORIAS: 'nossos_roles_categorias_v2',
  REGIOES: 'nossos_roles_regioes_v2',
  QUALIFICACOES: 'nossos_roles_qualificacoes_v2',
};

export function getCurrentAnoMes(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Dados de Exemplo Iniciais com Endereço e Fotos
const INITIAL_ESTABELECIMENTOS: Estabelecimento[] = [
  {
    id: 'est-1',
    nome: 'Fogo & Brasa Steakhouse',
    regiao: 'Zona Sul',
    categoria: 'Restaurante',
    qualificacao_id: 'ALTO',
    preco_medio: 250.00,
    endereco: 'Av. das Nações Unidas, 12551 - Broklin, São Paulo - SP',
    status: 'VISITADO',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'est-2',
    nome: 'Pizzaria Bella Napoli',
    regiao: 'Centro',
    categoria: 'Pizzaria',
    qualificacao_id: 'DE_BOAS',
    preco_medio: 70.00,
    endereco: 'Rua Treze de Maio, 678 - Bela Vista, São Paulo - SP',
    status: 'VISITADO',
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'est-3',
    nome: 'Smash & Craft Burgers',
    regiao: 'Zona Oeste',
    categoria: 'Hamburgueria',
    qualificacao_id: 'DE_BOAS',
    preco_medio: 60.00,
    endereco: 'Rua Pinheiros, 450 - Pinheiros, São Paulo - SP',
    status: 'AGENDADO',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'est-4',
    nome: 'Sakura Omakase Sushi',
    regiao: 'Zona Sul',
    categoria: 'Japonês',
    qualificacao_id: 'ALTO',
    preco_medio: 280.00,
    endereco: 'Rua Tomás Carvalhal, 320 - Paraíso, São Paulo - SP',
    status: 'PENDENTE',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

const currentMonth = getCurrentAnoMes();

const INITIAL_SALDO_MENSAL: SaldoMensal[] = [
  {
    id: 'saldo-current',
    ano_mes: currentMonth,
    valor_disponivel: 1000.00,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_VISITAS: Visita[] = [
  {
    id: 'vis-1',
    estabelecimento_id: 'est-1',
    data_visita: `${currentMonth}-05`,
    valor_gasto: 265.50,
    nota: 5,
    voltariam: true,
    comentario: 'Jantar incrível de comemoração! As carnes e sobremesas estavam impecáveis.',
    foto_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'vis-2',
    estabelecimento_id: 'est-2',
    data_visita: `${currentMonth}-10`,
    valor_gasto: 78.00,
    nota: 4,
    voltariam: true,
    comentario: 'Pizza de massa azeda divina. O ambiente é super aconchegante pra ir a dois.',
    foto_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_CATEGORIAS: CategoriaItem[] = DEFAULT_CATEGORIAS.map((c, i) => ({
  id: `cat-${i}`,
  nome: c,
}));

const INITIAL_REGIOES: RegiaoItem[] = DEFAULT_REGIOES.map((r, i) => ({
  id: `reg-${i}`,
  nome: r,
}));

function getLocalData<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Erro ao ler localStorage [${key}]:`, err);
    return initialData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Erro ao salvar localStorage [${key}]:`, err);
  }
}

export const dataService = {
  // === QUALIFICAÇÕES ===
  async getQualificacoes(): Promise<Record<QualificacaoId, Qualificacao>> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('qualificacoes').select('*');
      if (data && data.length > 0) {
        const result = { ...QUALIFICACOES_PADRAO };
        data.forEach((q: any) => {
          if (result[q.id as QualificacaoId]) {
            result[q.id as QualificacaoId] = {
              ...result[q.id as QualificacaoId],
              preco_padrao: Number(q.preco_padrao),
            };
          }
        });
        return result;
      }
    }
    return getLocalData<Record<QualificacaoId, Qualificacao>>(STORAGE_KEYS.QUALIFICACOES, QUALIFICACOES_PADRAO);
  },

  async updateQualificacao(id: QualificacaoId, precoPadrao: number): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('qualificacoes').update({ preco_padrao: precoPadrao }).eq('id', id);
    }
    const currentMap = await this.getQualificacoes();
    if (currentMap[id]) {
      currentMap[id].preco_padrao = precoPadrao;
      setLocalData(STORAGE_KEYS.QUALIFICACOES, currentMap);
    }
  },

  // === ESTABELECIMENTOS ===
  async getEstabelecimentos(): Promise<Estabelecimento[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('estabelecimentos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Estabelecimento[];
    }
    return getLocalData<Estabelecimento[]>(STORAGE_KEYS.ESTABELECIMENTOS, INITIAL_ESTABELECIMENTOS);
  },

  async addEstabelecimento(dados: Omit<Estabelecimento, 'id' | 'created_at'>): Promise<Estabelecimento> {
    const newEst: Estabelecimento = {
      ...dados,
      id: isSupabaseConfigured ? crypto.randomUUID() : `est-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('estabelecimentos').insert(newEst).select().single();
      if (!error && data) return data as Estabelecimento;
    }

    const current = getLocalData<Estabelecimento[]>(STORAGE_KEYS.ESTABELECIMENTOS, INITIAL_ESTABELECIMENTOS);
    const updated = [newEst, ...current];
    setLocalData(STORAGE_KEYS.ESTABELECIMENTOS, updated);
    return newEst;
  },

  async updateEstabelecimento(id: string, dados: Partial<Estabelecimento>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('estabelecimentos').update(dados).eq('id', id);
      return;
    }

    const current = getLocalData<Estabelecimento[]>(STORAGE_KEYS.ESTABELECIMENTOS, INITIAL_ESTABELECIMENTOS);
    const updated = current.map(item => (item.id === id ? { ...item, ...dados } : item));
    setLocalData(STORAGE_KEYS.ESTABELECIMENTOS, updated);
  },

  async deleteEstabelecimento(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('estabelecimentos').delete().eq('id', id);
      return;
    }

    const current = getLocalData<Estabelecimento[]>(STORAGE_KEYS.ESTABELECIMENTOS, INITIAL_ESTABELECIMENTOS);
    const updated = current.filter(item => item.id !== id);
    setLocalData(STORAGE_KEYS.ESTABELECIMENTOS, updated);
  },

  // === SALDO MENSAL ===
  async getSaldoMensal(anoMes: string = getCurrentAnoMes()): Promise<SaldoMensal> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('saldo_mensal').select('*').eq('ano_mes', anoMes).maybeSingle();
      if (data) return data as SaldoMensal;
    }

    const currentSaldos = getLocalData<SaldoMensal[]>(STORAGE_KEYS.SALDO_MENSAL, INITIAL_SALDO_MENSAL);
    const item = currentSaldos.find(s => s.ano_mes === anoMes);
    if (item) return item;

    const newSaldo: SaldoMensal = {
      id: `saldo-${anoMes}`,
      ano_mes: anoMes,
      valor_disponivel: 1000.00,
      created_at: new Date().toISOString(),
    };
    setLocalData(STORAGE_KEYS.SALDO_MENSAL, [...currentSaldos, newSaldo]);
    return newSaldo;
  },

  async setSaldoMensal(anoMes: string, valor: number): Promise<SaldoMensal> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('saldo_mensal')
        .upsert({ ano_mes: anoMes, valor_disponivel: valor }, { onConflict: 'ano_mes' })
        .select()
        .single();
      if (!error && data) return data as SaldoMensal;
    }

    const currentSaldos = getLocalData<SaldoMensal[]>(STORAGE_KEYS.SALDO_MENSAL, INITIAL_SALDO_MENSAL);
    const existingIndex = currentSaldos.findIndex(s => s.ano_mes === anoMes);
    
    let updatedSaldo: SaldoMensal;
    if (existingIndex >= 0) {
      updatedSaldo = { ...currentSaldos[existingIndex], valor_disponivel: valor };
      currentSaldos[existingIndex] = updatedSaldo;
    } else {
      updatedSaldo = {
        id: `saldo-${anoMes}`,
        ano_mes: anoMes,
        valor_disponivel: valor,
        created_at: new Date().toISOString(),
      };
      currentSaldos.push(updatedSaldo);
    }

    setLocalData(STORAGE_KEYS.SALDO_MENSAL, currentSaldos);
    return updatedSaldo;
  },

  // === VISITAS ===
  async getVisitas(): Promise<Visita[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('visitas').select('*').order('data_visita', { ascending: false });
      if (!error && data) return data as Visita[];
    }
    return getLocalData<Visita[]>(STORAGE_KEYS.VISITAS, INITIAL_VISITAS);
  },

  async addVisita(dados: Omit<Visita, 'id' | 'created_at'>): Promise<Visita> {
    const newVisita: Visita = {
      ...dados,
      id: isSupabaseConfigured ? crypto.randomUUID() : `vis-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('visitas').insert(newVisita).select().single();
      if (!error && data) return data as Visita;
    }

    const visitas = getLocalData<Visita[]>(STORAGE_KEYS.VISITAS, INITIAL_VISITAS);
    setLocalData(STORAGE_KEYS.VISITAS, [newVisita, ...visitas]);

    const estabelecimentos = getLocalData<Estabelecimento[]>(STORAGE_KEYS.ESTABELECIMENTOS, INITIAL_ESTABELECIMENTOS);
    const updatedEsts = estabelecimentos.map(est =>
      est.id === dados.estabelecimento_id ? { ...est, status: 'VISITADO' as const } : est
    );
    setLocalData(STORAGE_KEYS.ESTABELECIMENTOS, updatedEsts);

    return newVisita;
  },

  // === CATEGORIAS DINÂMICAS ===
  async getCategorias(): Promise<CategoriaItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('categorias').select('*').order('nome');
      if (data && data.length > 0) return data as CategoriaItem[];
    }
    return getLocalData<CategoriaItem[]>(STORAGE_KEYS.CATEGORIAS, INITIAL_CATEGORIAS);
  },

  async addCategoria(nome: string): Promise<CategoriaItem> {
    const item: CategoriaItem = {
      id: isSupabaseConfigured ? crypto.randomUUID() : `cat-${Date.now()}`,
      nome: nome.trim(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('categorias').insert({ nome: item.nome }).select().single();
      if (data) return data as CategoriaItem;
    }

    const list = await this.getCategorias();
    if (!list.some(c => c.nome.toLowerCase() === item.nome.toLowerCase())) {
      setLocalData(STORAGE_KEYS.CATEGORIAS, [...list, item]);
    }
    return item;
  },

  async deleteCategoria(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('categorias').delete().eq('id', id);
      return;
    }
    const list = await this.getCategorias();
    setLocalData(STORAGE_KEYS.CATEGORIAS, list.filter(c => c.id !== id));
  },

  // === REGIÕES DINÂMICAS ===
  async getRegioes(): Promise<RegiaoItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('regioes').select('*').order('nome');
      if (data && data.length > 0) return data as RegiaoItem[];
    }
    return getLocalData<RegiaoItem[]>(STORAGE_KEYS.REGIOES, INITIAL_REGIOES);
  },

  async addRegiao(nome: string): Promise<RegiaoItem> {
    const item: RegiaoItem = {
      id: isSupabaseConfigured ? crypto.randomUUID() : `reg-${Date.now()}`,
      nome: nome.trim(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('regioes').insert({ nome: item.nome }).select().single();
      if (data) return data as RegiaoItem;
    }

    const list = await this.getRegioes();
    if (!list.some(r => r.nome.toLowerCase() === item.nome.toLowerCase())) {
      setLocalData(STORAGE_KEYS.REGIOES, [...list, item]);
    }
    return item;
  },

  async deleteRegiao(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('regioes').delete().eq('id', id);
      return;
    }
    const list = await this.getRegioes();
    setLocalData(STORAGE_KEYS.REGIOES, list.filter(r => r.id !== id));
  },

  // === CALCULATED VIEW (v_saldo_atual) ===
  async getSaldoAtualView(anoMes: string = getCurrentAnoMes()): Promise<SaldoAtualView> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('v_saldo_atual').select('*').eq('ano_mes', anoMes).maybeSingle();
      if (data) return data as SaldoAtualView;
    }

    const saldoMensalObj = await this.getSaldoMensal(anoMes);
    const visitas = await this.getVisitas();

    const visitasDoMes = visitas.filter(v => v.data_visita.startsWith(anoMes));
    const valorGastoTotal = visitasDoMes.reduce((acc, v) => acc + (Number(v.valor_gasto) || 0), 0);

    return {
      ano_mes: anoMes,
      valor_disponivel: saldoMensalObj.valor_disponivel,
      valor_gasto_total: valorGastoTotal,
      valor_restante: saldoMensalObj.valor_disponivel - valorGastoTotal,
    };
  },

  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.ESTABELECIMENTOS);
    localStorage.removeItem(STORAGE_KEYS.SALDO_MENSAL);
    localStorage.removeItem(STORAGE_KEYS.VISITAS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIAS);
    localStorage.removeItem(STORAGE_KEYS.REGIOES);
    localStorage.removeItem(STORAGE_KEYS.QUALIFICACOES);
  },
};
