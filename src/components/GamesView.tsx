import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { GameCategory, EnergyLevel, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { GameCard } from './GameCard';
import { GamePage } from './GamePage';
import { EmptyState } from './ui/EmptyState';
import { UI_TRANSLATIONS } from '../data/translations';
import { chipCls } from './tools/common';
import { tr } from './tools/common';

interface GamesViewProps {
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ language, favorites, onToggleFavorite }) => {
  const { id } = useParams<{ id?: string }>();
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GameCategory | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [noMaterial, setNoMaterial] = useState(false);

  const game = id ? GAMES_DATA.find((g) => g.id === id) : undefined;

  const categories: { id: GameCategory; label: string }[] = [
    { id: 'cooperative', label: t.filterCooperative },
    { id: 'social_deduction', label: t.filterSocialDeduction },
    { id: 'competitive', label: t.filterCompetitive },
    { id: 'energizer', label: t.filterEnergizer },
  ];
  const energies: { id: EnergyLevel; label: string }[] = [
    { id: 'calm', label: t.filterCalmEnergy },
    { id: 'medium', label: t.filterMediumEnergy },
    { id: 'high', label: t.filterHighEnergy },
  ];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES_DATA.filter((g) => {
      if (category && g.category !== category) return false;
      if (energy && g.energyLevel !== energy) return false;
      if (noMaterial && g.prepLevel === 'materials_needed') return false;
      if (q) {
        const hay = `${g.title[language]} ${g.summary[language]} ${g.idea[language]}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, category, energy, noMaterial, language]);

  if (id) {
    if (!game) {
      return <EmptyState title={L('Spiel nicht gefunden', 'Game not found')} description={L('Dieses Spiel gibt es nicht.', 'This game does not exist.')} />;
    }
    return <GamePage game={game} language={language} isFavorite={favorites.includes(game.id)} onToggleFavorite={onToggleFavorite} />;
  }

  const active = category || energy || noMaterial || query;
  const reset = () => {
    setCategory(null);
    setEnergy(null);
    setNoMaterial(false);
    setQuery('');
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">{t.tabGames}</h1>
        <p className="text-sm text-text-secondary mt-1 tabular-nums">
          {L(`${GAMES_DATA.length} Spiele mit Regeln und Tipps für Animatoren.`, `${GAMES_DATA.length} games with rules and tips for animators.`)}
        </p>
      </div>

      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L('Spiel suchen', 'Search games')}
            aria-label={L('Spiel suchen', 'Search games')}
            className="w-full h-11 pl-9 pr-9 rounded-xl border border-border bg-surface text-sm"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={L('Löschen', 'Clear')} className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center text-text-tertiary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(category === c.id ? null : c.id)} className={chipCls(category === c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {energies.map((c) => (
            <button key={c.id} type="button" aria-pressed={energy === c.id} onClick={() => setEnergy(energy === c.id ? null : c.id)} className={chipCls(energy === c.id)}>
              {c.label}
            </button>
          ))}
          <button type="button" aria-pressed={noMaterial} onClick={() => setNoMaterial(!noMaterial)} className={chipCls(noMaterial)}>
            {L('Ohne Material', 'No materials')}
          </button>
          {active && (
            <button type="button" onClick={reset} className="h-9 px-2 text-sm text-text-secondary underline">
              {L('Zurücksetzen', 'Reset')}
            </button>
          )}
        </div>
        <p className="text-xs text-text-tertiary tabular-nums" aria-live="polite">
          {L(`${list.length} Spiele`, `${list.length} games`)}
        </p>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((g) => (
            <GameCard key={g.id} game={g} language={language} isFavorite={favorites.includes(g.id)} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={L('Keine Spiele gefunden', 'No games found')}
          description={L('Lockere einen Filter oder ändere den Suchbegriff.', 'Loosen a filter or change the search term.')}
          actionLabel={L('Zurücksetzen', 'Reset')}
          onAction={reset}
        />
      )}
    </div>
  );
};
