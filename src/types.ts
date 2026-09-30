export type Language = 'de' | 'en';

export type GameCategory = 'cooperative' | 'competitive' | 'social_deduction' | 'energizer';
export type EnergyLevel = 'high' | 'medium' | 'calm';
export type PrepLevel = 'instant' | 'low_prep' | 'materials_needed';

export interface LocalizedString {
  de: string;
  en: string;
}

export interface LocalizedArray {
  de: string[];
  en: string[];
}

export interface Game {
  id: string;
  title: LocalizedString;
  category: GameCategory;
  energyLevel: EnergyLevel;
  groupSize: {
    min: number;
    max: number;
  };
  prepLevel: PrepLevel;
  materials: LocalizedArray;
  durationMinutes: string;
  space: LocalizedString;
  summary: LocalizedString;
  idea: LocalizedString;
  rules: LocalizedArray;
  animatorTips: LocalizedArray;
  isFavoriteDefault?: boolean;
}

export type QuotePhase = 1 | 2 | 3;
export type QuoteModality = 'movement' | 'rhythm' | 'visual' | 'focus';

export interface MethodStep {
  name: LocalizedString;
  description: LocalizedString;
}

export interface QuoteMethod {
  id: string;
  name: LocalizedString;
  phase: QuotePhase;
  modality: QuoteModality;
  materials: LocalizedArray;
  durationMinutes: string;
  space?: LocalizedString;
  summary: LocalizedString;
  idea: LocalizedString;
  steps: MethodStep[];
  successCriteria: LocalizedString;
  resetRule?: LocalizedString;
  whyItWorks: LocalizedString;
  animatorTips: LocalizedArray;
}

export type QuoteGeneralTopic = 
  | 'einheit' 
  | 'wahrhaftigkeit' 
  | 'dienst' 
  | 'gerechtigkeit' 
  | 'verstand' 
  | 'seele' 
  | 'freude' 
  | 'gebet';

export interface QuoteItem {
  id: string;
  source: LocalizedString;
  book: LocalizedString;
  mainBook?: LocalizedString;
  section?: LocalizedString;
  generalTopic?: QuoteGeneralTopic;
  theme: LocalizedString;
  textDe: string;
  textEn: string;
  keywords: string[];
}

export interface EmpirePromptCategory {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  exampleAnswers: LocalizedArray;
}

export interface DiscussionCard {
  id: string;
  title: LocalizedString;
  quoteSnippet: LocalizedString;
  coreQuestion: LocalizedString;
  deepeningQuestions: LocalizedArray;
  theme: LocalizedString;
}

export interface CampBestPractice {
  id: string;
  title: LocalizedString;
  area: LocalizedString;
  keyInsights: LocalizedArray;
  quoteOrMotto: LocalizedString;
}

export interface EmpirePlayer {
  id: string;
  alias: string;
  kingName?: string;
  isEliminated: boolean;
}

export type NavTab = 'games' | 'quotes' | 'planner' | 'service-arts' | 'tools';

export interface DevotionalSong {
  id: string;
  title: LocalizedString;
  theme: LocalizedString;
  bahaiSongsUrl: string;
  key?: string;
}

export interface DevotionalItem {
  id: string;
  type: 'prayer' | 'song' | 'reading' | 'reflection';
  title: LocalizedString;
  content: LocalizedString;
  source?: LocalizedString;
  songUrl?: string;
}

export type ServiceProjectCategory = 
  | 'neighborhood' 
  | 'environmental' 
  | 'intergenerational' 
  | 'children' 
  | 'institutional' 
  | 'creative';

export type ServiceProjectScope = 'quick' | 'medium' | 'deep';

export interface ServiceProject {
  id: string;
  title: LocalizedString;
  category: ServiceProjectCategory;
  scope: ServiceProjectScope;
  duration: LocalizedString;
  materials: LocalizedArray;
  objective: LocalizedString;
  steps: LocalizedArray;
  reflectionQuestions: LocalizedArray;
  animatorTips: LocalizedArray;
}

export type ArtForm = 'drama' | 'music_poetry' | 'visual_arts' | 'collaborative_mural';

export interface ArtsPrompt {
  id: string;
  title: LocalizedString;
  book: LocalizedString;
  artForm: ArtForm;
  theme: LocalizedString;
  description: LocalizedString;
  materials: LocalizedArray;
  guidingSteps: LocalizedArray;
  reflectionPrompts: LocalizedArray;
}

export type SessionSlotType = 'warmup' | 'devotional' | 'study' | 'arts_discussion' | 'service' | 'closing';

export interface SessionSlot {
  id: string;
  type: SessionSlotType;
  title: LocalizedString;
  durationMinutes: number;
  description: LocalizedString;
  materials?: LocalizedArray;
  tips?: LocalizedString;
  referenceId?: string;
  referenceType?: 'game' | 'quote' | 'method' | 'song' | 'service' | 'art';
}

export interface SessionPreset {
  id: string;
  title: LocalizedString;
  focus: LocalizedString;
  totalDuration: number;
  slots: SessionSlot[];
}

