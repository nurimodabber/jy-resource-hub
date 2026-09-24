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
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] text-[#1d1d1f] selection:bg-[#0071e3]/20">
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
      <footer className="bg-[#f5f5f7] border-t border-black/[0.06] mt-16 py-8 text-xs text-[#86868b] print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-[#1d1d1f]">{t.siteTitle}</span>
            <span className="mx-2">•</span>
            <span>{t.footerNote}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBahaiSongsOpen(true)}
              className="text-[#6e6e73] hover:text-[#1d1d1f] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Music className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bahá'í Songs</span>
            </button>
            <span>•</span>
            <button
              onClick={() => window.print()}
              className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
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
