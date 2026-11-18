import type React from 'react';
import {
  BackToBackIcon, BallKeepUpIcon, BallRunIcon, BlanketFlipIcon, BlindSquareIcon, ChopIcon, ClapCircleIcon, CountTogetherIcon, ElectricFenceIcon, EmpireIcon, EvolutionIcon, HeliumStickIcon, IceFloeIcon, InvestigatorIcon, KnotIcon, MinefieldIcon, NinjaIcon, NumberLineIcon, SaladBowlIcon, ShowdownIcon, SilentLineIcon, SpyIcon, StoryCircleIcon, WerewolfIcon, WhoAmIIcon,
  GameFallbackIcon,
} from './pictograms';
import { PROPOSED_GAME_ICONS } from './pictogramsProposal';

type GameIcon = React.ComponentType<{ className?: string; strokeWidth?: number | string }>;

/**
 * Ein Icon pro Spiel, getrennt von games.ts, damit die Spieldaten (und ihre stabilen IDs) unberührt bleiben.
 * Darstellung immer einfarbig in einer neutralen Kachel (GameIconTile), nie farbcodiert.
 * Neue Spiele ohne Eintrag bekommen den Würfel (GameFallbackIcon).
 */
export const GAME_ICONS: Record<string, GameIcon> = {
  'menschlicher-knoten': KnotIcon,
  'gemeinsam-zaehlen': CountTogetherIcon,
  minenfeld: MinefieldIcon,
  'ein-wort-geschichte': StoryCircleIcon,
  'helium-stick': HeliumStickIcon,
  'stand-up-ruecken': BackToBackIcon,
  'stumme-reihe': SilentLineIcon,
  'eisschollen-rettung': IceFloeIcon,
  'lebender-balltransport': BallRunIcon,
  'blindes-quadrat': BlindSquareIcon,
  'decke-wenden': BlanketFlipIcon,
  '100-schlaege-ball': BallKeepUpIcon,
  'blindes-zahlen-sortieren': NumberLineIcon,
  'elektrischer-zaun': ElectricFenceIcon,
  'ssp-evolution': EvolutionIcon,
  'impuls-kreis': ClapCircleIcon,
  'wer-bin-ich': WhoAmIIcon,
  werwolf: WerewolfIcon,
  spion: SpyIcon,
  psychiater: InvestigatorIcon,
  empire: EmpireIcon,
  'ssp-showdown': ShowdownIcon,
  'salad-bowl': SaladBowlIcon,
  'hi-ha-ho': ChopIcon,
  ninja: NinjaIcon,
  ...PROPOSED_GAME_ICONS,
};

export const getGameIcon = (id: string): GameIcon => GAME_ICONS[id] ?? GameFallbackIcon;
