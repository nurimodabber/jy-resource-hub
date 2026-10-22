import React, { useState, useMemo } from 'react';
import {
  Shuffle,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  FileText,
  Smartphone,
  Crown,
} from 'lucide-react';
import { Language } from '../../../types';
import { EMPIRE_CATEGORIES_V2, EmpireCategoryV2 } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import {
  tr,
  Panel,
  primaryBtn,
  chipCls,
  PlayerSetupSection,
  usePlayerList,
} from '../../tools/common';
import { useWakeLock } from '../../../hooks/useWakeLock';

interface EmpireCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'entry' | 'read' | 'cheatSheet';

export const EmpireCompanion: React.FC<EmpireCompanionProps> = ({ language }) => {
  const L = tr(language);
  const [phase, setPhase] = useState<Phase>('setup');

  const {
    playerCount,
    setPlayerCount,
    playerNames,
    handleRename,
    handleResetToGroup,
    hasGroupNames,
  } = usePlayerList(8, language, 3);

  // Input mode: pass around phone or classic paper slips
  const [entryMode, setEntryMode] = useState<'passAround' | 'paper'>('passAround');

  // Category selection
  const [selectedCat, setSelectedCat] = useState<EmpireCategoryV2>(() => {
    const list = EMPIRE_CATEGORIES_V2.filter((c) => !c.personal);
    return shuffle(list)[0] || EMPIRE_CATEGORIES_V2[0];
  });
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);

  // Filter state for categories
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  // Secret terms entered per player index
  const [enteredTerms, setEnteredTerms] = useState<string[]>([]);

  // Pass-around state
  const [passIndex, setPassIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [cardRevealed, setCardRevealed] = useState(false);

  // Paper manual entry text
  const [paperText, setPaperText] = useState('');

  // Reading phase state: shuffled terms, round 1 & 2
  const [readingList, setReadingList] = useState<string[]>([]);
  const [readIndex, setReadIndex] = useState(0);
  const [readRound, setReadRound] = useState<1 | 2>(1);

  // Cheat sheet crossed out terms
  const [crossedOut, setCrossedOut] = useState<Record<string, boolean>>({});

  useWakeLock(phase !== 'setup');

  const pool = useMemo(() => {
    return EMPIRE_CATEGORIES_V2.filter((c) => !c.personal && (!moodFilter || c.mood === moodFilter));
  }, [moodFilter]);

  const drawRandomCategory = () => {
    setIsCustomCat(false);
    const cand = pool.filter((c) => c.id !== selectedCat.id);
    const next = shuffle(cand)[0] || pool[0];
    if (next) setSelectedCat(next);
  };

  const activeCategoryTitle = isCustomCat
    ? customPrompt || L('Eigene Kategorie', 'Custom category')
    : selectedCat.prompt[language];

  const activeCategoryHint = isCustomCat
    ? L('Schreibe einen passenden Begriff auf.', 'Write a matching term.')
    : selectedCat.hint[language];

  const getPlayerLabel = (idx: number) => {
    return playerNames[idx] || `${L('Person', 'Player')} ${idx + 1}`;
  };

  // Start Secret Entry
  const startEntry = () => {
    if (playerNames.length < 3) {
      alert(
        L(
          'Bitte mindestens 3 Personen in der Gruppe haben, um Empire zu spielen.',
          'Please have at least 3 players to play Empire.'
        )
      );
      return;
    }
    setEnteredTerms([]);
    setPassIndex(0);
    setCurrentInput('');
    setCardRevealed(false);
    setPhase('entry');
  };

  // Handle Pass-Around step
  const handlePassNext = () => {
    const trimmed = currentInput.trim() || L('Geheimnis', 'Secret');
    const newTerms = [...enteredTerms, trimmed];
    setEnteredTerms(newTerms);
    setCurrentInput('');
    setCardRevealed(false);

    if (passIndex + 1 < playerNames.length) {
      setPassIndex(passIndex + 1);
    } else {
      // All players done! Proceed to Reading phase
      setReadingList(shuffle(newTerms));
      setReadIndex(0);
      setReadRound(1);
      setPhase('read');
    }
  };

  // Start Reading from paper slips
  const startReadingFromPaper = () => {
    const lines = paperText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length < 3) {
      alert(
        L(
          'Bitte mindestens 3 Begriffe (jeweils eine Zeile) eingeben.',
          'Please enter at least 3 terms (one per line).'
        )
      );
      return;
    }
    setReadingList(shuffle(lines));
    setReadIndex(0);
    setReadRound(1);
    setPhase('read');
  };

  // Advance reading cards
  const handleReadNext = () => {
    if (readIndex + 1 < readingList.length) {
      setReadIndex(readIndex + 1);
    } else {
      if (readRound === 1) {
        // Start round 2 with reshuffled list
        setReadingList(shuffle([...readingList]));
        setReadIndex(0);
        setReadRound(2);
      } else {
        // Both rounds complete! Go to Cheat Sheet
        setCrossedOut({});
        setPhase('cheatSheet');
      }
    }
  };

  const handleReadPrev = () => {
    if (readIndex > 0) {
      setReadIndex(readIndex - 1);
    }
  };

  const toggleCrossOut = (term: string) => {
    setCrossedOut((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  const restartAll = () => {
    setPhase('setup');
    setEnteredTerms([]);
    setCrossedOut({});
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* PHASE 1: STREAMLINED SETUP                                          */}
      {/* =================================================================== */}
      {phase === 'setup' && (
        <div className="space-y-5 text-left max-w-lg mx-auto">
          {/* 1. Category Suggestion Card at Top */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text uppercase tracking-wider">
                {L('Kategorie für diese Runde', 'Category for this round')}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCat(!isCustomCat)}
                className="text-2xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isCustomCat ? L('Zufallsvorschlag', 'Random suggestion') : L('Eigene Kategorie', 'Custom')}</span>
              </button>
            </div>

            {/* Mood Chips */}
            {!isCustomCat && (
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => setMoodFilter(null)}
                  className={chipCls(moodFilter === null)}
                >
                  {L('Alle Stimmungen', 'All moods')}
                </button>
                <button
                  type="button"
                  onClick={() => setMoodFilter('fun')}
                  className={chipCls(moodFilter === 'fun')}
                >
                  {L('Lustig', 'Fun')}
                </button>
                <button
                  type="button"
                  onClick={() => setMoodFilter('calm')}
                  className={chipCls(moodFilter === 'calm')}
                >
                  {L('Ruhig', 'Calm')}
                </button>
                <button
                  type="button"
                  onClick={() => setMoodFilter('thoughtful')}
                  className={chipCls(moodFilter === 'thoughtful')}
                >
                  {L('Nachdenklich', 'Thoughtful')}
                </button>
              </div>
            )}

            {isCustomCat ? (
              <Panel className="p-4 space-y-2">
                <label className="text-2xs font-bold text-text-secondary uppercase tracking-wider">
                  {L('Eigene Kategorie formulieren:', 'Formulate custom category:')}
                </label>
                <input
                  type="text"
                  placeholder={L('z. B. Dinge, die man im Jugendcamp um 2 Uhr nachts hört', 'e.g. Things heard at 2am in camp')}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm font-semibold text-text focus:border-accent focus:outline-hidden"
                />
              </Panel>
            ) : (
              <Panel className="p-5 sm:p-6 space-y-3 relative">
                <div className="space-y-1">
                  <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                    {selectedCat.mood === 'fun'
                      ? L('Lustig', 'Fun')
                      : selectedCat.mood === 'calm'
                      ? L('Ruhig', 'Calm')
                      : L('Nachdenklich', 'Thoughtful')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-text pt-1">
                    {selectedCat.prompt[language]}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {selectedCat.hint[language]}
                  </p>
                </div>

                {/* Example chips */}
                <div className="pt-2 border-t border-border/50">
                  <p className="text-2xs text-text-tertiary font-semibold mb-1.5">
                    {L('Beispiele:', 'Examples:')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCat.examples[language].map((ex, i) => (
                      <span
                        key={i}
                        className="text-2xs px-2.5 py-1 rounded-control bg-surface-2 text-text-secondary border border-border"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={drawRandomCategory}
                    className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>{L('Andere Kategorie ziehen', 'Shuffle category')}</span>
                  </button>
                </div>
              </Panel>
            )}
          </div>

          {/* 2. Directly Below: Player Count & Names */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <PlayerSetupSection
              language={language}
              playerCount={playerCount}
              playerNames={playerNames}
              minPlayers={3}
              maxPlayers={30}
              onCountChange={setPlayerCount}
              onRename={handleRename}
              onResetToGroup={handleResetToGroup}
              hasGroupNames={hasGroupNames}
              countLabel={L('Personen im Kreis', 'Players in circle')}
              countSubtitle={L('Gesamtzahl der Personen in der Runde', 'Total number of players in this round')}
            />
          </Panel>

          {/* 3. Input Mode Toggle (Pass-around vs Paper slips) */}
          <div className="flex items-center justify-center gap-2 text-2xs text-text-tertiary pt-1">
            <button
              type="button"
              onClick={() => setEntryMode('passAround')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                entryMode === 'passAround'
                  ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                  : 'bg-surface-2 border-border text-text-tertiary hover:text-text'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>{L('Handy weitergeben', 'Pass phone')}</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('paper')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                entryMode === 'paper'
                  ? 'bg-accent/15 border-accent/40 text-accent font-bold'
                  : 'bg-surface-2 border-border text-text-tertiary hover:text-text'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>{L('Papierzettel vorlesen', 'Read paper slips')}</span>
            </button>
          </div>

          {/* 4. Directly Below: Large Start Button */}
          {entryMode === 'passAround' ? (
            <button
              type="button"
              onClick={startEntry}
              className={`${primaryBtn} w-full text-base py-3.5 flex items-center justify-center gap-2`}
            >
              <Smartphone className="w-4 h-4" />
              <span>
                {L('Zettel geheim eingeben', 'Secret slip entry')} ({playerCount} {L('Personen', 'players')})
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-secondary block">
                {L('Begriffe von Papierzetteln abtippen (1 pro Zeile):', 'Type terms from paper slips (1 per line):')}
              </label>
              <textarea
                rows={4}
                value={paperText}
                onChange={(e) => setPaperText(e.target.value)}
                placeholder={L('Apfelkuchen\nFahrradkette\nSchlafsack...', 'Apple pie\nBicycle chain\nSleeping bag...')}
                className="w-full p-3 rounded-card bg-surface-2 border border-border text-xs font-mono text-text focus:border-accent focus:outline-hidden"
              />
              <button
                type="button"
                onClick={startReadingFromPaper}
                className={`${primaryBtn} w-full text-base py-3`}
              >
                <span>{L('Begriffe mischen & vorlesen', 'Shuffle & read terms')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 2: GEHEIME EINGABE PER HANDY-WEITERGABE                       */}
      {/* =================================================================== */}
      {phase === 'entry' && (
        <div className="space-y-5 max-w-md mx-auto text-center">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {Array.from({ length: playerCount }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === passIndex
                    ? 'bg-accent w-4'
                    : i < passIndex
                    ? 'bg-accent/40'
                    : 'bg-surface-2 border border-border'
                }`}
              />
            ))}
          </div>

          <p className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary tabular-nums">
            {passIndex + 1} / {playerCount} {L('Personen', 'players')}
          </p>

          <Panel className="p-6 sm:p-8 space-y-5 text-center">
            {!cardRevealed ? (
              <div className="space-y-4 py-6">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {L('Gib das Handy an:', 'Hand the phone to:')}
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-text tracking-tight">
                  {getPlayerLabel(passIndex)}
                </h3>
                <p className="text-xs text-text-tertiary max-w-xs mx-auto">
                  {L('Nur diese Person schaut jetzt auf das Display.', 'Only this player should view the screen now.')}
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setCardRevealed(true)}
                    className={`${primaryBtn} mx-auto px-6 py-3 text-base flex items-center gap-2`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{L('Ich bin bereit · Begriff eingeben', 'I am ready · Enter term')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left py-2">
                <div className="text-center pb-2 border-b border-border/50">
                  <p className="text-2xs font-bold uppercase text-accent tracking-wider">
                    {getPlayerLabel(passIndex)}
                  </p>
                  <p className="text-sm font-bold text-text mt-0.5">
                    {activeCategoryTitle}
                  </p>
                  <p className="text-2xs text-text-secondary mt-0.5">
                    {activeCategoryHint}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary block">
                    {L('Dein geheimer Zettel-Begriff:', 'Your secret term:')}
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder={L('z. B. Ein warmer Kakao', 'e.g. Hot cocoa')}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentInput.trim()) {
                        handlePassNext();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-base font-bold text-text focus:border-accent focus:outline-hidden"
                  />
                  <p className="text-2xs text-text-tertiary">
                    {L('Wähle etwas, das zu dir passt, aber dich nicht sofort verrät.', 'Pick something fitting, but not too obvious.')}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    disabled={!currentInput.trim()}
                    onClick={handlePassNext}
                    className={`${primaryBtn} w-full py-3 text-base disabled:opacity-40 flex items-center justify-center gap-2`}
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>
                      {passIndex + 1 < playerCount
                        ? L('Verbergen & an nächste Person', 'Hide & pass to next player')
                        : L('Verbergen & zum Vorlesen', 'Hide & proceed to reading')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 3: ZWEIMALIGES VORLESEN                                       */}
      {/* =================================================================== */}
      {phase === 'read' && (
        <div className="space-y-6 max-w-xl mx-auto text-center">
          {/* Header indicator */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20">
              {readRound === 1
                ? L('Vorlesen – Runde 1 von 2', 'Reading – Round 1 of 2')
                : L('Vorlesen – Runde 2 von 2', 'Reading – Round 2 of 2')}
            </span>
            <span className="text-xs font-bold text-text-tertiary tabular-nums">
              {readIndex + 1} / {readingList.length}
            </span>
          </div>

          {/* Reading Card */}
          <Panel className="p-8 sm:p-12 space-y-4 min-h-[220px] flex flex-col justify-center items-center">
            <p className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
              {activeCategoryTitle}
            </p>
            <div className="text-3xl sm:text-4xl font-black text-text leading-tight tracking-tight">
              „{readingList[readIndex]}“
            </div>
            <p className="text-xs text-text-secondary pt-2">
              {L('Laut und deutlich vorlesen. Alle hören gut zu!', 'Read out loud clearly. Everyone listens!')}
            </p>
          </Panel>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={readIndex === 0}
              onClick={handleReadPrev}
              className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{L('Zurück', 'Previous')}</span>
            </button>

            <button
              type="button"
              onClick={handleReadNext}
              className={`${primaryBtn} px-6 py-2.5 text-sm sm:text-base min-h-[44px] flex items-center gap-1.5`}
            >
              <span>
                {readIndex + 1 < readingList.length
                  ? L('Nächster Begriff', 'Next word')
                  : readRound === 1
                  ? L('Runde 2 starten', 'Start round 2')
                  : L('Vorlesen fertig · Zum Spiel', 'Done · Start Game')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHASE 4: SPICKZETTEL & REGELN (KEINE DIGITALE STEUERUNG!)           */}
      {/* =================================================================== */}
      {phase === 'cheatSheet' && (
        <div className="space-y-6 text-left max-w-xl mx-auto">
          {/* Minimalist Intro Banner */}
          <div className="p-4 rounded-card bg-surface-2 border border-border text-center space-y-1">
            <h3 className="text-base font-bold text-text flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-accent" />
              <span>{L('Viel Spaß beim Raten im Kreis!', 'Have fun guessing in the circle!')}</span>
            </h3>
            <p className="text-xs text-text-secondary">
              {L('Das Spiel läuft frei in der Gruppe. Tippe unten auf Begriffe, um sie abzustreichen.', 'Play freely in the circle. Tap terms below to cross them off.')}
            </p>
          </div>

          {/* Rules Reminder Card */}
          <div className="p-4 rounded-card bg-surface border border-border space-y-2">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              {L('Spielregeln für das Erraten:', 'Guessing rules:')}
            </h4>
            <ul className="text-xs text-text-secondary space-y-1 pl-4 list-disc">
              <li>
                <strong>{L('Reihum raten:', 'Take turns:')}</strong>{' '}
                {L('Person A fragt Person B nach einem Begriff: „Bist du [Begriff]?“', 'Player A asks Player B: "Are you [Term]?"')}
              </li>
              <li>
                <strong>{L('Richtig:', 'Correct:')}</strong>{' '}
                {L('Person B (und ihr gesamtes Reich) schließt sich A an. A rät weiter.', 'Player B (and their empire) joins A. A continues guessing.')}
              </li>
              <li>
                <strong>{L('Falsch:', 'Incorrect:')}</strong>{' '}
                {L('Der Zug endet. Die gefragte Person B rät als nächste.', 'Turn ends. Player B guesses next.')}
              </li>
              <li>
                <strong>{L('Nur der König rät:', 'Only the King guesses:')}</strong>{' '}
                {L('Nur die Person an der Spitze darf raten. Berater flüstern nur.', 'Only the person at the top guesses. Others whisper advice.')}
              </li>
            </ul>
          </div>

          {/* Cheat Sheet of Terms (Leader can cross them out) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                  {L('Begriffe auf dem Tisch', 'Terms on the table')}
                </h4>
                <p className="text-2xs text-text-tertiary">
                  {L('Tippe auf einen Begriff, wenn er erraten wurde.', 'Tap a term when it was guessed.')}
                </p>
              </div>
              <span className="text-2xs font-bold text-text-tertiary px-2 py-0.5 rounded-full bg-surface-2 border border-border">
                {Object.values(crossedOut).filter(Boolean).length} / {readingList.length} {L('erraten', 'guessed')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {readingList.map((term, i) => {
                const isCrossed = !!crossedOut[term];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleCrossOut(term)}
                    className={`p-3 rounded-card border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isCrossed
                        ? 'bg-surface-2/40 border-border opacity-50 line-through text-text-tertiary'
                        : 'bg-surface border-border hover:bg-surface-2 text-text font-bold'
                    }`}
                  >
                    <span className="text-xs truncate">„{term}“</span>
                    {isCrossed && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset / New Round Button */}
          <div className="pt-2 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={restartAll}
              className="px-4 py-2 min-h-[44px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{L('Neue Empire-Runde starten', 'Start new round')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};