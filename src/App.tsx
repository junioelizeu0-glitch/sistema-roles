import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LugaresList } from './components/LugaresList';
import { Configuracoes } from './components/Configuracoes';
import { CadastrarLugarModal } from './components/CadastrarLugarModal';
import { MarcarVisitaModal } from './components/MarcarVisitaModal';
import { LugarDetailModal } from './components/LugarDetailModal';

import type { Estabelecimento, Visita, SaldoAtualView, SaldoMensal, CategoriaItem, RegiaoItem, Qualificacao, QualificacaoId } from './types';
import { QUALIFICACOES_PADRAO } from './types';
import { dataService, getCurrentAnoMes } from './services/dataService';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lugares' | 'configuracoes'>('dashboard');
  const [selectedAnoMes, setSelectedAnoMes] = useState<string>(getCurrentAnoMes());

  // App State
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [saldoView, setSaldoView] = useState<SaldoAtualView | null>(null);
  const [saldoMensal, setSaldoMensal] = useState<SaldoMensal | null>(null);
  const [categoriasList, setCategoriasList] = useState<CategoriaItem[]>([]);
  const [regioesList, setRegioesList] = useState<RegiaoItem[]>([]);
  const [qualificacoesMap, setQualificacoesMap] = useState<Record<QualificacaoId, Qualificacao>>(QUALIFICACOES_PADRAO);
  const [initialStatusFilter, setInitialStatusFilter] = useState<string>('TODOS');

  // Modals
  const [isNovoLugarOpen, setIsNovoLugarOpen] = useState(false);
  const [editLugarTarget, setEditLugarTarget] = useState<Estabelecimento | null>(null);

  const [isMarcarVisitaOpen, setIsMarcarVisitaOpen] = useState(false);
  const [visitaTarget, setVisitaTarget] = useState<Estabelecimento | null>(null);

  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [detalhesTarget, setDetalhesTarget] = useState<Estabelecimento | null>(null);

  // Carregar dados atualizados
  const loadData = useCallback(async () => {
    try {
      const [ests, vis, view, sm, cats, regs, quals] = await Promise.all([
        dataService.getEstabelecimentos(),
        dataService.getVisitas(),
        dataService.getSaldoAtualView(selectedAnoMes),
        dataService.getSaldoMensal(selectedAnoMes),
        dataService.getCategorias(),
        dataService.getRegioes(),
        dataService.getQualificacoes(),
      ]);
      setEstabelecimentos(ests);
      setVisitas(vis);
      setSaldoView(view);
      setSaldoMensal(sm);
      setCategoriasList(cats);
      setRegioesList(regs);
      setQualificacoesMap(quals);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }, [selectedAnoMes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSaveLugar = async (
    dados: Omit<Estabelecimento, 'id' | 'created_at'>,
    editId?: string
  ) => {
    if (editId) {
      await dataService.updateEstabelecimento(editId, dados);
    } else {
      await dataService.addEstabelecimento(dados);
    }
    await loadData();
  };

  const handleDeleteLugar = async (id: string) => {
    await dataService.deleteEstabelecimento(id);
    await loadData();
  };

  const handleSaveVisita = async (dados: Omit<Visita, 'id' | 'created_at'>) => {
    await dataService.addVisita(dados);
    await loadData();
  };

  const handleUpdateSaldoMensal = async (valor: number) => {
    await dataService.setSaldoMensal(selectedAnoMes, valor);
    await loadData();
  };

  const handleResetDemoData = async () => {
    dataService.resetDemoData();
    await loadData();
    alert('Dados de exemplo restaurados com sucesso!');
  };

  const handleAddCategoria = async (nome: string) => {
    await dataService.addCategoria(nome);
    await loadData();
  };

  const handleDeleteCategoria = async (id: string) => {
    await dataService.deleteCategoria(id);
    await loadData();
  };

  const handleAddRegiao = async (nome: string) => {
    await dataService.addRegiao(nome);
    await loadData();
  };

  const handleDeleteRegiao = async (id: string) => {
    await dataService.deleteRegiao(id);
    await loadData();
  };

  const handleUpdateQualificacao = async (id: QualificacaoId, precoPadrao: number) => {
    await dataService.updateQualificacao(id, precoPadrao);
    await loadData();
  };

  const handleNavigateToLugares = (statusFilter?: string) => {
    if (statusFilter) {
      setInitialStatusFilter(statusFilter);
    }
    setActiveTab('lugares');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        saldoView={saldoView}
        onOpenNovoLugar={() => {
          setEditLugarTarget(null);
          setIsNovoLugarOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            saldoView={saldoView}
            estabelecimentos={estabelecimentos}
            visitas={visitas}
            selectedAnoMes={selectedAnoMes}
            setSelectedAnoMes={setSelectedAnoMes}
            onOpenNovoLugar={() => {
              setEditLugarTarget(null);
              setIsNovoLugarOpen(true);
            }}
            onOpenMarcarVisita={est => {
              setVisitaTarget(est);
              setIsMarcarVisitaOpen(true);
            }}
            onOpenDetalhes={est => {
              setDetalhesTarget(est);
              setIsDetalhesOpen(true);
            }}
            onNavigateToLugares={handleNavigateToLugares}
          />
        )}

        {activeTab === 'lugares' && (
          <LugaresList
            estabelecimentos={estabelecimentos}
            visitas={visitas}
            initialStatusFilter={initialStatusFilter}
            onOpenNovoLugar={() => {
              setEditLugarTarget(null);
              setIsNovoLugarOpen(true);
            }}
            onOpenEditarLugar={est => {
              setEditLugarTarget(est);
              setIsNovoLugarOpen(true);
            }}
            onOpenMarcarVisita={est => {
              setVisitaTarget(est);
              setIsMarcarVisitaOpen(true);
            }}
            onOpenDetalhes={est => {
              setDetalhesTarget(est);
              setIsDetalhesOpen(true);
            }}
            onDeleteLugar={handleDeleteLugar}
            categoriasList={categoriasList}
            regioesList={regioesList}
          />
        )}

        {activeTab === 'configuracoes' && (
          <Configuracoes
            selectedAnoMes={selectedAnoMes}
            setSelectedAnoMes={setSelectedAnoMes}
            saldoMensal={saldoMensal}
            onUpdateSaldoMensal={handleUpdateSaldoMensal}
            onResetData={handleResetDemoData}
            categoriasList={categoriasList}
            regioesList={regioesList}
            onAddCategoria={handleAddCategoria}
            onDeleteCategoria={handleDeleteCategoria}
            onAddRegiao={handleAddRegiao}
            onDeleteRegiao={handleDeleteRegiao}
            qualificacoesMap={qualificacoesMap}
            onUpdateQualificacao={handleUpdateQualificacao}
          />
        )}
      </main>

      {/* Modals */}
      <CadastrarLugarModal
        isOpen={isNovoLugarOpen}
        onClose={() => setIsNovoLugarOpen(false)}
        onSave={handleSaveLugar}
        editTarget={editLugarTarget}
        categoriasList={categoriasList}
        regioesList={regioesList}
        qualificacoesMap={qualificacoesMap}
      />

      <MarcarVisitaModal
        isOpen={isMarcarVisitaOpen}
        onClose={() => setIsMarcarVisitaOpen(false)}
        estabelecimento={visitaTarget}
        estabelecimentosList={estabelecimentos}
        onSaveVisita={handleSaveVisita}
      />

      <LugarDetailModal
        isOpen={isDetalhesOpen}
        onClose={() => setIsDetalhesOpen(false)}
        estabelecimento={detalhesTarget}
        visitas={visitas}
        onOpenMarcarVisita={est => {
          setVisitaTarget(est);
          setIsMarcarVisitaOpen(true);
        }}
        onOpenEditarLugar={est => {
          setEditLugarTarget(est);
          setIsNovoLugarOpen(true);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <p>Sistema de Rolês — Feito com carinho a dois 🍷✨</p>
      </footer>
    </div>
  );
}

export default App;
