import React, { useRef, useState, useEffect, useCallback } from 'react';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<NavTab, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl && containerRef.current) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    setIsMounted(true);
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-surface border-t border-line shadow-2 md:hidden short:hidden safe-bottom print:hidden"
      aria-label="Mobile Navigation"
    >
      <div
        ref={containerRef}
        className="relative grid grid-cols-6 h-16 max-w-lg mx-auto px-1.5 items-center gap-0.5"
      >
        {/* Floating Sliding Liquid Glass Pill Indicator */}
        {indicator && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl sm:rounded-2xl bg-accent/15 dark:bg-accent/25 backdrop-blur-md border border-accent/35 dark:border-accent/45 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_2px_8px_rgba(var(--accent-rgb)/0.18)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),0_3px_10px_rgba(0,0,0,0.35)] transition-all duration-240 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none motion-reduce:transition-none"
            style={{
              transform: `translate3d(${indicator.left}px, 0, 0)`,
              width: `${indicator.width}px`,
            }}
          >
            {/* Specular glass reflection line at the top */}
            <span
              className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent pointer-events-none rounded-t-full"
              aria-hidden="true"
            />
          </div>
        )}

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              to={tab.href}
              onClick={() => onSelectTab(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className="relative z-10 flex flex-col items-center justify-center h-full min-h-[48px] py-1 select-none transition-transform duration-100 active:scale-90 motion-reduce:transform-none group focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
            >
              {/* Inner content wrapper (fallback static pill before mount) */}
              <div
                className={`relative w-full py-1.5 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 ${
                  !isMounted && isActive
                    ? 'bg-accent/15 dark:bg-accent/25 backdrop-blur-md border border-accent/35 dark:border-accent/45'
                    : 'hover:bg-surface-2/30'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-accent scale-105 stroke-[2.3]'
                      : 'text-text-secondary group-hover:text-text stroke-[1.75]'
                  }`}
                />

                <span
                  className={`text-[10.5px] leading-tight truncate max-w-full text-center mt-0.5 tracking-tight transition-colors duration-150 ${
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
