import React, { useState } from 'react';
import { Dices, Plus, Trash2, RotateCcw, Copy, Check, Crown } from 'lucide-react';
import { Language } from '../types';
import { EMPIRE_PROMPTS } from '../data/toolkits';
import { UI_TRANSLATIONS } from '../data/translations';

interface EmpireBoardProps {
  language: Language;
}

interface EmpireEntity {
  id: string;
  alias: string;
  king: string;
  members: string[];
}

export const EmpireBoard: React.FC<EmpireBoardProps> = ({ language }) => {
  const t = UI_TRANSLATIONS[language];

  // Category state
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Board state
  const [inputAlias, setInputAlias] = useState('');
  const [empires, setEmpires] = useState<EmpireEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);

  const currentCategory = EMPIRE_PROMPTS[categoryIndex];

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const nextIdx = (categoryIndex + 1 + Math.floor(Math.random() * (EMPIRE_PROMPTS.length - 1))) % EMPIRE_PROMPTS.length;
      setCategoryIndex(nextIdx);
      setIsShuffling(false);
    }, 200);
  };

  const handleCopyCategory = () => {
    const text = `${currentCategory.title[language]}\n\n${currentCategory.description[language]}\n\n${currentCategory.exampleAnswers[language].map(e => `• ${e}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAddAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAlias.trim()) return;

    const newEntity: EmpireEntity = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      alias: inputAlias.trim(),
      king: inputAlias.trim(),
      members: [inputAlias.trim()]
    };

    setEmpires(prev => [...prev, newEntity]);
    setInputAlias('');
  };

  const handleLoadDemoAliases = () => {
    const demoItems = currentCategory.exampleAnswers[language].concat([
      language === 'de' ? 'Der Hausmeister mit dem Generalschlüssel' : 'The janitor with the master key',
      language === 'de' ? 'Kaffee ohne Koffein' : 'Decaf espresso',
      language === 'de' ? 'Der Wecker um 05:30 Uhr' : 'The 5:30 AM alarm',
      language === 'de' ? 'Ein Kaugummi unter dem Schultisch' : 'Gum stuck beneath the desk'
    ]);

    const newEntities: EmpireEntity[] = demoItems.map((alias, i) => ({
      id: `demo-${i}-${Date.now()}`,
      alias,
      king: alias,
      members: [alias]
    }));

    setEmpires(newEntities);
  };

  const handleMerge = () => {
    if (!selectedEntityId || !mergeTargetId || selectedEntityId === mergeTargetId) return;

    setEmpires(prev => {
      const source = prev.find(e => e.id === selectedEntityId);
      const target = prev.find(e => e.id === mergeTargetId);
      if (!source || !target) return prev;

      // Target absorbs source's members
      const updatedTarget: EmpireEntity = {
        ...target,
        members: [...target.members, ...source.members]
      };

      // Remove source
      return prev.filter(e => e.id !== selectedEntityId).map(e => e.id === mergeTargetId ? updatedTarget : e);
    });

    setSelectedEntityId(null);
    setMergeTargetId(null);
  };

  const handleDeleteEntity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmpires(prev => prev.filter(item => item.id !== id));
    if (selectedEntityId === id) setSelectedEntityId(null);
    if (mergeTargetId === id) setMergeTargetId(null);
  };

  const handleResetBoard = () => {
    setEmpires([]);
    setSelectedEntityId(null);
    setMergeTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Generator Card */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-7 shadow-apple-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
              {t.empireCategoryTitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              „{currentCategory.title[language]}“
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0071e3] text-white rounded-full text-xs font-semibold hover:bg-[#0077ed] transition-all shadow-apple-pill"
            >
              <Dices className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{t.randomCategoryBtn}</span>
            </button>

            <button
              onClick={handleCopyCategory}
              className="p-2 border border-black/[0.08] rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              title="Kopieren"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed font-normal">
          {currentCategory.description[language]}
        </p>

        {/* Inspiration Answers */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
            {t.examplesPrompt}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentCategory.exampleAnswers[language].map((ex, idx) => (
              <div key={idx} className="bg-[#f5f5f7] border border-black/[0.03] p-3 rounded-xl text-xs text-[#1d1d1f] italic">
                {ex}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Empire Board */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-7 shadow-apple-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>{t.empireBoardTitle}</span>
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">{t.empireBoardDesc}</p>
          </div>

          <div className="flex items-center gap-2">
            {empires.length === 0 && (
              <button
                onClick={handleLoadDemoAliases}
                className="px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-colors"
              >
                {language === 'de' ? 'Beispiel-Gruppe laden' : 'Load sample group'}
              </button>
            )}
            {empires.length > 0 && (
              <button
                onClick={handleResetBoard}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] bg-black/[0.04] rounded-full transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.resetGame}</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddAlias} className="flex gap-2">
          <input
            type="text"
            value={inputAlias}
            onChange={(e) => setInputAlias(e.target.value)}
            placeholder={t.addAliasPlaceholder}
            className="flex-1 px-4 py-2.5 text-xs rounded-full border border-black/[0.08] bg-black/[0.03] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-[#1d1d1f] placeholder:text-[#86868b]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1d1d1f] text-white rounded-full text-xs font-semibold hover:bg-black transition-all shadow-apple-pill shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addBtn}</span>
          </button>
        </form>

        {/* Merge Control Banner (shown when a card is selected) */}
        {selectedEntityId && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>
                <strong>{empires.find(e => e.id === selectedEntityId)?.alias}</strong> {language === 'de' ? 'wurde erraten? Wähle unten das Königreich, das ihn übernimmt:' : 'was correctly guessed? Click the kingdom that absorbed them:'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {mergeTargetId && (
                <button
                  onClick={handleMerge}
                  className="px-3.5 py-1.5 bg-amber-600 text-white font-semibold rounded-full hover:bg-amber-700 transition-colors shadow-apple-pill"
                >
                  {language === 'de' ? 'Eingliedern bestätigen' : 'Confirm Merge'}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedEntityId(null);
                  setMergeTargetId(null);
                }}
                className="text-[#86868b] hover:text-[#1d1d1f] font-medium"
              >
                {language === 'de' ? 'Abbrechen' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Active Empires Grid */}
        {empires.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#86868b] font-medium">
              <span>{t.activeAliases} ({empires.length})</span>
              <span className="text-[11px] text-[#aeaeb2]">
                {language === 'de' ? 'Klicke auf einen Namen, um ihn bei einem Treffer zu übergeben' : 'Click a name to transfer it when guessed'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {empires.map((entity) => {
                const isSelected = selectedEntityId === entity.id;
                const isTarget = mergeTargetId === entity.id;
                const isExpandedKingdom = entity.members.length > 1;

                return (
                  <div
                    key={entity.id}
                    onClick={() => {
                      if (!selectedEntityId) {
                        setSelectedEntityId(entity.id);
                      } else if (selectedEntityId === entity.id) {
                        setSelectedEntityId(null);
                        setMergeTargetId(null);
                      } else {
                        setMergeTargetId(entity.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20'
                        : isTarget
                        ? 'bg-emerald-500/15 border-emerald-600 ring-2 ring-emerald-600/20'
                        : isExpandedKingdom
                        ? 'bg-[#f5f5f7] border-black/[0.08]'
                        : 'bg-white border-black/[0.06] hover:border-black/[0.15] shadow-apple-card'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isExpandedKingdom ? 'bg-amber-500/15 text-amber-900 font-semibold' : 'bg-black/[0.04] text-[#6e6e73]'
                        }`}>
                          {isExpandedKingdom ? `Königreich (${entity.members.length})` : 'Frei'}
                        </span>

                        <button
                          onClick={(e) => handleDeleteEntity(entity.id, e)}
                          className="text-[#aeaeb2] hover:text-rose-600 p-0.5"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                        {entity.alias}
                      </h4>
                    </div>

                    {isExpandedKingdom && (
                      <div className="mt-3 pt-2.5 border-t border-black/[0.05] text-[11px] text-[#6e6e73] space-y-1">
                        <span className="font-medium text-[#86868b] block text-[10px] uppercase tracking-wider">
                          {language === 'de' ? 'Gefolge:' : 'Followers:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {entity.members.filter(m => m !== entity.alias).map((m, idx) => (
                            <span key={idx} className="bg-white border border-black/[0.06] px-2 py-0.5 rounded-full text-[10px] text-[#1d1d1f]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#f5f5f7] rounded-2xl border border-dashed border-black/[0.06] text-[#86868b] text-xs">
            <p>{t.noAliasesYet}</p>
          </div>
        )}

      </div>
    </div>
  );
};
