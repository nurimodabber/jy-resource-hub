import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Timer, Crown, Eye, Clock, Bookmark } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { QUOTES_DATA } from '../data/quotes';
import { usePlanner } from '../context/PlannerContext';
import { FinderTool } from './tools/FinderTool';
import { tr } from './tools/common';

export interface HomeViewProps {
  language: Language;
  favorites: string[];
}

const dayOfYear = () => {
  const now = new Date();
  return Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 86400000);
};

export const HomeView: React.FC<HomeViewProps> = ({ language, favorites }) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const { activePlan } = usePlanner();
  const quote = QUOTES_DATA[dayOfYear() % QUOTES_DATA.length];
  const slots = activePlan?.slots.length ?? 0;
  const minutes = activePlan?.slots.reduce((s, x) => s + x.durationMinutes, 0) ?? 0;

  const quick: { to: string; label: string; icon: React.FC<{ className?: string }> }[] = [
    { to: '/tools/empire', label: 'Empire', icon: Crown },
    { to: '/tools/roles', label: L('Rollen', 'Roles'), icon: Eye },
    { to: '/tools/teams', label: L('Teams', 'Teams'), icon: Users },
    { to: '/tools/timer', label: L('Timer', 'Timer'), icon: Timer },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">{L('Was brauchst du für dein Treffen?', 'What do you need for your meeting?')}</h1>
        <p className="text-text-secondary mt-1">{L('Spiele, Zitate und Werkzeuge für deine Gruppe.', 'Games, quotes and tools for your group.')}</p>
      </header>

      {(slots > 0 || favorites.length > 0) && (
        <section aria-label={L('Weitermachen', 'Continue')} className="grid gap-3 sm:grid-cols-2">
          {slots > 0 && (
            <Link to="/planner" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2">
              <Clock className="w-5 h-5 text-text-secondary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text">{L('Treffen weiterplanen', 'Continue your plan')}</p>
                <p className="text-sm text-text-secondary tabular-nums">
                  {slots} {L('Bausteine', 'blocks')} · {minutes} {L('Min', 'min')}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </Link>
          )}
          {favorites.length > 0 && (
            <Link to="/saved" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2">
              <Bookmark className="w-5 h-5 text-text-secondary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text">{t.savedItems}</p>
                <p className="text-sm text-text-secondary tabular-nums">{favorites.length}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary" />
            </Link>
          )}
        </section>
      )}

      <section aria-label={L('Spiel finden', 'Find a game')}>
        <h2 className="text-lg font-semibold mb-3">{L('Ein Spiel finden', 'Find a game')}</h2>
        <FinderTool language={language} />
      </section>

      <section aria-label={t.tabTools}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">{t.tabTools}</h2>
          <Link to="/tools" className="text-sm text-text-secondary hover:text-text">
            {L('Alle ansehen', 'See all')}
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to} className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-surface hover:bg-surface-2">
                <Icon className="w-5 h-5 text-text-secondary" />
                <span className="font-medium text-text">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {quote && (
        <section aria-label={L('Zitat des Tages', 'Quote of the day')}>
          <h2 className="text-sm font-semibold text-text-secondary mb-3">{L('Zitat des Tages', 'Quote of the day')}</h2>
          <Link to={`/quotes/${quote.id}`} className="block group">
            <blockquote className="font-serif text-lg sm:text-xl leading-relaxed text-text line-clamp-6 border-l-2 border-border pl-4 group-hover:border-accent">
              {language === 'de' ? quote.textDe : quote.textEn}
            </blockquote>
            <p className="text-sm text-text-secondary mt-2 pl-4">{quote.source[language]}</p>
          </Link>
        </section>
      )}
    </div>
  );
}
;
