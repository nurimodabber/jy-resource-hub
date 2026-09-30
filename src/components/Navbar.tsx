import React, { useState, useEffect } from 'react';
import { 
  Home, Compass, BookOpen, Clock, Sparkles, Layers, Bookmark, 
  Printer, Search, X, Music 
} from 'lucide-react';
import { Logo } from './Logo';
import { Language, NavTab } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { ThemeToggle } from './ui/ThemeToggle';
import { IconButton } from './ui/IconButton';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  language,
  setLanguage,
  favoriteCount,
  showOnlyFavorites,
  setShowOnlyFavorites,
  onOpenBahaiSongs,
  onOpenCommandPalette,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const t = UI_TRANSLATIONS[language];

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

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.tabHome || 'Start', icon: Home },
    { id: 'games', label: t.tabGames, icon: Compass },
    { id: 'quotes', label: t.tabQuotes, icon: BookOpen },
    { id: 'planner', label: t.tabPlanner, icon: Clock },
    { id: 'service-arts', label: t.tabServiceArts, icon: Sparkles },
    { id: 'tools', label: t.tabTools, icon: Layers },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 bg-bg/85 dark:bg-bg/90 backdrop-blur-xl border-b border-border-subtle transition-transform duration-200 print:hidden safe-top ${
        isScrolledDown ? 'short:-translate-y-full md:translate-y-0' : 'translate-y-0'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 short:h-11 gap-3">
          
          {/* Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group" 
            onClick={() => {
              setActiveTab('home');
              setShowOnlyFavorites(false);
            }}
          >
            <div className="w-9 h-9 short:w-7 short:h-7 rounded-xl bg-surface border border-border-subtle shadow-xs flex items-center justify-center p-1 transition-transform group-hover:scale-105">
              <Logo className="w-7 h-7 short:w-5 short:h-5" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base short:text-xs tracking-tight text-text block leading-tight">
                {t.siteTitle}
              </span>
            </div>
          </div>

          {/* Segmented Navigation Control (Desktop & Tablet Landscape) */}
          <nav className="hidden lg:flex short:hidden items-center p-1 bg-surface-2 rounded-full border border-border-subtle">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !showOnlyFavorites;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowOnlyFavorites(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-surface text-text shadow-apple-pill font-semibold'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Command Palette Trigger / Search (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-[220px]">
            <button
              onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : null}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-full bg-surface-2 hover:bg-surface-raised border border-border-subtle text-text-tertiary hover:text-text transition-all group"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 group-hover:text-accent transition-colors" />
                <span className="truncate">{language === 'de' ? 'Suche...' : 'Search...'}</span>
              </span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono bg-surface text-text-tertiary border border-border-subtle shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Utilities: Theme, Songs, Favorites, Print, Language */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger (Mobile / Tablet) */}
            <IconButton
              label="Suchen / Search"
              onClick={() => {
                if (onOpenCommandPalette) {
                  onOpenCommandPalette();
                } else {
                  setIsMobileSearchOpen(!isMobileSearchOpen);
                }
              }}
              size="sm"
              className="md:hidden"
            >
              <Search className="w-4 h-4" />
            </IconButton>

            {/* Dark Mode Theme Toggle */}
            <ThemeToggle />

            {/* Bahá'í Songs Pill */}
            <button
              onClick={onOpenBahaiSongs}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-full bg-surface-2 hover:bg-black/5 dark:hover:bg-white/5 text-text border border-border-subtle transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
              title="Bahá'í Songs (bahaisongs.com)"
            >
              <Music className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Songs</span>
            </button>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                showOnlyFavorites
                  ? 'bg-accent text-accent-contrast shadow-apple-pill font-semibold'
                  : 'bg-surface-2 hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary hover:text-text border border-border-subtle'
              }`}
              title={t.savedItems}
              aria-label={t.savedItems}
            >
              <Bookmark className={`w-3.5 h-3.5 ${favoriteCount > 0 ? 'fill-current' : ''}`} />
              {favoriteCount > 0 && (
                <span className="text-xs font-semibold">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Print Button (Desktop) */}
            <IconButton
              label={t.printHandout}
              onClick={() => window.print()}
              size="sm"
              className="hidden sm:flex"
            >
              <Printer className="w-4 h-4" />
            </IconButton>

            {/* Segmented Language Switcher */}
            <div className="flex items-center p-0.5 bg-surface-2 rounded-full border border-border-subtle">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                  language === 'de'
                    ? 'bg-surface text-text shadow-apple-pill'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-surface text-text shadow-apple-pill'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Search Input Overlay (if opened without CommandPalette) */}
        {isMobileSearchOpen && (
          <div className="pb-3 pt-1 md:hidden animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoFocus
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-full bg-surface border border-border focus:outline-hidden focus:ring-2 focus:ring-accent/30 transition-all text-text placeholder:text-text-tertiary shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1"
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
