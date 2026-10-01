import React from 'react';
import { Link } from 'react-router-dom';
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

  const primaryTabs: {
    id: NavTab;
    label: string;
    href: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'home',
      label: t.tabHome || 'Start',
      href: '/',
      icon: Home,
    },
    {
      id: 'games',
      label: t.tabGames,
      href: '/games',
      icon: Compass,
    },
    {
      id: 'quotes',
      label: t.tabQuotes,
      href: '/quotes',
      icon: BookOpen,
    },
    {
      id: 'planner',
      label: t.tabPlanner,
      href: '/planner',
      icon: Clock,
    },
  ];

  const isMoreActive =
    activeTab === 'service-arts' ||
    activeTab === 'tools' ||
    activeTab === 'impressum' ||
    activeTab === 'datenschutz';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-md lg:hidden short:hidden safe-bottom print:hidden transition-all"
      role="navigation"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.href}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] min-w-[44px] transition-colors outline-hidden ${
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-accent" />
                )}
              </div>
              <span className="text-2xs mt-1 tracking-tight leading-none whitespace-nowrap">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] min-w-[44px] transition-colors outline-hidden ${
            isMoreActive
              ? 'text-accent font-semibold'
              : 'text-text-secondary hover:text-text'
          }`}
          aria-label={t.tabMore || 'Mehr'}
          aria-expanded={isMoreActive}
        >
          <div className="relative flex items-center justify-center">
            <Menu className={`w-5 h-5 transition-transform ${isMoreActive ? 'scale-110' : ''}`} />
            {isMoreActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-accent" />
            )}
          </div>
          <span className="text-2xs mt-1 tracking-tight leading-none whitespace-nowrap">
            {t.tabMore || 'Mehr'}
          </span>
        </button>
      </div>
    </nav>
  );
};
