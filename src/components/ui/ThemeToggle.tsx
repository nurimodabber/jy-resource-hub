import React from 'react';
import { uiText } from './closeLabel';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Hell / Light', icon: <Sun className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'dark', label: 'Dunkel / Dark', icon: <Moon className="w-4 h-4" strokeWidth={1.75} /> },
  ];

  return (
    <div
      role="group"
      aria-label={uiText('Darstellungsmodus', 'Theme mode')}
      className={`inline-flex items-center p-1 bg-surface-2 rounded-control border-0 ${className}`}
    >
      {options.map((opt) => {
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isActive}
            title={opt.label}
            onClick={() => setTheme(opt.id)}
            className={`p-2 rounded-control transition-colors duration-150 ease-out outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
              isActive
                ? 'bg-surface text-text shadow-1 font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {opt.icon}
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
