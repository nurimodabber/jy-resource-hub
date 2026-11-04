import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface FadedIconTileProps {
  title: string;
  sub?: string;
  Icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

// One tile shape for "Projekte & mehr", Werkzeuge and the Beitragen choices: a flat rectangle,
// the title bottom-left, a large icon faded into the top-right corner so the text runs over it.
// No icon frame, no category pill: the icon is decoration, the title carries the meaning.
export const FadedIconTile: React.FC<FadedIconTileProps> = ({ title, sub, Icon, to, onClick, selected, className = '' }) => {
  const cls = `group relative overflow-hidden flex flex-col justify-end text-left p-3.5 sm:p-4 min-h-[84px] sm:min-h-[96px] rounded-card bg-surface border transition-all duration-200 motion-reduce:transform-none hover:-translate-y-0.5 hover:shadow-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
    selected ? 'border-accent ring-1 ring-accent' : 'border-border/80'
  } ${className}`;
  const body = (
    <>
      <Icon
        className={`absolute top-1 right-1 w-14 h-14 sm:w-[72px] sm:h-[72px] transition-colors ${
          selected ? 'text-accent/25' : 'text-text-tertiary/20 group-hover:text-accent/25'
        }`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="relative block font-serif text-base sm:text-lg font-medium text-text tracking-tight leading-snug">{title}</span>
      {sub && <span className="relative block text-2xs sm:text-xs text-text-secondary mt-0.5 leading-snug">{sub}</span>}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={cls}>
      {body}
    </button>
  );
};
