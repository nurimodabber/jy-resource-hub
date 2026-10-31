import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, HeartHandshake, Palette, Wrench, PlusCircle, type LucideIcon } from 'lucide-react';
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
    { id: 'service', label: t.tabServiceShort, ariaLabel: t.tabService, href: '/service', icon: HeartHandshake },
    { id: 'arts', label: t.tabArtsShort, ariaLabel: t.tabArts, href: '/arts', icon: Palette },
    { id: 'tools', label: t.tabTools, ariaLabel: t.tabTools, href: '/tools', icon: Wrench },
    { id: 'vorschlagen', label: t.tabProposalShort, ariaLabel: t.tabProposal, href: '/vorschlagen', icon: PlusCircle },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-surface border-t border-line shadow-2 md:hidden short:hidden safe-bottom print:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1.5 items-center gap-0.5">
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
              className="relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 select-none transition-all group focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
            >
              {/* Liquid glass pill indicator around active tab */}
              <div
                className={`relative w-full py-1.5 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ease-out ${
                  isActive
                    ? 'bg-accent/15 dark:bg-accent/25 backdrop-blur-md border border-accent/35 dark:border-accent/45 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_2px_8px_rgba(var(--accent-rgb)/0.18)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),0_3px_10px_rgba(0,0,0,0.35)]'
                    : 'hover:bg-surface-2/40'
                }`}
              >
                {/* Specular glass reflection line at the top */}
                {isActive && (
                  <span
                    className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent pointer-events-none rounded-t-full"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-150 ${
                    isActive
                      ? 'text-accent scale-105 stroke-[2.3]'
                      : 'text-text-secondary group-hover:text-text stroke-[1.75]'
                  }`}
                />

                <span
                  className={`text-[10.5px] leading-tight truncate max-w-full text-center mt-0.5 tracking-tight transition-colors ${
                    isActive
                      ? 'text-accent font-bold'
                      : 'text-text-tertiary group-hover:text-text-secondary font-medium'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
