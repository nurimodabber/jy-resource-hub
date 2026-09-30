import React from 'react';
import { Home, Compass, BookOpen, Clock, Menu } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { Logo } from './Logo';

export interface LeftNavigationRailProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMore: () => void;
  language: Language;
}

export const LeftNavigationRail: React.FC<LeftNavigationRailProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];

  const items = [
    {
      id: 'home',
      label: t.tabHome || 'Start',
      icon: Home,
      onClick: () => onSelectTab('home'),
      isActive: activeTab === 'home',
    },
    {
      id: 'games',
      label: t.tabGames,
      icon: Compass,
      onClick: () => onSelectTab('games'),
      isActive: activeTab === 'games',
    },
    {
      id: 'quotes',
      label: t.tabQuotes,
      icon: BookOpen,
      onClick: () => onSelectTab('quotes'),
      isActive: activeTab === 'quotes',
    },
    {
      id: 'planner',
      label: t.tabPlanner,
      icon: Clock,
      onClick: () => onSelectTab('planner'),
      isActive: activeTab === 'planner',
    },
    {
      id: 'more',
      label: t.tabMore || 'Mehr',
      icon: Menu,
      onClick: onOpenMore,
      isActive: activeTab === 'service-arts' || activeTab === 'tools' || activeTab === 'impressum' || activeTab === 'datenschutz',
    },
  ];

  return (
    <aside
      className="short-nav-rail hidden short:flex fixed left-0 top-0 bottom-0 w-14 z-50 bg-surface/95 dark:bg-surface/95 backdrop-blur-xl border-r border-border-subtle flex-col items-center justify-between py-2 safe-left print:hidden"
      role="navigation"
      aria-label="Kompakt-Navigation (Querformat)"
    >
      {/* Mini Logo */}
      <button
        onClick={() => onSelectTab('home')}
        className="w-10 h-10 rounded-xl bg-surface-2 hover:bg-surface-raised flex items-center justify-center p-1 border border-border-subtle transition-transform active:scale-95"
        title={t.siteTitle}
        aria-label={t.siteTitle}
      >
        <Logo className="w-6 h-6" />
      </button>

      {/* Nav Items */}
      <div className="flex flex-col items-center gap-1.5 my-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              title={item.label}
              aria-label={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all outline-hidden active:scale-90 ${
                item.isActive
                  ? 'bg-accent text-accent-contrast shadow-apple-pill font-semibold'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Bottom spacer / indicator */}
      <div className="w-6 h-1 rounded-full bg-border-subtle/50" />
    </aside>
  );
};
