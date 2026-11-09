import React from 'react';

/**
 * Kleine, ruhige Icon-Kachel links vom Titel. Standard: neutral (surface-2, text-secondary).
 * `toneClass` setzt für Dienst/Kunst die gedämpfte Kategorie-Farbe (Hintergrund + Icon), sonst nichts.
 */
export const IconTile: React.FC<{
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  size?: 'sm' | 'md' | 'lg';
  toneClass?: string;
  className?: string;
}> = ({ icon: Icon, size = 'md', toneClass = 'bg-surface-2 text-text-secondary', className = '' }) => {
  const box = size === 'lg' ? 'w-12 h-12 rounded-control' : size === 'sm' ? 'w-8 h-8 rounded-[10px]' : 'w-10 h-10 rounded-[12px]';
  const glyph = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${box} ${toneClass} ${className}`} aria-hidden="true">
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
};
