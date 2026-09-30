import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Timer, Dices, MessageSquareQuote, HeartHandshake, 
  Play, Pause, RotateCcw, Volume2, VolumeX, Copy, Check, Plus, 
  Shuffle, ArrowRight, Sparkles, AlertCircle 
} from 'lucide-react';
import { Language } from '../types';
import { DISCUSSION_CARDS, CAMP_BEST_PRACTICES } from '../data/toolkits';
import { UI_TRANSLATIONS } from '../data/translations';
import { EmpireBoard } from './EmpireBoard';

interface ToolkitsViewProps {
  language: Language;
}

export const ToolkitsView: React.FC<ToolkitsViewProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'timer' | 'empire' | 'discussion' | 'playbook'>('teams');
  const t = UI_TRANSLATIONS[language];

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
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (rawNames.length === 0) return;

    // Shuffle array (Fisher-Yates)
    const shuffled = [...rawNames];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const count = isPairsMode ? Math.max(1, Math.ceil(shuffled.length / 2)) : teamCount;
    const teams: { id: number; members: string[] }[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      members: []
    }));

    shuffled.forEach((name, index) => {
      teams[index % count].members.push(name);
    });

    setGeneratedTeams(teams);
  };

  const handleCopyTeams = () => {
    if (generatedTeams.length === 0) return;
    const lines = generatedTeams.map(team => {
      const title = isPairsMode ? `👥 Tandem ${team.id}` : `🏆 ${t.teamLabel} ${team.id}`;
      return `${title}:\n${team.members.map(m => `  • ${m}`).join('\n')}`;
    });
    navigator.clipboard.writeText(lines.join('\n\n'));
    setCopiedTeams(true);
    setTimeout(() => setCopiedTeams(false), 2000);
  };

  const handleLoadDemoNames = () => {
    setNamesText(defaultNames);
  };

  // -------------------------
  // 2. COUNTDOWN TIMER STATE
  // -------------------------
  const [totalSeconds, setTotalSeconds] = useState(300); // Default 5 min
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<number | null>(null);

  // Synthesize Web Audio chime (no external mp3 file needed, 100% offline!)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chime chord
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
      // AudioContext policy fallback
    }
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
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
  }, [isTimerRunning, soundEnabled]);

  const handleSetTimer = (seconds: number) => {
    setIsTimerRunning(false);
    setTotalSeconds(seconds);
    setSecondsRemaining(seconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 
    ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header & 5-Segment Tool Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t.toolsHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {t.toolsHeaderDesc}
          </p>
        </div>

        {/* Apple Segmented Control */}
        <div className="overflow-x-auto pb-1 custom-scrollbar">
          <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] min-w-max">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                activeTab === 'teams'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.tabTeamSplitter}</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                activeTab === 'timer'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.tabCountdownTimer}</span>
            </button>

            <button
              onClick={() => setActiveTab('empire')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                activeTab === 'empire'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <Dices className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.tabEmpireTool}</span>
            </button>

            <button
              onClick={() => setActiveTab('discussion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                activeTab === 'discussion'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>{t.tabDiscussionTool} ({DISCUSSION_CARDS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('playbook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                activeTab === 'playbook'
                  ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t.tabPlaybookTool}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. FAIR TEAM SPLITTER */}
      {activeTab === 'teams' && (
        <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-8 shadow-apple-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.05] pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0071e3]" />
                <span>{t.teamSplitterTitle}</span>
              </h2>
              <p className="text-xs text-[#86868b] mt-0.5">
                {t.teamSplitterDesc}
              </p>
            </div>

            <button
              onClick={handleLoadDemoNames}
              className="px-3.5 py-1.5 text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] rounded-full transition-colors self-start sm:self-auto"
            >
              {language === 'de' ? 'Beispiel-Gruppe einfügen' : 'Insert sample roster'}
            </button>
          </div>

          {/* Names Input Area */}
          <div className="space-y-2">
            <textarea
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              placeholder={t.namesInputPlaceholder}
              rows={3}
              className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-black/[0.03] border border-black/[0.08] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all text-[#1d1d1f] placeholder:text-[#86868b]"
            />
          </div>

          {/* Controls: Mode & Count & Shuffle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#86868b] font-medium">{t.teamCountLabel}</span>
              <div className="inline-flex items-center p-0.5 bg-black/[0.05] rounded-full border border-black/[0.03]">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setIsPairsMode(false);
                      setTeamCount(num);
                    }}
                    className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                      teamCount === num && !isPairsMode
                        ? 'bg-white text-[#1d1d1f] shadow-apple-pill'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsPairsMode(!isPairsMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isPairsMode
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-apple-pill'
                    : 'bg-white text-[#6e6e73] border-black/[0.06] hover:text-[#1d1d1f]'
                }`}
              >
                {t.pairsModeBtn}
              </button>
            </div>

            <button
              onClick={handleShuffleTeams}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-apple-pill transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{t.shuffleTeamsBtn}</span>
            </button>
          </div>

          {/* Results: Team Cards */}
          {generatedTeams.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-black/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                  {isPairsMode ? `${generatedTeams.length} Tandems` : `${generatedTeams.length} Teams`}
                </span>

                <button
                  onClick={handleCopyTeams}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] hover:underline"
                >
                  {copiedTeams ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTeams ? t.teamsCopied : t.copyTeamsBtn}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {generatedTeams.map(team => (
                  <div
                    key={team.id}
                    className="p-4 bg-[#f5f5f7] border border-black/[0.04] rounded-2xl space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-black/[0.05] pb-2">
                      <span className="font-semibold text-xs text-[#1d1d1f]">
                        {isPairsMode ? `👥 Tandem ${team.id}` : `🏆 ${t.teamLabel} ${team.id}`}
                      </span>
                      <span className="text-[11px] font-mono text-[#86868b]">
                        {team.members.length} {language === 'de' ? 'Pers.' : 'youth'}
                      </span>
                    </div>

                    <ul className="space-y-1 text-xs text-[#1d1d1f]">
                      {team.members.map((member, i) => (
                        <li key={i} className="flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                          <span>{member}</span>
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

      {/* 2. ACTIVITY & REFLECTION COUNTDOWN TIMER */}
      {activeTab === 'timer' && (
        <div className="bg-white rounded-3xl border border-black/[0.06] p-8 sm:p-12 shadow-apple-card space-y-8 text-center max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">
              {t.timerTitle}
            </h2>
            <p className="text-xs text-[#86868b] mt-1">
              {t.timerDesc}
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: t.timer1Min, secs: 60 },
              { label: t.timer3Min, secs: 180 },
              { label: t.timer5Min, secs: 300 },
              { label: t.timer10Min, secs: 600 },
              { label: t.timer15Min, secs: 900 },
            ].map(p => (
              <button
                key={p.secs}
                onClick={() => handleSetTimer(p.secs)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all border ${
                  totalSeconds === p.secs
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-apple-pill'
                    : 'bg-white text-[#6e6e73] border-black/[0.06] hover:text-[#1d1d1f]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Large Digital Clock Face */}
          <div className="space-y-4">
            <div className={`font-mono text-6xl sm:text-7xl font-light tracking-tight transition-colors ${
              secondsRemaining === 0 ? 'text-rose-600 animate-pulse' : 'text-[#1d1d1f]'
            }`}>
              {formatTime(secondsRemaining)}
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full max-w-md mx-auto h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0071e3] transition-all duration-1000 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {secondsRemaining === 0 && (
              <p className="text-sm font-semibold text-rose-600 animate-in fade-in">
                🔔 {t.timerFinished}
              </p>
            )}
          </div>

          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex items-center gap-2 px-8 py-3 bg-[#1d1d1f] hover:bg-black text-white text-sm font-semibold rounded-full shadow-apple-pill transition-all"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isTimerRunning ? t.pauseTimer : t.startTimer}</span>
            </button>

            <button
              onClick={() => handleSetTimer(totalSeconds)}
              className="p-3 text-[#86868b] hover:text-[#1d1d1f] border border-black/[0.08] hover:bg-black/[0.04] rounded-full transition-colors"
              title={t.resetTimer}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-full border transition-colors ${
                soundEnabled 
                  ? 'border-emerald-600/30 text-emerald-600 bg-emerald-500/10' 
                  : 'border-black/[0.08] text-[#86868b]'
              }`}
              title={t.soundToggleLabel}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 3. EMPIRE GAME ASSISTANT */}
      {activeTab === 'empire' && (
        <EmpireBoard language={language} />
      )}

      {/* 4. DISCUSSION CARDS (10 Deepening Cards) */}
      {activeTab === 'discussion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {DISCUSSION_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-apple-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1d1d1f]">
                    {card.theme[language]}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#1d1d1f] leading-snug">
                  {card.title[language]}
                </h3>

                <blockquote className="italic font-serif text-xs text-[#6e6e73] border-l-2 border-black/20 pl-3 py-1 bg-[#f5f5f7] rounded-r-xl leading-relaxed">
                  {card.quoteSnippet[language]}
                </blockquote>

                <div className="bg-[#f5f5f7] border border-black/[0.03] p-3.5 rounded-xl">
                  <strong className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                    {t.coreQuestionLabel}:
                  </strong>
                  <p className="text-xs text-[#1d1d1f] leading-relaxed font-medium">
                    {card.coreQuestion[language]}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.deepeningQuestionsLabel}:
                </span>
                <ul className="space-y-1 text-xs text-[#6e6e73]">
                  {card.deepeningQuestions[language].map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#aeaeb2] font-bold">•</span>
                      <span className="leading-relaxed font-normal">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. FACILITATOR PLAYBOOK & BEST PRACTICES */}
      {activeTab === 'playbook' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {CAMP_BEST_PRACTICES.map((bp) => (
            <div
              key={bp.id}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-apple-card space-y-4"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1d1d1f]">
                {bp.area[language]}
              </span>

              <h3 className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                {bp.title[language]}
              </h3>

              <p className="text-xs font-serif italic text-[#1d1d1f] bg-[#f5f5f7] border border-black/[0.03] p-3.5 rounded-xl leading-relaxed">
                „{bp.quoteOrMotto[language]}“
              </p>

              <ul className="space-y-1.5 text-xs text-[#6e6e73]">
                {bp.keyInsights[language].map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#aeaeb2]">•</span>
                    <span className="leading-relaxed font-normal">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
