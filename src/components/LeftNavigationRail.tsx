import React from 'react';
import { Home, Compass, BookOpen, Clock, Layers, Menu } from 'lucide-react';
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
    { id: 'home', label: t.tabHome, icon: Home, onClick: () => onSelectTab('home'), isActive: activeTab === 'home' },
    { id: 'games', label: t.tabGames, icon: Compass, onClick: () => onSelectTab('games'), isActive: activeTab === 'games' },
    { id: 'quotes', label: t.tabQuotes, icon: BookOpen, onClick: () => onSelectTab('quotes'), isActive: activeTab === 'quotes' },
    { id: 'planner', label: t.tabPlanner, icon: Clock, onClick: () => onSelectTab('planner'), isActive: activeTab === 'planner' },
    { id: 'tools', label: t.tabTools, icon: Layers, onClick: () => onSelectTab('tools'), isActive: activeTab === 'tools' },
    {
      id: 'more',
      label: t.tabMore,
      icon: Menu,
      onClick: onOpenMore,
      isActive: ['service-arts', 'saved', 'impressum', 'datenschutz'].includes(activeTab),
    },
  ];

  return (
    <aside
      className="short-nav-rail hidden short:flex fixed left-0 top-0 bottom-0 w-14 z-50 bg-surface border-r border-border flex-col items-center justify-between py-2 safe-left print:hidden"
      role="navigation"
      aria-label="Navigation"
    >
      <button
        onClick={() => onSelectTab('home')}
        className="w-10 h-10 rounded-xl flex items-center justify-center p-1"
        title={t.siteTitle}
        aria-label={t.siteTitle}
      >
        <Logo className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center gap-1 my-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              title={item.label}
              aria-label={item.label}
              aria-current={item.isActive ? 'page' : undefined}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                item.isActive ? 'bg-accent-subtle text-accent-text' : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      <div className="h-6" />
    </aside>
  );
};
