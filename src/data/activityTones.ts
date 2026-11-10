import type React from 'react';
import type { ActivityItem } from '../types';
import {
  ChildrenIcon, CreativeIcon, DramaIcon, EnvironmentIcon, GenerationsIcon, InstitutionIcon, MuralIcon, MusicIcon,
  NeighborhoodIcon, PaletteIcon, ServiceFallbackIcon,
} from './pictograms';

type ToneIcon = React.ComponentType<{ className?: string; strokeWidth?: number | string }>;

export type Tone = 'green' | 'teal' | 'blue' | 'violet' | 'rose' | 'ochre';

/** Ein Ton + ein Icon je Dienst-Bereich bzw. Kunstform. Farben stehen als CSS-Variablen in index.css (.tone-*). */
const SERVICE: Record<string, { tone: Tone; icon: ToneIcon }> = {
  environmental: { tone: 'green', icon: EnvironmentIcon },
  neighborhood: { tone: 'blue', icon: NeighborhoodIcon },
  intergenerational: { tone: 'ochre', icon: GenerationsIcon },
  children: { tone: 'rose', icon: ChildrenIcon },
  institutional: { tone: 'violet', icon: InstitutionIcon },
  creative: { tone: 'teal', icon: CreativeIcon },
};

const ARTS: Record<string, { tone: Tone; icon: ToneIcon }> = {
  drama: { tone: 'rose', icon: DramaIcon },
  music_poetry: { tone: 'violet', icon: MusicIcon },
  visual_arts: { tone: 'teal', icon: PaletteIcon },
  collaborative_mural: { tone: 'ochre', icon: MuralIcon },
};

export const activityTone = (a: ActivityItem): { tone: Tone; icon: ToneIcon } =>
  (a.kind === 'dienst' ? SERVICE[a.category] : ARTS[a.artForm]) ?? { tone: 'blue', icon: a.kind === 'dienst' ? ServiceFallbackIcon : PaletteIcon };
