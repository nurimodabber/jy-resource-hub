import React from 'react';
import { Compass, BookOpen, Clock, Layers, Bookmark, Printer, Search, Globe, X, Music } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0" 
            onClick={() => {
              setActiveTab('games');
              setShowOnlyFavorites(false);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 block leading-tight">
                {t.siteTitle}
              </span>
              <span className="text-[11px] text-stone-500 hidden md:block">
                {t.siteSubtitle}
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-sm hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label={t.clearSearch}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => {
                setActiveTab('games');
                setShowOnlyFavorites(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'games' && !showOnlyFavorites
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.tabGames}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('quotes');
                setShowOnlyFavorites(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'quotes' && !showOnlyFavorites
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabQuotes}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('planner');
                setShowOnlyFavorites(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.tabPlanner}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('toolkits');
                setShowOnlyFavorites(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'toolkits'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.tabToolkits}</span>
            </button>
          </nav>

          {/* Controls: Favorites, Print, Language */}
          <div className="flex items-center gap-1.5 sm:gap-2 border-l border-stone-200 pl-2 sm:pl-3 shrink-0">
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`relative p-2 rounded-lg transition-colors ${
                showOnlyFavorites
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={t.savedItems}
              aria-label={t.savedItems}
            >
              <Bookmark className={`w-4 h-4 ${favoriteCount > 0 ? 'fill-current' : ''}`} />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Bahá'í Songs Embed & Link Button */}
            <button
              onClick={onOpenBahaiSongs}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="Bahá'í Songs (bahaisongs.com)"
            >
              <Music className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Songs</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors hidden sm:block"
              title={t.printHandout}
              aria-label={t.printHandout}
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs font-semibold text-stone-600">
              <button
                onClick={() => setLanguage('de')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'de'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'hover:text-stone-900'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'hover:text-stone-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="py-2.5 pb-3 lg:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
