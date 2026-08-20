import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, Tag, DollarSign, Bookmark, Layers, Navigation, Search, Loader2 } from 'lucide-react';
import type { Estabelecimento, QualificacaoId, StatusLugar, CategoriaItem, RegiaoItem, Qualificacao } from '../types';
import { QUALIFICACOES_PADRAO } from '../types';

interface CadastrarLugarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: Omit<Estabelecimento, 'id' | 'created_at'>, editId?: string) => Promise<void>;
  editTarget?: Estabelecimento | null;
  categoriasList: CategoriaItem[];
  regioesList: RegiaoItem[];
  qualificacoesMap?: Record<QualificacaoId, Qualificacao>;
}

export const CadastrarLugarModal: React.FC<CadastrarLugarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTarget,
  categoriasList,
  regioesList,
  qualificacoesMap = QUALIFICACOES_PADRAO,
}) => {
  const [nome, setNome] = useState('');
  const [regiao, setRegiao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [qualificacaoId, setQualificacaoId] = useState<QualificacaoId>('MEDIA');
  const [precoMedioInput, setPrecoMedioInput] = useState<string>('120');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [status, setStatus] = useState<StatusLugar>('PENDENTE');
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    const defaultCat = categoriasList.length > 0 ? categoriasList[0].nome : 'Restaurante';
    const defaultReg = regioesList.length > 0 ? regioesList[0].nome : 'Zona Sul';

    if (editTarget) {
      setNome(editTarget.nome);
      setRegiao(editTarget.regiao);
      setCategoria(editTarget.categoria);
      setQualificacaoId(editTarget.qualificacao_id);
      setPrecoMedioInput(String(editTarget.preco_medio || ''));
      setEndereco(editTarget.endereco || '');
      setStatus(editTarget.status);
      setCep('');
    } else {
      setNome('');
      setRegiao(defaultReg);
      setCategoria(defaultCat);
      setQualificacaoId('MEDIA');
      const padrao = qualificacoesMap.MEDIA?.preco_padrao ?? 120;
      setPrecoMedioInput(String(padrao));
      setEndereco('');
      setStatus('PENDENTE');
      setCep('');
    }
  }, [editTarget, isOpen, categoriasList, regioesList, qualificacoesMap]);

  const handleQualificacaoChange = (newQual: QualificacaoId) => {
    setQualificacaoId(newQual);
    const padrao = qualificacoesMap[newQual]?.preco_padrao ?? 100;
    setPrecoMedioInput(String(padrao));
  };

  // Buscar CEP via ViaCEP API
  const handleBuscarCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert('Digite um CEP válido com 8 dígitos (ex: 01310100)');
      return;
    }

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        alert('CEP não encontrado!');
      } else {
        const enderecoFormatado = `${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade || ''} / ${data.uf || ''}`.replace(/^, /, '');
        setEndereco(enderecoFormatado);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const parsedPreco = parseFloat(precoMedioInput.replace(',', '.'));
    const finalPreco = isNaN(parsedPreco) ? 0 : parsedPreco;

    setLoading(true);
    try {
      await onSave(
        {
          nome: nome.trim(),
          regiao,
          categoria,
          qualificacao_id: qualificacaoId,
          preco_medio: finalPreco,
          endereco: endereco.trim(),
          status,
        },
        editTarget?.id
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              {editTarget ? 'Editar Lugar' : 'Cadastrar Novo Lugar'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Nome do Estabelecimento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Cantina Ristorante, Burger Bar..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" /> Categoria
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {categoriasList.map(c => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Região
              </label>
              <select
                value={regiao}
                onChange={e => setRegiao(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {regioesList.map(r => (
                  <option key={r.id} value={r.nome}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Busca de CEP */}
          <div className="space-y-2 bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-indigo-600" /> Buscar Endereço por CEP
              </label>
              <span className="text-[10px] text-indigo-500 font-semibold">Opcional</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 01310-100"
                maxLength={9}
                value={cep}
                onChange={e => setCep(e.target.value)}
                className="flex-1 bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleBuscarCep}
                disabled={loadingCep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0"
              >
                {loadingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar CEP'}
              </button>
            </div>
          </div>

          {/* Campo de Endereço Completo para o Waze */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-600" /> Endereço completo / Ponto no Waze
            </label>
            <input
              type="text"
              placeholder="Ex: Av. Paulista, 1000, Bela Vista, São Paulo"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Qualificação (Preço Sugerido)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(qualificacoesMap).map(q => (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => handleQualificacaoChange(q.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    qualificacaoId === q.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs block">{q.nome}</span>
                  <span className="text-[10px] font-mono block">R$ {q.preco_padrao}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Valor de Preço Médio Sugerido (Input limpo sem forçar '0') */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Preço Médio Sugerido (R$)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Editável</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Digite o valor..."
              value={precoMedioInput}
              onChange={e => setPrecoMedioInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Status Inicial
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as StatusLugar)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="PENDENTE">PENDENTE (Na lista de desejos)</option>
              <option value="AGENDADO">AGENDADO (Já marcamos data)</option>
              <option value="VISITADO">VISITADO (Já fomos)</option>
              <option value="DESCARTADO">DESCARTADO (Desistimos)</option>
            </select>
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
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
            >
              {loading ? 'Salvando...' : editTarget ? 'Atualizar Lugar' : 'Cadastrar Lugar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
