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
  onOpenSettings: () => void;
}

export const NAV_ITEMS: { id: NavTab; href: string; key: 'tabGames' | 'tabQuotes' | 'tabServiceShort' | 'tabArtsShort' | 'tabTools' | 'tabProposalShort' }[] = [
  { id: 'games', href: '/games', key: 'tabGames' },
  { id: 'quotes', href: '/quotes', key: 'tabQuotes' },
  { id: 'service', href: '/service', key: 'tabServiceShort' },
  { id: 'arts', href: '/arts', key: 'tabArtsShort' },
  { id: 'tools', href: '/tools', key: 'tabTools' },
  { id: 'vorschlagen', href: '/vorschlagen', key: 'tabProposalShort' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  language,
  favoriteCount,
  onOpenCommandPalette,
  onOpenSettings,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [isMac, setIsMac] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  // Phone landscape: hide header while scrolling down
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

  return (
    <header
      className={`sticky top-0 z-40 glass-surface border-b border-line print:hidden safe-top transition-transform duration-200 ${
        isHidden ? 'short:-translate-y-full' : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center h-16 short:h-12 justify-between gap-3">
        {/* Left: Logo & Site Title */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 min-h-[44px] rounded-control focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`${t.siteTitle} – ${t.tabHome}`}
        >
          <Logo className="w-8 h-8 short:w-6 short:h-6 shrink-0" />
          <span className="hidden min-[360px]:inline-block font-bold text-base tracking-tight text-text whitespace-nowrap">
            {t.siteTitle}
          </span>
        </Link>

        {/* Center: Tablet & Desktop Navigation (visible from 768px+) */}
        <nav className="hidden md:flex short:hidden items-center gap-1" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-control text-sm whitespace-nowrap transition-colors duration-120 ease-out focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'text-accent font-bold bg-accent-subtle/80'
                    : 'text-text-secondary hover:text-text hover:bg-surface-2'
                }`}
              >
                {t[item.key]}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Saved, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop & Tablet Search trigger button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="group hidden md:flex items-center gap-2.5 h-11 w-48 lg:w-56 px-3.5 rounded-control bg-surface-2/70 hover:bg-surface-2 border border-line/80 hover:border-text-tertiary/60 text-sm text-text-secondary hover:text-text transition-all duration-150 ease-out shadow-2xs hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            aria-label={t.cmdKSearch}
          >
            <Search className="w-4 h-4 text-text-tertiary group-hover:text-accent shrink-0 transition-colors duration-150" strokeWidth={1.75} />
            <span className="flex-1 text-left truncate">{language === 'de' ? 'Suchen...' : 'Search...'}</span>
            <kbd className="text-2xs px-1.5 py-0.5 rounded-md bg-surface border border-line/60 shadow-2xs font-mono font-semibold text-text-tertiary group-hover:text-text-secondary tabular-nums transition-colors">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>

          {/* Mobile Search button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-control flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2/80 active:scale-95 transition-all duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            aria-label={language === 'de' ? 'Suche öffnen' : 'Open search'}
          >
            <Search className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {/* Saved Items (Lesezeichen) */}
          <Link
            to="/saved"
            className={`relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-control flex items-center justify-center transition-all duration-150 ease-out active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === 'saved'
                ? 'bg-accent-subtle text-accent-text font-semibold'
                : 'text-text-secondary hover:text-text hover:bg-surface-2'
            }`}
            aria-label={`${t.savedItems}${favoriteCount > 0 ? ` (${favoriteCount})` : ''}`}
          >
            <Bookmark
              className={`w-5 h-5 transition-colors duration-150 ${
                activeTab === 'saved' ? 'fill-accent text-accent' : favoriteCount > 0 ? 'text-accent' : ''
              }`}
              strokeWidth={1.75}
            />
            {favoriteCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-contrast text-[11px] font-bold tabular-nums flex items-center justify-center leading-none ring-2 ring-surface shadow-xs pointer-events-none animate-in zoom-in duration-150">
                {favoriteCount}
              </span>
            )}
          </Link>

          {/* Settings button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-control flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 active:scale-95 transition-all duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t.tabSettings}
          >
            <Settings className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
};
