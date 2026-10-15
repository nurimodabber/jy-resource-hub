import React, { useState } from 'react';
import { Eye, EyeOff, Shuffle } from 'lucide-react';
import { Language } from '../../types';
import { tr, Panel, primaryBtn } from './common';

interface Props {
  language: Language;
  players: string[];
  renderCard: (index: number) => React.ReactNode;
  hiddenHint?: (name: string) => string;
  onDone: () => void;
  doneLabel: string;
}

export const PassAround: React.FC<Props> = ({
  language,
  players,
  renderCard,
  hiddenHint,
  onDone,
  doneLabel
}) => {
  const L = tr(language);
  const [order, setOrder] = useState<number[]>(() => players.map((_, idx) => idx));
  const [stepIdx, setStepIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const playerIdx = order[stepIdx];
  const playerName = players[playerIdx] || '';
  const isLast = stepIdx >= players.length - 1;

  const triggerVibration = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch {
      // ignore
    }
  };

  const handleShow = () => {
    if (isTransitioning) return;
    triggerVibration();
    setShown(true);
  };

  const handleHideAndNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    triggerVibration();
    setShown(false);

    setTimeout(() => {
      if (!isLast) {
        setStepIdx((prev) => prev + 1);
      } else {
        onDone();
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleShuffleOrder = () => {
    if (shown) return;
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {order.map((_, idx) => (
          <span
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
              idx === stepIdx
                ? 'bg-accent w-5'
                : idx < stepIdx
                ? 'bg-accent/40'
                : 'bg-surface-2 border border-border'
            }`}
          />
        ))}
      </div>

      <p className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary tabular-nums text-center">
        {stepIdx + 1} / {players.length} {L('Personen', 'players')}
      </p>

      {/* Main Card Panel (High-contrast, strictly isolated) */}
      <Panel className="min-h-[300px] flex flex-col items-center justify-between text-center p-6 sm:p-8 relative">
        {!shown ? (
          <div className="my-auto space-y-4 w-full">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {hiddenHint ? hiddenHint(playerName) : L('Gib das Handy an', 'Hand the phone to')}
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
              {playerName}
            </h3>
            <p className="text-xs text-text-tertiary">
              {L('Vergewissere dich, dass niemand sonst auf das Display schaut.', 'Make sure nobody else is looking at the screen.')}
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleShow}
                disabled={isTransitioning}
                className={`${primaryBtn} w-full min-h-[52px] text-base`}
              >
                <Eye className="w-5 h-5" />
                <span>{L('Karte aufdecken', 'Reveal card')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="my-auto space-y-5 w-full animate-in zoom-in-95 duration-150">
            <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-chip bg-accent-subtle text-accent-text inline-block">
              {playerName}
            </span>

            {/* Secret Card Content */}
            <div className="w-full py-2">
              {renderCard(playerIdx)}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleHideAndNext}
                disabled={isTransitioning}
                className="w-full px-5 py-3.5 rounded-control bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[52px]"
              >
                <EyeOff className="w-5 h-5" />
                <span>{isLast ? doneLabel : L('Verbergen & weitergeben', 'Hide and pass on')}</span>
              </button>
            </div>
          </div>
        )}
      </Panel>

      {/* Optional Randomization Toggle */}
      {!shown && stepIdx === 0 && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleShuffleOrder}
            className="text-xs text-text-tertiary hover:text-text font-medium inline-flex items-center gap-1.5 cursor-pointer underline"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{L('Reihenfolge der Weitergabe mischen', 'Shuffle pass order')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
