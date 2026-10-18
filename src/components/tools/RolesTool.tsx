import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useWakeLock } from '../../hooks/useWakeLock';
import { shuffle } from '../../utils/random';
import { loadPresentNames } from '../../utils/groupNames';
import { tr, Panel, Label, ChoiceChips, primaryBtn, secondaryBtn, chipCls } from './common';
import { PassAround } from './PassAround';
import { GroupManager } from './GroupManager';

type Game = 'spy' | 'whoami' | 'werewolf' | 'killer';

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
          allLabel={L('Klassisch (mit Ausscheiden)', 'Classic (with elimination)')}
          options={variants.map((x) => ({ id: x.id, label: x.name[language] }))}
        />
      </div>
      {v && (
        <div className="p-4 rounded-card bg-accent-subtle border border-accent/30 text-xs space-y-1.5">
          <p className="font-bold text-accent-text">{v.summary[language]}</p>
          <ul className="list-disc pl-4 space-y-1 text-text-secondary">
            {v.rules[language].flatMap((r) => r.split('|')).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ---------------- Spy with Timer & Voting Helper ---------------- */
const SpyGame: React.FC<{ language: Language; names: string[] }> = ({ language, names }) => {
  const L = tr(language);
  const [packId, setPackId] = useState(SPY_PACKS[0]?.id ?? '');
  const [phase, setPhase] = useState<'setup' | 'deal' | 'play'>('setup');
  const [deal, setDeal] = useState<{ location: string; roles: string[]; spy: number } | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Round timer state (default 8 minutes / 480 seconds)
  const [timerDuration, setTimerDuration] = useState(480);
  const [secondsLeft, setSecondsLeft] = useState(480);
  const [timerRunning, setTimerRunning] = useState(false);
  const endRef = useRef(0);

  // Voting helper
  const [accused, setAccused] = useState<string | null>(null);

  useWakeLock(phase !== 'setup');

  useEffect(() => {
    if (!timerRunning || phase !== 'play') return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        setTimerRunning(false);
        try {
          navigator.vibrate?.([200, 100, 200]);
        } catch {
          /* ignore */
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [timerRunning, phase]);

  const startTimer = () => {
    endRef.current = Date.now() + secondsLeft * 1000;
    setTimerRunning(true);
  };

  const start = () => {
    const pack = SPY_PACKS.find((p) => p.id === packId) ?? SPY_PACKS[0];
    const loc = shuffle(pack.locations)[0];
    const roles = shuffle(loc.roles).map((r) => r[language]);
    setDeal({ location: loc.name[language], roles, spy: Math.floor(Math.random() * names.length) });
    setRevealed(false);
    setSecondsLeft(timerDuration);
    setTimerRunning(false);
    setAccused(null);
    setPhase('deal');
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <div>
            <Label>{L('Themenpaket', 'Pack')}</Label>
            <ChoiceChips
              value={packId}
              onChange={(id) => id && setPackId(id)}
              options={SPY_PACKS.map((p) => ({ id: p.id, label: p.name[language] }))}
            />
          </div>

          <div>
            <Label>{L('Rundenzeit', 'Round duration')}</Label>
            <div className="flex gap-2">
              {[300, 480, 600].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setTimerDuration(sec);
                    setSecondsLeft(sec);
                  }}
                  className={chipCls(timerDuration === sec)}
                >
                  {sec / 60} Min.
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <button
          type="button"
          onClick={start}
          disabled={names.length < 3}
          className={`${primaryBtn} w-full`}
        >
          {L('Karten verteilen', 'Deal cards')} ({names.length} {L('Personen', 'players')})
        </button>
        {names.length < 3 && (
          <p className="text-xs text-text-tertiary">
            {L('Mindestens 3 anwesende Personen in „Meine Gruppe“ erforderlich.', 'At least 3 present players required.')}
          </p>
        )}
      </div>
    );
  }

  if (phase === 'deal' && deal) {
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Runde starten (Timer läuft)', 'Start round (Timer on)')}
        onDone={() => {
          setPhase('play');
          endRef.current = Date.now() + secondsLeft * 1000;
          setTimerRunning(true);
        }}
        renderCard={(i) =>
          i === deal.spy ? (
            <div className="p-6 rounded-card bg-accent-subtle border border-accent/30 space-y-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-accent-text">🕵️ Geheime Rolle</span>
              <p className="text-3xl font-extrabold text-accent-text">{L('Du bist der Spion!', 'You are the spy!')}</p>
              <p className="text-xs text-text-secondary mt-2">
                {L('Du kennst den Ort nicht. Höre aufmerksam zu und versuche herauszufinden, wo ihr seid, ohne dich zu verraten.', 'You do not know the location. Listen carefully and deduce it without blowing your cover.')}
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-card bg-surface-2 border border-border space-y-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">{L('Geheimer Ort', 'Secret Location')}</span>
              <p className="text-3xl font-extrabold text-text">{deal.location}</p>
              <p className="text-xs text-text-secondary mt-2">
                {L('Deine Rolle', 'Your role')}: <strong className="text-text">{deal.roles[i % deal.roles.length]}</strong>
              </p>
            </div>
          )
        }
      />
    );
  }

  const fmtMinSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Timer & Round Status */}
      <Panel className="text-center py-6 space-y-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-accent-text">
            {L('Die Runde läuft', 'The round is on')}
          </span>
          <div className="text-5xl sm:text-6xl font-mono font-extrabold text-text tabular-nums my-2">
            {fmtMinSec(secondsLeft)}
          </div>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            {L('Stellt euch reihum Fragen zum Ort. Wer glaubt, den Spion zu kennen, darf eine Abstimmung verlangen.', 'Take turns asking questions about the location. Anyone who suspects the spy may call a vote.')}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => (timerRunning ? setTimerRunning(false) : startTimer())}
            className="px-4 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs"
          >
            {timerRunning ? L('Timer Pause', 'Pause timer') : L('Timer Start', 'Resume timer')}
          </button>
        </div>
      </Panel>

      {/* Voting Helper ("Abstimmungshilfe") */}
      <Panel className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text">
          {L('Abstimmungshilfe: Wer wird verdächtigt?', 'Voting Helper: Who is accused?')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {names.map((person) => (
            <button
              key={person}
              type="button"
              onClick={() => setAccused(accused === person ? null : person)}
              className={chipCls(accused === person)}
            >
              {person}
            </button>
          ))}
        </div>
        {accused && (
          <p className="text-xs text-text-secondary bg-surface-2 p-3 rounded-control border border-border">
            {L(
              `Stimmt jetzt alle ab: Wer glaubt, dass ${accused} der Spion ist? Wenn eine Mehrheit dafür stimmt, muss ${accused} die Identität enthüllen.`,
              `Vote now: Who believes ${accused} is the spy? If a majority agrees, ${accused} must reveal their identity.`
            )}
          </p>
        )}
      </Panel>

      {/* Resolution */}
      {revealed && deal && (
        <Panel className="text-center py-4 bg-accent-subtle border border-accent/30">
          <p className="text-sm font-bold text-accent-text">
            {L('Ort', 'Location')}: <strong className="text-text">{deal.location}</strong> · {L('Spion war', 'Spy was')}: <strong className="text-text">{names[deal.spy]}</strong>
          </p>
        </Panel>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className={`${secondaryBtn} flex-1`}
        >
          {L('Spion & Ort auflösen', 'Reveal')}
        </button>
        <button
          type="button"
          onClick={() => setPhase('setup')}
          className={`${primaryBtn} flex-1`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{L('Neue Runde', 'New round')}</span>
        </button>
      </div>
    </div>
  );
};

/* ---------------- Who am I ---------------- */
const WhoAmIGame: React.FC<{ language: Language; names: string[] }> = ({ language, names }) => {
  const L = tr(language);
  const [packId, setPackId] = useState(WHO_AM_I_PACKS[0]?.id ?? '');
  const [deal, setDeal] = useState<string[] | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    const pack = WHO_AM_I_PACKS.find((p) => p.id === packId) ?? WHO_AM_I_PACKS[0];
    const entries = shuffle(pack.entries).slice(0, names.length).map((e) => e[language]);
    setDeal(entries);
    setDone(false);
  };

  if (!deal) {
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <div>
            <Label>{L('Themenpaket', 'Pack')}</Label>
            <ChoiceChips
              value={packId}
              onChange={(id) => id && setPackId(id)}
              options={WHO_AM_I_PACKS.map((p) => ({
                id: p.id,
                label: `${p.name[language]} · ${'●'.repeat(p.difficulty)}`,
              }))}
            />
          </div>
        </Panel>
        <button
          type="button"
          onClick={start}
          disabled={names.length < 2}
          className={`${primaryBtn} w-full`}
        >
          {L('Begriffe verteilen', 'Deal terms')} ({names.length} {L('Personen', 'players')})
        </button>
        <p className="text-xs text-text-tertiary">
          {L('Jede Person bekommt einen Begriff, den alle anderen sehen, nur sie selbst nicht. Schreibt ihn auf einen Zettel und klebt ihn auf die Stirn.', 'Each person gets a term that everyone else sees but they do not. Write it on a sticky note and stick it on their forehead.')}
        </p>
      </div>
    );
  }

  if (!done) {
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Fertig (Alle Zettel sind geklebt)', 'Done')}
        hiddenHint={(n) => L(`Alle außer ${n} schauen. Handy zeigen an`, `Everyone except ${n} looks. Show phone to`)}
        onDone={() => setDone(true)}
        renderCard={(i) => (
          <div className="p-6 rounded-card bg-surface-2 border border-border">
            <p className="text-2xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
              {L('Der Begriff für den Zettel auf der Stirn', 'The term for their forehead')}
            </p>
            <p className="text-3xl font-extrabold text-text">{deal[i]}</p>
          </div>
        )}
      />
    );
  }

  return (
    <Panel className="text-center py-8 space-y-4">
      <p className="text-lg font-bold">{L('Alle haben ihren Zettel', 'Everyone has a note')}</p>
      <p className="text-xs text-text-secondary max-w-md mx-auto">
        {L('Stellt reihum Ja-Nein-Fragen, bis ihr euren Begriff erraten habt. Bei einem „Ja“ darf man noch einmal fragen.', 'Take turns asking yes-or-no questions until you guess your term.')}
      </p>
      <button type="button" onClick={() => setDeal(null)} className={secondaryBtn}>
        <RotateCcw className="w-4 h-4" />
        <span>{L('Neue Runde', 'New round')}</span>
      </button>
    </Panel>
  );
};

