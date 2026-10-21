import { Language } from '../types';

/**
 * Extracts a searchable term from a scripture source string.
 * Example: "Bahá'u'lláh (Botschaften aus Akka, Lawh-i-Maqsúd)" -> "Botschaften aus Akka Lawh-i-Maqsud"
 */
export function extractLibrarySearchQuery(source: string): string {
  // If there are parentheses, prioritize the specific book/tablet inside
  const match = source.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    // Strip comma and excessive punctuation
    return match[1].replace(/[,;:]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // Otherwise clean author/title
  return source.replace(/[,;:]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Generates an authoritative link to the Bahá'í-Bibliothek (German)
 * or the official Bahá'í Reference Library (English).
 */
export function getBahaiLibraryUrl(source: string, language: Language): string {
  const query = extractLibrarySearchQuery(source);
  if (language === 'de') {
    if (!query) {
      return 'https://bahaibibliothek.de/';
    }
    return `https://bahaibibliothek.de/?s=${encodeURIComponent(query)}`;
  }

  // English: official Bahá'í Reference Library
  if (!query) {
    return 'https://www.bahai.org/library/';
  }
  return `https://www.bahai.org/library/search#q=${encodeURIComponent(query)}`;
}
