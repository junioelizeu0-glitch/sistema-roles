import React from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Star,
  Utensils,
  ChevronRight,
  Clock,
} from 'lucide-react';
import type { Estabelecimento, SaldoAtualView, Visita } from '../types';
import { QUALIFICACOES_PADRAO } from '../types';

interface DashboardProps {
  saldoView: SaldoAtualView | null;
  estabelecimentos: Estabelecimento[];
  visitas: Visita[];
  selectedAnoMes: string;
  setSelectedAnoMes: (anoMes: string) => void;
  onOpenNovoLugar: () => void;
  onOpenMarcarVisita: (est: Estabelecimento | null) => void;
  onOpenDetalhes: (est: Estabelecimento) => void;
  onNavigateToLugares: (filterStatus?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  saldoView,
  estabelecimentos,
  visitas,
  selectedAnoMes,
  setSelectedAnoMes,
  onOpenNovoLugar,
  onOpenMarcarVisita,
  onOpenDetalhes,
  onNavigateToLugares,
}) => {
  const formatCurrencyParts = (val: number) => {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    // Separa o "R$" do valor numérico para proporcionalidade perfeita
    const parts = formatted.split('\u00A0');
    if (parts.length === 2) {
      return { symbol: parts[0], amount: parts[1] };
    }
    return { symbol: 'R$', amount: formatted.replace('R$', '').trim() };
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Visitas do mês selecionado
  const visitasDoMes = visitas.filter(v => v.data_visita.startsWith(selectedAnoMes));

  // Cálculo de gastos por categoria para o Donut Chart
  const categoriaGastoMap: Record<string, number> = {};
  visitasDoMes.forEach(v => {
    const est = estabelecimentos.find(e => e.id === v.estabelecimento_id);
    const cat = est?.categoria || 'Outros';
    categoriaGastoMap[cat] = (categoriaGastoMap[cat] || 0) + Number(v.valor_gasto);
  });

  const categoriasBreakdown = Object.entries(categoriaGastoMap).map(([nome, valor]) => ({
    nome,
    valor,
    percentual: saldoView?.valor_gasto_total ? (valor / saldoView.valor_gasto_total) * 100 : 0,
  }));

  // Cores vivas para o Donut Chart
  const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Percentual consumido do orçamento
  const percentGasto = saldoView && saldoView.valor_disponivel > 0
    ? Math.min(100, Math.max(0, (saldoView.valor_gasto_total / saldoView.valor_disponivel) * 100))
    : 0;

  // Lugares Pendentes
  const pendentes = estabelecimentos.filter(e => e.status === 'PENDENTE' || e.status === 'AGENDADO');

  // Mapeamento de histórico por lugar
  const estMap = new Map(estabelecimentos.map(e => [e.id, e]));

  // Últimas Visitas realizadas
  const ultimasVisitas = [...visitas]
    .sort((a, b) => new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime())
    .slice(0, 5);

  const saldoParts = formatCurrencyParts(saldoView?.valor_restante || 0);
  const orcamentoParts = formatCurrencyParts(saldoView?.valor_disponivel || 0);
  const gastoParts = formatCurrencyParts(saldoView?.valor_gasto_total || 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Greeting & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Olá, Casal! 👋
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Acompanhe o orçamento de rolês, despesas do mês e últimas experiências.
          </p>
        </div>

        {/* Month Selector Pill */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-500">Mês:</span>
          <input
            type="month"
            value={selectedAnoMes}
            onChange={e => setSelectedAnoMes(e.target.value)}
            className="bg-transparent text-xs font-bold text-indigo-600 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Top Metrics Grid (Valores com Tipografia Proporcional e Elegante) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Saldo Restante */}
        <div className="bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Saldo Restante
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                (saldoView?.valor_restante ?? 0) >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {(saldoView?.valor_restante ?? 0) >= 0 ? '↑ Disponível' : '↓ Excedido'}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1 text-indigo-600">
              <span className="text-xs font-bold text-indigo-400">{saldoParts.symbol}</span>
              <span className="text-xl font-bold tracking-tight text-indigo-600 font-sans">{saldoParts.amount}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {(100 - percentGasto).toFixed(0)}% livre do orçamento do mês
            </p>
          </div>
        </div>

        {/* Card 2: Orçamento do Mês */}
        <div className="bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Orçamento do Mês
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Limite
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1 text-slate-900">
              <span className="text-xs font-bold text-slate-400">{orcamentoParts.symbol}</span>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">{orcamentoParts.amount}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Definido para o mês {selectedAnoMes}
            </p>
          </div>
        </div>

        {/* Card 3: Total Gasto no Mês */}
        <div className="bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Gasto no Mês
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {percentGasto.toFixed(0)}% consumido
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1 text-rose-600">
              <span className="text-xs font-bold text-rose-400">{gastoParts.symbol}</span>
              <span className="text-xl font-bold tracking-tight text-rose-600 font-sans">{gastoParts.amount}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {visitasDoMes.length} rolê(s) visitados este mês
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quick Action 1: Cadastrar Lugar */}
        <div
          onClick={onOpenNovoLugar}
          className="bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all rounded-2xl p-4 cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Adicionar Novo Lugar</h4>
            <p className="text-[11px] font-medium text-slate-400">Cadastre restaurantes, pizzarias ou passeios</p>
          </div>
        </div>

        {/* Quick Action 2: Marcar Visita */}
        <div
          onClick={() => {
            onOpenMarcarVisita(null);
          }}
          className="bg-white border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all rounded-2xl p-4 cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Marcar Visita Realizada</h4>
            <p className="text-[11px] font-medium text-slate-400">Registre o valor gasto e a nota do casal</p>
          </div>
        </div>
      </div>

      {/* 4. Main Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Expenses by category Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Gastos por Categoria</h3>
            <p className="text-[11px] font-medium text-slate-400">Distribuição do orçamento dos rolês</p>
          </div>

          {categoriasBreakdown.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-2">
              <Utensils className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-400">Nenhum gasto registrado neste mês ainda.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Donut Visual Representation */}
              <div className="relative w-40 h-40 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    let cumulativePercent = 0;
                    return categoriasBreakdown.map((cat, idx) => {
                      const strokeDasharray = `${cat.percentual} ${100 - cat.percentual}`;
                      const strokeDashoffset = -cumulativePercent;
                      cumulativePercent += cat.percentual;
                      return (
                        <circle
                          key={cat.nome}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          pathLength="100"
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold text-slate-400">Total Gasto</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(saldoView?.valor_gasto_total || 0)}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {categoriasBreakdown.map((cat, idx) => (
                  <div key={cat.nome} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="font-medium text-slate-700">{cat.nome}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(cat.valor)} ({cat.percentual.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Last Transactions / Visitas (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Últimas Visitas</h3>
              <p className="text-[11px] font-medium text-slate-400">Histórico de rolês realizados</p>
            </div>
            <button
              onClick={() => onNavigateToLugares('VISITADO')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {ultimasVisitas.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs space-y-2">
              <Clock className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-400">Nenhuma visita registrada recentemente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Lugar</th>
                    <th className="py-2 px-3 font-semibold">Data</th>
                    <th className="py-2 px-3 font-semibold">Nota</th>
                    <th className="py-2 px-3 text-right font-semibold">Valor Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ultimasVisitas.map(v => {
                    const est = estMap.get(v.estabelecimento_id);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div>
                            <span
                              onClick={() => est && onOpenDetalhes(est)}
                              className="hover:text-indigo-600 cursor-pointer block"
                            >
                              {est?.nome || 'Estabelecimento'}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">
                              {est?.categoria} • {est?.regiao}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {new Date(v.data_visita).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{v.nota}</span>
                            {v.voltariam && (
                              <span className="ml-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                                Voltaríamos
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(v.valor_gasto)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. Sub-Section: Desejos Pendentes do Casal */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Desejos da Fila (Pendentes)</h3>
            <p className="text-[11px] font-medium text-slate-400">Lugares cadastrados que vocês ainda vão conhecer</p>
          </div>
          <button
            onClick={() => onNavigateToLugares('PENDENTE')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Ver todos ({pendentes.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendentes.slice(0, 3).map(est => {
            const qual = QUALIFICACOES_PADRAO[est.qualificacao_id];
            return (
              <div
                key={est.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3 hover:border-indigo-200 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                      {qual?.nome}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {formatCurrency(est.preco_medio)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mt-2">{est.nome}</h4>
                  <p className="text-[11px] text-slate-400">{est.categoria} • {est.regiao}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => onOpenDetalhes(est)}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 text-xs py-1 rounded-lg font-semibold border border-slate-200 transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => onOpenMarcarVisita(est)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 rounded-lg font-bold shadow-2xs transition-colors"
                  >
                    Marcar Visita
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
