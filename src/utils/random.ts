export const shuffle = <T,>(items: readonly T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pick = <T,>(items: readonly T[]): T | undefined =>
  items.length ? items[Math.floor(Math.random() * items.length)] : undefined;

/** Strip typographic quotes so components can add their own exactly once. */
export const stripQuotes = (s: string): string => s.replace(/^[\s„“”"«»‚‘’']+|[\s„“”"«»‚‘’']+$/g, '');

/** "20–40 Min" -> [20, 40]; "15 Min" -> [15, 15]; unknown -> [0, 0] */
export const parseMinutes = (s: string): [number, number] => {
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return [0, 0];
  return [nums[0], nums[nums.length - 1]];
};

export const normalizeTerm = (s: string): string =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
