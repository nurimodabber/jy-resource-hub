import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { EmptyState, Chip, Card } from './ui';

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
  const isDe = language === 'de';
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const has = (id: string) => favorites.includes(id);
    const games: Row[] = GAMES_DATA.filter((g) => has(g.id)).map((g) => ({
      id: g.id,
      title: g.title[language],
      meta: `${g.groupSize.min}–${g.groupSize.max} ${isDe ? 'Jugendliche' : 'youth'} · ${g.durationMinutes}`,
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
        href: `/service/${p.id}`,
      })),
      ...ARTS_PROMPTS_DATA.filter((a) => has(a.id)).map((a) => ({
        id: a.id,
        title: a.title[language],
        meta: a.book[language],
        href: `/arts/${a.id}`,
      })),
    ];
    return { games, quotes, methods, projects } as Record<Group, Row[]>;
  }, [favorites, language, isDe]);

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
      <div className="py-12">
        <EmptyState
          icon={<Bookmark className="w-6 h-6" strokeWidth={1.75} />}
          title={t.savedEmptyTitle}
          description={t.savedEmptyHint}
          actionLabel={t.savedEmptyAction}
          onAction={() => navigate('/games')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 pb-20">
      {/* Header following standard pattern */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-text">{t.savedItems}</h1>
          <span className="px-2.5 py-0.5 rounded-chip bg-accent-subtle text-accent-text text-sm font-bold tabular-nums">
            {favorites.length}
          </span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          {isDe
            ? 'Alle von dir gespeicherten Spiele, Zitate und Ideen auf einen Blick.'
            : 'All your bookmarked games, quotes, and project ideas in one place.'}
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Gemerkt filtern">
        <Chip
          selected={active === 'all'}
          count={favorites.length}
          onClick={() => setActive('all')}
        >
          {isDe ? 'Alle' : 'All'}
        </Chip>
        {nonEmpty.map((g) => (
          <Chip
            key={g}
            selected={active === g}
            count={groups[g].length}
            onClick={() => setActive(g)}
          >
            {labels[g]}
          </Chip>
        ))}
      </div>

      {/* Grouped lists */}
      <div className="space-y-8">
        {shown.map((g) => (
          <section key={g} aria-label={labels[g]}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold text-text uppercase tracking-wider">{labels[g]}</h2>
              <span className="text-xs text-text-tertiary tabular-nums font-semibold">{groups[g].length}</span>
            </div>
            <Card variant="list">
              {groups[g].map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-surface-2 transition-colors duration-150 ease-out group"
                >
                  <Link to={row.href} className="flex-1 min-w-0 pr-3">
                    <div className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                      {row.title}
                    </div>
                    <div className="text-xs text-text-tertiary truncate mt-0.5">
                      {row.meta}
                    </div>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => onToggleFavorite(row.id, e)}
                      aria-pressed="true"
                      className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-control text-accent hover:bg-surface-2/80 active:scale-90 motion-reduce:transform-none transition-all duration-100 ease-out cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`${t.savedItems} entfernen: ${row.title}`}
                    >
                      <Bookmark className="w-5 h-5 fill-current text-accent" strokeWidth={1.75} />
                    </button>
                    <Link
                      to={row.href}
                      className="min-w-[44px] min-h-[44px] hidden sm:inline-flex items-center justify-center text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 motion-reduce:transform-none transition-all duration-150 rounded-control focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                    </Link>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
};
