import React, { useEffect, useRef, useState } from 'react';
import { TabBar } from 'glisse';
import { Dices, BookOpen, HeartHandshake, Wrench, Plus } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useContributionAttention } from './MyContributions';
import { tr } from './tools/common';

export interface BottomTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
}

// Navigiert wird nur über onValueChange (siehe unten). Der Link verhindert bloß das Laden durch den Browser;
// Strg/Cmd-Klick öffnet weiter einen neuen Tab, weil glisse solche Klicks gar nicht auswählt.
const RouterLinkAdapter = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }
>(({ href = '/', children, onClick, ...rest }, ref) => (
  <a
    ref={ref}
    href={href}
    onClick={(e) => {
      onClick?.(e);
      if (!(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) e.preventDefault();
    }}
    {...rest}
  >
    {children}
  </a>
));
RouterLinkAdapter.displayName = 'RouterLinkAdapter';

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab, language }) => {
  const t = UI_TRANSLATIONS[language];
  // glisse bewegt die Auswahl mit einer JavaScript-Feder auf dem Haupt-Thread. Das Einhängen einer neuen Seite
  // blockiert ihn 50–80 ms (am Handy mehr) und ließe die Feder mitten im Gleiten stocken. Deshalb erst wechseln,
  // wenn die Auswahl angekommen ist (glisse setzt data-away/data-lensing, solange sie sich bewegt), spätestens
  // nach 300 ms. Bei schnellem Antippen zählt nur der letzte Tab.
  const wrapRef = useRef<HTMLDivElement>(null);
  const pending = useRef(0);
  const selectWhenSettled = (tab: NavTab) => {
    const bar = wrapRef.current?.querySelector('.lg-tab-bar');
    const token = ++pending.current;
    const start = performance.now();
    const go = () => {
      if (token !== pending.current) return;
      const moving = bar?.hasAttribute('data-away') || bar?.hasAttribute('data-lensing');
      if (moving && performance.now() - start < 300) {
        window.setTimeout(go, 16);
        return;
      }
      onSelectTab(tab);
    };
    go();
  };
  // Compact once the page is scrolled; large again at the top.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCompact(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Eine Leiste mit fünf Tabs: Dienst und Kunst teilen sich „Projekte“ (Umschalter oben auf der Seite),
  // „Beitragen“ ist der fünfte Tab statt eines eigenen Knopfs daneben.
  const projectsHref = activeTab === 'arts' ? '/arts' : '/service';
  // Dot on "Beitragen" when the editors asked for changes or declined an entry from this device.
  // It sits inside the icon (glisse hides that from screen readers); the label carries the spoken hint.
  const contributionNews = useContributionAttention() > 0;
  const proposalIcon = (
    <span className="relative inline-flex">
      <Plus className="w-5 h-5" strokeWidth={1.9} />
      {contributionNews && (
        <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-surface pointer-events-none" />
      )}
    </span>
  );
  const proposalLabel = (
    <>
      {t.tabProposalShort}
      {contributionNews && (
        <span className="sr-only">{`, ${tr(language)('neue Rückmeldung zu deinen Beiträgen', 'new feedback on your contributions')}`}</span>
      )}
    </>
  );
  const items = [
    { value: 'games', label: t.tabGames, href: '/games', icon: <Dices className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'quotes', label: t.tabQuotes, href: '/quotes', icon: <BookOpen className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'projects', label: t.tabProjects, href: projectsHref, icon: <HeartHandshake className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'tools', label: t.tabTools, href: '/tools', icon: <Wrench className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'vorschlagen', label: proposalLabel, href: '/vorschlagen', icon: proposalIcon },
  ];
  const value =
    activeTab === 'service' || activeTab === 'arts'
      ? 'projects'
      : items.some((i) => i.value === activeTab)
      ? activeTab
      : null;

  return (
    <nav
      className="jy-tabbar-dock fixed left-0 right-0 z-40 flex items-center justify-center px-1.5 pointer-events-none md:hidden short:hidden print:hidden"
      data-compact={compact ? '' : undefined}
      aria-label={language === 'de' ? 'Navigation' : 'Navigation'}
    >
      <div ref={wrapRef} className="pointer-events-auto rounded-full max-w-[calc(100vw-12px)] overflow-hidden">
        <TabBar
          className="jy-mobile-tab-bar"
          items={items}
          value={value}
          onValueChange={(val) => selectWhenSettled(val === 'projects' ? (activeTab === 'arts' ? 'arts' : 'service') : (val as NavTab))}
          link={RouterLinkAdapter}
        />
      </div>
    </nav>
  );
};
