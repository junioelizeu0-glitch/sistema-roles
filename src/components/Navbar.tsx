import React from 'react';
import { LayoutDashboard, Utensils, Settings, Plus, HeartHandshake } from 'lucide-react';
import type { SaldoAtualView } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'lugares' | 'configuracoes';
  setActiveTab: (tab: 'dashboard' | 'lugares' | 'configuracoes') => void;
  saldoView: SaldoAtualView | null;
  onOpenNovoLugar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  saldoView,
  onOpenNovoLugar,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand com Ícone Romântico de Casal */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                roles<span className="text-rose-500">.</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                A Dois 👩‍❤️‍👨
              </span>
            </div>
          </div>

          {/* Financy-style Nav Menu Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('lugares')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'lugares'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Catálogo de Lugares</span>
            </button>

            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'configuracoes'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </nav>

          {/* Quick Balance Pill (Sem o botão de mais ao lado) */}
          <div className="flex items-center gap-3">
            {saldoView && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400">Saldo Restante:</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    saldoView.valor_restante >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(saldoView.valor_restante)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Responsivo para Celular) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 py-2 px-4 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('lugares')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
            activeTab === 'lugares' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span>Lugares</span>
        </button>

        <button
          onClick={onOpenNovoLugar}
          className="flex flex-col items-center justify-center bg-indigo-600 text-white w-10 h-10 rounded-full shadow-md shadow-indigo-200 -mt-5"
          title="Novo Lugar"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('configuracoes')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-colors ${
            activeTab === 'configuracoes' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </div>
    </header>
  );
};
