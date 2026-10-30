import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Bookmark, Music, ExternalLink, Zap
} from 'lucide-react';
import { QuoteItem, Language } from '../types';
import { QUOTES_DATA } from '../data/quotes';
import { UI_TRANSLATIONS } from '../data/translations';
import { getQuoteSong } from '../data/quoteSongs';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { ShareMenu } from './ui/ShareMenu';
import { isPrayerQuote, formatQuoteSection } from './QuoteCard';
import { getBahaiLibraryUrl } from '../utils/libraryLinks';

interface QuoteDetailProps {
  quote: QuoteItem;
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
  onPracticeTool?: (quote: QuoteItem, toolId: string) => void;
  initialTool?: string | null;
}

export const QuoteDetail: React.FC<QuoteDetailProps> = ({
  quote,
  language,
  favorites,
  onToggleFavorite,
  onBack,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = UI_TRANSLATIONS[language];
  const isDe = language === 'de';

  // If URL explicitly requests practice mode or a specific tool, redirect cleanly to practice tab
  useEffect(() => {
    if (searchParams.get('practice') === '1' || searchParams.get('tool')) {
      const toolParam = searchParams.get('tool');
      const toolQuery = toolParam ? `&tool=${toolParam}` : '';
      navigate(`/quotes?tab=practice&quote=${quote.id}${toolQuery}`, { replace: true });
    }
  }, [searchParams, quote.id, navigate]);

  const activeQuote = quote;
  const isFavorite = favorites.includes(activeQuote.id);
  const isPrayer = isPrayerQuote(activeQuote);

  const text = isDe ? activeQuote.textDe : activeQuote.textEn;
  const rawBookName = activeQuote.mainBook ? activeQuote.mainBook[language] : activeQuote.book[language].split(',')[0].trim();
  const isDevotionalBook =
    /gebete?\s*(&|und|\+)?\s*andacht/i.test(rawBookName) ||
    /prayers?\s*(&|and|\+)?\s*devotions?/i.test(rawBookName);
  const bookName = isDevotionalBook ? undefined : rawBookName;
  const sectionName = formatQuoteSection(activeQuote.section ? activeQuote.section[language] : undefined);
  const song = getQuoteSong(activeQuote.id, language);

  const metaTag = isPrayer
    ? `${isDe ? 'Gebet' : 'Prayer'}${bookName ? ` · ${bookName}` : ''}${sectionName ? ` · ${sectionName}` : ''}`
    : `${bookName ?? ''}${sectionName ? ` · ${sectionName}` : ''}`;

  const formattedShareText = `${isDe ? `»${text}«` : `“${text}”`}\n— ${activeQuote.source[language]} (${activeQuote.book[language]})`;
  const quoteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quotes/${activeQuote.id}`;

  // Sibling quotes in the same book for gentle pagination
  const bookQuotes = useMemo(() => {
    const bookTitleDe = activeQuote.mainBook ? activeQuote.mainBook.de : activeQuote.book.de.split(',')[0].trim();
    return QUOTES_DATA.filter((q) => {
      const b = q.mainBook ? q.mainBook.de : q.book.de.split(',')[0].trim();
      return b === bookTitleDe;
    });
  }, [activeQuote]);

  const currentIndex = useMemo(() => {
    return bookQuotes.findIndex((q) => q.id === activeQuote.id);
  }, [bookQuotes, activeQuote.id]);

  const prevQuote = currentIndex > 0 ? bookQuotes[currentIndex - 1] : null;
  const nextQuote = currentIndex >= 0 && currentIndex < bookQuotes.length - 1 ? bookQuotes[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 pb-28 pt-2 animate-in fade-in duration-200">
      {/* 1. Top Header Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          icon={<ArrowLeft className="w-4 h-4 shrink-0" />}
          onClick={onBack}
          className="min-h-[44px] whitespace-nowrap"
        >
          {t.backToQuotes}
        </Button>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Symmetrical Auswendiglernen Button in top action bar */}
          <button
            type="button"
            onClick={() => navigate(`/quotes?tab=practice&quote=${activeQuote.id}`)}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] h-11 px-0 sm:px-3 gap-1.5 rounded-control border border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            title={isDe ? 'Auswendiglernen öffnen' : 'Open memorisation'}
            aria-label={isDe ? 'Auswendiglernen öffnen' : 'Open memorisation'}
          >
            <Zap className="w-4 h-4 text-accent shrink-0" />
            <span className="hidden sm:inline">{isDe ? 'Auswendiglernen' : 'Memorise'}</span>
          </button>

          {/* Song (if available) */}
          {song && (
            <a
              href={song.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-control border border-border bg-surface hover:bg-surface-2 text-text transition-colors focus-visible:ring-2 focus-visible:ring-accent"
              title={isDe ? `Lied „${song.title}“ auf bahaisongs.com anhören` : `Listen to song "${song.title}" on bahaisongs.com`}
              aria-label={t.quoteSongAriaLabel}
            >
              <Music className="w-4 h-4 text-accent" />
            </a>
          )}

          {/* Bookmark Button */}
          <IconButton
            label={isFavorite ? t.savedItems : (isDe ? 'Merken' : 'Save')}
            variant="outline"
            className={`min-h-[44px] min-w-[44px] ${isFavorite ? 'text-accent' : 'text-text-secondary'}`}
            onClick={(e) => onToggleFavorite(activeQuote.id, e)}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent' : ''}`} />
          </IconButton>

          {/* Compact Share Menu: Text kopieren / Link kopieren */}
          <ShareMenu
            textToCopy={formattedShareText}
            urlToCopy={quoteUrl}
            language={language}
            align="right"
          />
        </div>
      </div>

      {/* 2. Main Sacred Text Reading Card (Calm surface, generous margin, Lora serif) */}
      <section className="bg-surface rounded-3xl border border-border/80 p-6 sm:p-12 lg:p-16 space-y-8 shadow-xs">
        <div className="flex items-center justify-between gap-3 text-xs text-text-tertiary">
          <span className="text-2xs font-bold uppercase tracking-[0.14em] text-accent font-sans">
            {metaTag}
          </span>
        </div>

        {/* The Holy Text: strictly unmodified, Lora font */}
        <div className="max-w-3xl mx-auto py-2">
          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl leading-[1.7] text-text text-center sm:text-left select-text">
            {isDe ? `»${text}«` : `“${text}”`}
          </blockquote>
        </div>

        {/* Bottom meta */}
        <div className="pt-6 sm:pt-8 border-t border-border/60">
          <cite className="not-italic text-sm sm:text-base text-text-secondary font-serif italic block">
            —{' '}
            <a
              href={getBahaiLibraryUrl(activeQuote, language)}
              target="_blank"
              rel="noopener noreferrer"
              title={
                isDe
                  ? `Quelle „${activeQuote.source.de}“ in der Bahá'í-Bibliothek öffnen`
                  : `Open source "${activeQuote.source.en}" in Bahá'í Reference Library`
              }
              className="hover:text-accent hover:underline inline-flex items-center gap-1.5 transition-colors group/src focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-accent rounded-xs"
            >
              <span>{activeQuote.source[language]}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/src:opacity-100 transition-opacity shrink-0 not-italic" />
            </a>
          </cite>
        </div>
      </section>

      {/* 3. Subtle Sibling Quotes Navigation (within same book) */}
      {bookQuotes.length > 1 && (
        <div className="flex items-center justify-between gap-4 text-xs text-text-secondary px-1">
          {prevQuote ? (
            <button
              type="button"
              onClick={() => navigate(`/quotes/${prevQuote.id}`)}
              className="inline-flex items-center gap-1.5 hover:text-text transition-colors min-h-[44px] py-2 px-3 rounded-control hover:bg-surface-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-xs">{isDe ? 'Vorheriges Zitat' : 'Previous quote'}</span>
            </button>
          ) : <div />}
          {nextQuote ? (
            <button
              type="button"
              onClick={() => navigate(`/quotes/${nextQuote.id}`)}
              className="inline-flex items-center gap-1.5 hover:text-text transition-colors min-h-[44px] py-2 px-3 rounded-control hover:bg-surface-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="truncate max-w-[140px] sm:max-w-xs">{isDe ? 'Nächstes Zitat' : 'Next quote'}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : <div />}
        </div>
      )}
    </div>
  );
};
