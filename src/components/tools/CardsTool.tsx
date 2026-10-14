import React, { useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { Language } from '../../types';
import { DISCUSSION_CARDS } from '../../data/toolkits';
import { shuffle, stripQuotes } from '../../utils/random';
import { tr, Panel, primaryBtn } from './common';

export const CardsTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [deck, setDeck] = useState(() => shuffle(DISCUSSION_CARDS));
  const [i, setI] = useState(0);
  const card = deck[i];
  const next = () => {
    if (i + 1 >= deck.length) {
      setDeck(shuffle(DISCUSSION_CARDS));
      setI(0);
    } else setI(i + 1);
  };
  const deepening = useMemo(() => card?.deepeningQuestions[language] ?? [], [card, language]);
  if (!card) return null;
  return (
    <div className="space-y-5">
      <Panel className="py-8 sm:py-10 space-y-5">
        <p className="text-xs text-text-tertiary tabular-nums">
          {card.theme[language]} · {i + 1} / {deck.length}
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-text leading-snug text-balance">{stripQuotes(card.coreQuestion[language])}</h2>
        <blockquote className="font-serif text-base sm:text-lg text-text-secondary max-w-xl border-l-2 border-border pl-4">
          „{stripQuotes(card.quoteSnippet[language])}“
        </blockquote>
        {deepening.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-text mb-2">{L('Zum Vertiefen', 'To go deeper')}</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              {deepening.map((q, k) => (
                <li key={k}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
      <button type="button" onClick={next} className={`${primaryBtn} w-full`}>
        <Shuffle className="w-4 h-4" />
        {L('Nächste Karte', 'Next card')}
      </button>
    </div>
  );
};
