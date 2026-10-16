export interface JyBook {
  id: string;
  title: {
    de: string;
    en: string;
  };
  totalLessons: number;
}

export const JY_BOOKS: JyBook[] = [
  { id: 'breezes', title: { de: 'Brise der Bestätigung', en: 'Breezes of Confirmation' }, totalLessons: 14 },
  { id: 'straight-path', title: { de: 'Den geraden Pfad beschreiten', en: 'Walking the Straight Path' }, totalLessons: 20 },
  { id: 'power-of-word', title: { de: 'Die Kraft des Wortes nutzen', en: 'Drawing on the Power of the Word' }, totalLessons: 20 },
  { id: 'excellence', title: { de: 'Nach Vortrefflichkeit streben', en: 'Learning About Excellence' }, totalLessons: 10 },
  { id: 'glimmerings', title: { de: 'Hoffnungsschimmer', en: 'Glimmerings of Hope' }, totalLessons: 12 },
  { id: 'spirit-of-faith', title: { de: 'Geist des Glaubens', en: 'Spirit of Faith' }, totalLessons: 14 },
  { id: 'wellspring', title: { de: 'Quelle der Freude', en: 'Wellspring of Joy' }, totalLessons: 14 },
  { id: 'observation', title: { de: 'Beobachtung und Erkenntnis', en: 'Observation and Insight' }, totalLessons: 14 },
  { id: 'numbers', title: { de: 'Über Zahlen nachdenken', en: 'Thinking About Numbers' }, totalLessons: 15 },
  { id: 'human-honor', title: { de: 'Die Würde des Menschen', en: 'Human Honor' }, totalLessons: 10 },
  { id: 'waves', title: { de: 'Wellen eines Meeres', en: 'Waves of One Sea' }, totalLessons: 14 },
];

export interface BookProgress {
  bookId: string;
  lesson: number;
  notes?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'jy_book_progress';

export const loadBookProgress = (): BookProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.bookId === 'string' && typeof parsed.lesson === 'number') {
      return parsed as BookProgress;
    }
  } catch {
    /* ignore */
  }
  return null;
};

export const saveBookProgress = (progress: BookProgress): void => {
  try {
    const data = {
      ...progress,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

export const getBookById = (id: string): JyBook | undefined => {
  return JY_BOOKS.find((b) => b.id === id);
};
