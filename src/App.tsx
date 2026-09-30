import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { LeftNavigationRail } from './components/LeftNavigationRail';
import { MoreSheet } from './components/MoreSheet';
import { CommandPalette } from './components/CommandPalette';
import { HomeView } from './components/HomeView';
import { GamesView } from './components/GamesView';
import { QuotesView } from './components/QuotesView';
import { SessionBuilder } from './components/SessionBuilder';
import { ServiceArtsView } from './components/ServiceArtsView';
import { ToolkitsView } from './components/ToolkitsView';
import { ImpressumView } from './components/ImpressumView';
import { DatenschutzView } from './components/DatenschutzView';
import { BahaiSongsModal } from './components/BahaiSongsModal';
import { Language, NavTab, SessionSlot, Game, QuoteItem, QuoteMethod } from './types';
import { UI_TRANSLATIONS } from './data/translations';
import { Music, FileText, ShieldCheck } from 'lucide-react';
import { Logo } from './components/Logo';

export const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Legacy hash redirect: convert '#/games/...' or '#games' to clean URL
  useEffect(() => {
    if (window.location.hash) {
      const cleanHash = window.location.hash.replace('#/', '/').replace('#', '/');
      if (cleanHash && cleanHash !== '/') {
        window.history.replaceState(null, '', window.location.pathname);
        navigate(cleanHash, { replace: true });
      }
    }
  }, [navigate]);

  // Derive active tab and sub-IDs from pathname
  const { activeTab, subId } = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const root = segments[0] || 'home';

    if (root === 'home' || root === '') {
      return { activeTab: 'home' as NavTab, subId: null };
    }
    if (root === 'games') {
      return { activeTab: 'games' as NavTab, subId: segments[1] || null };
    }
    if (root === 'quotes') {
      return { activeTab: 'quotes' as NavTab, subId: segments[1] || null };
    }
    if (root === 'planner') {
      return { activeTab: 'planner' as NavTab, subId: null };
    }
    if (root === 'service-arts') {
      return { activeTab: 'service-arts' as NavTab, subId: null };
    }
    if (root === 'tools') {
      return { activeTab: 'tools' as NavTab, subId: segments[1] || null };
    }
    if (root === 'impressum') {
      return { activeTab: 'impressum' as NavTab, subId: null };
    }
    if (root === 'datenschutz') {
      return { activeTab: 'datenschutz' as NavTab, subId: null };
    }

    return { activeTab: 'home' as NavTab, subId: null };
  }, [location.pathname]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isBahaiSongsOpen, setIsBahaiSongsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [slotToAddToPlanner, setSlotToAddToPlanner] = useState<SessionSlot | null>(null);

  // Persistent language
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('jy_lang');
    return (saved === 'de' || saved === 'en') ? saved : 'de';
  });

  // Persistent favorites (initialized empty for new visitors)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jy_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('jy_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('jy_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleTabChange = useCallback((tab: NavTab) => {
    setShowOnlyFavorites(false);
    if (tab === 'home') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const handleAddToPlanner = (slot: SessionSlot) => {
    setSlotToAddToPlanner(slot);
    navigate('/planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGame = (game: Game | null) => {
    if (game) {
      navigate(`/games/${game.id}`);
    } else {
      navigate('/games');
    }
  };

  const handlePracticeQuote = (quote: QuoteItem, _method?: QuoteMethod) => {
    navigate(`/quotes/${quote.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommandPaletteNavigate = (
    type: 'game' | 'quote' | 'method' | 'service' | 'art' | 'song' | 'tool', 
    id: string
  ) => {
    switch (type) {
      case 'game':
        navigate(`/games/${id}`);
        break;
      case 'quote':
        navigate(`/quotes/${id}`);
        break;
      case 'method':
        navigate('/quotes');
        break;
      case 'service':
      case 'art':
        navigate('/service-arts');
        break;
      case 'song':
        setIsBahaiSongsOpen(true);
        break;
      case 'tool':
        navigate('/tools');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = UI_TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent/20">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        favoriteCount={favorites.length}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        onOpenBahaiSongs={() => setIsBahaiSongsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Phone Landscape Slim Left Rail */}
      <LeftNavigationRail
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenMore={() => setIsMoreSheetOpen(true)}
        language={language}
      />

      {/* Main Content Area */}
      <main className="short-content-pad flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 short:py-4 pb-24 md:pb-8">
        
        {activeTab === 'home' && (
          <HomeView
            language={language}
            onNavigateTab={handleTabChange}
            onSelectGame={handleSelectGame}
            onSelectQuoteToPractice={handlePracticeQuote}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'games' && (
          <GamesView
            searchQuery={searchQuery}
            language={language}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showOnlyFavorites={showOnlyFavorites}
            onClearShowOnlyFavorites={() => setShowOnlyFavorites(false)}
            selectedGameId={subId}
            onSelectGame={handleSelectGame}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesView
            searchQuery={searchQuery}
            language={language}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showOnlyFavorites={showOnlyFavorites}
            selectedQuoteId={subId}
            onSelectQuote={(q) => navigate(`/quotes/${q.id}`)}
          />
        )}

        {activeTab === 'planner' && (
          <SessionBuilder
            language={language}
            onOpenBahaiSongs={() => setIsBahaiSongsOpen(true)}
            externalSlotToAdd={slotToAddToPlanner}
            onClearExternalSlot={() => setSlotToAddToPlanner(null)}
          />
        )}

        {activeTab === 'service-arts' && (
          <ServiceArtsView
            language={language}
            searchQuery={searchQuery}
            onAddToPlanner={handleAddToPlanner}
          />
        )}

        {activeTab === 'tools' && (
          <ToolkitsView language={language} />
        )}

        {activeTab === 'impressum' && (
          <ImpressumView
            language={language}
            onBack={() => handleTabChange('home')}
          />
        )}

        {activeTab === 'datenschutz' && (
          <DatenschutzView
            language={language}
            onBack={() => handleTabChange('home')}
          />
        )}
      </main>

      {/* Mobile Portrait Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenMore={() => setIsMoreSheetOpen(true)}
        language={language}
      />

      {/* More Sheet for Mobile (Tools, Service & Arts, Songs, Legal, Settings) */}
      <MoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenBahaiSongs={() => setIsBahaiSongsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        language={language}
        onNavigate={handleCommandPaletteNavigate}
      />

      {/* Footer (Desktop & Tablet) */}
      <footer className="bg-surface/60 border-t border-border-subtle mt-16 py-8 text-xs text-text-secondary print:hidden safe-bottom hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-surface border border-border-subtle shadow-xs flex items-center justify-center p-0.5">
              <Logo className="w-4 h-4" />
            </div>
            <span className="font-semibold text-text">{t.siteTitle}</span>
            <span className="mx-2 text-text-tertiary">•</span>
            <span>{t.footerNote}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBahaiSongsOpen(true)}
              className="text-text-secondary hover:text-text font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Music className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Bahá'í Songs</span>
            </button>
            <span className="text-text-tertiary">•</span>
            <button
              onClick={() => handleTabChange('impressum')}
              className="text-text-secondary hover:text-text transition-colors inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t.impressumTitle || 'Impressum'}</span>
            </button>
            <span className="text-text-tertiary">•</span>
            <button
              onClick={() => handleTabChange('datenschutz')}
              className="text-text-secondary hover:text-text transition-colors inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t.datenschutzTitle || 'Datenschutz'}</span>
            </button>
            <span className="text-text-tertiary">•</span>
            <button
              onClick={() => window.print()}
              className="text-text-secondary hover:text-text transition-colors"
            >
              {t.printHandout}
            </button>
          </div>
        </div>
      </footer>

      {/* Bahá'í Songs Embed Modal */}
      <BahaiSongsModal
        isOpen={isBahaiSongsOpen}
        onClose={() => setIsBahaiSongsOpen(false)}
        language={language}
      />
    </div>
  );
};

export default App;
