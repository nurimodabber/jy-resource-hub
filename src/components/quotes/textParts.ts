// Shared word handling for the practice tools. Unicode classes instead of [a-zA-ZäöüÄÖÜß]:
// the old ASCII lists split "Bahás" into "Bahs" + a stray "á" and kept "…", "–" or "’" as words.

export interface WordParts {
  lead: string;
  core: string;
  trail: string;
}

/** Splits one whitespace token into leading punctuation, the word itself and trailing punctuation. */
export const splitWord = (token: string): WordParts => {
  const m = token.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/su);
  if (!m) return { lead: '', core: token, trail: '' };
  return { lead: m[1], core: m[2], trail: m[3] };
};

/** A token like a standalone "–" has no letter and cannot be asked for. */
export const hasLetter = (s: string) => /\p{L}/u.test(s);

/**
 * Lenient form for comparing typed input with the quote: no accents (a phone keyboard rarely
 * offers "á"), straight apostrophes and hyphens, three dots for "…". Each step keeps the length
 * per character except "…", so callers compare whole strings, not offsets.
 */
export const normalizeTyped = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .toLowerCase();
