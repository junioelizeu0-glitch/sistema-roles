import React, { useState, useEffect } from 'react';
import {
  Settings,
  Wallet,
  RotateCcw,
  Tag,
  MapPin,
  Plus,
  Trash2,
  Layers,
  Edit2,
  Check,
} from 'lucide-react';
import type { SaldoMensal, CategoriaItem, RegiaoItem, Qualificacao, QualificacaoId } from '../types';
import { QUALIFICACOES_PADRAO } from '../types';

interface ConfiguracoesProps {
  selectedAnoMes: string;
  setSelectedAnoMes: (anoMes: string) => void;
  saldoMensal: SaldoMensal | null;
  onUpdateSaldoMensal: (valor: number) => Promise<void>;
  onResetData: () => void;
  categoriasList: CategoriaItem[];
  regioesList: RegiaoItem[];
  onAddCategoria: (nome: string) => Promise<void>;
  onDeleteCategoria: (id: string) => Promise<void>;
  onAddRegiao: (nome: string) => Promise<void>;
  onDeleteRegiao: (id: string) => Promise<void>;
  qualificacoesMap: Record<QualificacaoId, Qualificacao>;
  onUpdateQualificacao: (id: QualificacaoId, precoPadrao: number) => Promise<void>;
}

export const Configuracoes: React.FC<ConfiguracoesProps> = ({
  selectedAnoMes,
  setSelectedAnoMes,
  saldoMensal,
  onUpdateSaldoMensal,
  onResetData,
  categoriasList,
  regioesList,
  onAddCategoria,
  onDeleteCategoria,
  onAddRegiao,
  onDeleteRegiao,
  qualificacoesMap,
  onUpdateQualificacao,
}) => {
  const [novoSaldoInput, setNovoSaldoInput] = useState<string>('1000');
  const [loadingSaldo, setLoadingSaldo] = useState(false);

  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaRegiao, setNovaRegiao] = useState('');

  // Edição de Qualificações
  const [editingQualId, setEditingQualId] = useState<QualificacaoId | null>(null);
  const [editingPrecoInput, setEditingPrecoInput] = useState<string>('');

  useEffect(() => {
    if (saldoMensal) {
      setNovoSaldoInput(String(saldoMensal.valor_disponivel || ''));
    }
  }, [saldoMensal]);

  const handleSaveSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(novoSaldoInput.replace(',', '.'));
    const finalVal = isNaN(parsed) ? 0 : parsed;

    setLoadingSaldo(true);
    try {
      await onUpdateSaldoMensal(finalVal);
      alert(`Saldo para o mês ${selectedAnoMes} atualizado com sucesso!`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSaldo(false);
    }
  };

  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;
    await onAddCategoria(novaCategoria.trim());
    setNovaCategoria('');
  };

  const handleCreateRegiao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaRegiao.trim()) return;
    await onAddRegiao(novaRegiao.trim());
    setNovaRegiao('');
  };

  const handleStartEditQual = (q: Qualificacao) => {
    setEditingQualId(q.id);
    setEditingPrecoInput(String(q.preco_padrao));
  };

  const handleSaveQual = async (id: QualificacaoId) => {
    const parsed = parseFloat(editingPrecoInput.replace(',', '.'));
    const finalPreco = isNaN(parsed) ? 0 : parsed;
    await onUpdateQualificacao(id, finalPreco);
    setEditingQualId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" /> Configurações & Parâmetros
        </h1>
        <p className="text-slate-500 text-sm">
          Ajuste o orçamento mensal dos rolês, qualificações de preços, categorias e regiões da cidade.
        </p>
      </div>

      {/* Monthly Budget Form */}
      <div className="financy-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Orçamento do Mês</h3>
            <p className="text-xs text-slate-400">Defina o limite de gastos para rolês no mês selecionado</p>
          </div>
        </div>

        <form onSubmit={handleSaveSaldo} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Mês de Referência</label>
            <input
              type="month"
              value={selectedAnoMes}
              onChange={e => setSelectedAnoMes(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs font-semibold text-slate-600">Valor Disponível (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Digite o valor..."
              value={novoSaldoInput}
              onChange={e => setNovoSaldoInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loadingSaldo}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all whitespace-nowrap"
          >
            {loadingSaldo ? 'Salvando...' : 'Atualizar Orçamento'}
          </button>
        </form>
      </div>

      {/* Gerenciador de Qualificações de Preços */}
      <div className="financy-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Qualificações (Preços Médios Sugeridos)</h3>
            <p className="text-xs text-slate-400">Edite os valores médios sugeridos para cada nível de rolê</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(qualificacoesMap || QUALIFICACOES_PADRAO).map(q => (
            <div
              key={q.id}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-xs font-extrabold text-slate-800 block">{q.nome}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{q.descricao}</p>
              </div>

              {editingQualId === q.id ? (
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 font-mono">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingPrecoInput}
                    onChange={e => setEditingPrecoInput(e.target.value)}
                    className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveQual(q.id)}
                    className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    title="Salvar valor"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-extrabold font-mono text-indigo-600">
                    R$ {q.preco_padrao}
                  </span>
                  <button
                    onClick={() => handleStartEditQual(q)}
                    className="p-1 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" /> Editar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Category & Region Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Categorias */}
        <div className="financy-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Tag className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Categorias Personalizadas</h3>
              <p className="text-[11px] text-slate-400">Gerencie as categorias de rolês</p>
            </div>
          </div>

          <form onSubmit={handleCreateCategoria} className="flex gap-2">
            <input
              type="text"
              placeholder="Nova categoria..."
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pt-1">
            {categoriasList.map(c => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200"
              >
                {c.nome}
                <button
                  type="button"
                  onClick={() => onDeleteCategoria(c.id)}
                  className="p-0.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Manage Regiões */}
        <div className="financy-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Regiões Personalizadas</h3>
              <p className="text-[11px] text-slate-400">Gerencie as regiões da cidade</p>
            </div>
          </div>

          <form onSubmit={handleCreateRegiao} className="flex gap-2">
            <input
              type="text"
              placeholder="Nova região..."
              value={novaRegiao}
              onChange={e => setNovaRegiao(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pt-1">
            {regioesList.map(r => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200"
              >
                {r.nome}
                <button
                  type="button"
                  onClick={() => onDeleteRegiao(r.id)}
                  className="p-0.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Data Option */}
      <div className="financy-card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Manutenção de Dados</h3>
            <p className="text-xs text-slate-400">Restaure os exemplos iniciais para o casal</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Restaurar Exemplos Iniciais</h4>
            <p className="text-[11px] text-slate-400">Restaura a lista inicial de lugares e visitas de exemplo.</p>
          </div>

          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja restaurar os dados de exemplo?')) {
                onResetData();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Restaurar Exemplos
          </button>
        </div>
      </div>
    </div>
  );
};
