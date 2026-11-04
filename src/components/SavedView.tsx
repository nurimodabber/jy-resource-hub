import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  ArrowRight,
  Compass,
  BookOpen,
  Brain,
  HeartHandshake,
  Palette,
  Clock,
  Users,
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
  duration?: string;
  groupSize?: string;
  attribution?: string;
  href: string;
  icon: LucideIcon;
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

    // 1. Games (clean duration & group size without wordy repetition)
    const games: Row[] = allGames
      .filter((g) => has(g.id))
      .map((g) => ({
        id: g.id,
        title: g.title[language],
        subtitle: (g.summary && g.summary[language]) || (g.subtitle && g.subtitle[language]),
        duration: g.durationMinutes,
        groupSize: `${g.groupSize.min}–${g.groupSize.max} ${isDe ? 'Pers.' : 'pers.'}`,
        href: `/games/${g.id}`,
        icon: Compass,
      }));

    // 2. Sacred Quotes (serene typography, reverence, NO redundant theme tag like "Gesegnet ist die Stätte")
    const quotes: Row[] = QUOTES_DATA
      .filter((q) => has(q.id))
      .map((q) => {
        const text = isDe ? q.textDe : q.textEn;
        return {
          id: q.id,
          title: isDe ? `»${text}«` : `“${text}”`,
          attribution: `— ${q.source[language]}${q.book[language] ? ` · ${q.book[language]}` : ''}`,
          href: `/quotes/${q.id}`,
          icon: BookOpen,
          isQuote: true,
        };
      });

    // 3. Methods (straightforward duration)
    const methods: Row[] = QUOTE_METHODS_DATA
      .filter((m) => has(m.id))
      .map((m) => ({
        id: m.id,
        title: m.name[language],
        subtitle: m.summary[language],
        duration: m.durationMinutes,
        href: '/quotes?tab=practice',
        icon: Brain,
      }));

    // 4. Projects & Arts Prompts (concise duration & optional info)
    const projects: Row[] = [
      ...allServiceProjects.filter((p) => has(p.id)).map((p) => ({
        id: p.id,
        title: p.title[language],
        subtitle: p.objective[language],
        duration: p.duration[language],
        groupSize: `${p.groupSize.min}–${p.groupSize.max} ${isDe ? 'Pers.' : 'pers.'}`,
        href: `/service/${p.id}`,
        icon: HeartHandshake,
      })),
      ...allArtsPrompts.filter((a) => has(a.id)).map((a) => ({
        id: a.id,
        title: a.title[language],
        subtitle: a.description[language],
        duration: a.duration[language],
        groupSize: a.book[language],
        href: `/arts/${a.id}`,
        icon: Palette,
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

  const groupIcons: Record<Group, LucideIcon> = {
    games: Compass,
    quotes: BookOpen,
    methods: Brain,
    projects: HeartHandshake,
  };

  const order: Group[] = ['games', 'quotes', 'methods', 'projects'];
  const nonEmpty = order.filter((g) => groups[g].length > 0);
  const [active, setActive] = useState<Group | 'all'>('all');
  const shown = active === 'all' ? nonEmpty : nonEmpty.filter((g) => g === active);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 sm:space-y-8 pb-20 animate-in fade-in duration-200">
      {/* Header */}
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
        <div className="py-8 max-w-2xl mx-auto">
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
          <div className="flex flex-wrap gap-2" role="group" aria-label={language === 'de' ? 'Gemerkt filtern' : 'Filter saved items'}>
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

          {/* Grouped Lists */}
          <div className="space-y-8">
            {shown.map((g) => {
              const SectionIcon = groupIcons[g];
              return (
                <section key={g} aria-label={labels[g]} className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <SectionIcon className="w-4 h-4 text-accent" strokeWidth={1.75} />
                      <h2 className="text-xs font-bold text-text uppercase tracking-wider">{labels[g]}</h2>
                    </div>
                    <span className="text-xs text-text-tertiary tabular-nums font-semibold">
                      {groups[g].length}
                    </span>
                  </div>

                  <div className="bg-surface/90 lg-glass rounded-card border border-line/75 shadow-2xs divide-y divide-line/60 overflow-hidden">
                    {groups[g].map((row) => {
                      const RowIcon = row.icon;
                      return (
                        <div
                          key={row.id}
                          className="flex items-start sm:items-center justify-between p-3.5 sm:p-4 hover:bg-surface-2/60 transition-colors duration-150 ease-out group gap-3.5"
                        >
                          <Link to={row.href} className="flex items-start gap-3.5 flex-1 min-w-0">
                            {/* Icon badge */}
                            <div className="w-9 h-9 rounded-full bg-surface-2/80 text-text-tertiary group-hover:bg-accent-subtle group-hover:text-accent flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-all">
                              <RowIcon className="w-4 h-4" strokeWidth={1.75} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                              {row.isQuote ? (
                                <div>
                                  {/* Sacred Quote Text: Reverent Lora Serif, serene, no tacky tags or badges */}
                                  <blockquote className="font-serif italic text-base sm:text-lg text-text leading-relaxed select-text group-hover:text-accent transition-colors font-normal">
                                    {row.title}
                                  </blockquote>
                                  {row.attribution && (
                                    <p className="mt-2 text-xs text-text-secondary tracking-wide font-normal">
                                      {row.attribution}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {/* Games, Methods, Projects: Clean title & subtle description */}
                                  <h3 className="font-semibold text-base text-text group-hover:text-accent transition-colors truncate tracking-tight">
                                    {row.title}
                                  </h3>
                                  {row.subtitle && (
                                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-1 mt-0.5 leading-relaxed">
                                      {row.subtitle}
                                    </p>
                                  )}

                                  {/* Minimalist, calm metadata (only duration and group size, no loud badges) */}
                                  {(row.duration || row.groupSize) && (
                                    <div className="flex items-center gap-2.5 mt-1.5 text-xs text-text-tertiary font-medium">
                                      {row.duration && (
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-text-tertiary/75 shrink-0" strokeWidth={1.5} />
                                          <span>{row.duration}</span>
                                        </span>
                                      )}
                                      {row.duration && row.groupSize && (
                                        <span className="text-line" aria-hidden="true">·</span>
                                      )}
                                      {row.groupSize && (
                                        <span className="inline-flex items-center gap-1">
                                          <Users className="w-3 h-3 text-text-tertiary/75 shrink-0" strokeWidth={1.5} />
                                          <span>{row.groupSize}</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Actions: Bookmark Toggle & Arrow */}
                          <div className="flex items-center gap-1 shrink-0 pt-0.5 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => onToggleFavorite(row.id, e)}
                              aria-pressed="true"
                              className="w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-full text-accent hover:bg-accent-subtle active:scale-90 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                              aria-label={`${t.savedItems} entfernen: ${row.title}`}
                              title={isDe ? 'Aus Lesezeichen entfernen' : 'Remove from bookmarks'}
                            >
                              <Bookmark className="w-4 h-4 fill-accent text-accent" strokeWidth={1.75} />
                            </button>

                            <Link
                              to={row.href}
                              className="w-10 h-10 hidden sm:inline-flex items-center justify-center text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-150 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
