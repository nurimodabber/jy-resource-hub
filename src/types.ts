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

export type GamePurpose = 'kennenlernen' | 'energie' | 'zusammenarbeit' | 'ruhe' | 'raten';

export interface Game {
  id: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  category: GameCategory;
  energyLevel: EnergyLevel;
  purpose: GamePurpose;
  groupSize: {
    min: number;
    max: number;
  };
  prepLevel: PrepLevel;
  materials: LocalizedArray;
  durationMinutes: string;
  durationMin: number;
  durationMax: number;
  space: LocalizedString;
  summary: LocalizedString;
  idea: LocalizedString;
  rules: LocalizedArray;
  animatorTips: LocalizedArray;
  isFavoriteDefault?: boolean;
  status?: 'draft';
  submittedBy?: string;
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

export interface JuniorYouthBookMeta {
  id: string;
  order: number;
  title: LocalizedString;
  targetAge?: string;
  isOfficialJYBook: boolean;
  category: 'junior_youth' | 'animator_training' | 'devotional';
}

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
  source?: LocalizedString;
  book?: LocalizedString;
  coreQuestion: LocalizedString;
  deepeningQuestions: LocalizedArray;
  theme: LocalizedString;
  status?: 'draft';
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

export type NavTab = 'home' | 'games' | 'quotes' | 'service' | 'arts' | 'tools' | 'saved' | 'impressum' | 'datenschutz' | 'vorschlagen';

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

export type ActivityKind = 'dienst' | 'kunst';
export type ActivitySetting = 'drinnen' | 'draussen' | 'beides';
export type ActivityOccasion = 'treffen' | 'camp' | 'beides';

export interface ServiceProject {
  id: string;
  kind: 'dienst';
  title: LocalizedString;
  category: ServiceProjectCategory;
  theme?: LocalizedString;
  guidedBy?: LocalizedString;
  scope: ServiceProjectScope;
  duration: LocalizedString;
  durationMin: number;
  durationMax: number;
  groupSize: {
    min: number;
    max: number;
  };
  setting: ActivitySetting;
  occasion: ActivityOccasion;
  materials: LocalizedArray;
  objective: LocalizedString;
  steps: LocalizedArray;
  reflectionQuestions: LocalizedArray;
  animatorTips: LocalizedArray;
  imageUrl?: string;
  relatedBook?: string;
  lesson?: number;
  status?: 'draft';
  submittedBy?: string;
}

export type ArtForm = 'drama' | 'music_poetry' | 'visual_arts' | 'collaborative_mural';

export interface ArtsPrompt {
  id: string;
  kind: 'kunst';
  title: LocalizedString;
  book: LocalizedString;
  artForm: ArtForm;
  theme: LocalizedString;
  description: LocalizedString;
  durationMin: number;
  durationMax: number;
  duration: LocalizedString;
  groupSize: {
    min: number;
    max: number;
  };
  setting: ActivitySetting;
  occasion: ActivityOccasion;
  materials: LocalizedArray;
  guidingSteps: LocalizedArray;
  reflectionPrompts: LocalizedArray;
  animatorTips?: LocalizedArray;
  imageUrl?: string;
  relatedBook?: string;
  lesson?: number;
  status?: 'draft';
  submittedBy?: string;
}

export type ActivityItem = ServiceProject | ArtsPrompt;


