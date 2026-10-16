import { Game, GamePurpose, EnergyLevel, Language } from '../types';

export interface GameFilterState {
  q?: string;
  personen?: number | null;
  dauer?: number | null; // e.g. 10, 20, 30 min
  energie?: EnergyLevel | null; // 'calm' | 'medium' | 'high'
  wirkung?: GamePurpose | null; // 'kennenlernen' | 'energie' | 'zusammenarbeit' | 'ruhe' | 'raten'
  material?: 'ohne' | null; // 'ohne' means no materials required
  ort?: 'drinnen' | 'draussen' | null;
  sort?: 'match' | 'duration' | 'groupSize';
}

const ENERGY_URL_MAP: Record<string, EnergyLevel> = {
  ruhig: 'calm',
  calm: 'calm',
  mittel: 'medium',
  medium: 'medium',
  lebhaft: 'high',
  high: 'high',
};

const ENERGY_TO_URL: Record<EnergyLevel, string> = {
  calm: 'ruhig',
  medium: 'mittel',
  high: 'lebhaft',
};

export const parseGameFilters = (searchParams: URLSearchParams): GameFilterState => {
  const q = searchParams.get('q') || searchParams.get('suche') || undefined;
  
  const personenRaw = searchParams.get('personen') || searchParams.get('gruppe');
  const personen = personenRaw && !isNaN(Number(personenRaw)) ? Number(personenRaw) : null;

  const dauerRaw = searchParams.get('dauer') || searchParams.get('zeit');
  const dauer = dauerRaw && !isNaN(Number(dauerRaw)) ? Number(dauerRaw) : null;

  const energieRaw = searchParams.get('energie')?.toLowerCase();
  const energie = energieRaw && ENERGY_URL_MAP[energieRaw] ? ENERGY_URL_MAP[energieRaw] : null;

  const wirkungRaw = (searchParams.get('wirkung') || searchParams.get('kategorie'))?.toLowerCase() as GamePurpose | undefined;
  const validPurposes: GamePurpose[] = ['kennenlernen', 'energie', 'zusammenarbeit', 'ruhe', 'raten'];
  const wirkung = wirkungRaw && validPurposes.includes(wirkungRaw) ? wirkungRaw : null;

  const matRaw = searchParams.get('material')?.toLowerCase();
  const material = matRaw === 'ohne' || matRaw === 'none' ? 'ohne' : null;

  const ortRaw = searchParams.get('ort')?.toLowerCase();
  const ort = ortRaw === 'drinnen' || ortRaw === 'draussen' ? ortRaw : null;

  const sortRaw = searchParams.get('sort')?.toLowerCase();
  const sort = sortRaw === 'duration' || sortRaw === 'groupSize' ? sortRaw : 'match';

  return {
    q,
    personen,
    dauer,
    energie,
    wirkung,
    material,
    ort,
    sort,
  };
};

export const serializeGameFilters = (filter: GameFilterState): URLSearchParams => {
  const params = new URLSearchParams();
  if (filter.q?.trim()) params.set('q', filter.q.trim());
  if (filter.personen != null && filter.personen > 0) params.set('personen', String(filter.personen));
  if (filter.dauer != null && filter.dauer > 0) params.set('dauer', String(filter.dauer));
  if (filter.energie) params.set('energie', ENERGY_TO_URL[filter.energie]);
  if (filter.wirkung) params.set('wirkung', filter.wirkung);
  if (filter.material === 'ohne') params.set('material', 'ohne');
  if (filter.ort) params.set('ort', filter.ort);
  if (filter.sort && filter.sort !== 'match') params.set('sort', filter.sort);
  return params;
};

export const countActiveFilters = (filter: GameFilterState): number => {
  let count = 0;
  if (filter.personen != null) count++;
  if (filter.dauer != null) count++;
  if (filter.energie != null) count++;
  if (filter.material === 'ohne') count++;
  if (filter.ort != null) count++;
  if (filter.sort && filter.sort !== 'match') count++;
  return count;
};

export const filterGames = (games: Game[], filter: GameFilterState, language: Language): Game[] => {
  const query = filter.q?.trim().toLowerCase();

  const filtered = games.filter((g) => {
    // 1. Wirkung (Purpose)
    if (filter.wirkung && g.purpose !== filter.wirkung) {
      return false;
    }

    // 2. Personenzahl
    if (filter.personen != null) {
      if (filter.personen < g.groupSize.min || filter.personen > g.groupSize.max) {
        return false;
      }
    }

    // 3. Dauer (höchstens X Minuten)
    if (filter.dauer != null) {
      if (g.durationMin > filter.dauer) {
        return false;
      }
    }

    // 4. Energie
    if (filter.energie && g.energyLevel !== filter.energie) {
      return false;
    }

    // 5. Material
    if (filter.material === 'ohne') {
      if (g.prepLevel === 'materials_needed') return false;
      // Also check materials array for German / English "Keine" / "None"
      const matsDe = g.materials.de.join(' ').toLowerCase();
      if (!matsDe.includes('keine') && g.prepLevel !== 'instant') return false;
    }

    // 6. Ort (Drinnen / Draußen)
    if (filter.ort === 'draussen') {
      const s = (g.space.de + ' ' + g.space.en).toLowerCase();
      const isOutdoor = s.includes('draußen') || s.includes('draussen') || s.includes('rasen') || s.includes('wiese') || s.includes('überall') || s.includes('turnhalle');
      if (!isOutdoor) return false;
    } else if (filter.ort === 'drinnen') {
      const s = (g.space.de + ' ' + g.space.en).toLowerCase();
      const isOnlyOutdoor = s.includes('draußen / turnhalle') && !s.includes('raum') && !s.includes('saal');
      if (isOnlyOutdoor) return false;
    }

    // 6. Textsuche
    if (query) {
      const title = g.title[language].toLowerCase();
      const subtitle = g.subtitle ? g.subtitle[language].toLowerCase() : '';
      const summary = g.summary[language].toLowerCase();
      const idea = g.idea[language].toLowerCase();
      const hay = `${title} ${subtitle} ${summary} ${idea}`;
      if (!hay.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  if (filter.sort === 'duration') {
    return [...filtered].sort((a, b) => a.durationMin - b.durationMin);
  }
  if (filter.sort === 'groupSize') {
    return [...filtered].sort((a, b) => a.groupSize.min - b.groupSize.min);
  }

  return filtered;
};
