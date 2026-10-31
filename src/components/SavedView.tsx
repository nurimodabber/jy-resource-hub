import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  ArrowRight,
  Compass,
  BookOpen,
  Zap,
  HeartHandshake,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { GAMES_DATA } from '../data/games';
import { useAdminData } from '../context/AdminDataContext';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { EmptyState, Chip } from './ui';

interface SavedViewProps {
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

type Group = 'games' | 'quotes' | 'methods' | 'projects';

interface Row {
  id: string;
  title: string;
  subtitle?: string;
  meta: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isQuote?: boolean;
}

export const SavedView: React.FC<SavedViewProps> = ({ language, favorites, onToggleFavorite }) => {
  const t = UI_TRANSLATIONS[language];
  const isDe = language === 'de';
  const navigate = useNavigate();
  const adminData = useAdminData();
  const allGames = adminData.games.length > 0 ? adminData.games : GAMES_DATA;
  const allServiceProjects = adminData.serviceProjects.length > 0 ? adminData.serviceProjects : SERVICE_PROJECTS_DATA;
  const allArtsPrompts = adminData.artsPrompts.length > 0 ? adminData.artsPrompts : ARTS_PROMPTS_DATA;

  const groups = useMemo(() => {
    const has = (id: string) => favorites.includes(id);

    const games: Row[] = allGames.filter((g) => has(g.id)).map((g) => ({
      id: g.id,
      title: g.title[language],
      subtitle: (g.summary && g.summary[language]) || (g.subtitle && g.subtitle[language]),
      meta: `${g.groupSize.min}–${g.groupSize.max} ${isDe ? 'Personen' : 'people'} · ${g.durationMinutes}`,
      href: `/games/${g.id}`,
      icon: Compass,
      badge: isDe ? 'Spiel' : 'Game',
    }));

    const quotes: Row[] = QUOTES_DATA.filter((q) => has(q.id)).map((q) => {
      const text = isDe ? q.textDe : q.textEn;
      return {
        id: q.id,
        title: isDe ? `»${text}«` : `“${text}”`,
        subtitle: q.theme[language],
        meta: `— ${q.source[language]}${q.book[language] ? ` · ${q.book[language]}` : ''}`,
        href: `/quotes/${q.id}`,
        icon: BookOpen,
        badge: isDe ? 'Zitat' : 'Quote',
        isQuote: true,
      };
    });

    const methods: Row[] = QUOTE_METHODS_DATA.filter((m) => has(m.id)).map((m) => ({
      id: m.id,
      title: m.name[language],
      subtitle: m.summary[language],
      meta: m.durationMinutes,
      href: '/quotes?tab=practice',
      icon: Zap,
      badge: isDe ? 'Methode' : 'Method',
    }));

    const projects: Row[] = [
      ...allServiceProjects.filter((p) => has(p.id)).map((p) => ({
        id: p.id,
        title: p.title[language],
        subtitle: p.objective[language],
        meta: `${p.duration[language]} · ${p.groupSize.min}–${p.groupSize.max} ${isDe ? 'Personen' : 'people'}`,
        href: `/service/${p.id}`,
        icon: HeartHandshake,
        badge: isDe ? 'Dienst' : 'Service',
      })),
      ...allArtsPrompts.filter((a) => has(a.id)).map((a) => ({
        id: a.id,
        title: a.title[language],
        subtitle: a.description[language],
        meta: `${a.book[language]} · ${a.duration[language]}`,
        href: `/arts/${a.id}`,
        icon: Palette,
        badge: isDe ? 'Kunst' : 'Arts',
      })),
    ];

    return { games, quotes, methods, projects } as Record<Group, Row[]>;
  }, [allGames, allServiceProjects, allArtsPrompts, favorites, language, isDe]);

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

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 sm:space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header following standard pattern */}
      <div>
        <div className="flex items-baseline gap-3.5 flex-wrap">
          <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
            {t.savedItems}
          </h1>
          {favorites.length > 0 && (
            <span className="text-sm font-bold text-accent tabular-nums">
              {favorites.length} {isDe ? (favorites.length === 1 ? 'Eintrag' : 'Einträge') : (favorites.length === 1 ? 'item' : 'items')}
            </span>
          )}
        </div>
        <p className="hidden sm:block text-base sm:text-lg text-text-secondary mt-2 max-w-2xl font-normal leading-relaxed">
          {isDe
            ? 'Alle von dir gespeicherten Spiele, Zitate und Ideen auf einen Blick.'
            : 'All your bookmarked games, quotes, and project ideas in one place.'}
        </p>
      </div>

      {nonEmpty.length === 0 ? (
        <div className="py-6 max-w-4xl mx-auto">
          <EmptyState
            icon={<Bookmark className="w-6 h-6 text-accent" strokeWidth={1.75} />}
            title={t.savedEmptyTitle}
            description={t.savedEmptyHint}
            actionLabel={t.savedEmptyAction}
            onAction={() => navigate('/games')}
          />
        </div>
      ) : (
        <>

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
          <section key={g} aria-label={labels[g]} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-text uppercase tracking-wider">{labels[g]}</h2>
              <span className="text-xs text-text-tertiary tabular-nums font-semibold">{groups[g].length}</span>
            </div>

            <div className="bg-surface rounded-card border border-border/80 shadow-2xs divide-y divide-border/60 overflow-hidden">
              {groups[g].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-surface-2/60 transition-colors duration-150 ease-out group gap-3"
                  >
                    <Link to={row.href} className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-control bg-surface-2 text-text-tertiary group-hover:bg-accent-subtle group-hover:text-accent-text flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-all">
                        <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        {row.isQuote ? (
                          <>
                            <p className="font-serif text-base sm:text-lg text-text leading-relaxed line-clamp-2 select-text group-hover:text-accent transition-colors font-normal">
                              {row.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-text-tertiary flex-wrap">
                              <span className="font-medium text-text-secondary">{row.meta}</span>
                              {row.subtitle && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-accent-text border border-border/60">
                                  {row.subtitle}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors truncate tracking-tight">
                                {row.title}
                              </h3>
                              {row.badge && (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-tertiary border border-border/60 shrink-0">
                                  {row.badge}
                                </span>
                              )}
                            </div>
                            {row.subtitle && (
                              <p className="text-xs text-text-secondary line-clamp-1 mt-1 leading-relaxed">
                                {row.subtitle}
                              </p>
                            )}
                            <div className="text-xs text-text-tertiary truncate mt-1 font-medium">
                              {row.meta}
                            </div>
                          </>
                        )}
                      </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => onToggleFavorite(row.id, e)}
                        aria-pressed="true"
                        className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-control text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs active:scale-90 motion-reduce:transform-none transition-all duration-150 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label={`${t.savedItems} entfernen: ${row.title}`}
                        title={isDe ? 'Aus Lesezeichen entfernen' : 'Remove from bookmarks'}
                      >
                        <Bookmark className="w-4 h-4 fill-accent text-accent" strokeWidth={1.75} />
                      </button>

                      <Link
                        to={row.href}
                        className="w-10 h-10 hidden sm:inline-flex items-center justify-center text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 motion-reduce:transform-none transition-all duration-150 rounded-control focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
        </>
      )}
    </div>
  );
};
