import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Undo2, Shuffle, Crown } from 'lucide-react';
import { Language } from '../../types';
import { EMPIRE_CATEGORIES_V2 } from '../../data/empireContent';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { shuffle, normalizeTerm } from '../../utils/random';
import { NAMES_KEY, parseNames } from '../../utils/groupNames';
import { tr, Panel, Label, ChoiceChips, primaryBtn, secondaryBtn, chipCls } from './common';

type Step = 'category' | 'collect' | 'read' | 'play';

interface Kingdom {
  king: string;
  members: string[];
}
interface Move {
  kingdoms: Kingdom[];
  text: string;
}

export const EmpireTool: React.FC<{ language: Language }> = ({ language }) => {
  const L = tr(language);
  const [step, setStep] = useLocalState<Step>('jy_empire_step', 'category');
  const [mood, setMood] = useLocalState<string | null>('jy_empire_mood', null);
  const [age, setAge] = useLocalState<string | null>('jy_empire_age', null);
  const [shyOnly, setShyOnly] = useLocalState<boolean>('jy_empire_shy', false);
  const [history, setHistory] = useLocalState<string[]>('jy_empire_history', []);
  const [cursor, setCursor] = useLocalState<number>('jy_empire_cursor', -1);
  const [namesText, setNamesText] = useLocalState<string>(NAMES_KEY, '');
  const [termsText, setTermsText] = useLocalState<string>('jy_empire_terms', '');
  const [readOrder, setReadOrder] = useLocalState<string[]>('jy_empire_read', []);
  const [readIdx, setReadIdx] = useLocalState<number>('jy_empire_readidx', 0);
  const [kingdoms, setKingdoms] = useLocalState<Kingdom[]>('jy_empire_kingdoms', []);
  const [moves, setMoves] = useState<Move[]>([]);
  const [guesser, setGuesser] = useState<string>('');

  useWakeLock(step !== 'category');

  const pool = useMemo(
    () =>
      EMPIRE_CATEGORIES_V2.filter(
        (c) => !c.personal && (!mood || c.mood === mood) && (!age || c.age === 'all' || c.age === age) && (!shyOnly || c.shy),
      ),
    [mood, age, shyOnly],
  );

  const current = cursor >= 0 ? EMPIRE_CATEGORIES_V2.find((c) => c.id === history[cursor]) : undefined;

  const drawCategory = () => {
    if (cursor < history.length - 1) {
      setCursor(cursor + 1);
      return;
    }
    let candidates = pool.filter((c) => !history.includes(c.id));
    let base = history;
    if (candidates.length === 0) {
      candidates = pool;
      base = [];
    }
    const next = shuffle(candidates)[0];
    if (!next) return;
    const nextHistory = [...base, next.id];
    setHistory(nextHistory);
    setCursor(nextHistory.length - 1);
  };
  useEffect(() => {
    if (cursor < 0 && step === 'category') drawCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const previousCategory = () => cursor > 0 && setCursor(cursor - 1);

  const names = useMemo(() => parseNames(namesText), [namesText]);
  const terms = useMemo(() => termsText.split('\n').map((s) => s.trim()).filter(Boolean), [termsText]);
  const duplicates = useMemo(() => {
    const map = new Map<string, string[]>();
    terms.forEach((t) => {
      const k = normalizeTerm(t);
      map.set(k, [...(map.get(k) || []), t]);
    });
    return [...map.values()].filter((v) => v.length > 1).map((v) => v[0]);
  }, [terms]);

  const startReading = () => {
    setReadOrder(shuffle(terms));
    setReadIdx(0);
    setStep('read');
  };

  const startPlay = () => {
    setKingdoms(names.map((n) => ({ king: n, members: [n] })));
    setMoves([]);
    setGuesser(names[0] || '');
    setStep('play');
  };

  const guessed = (target: string) => {
    const g = kingdoms.find((k) => k.king === guesser);
    const tk = kingdoms.find((k) => k.king === target);
    if (!g || !tk || g === tk) return;
    setMoves((m) => [...m, { kingdoms, text: `${guesser} → ${target}` }]);
    setKingdoms(kingdoms.filter((k) => k !== tk).map((k) => (k === g ? { ...k, members: [...k.members, ...tk.members] } : k)));
  };
  const undo = () => {
    const last = moves[moves.length - 1];
    if (!last) return;
    setKingdoms(last.kingdoms);
    setMoves(moves.slice(0, -1));
  };
  const resetAll = () => {
    setStep('category');
    setTermsText('');
    setReadOrder([]);
    setKingdoms([]);
    setMoves([]);
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'category', label: L('Kategorie', 'Category') },
    { id: 'collect', label: L('Zettel', 'Slips') },
    { id: 'read', label: L('Vorlesen', 'Read out') },
    { id: 'play', label: L('Spielen', 'Play') },
  ];

  const winner = kingdoms.length === 1 && names.length > 1 ? kingdoms[0] : null;

  return (
    <div>
      <ol className="flex gap-1 mb-5 overflow-x-auto" aria-label={L('Ablauf', 'Steps')}>
        {steps.map((s, i) => (
          <li key={s.id} className="flex-1 min-w-[72px]">
            <button
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={step === s.id ? 'step' : undefined}
              className={`w-full py-2 text-sm border-b-2 transition-colors ${
                step === s.id ? 'border-accent text-text font-semibold' : 'border-border text-text-secondary hover:text-text'
              }`}
            >
              <span className="tabular-nums mr-1.5 text-text-tertiary">{i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {step === 'category' && (
        <div className="space-y-5">
          <Panel className="text-center py-8 sm:py-12">
            {current ? (
              <>
                <p className="text-xs text-text-tertiary mb-3 tabular-nums">
                  {cursor + 1} / {pool.length}
                </p>
                <h2 className="text-2xl sm:text-4xl font-semibold leading-tight text-text text-balance">{current.prompt[language]}</h2>
                <p className="text-text-secondary mt-4 max-w-md mx-auto">{current.hint[language]}</p>
                <p className="text-sm text-text-tertiary mt-5">
                  {L('Zum Beispiel', 'For example')}: {current.examples[language].join(' · ')}
                </p>
              </>
            ) : (
              <p className="text-text-secondary">{L('Tippe auf „Neue Kategorie“.', 'Tap “New category”.')}</p>
            )}
          </Panel>
          <div className="flex gap-2">
            <button type="button" onClick={previousCategory} disabled={cursor <= 0} className={secondaryBtn} aria-label={L('Vorherige', 'Previous')}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={drawCategory} className={`${primaryBtn} flex-1`} disabled={pool.length === 0}>
              <Shuffle className="w-4 h-4" />
              {L('Neue Kategorie', 'New category')}
            </button>
            <button type="button" onClick={() => setStep('collect')} disabled={!current} className={secondaryBtn}>
              {L('Weiter', 'Next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Panel className="space-y-4">
            <div>
              <Label>{L('Stimmung', 'Mood')}</Label>
              <ChoiceChips
                value={mood}
                onChange={setMood}
                allLabel={L('Alle', 'All')}
                options={[
                  { id: 'fun', label: L('Lustig', 'Fun') },
                  { id: 'thoughtful', label: L('Nachdenklich', 'Thoughtful') },
                  { id: 'calm', label: L('Ruhig', 'Calm') },
                ]}
              />
            </div>
            <div>
              <Label>{L('Alter', 'Age')}</Label>
              <ChoiceChips
                value={age}
                onChange={setAge}
                allLabel={L('Alle', 'All')}
                options={[
                  { id: '11-12', label: '11–12' },
                  { id: '13-14', label: '13–14' },
                ]}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text min-h-[40px]">
              <input type="checkbox" checked={shyOnly} onChange={(e) => setShyOnly(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              {L('Nur Kategorien, die leicht zu beantworten sind', 'Only categories that are easy to answer')}
            </label>
            <p className="text-xs text-text-tertiary tabular-nums">
              {L(`${pool.length} Kategorien passen. Keine Wiederholung, bis alle durch sind.`, `${pool.length} categories match. No repeats until all are used.`)}
            </p>
          </Panel>
        </div>
      )}

      {step === 'collect' && (
        <div className="space-y-5">
          {current && (
            <Panel>
              <p className="text-xs text-text-tertiary">{L('Kategorie', 'Category')}</p>
              <p className="text-lg font-semibold text-text">{current.prompt[language]}</p>
            </Panel>
          )}
          <Panel className="space-y-4">
            <div>
              <Label htmlFor="empire-names">{L('Mitspielende (ein Name pro Zeile oder mit Komma)', 'Players (one name per line or comma-separated)')}</Label>
              <textarea
                id="empire-names"
                rows={4}
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border text-sm"
                placeholder="Amin, Leyla, Jonas, Maya"
              />
              <p className="text-xs text-text-tertiary mt-1 tabular-nums">{L(`${names.length} Personen`, `${names.length} players`)}</p>
            </div>
            <div>
              <Label htmlFor="empire-terms">{L('Begriffe von den Zetteln (ein Begriff pro Zeile)', 'Terms from the slips (one per line)')}</Label>
              <textarea
                id="empire-terms"
                rows={6}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-2 border border-border text-sm"
              />
              <p className="text-xs text-text-tertiary mt-1 tabular-nums">
                {L(`${terms.length} Zettel`, `${terms.length} slips`)}
                {names.length > 0 && ` / ${names.length}`}
              </p>
              {duplicates.length > 0 && (
                <p className="text-sm text-text mt-2 p-3 rounded-xl bg-accent-subtle border border-accent/30">
                  {L('Doppelt: ', 'Duplicate: ')}
                  {duplicates.join(', ')}. {L('Bitte eine Person einen neuen Begriff schreiben lassen.', 'Ask one person to write a new term.')}
                </p>
              )}
            </div>
          </Panel>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('category')} className={secondaryBtn}>
              <ChevronLeft className="w-4 h-4" />
              {L('Zurück', 'Back')}
            </button>
            <button type="button" onClick={startReading} disabled={terms.length < 2} className={`${primaryBtn} flex-1`}>
              {L('Vorlesen starten', 'Start reading')}
            </button>
          </div>
          <p className="text-xs text-text-tertiary">
            {L('Tipp: Die Begriffe müssen nicht getippt werden. Du kannst auch einfach die Zettel mischen und selbst vorlesen und direkt zu Schritt 4 springen.', 'Tip: You do not have to type the terms. You can shuffle the slips and read them yourself and jump straight to step 4.')}
          </p>
        </div>
      )}

      {step === 'read' && (
        <div className="space-y-5">
          <Panel className="text-center py-10 sm:py-16">
            <p className="text-xs text-text-tertiary tabular-nums mb-3">
              {readOrder.length ? `${readIdx + 1} / ${readOrder.length}` : ''}
            </p>
            <p className="text-3xl sm:text-5xl font-semibold text-text text-balance leading-tight">{readOrder[readIdx] ?? L('Keine Begriffe', 'No terms')}</p>
            <p className="text-sm text-text-tertiary mt-5">{L('Zweimal deutlich vorlesen.', 'Read it out twice, clearly.')}</p>
          </Panel>
          <div className="flex gap-2">
            <button type="button" onClick={() => setReadIdx(Math.max(0, readIdx - 1))} disabled={readIdx === 0} className={secondaryBtn} aria-label={L('Zurück', 'Back')}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {readIdx < readOrder.length - 1 ? (
              <button type="button" onClick={() => setReadIdx(readIdx + 1)} className={`${primaryBtn} flex-1`}>
                {L('Nächster Begriff', 'Next term')}
              </button>
            ) : (
              <button type="button" onClick={startPlay} className={`${primaryBtn} flex-1`}>
                {L('Zum Spiel', 'To the game')}
              </button>
            )}
          </div>
          <button type="button" onClick={() => setReadOrder(shuffle(readOrder))} className="text-sm text-text-secondary underline">
            {L('Noch einmal mischen', 'Shuffle again')}
          </button>
        </div>
      )}

      {step === 'play' && (
        <div className="space-y-5">
          {kingdoms.length === 0 ? (
            <Panel>
              <p className="text-sm text-text-secondary mb-3">{L('Gib in Schritt 2 die Namen ein, dann kann es losgehen.', 'Enter the names in step 2 to begin.')}</p>
              <button type="button" onClick={startPlay} disabled={names.length < 2} className={primaryBtn}>
                {L('Reiche anlegen', 'Create kingdoms')}
              </button>
            </Panel>
          ) : (
            <>
              {winner ? (
                <Panel className="text-center py-8">
                  <Crown className="w-8 h-8 mx-auto text-accent mb-2" />
                  <p className="text-xl font-semibold">{L(`${winner.king} hat alle Reiche vereint.`, `${winner.king} has united every kingdom.`)}</p>
                </Panel>
              ) : (
                <Panel>
                  <Label htmlFor="empire-guesser">{L('Wer ist dran?', 'Whose turn?')}</Label>
                  <select
                    id="empire-guesser"
                    value={guesser}
                    onChange={(e) => setGuesser(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-sm"
                  >
                    {kingdoms.map((k) => (
                      <option key={k.king} value={k.king}>
                        {k.king} ({k.members.length})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-3">{L('Wen hat sie oder er erraten? Tippe auf das Reich der erratenen Person.', 'Whom did they guess? Tap that person’s kingdom.')}</p>
                </Panel>
              )}
              <ul className="space-y-2">
                {kingdoms.map((k) => (
                  <li key={k.king} className="border border-border rounded-xl bg-surface p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text truncate">
                        {k.king}
                        <span className="ml-2 text-xs font-normal text-text-tertiary tabular-nums">{k.members.length}</span>
                      </p>
                      {k.members.length > 1 && <p className="text-xs text-text-secondary truncate">{k.members.slice(1).join(', ')}</p>}
                    </div>
                    {!winner && k.king !== guesser && (
                      <button type="button" onClick={() => guessed(k.king)} className={chipCls(false)}>
                        {L('erraten', 'guessed')}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button type="button" onClick={undo} disabled={moves.length === 0} className={secondaryBtn}>
                  <Undo2 className="w-4 h-4" />
                  {L('Rückgängig', 'Undo')}
                </button>
                <button type="button" onClick={resetAll} className={secondaryBtn}>
                  <RotateCcw className="w-4 h-4" />
                  {L('Neue Runde', 'New round')}
                </button>
              </div>
              {moves.length > 0 && <p className="text-xs text-text-tertiary">{L('Zuletzt', 'Last')}: {moves[moves.length - 1].text}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};
