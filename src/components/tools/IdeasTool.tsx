import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, ArrowLeft, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../../types';
import { STORY_STARTERS, SORT_CRITERIA, PSYCHIATRIST_RULES } from '../../data/empireContent';
import { shuffle } from '../../utils/random';
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
  const [showHelp, setShowHelp] = useState(false);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [d]);

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
    </div>
  );
};
