import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List as ListIcon,
  MapPin,
  Tag,
  Star,
  CheckCircle2,
  Clock,
  CalendarCheck,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  ThumbsUp,
  Navigation,
} from 'lucide-react';
import type { Estabelecimento, StatusLugar, FilterState, Visita, CategoriaItem, RegiaoItem } from '../types';
import { QUALIFICACOES_PADRAO, getWazeUrl } from '../types';

interface LugaresListProps {
  estabelecimentos: Estabelecimento[];
  visitas: Visita[];
  initialStatusFilter?: string;
  onOpenNovoLugar: () => void;
  onOpenEditarLugar: (est: Estabelecimento) => void;
  onOpenMarcarVisita: (est: Estabelecimento) => void;
  onOpenDetalhes: (est: Estabelecimento) => void;
  onDeleteLugar: (id: string) => void;
  categoriasList: CategoriaItem[];
  regioesList: RegiaoItem[];
}

export const LugaresList: React.FC<LugaresListProps> = ({
  estabelecimentos,
  visitas,
  initialStatusFilter = 'TODOS',
  onOpenNovoLugar,
  onOpenEditarLugar,
  onOpenMarcarVisita,
  onOpenDetalhes,
  onDeleteLugar,
  categoriasList,
  regioesList,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoria: '',
    regiao: '',
    qualificacao: '',
    status: initialStatusFilter,
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const visitasMap = useMemo(() => {
    const map: Record<string, { totalNotas: number; count: number; voltariam: boolean }> = {};
    visitas.forEach(v => {
      if (!map[v.estabelecimento_id]) {
        map[v.estabelecimento_id] = { totalNotas: 0, count: 0, voltariam: false };
      }
      map[v.estabelecimento_id].totalNotas += v.nota;
      map[v.estabelecimento_id].count += 1;
      if (v.voltariam) map[v.estabelecimento_id].voltariam = true;
    });
    return map;
  }, [visitas]);

  const counts = useMemo(() => {
    return {
      TODOS: estabelecimentos.length,
      PENDENTE: estabelecimentos.filter(e => e.status === 'PENDENTE').length,
      AGENDADO: estabelecimentos.filter(e => e.status === 'AGENDADO').length,
      VISITADO: estabelecimentos.filter(e => e.status === 'VISITADO').length,
      DESCARTADO: estabelecimentos.filter(e => e.status === 'DESCARTADO').length,
    };
  }, [estabelecimentos]);

  const filteredList = useMemo(() => {
    return estabelecimentos.filter(est => {
      const matchSearch =
        !filters.search ||
        est.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        est.categoria.toLowerCase().includes(filters.search.toLowerCase()) ||
        est.regiao.toLowerCase().includes(filters.search.toLowerCase()) ||
        (est.endereco && est.endereco.toLowerCase().includes(filters.search.toLowerCase()));

      const matchCategoria = !filters.categoria || est.categoria === filters.categoria;
      const matchRegiao = !filters.regiao || est.regiao === filters.regiao;
      const matchQualificacao = !filters.qualificacao || est.qualificacao_id === filters.qualificacao;
      const matchStatus = filters.status === 'TODOS' || est.status === filters.status;

      return matchSearch && matchCategoria && matchRegiao && matchQualificacao && matchStatus;
    });
  }, [estabelecimentos, filters]);

  const getStatusBadge = (status: StatusLugar) => {
    switch (status) {
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pendente
          </span>
        );
      case 'AGENDADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <CalendarCheck className="w-3 h-3" /> Agendado
          </span>
        );
      case 'VISITADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Visitado
          </span>
        );
      case 'DESCARTADO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Descartado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Catálogo de Lugares</h1>
          <p className="text-slate-500 text-sm">
            Filtre por regiões, categorias e preços para planejar os próximos encontros.
          </p>
        </div>

        <button
          onClick={onOpenNovoLugar}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-100 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Lugar</span>
        </button>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {(['TODOS', 'PENDENTE', 'AGENDADO', 'VISITADO', 'DESCARTADO'] as const).map(tabStatus => (
          <button
            key={tabStatus}
            onClick={() => setFilters(f => ({ ...f, status: tabStatus }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filters.status === tabStatus
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>
              {tabStatus === 'TODOS'
                ? 'Todos'
                : tabStatus === 'PENDENTE'
                ? 'Pendentes'
                : tabStatus === 'AGENDADO'
                ? 'Agendados'
                : tabStatus === 'VISITADO'
                ? 'Visitados'
                : 'Descartados'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] ${
                filters.status === tabStatus ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[tabStatus]}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Options */}
      <div className="financy-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, categoria, endereço ou região..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filters.categoria}
            onChange={e => setFilters(f => ({ ...f, categoria: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todas as Categorias</option>
            {categoriasList.map(c => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            value={filters.regiao}
            onChange={e => setFilters(f => ({ ...f, regiao: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todas as Regiões</option>
            {regioesList.map(r => (
              <option key={r.id} value={r.nome}>
                {r.nome}
              </option>
            ))}
          </select>

          <select
            value={filters.qualificacao}
            onChange={e => setFilters(f => ({ ...f, qualificacao: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todas as Qualificações</option>
            {Object.values(QUALIFICACOES_PADRAO).map(q => (
              <option key={q.id} value={q.id}>
                {q.nome} (~R$ {q.preco_padrao})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
          <span>Mostrando {filteredList.length} de {estabelecimentos.length} lugar(es)</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table List */}
      {filteredList.length === 0 ? (
        <div className="financy-card p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-900 font-bold text-base">Nenhum lugar encontrado</p>
          <p className="text-slate-400 text-xs">
            Tente ajustar seus filtros ou cadastre um novo lugar para a lista de desejos.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map(est => {
            const qual = QUALIFICACOES_PADRAO[est.qualificacao_id];
            const vStats = visitasMap[est.id];
            const mediaNota = vStats && vStats.count > 0 ? vStats.totalNotas / vStats.count : null;
            const wazeUrl = getWazeUrl(est.endereco, est.nome, est.regiao);

            return (
              <div
                key={est.id}
                className="financy-card p-5 flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {qual?.nome}
                    </span>
                    {getStatusBadge(est.status)}
                  </div>

                  <div>
                    <h3
                      onClick={() => onOpenDetalhes(est)}
                      className="font-bold text-slate-900 text-lg hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                    >
                      {est.nome}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {est.regiao}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        {est.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Endereço & Waze Quick Button */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500 truncate mr-2">
                      {est.endereco || 'Endereço não informado'}
                    </span>
                    <a
                      href={wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shrink-0"
                      title="Navegar com Waze"
                    >
                      <Navigation className="w-3 h-3 fill-blue-600" /> Waze
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-500">Preço Médio Sugerido:</span>
                    <span className="font-bold text-slate-900 font-mono">{formatCurrency(est.preco_medio)}</span>
                  </div>

                  {mediaNota !== null && (
                    <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Nota: {mediaNota.toFixed(1)} ({vStats?.count} visita(s))
                      </span>
                      {vStats?.voltariam && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                          <ThumbsUp className="w-3 h-3" /> Voltaríamos!
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onOpenDetalhes(est)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Detalhes
                  </button>

                  <button
                    onClick={() => onOpenMarcarVisita(est)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-xl font-bold shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Visita
                  </button>

                  <button
                    onClick={() => onOpenEditarLugar(est)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir "${est.nome}"?`)) onDeleteLugar(est.id);
                    }}
                    className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="financy-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Lugar</th>
                <th className="p-4">Região</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Waze</th>
                <th className="p-4">Preço Médio</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(est => {
                const wazeUrl = getWazeUrl(est.endereco, est.nome, est.regiao);
                return (
                  <tr key={est.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <span
                        onClick={() => onOpenDetalhes(est)}
                        className="hover:text-indigo-600 cursor-pointer"
                      >
                        {est.nome}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{est.regiao}</td>
                    <td className="p-4 text-slate-500">{est.categoria}</td>
                    <td className="p-4">
                      <a
                        href={wazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100"
                      >
                        <Navigation className="w-3 h-3 fill-blue-600" /> Abrir Waze
                      </a>
                    </td>
                    <td className="p-4 font-mono font-bold">{formatCurrency(est.preco_medio)}</td>
                    <td className="p-4">{getStatusBadge(est.status)}</td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => onOpenMarcarVisita(est)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                      >
                        Visita
                      </button>
                      <button
                        onClick={() => onOpenDetalhes(est)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => onOpenEditarLugar(est)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir "${est.nome}"?`)) onDeleteLugar(est.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
