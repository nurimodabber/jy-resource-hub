import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bookmark, Settings } from 'lucide-react';
import { Glass } from 'glisse';
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
  const [isHidden, setIsHidden] = useState(false);

  // Desktop navigation liquid glass sliding indicator (pixel-perfect centering)
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const desktopItemRefs = useRef<Map<NavTab, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const updateIndicator = useCallback(() => {
    const el = desktopItemRefs.current.get(activeTab);
    const nav = desktopNavRef.current;
    if (el && nav) {
      const elRect = el.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setIndicator({
        left: Math.round(elRect.left - navRect.left),
        width: Math.round(elRect.width),
      });
    } else {
      setIndicator(null);
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

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
    <Glass
      role="banner"
      className={`sticky top-0 z-40 border-b border-line/75 bg-surface/75 backdrop-blur-xl shadow-2xs print:hidden safe-top transition-transform duration-200 ${
        isHidden ? 'short:-translate-y-full' : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-3.5 sm:px-6 flex items-center h-16 short:h-12 justify-between gap-2.5">
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

        {/* Center: Tablet & Desktop Navigation (Glisse Liquid Glass Segmented Pill) */}
        <nav
          ref={desktopNavRef}
          className="relative hidden md:flex short:hidden items-center p-1 rounded-full bg-surface-2/70 border border-line/70 lg-glass gap-0.5 shadow-2xs"
          aria-label="Hauptnavigation"
        >
          {/* Active Liquid Glass sliding indicator pill (with left-0 for exact centering) */}
          {indicator && (
            <div
              className="absolute left-0 top-1 bottom-1 rounded-full lg-glass bg-surface/95 dark:bg-surface-2 shadow-xs border border-line/80 transition-all duration-240 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none"
              style={{
                transform: `translate3d(${indicator.left}px, 0, 0)`,
                width: `${indicator.width}px`,
              }}
            >
              <span
                className="absolute inset-x-2.5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/30 to-transparent pointer-events-none rounded-t-full"
                aria-hidden="true"
              />
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                ref={(el) => {
                  if (el) desktopItemRefs.current.set(item.id, el);
                  else desktopItemRefs.current.delete(item.id);
                }}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative z-10 px-2.5 lg:px-3.5 py-1.5 min-h-[36px] inline-flex items-center rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'text-accent font-bold'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {t[item.key]}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Saved, Settings (Uncluttered, borderless touch targets >= 44px) */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Desktop Search trigger button (Clean pill) */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="group hidden lg:flex items-center gap-2.5 h-10 w-44 lg:w-48 px-3.5 rounded-full bg-surface-2/70 border border-line/70 hover:border-accent/40 text-xs text-text-secondary hover:text-text cursor-pointer transition-all duration-150 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t.cmdKSearch}
          >
            <Search className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent shrink-0 transition-colors" strokeWidth={1.75} />
            <span className="flex-1 text-left truncate">{language === 'de' ? 'Suchen...' : 'Search...'}</span>
          </button>

          {/* Tablet & Mobile Search Icon button (Borderless interactive icon >= 44px) */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2/80 active:scale-95 transition-all duration-150 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            aria-label={language === 'de' ? 'Suche öffnen' : 'Open search'}
          >
            <Search className="w-4 h-4" strokeWidth={1.75} />
          </button>

          {/* Saved Items (Lesezeichen - Borderless >= 44px with subtle active state) */}
          <Link
            to="/saved"
            className={`relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
              activeTab === 'saved'
                ? 'bg-accent-subtle text-accent font-semibold'
                : 'text-text-secondary hover:text-text hover:bg-surface-2/80'
            }`}
            aria-label={`${t.savedItems}${favoriteCount > 0 ? ` (${favoriteCount})` : ''}`}
          >
            <Bookmark
              className={`w-4 h-4 transition-colors duration-150 ${
                activeTab === 'saved' ? 'fill-accent text-accent' : favoriteCount > 0 ? 'text-accent' : ''
              }`}
              strokeWidth={1.75}
            />
            {favoriteCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-accent text-accent-contrast text-[10px] font-bold tabular-nums flex items-center justify-center leading-none ring-2 ring-surface shadow-xs pointer-events-none">
                {favoriteCount}
              </span>
            )}
          </Link>

          {/* Settings button (Borderless interactive icon >= 44px) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2/80 active:scale-95 transition-all duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            aria-label={t.tabSettings}
          >
            <Settings className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </Glass>
  );
};
