import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, DollarSign, ThumbsUp, ThumbsDown, MessageSquare, HeartHandshake, Image as ImageIcon, Trash2, Camera, MapPin, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Estabelecimento, Visita } from '../types';
import { getWazeUrl } from '../types';

interface MarcarVisitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  estabelecimento: Estabelecimento | null;
  estabelecimentosList: Estabelecimento[];
  onSaveVisita: (dados: Omit<Visita, 'id' | 'created_at'>) => Promise<void>;
}

export const MarcarVisitaModal: React.FC<MarcarVisitaModalProps> = ({
  isOpen,
  onClose,
  estabelecimento,
  estabelecimentosList,
  onSaveVisita,
}) => {
  const [selectedEstId, setSelectedEstId] = useState<string>('');
  const [dataVisita, setDataVisita] = useState('');
  const [valorGastoInput, setValorGastoInput] = useState<string>('0');
  const [nota, setNota] = useState<number>(5);
  const [voltariam, setVoltariam] = useState<boolean>(true);
  const [comentario, setComentario] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const disponiveisParaVisita = estabelecimentosList.length > 0
    ? estabelecimentosList
    : [];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDataVisita(today);
    setNota(5);
    setVoltariam(true);
    setComentario('');
    setFotoUrl('');

    if (estabelecimento) {
      setSelectedEstId(estabelecimento.id);
      setValorGastoInput(String(estabelecimento.preco_medio || ''));
    } else if (disponiveisParaVisita.length > 0) {
      const pendente = disponiveisParaVisita.find(e => e.status === 'PENDENTE' || e.status === 'AGENDADO') || disponiveisParaVisita[0];
      setSelectedEstId(pendente.id);
      setValorGastoInput(String(pendente.preco_medio || ''));
    }
  }, [estabelecimento, isOpen, estabelecimentosList]);

  const handleSelectEstChange = (id: string) => {
    setSelectedEstId(id);
    const est = disponiveisParaVisita.find(e => e.id === id);
    if (est) {
      setValorGastoInput(String(est.preco_medio || ''));
    }
  };

  const currentSelectedEst = disponiveisParaVisita.find(e => e.id === selectedEstId) || estabelecimento;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstId) return;

    const parsedGasto = parseFloat(valorGastoInput.replace(',', '.'));
    const finalGasto = isNaN(parsedGasto) ? 0 : parsedGasto;

    setLoading(true);
    try {
      await onSaveVisita({
        estabelecimento_id: selectedEstId,
        data_visita: dataVisita,
        valor_gasto: finalGasto,
        nota,
        voltariam,
        comentario: comentario.trim(),
        foto_url: fotoUrl || undefined,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b'],
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const wazeUrl = currentSelectedEst ? getWazeUrl(currentSelectedEst.endereco, currentSelectedEst.nome, currentSelectedEst.regiao) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registrar Visita & Avaliação</h2>
              <p className="text-xs text-indigo-600 font-semibold">
                {currentSelectedEst ? currentSelectedEst.nome : 'Selecione o lugar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Seletor do Lugar a ser marcado */}
          <div className="space-y-2 bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" /> Qual lugar vocês visitaram? *
              </label>

              {/* Botão de abrir no Waze diretamente na tela de marcar visita */}
              {currentSelectedEst && (
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs transition-colors shrink-0"
                  title="Abrir rota no Waze"
                >
                  <Navigation className="w-3 h-3 fill-blue-600" /> Abrir no Waze 🚗
                </a>
              )}
            </div>

            <select
              value={selectedEstId}
              onChange={e => handleSelectEstChange(e.target.value)}
              required
              className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 shadow-2xs"
            >
              {disponiveisParaVisita.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nome} ({e.categoria} • {e.regiao}) — {e.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Data da Ida
              </label>
              <input
                type="date"
                required
                value={dataVisita}
                onChange={e => setDataVisita(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Quanto foi gasto de verdade?
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="Digite o valor..."
                value={valorGastoInput}
                onChange={e => setValorGastoInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">
              Qual a nota da experiência para o casal? (1 a 5 estrelas)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(starNum => (
                <button
                  type="button"
                  key={starNum}
                  onClick={() => setNota(starNum)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      starNum <= nota
                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-amber-500">{nota} de 5</span>
            </div>
          </div>

          {/* Anexo de Foto da Experiência */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" /> Foto da Experiência (Anexo)
            </label>

            {fotoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group max-h-48 bg-slate-100">
                <img src={fotoUrl} alt="Pré-visualização da foto" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUrl('')}
                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 bg-white cursor-pointer transition-colors text-center relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-700">Clique para anexar a foto do rolê</p>
                <p className="text-[10px] text-slate-400">Suporta fotos tiradas na hora pelo celular</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Vocês voltariam a este lugar?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVoltariam(true)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  voltariam
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Com certeza, sim!
              </button>

              <button
                type="button"
                onClick={() => setVoltariam(false)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !voltariam
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> Provavelmente não
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> Resenha do casal sobre a visita
            </label>
            <textarea
              rows={3}
              placeholder="Escreva a avaliação do casal sobre a visita..."
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedEstId}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar Visita & Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
