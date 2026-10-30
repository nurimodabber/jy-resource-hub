import { Language, LocalizedString } from '../types';

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

export type LibraryLinkTarget =
  | string
  | {
      libraryUrl?: LocalizedString;
      parId?: number;
      source?: LocalizedString;
    };

/**
 * Generates an authoritative link to the official Bahá'í Online Bibliothek (German: bibliothek.bahai.de)
 * or the official Bahá'í Reference Library (English: bahai.org/library).
 *
 * If a direct `libraryUrl` or `parId` is present on the quote item, it links directly
 * to the exact reader paragraph (`pubReader.php?parId=...`).
 */
export function getBahaiLibraryUrl(target: LibraryLinkTarget, language: Language): string {
  if (typeof target === 'object' && target !== null) {
    if (target.libraryUrl && target.libraryUrl[language]) {
      return target.libraryUrl[language];
    }
    if (target.parId) {
      if (language === 'de') {
        return `https://bibliothek.bahai.de/pubReader.php?parId=${target.parId}`;
      }
      if (target.libraryUrl?.en) {
        return target.libraryUrl.en;
      }
      return 'https://www.bahai.org/library/';
    }
    if (target.source && target.source[language]) {
      return getBahaiLibraryUrl(target.source[language], language);
    }
  }

  const sourceStr = typeof target === 'string' ? target : '';
  const query = extractLibrarySearchQuery(sourceStr);

  if (language === 'de') {
    if (!query) {
      return 'https://bibliothek.bahai.de/';
    }
    return `https://bibliothek.bahai.de/pubSearch.php?searchString=${encodeURIComponent(query)}`;
  }

  // English: official Bahá'í Reference Library
  if (!query) {
    return 'https://www.bahai.org/library/';
  }
  return `https://www.bahai.org/library/search#q=${encodeURIComponent(query)}`;
}
