import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Copy, Check, ChevronDown, ChevronUp, AlertCircle, Bookmark, Eye, Eraser, RotateCcw } from 'lucide-react';
import { QuoteMethod, QuotePhase, QuoteItem, Language } from '../types';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { QUOTES_DATA } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';

interface QuotesViewProps {
  searchQuery: string;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  showOnlyFavorites: boolean;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  searchQuery,
  language,
  favorites,
  onToggleFavorite,
  showOnlyFavorites,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<QuotePhase | 'all'>('all');
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>('verschwindende-tafel');
  
  // Selected practice quote
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem>(QUOTES_DATA[0]);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Interactive Disappearing Board State
  const quoteText = language === 'de' ? selectedQuote.textDe : selectedQuote.textEn;
  const words = useMemo(() => quoteText.split(/\s+/), [quoteText]);
  const [hiddenWordIndices, setHiddenWordIndices] = useState<number[]>([]);

  // Reset hidden words whenever the quote or language changes
  useEffect(() => {
    setHiddenWordIndices([]);
  }, [selectedQuote, language]);

  const t = UI_TRANSLATIONS[language];

  const handleEraseNext = () => {
    const unhidden = words.map((_, i) => i).filter(i => !hiddenWordIndices.includes(i));
    if (unhidden.length === 0) return;

    // Pick 2-3 random unhidden words to hide
    const countToHide = Math.min(unhidden.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...unhidden].sort(() => 0.5 - Math.random());
    const toHide = shuffled.slice(0, countToHide);

    setHiddenWordIndices(prev => [...prev, ...toHide]);
  };

