import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { WifiOff, Monitor } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { LeftNavigationRail } from './components/LeftNavigationRail';
import { DocumentHead } from './components/DocumentHead';
import { ToastProvider } from './context/ToastContext';
import { PlannerProvider } from './context/PlannerContext';
import { Language, NavTab, SessionSlot } from './types';
import { UI_TRANSLATIONS } from './data/translations';
import { GAMES_DATA } from './data/games';
import { QUOTES_DATA } from './data/quotes';
import { SERVICE_PROJECTS_DATA } from './data/serviceProjects';
import { ARTS_PROMPTS_DATA } from './data/artsPrompts';
import { recordRecentView } from './utils/recentViews';
import { useWakeLock } from './hooks/useWakeLock';

// Synchronously imported primary views (zero Skeleton flash on 404 or list routes, fast LCP & zero CLS)
import { HomeView } from './components/HomeView';
import { GamesView } from './components/GamesView';
import { QuotesView } from './components/QuotesView';
import { SessionBuilder } from './components/SessionBuilder';
import { ServiceArtsView } from './components/ServiceArtsView';
import { NotFoundView } from './components/NotFoundView';

// Lazy-loaded secondary routes
const ToolkitsView = lazy(() => import('./components/ToolkitsView').then(m => ({ default: m.ToolkitsView })));
const ImpressumView = lazy(() => import('./components/ImpressumView').then(m => ({ default: m.ImpressumView })));
const DatenschutzView = lazy(() => import('./components/DatenschutzView').then(m => ({ default: m.DatenschutzView })));
const SavedView = lazy(() => import('./components/SavedView').then(m => ({ default: m.SavedView })));
const GalleryView = lazy(() => import('./components/ui/Gallery').then(m => ({ default: m.Gallery })));
const ProposalView = lazy(() => import('./components/ProposalView').then(m => ({ default: m.ProposalView })));
const SettingsSheet = lazy(() => import('./components/SettingsSheet').then(m => ({ default: m.SettingsSheet })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const BahaiSongsModal = lazy(() => import('./components/BahaiSongsModal').then(m => ({ default: m.BahaiSongsModal })));

const RouteLoading: React.FC = () => (
  <div className="max-w-4xl mx-auto py-8 space-y-6 animate-pulse" role="status" aria-label="Laden">
    <div className="h-8 bg-surface-2 rounded-control w-1/3" />
    <div className="h-4 bg-surface-2 rounded-control w-2/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
      <div className="h-28 bg-surface-2 rounded-card" />
      <div className="h-28 bg-surface-2 rounded-card" />
    </div>
    <div className="h-44 bg-surface-2 rounded-card mt-6" />
  </div>
);

function resolveFavoriteUrls(favIds: string[]): string[] {
  const urls: string[] = [];
  for (const id of favIds) {
    if (GAMES_DATA.some((g) => g.id === id)) urls.push(`/games/${id}`);
    else if (QUOTES_DATA.some((q) => q.id === id)) urls.push(`/quotes/${id}`);
    else if (SERVICE_PROJECTS_DATA.some((p) => p.id === id) || ARTS_PROMPTS_DATA.some((a) => a.id === id)) {
      urls.push(`/service-arts/${id}`);
    }
  }
  return urls;
}

export const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstMountRef = useRef(true);

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
    if (root === 'planner' || root === 'treffen') return 'planner';
    if (root === 'service-arts') return 'service-arts';
    if (root === 'tools') return 'tools';
    if (root === 'vorschlagen') return 'vorschlagen';
    if (root === 'saved') return 'saved';
    if (root === 'impressum') return 'impressum';
    if (root === 'datenschutz') return 'datenschutz';
    return 'home';
  }, [location.pathname]);

  const searchQuery = '';
  const [isBahaiSongsOpen, setIsBahaiSongsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [slotToAddToPlanner, setSlotToAddToPlanner] = useState<SessionSlot | null>(null);

  // Global Beamer Mode (Key 'B' or Navbar button) + Wake Lock
  const [isBeamerMode, setIsBeamerMode] = useState(false);
  useWakeLock(isBeamerMode);

  useEffect(() => {
    document.documentElement.classList.toggle('beamer-mode', isBeamerMode);
  }, [isBeamerMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setIsBeamerMode((prev) => !prev);
      } else if (e.key === 'Escape' && isBeamerMode) {
        setIsBeamerMode(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isBeamerMode]);

  // Online / Offline network status
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Save favorites & notify Service Worker to cache bookmarked detail pages for offline use
  useEffect(() => {
    localStorage.setItem('jy_favorites', JSON.stringify(favorites));
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller && favorites.length > 0) {
      const urls = resolveFavoriteUrls(favorites);
      if (urls.length > 0) {
        navigator.serviceWorker.controller.postMessage({ type: 'CACHE_URLS', urls });
      }
    }
  }, [favorites]);

  // Record recent views & cache viewed detail pages in Service Worker
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/games/') && path !== '/games') {
      const id = path.slice('/games/'.length).split('/')[0];
      const game = GAMES_DATA.find((g) => g.id === id);
      if (game) {
        recordRecentView({
          id: game.id,
          type: 'game',
          title: game.title,
          subtitle: game.subtitle || { de: game.durationMinutes, en: game.durationMinutes },
          path: `/games/${game.id}`,
        });
      }
    } else if (path.startsWith('/quotes/') && path !== '/quotes') {
      const id = path.slice('/quotes/'.length).split('/')[0];
      const quote = QUOTES_DATA.find((q) => q.id === id);
      if (quote) {
        recordRecentView({
          id: quote.id,
          type: 'quote',
          title: quote.theme,
          subtitle: quote.source,
          path: `/quotes/${quote.id}`,
        });
      }
    } else if (path.startsWith('/service-arts/') && path !== '/service-arts') {
      const id = path.slice('/service-arts/'.length).split('/')[0];
      const proj = SERVICE_PROJECTS_DATA.find((p) => p.id === id);
      const art = ARTS_PROMPTS_DATA.find((a) => a.id === id);
      const item = proj || art;
      if (item) {
        recordRecentView({
          id: item.id,
          type: proj ? 'service' : 'art',
          title: item.title,
          subtitle: item.duration,
          path: `/service-arts/${item.id}`,
        });
      }
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CACHE_URLS', urls: [path] });
    }
  }, [location.pathname]);

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
    } else if (tab === 'planner') {
      navigate('/treffen');
    } else {
      navigate(`/${tab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const handleAddToPlanner = (slot: SessionSlot) => {
    setSlotToAddToPlanner(slot);
    navigate('/treffen');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shift focus to H1 after route change (skip initial mount so 'Skip to content' is first focusable element on Tab)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    const h1 = document.querySelector('h1');
    if (h1) {
      if (!h1.hasAttribute('tabindex')) {
        h1.setAttribute('tabindex', '-1');
      }
      h1.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  const handleCommandPaletteNavigate = (
    type: 'game' | 'quote' | 'method' | 'service' | 'art' | 'song' | 'tool' | 'page', 
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
        navigate(`/service-arts/${id}`);
        break;
      case 'song':
        setIsBahaiSongsOpen(true);
        break;
      case 'tool':
        navigate(`/tools/${id}`);
        break;
      case 'page':
        if (id === 'settings') {
          setIsSettingsOpen(true);
        } else {
          navigate(id === 'home' ? '/' : `/${id}`);
        }
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = UI_TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-accent/20">
      {/* 1. Skip to Content Link (First focusable element for WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:px-4 focus:py-2.5 focus:min-h-[44px] focus:inline-flex focus:items-center focus:rounded-control focus:bg-accent focus:text-accent-contrast focus:font-bold focus:shadow-2"
      >
        {t.skipToContent}
      </a>

      {/* Dynamic Per-Route Document Head & Meta Tags */}
      <DocumentHead language={language} />

      {/* Offline Status Banner */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 print:hidden"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{t.offlineBannerText}</span>
        </div>
      )}

      {/* Top Navbar (Hidden in Beamer Mode) */}
      {!isBeamerMode && (
        <Navbar
          activeTab={activeTab}
          language={language}
          favoriteCount={favorites.length}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isBeamerMode={isBeamerMode}
          onToggleBeamerMode={() => setIsBeamerMode((prev) => !prev)}
        />
      )}

      {/* Phone Landscape Slim Left Rail (Hidden in Beamer Mode) */}
      {!isBeamerMode && (
        <LeftNavigationRail
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          language={language}
        />
      )}

      {/* Floating Exit Button when Global Beamer Mode is active */}
      {isBeamerMode && (
        <div className="fixed top-4 right-4 z-90 print:hidden">
          <button
            type="button"
            onClick={() => setIsBeamerMode(false)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-chip bg-surface border border-border-strong text-text text-xs font-bold shadow-2 hover:border-accent cursor-pointer"
          >
            <Monitor className="w-4 h-4 text-accent-text" />
            <span>{t.beamerModeExit}</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="short-content-pad flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 short:py-4 pb-24 lg:pb-8 focus:outline-hidden"
      >
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
              path="/treffen"
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
              path="/planner"
              element={<Navigate to="/treffen" replace />}
            />

            <Route
              path="/service-arts"
              element={
                <ServiceArtsView
                  language={language}
                  searchQuery={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
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
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
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

            <Route
              path="/vorschlagen"
              element={<ProposalView language={language} />}
            />

            <Route path="/_design" element={<GalleryView />} />

            {/* Real 404 Route */}
            <Route path="*" element={<NotFoundView language={language} />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile Portrait Bottom Tab Bar (Shown across all pages except Beamer Mode) */}
      {!isBeamerMode && (
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          language={language}
        />
      )}

      {/* Settings Sheet (Appearance, Language, Group, Backup, Offline) */}
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsSheet
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            language={language}
            setLanguage={setLanguage}
            onOpenBahaiSongs={() => setIsBahaiSongsOpen(true)}
          />
        </Suspense>
      )}

      {/* Global Command Palette (⌘K) */}
      {isCommandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            language={language}
            onNavigate={handleCommandPaletteNavigate}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </Suspense>
      )}

      {!isBeamerMode && (
        <footer className="border-t border-border mt-8 py-6 text-xs text-text-secondary print:hidden safe-bottom mb-20 lg:mb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-text-tertiary">{t.footerNote}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => handleTabChange('impressum')} className="hover:text-text transition-colors min-h-[36px] px-1">
                {t.impressumTitle}
              </button>
              <span>·</span>
              <button type="button" onClick={() => handleTabChange('datenschutz')} className="hover:text-text transition-colors min-h-[36px] px-1">
                {t.datenschutzTitle}
              </button>
              <span>·</span>
              <button type="button" onClick={() => navigate('/vorschlagen')} className="hover:text-text transition-colors min-h-[36px] px-1">
                {t.settingsSubmitProposal}
              </button>
              <span>·</span>
              <span className="text-text-tertiary">© 2026 {t.siteTitle}</span>
            </div>
          </div>
        </footer>
      )}

      {/* Bahá'í Songs Embed Modal */}
      {isBahaiSongsOpen && (
        <Suspense fallback={null}>
          <BahaiSongsModal
            isOpen={isBahaiSongsOpen}
            onClose={() => setIsBahaiSongsOpen(false)}
            language={language}
          />
        </Suspense>
      )}
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

