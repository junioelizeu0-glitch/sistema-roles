export type QualificacaoId = 'ALTO' | 'MEDIA' | 'DE_BOAS' | 'PASSEIO';

export type StatusLugar = 'PENDENTE' | 'AGENDADO' | 'VISITADO' | 'DESCARTADO';

export interface Qualificacao {
  id: QualificacaoId;
  nome: string;
  preco_padrao: number;
  descricao?: string;
  badgeColor?: string;
}

export interface CategoriaItem {
  id: string;
  nome: string;
}

export interface RegiaoItem {
  id: string;
  nome: string;
}

export interface Estabelecimento {
  id: string;
  nome: string;
  regiao: string;
  categoria: string;
  qualificacao_id: QualificacaoId;
  preco_medio: number;
  endereco?: string; // Endereço para integração com Waze
  status: StatusLugar;
  created_at: string;
}

export interface SaldoMensal {
  id: string;
  ano_mes: string; // Ex: '2026-08'
  valor_disponivel: number;
  created_at?: string;
}

export interface Visita {
  id: string;
  estabelecimento_id: string;
  data_visita: string; // 'YYYY-MM-DD'
  valor_gasto: number;
  nota: number; // 1 a 5
  voltariam: boolean;
  comentario: string;
  foto_url?: string; // Anexo da foto da experiência
  created_at?: string;
}

export interface SaldoAtualView {
  ano_mes: string;
  valor_disponivel: number;
  valor_gasto_total: number;
  valor_restante: number;
}

export interface FilterState {
  search: string;
  categoria: string;
  regiao: string;
  qualificacao: string;
  status: string;
}

export const QUALIFICACOES_PADRAO: Record<QualificacaoId, Qualificacao> = {
  ALTO: {
    id: 'ALTO',
    nome: 'ALTO',
    preco_padrao: 250.00,
    descricao: 'Restaurantes sofisticados e jantares especiais',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  MEDIA: {
    id: 'MEDIA',
    nome: 'MÉDIA',
    preco_padrao: 120.00,
    descricao: 'Bistrôs, cantinas e lugares intermediários',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  DE_BOAS: {
    id: 'DE_BOAS',
    nome: 'DE BOAS',
    preco_padrao: 60.00,
    descricao: 'Hamburguerias, pizzarias e pubs casuais',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PASSEIO: {
    id: 'PASSEIO',
    nome: 'PASSEIO',
    preco_padrao: 30.00,
    descricao: 'Sorveterias, cafés, parques e lanches rápidos',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
};

export const DEFAULT_CATEGORIAS = [
  'Restaurante',
  'Pizzaria',
  'Hamburgueria',
  'Japonês',
  'Italiano',
  'Bar / Pub',
  'Café & Doceria',
  'Mexicano',
  'Passeio ao Ar Livre',
  'Sorveteria',
];

export const DEFAULT_REGIOES = [
  'Zona Sul',
  'Zona Norte',
  'Zona Oeste',
  'Zona Leste',
  'Centro',
  'Região Metropolitana',
];

// Helper para gerar URL oficial de navegação do Waze
export function getWazeUrl(endereco?: string, nome?: string, regiao?: string): string {
  const query = (endereco && endereco.trim())
    ? endereco.trim()
    : `${nome || ''} ${regiao || ''}`.trim();
  return `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}
