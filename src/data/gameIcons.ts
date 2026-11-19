import type React from 'react';
import { GameFallbackIcon } from './pictograms';
import { LOGO_GAME_ICONS } from './pictogramsLogo';

type GameIcon = React.ComponentType<{ className?: string; strokeWidth?: number | string }>;

/**
 * Ein Icon pro Spiel, getrennt von games.ts, damit die Spieldaten (und ihre stabilen IDs) unberührt bleiben.
 * Darstellung in einer neutralen Kachel (GameIconTile); nur der Gegenstand im Icon ist Logo-Gold.
 * Neue Spiele ohne Eintrag bekommen den Würfel (GameFallbackIcon).
 */
export const GAME_ICONS: Record<string, GameIcon> = LOGO_GAME_ICONS;

export const getGameIcon = (id: string): GameIcon => GAME_ICONS[id] ?? GameFallbackIcon;
