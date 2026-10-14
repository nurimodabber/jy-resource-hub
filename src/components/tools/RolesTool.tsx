import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Language } from '../../types';
import {
  SPY_PACKS,
  WHO_AM_I_PACKS,
  WEREWOLF_ROLES,
  WEREWOLF_NARRATOR,
  WEREWOLF_VARIANTS,
  KILLER_ROLES,
  KILLER_VARIANTS,
  NoOneOutVariant,
} from '../../data/roleContent';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { shuffle } from '../../utils/random';
import { NAMES_KEY, parseNames } from '../../utils/groupNames';
import { tr, Panel, Label, ChoiceChips, primaryBtn, secondaryBtn, chipCls } from './common';
import { PassAround } from './PassAround';

type Game = 'spy' | 'whoami' | 'werewolf' | 'killer';

const useNames = () => {
  const [text, setText] = useLocalState<string>(NAMES_KEY, '');
  const names = useMemo(() => parseNames(text), [text]);
  return { text, setText, names };
};

const NamesField: React.FC<{ language: Language; text: string; onChange: (s: string) => void; count: number }> = ({ language, text, onChange, count }) => {
  const L = tr(language);
  return (
    <div>
      <Label htmlFor="roles-names">{L('Mitspielende (ein Name pro Zeile oder mit Komma)', 'Players (one name per line or comma-separated)')}</Label>
      <textarea
        id="roles-names"
        rows={3}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-xl bg-surface-2 border border-border text-sm"
        placeholder="Amin, Leyla, Jonas, Maya"
      />
      <p className="text-xs text-text-tertiary mt-1 tabular-nums">{L(`${count} Personen`, `${count} players`)}</p>
    </div>
  );
};

