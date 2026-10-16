import React, { useState } from 'react';
import { Bookmark, ArrowRight, MoreVertical, Copy, Check, Share2, Plus, Heart } from 'lucide-react';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource/lora/latin-600.css';
import { QuoteItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { IconButton } from './ui/IconButton';
import { useToast } from '../context/ToastContext';
import { shareResource } from '../utils/share';

interface QuoteCardProps {
  quote: QuoteItem;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectQuote: (quote: QuoteItem) => void;
  onPracticeQuote: (quote: QuoteItem) => void;
  onAddToMeeting: (quote: QuoteItem) => void;
  onUseAsDevotional: (quote: QuoteItem) => void;
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
  const cleaned = section.replace(/\/\s*$/, '').trim();
  if (!cleaned) return undefined;
  if (/^(lektion|lesson|einheit|unit|gebet|prayer)\s*$/i.test(cleaned)) {
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
  onAddToMeeting,
  onUseAsDevotional,
}) => {
  const t = UI_TRANSLATIONS[language];
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPrayer = isPrayerQuote(quote);
  const text = language === 'de' ? quote.textDe : quote.textEn;
  const bookName = quote.mainBook ? quote.mainBook[language] : quote.book[language].split(',')[0].trim();
  const sectionName = formatQuoteSection(quote.section ? quote.section[language] : undefined);

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const formatted = `„${text}“\n— ${quote.source[language]} (${quote.book[language]})`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setIsMenuOpen(false);
    showToast({
      text: language === 'de' ? 'Zitat kopiert' : 'Quote copied',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMenuOpen(false);
    const title = quote.theme[language];
    const shareText = `„${text}“\n— ${quote.source[language]}`;
    await shareResource({
      title,
      text: shareText,
      url: `${window.location.origin}/quotes/${quote.id}`,
    });
  };

  const handleMeetingAction = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMenuOpen(false);
    if (isPrayer) {
      onUseAsDevotional(quote);
    } else {
      onAddToMeeting(quote);
    }
  };

  return (
    <article
      onClick={() => onSelectQuote(quote)}
      className="break-inside-avoid bg-surface/80 rounded-card border border-line p-5 sm:p-6 mb-5 transition-all duration-120 hover:border-accent/60 cursor-pointer flex flex-col justify-between group focus-within:ring-2 focus-within:ring-accent relative shadow-xs"
      tabIndex={0}
      role="article"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
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
              {language === 'de' ? 'Gebet' : 'Prayer'}
            </span>
          )}
        </div>

        {/* Holy Text in Literata Serif font (unaltered, up to 6 lines in list) */}
        <div className="max-w-[680px]">
          <p
            className="font-serif text-lg sm:text-xl leading-relaxed text-text line-clamp-6 select-text"
            lang={language}
            style={{ hyphens: 'auto' }}
          >
            „{text}“
          </p>
        </div>

        {/* Source underneath in text-secondary */}
        <div>
          <p className="text-xs sm:text-sm text-text-secondary font-sans font-medium">
            — {quote.source[language]}
          </p>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div
        className="mt-5 pt-3.5 border-t border-line flex items-center justify-between gap-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 relative">
          {/* Bookmark Button */}
          <IconButton
            label={isFavorite ? t.savedItems : (language === 'de' ? 'Merken' : 'Save')}
            variant="outline"
            className={isFavorite ? 'text-accent' : 'text-text-secondary'}
            onClick={(e) => onToggleFavorite(quote.id, e)}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent' : ''}`} />
          </IconButton>

          {/* More Menu Trigger */}
          <div className="relative">
            <IconButton
              label={language === 'de' ? 'Mehr Optionen' : 'More options'}
              variant="outline"
              className="text-text-secondary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical className="w-4 h-4" />
            </IconButton>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-surface rounded-xl border border-border shadow-lg z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={handleMeetingAction}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-2 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    {isPrayer ? <Heart className="w-4 h-4 text-accent" /> : <Plus className="w-4 h-4" />}
                    <span>{isPrayer ? t.useAsDevotional : t.addToPlanner}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-2 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? (language === 'de' ? 'Kopiert' : 'Copied') : (language === 'de' ? 'Text kopieren' : 'Copy text')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-2 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{language === 'de' ? 'Teilen' : 'Share'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Primary contextual textual link / button */}
        <div className="flex items-center gap-2">
          {isPrayer ? (
            <button
              type="button"
              onClick={() => onUseAsDevotional(quote)}
              className="text-xs sm:text-sm font-semibold text-accent hover:underline flex items-center gap-1.5 px-2 py-1.5 min-h-[44px] cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              <span>{t.useAsDevotional}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPracticeQuote(quote)}
              className="text-xs sm:text-sm font-semibold text-accent hover:underline flex items-center gap-1 px-2 py-1.5 min-h-[44px] cursor-pointer"
            >
              <span>{t.practiceTextLink}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
