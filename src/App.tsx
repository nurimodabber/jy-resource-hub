import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { LeftNavigationRail } from './components/LeftNavigationRail';
import { MoreSheet } from './components/MoreSheet';
import { CommandPalette } from './components/CommandPalette';
import { BahaiSongsModal } from './components/BahaiSongsModal';
import { DocumentHead } from './components/DocumentHead';
import { ToastProvider } from './context/ToastContext';
import { PlannerProvider } from './context/PlannerContext';
import { Language, NavTab, SessionSlot,  } from './types';
import { UI_TRANSLATIONS } from './data/translations';
import { Loader2 } from 'lucide-react';

// Lazy-loaded routes for code-splitting
const HomeView = lazy(() => import('./components/HomeView').then(m => ({ default: m.HomeView })));
const GamesView = lazy(() => import('./components/GamesView').then(m => ({ default: m.GamesView })));
const QuotesView = lazy(() => import('./components/QuotesView').then(m => ({ default: m.QuotesView })));
const SessionBuilder = lazy(() => import('./components/SessionBuilder').then(m => ({ default: m.SessionBuilder })));
const ServiceArtsView = lazy(() => import('./components/ServiceArtsView').then(m => ({ default: m.ServiceArtsView })));
const ToolkitsView = lazy(() => import('./components/ToolkitsView').then(m => ({ default: m.ToolkitsView })));
const ImpressumView = lazy(() => import('./components/ImpressumView').then(m => ({ default: m.ImpressumView })));
const DatenschutzView = lazy(() => import('./components/DatenschutzView').then(m => ({ default: m.DatenschutzView })));
const SavedView = lazy(() => import('./components/SavedView').then(m => ({ default: m.SavedView })));
const NotFoundView = lazy(() => import('./components/NotFoundView').then(m => ({ default: m.NotFoundView })));

const RouteLoading: React.FC = () => (
  <div className="flex items-center justify-center py-24 min-h-[300px]" role="status" aria-label="Loading">
    <div className="flex flex-col items-center gap-3 text-text-secondary text-sm">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
      <span>Wird geladen...</span>
    </div>
  </div>
);

export const AppContent: React.FC = () => {
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

  // Derive active tab from pathname for header/rail/tabbar highlighting
  const activeTab = useMemo<NavTab>(() => {
    const root = location.pathname.split('/').filter(Boolean)[0] || 'home';
    if (root === 'home' || root === '') return 'home';
    if (root === 'games') return 'games';
    if (root === 'quotes') return 'quotes';
    if (root === 'planner') return 'planner';
    if (root === 'service-arts') return 'service-arts';
    if (root === 'tools') return 'tools';
    if (root === 'saved') return 'saved';
    if (root === 'impressum') return 'impressum';
    if (root === 'datenschutz') return 'datenschutz';
    return 'home';
  }, [location.pathname]);

  const searchQuery = '';
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
        navigate('/quotes?tab=methods');
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
      {/* Dynamic Per-Route Document Head & Meta Tags */}
      <DocumentHead language={language} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        language={language}
        favoriteCount={favorites.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenMore={() => setIsMoreSheetOpen(true)}
      />

      {/* Phone Landscape Slim Left Rail */}
      <LeftNavigationRail
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenMore={() => setIsMoreSheetOpen(true)}
        language={language}
      />

      {/* Main Content Area */}
      <main className="short-content-pad flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 short:py-4 pb-24 lg:pb-8">
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                <HomeView language={language} favorites={favorites} />
              }
            />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route
              path="/saved"
              element={<SavedView language={language} favorites={favorites} onToggleFavorite={handleToggleFavorite} />}
            />

            <Route
              path="/games"
              element={
                <GamesView language={language} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
              }
            />
            <Route
              path="/games/:id"
              element={
                <GamesView language={language} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
              }
            />

            <Route
              path="/quotes"
              element={
                <QuotesView
                  searchQuery={searchQuery}
                  language={language}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  showOnlyFavorites={showOnlyFavorites}
                  onSelectQuote={(q) => navigate(`/quotes/${q.id}`)}
                />
              }
            />
            <Route
              path="/quotes/:id"
              element={
                <QuotesView
                  searchQuery={searchQuery}
                  language={language}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  showOnlyFavorites={showOnlyFavorites}
                  onSelectQuote={(q) => navigate(`/quotes/${q.id}`)}
                />
              }
            />

            <Route
              path="/planner"
              element={
                <SessionBuilder
                  language={language}
                  onOpenBahaiSongs={() => setIsBahaiSongsOpen(true)}
                  externalSlotToAdd={slotToAddToPlanner}
                  onClearExternalSlot={() => setSlotToAddToPlanner(null)}
                  favorites={favorites}
                />
              }
            />

            <Route
              path="/service-arts"
              element={
                <ServiceArtsView
                  language={language}
                  searchQuery={searchQuery}
                  onAddToPlanner={handleAddToPlanner}
                />
              }
            />
            <Route
              path="/service-arts/:id"
              element={
                <ServiceArtsView
                  language={language}
                  searchQuery={searchQuery}
                  onAddToPlanner={handleAddToPlanner}
                />
              }
            />

            <Route
              path="/tools"
              element={<ToolkitsView language={language} />}
            />
            <Route
              path="/tools/:toolId"
              element={<ToolkitsView language={language} />}
            />

            <Route
              path="/impressum"
              element={
                <ImpressumView
                  language={language}
                  onBack={() => handleTabChange('home')}
                />
              }
            />

            <Route
              path="/datenschutz"
              element={
                <DatenschutzView
                  language={language}
                  onBack={() => handleTabChange('home')}
                />
              }
            />

            {/* Real 404 Route */}
            <Route path="*" element={<NotFoundView language={language} />} />
          </Routes>
        </Suspense>
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

      <footer className="border-t border-border mt-10 py-6 text-xs text-text-secondary print:hidden safe-bottom mb-16 lg:mb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-text-tertiary">{t.footerNote}</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => handleTabChange('impressum')} className="hover:text-text">
              {t.impressumTitle}
            </button>
            <button type="button" onClick={() => handleTabChange('datenschutz')} className="hover:text-text">
              {t.datenschutzTitle}
            </button>
            <span className="text-text-tertiary">© 2026 {t.siteTitle}</span>
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

export const App: React.FC = () => {
  const [language] = useState<Language>(() => {
    const saved = localStorage.getItem('jy_lang');
    return (saved === 'de' || saved === 'en') ? saved : 'de';
  });

  return (
    <ToastProvider>
      <PlannerProvider language={language}>
        <AppContent />
      </PlannerProvider>
    </ToastProvider>
  );
};

export default App;
