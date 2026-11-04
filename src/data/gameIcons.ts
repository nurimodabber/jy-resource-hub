import type { LucideIcon } from 'lucide-react';
import {
  Activity, ArrowDownNarrowWide, ArrowUp10, ArrowUpFromLine, Bomb, Brain, Crown, Eye, FlipVertical2, Gamepad2,
  Grid3x3, Hand, Hash, Infinity as InfinityIcon, Megaphone, MessageSquareText, Moon, Route, Ruler, Salad, Scissors,
  Shrink, Snowflake, Square, Swords, UserRoundSearch, VenetianMask, Volleyball, Waves, Zap,
} from 'lucide-react';

/**
 * Ein Icon pro Spiel, getrennt von games.ts, damit die Spieldaten (und ihre stabilen IDs) unberührt bleiben.
 * Darstellung immer einfarbig in einer neutralen Kachel (GameIconTile), nie farbcodiert.
 * Neue Spiele ohne Eintrag bekommen das neutrale Gamepad-Icon.
 */
export const GAME_ICONS: Record<string, LucideIcon> = {
  'menschlicher-knoten': InfinityIcon,
  'gemeinsam-zaehlen': Hash,
  minenfeld: Bomb,
  'ein-wort-geschichte': MessageSquareText,
  'helium-stick': Ruler,
  'stand-up-ruecken': ArrowUpFromLine,
  'stumme-reihe': ArrowDownNarrowWide,
  'eisschollen-rettung': Snowflake,
  'lebender-balltransport': Route,
  'blindes-quadrat': Square,
  'decke-wenden': FlipVertical2,
  '100-schlaege-ball': Volleyball,
  'blindes-zahlen-sortieren': ArrowUp10,
  'elektrischer-zaun': Zap,
  saeuresee: Waves,
  'stille-matrix': Grid3x3,
  'schrumpfende-insel': Shrink,
  'ssp-evolution': Scissors,
  'impuls-kreis': Activity,
  'wer-bin-ich': UserRoundSearch,
  werwolf: Moon,
  spion: VenetianMask,
  psychiater: Brain,
  empire: Crown,
  'schlafmuetze-moerder': Eye,
  'ssp-showdown': Megaphone,
  'salad-bowl': Salad,
  'hi-ha-ho': Hand,
  ninja: Swords,
};

export const getGameIcon = (id: string): LucideIcon => GAME_ICONS[id] ?? Gamepad2;
