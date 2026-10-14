import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Clock, Layers, Menu } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

export interface BottomTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMore: () => void;
  language: Language;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab, onOpenMore, language }) => {
  const t = UI_TRANSLATIONS[language];

  const tabs: { id: NavTab; label: string; href: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'games', label: t.tabGames, href: '/games', icon: Compass },
    { id: 'quotes', label: t.tabQuotes, href: '/quotes', icon: BookOpen },
    { id: 'planner', label: t.tabPlanner, href: '/planner', icon: Clock },
    { id: 'tools', label: t.tabTools, href: '/tools', icon: Layers },
  ];

  const isMoreActive = ['service-arts', 'saved', 'impressum', 'datenschutz'].includes(activeTab);

  const base = 'flex-1 relative flex flex-col items-center justify-center gap-1 min-h-[56px] text-2xs transition-colors';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border lg:hidden short:hidden safe-bottom print:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.href}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`${base} ${isActive ? 'text-accent-text font-semibold' : 'text-text-secondary'}`}
            >
              {isActive && <span className="absolute top-0 left-4 right-4 h-0.5 bg-accent" />}
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMore}
          className={`${base} ${isMoreActive ? 'text-accent-text font-semibold' : 'text-text-secondary'}`}
        >
          {isMoreActive && <span className="absolute top-0 left-4 right-4 h-0.5 bg-accent" />}
          <Menu className="w-5 h-5" />
          <span>{t.tabMore}</span>
        </button>
      </div>
    </nav>
  );
};
