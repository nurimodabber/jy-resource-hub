import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabBar } from 'glisse';
import { Compass, BookOpen, HeartHandshake, Wrench, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

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
  const navigate = useNavigate();

  // Vier Tabs statt sechs: Dienst und Kunst teilen sich „Projekte“ (Umschalter oben auf der Seite),
  // „Beitragen“ ist der runde Plus-Knopf rechts daneben.
  const projectsHref = activeTab === 'arts' ? '/arts' : '/service';
  const items = [
    { value: 'games', label: t.tabGames, href: '/games', icon: <Compass className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'quotes', label: t.tabQuotes, href: '/quotes', icon: <BookOpen className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'projects', label: t.tabProjects, href: projectsHref, icon: <HeartHandshake className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'tools', label: t.tabTools, href: '/tools', icon: <Wrench className="w-5 h-5" strokeWidth={1.75} /> },
  ];
  const value =
    activeTab === 'service' || activeTab === 'arts'
      ? 'projects'
      : items.some((i) => i.value === activeTab)
      ? activeTab
      : null;

  return (
    <nav
      className="jy-tabbar-dock fixed left-0 right-0 z-40 flex items-center justify-center gap-2 px-1.5 pointer-events-none md:hidden short:hidden print:hidden"
      aria-label={language === 'de' ? 'Navigation' : 'Navigation'}
    >
      <div className="pointer-events-auto rounded-full max-w-[calc(100vw-72px)] overflow-hidden">
        <TabBar
          className="jy-mobile-tab-bar"
          items={items}
          value={value}
          onValueChange={(val) => onSelectTab(val === 'projects' ? (activeTab === 'arts' ? 'arts' : 'service') : (val as NavTab))}
          link={RouterLinkAdapter}
        />
      </div>
      <Button
        variant="glass"
        onClick={() => navigate('/vorschlagen')}
        icon={<Plus className="w-6 h-6" strokeWidth={2} />}
        aria-label={language === 'de' ? 'Beitragen: Idee einreichen' : 'Contribute: share an idea'}
        title={t.tabProposalShort}
        aria-current={activeTab === 'vorschlagen' ? 'page' : undefined}
        className="jy-tabbar-plus pointer-events-auto shrink-0"
      />
    </nav>
  );
};
