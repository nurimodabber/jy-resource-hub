import type { LucideIcon } from 'lucide-react';
import { Blocks, Brush, Drama, HandHeart, House, Landmark, Music, Paintbrush, Palette, Sprout } from 'lucide-react';
import type { ActivityItem, GamePurpose } from '../types';

export type Tone = 'green' | 'teal' | 'blue' | 'violet' | 'rose' | 'ochre';

/** KONZEPT: Spiele bekommen den Ton ihrer Wirkung, damit man die Art des Spiels schon an der Kachel erkennt. */
export const PURPOSE_TONE: Record<GamePurpose, Tone> = {
  kennenlernen: 'ochre',
  energie: 'rose',
  zusammenarbeit: 'blue',
  ruhe: 'teal',
  raten: 'violet',
};

/** Ein Ton + ein Icon je Dienst-Bereich bzw. Kunstform. Farben stehen als CSS-Variablen in index.css (.tone-*). */
const SERVICE: Record<string, { tone: Tone; icon: LucideIcon }> = {
  environmental: { tone: 'green', icon: Sprout },
  neighborhood: { tone: 'blue', icon: House },
  intergenerational: { tone: 'ochre', icon: HandHeart },
  children: { tone: 'rose', icon: Blocks },
  institutional: { tone: 'violet', icon: Landmark },
  creative: { tone: 'teal', icon: Paintbrush },
};

const ARTS: Record<string, { tone: Tone; icon: LucideIcon }> = {
  drama: { tone: 'rose', icon: Drama },
  music_poetry: { tone: 'violet', icon: Music },
  visual_arts: { tone: 'teal', icon: Palette },
  collaborative_mural: { tone: 'ochre', icon: Brush },
};

export const activityTone = (a: ActivityItem): { tone: Tone; icon: LucideIcon } =>
  (a.kind === 'dienst' ? SERVICE[a.category] : ARTS[a.artForm]) ?? { tone: 'blue', icon: a.kind === 'dienst' ? HandHeart : Palette };
