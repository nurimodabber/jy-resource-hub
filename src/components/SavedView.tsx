import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { EmptyState } from './ui/EmptyState';

interface SavedViewProps {
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

type Group = 'games' | 'quotes' | 'methods' | 'projects';

interface Row {
  id: string;
  title: string;
  meta: string;
  href: string;
}

export const SavedView: React.FC<SavedViewProps> = ({ language, favorites, onToggleFavorite }) => {
  const t = UI_TRANSLATIONS[language];
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const has = (id: string) => favorites.includes(id);
    const games: Row[] = GAMES_DATA.filter((g) => has(g.id)).map((g) => ({
      id: g.id,
      title: g.title[language],
      meta: `${g.groupSize.min}–${g.groupSize.max} · ${g.durationMinutes}`,
      href: `/games/${g.id}`,
    }));
    const quotes: Row[] = QUOTES_DATA.filter((q) => has(q.id)).map((q) => ({
      id: q.id,
      title: q.theme[language],
      meta: q.source[language],
      href: `/quotes/${q.id}`,
    }));
    const methods: Row[] = QUOTE_METHODS_DATA.filter((m) => has(m.id)).map((m) => ({
      id: m.id,
      title: m.name[language],
      meta: m.durationMinutes,
      href: '/quotes?tab=methods',
    }));
    const projects: Row[] = [
      ...SERVICE_PROJECTS_DATA.filter((p) => has(p.id)).map((p) => ({
        id: p.id,
        title: p.title[language],
        meta: p.duration[language],
        href: `/service-arts/${p.id}`,
      })),
      ...ARTS_PROMPTS_DATA.filter((a) => has(a.id)).map((a) => ({
        id: a.id,
        title: a.title[language],
        meta: a.book[language],
        href: `/service-arts/${a.id}`,
      })),
    ];
    return { games, quotes, methods, projects } as Record<Group, Row[]>;
  }, [favorites, language]);

  const labels: Record<Group, string> = {
    games: t.savedGames,
    quotes: t.savedQuotes,
    methods: t.savedMethods,
    projects: t.savedProjects,
  };
  const order: Group[] = ['games', 'quotes', 'methods', 'projects'];
  const nonEmpty = order.filter((g) => groups[g].length > 0);
  const [active, setActive] = useState<Group | 'all'>('all');
  const shown = active === 'all' ? nonEmpty : nonEmpty.filter((g) => g === active);

  if (nonEmpty.length === 0) {
    return (
      <EmptyState
        title={t.savedEmptyTitle}
        description={t.savedEmptyHint}
        actionLabel={t.savedEmptyAction}
        onAction={() => navigate('/games')}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">{t.savedItems}</h1>

      <div className="flex flex-wrap gap-2 mb-6" role="group">
        {(['all', ...nonEmpty] as const).map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={active === g}
            onClick={() => setActive(g)}
            className={`h-9 px-3 rounded-lg text-sm border transition-colors ${
              active === g
                ? 'bg-accent-subtle border-accent text-accent-text font-semibold'
                : 'border-border text-text-secondary hover:text-text'
            }`}
          >
            {g === 'all' ? (language === 'de' ? 'Alle' : 'All') : labels[g]}
            <span className="ml-1.5 tabular-nums text-text-tertiary">{g === 'all' ? favorites.length : groups[g].length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {shown.map((g) => (
          <section key={g} aria-label={labels[g]}>
            <h2 className="text-sm font-semibold text-text-secondary mb-2">{labels[g]}</h2>
            <ul className="divide-y divide-border border border-border rounded-xl bg-surface">
              {groups[g].map((row) => (
                <li key={row.id} className="flex items-center gap-3 pr-2">
                  <Link to={row.href} className="flex-1 min-w-0 px-4 py-3">
                    <div className="text-sm font-medium text-text truncate">{row.title}</div>
                    <div className="text-xs text-text-secondary truncate tabular-nums">{row.meta}</div>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(row.id, e)}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-accent-text hover:bg-surface-2"
                    aria-label={`${t.savedItems}: ${row.title}`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};
