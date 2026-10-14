import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Plus, Play, Printer, Share2, Copy, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { shareResource } from '../utils/share';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { parseMinutes } from '../utils/random';
import { gameMeta } from './GameCard';
import { tr, primaryBtn, secondaryBtn } from './tools/common';

const TOOL_FOR_GAME: Record<string, { to: string; de: string; en: string }> = {
  empire: { to: '/tools/empire', de: 'Empire-Werkzeug öffnen', en: 'Open Empire tool' },
  werwolf: { to: '/tools/roles', de: 'Rollenverteiler und Erzähler öffnen', en: 'Open role dealer and narrator' },
  spion: { to: '/tools/roles', de: 'Rollenverteiler öffnen', en: 'Open role dealer' },
  'wer-bin-ich': { to: '/tools/roles', de: 'Begriffe verteilen', en: 'Deal terms' },
  'schlafmuetze-moerder': { to: '/tools/roles', de: 'Rollenverteiler öffnen', en: 'Open role dealer' },
  psychiater: { to: '/tools/ideas', de: 'Regeln für den Psychiater', en: 'Psychiatrist rules' },
};

interface Props {
  game: Game;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

const PlayMode: React.FC<{ game: Game; language: Language; onClose: () => void }> = ({ game, language, onClose }) => {
  const L = tr(language);
  const steps = game.rules[language];
  const [i, setI] = useState(0);
  useWakeLock(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') setI((v) => Math.min(steps.length - 1, v + 1));
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, steps.length]);

  return (
    <div className="fixed inset-0 z-[70] bg-bg flex flex-col safe-top safe-bottom" role="dialog" aria-modal="true" aria-label={game.title[language]}>
      <div className="flex items-center justify-between px-4 sm:px-8 h-14 border-b border-border shrink-0">
        <p className="text-sm text-text-secondary truncate">{game.title[language]}</p>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm text-text-secondary hover:text-text">
          <X className="w-4 h-4" />
          {L('Beenden', 'Close')}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-6 sm:px-16 py-8">
        <div className="max-w-4xl w-full">
          <p className="text-sm text-text-tertiary tabular-nums mb-3">
            {L('Schritt', 'Step')} {i + 1} / {steps.length}
          </p>
          <p className="text-2xl sm:text-4xl lg:text-5xl leading-snug text-text text-balance">{steps[i]}</p>
        </div>
      </div>
      <div className="flex gap-2 p-4 sm:px-8 border-t border-border shrink-0">
        <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className={secondaryBtn} aria-label={L('Zurück', 'Back')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        {i < steps.length - 1 ? (
          <button type="button" onClick={() => setI(i + 1)} className={`${primaryBtn} flex-1`}>
            {L('Weiter', 'Next')}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button type="button" onClick={onClose} className={`${primaryBtn} flex-1`}>
            {L('Fertig', 'Done')}
          </button>
        )}
      </div>
    </div>
  );
};

export const GamePage: React.FC<Props> = ({ game, language, isFavorite, onToggleFavorite }) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const tool = TOOL_FOR_GAME[game.id];
  const materials = game.materials[language].filter((m) => !/^(keine|none)/i.test(m));

  const addToPlan = () => {
    const [min] = parseMinutes(game.durationMinutes);
    const result = addSlotToPlan({
      type: game.energyLevel === 'calm' ? 'closing' : 'warmup',
      title: { de: game.title.de, en: game.title.en },
      durationMinutes: min || 15,
      description: { de: game.summary.de, en: game.summary.en },
      referenceId: game.id,
      referenceType: 'game',
    });
    showToast({
      text: L('Zum Plan hinzugefügt', 'Added to plan'),
      action: { label: L('Plan öffnen', 'Open plan'), onClick: () => navigate('/planner') },
      undo: { label: L('Rückgängig', 'Undo'), onClick: () => result.undo() },
    });
  };

  const copyRules = async () => {
    const text = `${game.title[language]}\n\n${game.idea[language]}\n\n${game.rules[language].map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const share = () =>
    shareResource({ title: `${game.title[language]} – ${t.siteTitle}`, text: game.title[language], url: `${window.location.origin}/games/${game.id}` });

  return (
    <article className="max-w-3xl mx-auto pb-16">
      <div className="print:hidden">
        <Link to="/games" className="inline-flex items-center gap-1.5 -ml-2 px-2 min-h-[40px] rounded-lg text-sm text-text-secondary hover:text-text">
          <ArrowLeft className="w-4 h-4" />
          {t.tabGames}
        </Link>
      </div>

      <header className="mt-1 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-text text-balance">{game.title[language]}</h1>
        <p className="text-sm text-text-secondary mt-2 tabular-nums">{gameMeta(game, language).join(' · ')}</p>
        <p className="text-sm text-text-tertiary">{game.space[language]}</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8 print:hidden">
        <button type="button" onClick={() => setPlaying(true)} className={primaryBtn}>
          <Play className="w-4 h-4" />
          {L('Spielmodus', 'Play mode')}
        </button>
        <button type="button" onClick={addToPlan} className={secondaryBtn}>
          <Plus className="w-4 h-4" />
          {L('Zum Plan', 'Add to plan')}
        </button>
        <button type="button" onClick={(e) => onToggleFavorite(game.id, e)} aria-pressed={isFavorite} className={secondaryBtn}>
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-accent-text' : ''}`} />
          {isFavorite ? t.savedItems : L('Merken', 'Save')}
        </button>
      </div>

      {tool && (
        <Link to={tool.to} className="block mb-8 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2 text-sm print:hidden">
          <span className="font-medium text-text">{L(tool.de, tool.en)}</span>
          <span className="text-text-secondary"> – {L('digitale Hilfe für dieses Spiel', 'digital help for this game')}</span>
        </Link>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary mb-2">{t.ideaTitle}</h2>
        <p className="text-text leading-relaxed">{game.idea[language]}</p>
      </section>

      {materials.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary mb-2">{t.materialsTitle}</h2>
          <p className="text-text">{materials.join(', ')}</p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">{t.rulesTitle}</h2>
        <ol className="space-y-3">
          {game.rules[language].map((rule, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="w-6 shrink-0 text-text-tertiary tabular-nums text-right pt-px">{idx + 1}.</span>
              <p className="text-text leading-relaxed">{rule}</p>
            </li>
          ))}
        </ol>
      </section>

      {game.animatorTips[language].length > 0 && (
        <section className="mb-8 p-4 rounded-xl bg-surface-2 border border-border">
          <h2 className="text-sm font-semibold text-text mb-2">{t.tipsTitle}</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-secondary">
            {game.animatorTips[language].map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2 print:hidden">
        <button type="button" onClick={copyRules} className={secondaryBtn}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t.copiedSuccess : t.copyRules}
        </button>
        <button type="button" onClick={share} className={secondaryBtn}>
          <Share2 className="w-4 h-4" />
          {t.shareBtn}
        </button>
        <button type="button" onClick={() => window.print()} className={secondaryBtn}>
          <Printer className="w-4 h-4" />
          {L('Drucken', 'Print')}
        </button>
      </div>

      {playing && <PlayMode game={game} language={language} onClose={() => setPlaying(false)} />}
    </article>
  );
};
