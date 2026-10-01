import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, Timer, Dices, MessageSquareQuote, 
  Play, Pause, RotateCcw, Volume2, VolumeX, Copy, Check, 
  ChevronRight, ArrowLeft, Crown, Shuffle 
} from 'lucide-react';
import { Language } from '../types';
import { DISCUSSION_CARDS } from '../data/toolkits';
import { UI_TRANSLATIONS } from '../data/translations';
import { EmpireBoard } from './EmpireBoard';

interface ToolkitsViewProps {
  language: Language;
  toolId?: string | null;
}

type ToolKey = 'teams' | 'timer' | 'cards' | 'empire';

export const ToolkitsView: React.FC<ToolkitsViewProps> = ({ language, toolId: propToolId }) => {
  const { toolId: routeToolId } = useParams<{ toolId?: string }>();
  const toolId = propToolId ?? routeToolId;
  const t = UI_TRANSLATIONS[language];
  const navigate = useNavigate();

  // -------------------------
  // 1. TEAM SPLITTER STATE
  // -------------------------
  const defaultNames = 'Amin, Leyla, Jonas, Maya, Tarek, Sarah, David, Nuria, Paul, Emma, Liam, Sofie';
  const [namesText, setNamesText] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [isPairsMode, setIsPairsMode] = useState(false);
  const [generatedTeams, setGeneratedTeams] = useState<{ id: number; members: string[] }[]>([]);
  const [copiedTeams, setCopiedTeams] = useState(false);

  const handleShuffleTeams = () => {
    const rawNames = namesText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (rawNames.length === 0) return;

    const shuffled = [...rawNames];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const count = isPairsMode ? Math.max(1, Math.ceil(shuffled.length / 2)) : teamCount;
    const teams: { id: number; members: string[] }[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      members: [],
    }));

    shuffled.forEach((name, index) => {
      teams[index % count].members.push(name);
    });

    setGeneratedTeams(teams);
  };

  const handleCopyTeams = () => {
    if (generatedTeams.length === 0) return;
    const lines = generatedTeams.map((team) => {
      const title = isPairsMode ? `👥 Tandem ${team.id}` : `🏆 ${t.teamLabel} ${team.id}`;
      return `${title}:\n${team.members.map((m) => `  • ${m}`).join('\n')}`;
    });
    navigator.clipboard.writeText(lines.join('\n\n'));
    setCopiedTeams(true);
    setTimeout(() => setCopiedTeams(false), 2000);
  };

  // -------------------------
  // 2. COUNTDOWN TIMER STATE
  // -------------------------
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 min
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<number | null>(null);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2 + idx * 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + 1.5 + idx * 0.2);
      });
    } catch {
      // AudioContext may be blocked before first user gesture
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, playChime]);

  const handleStartPauseTimer = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(totalSeconds);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  const handlePresetTime = (sec: number) => {
    setIsTimerRunning(false);
    setTotalSeconds(sec);
    setSecondsRemaining(sec);
  };

  const formatTimerDigits = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // -------------------------
  // 3. DISCUSSION CARDS STATE
  // -------------------------
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const activeDiscussionCard = DISCUSSION_CARDS[currentCardIndex];

  const handleDrawNextCard = () => {
    const nextIdx = (currentCardIndex + 1 + Math.floor(Math.random() * (DISCUSSION_CARDS.length - 1))) % DISCUSSION_CARDS.length;
    setCurrentCardIndex(nextIdx);
  };

  // Overview 4 Tools Definitions
  const toolsList: { id: ToolKey; titleDe: string; titleEn: string; descDe: string; descEn: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'teams',
      titleDe: 'Gruppenteiler & Tandems',
      titleEn: 'Team & Tandem Splitter',
      descDe: 'Faire, zufällige Team- und Tandem-Aufteilung ohne Ausgrenzung.',
      descEn: 'Fair, balanced random team generator and partnership splitter.',
      icon: Users,
    },
    {
      id: 'timer',
      titleDe: 'Countdown-Timer',
      titleEn: 'Countdown Timer',
      descDe: 'Große, klare Zeitanzeige mit Glockenschlag für Spiele und Andachten.',
      descEn: 'Large visual timer with acoustic chime for games and group focus.',
      icon: Timer,
    },
    {
      id: 'cards',
      titleDe: 'Reflexions- & Beratungskarten',
      titleEn: 'Reflection & Discussion Cards',
      descDe: 'Inspirierende Fragen und Zitate zur Vertiefung von Gruppengesprächen.',
      descEn: 'Consultation prompts and deepening questions for junior youth circles.',
      icon: MessageSquareQuote,
    },
    {
      id: 'empire',
      titleDe: 'Empire-Spielleitung',
      titleEn: 'Empire Game Assistant',
      descDe: 'Kategorien-Generator und digitaler Spielleiter für das beliebte Geländespiel.',
      descEn: 'Category generator and board tracker for the classic Empire game.',
      icon: Crown,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* If toolId is not specified, show 4 Cards Section Page */}
      {!toolId ? (
        <div className="space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-5 sm:p-7 shadow-xs">
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {t.tabTools}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {language === 'de' 
                ? '4 interaktive Werkzeuge zur Begleitung von Gruppen und Camps.' 
                : '4 practical utilities for running junior youth groups and camps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => navigate(`/tools/${tool.id}`)}
                  className="bg-surface rounded-3xl border border-border p-6 shadow-xs hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors">
                        {language === 'de' ? tool.titleDe : tool.titleEn}
                      </h2>
                      <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                        {language === 'de' ? tool.descDe : tool.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-border flex items-center justify-between text-xs font-semibold text-accent-text">
                    <span>{language === 'de' ? 'Werkzeug öffnen' : 'Open Tool'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full-Width Tool View */
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[36px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Alle Werkzeuge' : 'All Tools'}</span>
            </button>
          </div>

          {/* Tool 1: Gruppenteiler */}
          {toolId === 'teams' && (
            <div className="bg-surface rounded-3xl border border-border p-5 sm:p-8 shadow-xs space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  {language === 'de' ? 'Gruppenteiler & Tandems' : 'Team & Tandem Splitter'}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {language === 'de' ? 'Namen eingeben und in faire, zufällige Gruppen einteilen.' : 'Enter names and generate fair random groups.'}
                </p>
              </div>

              {/* Names Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{t.enterNamesLabel}</span>
                  <button
                    type="button"
                    onClick={() => setNamesText(defaultNames)}
                    className="text-accent-text hover:underline font-semibold"
                  >
                    {t.loadDemoNames}
                  </button>
                </div>
                <textarea
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  placeholder="Amin, Leyla, Jonas, Maya..."
                  rows={3}
                  className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Controls: Mode & Count */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-2 rounded-2xl border border-border text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPairsMode(false)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      !isPairsMode ? 'bg-surface text-text shadow-xs font-bold' : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {language === 'de' ? 'Teams' : 'Teams'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPairsMode(true)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      isPairsMode ? 'bg-surface text-text shadow-xs font-bold' : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {language === 'de' ? 'Zweier-Tandems' : 'Pairs'}
                  </button>
                </div>

                {!isPairsMode && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">{language === 'de' ? 'Anzahl Teams:' : 'Number of teams:'}</span>
                    {[2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setTeamCount(cnt)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                          teamCount === cnt ? 'bg-accent text-accent-contrast shadow-xs' : 'bg-surface border border-border text-text'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Single Primary Action: Teams auslosen */}
              <div>
                <button
                  type="button"
                  onClick={handleShuffleTeams}
                  disabled={!namesText.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 min-h-[44px]"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>{language === 'de' ? 'Teams jetzt auslosen' : 'Shuffle Teams Now'}</span>
                </button>
              </div>

              {/* Generated Teams Grid */}
              {generatedTeams.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text">
                      {language === 'de' ? 'Ausgeloste Teams' : 'Generated Teams'} ({generatedTeams.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleCopyTeams}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-medium text-text transition-colors cursor-pointer"
                    >
                      {copiedTeams ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTeams ? (language === 'de' ? 'Kopiert!' : 'Copied!') : (language === 'de' ? 'Teams kopieren' : 'Copy Teams')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {generatedTeams.map((team) => (
                      <div key={team.id} className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                        <span className="text-xs font-bold text-accent-text block">
                          {isPairsMode ? `👥 Tandem ${team.id}` : `🏆 Team ${team.id}`} ({team.members.length})
                        </span>
                        <ul className="text-xs sm:text-sm text-text space-y-1">
                          {team.members.map((m, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tool 2: Countdown Timer */}
          {toolId === 'timer' && (
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-12 shadow-xs text-center space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text">
                  {language === 'de' ? 'Countdown-Timer' : 'Countdown Timer'}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {language === 'de' ? 'Präziser Gruppen-Timer mit akustischem Glockensignal.' : 'Visual countdown with acoustic chime.'}
                </p>
              </div>

              {/* Big Digital Display */}
              <div className="py-4">
                <div className="text-6xl sm:text-8xl font-mono font-extrabold text-accent-text tracking-tighter select-none">
                  {formatTimerDigits(secondsRemaining)}
                </div>
              </div>

              {/* Single Primary Action: Timer starten */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartPauseTimer}
                  className="px-8 py-3.5 rounded-2xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-base flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[48px]"
                >
                  {isTimerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isTimerRunning ? (language === 'de' ? 'Timer anhalten' : 'Pause Timer') : (language === 'de' ? 'Timer starten' : 'Start Timer')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="p-3.5 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border text-text transition-colors cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label="Zurücksetzen"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center ${
                    soundEnabled ? 'bg-surface-2 border-border text-text' : 'border-border text-text-tertiary'
                  }`}
                  aria-label="Ton an/aus"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-accent-text" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-border">
                {[60, 180, 300, 600, 900].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handlePresetTime(sec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      totalSeconds === sec && !isTimerRunning
                        ? 'bg-accent text-accent-contrast'
                        : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                    }`}
                  >
                    {sec / 60} Min.
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool 3: Reflexionskarten */}
          {toolId === 'cards' && (
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  {language === 'de' ? 'Reflexions- & Beratungskarten' : 'Reflection & Discussion Cards'}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {language === 'de' ? 'Inspirierende Impulse für Gruppenberatung und Vertiefung.' : 'Thought-provoking prompts for group consultation.'}
                </p>
              </div>

              {/* Active Discussion Card */}
              {activeDiscussionCard && (
                <div className="p-6 sm:p-8 rounded-3xl bg-surface-2 border border-border space-y-5 text-center">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-accent-text block">
                    {activeDiscussionCard.theme[language]}
                  </span>

                  <h2 className="text-xl sm:text-3xl font-bold text-text leading-snug">
                    „{activeDiscussionCard.coreQuestion[language]}“
                  </h2>

                  <blockquote className="font-serif italic text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
                    „{activeDiscussionCard.quoteSnippet[language]}“
                  </blockquote>

                  {activeDiscussionCard.deepeningQuestions[language].length > 0 && (
                    <div className="pt-4 border-t border-border max-w-md mx-auto text-left space-y-2">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary block">
                        {language === 'de' ? 'Vertiefungsfragen:' : 'Deepening Questions:'}
                      </span>
                      <ul className="text-xs text-text-secondary space-y-1">
                        {activeDiscussionCard.deepeningQuestions[language].map((q, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Single Primary Action: Nächste Karte ziehen */}
              <div>
                <button
                  type="button"
                  onClick={handleDrawNextCard}
                  className="w-full py-3.5 px-4 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Dices className="w-4 h-4" />
                  <span>{language === 'de' ? 'Nächste Karte ziehen' : 'Draw Next Card'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tool 4: Empire Board Assistant */}
          {toolId === 'empire' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  {language === 'de' ? 'Empire-Spielleitung' : 'Empire Game Assistant'}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {language === 'de' ? 'Kategorien-Generator und digitaler Spielleiter für das Empire-Spiel.' : 'Category generator and board tracker for the Empire game.'}
                </p>
              </div>

              <EmpireBoard language={language} />
            </div>
          )}
        </div>
      )}

    </div>
  );
};
