import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RotateCcw, Undo2, CheckCircle2 } from 'lucide-react';
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
  const initializePuzzle = useCallback(() => {
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
  }, [originalWords]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-secondary">
        <p>{t.wordPuzzleSubtitle}</p>
        <span className="font-mono text-2xs bg-surface-2 border border-border px-3 py-1 rounded-full text-text self-start sm:self-auto shrink-0">
          {placedTiles.length} / {originalWords.length} {t.wordsRemaining}
        </span>
      </div>

      {/* Assembly Zone */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-8 shadow-xs space-y-4">
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary block">
          {language === 'de' ? 'Zusammengesetzter Satz:' : 'Assembled Sentence:'}
        </span>

        <div className="min-h-[110px] p-5 rounded-2xl bg-surface-2 border border-border flex flex-wrap items-center gap-2 font-serif text-lg sm:text-2xl text-text leading-relaxed">
          {placedTiles.length === 0 ? (
            <span className="text-sm font-sans text-text-tertiary italic">
              {language === 'de' ? 'Klicke unten auf die Wort-Bausteine, um zu beginnen...' : 'Tap the word chips below to start assembling...'}
            </span>
          ) : (
            placedTiles.map((tile, idx) => {
              const isSlotCorrect = tile.originalIndex === idx;
              return (
                <button
                  type="button"
                  key={tile.id}
                  onClick={() => {
                    setPlacedTiles((prev) => prev.filter((p) => p.id !== tile.id));
                    setAvailableTiles((prev) => [...prev, tile]);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none inline-block font-serif text-base sm:text-xl ${
                    isSlotCorrect
                      ? 'bg-surface shadow-xs border border-border text-text'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                  }`}
                  title={language === 'de' ? 'Klicken zum Entfernen' : 'Tap to remove'}
                >
                  {tile.word}
                </button>
              );
            })
          )}
        </div>

        {/* Success Banner */}
        {isComplete && isCorrect && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <strong className="font-semibold block">{t.puzzleCompleted}</strong>
              <span className="italic font-serif">„{quoteText}“</span>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={placedTiles.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-full hover:bg-surface-2 disabled:opacity-30 transition-colors cursor-pointer min-h-[36px]"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{t.undoWord}</span>
            </button>
            <button
              type="button"
              onClick={initializePuzzle}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-surface text-text text-xs font-medium rounded-full hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetPuzzle}</span>
            </button>
          </div>

          <span className="text-xs text-text-tertiary font-serif italic">
            — {quote.source[language]}
          </span>
        </div>
      </div>

      {/* Available Word Chips Pool */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
        <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary block">
          {t.clickTilePrompt}
        </span>

        <div className="flex flex-wrap gap-2 pt-1">
          {availableTiles.length === 0 && !isComplete && (
            <span className="text-xs text-text-secondary">Alle Wörter platziert.</span>
          )}
          {availableTiles.map((tile) => (
            <button
              type="button"
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className="px-3.5 py-2 bg-surface-2 hover:bg-surface-raised text-text text-xs font-medium rounded-full border border-border shadow-xs hover:-translate-y-0.5 transition-all select-none cursor-pointer min-h-[36px]"
            >
              {tile.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
