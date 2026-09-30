import React from 'react';
import { Home, Compass, BookOpen, Clock, Menu } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

export interface BottomTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMore: () => void;
  language: Language;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];

  const tabs: {
    id: NavTab | 'more';
    label: string;
    icon: React.FC<{ className?: string }>;
    onClick: () => void;
    isActive: boolean;
  }[] = [
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 dark:bg-surface/95 backdrop-blur-xl border-t border-border-subtle md:hidden short:hidden safe-bottom print:hidden transition-all"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all outline-hidden active:scale-95 ${
                tab.isActive
                  ? 'text-accent font-semibold'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
              aria-current={tab.isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${tab.isActive ? 'scale-110' : ''}`} />
                {tab.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </div>
              <span className="text-2xs mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
