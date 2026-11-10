import React from 'react';

/**
 * Kleine, ruhige Icon-Kachel links vom Titel. Standard: neutral (surface-2, text-secondary).
 * `toneClass` setzt für Dienst/Kunst die gedämpfte Kategorie-Farbe (Hintergrund + Icon), sonst nichts.
 */
export const IconTile: React.FC<{
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  toneClass?: string;
  className?: string;
}> = ({ icon: Icon, size = 'md', toneClass = 'bg-surface-2 text-text-secondary', className = '' }) => {
  // xl = Karten/Detailseiten mit Inhalts-Piktogrammen: Icon füllt etwa zwei Drittel der Kachel.
  const box =
    size === 'xl'
      ? 'w-12 h-12 sm:w-14 sm:h-14 rounded-control sm:rounded-[16px]'
      : size === 'lg'
      ? 'w-12 h-12 rounded-control'
      : size === 'sm'
      ? 'w-8 h-8 rounded-[10px]'
      : 'w-10 h-10 rounded-[12px]';
  const glyph =
    size === 'xl' ? 'w-8 h-8 sm:w-9 sm:h-9' : size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${box} ${toneClass} ${className}`} aria-hidden="true">
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
};
