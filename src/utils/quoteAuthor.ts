// Previews show only the author ("Bahá’u’lláh"); the full source stays on the quote page,
// in share text and in the library link. Sources are written "Author (Work, ref)".
export const quoteAuthor = (source: string): string => {
  const i = source.indexOf(' (');
  return (i > 0 ? source.slice(0, i) : source).trim();
};
