import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Compass, BookOpen, Clock, Sparkles, Layers, Bookmark, 
  Search, X, MoreHorizontal 
} from 'lucide-react';
import { Logo } from './Logo';
import { Language, NavTab } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  favoriteCount: number;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
  onOpenBahaiSongs: () => void;
  onOpenCommandPalette?: () => void;
  onOpenMore?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  language,
  favoriteCount,
  showOnlyFavorites,
  setShowOnlyFavorites,
  onOpenCommandPalette,
  onOpenMore,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(true);
  const [isMac, setIsMac] = useState(true);
  const t = UI_TRANSLATIONS[language];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFinePointer(window.matchMedia('(pointer: fine)').matches);
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  // Auto-collapse header on scroll down in mobile / landscape
  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScroll = () => {
      const scrollY = window.pageYOffset;
      if (scrollY > lastScrollY && scrollY > 70) {
        setIsScrolledDown(true);
      } else if (scrollY < lastScrollY) {
        setIsScrolledDown(false);
      }
      lastScrollY = Math.max(scrollY, 0);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: NavTab; label: string; href: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.tabHome || 'Start', href: '/', icon: Home },
    { id: 'games', label: t.tabGames, href: '/games', icon: Compass },
    { id: 'quotes', label: t.tabQuotes, href: '/quotes', icon: BookOpen },
    { id: 'planner', label: t.tabPlanner, href: '/planner', icon: Clock },
    { id: 'service-arts', label: t.tabServiceArts, href: '/service-arts', icon: Sparkles },
    { id: 'tools', label: t.tabTools, href: '/tools', icon: Layers },
  ];

  return (
    <header 
      className={`sticky top-0 z-40 bg-surface border-b border-border shadow-xs transition-transform duration-200 print:hidden safe-top ${
        isScrolledDown ? 'short:-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 short:h-11 gap-2 sm:gap-4">
          
          {/* Brand - Solid, accessible logo & title */}
          <Link 
            to="/"
            onClick={() => {
              setActiveTab('home');
              setShowOnlyFavorites(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 select-none group min-h-[44px] outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
            aria-label="Junior Youth Hub Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 short:w-7 short:h-7 rounded-xl bg-surface-2 border border-border flex items-center justify-center p-1 transition-transform group-hover:scale-105">
              <Logo className="w-6 h-6 sm:w-7 sm:h-7 short:w-5 short:h-5" />
            </div>
            <span className="font-bold text-sm sm:text-base short:text-xs tracking-tight text-text whitespace-nowrap">
              {t.siteTitle}
            </span>
          </Link>

          {/* Desktop Navigation: 6 items on one line (lg and up) */}
          <nav 
            className="hidden lg:flex short:hidden items-center p-1 bg-surface-2 rounded-full border border-border"
            aria-label="Hauptnavigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !showOnlyFavorites;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowOnlyFavorites(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap min-h-[32px] ${
                    isActive
                      ? 'bg-surface text-text shadow-xs font-semibold'
                      : 'text-text-secondary hover:text-text'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop Search / Command Palette (lg and up) */}
            <div className="hidden lg:flex items-center w-40 xl:w-48">
              <button
                type="button"
                onClick={() => onOpenCommandPalette?.()}
                className="w-full flex items-center justify-between px-3 py-1.5 min-h-[36px] text-xs rounded-full bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text transition-colors group cursor-pointer"
                aria-label={t.cmdKSearch || 'Suche'}
              >
                <span className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5 shrink-0 text-text-tertiary group-hover:text-accent transition-colors" />
                  <span className="truncate">{language === 'de' ? 'Suchen...' : 'Search...'}</span>
                </span>
                {isFinePointer && (
                  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono bg-surface text-text-tertiary border border-border shrink-0 ml-1">
                    {isMac ? '⌘K' : 'Strg K'}
                  </kbd>
                )}
              </button>
            </div>

            {/* Mobile / Tablet Search Trigger (< lg) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCommandPalette) {
                  onOpenCommandPalette();
                } else {
                  setIsMobileSearchOpen(!isMobileSearchOpen);
                }
              }}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full text-text-secondary hover:text-text hover:bg-surface-2 active:bg-surface-2 transition-colors cursor-pointer"
              aria-label={language === 'de' ? 'Suchen' : 'Search'}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Favorites (Gemerkt) Button */}
            <button
              type="button"
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center justify-center gap-1.5 px-3 h-11 rounded-full text-xs font-medium transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-accent text-accent-contrast shadow-xs font-semibold'
                  : 'bg-surface-2 hover:bg-surface-raised text-text-secondary hover:text-text border border-border'
              }`}
              title={t.savedItems}
              aria-label={`${t.savedItems}${favoriteCount > 0 ? ` (${favoriteCount})` : ''}`}
            >
              <Bookmark className={`w-4 h-4 shrink-0 ${favoriteCount > 0 ? 'fill-current text-accent-text dark:text-accent' : ''}`} />
              {favoriteCount > 0 && (
                <span className="font-semibold text-xs leading-none">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* "Mehr" Menu Button on Desktop (lg and up) */}
            <button
              type="button"
              onClick={onOpenMore}
              className="hidden lg:flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium bg-surface-2 hover:bg-surface-raised text-text-secondary hover:text-text border border-border transition-colors cursor-pointer"
              aria-label={t.tabMore || 'Mehr'}
            >
              <MoreHorizontal className="w-4 h-4 shrink-0" />
              <span>{t.tabMore || 'Mehr'}</span>
            </button>
          </div>

        </div>

        {/* Fallback Mobile Search Overlay if Palette is not active */}
        {isMobileSearchOpen && (
          <div className="pb-3 pt-1 lg:hidden animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoFocus
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-full bg-surface border border-border focus:outline-hidden focus:ring-2 focus:ring-accent transition-all text-text placeholder:text-text-tertiary shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label={t.clearSearch || 'Löschen'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
