import React from 'react';
import { Compass, BookOpen, Clock, Layers, Bookmark, Printer, Search, X, Music } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  activeTab: 'games' | 'quotes' | 'planner' | 'toolkits';
  setActiveTab: (tab: 'games' | 'quotes' | 'planner' | 'toolkits') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  favoriteCount: number;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
  onOpenBahaiSongs: () => void;
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
}) => {
  const t = UI_TRANSLATIONS[language];

  const navItems = [
    { id: 'games' as const, label: t.tabGames, icon: Compass },
    { id: 'quotes' as const, label: t.tabQuotes, icon: BookOpen },
    { id: 'planner' as const, label: t.tabPlanner, icon: Clock },
    { id: 'toolkits' as const, label: t.tabToolkits, icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/[0.06] transition-all print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Brand */}
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0 select-none group" 
            onClick={() => {
              setActiveTab('games');
              setShowOnlyFavorites(false);
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-apple-pill transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-[15px] tracking-tight text-[#1d1d1f] block leading-tight">
                {t.siteTitle}
              </span>
            </div>
          </div>

          {/* Segmented Navigation Control (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03]">
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
                  className={`flex items-center gap-1.5 px-3.5 py-1 text-xs rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-[200px] lg:max-w-xs hidden lg:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-full bg-black/[0.04] hover:bg-black/[0.06] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 border border-transparent focus:border-[#0071e3] transition-all text-[#1d1d1f] placeholder:text-[#86868b]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                  aria-label={t.clearSearch}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Utilities: Bahá'í Songs, Saved, Language, Print */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bahá'í Songs Pill */}
            <button
              onClick={onOpenBahaiSongs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] transition-colors"
              title="Bahá'í Songs (bahaisongs.com)"
            >
              <Music className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Songs</span>
            </button>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                showOnlyFavorites
                  ? 'bg-amber-500 text-white shadow-apple-pill font-semibold'
                  : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
              title={t.savedItems}
              aria-label={t.savedItems}
            >
              <Bookmark className={`w-3.5 h-3.5 ${favoriteCount > 0 ? 'fill-current' : ''}`} />
              {favoriteCount > 0 && (
                <span className="text-[11px] font-semibold">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-1.5 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.05] rounded-full transition-colors hidden sm:flex items-center justify-center"
              title={t.printHandout}
              aria-label={t.printHandout}
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Apple Segmented Language Switcher */}
            <div className="flex items-center p-0.5 bg-black/[0.05] rounded-full border border-black/[0.03]">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  language === 'de'
                    ? 'bg-white text-[#1d1d1f] shadow-apple-pill'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-white text-[#1d1d1f] shadow-apple-pill'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Segmented Control */}
        <div className="flex md:hidden items-center justify-between pb-2.5 pt-1">
          <nav className="flex items-center p-1 bg-black/[0.05] rounded-full w-full justify-between">
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
                  className={`flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'text-[#6e6e73]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
};
