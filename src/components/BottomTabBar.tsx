import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TabBar } from 'glisse';
import { Compass, BookOpen, HeartHandshake, Wrench, Plus } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useContributionAttention } from './MyContributions';
import { tr } from './tools/common';

export interface BottomTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
}

const RouterLinkAdapter = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }
>(({ href, children, ...rest }, ref) => (
  <Link ref={ref} to={href || '/'} {...rest}>
    {children}
  </Link>
));
RouterLinkAdapter.displayName = 'RouterLinkAdapter';

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab, language }) => {
  const t = UI_TRANSLATIONS[language];
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
    { value: 'games', label: t.tabGames, href: '/games', icon: <Compass className="w-5 h-5" strokeWidth={1.75} /> },
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
      <div className="pointer-events-auto rounded-full max-w-[calc(100vw-12px)] overflow-hidden">
        <TabBar
          className="jy-mobile-tab-bar"
          items={items}
          value={value}
          onValueChange={(val) => onSelectTab(val === 'projects' ? (activeTab === 'arts' ? 'arts' : 'service') : (val as NavTab))}
          link={RouterLinkAdapter}
        />
      </div>
    </nav>
  );
};