/* ---------------- Werewolf with Narrator & Quick Setup ---------------- */
const roleOfStep = (id: string): string | null => {
  if (id.includes('amor')) return 'amor';
  if (id.includes('beschuetzer')) return 'beschuetzer';
  if (id.includes('hexe')) return 'hexe';
  if (id.includes('seherin')) return 'seherin';
  if (id.includes('jaeger')) return 'jaeger';
  return null;
};

const WerewolfGame: React.FC<{ language: Language; names: string[] }> = ({ language, names }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<'setup' | 'deal' | 'narrate'>('setup');
  const [cards, setCards] = useState<string[]>([]);
  const [variant, setVariant] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [night, setNight] = useState(1);

  // Quick Role Config
  const [wolvesCount, setWolvesCount] = useState(() => Math.max(1, Math.round(names.length / 4)));
  const [amorEnabled, setAmorEnabled] = useState(true);
  const [hexeEnabled, setHexeEnabled] = useState(true);
  const [seherinEnabled, setSeherinEnabled] = useState(true);
  const [jaegerEnabled, setJaegerEnabled] = useState(false);

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
    const roles: string[] = Array(wolvesCount).fill('werwolf');
    if (seherinEnabled) roles.push('seherin');
    if (hexeEnabled) roles.push('hexe');
    if (amorEnabled) roles.push('amor');
    if (jaegerEnabled) roles.push('jaeger');
    while (roles.length < names.length) roles.push('dorfbewohner');

    setCards(shuffle(roles.slice(0, names.length)));
    setPhase('deal');
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text">
            {L('Schnellkonfiguration der Rollen', 'Quick Role Setup')}
          </h4>

          {/* Wolves Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text">🐺 {L('Werwölfe', 'Werewolves')}</span>
            <div className="flex items-center gap-1 bg-surface-2 rounded-control p-1">
              <button
                type="button"
                onClick={() => setWolvesCount(Math.max(1, wolvesCount - 1))}
                className="w-8 h-8 rounded-control bg-surface font-bold text-xs"
              >
                -
              </button>
              <span className="text-xs font-bold px-2 tabular-nums">{wolvesCount}</span>
              <button
                type="button"
                onClick={() => setWolvesCount(Math.min(Math.floor(names.length / 2), wolvesCount + 1))}
                className="w-8 h-8 rounded-control bg-surface font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Special Roles Toggles */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSeherinEnabled(!seherinEnabled)}
              className={chipCls(seherinEnabled)}
            >
              🔮 {L('Seherin', 'Seer')}
            </button>
            <button
              type="button"
              onClick={() => setHexeEnabled(!hexeEnabled)}
              className={chipCls(hexeEnabled)}
            >
              🧙‍♀️ {L('Hexe', 'Witch')}
            </button>
            <button
              type="button"
              onClick={() => setAmorEnabled(!amorEnabled)}
              className={chipCls(amorEnabled)}
            >
              💘 {L('Amor', 'Cupid')}
            </button>
            <button
              type="button"
              onClick={() => setJaegerEnabled(!jaegerEnabled)}
              className={chipCls(jaegerEnabled)}
            >
              🏹 {L('Jäger', 'Hunter')}
            </button>
          </div>

          <VariantPicker
            language={language}
            variants={WEREWOLF_VARIANTS}
            value={variant}
            onChange={setVariant}
          />
        </Panel>

        <button
          type="button"
          onClick={start}
          disabled={names.length < 5}
          className={`${primaryBtn} w-full`}
        >
          {L('Rollen geheim verteilen', 'Deal secret roles')} ({names.length} {L('Personen', 'players')})
        </button>
        {names.length < 5 && (
          <p className="text-xs text-text-tertiary">
            {L('Mindestens 5 anwesende Personen in „Meine Gruppe“ empfohlen.', 'At least 5 present players recommended.')}
          </p>
        )}
      </div>
    );
  }

  if (phase === 'deal') {
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Spielleitung übernimmt Erzähler-Modus', 'Narrator takes over')}
        onDone={() => {
          setStepIdx(0);
          setNight(1);
          setPhase('narrate');
        }}
        renderCard={(i) => {
          const role = WEREWOLF_ROLES.find((r) => r.id === cards[i]);
          return (
            <div className="p-6 rounded-card bg-surface-2 border border-border space-y-2">
              <p className="text-2xs font-bold uppercase tracking-wider text-accent-text">
                {role?.team === 'wolves' ? (language === 'de' ? 'Wölfe' : 'Wolves') : (language === 'de' ? 'Dorfbewohner' : 'Villagers')}
              </p>
              <p className="text-3xl font-extrabold text-text">{role?.name[language]}</p>
              <p className="text-xs text-text-secondary mt-3 max-w-md mx-auto leading-relaxed">
                {role?.description[language]}
              </p>
            </div>
          );
        }}
      />
    );
  }

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
      {/* Night Header */}
      <div className="flex flex-wrap items-center justify-between text-xs text-text-secondary">
        <span className="font-bold text-accent-text">
          {L(`Nacht ${night}`, `Night ${night}`)}
        </span>
        <span>
          {L('Im Spiel', 'In play')}: {[...used].map(roleName).join(', ')}
        </span>
      </div>

      {/* Large Narrator Card */}
      <Panel className="py-8 sm:py-12 text-center space-y-4">
        <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
          {step?.phase === 'night' ? '🌙 ' + L('Nacht', 'Night') : '☀️ ' + L('Tag', 'Day')} · {stepIdx + 1} / {steps.length}
        </span>
        <h2 className="text-2xl font-bold text-text">{step?.title[language]}</h2>
        <p className="text-xl sm:text-2xl leading-relaxed text-text font-serif italic max-w-lg mx-auto">
          „{step?.script[language]}“
        </p>
      </Panel>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          className={secondaryBtn}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={next} className={`${primaryBtn} flex-1`}>
          <span>{step?.id === 'day-naechste-nacht' ? L('Nächste Nacht', 'Next night') : L('Weiter', 'Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setPhase('setup')}
        className="text-xs text-text-tertiary hover:text-text underline block mx-auto pt-2"
      >
        {L('Runde beenden & zurück', 'End game and return')}
      </button>
    </div>
  );
};

