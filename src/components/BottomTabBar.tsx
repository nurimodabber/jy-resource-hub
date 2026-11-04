import React from 'react';
import { Link } from 'react-router-dom';
import { TabBar } from 'glisse';
import { Compass, BookOpen, HeartHandshake, Palette, Wrench, PlusCircle } from 'lucide-react';
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

  const items = [
    { value: 'games', label: t.tabGames, href: '/games', icon: <Compass className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'quotes', label: t.tabQuotes, href: '/quotes', icon: <BookOpen className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'service', label: t.tabServiceShort, href: '/service', icon: <HeartHandshake className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'arts', label: t.tabArtsShort, href: '/arts', icon: <Palette className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'tools', label: t.tabTools, href: '/tools', icon: <Wrench className="w-5 h-5" strokeWidth={1.75} /> },
    { value: 'vorschlagen', label: t.tabProposalShort, href: '/vorschlagen', icon: <PlusCircle className="w-5 h-5" strokeWidth={1.75} /> },
  ];

  return (
    <nav
      className="jy-tabbar-dock fixed left-0 right-0 z-40 flex justify-center px-1.5 pointer-events-none md:hidden short:hidden print:hidden overflow-hidden"
      aria-label={language === 'de' ? 'Navigation' : 'Navigation'}
    >
      <div className="pointer-events-auto rounded-full max-w-[calc(100vw-12px)] overflow-hidden">
        <TabBar
          className="jy-mobile-tab-bar"
          items={items}
          value={activeTab}
          onValueChange={(val) => onSelectTab(val as NavTab)}
          link={RouterLinkAdapter}
        />
      </div>
    </nav>
  );
};
