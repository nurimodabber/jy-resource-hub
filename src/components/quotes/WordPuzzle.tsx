import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Undo2, CheckCircle2, Sparkles } from 'lucide-react';
import { QuoteItem, Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

interface WordPuzzleProps {
  quote: QuoteItem;
  language: Language;
}

interface TileItem {
  id: string;
  word: string;
  originalIndex: number;
}

export const WordPuzzle: React.FC<WordPuzzleProps> = ({ quote, language }) => {
  const t = UI_TRANSLATIONS[language];
  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
  const originalWords = useMemo(() => quoteText.split(/\s+/), [quoteText]);

  // Scrambled pool
  const [availableTiles, setAvailableTiles] = useState<TileItem[]>([]);
  // Placed sequence
  const [placedTiles, setPlacedTiles] = useState<TileItem[]>([]);

  // Initialize and shuffle
  const initializePuzzle = () => {
    const tiles: TileItem[] = originalWords.map((word, index) => ({
      id: `${word}-${index}-${Math.random()}`,
      word,
      originalIndex: index,
    }));
    // Fisher-Yates shuffle
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setAvailableTiles(shuffled);
    setPlacedTiles([]);
  };

  useEffect(() => {
    initializePuzzle();
  }, [quote, language, quoteText]);

  const handleTileClick = (tile: TileItem) => {
    setAvailableTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setPlacedTiles((prev) => [...prev, tile]);
  };

  const handleUndo = () => {
    if (placedTiles.length === 0) return;
    const last = placedTiles[placedTiles.length - 1];
    setPlacedTiles((prev) => prev.slice(0, -1));
    setAvailableTiles((prev) => [...prev, last]);
  };

  const isComplete = placedTiles.length === originalWords.length;
  const isCorrect = isComplete && placedTiles.every((t, i) => t.originalIndex === i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#86868b]">
        <p>{t.wordPuzzleSubtitle}</p>
        <span className="font-mono text-[11px] bg-black/[0.04] px-3 py-1 rounded-full text-[#1d1d1f] self-start sm:self-auto shrink-0">
          {placedTiles.length} / {originalWords.length} {t.wordsRemaining}
        </span>
      </div>

      {/* Assembly Zone */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8 shadow-apple-card space-y-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
          {language === 'de' ? 'Zusammengesetzter Satz:' : 'Assembled Sentence:'}
        </span>

        <div className="min-h-[110px] p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex flex-wrap items-center gap-2 font-serif text-lg sm:text-2xl text-[#1d1d1f] leading-relaxed">
          {placedTiles.length === 0 ? (
            <span className="text-sm font-sans text-[#aeaeb2] italic">
              {language === 'de' ? 'Klicke unten auf die Wort-Bausteine, um zu beginnen...' : 'Tap the word chips below to start assembling...'}
            </span>
          ) : (
            placedTiles.map((tile, idx) => {
              const isSlotCorrect = tile.originalIndex === idx;
              return (
                <span
                  key={tile.id}
                  onClick={() => {
                    // clicking a placed tile returns it to the pool
                    setPlacedTiles((prev) => prev.filter((p) => p.id !== tile.id));
                    setAvailableTiles((prev) => [...prev, tile]);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer select-none inline-block ${
                    isSlotCorrect
                      ? 'bg-white shadow-apple-pill border border-black/[0.06] text-[#1d1d1f]'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                  title={language === 'de' ? 'Klicken zum Entfernen' : 'Tap to remove'}
                >
                  {tile.word}
                </span>
              );
            })
          )}
        </div>

        {/* Success Banner */}
        {isComplete && isCorrect && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="font-semibold block">{t.puzzleCompleted}</strong>
              <span className="text-emerald-700 italic font-serif">„{quoteText}“</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={placedTiles.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 border border-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full hover:bg-black/[0.04] disabled:opacity-30 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{t.undoWord}</span>
            </button>
            <button
              onClick={initializePuzzle}
              className="flex items-center gap-1.5 px-4 py-2 border border-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full hover:bg-black/[0.04] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetPuzzle}</span>
            </button>
          </div>

          <span className="text-xs text-[#86868b] font-serif italic">
            — {quote.source[language]}
          </span>
        </div>
      </div>

      {/* Available Word Chips Pool */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-6 shadow-apple-card space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
          {t.clickTilePrompt}
        </span>

        <div className="flex flex-wrap gap-2 pt-1">
          {availableTiles.length === 0 && !isComplete && (
            <span className="text-xs text-[#86868b]">Alle Wörter platziert.</span>
          )}
          {availableTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className="px-3.5 py-2 bg-[#f5f5f7] hover:bg-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full border border-black/[0.04] shadow-2xs hover:-translate-y-0.5 transition-all select-none"
            >
              {tile.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
