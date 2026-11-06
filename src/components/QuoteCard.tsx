import React from 'react';
import { quoteAuthor } from '../utils/quoteAuthor';
import { Bookmark, Music, ExternalLink, Brain } from 'lucide-react';
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

  // Kürzen auf 6 Zeilen OHNE -webkit-box: Safari (iPhone und Mac) ignoriert float innerhalb von
  // -webkit-line-clamp, dann rutschen Merken und Teilen in eine eigene Zeile über den Text.
  // Deshalb kürzt .jy-quote-clamp per max-height + overflow: clip (bildet keinen eigenen
  // Block-Kontext, der float bleibt wirksam). Ist der Text gekürzt, blendet ein Verlauf aus.
  const quoteRef = React.useRef<HTMLQuoteElement>(null);
  const [isClamped, setIsClamped] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, language]);

  return (
    <article
      onClick={() => onSelectQuote(quote)}
      className="break-inside-avoid group relative overflow-hidden bg-surface rounded-card border border-border/80 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 p-3.5 sm:p-5 mb-3.5 sm:mb-4 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between focus-within:ring-2 focus-within:ring-accent shadow-2xs"
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
      {/* Subtle Top-Right Ambient Glow in Blue / Accent */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-10 dark:opacity-20 transition-opacity"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb)) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex-1">
        {/* Holy Text in Lora Serif font with top-right floated actions (wraps lines 1-2, full width from line 3) */}
        <blockquote
          ref={quoteRef}
          data-clamped={isClamped}
          className="jy-quote-clamp font-serif text-base sm:text-lg leading-relaxed text-text select-text mb-2.5"
          lang={language}
          style={{ hyphens: 'none', wordBreak: 'normal', overflowWrap: 'normal' }}
        >
          {/* Top-Right Floated Actions: Bookmark + Share */}
          <div
            className="float-right flex items-center gap-0.5 ml-2 mb-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => onToggleFavorite(quote.id, e)}
              aria-pressed={isFavorite}
              aria-label={`${t.savedItems}: ${quote.source[language]}`}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                isFavorite
                  ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
                  : 'text-text-tertiary hover:text-text hover:bg-surface-2'
              }`}
            >
              <Bookmark className={`w-4 h-4 transition-transform duration-150 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
            </button>

            <ShareMenu
              textToCopy={formattedShareText}
              urlToCopy={quoteUrl}
              language={language}
              direction="down"
              align="right"
            />
          </div>

          {isDe ? `»${text}«` : `“${text}”`}
        </blockquote>

        {/* Source underneath in text-secondary with authoritative library link */}
        <div className="pt-0.5 mb-2">
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
              <span>{quoteAuthor(quote.source[language])}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover/src:opacity-80 transition-opacity shrink-0" />
            </a>
          </p>
        </div>
      </div>

      {/* Full-bleed Footer Divider: Book & Section on left (replacing "Heiliger Text"), Brain button on right */}
      <div
        className="relative z-10 -mx-3.5 -mb-3.5 px-3.5 py-2.5 sm:-mx-5 sm:-mb-5 sm:px-5 sm:py-3 border-t border-border/60 bg-surface-2/40 mt-4 flex items-center justify-between gap-3 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 truncate text-text-tertiary text-2xs sm:text-xs min-w-0">
          <span className="truncate font-sans font-medium text-text-secondary">
            {metaTag}
          </span>
          {song && (
            <>
              <span className="text-border" aria-hidden="true">·</span>
              <a
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-2xs text-text-secondary hover:text-accent transition-colors font-medium group/song shrink-0"
                aria-label={t.quoteSongAriaLabel}
                title={isDe ? `Lied „${song.title}“ auf bahaisongs.com anhören` : `Listen to song "${song.title}" on bahaisongs.com`}
              >
                <Music className="w-3 h-3 text-text-tertiary group-hover/song:text-accent transition-colors" />
                <span className="truncate max-w-[140px]">{song.title}</span>
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPracticeQuote(quote)}
          aria-label={isDe ? 'Auswendiglernen' : 'Memorise'}
          title={isDe ? 'Auswendiglernen' : 'Memorise'}
          className="w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-full bg-accent/8 hover:bg-accent/15 text-accent hover:text-accent-hover transition-all active:scale-90 motion-reduce:transform-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent shrink-0"
        >
          <Brain className="w-4 h-4 text-accent" />
        </button>
      </div>
    </article>
  );
};
