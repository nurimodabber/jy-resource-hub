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
  Users,
  Search,
  X,
  BookOpen,
  Crown,
} from 'lucide-react';
import { Language } from '../../../types';
import { EMPIRE_CATEGORIES_V2, EmpireCategoryV2 } from '../../../data/empireContent';
import { shuffle } from '../../../utils/random';
import {
  tr,
  Panel,
  primaryBtn,
} from '../../tools/common';
import { Sheet } from '../../ui/Sheet';
import { useWakeLock } from '../../../hooks/useWakeLock';
import { useAdminData } from '../../../context/AdminDataContext';
import { saveProposal } from '../../../utils/adminRevisions';

interface EmpireCompanionProps {
  language: Language;
}

type Phase = 'setup' | 'entry' | 'read' | 'cheatSheet';

export const EmpireCompanion: React.FC<EmpireCompanionProps> = ({ language }) => {
  const L = tr(language);
  const adminData = useAdminData();
  const [phase, setPhase] = useState<Phase>('setup');

  // Simple player count only (3 to 30) – names are intentionally omitted for Empire
  const [playerCount, setPlayerCount] = useState<number>(8);

  const pool = useMemo(() => {
    return adminData.empireCategories.length > 0 ? adminData.empireCategories : EMPIRE_CATEGORIES_V2;
  }, [adminData.empireCategories]);

  // Category selection
  const [selectedCat, setSelectedCat] = useState<EmpireCategoryV2>(() => {
    return shuffle(EMPIRE_CATEGORIES_V2)[0] || EMPIRE_CATEGORIES_V2[0];
  });
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);

  // Category browser modal / sheet state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Secret terms entered per player index
  const [enteredTerms, setEnteredTerms] = useState<string[]>([]);

  // Pass-around state
  const [passIndex, setPassIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [cardRevealed, setCardRevealed] = useState(false);

  // Reading phase state: shuffled terms, round 1 & 2
  const [readingList, setReadingList] = useState<string[]>([]);
  const [readIndex, setReadIndex] = useState(0);
  const [readRound, setReadRound] = useState<1 | 2>(1);

  // Cheat sheet crossed out terms
  const [crossedOut, setCrossedOut] = useState<Record<string, boolean>>({});

  useWakeLock(phase !== 'setup');

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

  // Filtered categories for the full browser sheet
  const filteredCategories = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((c) => {
      const promptDe = c.prompt.de.toLowerCase();
      const promptEn = c.prompt.en.toLowerCase();
      const hintDe = c.hint.de.toLowerCase();
      const hintEn = c.hint.en.toLowerCase();
      const exDe = c.examples?.de?.some((ex) => ex.toLowerCase().includes(q));
      const exEn = c.examples?.en?.some((ex) => ex.toLowerCase().includes(q));
      return (
        promptDe.includes(q) ||
        promptEn.includes(q) ||
        hintDe.includes(q) ||
        hintEn.includes(q) ||
        exDe ||
        exEn
      );
    });
  }, [pool, pickerSearch]);

  // Start Secret Entry
  const startEntry = () => {
    if (playerCount < 3) {
      alert(
        L(
          'Bitte mindestens 3 Personen in der Gruppe haben, um Empire zu spielen.',
          'Please have at least 3 players to play Empire.'
        )
      );
      return;
    }

    // Automatically submit custom topics as a community proposal
    if (isCustomCat && customPrompt.trim()) {
      const trimmed = customPrompt.trim();
      try {
        saveProposal({
          type: 'kategorie',
          title: trimmed,
          subtitle: 'Empire-Kategorie',
          summary: `Empire-Themenvorschlag aus Spielrunde: "${trimmed}"`,
          payload: {
            prompt: { de: trimmed, en: trimmed },
            source: 'empire-game',
          },
        });
      } catch {
        /* ignore localStorage quota/errors */
      }

      // Fire background sync to API if available
      try {
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'kategorie',
            title: trimmed,
            summary: `Neues Empire-Thema vorgeschlagen aus der Gruppe: "${trimmed}"`,
            clientTimestamp: Date.now(),
          }),
        }).catch(() => {});
      } catch {
        /* ignore */
      }
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

    if (passIndex + 1 < playerCount) {
      setPassIndex(passIndex + 1);
    } else {
      // All players done! Proceed to Reading phase
      setReadingList(shuffle(newTerms));
      setReadIndex(0);
      setReadRound(1);
      setPhase('read');
    }
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
        <div className="space-y-4 text-left w-full max-w-2xl pb-16 md:pb-0">
          {/* 1. Spacious Left-Aligned Category Hero Card */}
          <Panel className="p-6 sm:p-8 space-y-5 text-left">
            {/* Top Toolbar: Symmetrical Buttons in One Line, Random on the Far Right */}
            <div className="flex items-center justify-between gap-2.5 w-full flex-nowrap">
              <div className="flex items-center gap-2 flex-nowrap">
                {!isCustomCat && (
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="h-10 px-4 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-2 transition-colors cursor-pointer shrink-0 active:scale-95"
                    title={L('Alle Themen durchsuchen', 'Browse all topics')}
                  >
                    <BookOpen className="w-4 h-4 text-accent shrink-0" />
                    <span>{L('Alle Themen', 'All topics')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCat(!isCustomCat);
                    if (!isCustomCat && !customPrompt) {
                      setCustomPrompt('');
                    }
                  }}
                  className="h-10 px-4 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-accent flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-95"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>{isCustomCat ? L('Vorschläge', 'Presets') : L('Eigenes', 'Custom')}</span>
                </button>
              </div>

              {!isCustomCat && (
                <button
                  type="button"
                  onClick={drawRandomCategory}
                  className="w-10 h-10 rounded-control bg-surface-2 hover:bg-surface-raised border border-border flex items-center justify-center text-text-secondary hover:text-text transition-colors cursor-pointer shrink-0 active:scale-95 ml-auto"
                  title={L('Anderes Zufallsthema ziehen', 'Draw another random topic')}
                  aria-label={L('Zufälliges Thema', 'Random topic')}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              )}
            </div>

            {isCustomCat ? (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-sm font-bold text-text block">
                    {L('Eigenes Thema eingeben:', 'Enter custom topic:')}
                  </label>
                  <p className="text-2xs text-text-tertiary mt-0.5">
                    {L('Wird automatisch auch als neuer Themenvorschlag gespeichert.', 'Will automatically also be submitted as a new topic idea.')}
                  </p>
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder={L('z. B. Dinge, die man im Jugendcamp um 2 Uhr nachts hört', 'e.g. Things heard at 2am in camp')}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-control bg-surface-2 border border-border text-base font-semibold text-text focus:border-accent focus:outline-hidden"
                />
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* Prominent Left-Aligned Topic Text - Slightly Larger */}
                <h2 className="text-2xl sm:text-3xl font-black text-text leading-tight tracking-tight break-words">
                  {selectedCat.prompt[language]}
                </h2>

                {/* Guiding Hint */}
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {selectedCat.hint[language]}
                </p>

                {/* Exactly 2 Examples in a Single Clean Line */}
                {selectedCat.examples?.[language]?.length > 0 && (
                  <div className="pt-3.5 border-t border-border/40 flex items-center gap-2 flex-nowrap overflow-hidden text-2xs sm:text-xs text-text-tertiary">
                    <span className="font-semibold uppercase tracking-wider shrink-0 text-text-tertiary">
                      {L('Beispiele:', 'e.g.')}
                    </span>
                    {selectedCat.examples[language].slice(0, 2).map((ex, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-text-secondary font-medium truncate max-w-[140px] sm:max-w-[240px]"
                        title={ex}
                      >
                        „{ex}“
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* 2. Compact Symmetrical Player Count Row */}
          <div className="flex items-center justify-between px-4 py-3 rounded-card bg-surface border border-border">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text">
                {L('Mitspielende:', 'Players:')}
              </span>
              <span className="text-sm font-bold text-accent tabular-nums">
                {playerCount} {L('Personen', 'players')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlayerCount(Math.max(3, playerCount - 1))}
                disabled={playerCount <= 3}
                className="w-9 h-9 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-base font-bold text-text flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors active:scale-95"
                aria-label={L('Weniger Personen', 'Fewer players')}
              >
                −
              </button>
              <span className="w-7 text-center font-bold text-base text-text tabular-nums">
                {playerCount}
              </span>
              <button
                type="button"
                onClick={() => setPlayerCount(Math.min(30, playerCount + 1))}
                disabled={playerCount >= 30}
                className="w-9 h-9 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-base font-bold text-text flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors active:scale-95"
                aria-label={L('Mehr Personen', 'More players')}
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Primary Start Button (sticky on mobile for instant thumb access, inline on desktop) */}
          <div className="sticky md:static bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-auto z-30 pt-2 pb-2 md:p-0">
            <button
              type="button"
              onClick={startEntry}
              className={`${primaryBtn} w-full text-base py-3.5 flex items-center justify-center gap-2 shadow-lg md:shadow-none`}
            >
              <span>
                {L('Zettel geheim eingeben', 'Secret slip entry')} ({playerCount} {L('Personen', 'players')})
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4. Full Category Picker Sheet - Ultra Compact & Space-Efficient */}
          <Sheet
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            title={L('Empire-Thema auswählen', 'Choose Empire Topic')}
            description={L(
              'Wähle ein Thema aus der Sammlung für deine Gruppe.',
              'Choose a topic from the collection for your group.'
            )}
          >
            <div className="space-y-3 pt-1">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  inputMode="search"
                  placeholder={L('Thema oder Stichwort suchen...', 'Search topic or keyword...')}
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-control bg-surface-2 border border-border text-xs font-medium text-text placeholder:text-text-tertiary focus:border-accent focus:outline-hidden"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1 cursor-pointer"
                    aria-label={L('Suche leeren', 'Clear search')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scrollable Compact Category List - 12 to 16 items fit per view */}
              <div className="space-y-1.5 max-h-[62vh] overflow-y-auto pr-1">
                {filteredCategories.length === 0 ? (
                  <div className="py-8 text-center text-text-tertiary text-xs">
                    {L('Kein passendes Thema gefunden.', 'No matching topic found.')}
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = selectedCat.id === cat.id && !isCustomCat;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCat(cat);
                          setIsCustomCat(false);
                          setIsPickerOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-control border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-accent/10 border-accent/50 text-text ring-1 ring-accent/30 font-bold'
                            : 'bg-surface hover:bg-surface-2 border-border/80 text-text font-medium'
                        }`}
                      >
                        <span className="text-xs sm:text-sm leading-snug break-words">
                          {cat.prompt[language]}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </Sheet>
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
                  {L(`Person ${passIndex + 1}`, `Player ${passIndex + 1}`)}
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
                    {L(`Person ${passIndex + 1} von ${playerCount}`, `Player ${passIndex + 1} of ${playerCount}`)}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-text mt-1 leading-snug break-words">
                    {activeCategoryTitle}
                  </p>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
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
            <p className="text-2xs font-bold uppercase tracking-wider text-text-tertiary break-words max-w-md">
              {activeCategoryTitle}
            </p>
            <div className="text-3xl sm:text-4xl font-black text-text leading-tight tracking-tight break-words max-w-full">
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
              <span className="text-2xs font-bold text-text-tertiary px-2 py-0.5 rounded-full bg-surface-2 border border-border tabular-nums">
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
