/** UI primitives don't receive the language prop; <html lang> is kept in sync by App. */
export const closeLabel = (): string => (document.documentElement.lang === 'en' ? 'Close' : 'Schließen');

/** Bilingual text for primitives without a language prop (same source as closeLabel). */
export const uiText = (de: string, en: string): string => (document.documentElement.lang === 'en' ? en : de);