const VariantPicker: React.FC<{ language: Language; variants: NoOneOutVariant[]; value: string | null; onChange: (id: string | null) => void }> = ({
  language,
  variants,
  value,
  onChange,
}) => {
  const L = tr(language);
  const v = variants.find((x) => x.id === value);
  return (
    <div className="space-y-3">
      <div>
        <Label>{L('Variante, bei der niemand ausscheidet', 'Variant where nobody is out')}</Label>
        <ChoiceChips
          value={value}
          onChange={onChange}
          allLabel={L('Klassisch', 'Classic')}
          options={variants.map((x) => ({ id: x.id, label: x.name[language] }))}
        />
      </div>
      {v && (
        <div className="p-4 rounded-xl bg-surface-2 border border-border text-sm">
          <p className="text-text mb-2">{v.summary[language]}</p>
          <ul className="list-disc pl-5 space-y-1 text-text-secondary">
            {v.rules[language].flatMap((r) => r.split('|')).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ---------------- Spy ---------------- */
const SpyGame: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const { text, setText, names } = useNames();
  const [packId, setPackId] = useState(SPY_PACKS[0]?.id ?? '');
  const [phase, setPhase] = useState<'setup' | 'deal' | 'play'>('setup');
  const [deal, setDeal] = useState<{ location: string; roles: string[]; spy: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  useWakeLock(phase !== 'setup');

  const start = () => {
    const pack = SPY_PACKS.find((p) => p.id === packId) ?? SPY_PACKS[0];
    const loc = shuffle(pack.locations)[0];
    const roles = shuffle(loc.roles).map((r) => r[language]);
    setDeal({ location: loc.name[language], roles, spy: Math.floor(Math.random() * names.length) });
    setRevealed(false);
    setPhase('deal');
  };

  if (phase === 'setup')
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <NamesField language={language} text={text} onChange={setText} count={names.length} />
          <div>
            <Label>{L('Themenpaket', 'Pack')}</Label>
            <ChoiceChips value={packId} onChange={(id) => id && setPackId(id)} options={SPY_PACKS.map((p) => ({ id: p.id, label: p.name[language] }))} />
          </div>
        </Panel>
        <button type="button" onClick={start} disabled={names.length < 3} className={`${primaryBtn} w-full`}>
          {L('Karten verteilen', 'Deal cards')}
        </button>
        {names.length < 3 && <p className="text-xs text-text-tertiary">{L('Mindestens 3 Personen.', 'At least 3 players.')}</p>}
      </div>
    );

  if (phase === 'deal' && deal)
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Runde starten', 'Start round')}
        onDone={() => setPhase('play')}
        renderCard={(i) =>
          i === deal.spy ? (
            <p className="text-3xl font-semibold text-accent-text">{L('Du bist der Spion', 'You are the spy')}</p>
          ) : (
            <div>
              <p className="text-xs text-text-tertiary">{L('Ort', 'Location')}</p>
              <p className="text-3xl font-semibold text-text">{deal.location}</p>
              <p className="text-sm text-text-secondary mt-3">{L('Deine Rolle', 'Your role')}: {deal.roles[i % deal.roles.length]}</p>
            </div>
          )
        }
      />
    );

  return (
    <div className="space-y-4">
      <Panel className="text-center py-8">
        <p className="text-lg font-semibold">{L('Die Runde läuft', 'The round is on')}</p>
        <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          {L('Stellt euch reihum Fragen zum Ort. Wer glaubt, den Spion zu kennen, darf eine Abstimmung verlangen.', 'Take turns asking each other questions about the location. Anyone who thinks they know the spy may call a vote.')}
        </p>
        {revealed && deal && (
          <p className="mt-5 text-sm">
            {L('Ort', 'Location')}: <strong>{deal.location}</strong> · {L('Spion', 'Spy')}: <strong>{names[deal.spy]}</strong>
          </p>
        )}
      </Panel>
      <div className="flex gap-2">
        <button type="button" onClick={() => setRevealed(true)} disabled={revealed} className={`${secondaryBtn} flex-1`}>
          {L('Auflösen', 'Reveal')}
        </button>
        <button type="button" onClick={() => setPhase('setup')} className={`${primaryBtn} flex-1`}>
          <RotateCcw className="w-4 h-4" />
          {L('Neue Runde', 'New round')}
        </button>
      </div>
    </div>
  );
};

/* ---------------- Who am I ---------------- */
const WhoAmIGame: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const { text, setText, names } = useNames();
  const [packId, setPackId] = useState(WHO_AM_I_PACKS[0]?.id ?? '');
  const [deal, setDeal] = useState<string[] | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    const pack = WHO_AM_I_PACKS.find((p) => p.id === packId) ?? WHO_AM_I_PACKS[0];
    const entries = shuffle(pack.entries).slice(0, names.length).map((e) => e[language]);
    setDeal(entries);
    setDone(false);
  };

  if (!deal)
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <NamesField language={language} text={text} onChange={setText} count={names.length} />
          <div>
            <Label>{L('Themenpaket', 'Pack')}</Label>
            <ChoiceChips
              value={packId}
              onChange={(id) => id && setPackId(id)}
              options={WHO_AM_I_PACKS.map((p) => ({ id: p.id, label: `${p.name[language]} · ${'●'.repeat(p.difficulty)}` }))}
            />
          </div>
        </Panel>
        <button type="button" onClick={start} disabled={names.length < 2} className={`${primaryBtn} w-full`}>
          {L('Begriffe verteilen', 'Deal terms')}
        </button>
        <p className="text-xs text-text-tertiary">
          {L('Jede Person bekommt einen Begriff, den alle anderen sehen, nur sie selbst nicht. Schreibt ihn auf einen Zettel und klebt ihn auf die Stirn.', 'Each person gets a term that everyone else sees but they do not. Write it on a sticky note and stick it on their forehead.')}
        </p>
      </div>
    );

  if (!done)
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Fertig', 'Done')}
        hiddenHint={(n) => L(`Alle außer ${n} schauen. Handy zeigen an`, `Everyone except ${n} looks. Show the phone to`)}
        onDone={() => setDone(true)}
        renderCard={(i) => (
          <div>
            <p className="text-xs text-text-tertiary">{L('Der Begriff für den Zettel', 'The term for the note')}</p>
            <p className="text-3xl font-semibold text-text">{deal[i]}</p>
          </div>
        )}
      />
    );

  return (
    <Panel className="text-center py-8 space-y-4">
      <p className="text-lg font-semibold">{L('Alle haben ihren Zettel', 'Everyone has a note')}</p>
      <p className="text-sm text-text-secondary">{L('Stellt reihum Ja-Nein-Fragen, bis ihr euren Begriff erraten habt.', 'Take turns asking yes-or-no questions until you guess your term.')}</p>
      <button type="button" onClick={() => setDeal(null)} className={secondaryBtn}>
        <RotateCcw className="w-4 h-4" />
        {L('Neue Runde', 'New round')}
      </button>
    </Panel>
  );
};

