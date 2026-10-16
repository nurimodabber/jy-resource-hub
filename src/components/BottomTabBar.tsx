import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Palette, Calendar, Layers, PlusCircle, type LucideIcon } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

export interface BottomTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab, language }) => {
  const t = UI_TRANSLATIONS[language];

  const tabs: {
    id: NavTab;
    label: string;
    ariaLabel: string;
    href: string;
    icon: LucideIcon;
  }[] = [
    { id: 'games', label: t.tabGames, ariaLabel: t.tabGames, href: '/games', icon: Compass },
    { id: 'quotes', label: t.tabQuotes, ariaLabel: t.tabQuotes, href: '/quotes', icon: BookOpen },
    { id: 'service-arts', label: t.tabServiceArtsShort, ariaLabel: t.tabServiceArts, href: '/service-arts', icon: Palette },
    { id: 'planner', label: t.tabPlanner, ariaLabel: t.tabPlanner, href: '/treffen', icon: Calendar },
    { id: 'tools', label: t.tabTools, ariaLabel: t.tabTools, href: '/tools', icon: Layers },
    { id: 'vorschlagen', label: t.tabProposalShort, ariaLabel: t.tabProposal, href: '/vorschlagen', icon: PlusCircle },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-line shadow-2 lg:hidden short:hidden safe-bottom print:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.href}
              onClick={() => onSelectTab(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 select-none transition-colors group focus-visible:ring-2 focus-visible:ring-accent rounded-control"
            >
              <div
                className={`flex items-center justify-center px-2 py-0.5 rounded-full transition-colors duration-150 ease-out ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary group-hover:text-text'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.75} />
              </div>
              <span
                className={`text-[11px] whitespace-nowrap text-center mt-0.5 tracking-tight ${
                  isActive ? 'text-accent font-bold' : 'text-text-secondary font-medium'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
