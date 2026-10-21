import React from 'react';
import { Bookmark, Zap, Music, ExternalLink } from 'lucide-react';
import { QuoteItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { getQuoteSong } from '../data/quoteSongs';
import { IconButton } from './ui/IconButton';
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
  const bookName = quote.mainBook ? quote.mainBook[language] : quote.book[language].split(',')[0].trim();
  const sectionName = formatQuoteSection(quote.section ? quote.section[language] : undefined);
  const song = getQuoteSong(quote.id, language);

  const formattedShareText = `„${text}“\n— ${quote.source[language]} (${quote.book[language]})`;
  const quoteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quotes/${quote.id}`;

  return (
    <article
      onClick={() => onSelectQuote(quote)}
      className="break-inside-avoid bg-surface rounded-card border border-border p-5 sm:p-6 mb-5 transition-all duration-150 ease-out hover:bg-surface-2/40 hover:shadow-2 cursor-pointer flex flex-col justify-between group focus-within:ring-2 focus-within:ring-accent relative shadow-1"
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
        {/* Top small meta line: Source / Book & indicator */}
        <div className="flex items-center justify-between gap-2 text-xs text-text-tertiary">
          <span className="font-medium truncate font-sans">
            {bookName} {sectionName ? `· ${sectionName}` : ''}
          </span>
          {isPrayer && (
            <span className="shrink-0 text-2xs font-semibold px-2 py-0.5 rounded-control bg-surface-2 text-text-secondary border border-line">
              {isDe ? 'Gebet' : 'Prayer'}
            </span>
          )}
        </div>

        {/* Holy Text in Lora Serif font (strictly unmodified, up to 6 lines in list) */}
        <div className="w-full">
          <p
            className="font-serif text-lg sm:text-xl leading-relaxed text-text line-clamp-6 select-text"
            lang={language}
            style={{ hyphens: 'auto' }}
          >
            „{text}“
          </p>
        </div>

        {/* Source underneath in text-secondary with authoritative library link */}
        <div>
          <p className="text-xs sm:text-sm text-text-secondary font-sans font-medium">
            —{' '}
            <a
              href={getBahaiLibraryUrl(quote.source[language], language)}
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

      {/* Bottom Action Row: minimal, uncrowded toolbar */}
      <div
        className="mt-5 pt-3 border-t border-line flex items-center justify-between gap-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {/* Bookmark Button */}
          <IconButton
            label={isFavorite ? t.savedItems : (isDe ? 'Merken' : 'Save')}
            variant="outline"
            size="md"
            className={`min-w-[44px] min-h-[44px] ${isFavorite ? 'text-accent' : 'text-text-secondary'}`}
            onClick={(e) => onToggleFavorite(quote.id, e)}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent' : ''}`} />
          </IconButton>

          {/* Compact Share Dropdown: Text kopieren / Link kopieren */}
          <ShareMenu
            textToCopy={formattedShareText}
            urlToCopy={quoteUrl}
            language={language}
            direction="up"
            align="left"
          />

          {/* Optional song reference */}
          {song && (
            <a
              href={song.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-text-secondary hover:text-accent rounded-control hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t.quoteSongAriaLabel}
              title={isDe ? `Lied „${song.title}“ auf bahaisongs.com anhören` : `Listen to song "${song.title}" on bahaisongs.com`}
            >
              <Music className="w-4 h-4 text-accent" />
            </a>
          )}
        </div>

        {/* Single discreet icon button for "Auswendiglernen" */}
        <IconButton
          label={t.practiceTextLink}
          variant="secondary"
          size="md"
          className="min-w-[44px] min-h-[44px] text-accent hover:text-accent-hover hover:bg-accent-subtle/80"
          onClick={() => onPracticeQuote(quote)}
        >
          <Zap className="w-4 h-4" />
        </IconButton>
      </div>
    </article>
  );
};
