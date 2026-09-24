import React, { useState } from 'react';
import { Dices, Plus, Trash2, RotateCcw, Copy, Check, Users, Crown, Shield, Maximize2 } from 'lucide-react';
import { Language, EmpirePromptCategory } from '../types';
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
      {/* Category Generator Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {t.empireCategoryTitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              „{currentCategory.title[language]}“
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <Dices className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{t.randomCategoryBtn}</span>
            </button>

            <button
              onClick={handleCopyCategory}
              className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
              title="Kopieren"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {currentCategory.description[language]}
        </p>

        {/* Inspiration Answers */}
        <div className="pt-2 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            {t.examplesPrompt}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentCategory.exampleAnswers[language].map((ex, idx) => (
              <div key={idx} className="bg-stone-50 border border-stone-200/70 p-2.5 rounded-lg text-xs text-stone-700 italic">
                {ex}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Empire Board */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-700" />
              <span>{t.empireBoardTitle}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">{t.empireBoardDesc}</p>
          </div>

          <div className="flex items-center gap-2">
            {empires.length === 0 && (
              <button
                onClick={handleLoadDemoAliases}
                className="px-2.5 py-1 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                {language === 'de' ? 'Beispiel-Gruppe laden' : 'Load sample group'}
              </button>
            )}
            {empires.length > 0 && (
              <button
                onClick={handleResetBoard}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg transition-colors"
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
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addBtn}</span>
          </button>
        </form>

        {/* Merge Control Banner (shown when a card is selected) */}
        {selectedEntityId && (
          <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-700" />
              <span>
                <strong>{empires.find(e => e.id === selectedEntityId)?.alias}</strong> {language === 'de' ? 'wurde erraten? Wähle unten das Königreich, das ihn übernimmt:' : 'was correctly guessed? Click the kingdom that absorbed them:'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {mergeTargetId && (
                <button
                  onClick={handleMerge}
                  className="px-3 py-1 bg-amber-800 text-white font-bold rounded-lg hover:bg-amber-900 transition-colors"
                >
                  {language === 'de' ? 'Eingliedern bestätigen' : 'Confirm Merge'}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedEntityId(null);
                  setMergeTargetId(null);
                }}
                className="text-stone-500 hover:text-stone-800 font-medium"
              >
                {language === 'de' ? 'Abbrechen' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Active Empires Grid */}
        {empires.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>{t.activeAliases} ({empires.length})</span>
              <span className="text-[11px] text-stone-400">
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-500/20'
                        : isTarget
                        ? 'bg-emerald-100/70 border-emerald-600 ring-2 ring-emerald-600/20'
                        : isExpandedKingdom
                        ? 'bg-stone-50 border-stone-300'
                        : 'bg-white border-stone-200/90 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isExpandedKingdom ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {isExpandedKingdom ? `Königreich (${entity.members.length})` : 'Frei'}
                        </span>

                        <button
                          onClick={(e) => handleDeleteEntity(entity.id, e)}
                          className="text-stone-300 hover:text-rose-600 p-0.5"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-stone-900 leading-snug">
                        {entity.alias}
                      </h4>
                    </div>

                    {isExpandedKingdom && (
                      <div className="mt-3 pt-2.5 border-t border-stone-200/70 text-[11px] text-stone-600 space-y-1">
                        <span className="font-semibold text-stone-500 block">
                          {language === 'de' ? 'Gefolge:' : 'Followers:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {entity.members.filter(m => m !== entity.alias).map((m, idx) => (
                            <span key={idx} className="bg-white border border-stone-200 px-1.5 py-0.5 rounded text-[10px] text-stone-700">
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
          <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-500 text-xs">
            <p>{t.noAliasesYet}</p>
          </div>
        )}

      </div>
    </div>
  );
};
