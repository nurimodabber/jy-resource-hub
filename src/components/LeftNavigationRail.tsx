import { Compass, BookOpen, Palette, Calendar, Layers, PlusCircle } from 'lucide-react';
import { NavTab, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { Logo } from './Logo';

export interface LeftNavigationRailProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
}

export const LeftNavigationRail: React.FC<LeftNavigationRailProps> = ({
  activeTab,
  onSelectTab,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];

  const items = [
    { id: 'games' as NavTab, label: t.tabGames, icon: Compass },
    { id: 'quotes' as NavTab, label: t.tabQuotes, icon: BookOpen },
    { id: 'service-arts' as NavTab, label: t.tabServiceArts, icon: Palette },
    { id: 'planner' as NavTab, label: t.tabPlanner, icon: Calendar },
    { id: 'tools' as NavTab, label: t.tabTools, icon: Layers },
    { id: 'vorschlagen' as NavTab, label: t.tabProposal, icon: PlusCircle },
  ];

  return (
    <aside
      className="short-nav-rail hidden short:flex fixed left-0 top-0 bottom-0 w-14 z-50 bg-surface border-r border-border flex-col items-center justify-between py-2 safe-left print:hidden"
      role="navigation"
      aria-label="Navigation"
    >
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className="w-10 h-10 rounded-control flex items-center justify-center p-1 hover:bg-surface-2 transition-colors duration-150 ease-out"
        title={t.siteTitle}
        aria-label={t.siteTitle}
      >
        <Logo className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center gap-1.5 my-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`w-10 h-10 rounded-control flex items-center justify-center transition-colors duration-150 ease-out ${
                isActive
                  ? 'bg-accent-subtle text-accent-text font-semibold'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.75} />
            </button>
          );
        })}
      </div>

      <div className="h-6" />
    </aside>
  );
};
