import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GamesView } from './components/GamesView';
import { QuotesView } from './components/QuotesView';
import { SessionBuilder } from './components/SessionBuilder';
import { ServiceArtsView } from './components/ServiceArtsView';
import { ToolkitsView } from './components/ToolkitsView';
import { BahaiSongsModal } from './components/BahaiSongsModal';
import { Language, NavTab, SessionSlot } from './types';
import { UI_TRANSLATIONS } from './data/translations';
import { Music } from 'lucide-react';
import { Logo } from './components/Logo';

export const App: React.FC = () => {
  // Hash-based deep link routing initialization
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validTabs: NavTab[] = ['games', 'quotes', 'planner', 'service-arts', 'tools'];
      if (validTabs.includes(hash as NavTab)) {
        return hash as NavTab;
      }
    } catch {
      // Fallback
    }
    return 'games';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isBahaiSongsOpen, setIsBahaiSongsOpen] = useState(false);
  const [slotToAddToPlanner, setSlotToAddToPlanner] = useState<SessionSlot | null>(null);

  // Persistent language
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('jy_lang');
    return (saved === 'de' || saved === 'en') ? saved : 'de';
  });

  // Persistent favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jy_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Update hash when activeTab changes
  useEffect(() => {
    window.location.hash = `#/${activeTab}`;
  }, [activeTab]);

  // Listen to external hash changes (e.g. browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validTabs: NavTab[] = ['games', 'quotes', 'planner', 'service-arts', 'tools'];
      if (validTabs.includes(hash as NavTab)) {
        setActiveTab(hash as NavTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const handleAddToPlanner = (slot: SessionSlot) => {
    setSlotToAddToPlanner(slot);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = UI_TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent/20">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        favoriteCount={favorites.length}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        onOpenBahaiSongs={() => setIsBahaiSongsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'games' && (
          <GamesView
            searchQuery={searchQuery}
            language={language}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showOnlyFavorites={showOnlyFavorites}
            onClearShowOnlyFavorites={() => setShowOnlyFavorites(false)}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesView
            searchQuery={searchQuery}
            language={language}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showOnlyFavorites={showOnlyFavorites}
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
      </main>

      {/* Footer */}
      <footer className="bg-surface/60 border-t border-border-subtle mt-16 py-8 text-xs text-text-secondary print:hidden safe-bottom">
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
