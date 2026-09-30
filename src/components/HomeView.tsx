import React, { useState, useMemo } from 'react';
import { 
  Users, Clock, Zap, Sparkles, Dices, ArrowRight, BookOpen, 
  Layers, Bookmark, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { Language, Game, QuoteItem, QuoteMethod, NavTab } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { GameCard } from './GameCard';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';

export interface HomeViewProps {
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
  onSelectGame: (game: Game) => void;
  onSelectQuoteToPractice: (quote: QuoteItem, method?: QuoteMethod) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

type GroupFilter = 'small' | 'medium' | 'large';
type TimeFilter = 'short' | 'medium' | 'long';
type EnergyFilter = 'icebreaker' | 'calm' | 'active';

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigateTab,
  onSelectGame,
  onSelectQuoteToPractice,
  favorites,
  onToggleFavorite,
}) => {
  const t = UI_TRANSLATIONS[language];

  // 3-Tap Quick Pick State
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>('medium');
  const [selectedTime, setSelectedTime] = useState<TimeFilter>('medium');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyFilter>('active');
  const [noMaterialsOnly, setNoMaterialsOnly] = useState<boolean>(true);

  // Compute matched games
  const matchedGames = useMemo(() => {
    return GAMES_DATA.filter(g => {
      // Group Size filter
      if (selectedGroup === 'small' && g.groupSize.min > 8) return false;
      if (selectedGroup === 'medium' && (g.groupSize.max < 8 || g.groupSize.min > 16)) return false;
      if (selectedGroup === 'large' && g.groupSize.max < 16) return false;

      // Time filter
      const dur = g.durationMinutes;
      if (selectedTime === 'short' && (dur.includes('30') || dur.includes('45') || dur.includes('60'))) return false;
      if (selectedTime === 'long' && (dur === '5' || dur === '5–10' || dur === '10')) return false;

      // Energy filter
      if (selectedEnergy === 'icebreaker' && (g.category !== 'social_deduction' && g.category !== 'cooperative')) return false;
      if (selectedEnergy === 'calm' && g.energyLevel !== 'calm') return false;
      if (selectedEnergy === 'active' && g.energyLevel === 'calm') return false;

      // Materials toggle
      if (noMaterialsOnly && g.prepLevel !== 'instant') return false;

      return true;
    }).slice(0, 3);
  }, [selectedGroup, selectedTime, selectedEnergy, noMaterialsOnly]);

  // Fallback games if 0 match
  const displayGames = matchedGames.length > 0 ? matchedGames : GAMES_DATA.slice(0, 3);

  // Random game ("Surprise Me")
  const handleSurpriseMe = () => {
    const pool = matchedGames.length > 0 ? matchedGames : GAMES_DATA;
    const randomGame = pool[Math.floor(Math.random() * pool.length)];
    if (randomGame) {
      onSelectGame(randomGame);
    }
  };

  // Featured Scripture Quote & Method pairing
  const featuredQuote = QUOTES_DATA[0]; // "O Sohn des Geistes! Mein erstes Gebot ist dies..."
  const featuredMethod = QUOTE_METHODS_DATA.find(m => m.id === 'die-verschwindende-tafel') || QUOTE_METHODS_DATA[0];

  // Saved Favorite Games (if any)
  const favoriteGames = useMemo(() => {
    return GAMES_DATA.filter(g => favorites.includes(g.id));
  }, [favorites]);

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-200">
      
      {/* Hero Section: "Was brauchst du heute?" */}
      <section className="relative overflow-hidden rounded-3xl bg-surface border border-border-subtle p-6 sm:p-10 shadow-apple-card">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'de' ? 'Blitz-Finder' : 'Quick Pick'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-text tracking-tight leading-tight">
            {t.homeHeroTitle}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
            {t.homeHeroSubtitle}
          </p>
        </div>

        {/* 3-Tap Selection Bar */}
        <div className="mt-8 space-y-5 bg-surface-2/60 p-4 sm:p-6 rounded-2xl border border-border-subtle">
          {/* Row 1: Gruppengröße */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>{t.homeGroupSizeLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={selectedGroup === 'small'}
                onClick={() => setSelectedGroup('small')}
              >
                {t.homeGroupSmall}
              </Chip>
              <Chip
                selected={selectedGroup === 'medium'}
                onClick={() => setSelectedGroup('medium')}
              >
                {t.homeGroupMedium}
              </Chip>
              <Chip
                selected={selectedGroup === 'large'}
                onClick={() => setSelectedGroup('large')}
              >
                {t.homeGroupLarge}
              </Chip>
            </div>
          </div>

          {/* Row 2: Zeitfenster */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{t.homeTimeLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={selectedTime === 'short'}
                onClick={() => setSelectedTime('short')}
              >
                {t.homeTimeShort}
              </Chip>
              <Chip
                selected={selectedTime === 'medium'}
                onClick={() => setSelectedTime('medium')}
              >
                {t.homeTimeMedium}
              </Chip>
              <Chip
                selected={selectedTime === 'long'}
                onClick={() => setSelectedTime('long')}
              >
                {t.homeTimeLong}
              </Chip>
            </div>
          </div>

          {/* Row 3: Energie & No-Materials Toggle */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.homeEnergyLabel}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Chip
                  selected={selectedEnergy === 'icebreaker'}
                  onClick={() => setSelectedEnergy('icebreaker')}
                >
                  {t.homeEnergyIcebreaker}
                </Chip>
                <Chip
                  selected={selectedEnergy === 'calm'}
                  onClick={() => setSelectedEnergy('calm')}
                >
                  {t.homeEnergyCalm}
                </Chip>
                <Chip
                  selected={selectedEnergy === 'active'}
                  onClick={() => setSelectedEnergy('active')}
                >
                  {t.homeEnergyActive}
                </Chip>
              </div>

              {/* Toggle No Materials */}
              <button
                type="button"
                onClick={() => setNoMaterialsOnly(!noMaterialsOnly)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                  noMaterialsOnly 
                    ? 'bg-accent/15 border-accent text-accent font-semibold shadow-2xs' 
                    : 'bg-surface border-border-subtle text-text-secondary hover:text-text'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${noMaterialsOnly ? 'text-accent' : 'text-text-tertiary'}`} />
                <span>{t.homeNoMaterials}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Pick Matches & Surprise Me */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              {t.homeMatchesFound} ({displayGames.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSurpriseMe}
              icon={<Dices className="w-4 h-4 text-accent" />}
              iconPosition="left"
            >
              {t.homeSurpriseMe}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {matchedGames.length === 0 && (
            <p className="text-xs text-text-tertiary text-center mt-3">
              {t.homeNoMatches}
            </p>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('games')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {t.homeExploreAllGames}
            </Button>
          </div>
        </div>
      </section>

      {/* Saved Favorites Strip (if user has any saved) */}
      {favoriteGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-accent fill-accent" />
              <h3 className="text-base font-semibold text-text">
                {t.homeRecentOrFavorites} ({favoriteGames.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('games')}
              className="text-xs text-accent hover:underline font-medium"
            >
              {t.filterAll} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favoriteGames.slice(0, 3).map((game) => (
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

      {/* Featured Scripture Quote with Matching Method */}
      <section className="relative overflow-hidden rounded-3xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-apple-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.homeFeaturedQuoteTitle}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-text leading-snug">
              „{language === 'de' ? featuredQuote.textDe : featuredQuote.textEn}“
            </h3>
            <p className="text-xs text-text-tertiary">
              — {featuredQuote.source[language]} • {featuredQuote.theme[language]}
            </p>
          </div>

          {/* Practice Method Pairing Card */}
          <div className="w-full md:w-72 shrink-0 bg-surface-2 p-4 rounded-2xl border border-border-subtle flex flex-col justify-between gap-3">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary block">
                {language === 'de' ? 'Empfohlene Methode' : 'Suggested Method'}
              </span>
              <h4 className="text-sm font-semibold text-text mt-1">
                {featuredMethod.name[language]}
              </h4>
              <p className="text-xs text-text-secondary mt-1 font-serif line-clamp-2">
                {featuredMethod.summary[language]}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSelectQuoteToPractice(featuredQuote, featuredMethod)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="w-full"
            >
              {t.homeTryMethod}
            </Button>
          </div>
        </div>
      </section>

      {/* Hub Navigation Hub: 4 Key Pillars */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary px-1">
          {language === 'de' ? 'Bereiche entdecken' : 'Explore Sections'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Games */}
          <div
            onClick={() => onNavigateTab('games')}
            className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-text group-hover:text-accent transition-colors">
                {t.tabGames}
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {language === 'de' ? '29 erprobte Spiele mit Regeln, Materialangaben & Tipps.' : '29 field-tested games with rules and leader tips.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent mt-4">
              <span>{t.homeExploreAllGames}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Quotes */}
          <div
            onClick={() => onNavigateTab('quotes')}
            className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-text group-hover:text-accent transition-colors">
                {t.tabQuotes}
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {language === 'de' ? '51 Zitate & 50 Lernmethoden mit interaktivem Tafel-Studio.' : '51 scripture quotes & 50 methods with interactive studio.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent mt-4">
              <span>{t.homeExploreAllQuotes}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Planner */}
          <div
            onClick={() => onNavigateTab('planner')}
            className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-accent flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-text group-hover:text-accent transition-colors">
                {t.tabPlanner}
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {language === 'de' ? 'Modulare Zeitleiste, Templates & WhatsApp-Export.' : 'Modular timeline, presets & WhatsApp agenda export.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent mt-4">
              <span>{t.homeExplorePlanner}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Tools */}
          <div
            onClick={() => onNavigateTab('tools')}
            className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-text group-hover:text-accent transition-colors">
                {t.tabTools}
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {language === 'de' ? 'Gruppenteiler, Countdown-Timer & Reflexionskarten.' : 'Team splitters, countdown timer & reflection cards.'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent mt-4">
              <span>{t.tabTools}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Banner */}
      <section className="p-6 rounded-3xl bg-surface-2 border border-border-subtle text-center">
        <p className="text-xs sm:text-sm font-medium text-text-secondary">
          {t.homeCommunityStats}
        </p>
      </section>
    </div>
  );
};
