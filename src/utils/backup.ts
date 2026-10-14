/** Local-only data backup: everything the site stores lives under `jy_*` keys. */
export const exportLocalData = (): string => {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('jy_')) out[k] = localStorage.getItem(k) ?? '';
  }
  return JSON.stringify({ app: 'jy-hub', version: 1, exportedAt: new Date().toISOString(), data: out }, null, 2);
};

export const importLocalData = (json: string): number => {
  const parsed = JSON.parse(json);
  if (!parsed || parsed.app !== 'jy-hub' || typeof parsed.data !== 'object') throw new Error('invalid');
  let n = 0;
  for (const [k, v] of Object.entries(parsed.data as Record<string, string>)) {
    if (k.startsWith('jy_') && typeof v === 'string') {
      localStorage.setItem(k, v);
      n++;
    }
  }
  return n;
};

export const clearLocalData = (): void => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('jy_')) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
};

export const downloadText = (filename: string, text: string, mime = 'application/json') => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
