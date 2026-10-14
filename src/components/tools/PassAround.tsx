import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Language } from '../../types';
import { tr, Panel, primaryBtn, secondaryBtn } from './common';

interface Props {
  language: Language;
  players: string[];
  /** Content shown to player i while revealed */
  renderCard: (index: number) => React.ReactNode;
  /** Text above the hidden card, e.g. "Gib das Handy an" */
  hiddenHint?: (name: string) => string;
  onDone: () => void;
  doneLabel: string;
}

/** Pass-the-phone reveal: show one private card at a time, then hide it again. */
export const PassAround: React.FC<Props> = ({ language, players, renderCard, hiddenHint, onDone, doneLabel }) => {
  const L = tr(language);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const last = i >= players.length - 1;

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-tertiary tabular-nums text-center">
        {i + 1} / {players.length}
      </p>
      <Panel className="min-h-[260px] flex flex-col items-center justify-center text-center">
        {!shown ? (
          <>
            <p className="text-sm text-text-secondary mb-1">{hiddenHint ? hiddenHint(players[i]) : L('Gib das Handy an', 'Hand the phone to')}</p>
            <p className="text-3xl font-semibold text-text mb-6">{players[i]}</p>
            <button type="button" onClick={() => setShown(true)} className={primaryBtn}>
              <Eye className="w-5 h-5" />
              {L('Karte zeigen', 'Show card')}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-3">{players[i]}</p>
            <div className="mb-6 w-full">{renderCard(i)}</div>
            <button
              type="button"
              onClick={() => {
                setShown(false);
                if (!last) setI(i + 1);
                else onDone();
              }}
              className={secondaryBtn}
            >
              <EyeOff className="w-4 h-4" />
              {last ? doneLabel : L('Verbergen und weitergeben', 'Hide and pass on')}
            </button>
          </>
        )}
      </Panel>
    </div>
  );
};
