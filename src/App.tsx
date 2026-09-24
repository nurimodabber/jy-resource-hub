import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GamesView } from './components/GamesView';
import { QuotesView } from './components/QuotesView';
import { SessionBuilder } from './components/SessionBuilder';
import { ToolkitsView } from './components/ToolkitsView';
import { BahaiSongsModal } from './components/BahaiSongsModal';
import { Language } from './types';
import { UI_TRANSLATIONS } from './data/translations';
import { ExternalLink, Music } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'games' | 'quotes' | 'planner' | 'toolkits'>('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBahaiSongsOpen, setIsBahaiSongsOpen] = useState(false);
  
  // Persistent language
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('jy_lang');
    return (saved === 'de' || saved === 'en') ? saved : 'de';
  });

  // Persistent favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jy_favorites');
      return saved ? JSON.parse(saved) : ['ssp-evolution', 'empire', 'verschwindende-tafel'];
    } catch {
      return ['ssp-evolution', 'empire', 'verschwindende-tafel'];
    }
  });

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
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

  const t = UI_TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-200">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'games' && (
          <GamesView
            searchQuery={searchQuery}
            language={language}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showOnlyFavorites={showOnlyFavorites}
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
          />
        )}

        {activeTab === 'toolkits' && (
          <ToolkitsView language={language} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-8 text-xs text-stone-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-stone-800">{t.siteTitle}</span>
            <span className="mx-2">•</span>
            <span>{t.footerNote}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBahaiSongsOpen(true)}
              className="text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <Music className="w-3.5 h-3.5 text-emerald-800" />
              <span>Bahá'í Songs</span>
            </button>
            <span>•</span>
            <button
              onClick={() => window.print()}
              className="text-stone-500 hover:text-stone-800 transition-colors"
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
