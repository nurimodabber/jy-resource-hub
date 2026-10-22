import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Undo2, Shuffle, Crown, SlidersHorizontal, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../../types';
import { EMPIRE_CATEGORIES_V2 } from '../../data/empireContent';
import { useLocalState } from '../../hooks/useLocalState';
import { useWakeLock } from '../../hooks/useWakeLock';
import { shuffle, normalizeTerm } from '../../utils/random';
import { loadPresentNames } from '../../utils/groupNames';
import { tr, Panel, ChoiceChips, primaryBtn, secondaryBtn, Label } from './common';
import { GroupManager } from './GroupManager';
import { Dialog } from '../ui/Dialog';

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
  const [names, setNames] = useState<string[]>(() => loadPresentNames());
  const [termsText, setTermsText] = useLocalState<string>('jy_empire_terms', '');
  const [readOrder, setReadOrder] = useLocalState<string[]>('jy_empire_read', []);
  const [readIdx, setReadIdx] = useLocalState<number>('jy_empire_readidx', 0);
  const [kingdoms, setKingdoms] = useLocalState<Kingdom[]>('jy_empire_kingdoms', []);
  const [moves, setMoves] = useState<Move[]>([]);
  const [guesser, setGuesser] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleNamesChange = React.useCallback((presentList: string[]) => {
    setNames((prev) => {
      if (prev.length === presentList.length && prev.every((n, i) => n === presentList[i])) {
        return prev;
      }
      return presentList;
    });
  }, []);

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
    // Automatically advance "Wer ist dran" to the guesser or the next eligible king
    setGuesser(g.king);
  };

  const undo = () => {
    const last = moves[moves.length - 1];
    if (!last) return;
    setKingdoms(last.kingdoms);
    setMoves(moves.slice(0, -1));
  };

  const resetAll = () => {
    if (window.confirm(L('Möchtest du wirklich eine neue Runde Empire starten?', 'Start a new round of Empire?'))) {
      setStep('category');
      setTermsText('');
      setReadOrder([]);
      setKingdoms([]);
      setMoves([]);
    }
  };

  const steps: { id: Step; label: string }[] = [
    { id: 'category', label: L('1 Kategorie', '1 Category') },
    { id: 'collect', label: L('2 Zettel', '2 Slips') },
    { id: 'read', label: L('3 Vorlesen', '3 Read out') },
    { id: 'play', label: L('4 Spielen', '4 Play') },
  ];

  const winner = kingdoms.length === 1 && names.length > 1 ? kingdoms[0] : null;

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
            <span>{L('So geht’s: Empire Spielbegleiter', 'How it works: Empire')}</span>
          </div>
          {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHelp && (
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            {L(
              'Alle schreiben geheim einen Begriff zur Kategorie auf einen Zettel. Die Spielleitung liest alle Begriffe vor. Reihum erraten die Jugendlichen, wer welchen Begriff hatte – Richtige Antworten wachsen zu mächtigen Reichen zusammen!',
              'Everyone secretly writes a term for the category. The host reads all terms twice. Players guess who wrote what – correct guesses merge into growing empires!'
            )}
          </p>
        )}
      </div>

      {/* Filled Pill Progress Bar */}
      <nav className="flex gap-2 p-1.5 rounded-card bg-surface-2 border border-border overflow-x-auto no-scrollbar" aria-label={L('Ablauf', 'Steps')}>
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex-1 py-2 px-1.5 sm:px-3 rounded-control text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
              step === s.id
                ? 'bg-accent text-accent-contrast shadow-xs'
                : 'text-text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div className="space-y-4">
          <Panel className="text-center py-8 sm:py-12 relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-accent-text">
                {cursor + 1} / {pool.length}
              </span>
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="px-2.5 py-1.5 rounded-chip bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{L('Filter', 'Filters')}</span>
              </button>
            </div>

            {current ? (
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight max-w-lg mx-auto">
                  {current.prompt[language]}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                  {current.hint[language]}
                </p>
                <div className="pt-3">
                  <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary block mb-1">
                    {L('Beispiele', 'Examples')}:
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                    {current.examples[language].map((ex) => (
                      <span key={ex} className="px-2.5 py-1 rounded-chip bg-surface-2 text-text font-medium text-xs">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-text-secondary">{L('Tippe auf „Neue Kategorie“.', 'Tap “New category”.')}</p>
            )}
          </Panel>

          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={previousCategory}
                disabled={cursor <= 0}
                className={`${secondaryBtn} flex-1 justify-center`}
                aria-label={L('Vorherige', 'Previous')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>{L('Vorherige', 'Previous')}</span>
              </button>
              <button
                type="button"
                onClick={drawCategory}
                className={`${secondaryBtn} flex-1 justify-center`}
                disabled={pool.length === 0}
              >
                <Shuffle className="w-4 h-4 mr-1" />
                <span>{L('Neue Kategorie', 'Draw new')}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep('collect')}
              disabled={!current}
              className={`${primaryBtn} w-full justify-center`}
            >
              <span>{L('Weiter zu Schritt 2: Zettel', 'Next to step 2: Slips')}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Slips & Names */}
      {step === 'collect' && (
        <div className="space-y-4">
          {current && (
            <div className="p-4 rounded-card bg-accent-subtle border border-accent/20">
              <span className="text-2xs font-bold uppercase tracking-wider text-accent-text block mb-0.5">
                {L('Aktuelle Kategorie', 'Current Category')}
              </span>
              <p className="text-base font-bold text-accent-text">{current.prompt[language]}</p>
            </div>
          )}

          {/* Group Manager for Players */}
          <GroupManager
            language={language}
            onNamesChange={handleNamesChange}
          />

          {/* Terms from Slips */}
          <Panel className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="empire-terms" className="text-xs font-bold text-text">
                {L('Begriffe von den Zetteln (ein Begriff pro Zeile)', 'Terms from slips (one per line)')}
              </label>
              <span className="text-2xs font-bold px-2 py-0.5 rounded-chip bg-surface-2 text-text-tertiary">
                {terms.length} / {names.length} {L('Zettel', 'slips')}
              </span>
            </div>

            <textarea
              id="empire-terms"
              rows={5}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full p-3 rounded-control bg-surface-2 border border-border text-xs focus:outline-hidden focus:ring-2 focus:ring-accent"
              placeholder={L('Zettel 1\nZettel 2\nZettel 3...', 'Slip 1\nSlip 2...')}
            />

            {duplicates.length > 0 && (
              <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-xs text-danger">
                <strong>{L('Doppelt: ', 'Duplicate: ')}</strong>
                {duplicates.join(', ')}. {L('Bitte eine Person einen neuen Begriff schreiben lassen.', 'Please ask someone to pick a new term.')}
              </div>
            )}
          </Panel>

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('category')} className={secondaryBtn}>
              <ChevronLeft className="w-4 h-4" />
              <span>{L('Zurück', 'Back')}</span>
            </button>
            <button
              type="button"
              onClick={startReading}
              disabled={terms.length < 2}
              className={`${primaryBtn} flex-1`}
            >
              <span>{L('Vorlesen starten', 'Start reading out')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Read Out */}
      {step === 'read' && (
        <div className="space-y-4">
          <Panel className="text-center py-12 sm:py-16 space-y-4">
            <p className="text-2xs font-bold uppercase tracking-wider text-text-tertiary tabular-nums">
              {readOrder.length ? `${readIdx + 1} / ${readOrder.length}` : ''}
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight max-w-lg mx-auto">
              {readOrder[readIdx] ?? L('Keine Begriffe', 'No terms')}
            </h2>
            <p className="text-xs text-text-tertiary">
              {L('Zweimal deutlich im Kreis vorlesen, damit alle die Begriffe hören.', 'Read clearly twice in the circle.')}
            </p>
          </Panel>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReadIdx(Math.max(0, readIdx - 1))}
              disabled={readIdx === 0}
              className={secondaryBtn}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {readIdx < readOrder.length - 1 ? (
              <button
                type="button"
                onClick={() => setReadIdx(readIdx + 1)}
                className={`${primaryBtn} flex-1`}
              >
                <span>{L('Nächster Begriff', 'Next term')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startPlay}
                className={`${primaryBtn} flex-1`}
              >
                <span>{L('Zum Spiel übergehen', 'Proceed to game')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Play Stage */}
      {step === 'play' && (
        <div className="space-y-4">
          {kingdoms.length === 0 ? (
            <Panel className="text-center py-8 space-y-3">
              <p className="text-xs text-text-secondary">
                {L('Lege die Reiche an, um mit dem Raten zu beginnen.', 'Create kingdoms to begin playing.')}
              </p>
              <button
                type="button"
                onClick={startPlay}
                disabled={names.length < 2}
                className={primaryBtn}
              >
                {L('Reiche initialisieren', 'Initialize kingdoms')} ({names.length} {L('Personen', 'players')})
              </button>
            </Panel>
          ) : winner ? (
            /* Winner Screen */
            <Panel className="text-center py-10 space-y-4 bg-accent-subtle border border-accent/30 animate-in zoom-in-95 duration-200">
              <Crown className="w-12 h-12 mx-auto text-accent-text" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-accent-text">
                {L(`${winner.king} hat das gesamte Empire vereint!`, `${winner.king} has united the entire Empire!`)}
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {L(`Alle ${names.length} Mitspielenden gehören nun zu diesem großen Reich.`, `All ${names.length} players now belong to this kingdom.`)}
              </p>
              <div className="pt-2">
                <button type="button" onClick={resetAll} className={primaryBtn}>
                  <RotateCcw className="w-4 h-4" />
                  <span>{L('Neue Runde starten', 'Start new round')}</span>
                </button>
              </div>
            </Panel>
          ) : (
            /* Active Game Round */
            <>
              {/* Whose turn banner */}
              <Panel className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {L('Wer ist am Zug?', 'Whose turn?')}
                  </span>
                </div>

                <select
                  value={guesser}
                  onChange={(e) => setGuesser(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-control bg-surface-2 border border-border text-sm font-bold text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                >
                  {kingdoms.map((k) => (
                    <option key={k.king} value={k.king}>
                      {k.king} ({k.members.length} {L('Mitglieder', 'members')})
                    </option>
                  ))}
                </select>
                <p className="text-2xs text-text-secondary">
                  {L('Tippe unten auf „erraten“, wenn die am Zug befindliche Person das Reich eines Mitspielers erobert hat.', 'Tap "guessed" when the player successfully claims an opponent.')}
                </p>
              </Panel>

              {/* Kingdoms List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {kingdoms.map((k) => {
                  const isCurrentGuesser = k.king === guesser;
                  return (
                    <div
                      key={k.king}
                      className={`p-3.5 rounded-card border transition-colors flex items-center justify-between gap-3 ${
                        isCurrentGuesser
                          ? 'bg-accent-subtle border-accent/40 shadow-xs'
                          : 'bg-surface border-border hover:border-accent/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Crown className={`w-3.5 h-3.5 ${isCurrentGuesser ? 'text-accent-text' : 'text-text-tertiary'}`} />
                          <h4 className="text-sm font-bold text-text truncate">{k.king}</h4>
                          <span className="text-2xs font-bold px-2 py-0.5 rounded-chip bg-surface-2 text-text-tertiary">
                            {k.members.length}
                          </span>
                        </div>
                        {k.members.length > 1 && (
                          <p className="text-2xs text-text-secondary truncate mt-0.5">
                            {k.members.slice(1).join(', ')}
                          </p>
                        )}
                      </div>

                      {!isCurrentGuesser && (
                        <button
                          type="button"
                          onClick={() => guessed(k.king)}
                          className="px-3 py-1.5 rounded-control bg-accent text-accent-contrast font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
                        >
                          {L('Erraten', 'Guessed')}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={undo}
                  disabled={moves.length === 0}
                  className={`${secondaryBtn} flex-1`}
                >
                  <Undo2 className="w-4 h-4" />
                  <span>{L('Zug rückgängig', 'Undo move')}</span>
                </button>

                <button
                  type="button"
                  onClick={resetAll}
                  className={secondaryBtn}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{L('Neue Runde', 'New round')}</span>
                </button>
              </div>

              {moves.length > 0 && (
                <p className="text-2xs text-text-tertiary text-center">
                  {L('Letzter Zug', 'Last move')}: {moves[moves.length - 1].text}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Filter Dialog Sheet */}
      <Dialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={L('Kategorien filtern', 'Filter Categories')}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
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
            <Label>{L('Altersgruppe', 'Age group')}</Label>
            <ChoiceChips
              value={age}
              onChange={setAge}
              allLabel={L('Alle', 'All')}
              options={[
                { id: '11-12', label: '11–12 Jahre' },
                { id: '13-14', label: '13–14 Jahre' },
              ]}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-text min-h-[40px] cursor-pointer">
            <input
              type="checkbox"
              checked={shyOnly}
              onChange={(e) => setShyOnly(e.target.checked)}
              className="w-4 h-4 accent-accent rounded-xs"
            />
            <span>{L('Nur Kategorien, die besonders leicht zu beantworten sind', 'Only easy-to-answer prompts')}</span>
          </label>

          <p className="text-2xs text-text-tertiary">
            {L(`${pool.length} Kategorien passen zu diesen Filtern.`, `${pool.length} categories match.`)}
          </p>
        </div>
      </Dialog>
    </div>
  );
};
