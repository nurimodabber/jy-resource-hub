import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Clock, Zap, Compass, Dices, ArrowRight, BookOpen, 
  Bookmark, CheckCircle2, ChevronRight, Calendar 
} from 'lucide-react';
import { Language, Game, QuoteItem, NavTab } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { GameCard } from './GameCard';
import { Chip } from './ui/Chip';
import { usePlanner } from '../context/PlannerContext';

export interface HomeViewProps {
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
  onSelectGame: (game: Game) => void;
  onSelectQuoteToPractice: (quote: QuoteItem) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

type GroupFilter = 'small' | 'medium' | 'large' | null;
type TimeFilter = 'short' | 'medium' | 'long' | null;
type EnergyFilter = 'icebreaker' | 'calm' | 'active' | null;

interface QuickPickStorage {
  group: GroupFilter;
  time: TimeFilter;
  energy: EnergyFilter;
  noMaterials: boolean;
}

const STORAGE_KEY = 'jy_quick_pick_v2';

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigateTab,
  onSelectGame,
  onSelectQuoteToPractice,
  favorites,
  onToggleFavorite,
}) => {
  const t = UI_TRANSLATIONS[language];
  const { activePlan } = usePlanner();

  // Load last choice or start with nothing preselected
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).group ?? null;
    } catch {
      // Ignore localStorage errors
    }
    return null;
  });

  const [selectedTime, setSelectedTime] = useState<TimeFilter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).time ?? null;
    } catch {
      // Ignore localStorage errors
    }
    return null;
  });

  const [selectedEnergy, setSelectedEnergy] = useState<EnergyFilter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).energy ?? null;
    } catch {
      // Ignore localStorage errors
    }
    return null;
  });

  const [noMaterialsOnly, setNoMaterialsOnly] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return Boolean(JSON.parse(saved).noMaterials);
    } catch {
      // Ignore localStorage errors
    }
    return false;
  });

  // Persist choice to localStorage
  useEffect(() => {
    try {
      const state: QuickPickStorage = {
        group: selectedGroup,
        time: selectedTime,
        energy: selectedEnergy,
        noMaterials: noMaterialsOnly,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore localStorage errors
    }
  }, [selectedGroup, selectedTime, selectedEnergy, noMaterialsOnly]);

  const hasAnyFilter = selectedGroup !== null || selectedTime !== null || selectedEnergy !== null || noMaterialsOnly;

  // Filter games based on current selection
  const allMatchingGames = useMemo(() => {
    return GAMES_DATA.filter((g) => {
      if (selectedGroup === 'small' && g.groupSize.min > 8) return false;
      if (selectedGroup === 'medium' && (g.groupSize.max < 8 || g.groupSize.min > 16)) return false;
      if (selectedGroup === 'large' && g.groupSize.max < 16) return false;

      const dur = g.durationMinutes;
      if (selectedTime === 'short' && (dur.includes('30') || dur.includes('45') || dur.includes('60'))) return false;
      if (selectedTime === 'long' && (dur === '5' || dur === '5–10' || dur === '10')) return false;

      if (selectedEnergy === 'icebreaker' && (g.category !== 'social_deduction' && g.category !== 'cooperative')) return false;
      if (selectedEnergy === 'calm' && g.energyLevel !== 'calm') return false;
      if (selectedEnergy === 'active' && g.energyLevel === 'calm') return false;

      if (noMaterialsOnly && g.prepLevel !== 'instant') return false;

      return true;
    });
  }, [selectedGroup, selectedTime, selectedEnergy, noMaterialsOnly]);

  // Max 3 games for quick pick display
  const displayGames = useMemo(() => {
    if (hasAnyFilter) {
      return allMatchingGames.slice(0, 3);
    }
    // Default 3 popular versatile games when nothing is selected yet
    return GAMES_DATA.slice(0, 3);
  }, [allMatchingGames, hasAnyFilter]);

  // "Surprise Me" action
  const handleSurpriseMe = () => {
    const pool = allMatchingGames.length > 0 ? allMatchingGames : GAMES_DATA;
    const randomGame = pool[Math.floor(Math.random() * pool.length)];
    if (randomGame) {
      onSelectGame(randomGame);
    }
  };

  // Compact Quote of the day (canonical text)
  const featuredQuote = QUOTES_DATA[0];

  // Saved items from favorites
  const favoriteItems = useMemo(() => {
    return GAMES_DATA.filter((g) => favorites.includes(g.id));
  }, [favorites]);

  // Active plan metrics
  const planSlotCount = activePlan?.slots.length || 0;
  const planTotalDuration = activePlan?.slots.reduce((sum, s) => sum + s.durationMinutes, 0) || 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      
      {/* 1. "Schnell finden" Hero Section (Sans font, 1 primary action, no Denglish) */}
      <section className="bg-surface rounded-3xl border border-border p-5 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-text-secondary text-xs font-semibold mb-2.5">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>{language === 'de' ? 'Schnell finden' : 'Quick Pick'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight leading-tight">
            {t.homeHeroTitle}
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed truncate">
            {t.homeHeroSubtitle}
          </p>
        </div>

        {/* 3-Tap Selection Grid (Nothing preselected by default) */}
        <div className="mt-6 space-y-4 bg-surface-2 p-4 sm:p-5 rounded-2xl border border-border">
          
          {/* Row 1: Group Size */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary mb-2">
              <Users className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t.homeGroupSizeLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={selectedGroup === 'small'}
                onClick={() => setSelectedGroup(selectedGroup === 'small' ? null : 'small')}
              >
                {t.homeGroupSmall}
              </Chip>
              <Chip
                selected={selectedGroup === 'medium'}
                onClick={() => setSelectedGroup(selectedGroup === 'medium' ? null : 'medium')}
              >
                {t.homeGroupMedium}
              </Chip>
              <Chip
                selected={selectedGroup === 'large'}
                onClick={() => setSelectedGroup(selectedGroup === 'large' ? null : 'large')}
              >
                {t.homeGroupLarge}
              </Chip>
            </div>
          </div>

          {/* Row 2: Duration */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary mb-2">
              <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t.homeTimeLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={selectedTime === 'short'}
                onClick={() => setSelectedTime(selectedTime === 'short' ? null : 'short')}
              >
                {t.homeTimeShort}
              </Chip>
              <Chip
                selected={selectedTime === 'medium'}
                onClick={() => setSelectedTime(selectedTime === 'medium' ? null : 'medium')}
              >
                {t.homeTimeMedium}
              </Chip>
              <Chip
                selected={selectedTime === 'long'}
                onClick={() => setSelectedTime(selectedTime === 'long' ? null : 'long')}
              >
                {t.homeTimeLong}
              </Chip>
            </div>
          </div>

          {/* Row 3: Energy & Materials */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary mb-2">
              <Zap className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t.homeEnergyLabel}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap gap-2">
                <Chip
                  selected={selectedEnergy === 'icebreaker'}
                  onClick={() => setSelectedEnergy(selectedEnergy === 'icebreaker' ? null : 'icebreaker')}
                >
                  {t.homeEnergyIcebreaker}
                </Chip>
                <Chip
                  selected={selectedEnergy === 'calm'}
                  onClick={() => setSelectedEnergy(selectedEnergy === 'calm' ? null : 'calm')}
                >
                  {t.homeEnergyCalm}
                </Chip>
                <Chip
                  selected={selectedEnergy === 'active'}
                  onClick={() => setSelectedEnergy(selectedEnergy === 'active' ? null : 'active')}
                >
                  {t.homeEnergyActive}
                </Chip>
              </div>

              {/* No Materials Toggle */}
              <button
                type="button"
                onClick={() => setNoMaterialsOnly(!noMaterialsOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer min-h-[36px] ${
                  noMaterialsOnly 
                    ? 'bg-accent text-accent-contrast border-accent font-semibold' 
                    : 'bg-surface border-border text-text-secondary hover:text-text'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.homeNoMaterials}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Results Bar (Max 3 results + Alle passenden button) */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-text">
              {hasAnyFilter
                ? (language === 'de' ? `${allMatchingGames.length} passende Spiele` : `${allMatchingGames.length} matching games`)
                : (language === 'de' ? 'Vorschläge für heute' : 'Suggested for today')}
            </h2>

            <button
              type="button"
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer min-h-[36px]"
            >
              <Dices className="w-3.5 h-3.5 text-accent-text" />
              <span>{t.homeSurpriseMe}</span>
            </button>
          </div>

          {displayGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {displayGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  language={language}
                  isFavorite={favorites.includes(game.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={onSelectGame}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-surface-2 rounded-2xl border border-border">
              <p className="text-xs text-text-secondary">
                {t.homeNoMatches}
              </p>
            </div>
          )}

          {allMatchingGames.length > 3 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => onNavigateTab('games')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
              >
                <span>
                  {language === 'de' 
                    ? `Alle passenden (${allMatchingGames.length})`
                    : `Show all matches (${allMatchingGames.length})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. "Weiter mit deinem Plan" (Only if user has active plan slots) */}
      {planSlotCount > 0 && (
        <section className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary block">
                  {language === 'de' ? 'Aktiver Ablauf' : 'Active Plan'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-text">
                  {activePlan?.name}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {planSlotCount} {language === 'de' ? 'Aktivitäten' : 'activities'} · {planTotalDuration} Min.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('planner')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-semibold text-xs transition-colors cursor-pointer min-h-[40px] shrink-0"
            >
              <span>{language === 'de' ? 'Weiter mit deinem Plan' : 'Continue Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 3. "Gemerkt" (Favorites Strip, if user has saved favorites) */}
      {favoriteItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-accent fill-current" />
              <h3 className="text-base font-bold text-text">
                {t.savedItems} ({favoriteItems.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('games')}
              className="text-xs font-semibold text-accent-text hover:underline"
            >
              {language === 'de' ? 'Alle anzeigen' : 'View all'} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {favoriteItems.slice(0, 3).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                language={language}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectGame}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. "Zitat des Tages" (Compact reading card, links directly to reading view) */}
      <section className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-2 text-text-secondary text-2xs font-semibold">
              <BookOpen className="w-3 h-3 text-accent-text" />
              <span>{t.homeFeaturedQuoteTitle}</span>
            </div>
            <blockquote className="text-base sm:text-lg font-serif italic text-text leading-snug">
              „{language === 'de' ? featuredQuote.textDe : featuredQuote.textEn}“
            </blockquote>
            <p className="text-xs text-text-tertiary">
              — {featuredQuote.source[language]} • {featuredQuote.theme[language]}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectQuoteToPractice(featuredQuote)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px] shrink-0"
          >
            <span>{language === 'de' ? 'Zitat lesen & üben' : 'Read & Practice'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
        </div>
      </section>

    </div>
  );
};
