import React, { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { Language } from '../../types';
import { STORY_STARTERS, SORT_CRITERIA, PSYCHIATRIST_RULES } from '../../data/empireContent';
import { shuffle } from '../../utils/random';
import { tr, Panel, primaryBtn, chipCls } from './common';

type Kind = 'sort' | 'story' | 'rule';

const useDeck = <T,>(items: T[]) => {
  const [deck, setDeck] = useState(() => shuffle(items));
  const [i, setI] = useState(0);
  const next = () => {
    if (i + 1 >= deck.length) {
      setDeck(shuffle(items));
      setI(0);
    } else setI(i + 1);
  };
  return { current: deck[i], next, pos: i + 1, total: deck.length };
};

export const IdeasTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [kind, setKind] = useState<Kind>('sort');
  const sort = useDeck(SORT_CRITERIA);
  const story = useDeck(STORY_STARTERS);
  const rule = useDeck(PSYCHIATRIST_RULES);
  const d = kind === 'sort' ? sort : kind === 'story' ? story : rule;
  const text = d.current ? (d.current as { text: { de: string; en: string } }).text[language] : '';
  const info: Record<Kind, string> = {
    sort: L('Alle ordnen sich schweigend in einer Reihe nach diesem Kriterium. Nur Gesten sind erlaubt.', 'Everyone lines up silently by this criterion. Gestures only.'),
    story: L('Reihum erzählt jede Person einen Satz weiter.', 'Take turns adding one sentence each.'),
    rule: L('Eine Person verlässt den Raum. Die Gruppe einigt sich auf diese Regel, danach wird die Person hereingeholt und stellt Fragen.', 'One person leaves the room. The group agrees on this rule, then the person returns and asks questions.'),
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            ['sort', L('Schweigend sortieren', 'Silent line-up')],
            ['story', L('Geschichtenanfang', 'Story starter')],
            ['rule', L('Regel für den Psychiater', 'Psychiatrist rule')],
          ] as [Kind, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={kind === id} onClick={() => setKind(id)} className={chipCls(kind === id)}>
            {label}
          </button>
        ))}
      </div>
      <Panel className="text-center py-10 sm:py-14">
        <p className="text-xs text-text-tertiary tabular-nums mb-3">
          {d.pos} / {d.total}
        </p>
        <p className="text-2xl sm:text-4xl font-semibold text-text text-balance leading-tight">{text}</p>
        <p className="text-sm text-text-secondary mt-5 max-w-md mx-auto">{info[kind]}</p>
      </Panel>
      <button type="button" onClick={d.next} className={`${primaryBtn} w-full`}>
        <Shuffle className="w-4 h-4" />
        {L('Nächste Idee', 'Next idea')}
      </button>
    </div>
  );
};
