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

  const handleResetBoard = () => {
    if (empires.length === 0) return;
    if (window.confirm(language === 'de' ? 'Möchtest du das gesamte Spielfeld wirklich leeren?' : 'Reset entire game board?')) {
      setEmpires([]);
      setSelectedEntityId(null);
      setMergeTargetId(null);
    }
  };

  const handleLoadDemoEntities = () => {
    const demo = [
      'Der Falke', 'Sternschnuppe', 'Der stille Ozean', 'Smaragd-Drache', 
      'Die Quelle', 'Silberner Pfeil', 'Sonnenstrahl', 'Goldener Kompass'
    ];
    const generated: EmpireEntity[] = demo.map((alias, i) => ({
      id: 'demo-' + i,
      alias,
      king: alias,
      members: [alias]
    }));
    setEmpires(generated);
  };

  const handleDeleteEntity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmpires(prev => prev.filter(item => item.id !== id));
    if (selectedEntityId === id) setSelectedEntityId(null);
    if (mergeTargetId === id) setMergeTargetId(null);
  };

  const handleMergeEntities = () => {
    if (!selectedEntityId || !mergeTargetId || selectedEntityId === mergeTargetId) return;

    const conqueror = empires.find(e => e.id === selectedEntityId);
    const defeated = empires.find(e => e.id === mergeTargetId);

    if (!conqueror || !defeated) return;

    setEmpires(prev => {
      return prev
        .filter(e => e.id !== mergeTargetId)
        .map(e => {
          if (e.id === selectedEntityId) {
            return {
              ...e,
              members: [...e.members, ...defeated.members]
            };
          }
          return e;
        });
    });

    setSelectedEntityId(null);
    setMergeTargetId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Category Inspiration Card */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
              {t.empireCategoryPrompt}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              {currentCategory.title[language]}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-contrast rounded-xl text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs cursor-pointer min-h-[36px]"
            >
              <Dices className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{t.shuffleCategory}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCategory}
              className="p-2 border border-border rounded-xl text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Kategorie kopieren"
              aria-label="Kategorie kopieren"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
          {currentCategory.description[language]}
        </p>

        <div className="space-y-1.5 pt-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary block">
            {t.exampleAnswers}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentCategory.exampleAnswers[language].map((ex, idx) => (
              <div key={idx} className="bg-surface-2 border border-border p-3 rounded-xl text-xs text-text italic">
                „{ex}“
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Assistant & Board */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Crown className="w-4 h-4 text-accent" />
              <span>{t.interactiveBoard}</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">{t.empireBoardDesc}</p>
          </div>

          <div className="flex items-center gap-2">
            {empires.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemoEntities}
                className="px-3.5 py-1.5 text-xs font-semibold text-text bg-surface-2 hover:bg-surface-raised rounded-xl border border-border transition-colors cursor-pointer min-h-[36px]"
              >
                {t.loadDemoNames}
              </button>
            )}

            {empires.length > 0 && (
              <button
                type="button"
                onClick={handleResetBoard}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-red-500 bg-surface-2 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetBoard}</span>
              </button>
            )}
          </div>
        </div>

        {/* Alias Input Form */}
        <form onSubmit={handleAddAlias} className="flex gap-2">
          <input
            type="text"
            value={inputAlias}
            onChange={(e) => setInputAlias(e.target.value)}
            placeholder={t.aliasPlaceholder}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-border bg-surface-2 focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-accent transition-all text-text placeholder:text-text-tertiary"
          />
          <button
            type="submit"
            disabled={!inputAlias.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-accent-contrast rounded-xl text-xs font-semibold hover:bg-accent-hover disabled:opacity-40 transition-colors shadow-xs shrink-0 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addAliasBtn}</span>
          </button>
        </form>

        {/* Merge Resolver Banner */}
        {selectedEntityId && mergeTargetId && (
          <div className="p-4 rounded-2xl bg-accent-subtle border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="text-xs">
              <span className="font-semibold text-text block">
                {language === 'de' ? 'Reiche vereinen:' : 'Merge Empires:'}
              </span>
              <span className="text-text-secondary">
                <strong className="text-text font-bold">{empires.find(e => e.id === selectedEntityId)?.alias}</strong>
                {' '}{language === 'de' ? 'erobert' : 'conquers'}{' '}
                <strong className="text-text font-bold">{empires.find(e => e.id === mergeTargetId)?.alias}</strong>.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMergeEntities}
                className="px-4 py-2 rounded-xl bg-accent text-accent-contrast font-semibold text-xs hover:bg-accent-hover transition-colors shadow-xs cursor-pointer min-h-[36px]"
              >
                {t.confirmMerge}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedEntityId(null);
                  setMergeTargetId(null);
                }}
                className="text-xs text-text-secondary hover:text-text font-medium px-2 py-1 min-h-[36px]"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Board Entities Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>{t.activeEmpiresLabel} ({empires.length})</span>
            <span className="text-2xs text-text-tertiary">
              {language === 'de' ? 'Tippe auf zwei Reiche, um sie zu vereinen' : 'Tap two empires to merge them'}
            </span>
          </div>

          {empires.length === 0 ? (
            <div className="text-center py-10 bg-surface-2 rounded-2xl border border-dashed border-border text-text-secondary text-xs">
              {language === 'de' 
                ? 'Noch keine Decknamen eingetragen. Füge oben die Namen der Jugendlichen hinzu oder lade Demo-Namen.' 
                : 'No aliases entered yet. Add player names above or load demo entries.'}
            </div>
          ) : (
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
                      } else if (!mergeTargetId) {
                        setMergeTargetId(entity.id);
                      } else if (mergeTargetId === entity.id) {
                        setMergeTargetId(null);
                      } else {
                        setMergeTargetId(entity.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'border-accent bg-accent-subtle shadow-xs'
                        : isTarget
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'bg-surface-2 border-border hover:border-accent/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full ${
                          isExpandedKingdom ? 'bg-accent text-accent-contrast font-semibold' : 'bg-surface text-text-secondary border border-border'
                        }`}>
                          <Crown className="w-3 h-3" />
                          <span>{entity.members.length} {language === 'de' ? 'Bürger' : 'citizens'}</span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteEntity(entity.id, e)}
                          className="text-text-tertiary hover:text-red-500 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-text leading-snug">
                        {entity.alias}
                      </h4>

                      {isExpandedKingdom && (
                        <div className="mt-2.5 pt-2 border-t border-border text-2xs text-text-secondary space-y-1">
                          <span className="font-semibold text-text-tertiary block uppercase tracking-wider text-[10px]">
                            {language === 'de' ? 'Eroberte Decknamen:' : 'Conquered Aliases:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {entity.members.map((m, idx) => (
                              <span key={idx} className="bg-surface border border-border px-2 py-0.5 rounded-full text-[10px] text-text">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
