export interface RecentViewItem {
  id: string;
  type: 'game' | 'quote' | 'service' | 'art';
  title: { de: string; en: string };
  subtitle?: { de: string; en: string };
  path: string;
  timestamp: number;
}

const STORAGE_KEY = 'jy_recent_views';

export const loadRecentViews = (): RecentViewItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
};

export const recordRecentView = (item: Omit<RecentViewItem, 'timestamp'>): void => {
  try {
    const current = loadRecentViews();
    const updated = [
      { ...item, timestamp: Date.now() },
      ...current.filter((x) => x.id !== item.id),
    ].slice(0, 3);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
};
