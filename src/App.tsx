import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { WifiOff, Mail, Settings } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { LeftNavigationRail } from './components/LeftNavigationRail';
import { Logo } from './components/Logo';
import { DocumentHead } from './components/DocumentHead';
import { ToastProvider } from './context/ToastContext';
import { AdminDataProvider, useAdminData } from './context/AdminDataContext';
import { Language, NavTab } from './types';
import { UI_TRANSLATIONS } from './data/translations';
import { GAMES_DATA } from './data/games';
import { QUOTES_DATA } from './data/quotes';
import { SERVICE_PROJECTS_DATA } from './data/serviceProjects';
import { ARTS_PROMPTS_DATA } from './data/artsPrompts';
import { recordRecentView } from './utils/recentViews';

// Synchronously imported primary views (zero Skeleton flash on 404 or list routes, fast LCP & zero CLS)
import { HomeView } from './components/HomeView';
import { GamesView } from './components/GamesView';
import { QuotesView } from './components/QuotesView';
import { ServiceArtsView } from './components/ServiceArtsView';
import { NotFoundView } from './components/NotFoundView';

// Lazy-loaded secondary routes
const ToolkitsView = lazy(() => import('./components/ToolkitsView').then(m => ({ default: m.ToolkitsView })));
const ImpressumView = lazy(() => import('./components/ImpressumView').then(m => ({ default: m.ImpressumView })));
const DatenschutzView = lazy(() => import('./components/DatenschutzView').then(m => ({ default: m.DatenschutzView })));
const SavedView = lazy(() => import('./components/SavedView').then(m => ({ default: m.SavedView })));
const GalleryView = lazy(() => import('./components/ui/Gallery').then(m => ({ default: m.Gallery })));
const ProposalView = lazy(() => import('./components/ProposalView').then(m => ({ default: m.ProposalView })));
const AdminView = lazy(() => import('./components/AdminView').then(m => ({ default: m.AdminView })));
const SettingsSheet = lazy(() => import('./components/SettingsSheet').then(m => ({ default: m.SettingsSheet })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const BahaiSongsModal = lazy(() => import('./components/BahaiSongsModal').then(m => ({ default: m.BahaiSongsModal })));
const ContactModal = lazy(() => import('./components/ContactModal').then(m => ({ default: m.ContactModal })));

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
    else if (SERVICE_PROJECTS_DATA.some((p) => p.id === id)) urls.push(`/service/${id}`);
    else if (ARTS_PROMPTS_DATA.some((a) => a.id === id)) urls.push(`/arts/${id}`);
  }
  return urls;
}

