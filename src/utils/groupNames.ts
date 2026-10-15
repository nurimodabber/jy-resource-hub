export const NAMES_KEY = 'jy_group_names';
export const PRESENT_KEY = 'jy_group_present';

export const parseNames = (text: string): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const n = raw.trim();
    const k = n.toLowerCase();
    if (n && !seen.has(k)) {
      seen.add(k);
      out.push(n);
    }
  }
  return out;
};

export const loadGroupNames = (): string[] => {
  try {
    const raw = localStorage.getItem(NAMES_KEY);
    if (!raw) return [];
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    }
    return parseNames(raw);
  } catch {
    return [];
  }
};

export const saveGroupNames = (names: string[]): void => {
  try {
    localStorage.setItem(NAMES_KEY, JSON.stringify(names));
  } catch {
    // ignore
  }
};

export const loadGroupPresent = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(PRESENT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // ignore
  }
  return {};
};

export const saveGroupPresent = (present: Record<string, boolean>): void => {
  try {
    localStorage.setItem(PRESENT_KEY, JSON.stringify(present));
  } catch {
    // ignore
  }
};

export const loadPresentNames = (): string[] => {
  const names = loadGroupNames();
  const present = loadGroupPresent();
  // If present map doesn't have an entry for a name, default to true
  return names.filter((n) => present[n] !== false);
};
