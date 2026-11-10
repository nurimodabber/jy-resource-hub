import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Settings, ArrowLeft } from 'lucide-react';
import { Glass } from 'glisse';
import { Logo } from './Logo';
import { GlassIconButton } from './ui/Button';
import { Language, NavTab } from '../types';
import { UI_TRANSLATIONS, TKey } from '../data/translations';
import { useContributionAttention } from './MyContributions';
import { tr } from './tools/common';

interface NavbarProps {
  activeTab: NavTab;
  language: Language;
  favoriteCount: number;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
}

type NavId = 'games' | 'quotes' | 'projects' | 'tools' | 'vorschlagen';

// Dieselben vier Bereiche wie in der unteren Leiste. „Projekte“ = Dienst + Kunst auf einer Seite.
export const NAV_ITEMS: { id: NavId; href: string; key: TKey }[] = [
  { id: 'games', href: '/games', key: 'tabGames' },
  { id: 'quotes', href: '/quotes', key: 'tabQuotes' },
  { id: 'projects', href: '/service', key: 'tabProjects' },
  { id: 'tools', href: '/tools', key: 'tabTools' },
  { id: 'vorschlagen', href: '/vorschlagen', key: 'tabProposalShort' },
];

const toNavId = (tab: NavTab): NavId | null =>
  tab === 'service' || tab === 'arts' ? 'projects' : tab === 'games' || tab === 'quotes' || tab === 'tools' || tab === 'vorschlagen' ? tab : null;

const SECTION_TITLE_KEY: Partial<Record<NavTab, TKey>> = {
  games: 'tabGames',
  quotes: 'tabQuotes',
  service: 'tabProjects',
  arts: 'tabProjects',
  tools: 'tabTools',
  saved: 'savedItems',
  vorschlagen: 'tabProposalShort',
  impressum: 'footerImpressum',
  datenschutz: 'footerDatenschutz',
  nutzungsbedingungen: 'footerTerms',
};

