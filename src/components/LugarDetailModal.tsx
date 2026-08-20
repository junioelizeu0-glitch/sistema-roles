import React from 'react';
import {
  X,
  MapPin,
  Tag,
  Star,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  History,
  Plus,
  Edit2,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import type { Estabelecimento, Visita } from '../types';
import { QUALIFICACOES_PADRAO, getWazeUrl } from '../types';

interface LugarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  estabelecimento: Estabelecimento | null;
  visitas: Visita[];
  onOpenMarcarVisita: (est: Estabelecimento) => void;
  onOpenEditarLugar: (est: Estabelecimento) => void;
}

export const LugarDetailModal: React.FC<LugarDetailModalProps> = ({
  isOpen,
  onClose,
  estabelecimento,
  visitas,
  onOpenMarcarVisita,
  onOpenEditarLugar,
}) => {
  if (!isOpen || !estabelecimento) return null;

  const qual = QUALIFICACOES_PADRAO[estabelecimento.qualificacao_id];
  const historicoVisitas = visitas
    .filter(v => v.estabelecimento_id === estabelecimento.id)
    .sort((a, b) => new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime());

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalGastoHistorico = historicoVisitas.reduce((acc, v) => acc + Number(v.valor_gasto), 0);
  const mediaNotas = historicoVisitas.length > 0
    ? historicoVisitas.reduce((acc, v) => acc + v.nota, 0) / historicoVisitas.length
    : null;

  const wazeUrl = getWazeUrl(estabelecimento.endereco, estabelecimento.nome, estabelecimento.regiao);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-100 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {qual?.nome || estabelecimento.qualificacao_id}
              </span>
              <span className="text-xs text-slate-500 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                {estabelecimento.status}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{estabelecimento.nome}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {estabelecimento.regiao}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                {estabelecimento.categoria}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Endereço & Waze Navigation Action Button */}
          {estabelecimento.endereco && (
            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Endereço</span>
                <p className="text-xs font-semibold text-slate-800">{estabelecimento.endereco}</p>
              </div>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Navigation className="w-4 h-4 fill-white" />
                Abrir no Waze 🚗
              </a>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Preço Médio Sugerido</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {formatCurrency(estabelecimento.preco_medio)}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Média de Avaliações</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-amber-600">
                  {mediaNotas ? mediaNotas.toFixed(1) : 'Sem notas'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Total Gasto em Visitas</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">
                {formatCurrency(totalGastoHistorico)}
              </span>
            </div>
          </div>

          {/* Histórico de Visitas com Fotos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" /> Histórico de Visitas ({historicoVisitas.length})
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onOpenMarcarVisita(estabelecimento);
                }}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Nova Ida
              </button>
            </div>

            {historicoVisitas.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 space-y-2">
                <p className="text-xs text-slate-400">Vocês ainda não registraram nenhuma visita neste lugar.</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMarcarVisita(estabelecimento);
                  }}
                  className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Primeira Visita
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {historicoVisitas.map(vis => (
                  <div key={vis.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Visita em {new Date(vis.data_visita).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-600 font-mono">
                        Gasto: {formatCurrency(vis.valor_gasto)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(starNum => (
                          <Star
                            key={starNum}
                            className={`w-4 h-4 ${
                              starNum <= vis.nota
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>

                      {vis.voltariam ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          <ThumbsUp className="w-3 h-3" /> Voltaríamos!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                          <ThumbsDown className="w-3 h-3" /> Não voltaríamos
                        </span>
                      )}
                    </div>

                    {/* Foto da Experiência */}
                    {vis.foto_url && (
                      <div className="rounded-xl overflow-hidden max-h-56 border border-slate-200">
                        <img src={vis.foto_url} alt="Foto da experiência" className="w-full h-48 object-cover" />
                      </div>
                    )}

                    {vis.comentario && (
                      <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100">
                        "{vis.comentario}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenEditarLugar(estabelecimento);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 border border-slate-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Editar Cadastro
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenMarcarVisita(estabelecimento);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" /> Marcar Visita
          </button>
        </div>
      </div>
    </div>
  );
};
