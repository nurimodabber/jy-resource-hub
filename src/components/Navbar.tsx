import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bookmark, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { Language, NavTab } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  activeTab: NavTab;
  language: Language;
  favoriteCount: number;
  onOpenCommandPalette: () => void;
  onOpenMore: () => void;
}

export const NAV_ITEMS: { id: NavTab; href: string; key: 'tabGames' | 'tabQuotes' | 'tabPlanner' | 'tabServiceArts' | 'tabTools' }[] = [
  { id: 'games', href: '/games', key: 'tabGames' },
  { id: 'quotes', href: '/quotes', key: 'tabQuotes' },
  { id: 'planner', href: '/planner', key: 'tabPlanner' },
  { id: 'service-arts', href: '/service-arts', key: 'tabServiceArts' },
  { id: 'tools', href: '/tools', key: 'tabTools' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  language,
  favoriteCount,
  onOpenCommandPalette,
  onOpenMore,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [isMac, setIsMac] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  // Phone landscape: hide the header while scrolling down
  useEffect(() => {
    let last = window.pageYOffset;
    const onScroll = () => {
      const y = window.pageYOffset;
      if (y > last && y > 70) setIsHidden(true);
      else if (y < last) setIsHidden(false);
      last = Math.max(y, 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const iconBtn =
    'inline-flex items-center justify-center gap-2 h-10 min-w-[40px] px-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors';

  return (
    <header
      className={`sticky top-0 z-40 bg-surface border-b border-border print:hidden safe-top transition-transform duration-200 ${
        isHidden ? 'short:-translate-y-full' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 flex items-center h-14 short:h-11 gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 min-h-[44px] rounded-xl"
          aria-label={`${t.siteTitle} – ${t.tabHome}`}
        >
          <Logo className="w-7 h-7 short:w-5 short:h-5" />
          <span className="font-semibold text-base tracking-tight text-text whitespace-nowrap">{t.siteTitle}</span>
        </Link>

        <nav className="hidden lg:flex short:hidden items-center gap-1 ml-4" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-3 h-14 inline-flex items-center text-sm whitespace-nowrap transition-colors ${
                  isActive ? 'text-text font-semibold' : 'text-text-secondary hover:text-text'
                }`}
              >
                {t[item.key]}
                {isActive && <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-accent" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 h-10 w-52 px-3 rounded-xl border border-border bg-surface-2 text-sm text-text-secondary hover:text-text transition-colors"
            aria-label={t.cmdKSearch}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left truncate">{language === 'de' ? 'Suchen' : 'Search'}</span>
            <kbd className="text-2xs px-1.5 py-0.5 rounded-lg border border-border bg-surface text-text-tertiary">
              {isMac ? '⌘K' : 'Strg K'}
            </kbd>
          </button>

          <button type="button" onClick={onOpenCommandPalette} className={`lg:hidden ${iconBtn}`} aria-label={language === 'de' ? 'Suchen' : 'Search'}>
            <Search className="w-5 h-5" />
          </button>

          <Link to="/saved" className={iconBtn} aria-label={`${t.savedItems}${favoriteCount ? ` (${favoriteCount})` : ''}`}>
            <Bookmark className={`w-5 h-5 ${activeTab === 'saved' ? 'text-accent fill-current' : ''}`} />
            <span className="hidden sm:inline">{t.savedItems}</span>
            {favoriteCount > 0 && <span className="text-xs tabular-nums text-text-tertiary">{favoriteCount}</span>}
          </Link>

          <button type="button" onClick={onOpenMore} className={`hidden lg:inline-flex ${iconBtn}`} aria-label={t.tabSettings}>
            <Settings className="w-5 h-5" />
            <span className="hidden xl:inline">{t.tabSettings}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
