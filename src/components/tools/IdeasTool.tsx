import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, ArrowLeft, ArrowRight, Maximize2, Minimize2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../../types';
import { STORY_STARTERS, SORT_CRITERIA, PSYCHIATRIST_RULES } from '../../data/empireContent';
import { shuffle } from '../../utils/random';
import { useWakeLock } from '../../hooks/useWakeLock';
import { tr, Panel, primaryBtn, chipCls } from './common';

type Kind = 'sort' | 'story' | 'rule';

const useDeck = <T,>(items: T[]) => {
  const [deck, setDeck] = useState(() => shuffle(items));
  const [i, setI] = useState(0);

  const next = () => {
    if (i + 1 >= deck.length) {
      setDeck(shuffle(items));
      setI(0);
    } else {
      setI(i + 1);
    }
  };

  const prev = () => {
    if (i > 0) {
      setI(i - 1);
    }
  };

  const reshuffle = () => {
    setDeck(shuffle(items));
    setI(0);
  };

  return { current: deck[i], next, prev, reshuffle, pos: i + 1, total: deck.length };
};

export const IdeasTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [kind, setKind] = useState<Kind>('sort');
  const [isBeamer, setIsBeamer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useWakeLock(isBeamer);

  const sort = useDeck(SORT_CRITERIA);
  const story = useDeck(STORY_STARTERS);
  const rule = useDeck(PSYCHIATRIST_RULES);
  const d = kind === 'sort' ? sort : kind === 'story' ? story : rule;
  const text = d.current ? (d.current as { text: { de: string; en: string } }).text[language] : '';

  const info: Record<Kind, string> = {
    sort: L('Alle ordnen sich schweigend in einer Reihe nach diesem Kriterium. Nur Gesten sind erlaubt.', 'Everyone lines up silently by this criterion. Gestures only.'),
    story: L('Reihum erzählt jede Person einen Satz weiter.', 'Take turns adding one sentence each.'),
    rule: L('Eine Person verlässt den Raum. Die Gruppe einigt sich auf diese Regel, danach wird die Person hereingeholt und stellt Fragen.', 'One person leaves the room. The group agrees on this rule, then the person returns and asks questions.'),
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        d.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        d.prev();
      } else if (e.key === 'Escape' && isBeamer) {
        setIsBeamer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [d, isBeamer]);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      d.next();
    } else if (diff < -50) {
      d.prev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="space-y-6">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Spontane Impulse', 'How it works: Spontaneous prompts')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Spontane Impulse für Zwischendurch oder Warm-ups: Sortierspiele ohne Worte, kollaborative Geschichten und geheime Regeln für das Psychiater-Spiel.',
              'Spontaneous prompts for warm-ups or transitions: silent line-ups, collaborative story beginnings, and secret rules for the psychiatrist game.'
            )}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            ['sort', L('Schweigend sortieren', 'Silent line-up')],
            ['story', L('Geschichtenanfang', 'Story starter')],
            ['rule', L('Regel für Psychiater', 'Psychiatrist rule')],
          ] as [Kind, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={kind === id}
            onClick={() => setKind(id)}
            className={chipCls(kind === id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={d.prev}
            disabled={d.pos <= 1}
            className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={L('Vorherige Idee', 'Previous idea')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-tertiary tabular-nums font-semibold px-2">
            {d.pos} / {d.total}
          </span>
          <button
            type="button"
            onClick={d.next}
            className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={L('Nächste Idee', 'Next idea')}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={d.reshuffle}
            className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={L('Neu mischen', 'Shuffle deck')}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsBeamer(true)}
            className="px-3.5 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{L('Beamer', 'Projector')}</span>
          </button>
        </div>
      </div>

      {/* Prompt Card */}
      <Panel className="text-center py-10 sm:py-16 select-none touch-pan-y">
        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="space-y-4">
          <p className="text-xs text-text-tertiary tabular-nums font-semibold">
            {d.pos} / {d.total}
          </p>
          <p className="text-2xl sm:text-4xl font-bold text-text text-balance leading-tight max-w-xl mx-auto">
            {text}
          </p>
          <p className="text-sm text-text-secondary mt-6 max-w-md mx-auto leading-relaxed">
            {info[kind]}
          </p>
        </div>
      </Panel>

      {/* Bottom Button */}
      <button type="button" onClick={d.next} className={`${primaryBtn} w-full`}>
        <span>{L('Nächste Idee', 'Next idea')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Beamer Fullscreen Presentation Mode */}
      {isBeamer && (
        <div
          className="fixed inset-0 z-80 bg-bg text-text p-6 sm:p-12 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs text-text-tertiary tabular-nums font-semibold">
              {d.pos} / {d.total}
            </span>
            <button
              type="button"
              onClick={() => setIsBeamer(false)}
              className="p-2.5 rounded-control bg-surface-2 hover:bg-surface-raised text-text font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{L('Schließen', 'Close')}</span>
            </button>
          </div>

          <div className="my-auto max-w-4xl mx-auto w-full text-center space-y-6">
            <p className="text-4xl sm:text-6xl font-extrabold text-text text-balance leading-tight">
              {text}
            </p>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
              {info[kind]}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={d.prev}
              disabled={d.pos <= 1}
              className="px-5 py-3 rounded-control bg-surface-2 hover:bg-surface-raised text-text font-bold text-sm disabled:opacity-30 cursor-pointer min-h-[48px] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{L('Zurück', 'Previous')}</span>
            </button>
            <div className="text-xs text-text-tertiary hidden sm:block">
              {L('Pfeiltasten oder Leertaste zum Weiterschalten', 'Use arrow keys or space to advance')}
            </div>
            <button
              type="button"
              onClick={d.next}
              className="px-6 py-3 rounded-control bg-accent text-accent-contrast font-bold text-sm cursor-pointer min-h-[48px] flex items-center gap-2 shadow-xs"
            >
              <span>{L('Weiter', 'Next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