/** Detailseite = zweites Pfadsegment unter einem Listenbereich. Zurück führt immer zur Liste, nie ins Leere. */
const detailBackPath = (pathname: string): string | null => {
  const [root, sub] = pathname.split('/').filter(Boolean);
  if (!sub) return null;
  if (root === 'service-arts') return '/service';
  if (root === 'games' || root === 'quotes' || root === 'service' || root === 'arts' || root === 'tools') return `/${root}`;
  return null;
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  language,
  favoriteCount,
  onOpenCommandPalette,
  onOpenSettings,
}) => {
  const t = UI_TRANSLATIONS[language];
  const location = useLocation();
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeNavId = toNavId(activeTab);
  const backPath = detailBackPath(location.pathname);
  const titleKey = SECTION_TITLE_KEY[activeTab];
  const sectionTitle = titleKey ? t[titleKey] : null;
  // Dot on "Beitragen": the editors asked for changes or declined an entry sent from this device.
  const contributionNews = useContributionAttention() > 0;

  // Desktop: gleitender Hintergrund unter dem aktiven Bereich
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const desktopItemRefs = useRef<Map<NavId, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const updateIndicator = useCallback(() => {
    const el = activeNavId ? desktopItemRefs.current.get(activeNavId) : undefined;
    const nav = desktopNavRef.current;
    if (el && nav) {
      const elRect = el.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setIndicator({ left: Math.round(elRect.left - navRect.left), width: Math.round(elRect.width) });
    } else {
      setIndicator(null);
    }
  }, [activeNavId]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator, language]);

  // Phone landscape: hide header while scrolling down
  useEffect(() => {
    let last = window.pageYOffset;
    const onScroll = () => {
      const y = window.pageYOffset;
      setIsScrolled(y > 4);
      if (y > last && y > 70) setIsHidden(true);
      else if (y < last) setIsHidden(false);
      last = Math.max(y, 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Glass
      role="banner"
      // Mobile: the header melts into the page (page colour, no line). A hairline only appears once content
      // scrolls underneath. From md up it keeps the framed bar.
      className={`jy-header sticky top-0 z-40 border-b bg-bg/85 md:bg-surface/75 md:border-line/75 md:shadow-2xs backdrop-blur-xl print:hidden safe-top transition-[transform,border-color] duration-200 ${
        isScrolled ? 'border-line/60' : 'border-transparent'
      } ${
        isHidden ? 'short:-translate-y-full' : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-3.5 sm:px-6 flex items-center h-16 short:h-12 justify-between gap-2.5">
        {/* Links (mobil): Detailseite = Glas-Zurück + Bereich; Bereich = kleines Logo + Bereich; Start = Logo + Name */}
        <div className="flex items-center gap-2 min-w-0 md:hidden">
          {backPath ? (
            <>
              <GlassIconButton
                label={sectionTitle ? `${language === 'de' ? 'Zurück zu' : 'Back to'} ${sectionTitle}` : language === 'de' ? 'Zurück' : 'Back'}
                icon={<ArrowLeft className="w-5 h-5" strokeWidth={2} />}
                onClick={() => {
                  // Opened from the quote list: go back to it, so search and filters stay as they were.
                  if ((location.state as { fromQuotesList?: boolean } | null)?.fromQuotesList) navigate(-1);
                  else navigate(backPath);
                }}
                className="-ml-1"
              />
              {sectionTitle && (
                <span className="font-semibold text-base tracking-tight text-text truncate">{sectionTitle}</span>
              )}
            </>
          ) : (
            <Link
              to="/"
              className="flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] rounded-control focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`${t.siteTitle} – ${t.tabHome}`}
            >
              <Logo className="w-8 h-8 shrink-0" />
            </Link>
          )}
        </div>

        {/* Links (ab Tablet): Logo */}
        <Link
          to="/"
          className="hidden md:flex items-center justify-center gap-2.5 shrink-0 min-w-[44px] min-h-[44px] rounded-control focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`${t.siteTitle} – ${t.tabHome}`}
        >
          <Logo className="w-8 h-8 short:w-6 short:h-6 shrink-0" />
        </Link>

        {/* Mitte (ab Tablet): vier Bereiche */}
        <nav
          ref={desktopNavRef}
          className="relative hidden md:flex short:hidden items-center p-1 rounded-full bg-surface-2/70 border border-line/70 gap-0.5"
          aria-label={language === 'de' ? 'Hauptnavigation' : 'Main navigation'}
        >
          {indicator && (
            <div
              className="absolute left-0 top-1 bottom-1 rounded-full bg-surface shadow-1 border border-line/80 transition-all duration-200 ease-out pointer-events-none motion-reduce:transition-none"
              style={{ transform: `translate3d(${indicator.left}px, 0, 0)`, width: `${indicator.width}px` }}
            />
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavId === item.id;
            const href = item.id === 'projects' && activeTab === 'arts' ? '/arts' : item.href;
            return (
              <Link
                key={item.id}
                ref={(el) => {
                  if (el) desktopItemRefs.current.set(item.id, el);
                  else desktopItemRefs.current.delete(item.id);
                }}
                to={href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative z-10 px-3 lg:px-4 py-1.5 min-h-[36px] inline-flex items-center rounded-full text-sm whitespace-nowrap transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive ? 'text-text font-semibold' : 'text-text-secondary font-medium hover:text-text'
                }`}
              >
                {t[item.key]}
                {item.id === 'vorschlagen' && contributionNews && (
                  <>
                    <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-surface pointer-events-none" aria-hidden="true" />
                    <span className="sr-only">
                      {`, ${tr(language)('neue Rückmeldung zu deinen Beiträgen', 'new feedback on your contributions')}`}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rechts: Suche, Gemerkt, Einstellungen (+ Beitragen ab Tablet) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="group hidden lg:flex items-center gap-2.5 h-11 w-48 px-3.5 rounded-full bg-surface-2/70 border border-line/70 hover:border-border-strong text-xs text-text-secondary hover:text-text cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t.cmdKSearch}
          >
            <Search className="w-3.5 h-3.5 text-text-tertiary shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-left truncate">{language === 'de' ? 'Suchen …' : 'Search …'}</span>
            <kbd className="text-2xs text-text-tertiary">⌘K</kbd>
          </button>

          <GlassIconButton
            label={language === 'de' ? 'Suche öffnen' : 'Open search'}
            icon={<Search className="w-[18px] h-[18px]" strokeWidth={1.9} />}
            onClick={onOpenCommandPalette}
            className="lg:hidden"
          />

          {/* Drei runde Glas-Knöpfe statt Menü: Gemerkt (mit Zähler), Beitragen (nur ab Tablet; mobil ist das der Plus-Knopf unten), Einstellungen */}
          <div className="relative">
            <GlassIconButton
              label={favoriteCount > 0 ? `${t.savedItems} (${favoriteCount})` : t.savedItems}
              icon={<Bookmark className="w-[18px] h-[18px]" strokeWidth={1.9} />}
              onClick={() => navigate('/saved')}
              aria-current={activeTab === 'saved' ? 'page' : undefined}
            />
            {favoriteCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-contrast text-[10px] font-bold leading-[18px] text-center tabular-nums ring-2 ring-surface pointer-events-none"
                aria-hidden="true"
              >
                {favoriteCount > 99 ? '99+' : favoriteCount}
              </span>
            )}
          </div>
          <GlassIconButton
            label={t.tabSettings}
            icon={<Settings className="w-[18px] h-[18px]" strokeWidth={1.9} />}
            onClick={onOpenSettings}
          />
        </div>
      </div>
    </Glass>
  );
};
