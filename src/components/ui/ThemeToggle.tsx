import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Hell / Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Dunkel / Dark', icon: <Moon className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Darstellungsmodus / Theme mode"
      className={`inline-flex items-center p-0.5 bg-surface-2 rounded-full border border-border-subtle ${className}`}
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
            className={`p-1.5 rounded-full transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
              isActive
                ? 'bg-surface text-text shadow-apple-pill font-medium'
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