  const handleToggleWord = (idx: number) => {
    setHiddenWordIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const filteredMethods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((method) => {
      if (showOnlyFavorites && !favorites.includes(method.id)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = method.name[language].toLowerCase().includes(q);
        const matchesSummary = method.summary[language].toLowerCase().includes(q);
        const matchesWhy = method.whyItWorks[language].toLowerCase().includes(q);
        if (!matchesName && !matchesSummary && !matchesWhy) return false;
      }

      if (selectedPhase !== 'all' && method.phase !== selectedPhase) {
        return false;
      }

      return true;
    });
  }, [searchQuery, language, selectedPhase, showOnlyFavorites, favorites]);

  const copyQuoteToClipboard = () => {
    navigator.clipboard.writeText(`„${quoteText}“\n— ${selectedQuote.source[language]} (${selectedQuote.book[language]})`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {t.quotesHeaderTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
          {t.quotesHeaderDesc}
        </p>
      </div>

      {/* Interactive Disappearing Board (Verschwindende Tafel Simulator) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Eraser className="w-4 h-4 text-emerald-800" />
              <span>{t.boardTitle}</span>
            </h2>
            <p className="text-xs text-stone-500">{t.boardSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyQuoteToClipboard}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>{copiedQuote ? t.copiedSuccess : t.copyQuote}</span>
            </button>
          </div>
        </div>

        {/* Quote Selection Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-stone-400 mr-1">{t.practiceQuoteTitle}</span>
          {QUOTES_DATA.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuote(q)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedQuote.id === q.id
                  ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {q.theme[language]}
            </button>
          ))}
        </div>

        {/* The Board Canvas */}
        <div className="bg-stone-900 text-stone-100 rounded-xl p-6 sm:p-8 shadow-inner border border-stone-800 space-y-4 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 font-serif text-lg sm:text-2xl leading-relaxed tracking-wide min-h-[100px]">
            {words.map((word, idx) => {
              const isHidden = hiddenWordIndices.includes(idx);
              return (
                <span
                  key={idx}
                  onClick={() => handleToggleWord(idx)}
                  className={`cursor-pointer transition-all duration-200 select-none ${
                    isHidden
                      ? 'text-stone-600 border-b border-stone-700 px-2 py-0.5'
                      : 'hover:text-emerald-300'
                  }`}
                  title={isHidden ? 'Klicken zum Einblenden' : 'Klicken zum Ausblenden'}
                >
                  {isHidden ? '_____' : word}
                </span>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
            <span>— {selectedQuote.source[language]} ({selectedQuote.book[language]})</span>
            <span className="font-mono text-[11px]">
              {words.length - hiddenWordIndices.length} / {words.length} {t.wordsRemaining}
            </span>
          </div>
        </div>

        {/* Board Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleEraseNext}
              disabled={hiddenWordIndices.length === words.length}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{t.eraseNextWord}</span>
            </button>
            <button
              onClick={() => setHiddenWordIndices([])}
              disabled={hiddenWordIndices.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetBoard}</span>
            </button>
          </div>

          {hiddenWordIndices.length === words.length && (
            <p className="text-xs font-medium text-emerald-800 animate-in fade-in">
              {t.allWordsHidden}
            </p>
          )}
        </div>
      </div>

      {/* The 3-Phase Progression Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div 
          onClick={() => setSelectedPhase(selectedPhase === 1 ? 'all' : 1)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedPhase === 1
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200/90 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              selectedPhase === 1 ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-800'
            }`}>Phase 1</span>
            <span className="text-[11px] opacity-60">{t.stepLabel} 1</span>
          </div>
          <h3 className="font-bold text-sm mb-1">{t.phase1Title}</h3>
          <p className={`text-xs leading-relaxed ${selectedPhase === 1 ? 'text-stone-300' : 'text-stone-500'}`}>
            {t.phase1Desc}
          </p>
        </div>

        <div 
          onClick={() => setSelectedPhase(selectedPhase === 2 ? 'all' : 2)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedPhase === 2
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200/90 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              selectedPhase === 2 ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-800'
            }`}>Phase 2</span>
            <span className="text-[11px] opacity-60">{t.stepLabel} 2</span>
          </div>
          <h3 className="font-bold text-sm mb-1">{t.phase2Title}</h3>
          <p className={`text-xs leading-relaxed ${selectedPhase === 2 ? 'text-stone-300' : 'text-stone-500'}`}>
            {t.phase2Desc}
          </p>
        </div>

        <div 
          onClick={() => setSelectedPhase(selectedPhase === 3 ? 'all' : 3)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedPhase === 3
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-800 border-stone-200/90 hover:border-stone-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              selectedPhase === 3 ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-800'
            }`}>Phase 3</span>
            <span className="text-[11px] opacity-60">{t.stepLabel} 3</span>
          </div>
          <h3 className="font-bold text-sm mb-1">{t.phase3Title}</h3>
          <p className={`text-xs leading-relaxed ${selectedPhase === 3 ? 'text-stone-300' : 'text-stone-500'}`}>
            {t.phase3Desc}
          </p>
        </div>
      </div>

      {/* Methods List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {selectedPhase === 'all' ? t.allPhases : `Phase ${selectedPhase}`} ({filteredMethods.length})
          </h2>
          {selectedPhase !== 'all' && (
            <button
              onClick={() => setSelectedPhase('all')}
              className="text-xs text-stone-600 font-semibold hover:underline"
            >
              {t.allPhases}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredMethods.map((method) => {
            const isExpanded = expandedMethodId === method.id;
            const isFavorite = favorites.includes(method.id);

            return (
              <div 
                key={method.id}
                className="bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all"
              >
                {/* Header */}
                <div 
                  onClick={() => setExpandedMethodId(isExpanded ? null : method.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-stone-50/70 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        Phase {method.phase}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                        {method.modality === 'movement' && t.modalityMovement}
                        {method.modality === 'rhythm' && t.modalityRhythm}
                        {method.modality === 'visual' && t.modalityVisual}
                        {method.modality === 'focus' && t.modalityFocus}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {method.durationMinutes}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900">
                      {method.name[language]}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                      {method.summary[language]}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => onToggleFavorite(method.id, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFavorite ? 'text-amber-600' : 'text-stone-300 hover:text-stone-600'
                      }`}
                      title={t.savedItems}
                    >
                      <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-stone-100 bg-stone-50/40 space-y-5 text-xs text-stone-700">
                    {/* Why It Works */}
                    <div className="bg-stone-100/70 border border-stone-200/80 rounded-xl p-3.5 mt-4">
                      <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] block mb-1">
                        {t.whyWorksTitle}
                      </span>
                      <p className="text-stone-800 leading-relaxed">
                        {method.whyItWorks[language]}
                      </p>
                    </div>

                    {/* Step-by-Step */}
                    <div className="space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-stone-400 text-[10px]">
                        {t.stepsInRoomTitle}
                      </h4>
                      <div className="space-y-2">
                        {method.steps.map((st, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-stone-200/60">
                            <span className="w-5 h-5 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <strong className="text-stone-900 block font-semibold">{st.name[language]}:</strong>
                              <span className="text-stone-600 leading-relaxed">{st.description[language]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Criteria & Reset */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                        <strong className="text-stone-900 block font-semibold text-xs mb-1">
                          {t.successGoalTitle}
                        </strong>
                        <p className="text-stone-600 text-xs">{method.successCriteria[language]}</p>
                      </div>

                      {method.resetRule && (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                          <strong className="text-amber-900 block font-semibold text-xs mb-1">
                            {t.resetRuleTitle}
                          </strong>
                          <p className="text-amber-950 text-xs">{method.resetRule[language]}</p>
                        </div>
                      )}
                    </div>

                    {/* Animator Tips */}
                    {method.animatorTips[language].length > 0 && (
                      <div className="p-3 bg-stone-100 rounded-xl border border-stone-200/60">
                        <strong className="text-stone-900 block font-semibold text-xs mb-1">
                          {t.tipsPracticeTitle}
                        </strong>
                        <ul className="space-y-1">
                          {method.animatorTips[language].map((tip, idx) => (
                            <li key={idx} className="text-stone-700 flex items-start gap-1.5">
                              <span className="text-stone-400 font-bold">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