/* ---------------- Werewolf ---------------- */
const roleOfStep = (id: string): string | null => {
  if (id.includes('amor')) return 'amor';
  if (id.includes('beschuetzer')) return 'beschuetzer';
  if (id.includes('hexe')) return 'hexe';
  if (id.includes('seherin')) return 'seherin';
  if (id.includes('jaeger')) return 'jaeger';
  return null;
};

const recommended = (n: number): string[] => {
  const wolves = Math.max(1, Math.round(n / 4));
  const out: string[] = Array(wolves).fill('werwolf');
  if (n >= 7) out.push('seherin');
  if (n >= 8) out.push('hexe');
  if (n >= 9) out.push('jaeger');
  while (out.length < n) out.push('dorfbewohner');
  return out.slice(0, n);
};

const WerewolfGame: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const { text, setText, names } = useNames();
  const [phase, setPhase] = useState<'setup' | 'deal' | 'narrate'>('setup');
  const [cards, setCards] = useState<string[]>([]);
  const [variant, setVariant] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [night, setNight] = useState(1);
  useWakeLock(phase === 'narrate');

  const used = useMemo(() => new Set(cards), [cards]);
  const steps = useMemo(
    () =>
      WEREWOLF_NARRATOR.filter((s) => {
        const r = roleOfStep(s.id);
        if (r && !used.has(r)) return false;
        if (s.id === 'setup-karten') return false;
        if (s.id === 'setup-augen' && night > 1) return false;
        if (s.id.startsWith('night-amor') && night > 1) return false;
        return true;
      }),
    [used, night],
  );
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  const roleName = (id: string) => WEREWOLF_ROLES.find((r) => r.id === id)?.name[language] ?? id;

  const start = () => {
    setCards(shuffle(recommended(names.length)));
    setPhase('deal');
  };

  if (phase === 'setup')
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <NamesField language={language} text={text} onChange={setText} count={names.length} />
          <VariantPicker language={language} variants={WEREWOLF_VARIANTS} value={variant} onChange={setVariant} />
        </Panel>
        <button type="button" onClick={start} disabled={names.length < 6} className={`${primaryBtn} w-full`}>
          {L('Rollen verteilen', 'Deal roles')}
        </button>
        <p className="text-xs text-text-tertiary">
          {names.length < 6
            ? L('Ab 6 Personen. Die Rollen werden passend zur Gruppengröße gewählt.', 'From 6 players. Roles are chosen to fit the group size.')
            : L('Die Rollen werden passend zur Gruppengröße gewählt.', 'Roles are chosen to fit the group size.')}
        </p>
      </div>
    );

  if (phase === 'deal')
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Spielleitung übernimmt', 'Narrator takes over')}
        onDone={() => {
          setStepIdx(0);
          setNight(1);
          setPhase('narrate');
        }}
        renderCard={(i) => {
          const role = WEREWOLF_ROLES.find((r) => r.id === cards[i]);
          return (
            <div>
              <p className="text-3xl font-semibold text-text">{role?.name[language]}</p>
              <p className="text-sm text-text-secondary mt-3 max-w-md mx-auto">{role?.description[language]}</p>
            </div>
          );
        }}
      />
    );

  const next = () => {
    if (step?.id === 'day-naechste-nacht') {
      setNight(night + 1);
      setStepIdx(0);
      return;
    }
    setStepIdx(Math.min(stepIdx + 1, steps.length - 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span className="tabular-nums">{L(`Nacht ${night}`, `Night ${night}`)}</span>
        <span>{L('Im Spiel', 'In play')}: {[...used].map(roleName).join(', ')}</span>
      </div>
      <Panel className="py-8 sm:py-12">
        <p className="text-xs text-text-tertiary mb-1">
          {step?.phase === 'night' ? L('Nacht', 'Night') : L('Tag', 'Day')} · <span className="tabular-nums">{stepIdx + 1} / {steps.length}</span>
        </p>
        <h2 className="text-2xl font-semibold text-text mb-4">{step?.title[language]}</h2>
        <p className="text-xl sm:text-2xl leading-relaxed text-text text-balance">{step?.script[language]}</p>
      </Panel>
      {variant && (
        <details className="text-sm border border-border rounded-xl bg-surface p-3">
          <summary className="cursor-pointer font-medium">{WEREWOLF_VARIANTS.find((v) => v.id === variant)?.name[language]}</summary>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-text-secondary">
            {WEREWOLF_VARIANTS.find((v) => v.id === variant)?.rules[language].flatMap((r) => r.split('|')).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </details>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0} className={secondaryBtn} aria-label={L('Zurück', 'Back')}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={next} className={`${primaryBtn} flex-1`}>
          {step?.id === 'day-naechste-nacht' ? L('Nächste Nacht', 'Next night') : L('Weiter', 'Next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <button type="button" onClick={() => setPhase('setup')} className="text-sm text-text-secondary underline">
        {L('Spiel beenden', 'End game')}
      </button>
    </div>
  );
};

/* ---------------- Killer ---------------- */
const KillerGame: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const { text, setText, names } = useNames();
  const [variant, setVariant] = useState<string | null>(KILLER_VARIANTS[0]?.id ?? null);
  const [cards, setCards] = useState<string[] | null>(null);
  const [dealt, setDealt] = useState(false);

  const start = () => {
    const base = ['zwinkerer', 'detektiv', ...Array(Math.max(0, names.length - 2)).fill('mitspieler')];
    setCards(shuffle(base));
    setDealt(false);
  };

  if (!cards)
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <NamesField language={language} text={text} onChange={setText} count={names.length} />
          <VariantPicker language={language} variants={KILLER_VARIANTS} value={variant} onChange={setVariant} />
        </Panel>
        <button type="button" onClick={start} disabled={names.length < 4} className={`${primaryBtn} w-full`}>
          {L('Rollen verteilen', 'Deal roles')}
        </button>
        {names.length < 4 && <p className="text-xs text-text-tertiary">{L('Mindestens 4 Personen.', 'At least 4 players.')}</p>}
      </div>
    );

  if (!dealt)
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Spiel starten', 'Start game')}
        onDone={() => setDealt(true)}
        renderCard={(i) => {
          const role = KILLER_ROLES.find((r) => r.id === cards[i]);
          return (
            <div>
              <p className="text-3xl font-semibold text-text">{role?.name[language]}</p>
              <p className="text-sm text-text-secondary mt-3 max-w-md mx-auto">{role?.description[language]}</p>
            </div>
          );
        }}
      />
    );

  return (
    <div className="space-y-4">
      <Panel className="text-center py-8">
        <p className="text-lg font-semibold">{L('Das Spiel läuft', 'The game is on')}</p>
        <p className="text-sm text-text-secondary mt-1">{L('Alle schauen sich im Kreis an. Der Detektiv hat drei Versuche.', 'Everyone looks around the circle. The detective has three guesses.')}</p>
      </Panel>
      {variant && <VariantPicker language={language} variants={KILLER_VARIANTS} value={variant} onChange={setVariant} />}
      <button type="button" onClick={() => setCards(null)} className={`${secondaryBtn} w-full`}>
        <RotateCcw className="w-4 h-4" />
        {L('Neue Runde', 'New round')}
      </button>
    </div>
  );
};

export const RolesTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [game, setGame] = useState<Game>('spy');
  const games: { id: Game; label: string }[] = [
    { id: 'spy', label: L('Spion', 'Spy') },
    { id: 'whoami', label: L('Wer bin ich?', 'Who am I?') },
    { id: 'werewolf', label: L('Werwölfe', 'Werewolf') },
    { id: 'killer', label: L('Mörder', 'Killer') },
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist">
        {games.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={game === g.id} onClick={() => setGame(g.id)} className={chipCls(game === g.id)}>
            {g.label}
          </button>
        ))}
      </div>
      {game === 'spy' && <SpyGame language={language} />}
      {game === 'whoami' && <WhoAmIGame language={language} />}
      {game === 'werewolf' && <WerewolfGame language={language} />}
      {game === 'killer' && <KillerGame language={language} />}
    </div>
  );
};
