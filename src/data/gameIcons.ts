import type React from 'react';
import {
  Activity, ArrowUp10, ArrowUpFromLine, Brain, Crown, Eye, Gamepad2,
  Grid3x3, Hand, Hash, Megaphone, MessageSquareText, Route, Salad, Scissors,
  Square, Swords, VenetianMask, Waves, Zap,
} from 'lucide-react';
import {
  BallKeepUpIcon, BlanketFlipIcon, HeliumStickIcon, IceFloeIcon, KnotIcon, MinefieldIcon, ShrinkingIslandIcon,
  SilentLineIcon, WerewolfIcon, WhoAmIIcon,
} from './gamePictograms';

type GameIcon = React.ComponentType<{ className?: string; strokeWidth?: number | string }>;

/**
 * Ein Icon pro Spiel, getrennt von games.ts, damit die Spieldaten (und ihre stabilen IDs) unberührt bleiben.
 * Darstellung immer einfarbig in einer neutralen Kachel (GameIconTile), nie farbcodiert.
 * Neue Spiele ohne Eintrag bekommen das neutrale Gamepad-Icon.
 */
export const GAME_ICONS: Record<string, GameIcon> = {
  'menschlicher-knoten': KnotIcon,
  'gemeinsam-zaehlen': Hash,
  minenfeld: MinefieldIcon,
  'ein-wort-geschichte': MessageSquareText,
  'helium-stick': HeliumStickIcon,
  'stand-up-ruecken': ArrowUpFromLine,
  'stumme-reihe': SilentLineIcon,
  'eisschollen-rettung': IceFloeIcon,
  'lebender-balltransport': Route,
  'blindes-quadrat': Square,
  'decke-wenden': BlanketFlipIcon,
  '100-schlaege-ball': BallKeepUpIcon,
  'blindes-zahlen-sortieren': ArrowUp10,
  'elektrischer-zaun': Zap,
  saeuresee: Waves,
  'stille-matrix': Grid3x3,
  'schrumpfende-insel': ShrinkingIslandIcon,
  'ssp-evolution': Scissors,
  'impuls-kreis': Activity,
  'wer-bin-ich': WhoAmIIcon,
  werwolf: WerewolfIcon,
  spion: VenetianMask,
  psychiater: Brain,
  empire: Crown,
  'schlafmuetze-moerder': Eye,
  'ssp-showdown': Megaphone,
  'salad-bowl': Salad,
  'hi-ha-ho': Hand,
  ninja: Swords,
};

export const getGameIcon = (id: string): GameIcon => GAME_ICONS[id] ?? Gamepad2;
