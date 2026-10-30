import React from 'react';
import { Bookmark, Music, ExternalLink, ArrowRight, Zap } from 'lucide-react';
import { QuoteItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { getQuoteSong } from '../data/quoteSongs';
import { ShareMenu } from './ui/ShareMenu';
import { getBahaiLibraryUrl } from '../utils/libraryLinks';

interface QuoteCardProps {
  quote: QuoteItem;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectQuote: (quote: QuoteItem) => void;
  onPracticeQuote: (quote: QuoteItem) => void;
}

export const isPrayerQuote = (quote: QuoteItem): boolean => {
  return (
    quote.generalTopic === 'gebet' ||
    quote.mainBook?.de === 'Gebete & Andacht' ||
    quote.book.de.includes('Gebet') ||
    quote.id.startsWith('prayer-')
  );
};

export const formatQuoteSection = (section?: string): string | undefined => {
  if (!section) return undefined;
  const cleaned = section.replace(/[/:\-—–\s]+$/, '').trim();
  if (!cleaned || /^(lektion|lesson|einheit|unit|gebet|prayer)[/:\-—–\s]*$/i.test(cleaned)) {
    return undefined;
  }
  return cleaned;
};

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  language,
  isFavorite,
  onToggleFavorite,
  onSelectQuote,
  onPracticeQuote,
}) => {
  const t = UI_TRANSLATIONS[language];
  const isDe = language === 'de';

  const isPrayer = isPrayerQuote(quote);
  const text = isDe ? quote.textDe : quote.textEn;
  const rawBookName = quote.mainBook ? quote.mainBook[language] : quote.book[language].split(',')[0].trim();
  const isDevotionalBook =
    /gebete?\s*(&|und|\+)?\s*andacht/i.test(rawBookName) ||
    /prayers?\s*(&|and|\+)?\s*devotions?/i.test(rawBookName);
  const bookName = isDevotionalBook ? undefined : rawBookName;
  const sectionName = formatQuoteSection(quote.section ? quote.section[language] : undefined);
  const song = getQuoteSong(quote.id, language);

  const metaTag = isPrayer
    ? `${isDe ? 'Gebet' : 'Prayer'}${bookName ? ` · ${bookName}` : ''}${sectionName ? ` · ${sectionName}` : ''}`
    : `${bookName ?? ''}${sectionName ? ` · ${sectionName}` : ''}`;

  const formattedShareText = `„${text}“\n— ${quote.source[language]} (${quote.book[language]})`;
  const quoteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quotes/${quote.id}`;

  return (
    <article
      onClick={() => onSelectQuote(quote)}
      className="break-inside-avoid bg-surface rounded-card border border-border/80 p-5 sm:p-6 mb-5 transition-all duration-200 ease-out hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 cursor-pointer flex flex-col justify-between group focus-within:ring-2 focus-within:ring-accent relative shadow-2xs"
      tabIndex={0}
      role="article"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'A') {
            e.preventDefault();
            onSelectQuote(quote);
          }
        }
      }}
    >
      <div className="space-y-3.5">
        {/* Top meta line: Book & Section + discreet actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-2xs font-semibold uppercase tracking-wider text-accent truncate font-sans">
            {metaTag}
          </span>

          <div className="flex items-center gap-0.5 -mr-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => onToggleFavorite(quote.id, e)}
              aria-pressed={isFavorite}
              aria-label={`${t.savedItems}: ${quote.source[language]}`}
              className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors cursor-pointer ${
                isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
            </button>

            <ShareMenu
              textToCopy={formattedShareText}
              urlToCopy={quoteUrl}
              language={language}
              direction="down"
              align="right"
            />
          </div>
        </div>

        {/* Holy Text in Lora Serif font (strictly unmodified, up to 6 lines in list) */}
        <div className="w-full">
          <p
            className="font-serif text-lg sm:text-xl leading-relaxed text-text line-clamp-6 select-text"
            lang={language}
            style={{ hyphens: 'auto' }}
          >
            {isDe ? `»${text}«` : `“${text}”`}
          </p>
        </div>

        {/* Source underneath in text-secondary with authoritative library link */}
        <div>
          <p className="text-xs sm:text-sm text-text-secondary font-sans font-medium">
            —{' '}
            <a
              href={getBahaiLibraryUrl(quote, language)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={
                isDe
                  ? `Quelle „${quote.source.de}“ in der Bahá'í-Bibliothek öffnen`
                  : `Open source "${quote.source.en}" in Bahá'í Reference Library`
              }
              className="hover:text-accent hover:underline inline-flex items-center gap-1 transition-colors group/src focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-accent rounded-xs"
            >
              <span>{quote.source[language]}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover/src:opacity-80 transition-opacity shrink-0" />
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Action Row: calm, uncrowded and literary */}
      <div
        className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-3 relative text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {song && (
            <a
              href={song.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors font-medium min-h-[44px] py-1"
              aria-label={t.quoteSongAriaLabel}
              title={isDe ? `Lied „${song.title}“ auf bahaisongs.com anhören` : `Listen to song "${song.title}" on bahaisongs.com`}
            >
              <Music className="w-3.5 h-3.5 text-accent" />
              <span className="truncate max-w-[180px]">{song.title}</span>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPracticeQuote(quote)}
          aria-label={isDe ? 'Auswendiglernen' : 'Memorise'}
          title={isDe ? 'Auswendiglernen' : 'Memorise'}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover hover:bg-accent/8 px-2 sm:px-2.5 py-1 rounded-control transition-all min-h-[44px] min-w-[44px] cursor-pointer group/btn"
        >
          <Zap className="w-4 h-4 text-accent fill-accent/20 group-hover/btn:scale-110 transition-transform" />
          <span className="hidden sm:inline-block text-2xs font-bold uppercase tracking-wider">
            {isDe ? 'Auswendiglernen' : 'Memorise'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all hidden sm:inline-block" />
        </button>
      </div>
    </article>
  );
};