/* ---------------- Killer Game with Variants ---------------- */
const KillerGame: React.FC<{ language: Language; names: string[] }> = ({ language, names }) => {
  const L = tr(language);
  const [variant, setVariant] = useState<string | null>(KILLER_VARIANTS[0]?.id ?? null);
  const [cards, setCards] = useState<string[] | null>(null);
  const [dealt, setDealt] = useState(false);

  const start = () => {
    const base = ['zwinkerer', 'detektiv', ...Array(Math.max(0, names.length - 2)).fill('mitspieler')];
    setCards(shuffle(base));
    setDealt(false);
  };

  if (!cards) {
    return (
      <div className="space-y-4">
        <Panel className="space-y-4">
          <VariantPicker
            language={language}
            variants={KILLER_VARIANTS}
            value={variant}
            onChange={setVariant}
          />
        </Panel>
        <button
          type="button"
          onClick={start}
          disabled={names.length < 4}
          className={`${primaryBtn} w-full`}
        >
          {L('Rollen verteilen', 'Deal roles')} ({names.length} {L('Personen', 'players')})
        </button>
        {names.length < 4 && (
          <p className="text-xs text-text-tertiary">
            {L('Mindestens 4 anwesende Personen in „Meine Gruppe“ erforderlich.', 'At least 4 present players required.')}
          </p>
        )}
      </div>
    );
  }

  if (!dealt) {
    return (
      <PassAround
        language={language}
        players={names}
        doneLabel={L('Spiel starten', 'Start game')}
        onDone={() => setDealt(true)}
        renderCard={(i) => {
          const role = KILLER_ROLES.find((r) => r.id === cards[i]);
          return (
            <div className="p-6 rounded-card bg-surface-2 border border-border space-y-2">
              <p className="text-3xl font-extrabold text-text">{role?.name[language]}</p>
              <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
                {role?.description[language]}
              </p>
            </div>
          );
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Panel className="text-center py-8 space-y-3">
        <p className="text-lg font-bold">{L('Das Spiel läuft', 'The game is on')}</p>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          {L('Alle schauen sich im Kreis an. Der Detektiv hat drei Versuche, den Mörder zu entlarven, bevor dieser alle Mitspielenden erwischt hat.', 'Everyone watches each other in the circle. The detective has three guesses.')}
        </p>
      </Panel>
      <button
        type="button"
        onClick={() => setCards(null)}
        className={`${secondaryBtn} w-full`}
      >
        <RotateCcw className="w-4 h-4" />
        <span>{L('Neue Runde', 'New round')}</span>
      </button>
    </div>
  );
};

/* ---------------- Main RolesTool ---------------- */
export const RolesTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [names, setNames] = useState<string[]>(() => loadPresentNames());
  const [game, setGame] = useState<Game>('spy');
  const [showHelp, setShowHelp] = useState(false);

  const games: { id: Game; label: string }[] = [
    { id: 'spy', label: L('Spion', 'Spy') },
    { id: 'whoami', label: L('Wer bin ich?', 'Who am I?') },
    { id: 'werewolf', label: L('Werwölfe', 'Werewolf') },
    { id: 'killer', label: L('Mörder', 'Killer') },
  ];

  const handleNamesChange = React.useCallback((presentList: string[]) => {
    setNames((prev) => {
      if (prev.length === presentList.length && prev.every((n, i) => n === presentList[i])) {
        return prev;
      }
      return presentList;
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* "So geht's" Expandable Help */}
      <div className="bg-surface-2 rounded-card border border-border p-4">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-text cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-text" />
            <span>{L('So geht’s: Rollenverteiler für Gesellschaftsspiele', 'How it works: Role Dealer')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Verteilt geheime Spielkarten ohne Kartenspiel. Das Handy wird reihum weitergegeben. Jede Person sieht nur ihre eigene Rolle – sicher vor fremden Blicken.',
              'Deals secret game roles without physical playing cards. The phone is passed around in the circle. Each player only sees their private card.'
            )}
          </p>
        )}
      </div>

      {/* 1. Group Manager */}
      <GroupManager
        language={language}
        onNamesChange={handleNamesChange}
      />

      {/* 2. Game Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {games.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={game === g.id}
            onClick={() => setGame(g.id)}
            className={chipCls(game === g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 3. Game Content */}
      {game === 'spy' && <SpyGame language={language} names={names} />}
      {game === 'whoami' && <WhoAmIGame language={language} names={names} />}
      {game === 'werewolf' && <WerewolfGame language={language} names={names} />}
      {game === 'killer' && <KillerGame language={language} names={names} />}
    </div>
  );
};