export const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstMountRef = useRef(true);
  const adminData = useAdminData();

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
    if (root === 'service') return 'service';
    if (root === 'arts') return 'arts';
    if (root === 'service-arts') return 'service';
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
  const [isContactOpen, setIsContactOpen] = useState(false);

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
      const game = adminData.games.find((g) => g.id === id) || GAMES_DATA.find((g) => g.id === id);
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
    } else if (path.startsWith('/service/') && path !== '/service') {
      const id = path.slice('/service/'.length).split('/')[0];
      const proj = SERVICE_PROJECTS_DATA.find((p) => p.id === id);
      if (proj) {
        recordRecentView({
          id: proj.id,
          type: 'service',
          title: proj.title,
          subtitle: proj.duration,
          path: `/service/${proj.id}`,
        });
      }
    } else if (path.startsWith('/arts/') && path !== '/arts') {
      const id = path.slice('/arts/'.length).split('/')[0];
      const art = ARTS_PROMPTS_DATA.find((a) => a.id === id);
      if (art) {
        recordRecentView({
          id: art.id,
          type: 'art',
          title: art.title,
          subtitle: art.duration,
          path: `/arts/${art.id}`,
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
          path: proj ? `/service/${item.id}` : `/arts/${item.id}`,
        });
      }
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CACHE_URLS', urls: [path] });
    }
  }, [location.pathname, adminData.games]);

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

  // Scroll management: record scroll positions and restore on navigation back
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const lastLocationRef = useRef<string>(location.pathname);

  // Continuously record scroll position for overview pages
  useEffect(() => {
    const handleScroll = () => {
      const path = location.pathname;
      if (path === '/games' || path === '/quotes' || path === '/service' || path === '/arts' || path === '/tools') {
        scrollPositionsRef.current[path] = window.scrollY;
        try {
          sessionStorage.setItem(`jy_scroll_${path}`, String(window.scrollY));
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Handle route transitions (Scroll-to-top on detail & Scroll restoration on overview)
  useEffect(() => {
    const prevPath = lastLocationRef.current;
    const currentPath = location.pathname;
    lastLocationRef.current = currentPath;

    const isDetailRoute = /^\/(games|quotes|service|arts)\/[^/]+$/.test(currentPath);
    const isOverviewRoute = currentPath === '/games' || currentPath === '/quotes' || currentPath === '/service' || currentPath === '/arts';

    if (isDetailRoute) {
      // 4. Scroll-to-Top on Game/Item Detail
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else if (isOverviewRoute && prevPath.startsWith(currentPath + '/')) {
      // 5. Scroll Restoration when returning from detail view to overview
      const cachedY = scrollPositionsRef.current[currentPath] ?? (() => {
        try {
          const val = sessionStorage.getItem(`jy_scroll_${currentPath}`);
          return val ? Number(val) : 0;
        } catch {
          return 0;
        }
      })();

      if (cachedY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: cachedY, left: 0, behavior: 'instant' });
        });
      }
    }
  }, [location.pathname]);

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
        navigate('/quotes?tab=practice');
        break;
      case 'service':
        navigate(`/service/${id}`);
        break;
      case 'art':
        navigate(`/arts/${id}`);
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
          className="bg-surface-2 border-b border-border text-text-secondary px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 print:hidden"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{t.offlineBannerText}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        language={language}
        favoriteCount={favorites.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Phone Landscape Slim Left Rail */}
      <LeftNavigationRail
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        language={language}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="short-content-pad flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 short:py-4 pb-24 md:pb-8 focus:outline-hidden"
      >
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route
              path="/"
              element={
                <HomeView language={language} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
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
              element={<Navigate to="/" replace />}
            />
            <Route
              path="/planner"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="/tools/planner"
              element={<Navigate to="/" replace />}
            />

            <Route
              path="/service"
              element={
                <ServiceArtsView
                  fixedKind="dienst"
                  language={language}
                  searchQuery={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />
            <Route
              path="/service/:id"
              element={
                <ServiceArtsView
                  fixedKind="dienst"
                  language={language}
                  searchQuery={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            <Route
              path="/arts"
              element={
                <ServiceArtsView
                  fixedKind="kunst"
                  language={language}
                  searchQuery={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />
            <Route
              path="/arts/:id"
              element={
                <ServiceArtsView
                  fixedKind="kunst"
                  language={language}
                  searchQuery={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            <Route
              path="/service-arts"
              element={<Navigate to="/service" replace />}
            />
            <Route
              path="/service-arts/:id"
              element={
                <ServiceArtsView
                  language={language}
                  searchQuery={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
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
                  onOpenContact={() => setIsContactOpen(true)}
                />
              }
            />

            <Route
              path="/datenschutz"
              element={
                <DatenschutzView
                  language={language}
                  onBack={() => handleTabChange('home')}
                  onOpenContact={() => setIsContactOpen(true)}
                />
              }
            />

            <Route
              path="/vorschlagen"
              element={<ProposalView language={language} />}
            />

            <Route
              path="/admin"
              element={<AdminView language={language} />}
            />

            <Route path="/_design" element={<GalleryView />} />

            {/* Real 404 Route */}
            <Route path="*" element={<NotFoundView language={language} />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile Portrait Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        language={language}
      />

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

      <footer className="short-content-pad border-t border-line mt-6 sm:mt-10 pt-4 pb-4 sm:pt-5 sm:pb-5 text-xs text-text-secondary print:hidden safe-bottom mb-[calc(4.5rem+env(safe-area-inset-bottom))] short:mb-0 md:mb-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-4">
          {/* Main row: Brand + Status Notice on left, Compact Actions on right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
            {/* Brand & Status Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <div className="flex items-center gap-2 shrink-0">
                  <Logo className="w-5 h-5 text-accent shrink-0" />
                  <span className="font-extrabold text-sm text-text tracking-tight">{t.siteTitle}</span>
                </div>
                <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent-text whitespace-nowrap shrink-0">
                  {t.footerStatusBadge}
                </span>
              </div>
              <span className="hidden sm:inline text-border-strong select-none">·</span>
              <span className="text-2xs text-text-tertiary">
                {t.footerScopeNote}
              </span>
            </div>

            {/* Quick Actions: Contact Button & Settings */}
            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-surface hover:bg-surface-2 border border-border text-text transition-colors min-h-[36px] focus-visible:ring-2 focus-visible:ring-accent cursor-pointer shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>{t.footerContact}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-surface hover:bg-surface-2 border border-border text-text transition-colors min-h-[36px] focus-visible:ring-2 focus-visible:ring-accent cursor-pointer shadow-2xs"
              >
                <Settings className="w-3.5 h-3.5 text-text-tertiary" />
                <span>{t.tabSettings}</span>
              </button>
            </div>
          </div>

          {/* Links & Legal Row (fluid responsive wrap, no orphan dots) */}
          <div className="border-t border-line/60 pt-3 flex flex-col md:flex-row items-center justify-between gap-3 text-2xs text-text-tertiary text-center md:text-left">
            <nav aria-label="Footer" className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5">
              <Link to="/games" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.tabGames}
              </Link>
              <Link to="/quotes" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.tabQuotes}
              </Link>
              <Link to="/service-arts" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.tabServiceArts}
              </Link>
              <Link to="/tools" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.tabTools}
              </Link>
              <Link to="/vorschlagen" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.tabProposal}
              </Link>
              <Link to="/impressum" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.impressumTitle}
              </Link>
              <Link to="/datenschutz" className="hover:text-text transition-colors py-0.5 min-h-[28px] inline-flex items-center">
                {t.datenschutzTitle}
              </Link>
            </nav>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 shrink-0 pt-1 md:pt-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shrink-0" aria-hidden="true" />
                <span>{t.settingsOfflineReady}</span>
              </span>
              <span className="text-border-strong select-none">·</span>
              <span>© 2026 {t.siteTitle}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactOpen && (
        <Suspense fallback={null}>
          <ContactModal
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
            language={language}
          />
        </Suspense>
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
  return (
    <ToastProvider>
      <AdminDataProvider>
        <AppContent />
      </AdminDataProvider>
    </ToastProvider>
  );
};

export default App;

