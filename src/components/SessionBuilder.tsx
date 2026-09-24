import React, { useState } from 'react';
import { Clock, BookOpen, Copy, Check, Printer, Music, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { Language, DevotionalSong, QuoteItem } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { DEVOTIONAL_SONGS_DATA } from '../data/songs';
import { QUOTES_DATA } from '../data/quotes';

interface SessionBuilderProps {
  language: Language;
  onOpenBahaiSongs: () => void;
}

interface PlanStep {
  stage: string;
  title: string;
  duration: string;
  description: string;
  materials: string[];
  tips: string;
}

export const SessionBuilder: React.FC<SessionBuilderProps> = ({
  language,
  onOpenBahaiSongs,
}) => {
  const [activeMode, setActiveMode] = useState<'session' | 'devotional'>('session');
  
  // Session planner state
  const [duration, setDuration] = useState<30 | 45 | 60>(45);
  const [focus, setFocus] = useState<'quotes' | 'teambuilding' | 'energy' | 'evening'>('quotes');
  const [copiedSession, setCopiedSession] = useState(false);

  // Devotional planner state
  const [devotionalTheme, setDevotionalTheme] = useState<string>('wahrhaftigkeit');
  const [openingSong, setOpeningSong] = useState<DevotionalSong>(DEVOTIONAL_SONGS_DATA[1]); // Blessed is the spot
  const [centerSong, setCenterSong] = useState<DevotionalSong>(DEVOTIONAL_SONGS_DATA[3]); // Love is the light
  const [closingSong, setClosingSong] = useState<DevotionalSong>(DEVOTIONAL_SONGS_DATA[0]); // Remover of difficulties
  const [selectedReading, setSelectedReading] = useState<QuoteItem>(QUOTES_DATA[0]);
  const [copiedDevotional, setCopiedDevotional] = useState(false);

  const t = UI_TRANSLATIONS[language];

  // Youth Session Plan
  const sessionPlan: PlanStep[] = React.useMemo(() => {
    if (focus === 'quotes') {
      return [
        {
          stage: t.step1Name,
          title: language === 'de' ? 'Schnick-Schnack-Schnuck Evolution' : 'Rock Paper Scissors Evolution',
          duration: '8 Min',
          description: language === 'de' 
            ? 'Lockert die Jugendlichen sofort auf, bringt Bewegung in den Raum und baut Hemmungen ab.'
            : 'Energizes participants, breaks ice, and relieves tension through light physical movement.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de' 
            ? 'Gruppenleiter machen die Stufen selbst mit Humor vor.'
            : 'Facilitators actively participate in the movement stages.'
        },
        {
          stage: t.step2Name,
          title: language === 'de' ? 'Die verschwindende Tafel' : 'The Disappearing Board',
          duration: duration === 30 ? '14 Min' : '22 Min',
          description: language === 'de'
            ? 'Das gewählte Zitat wird an die Wand geschrieben. Durch schrittweises Tilgen von Wörtern prägt sich der Satz ohne Bloßstellung ein.'
            : 'The quote is written on the board. Through progressive word erasure, the group memorizes the passage collectively without feeling put on the spot.',
          materials: [language === 'de' ? 'Tafel oder integriertes Digital-Board' : 'Chalkboard or digital board'],
          tips: language === 'de'
            ? 'Jugendliche selbst Wörter auswählen lassen, die sie löschen wollen.'
            : 'Invite youth to choose which words to erase.'
        },
        {
          stage: t.step3Name,
          title: language === 'de' ? 'Wort-Mind (Stummes Zählen)' : 'Word Mind (Silent Recitation)',
          duration: duration === 30 ? '8 Min' : '15 Min',
          description: language === 'de'
            ? 'Alle schließen die Augen. Die Gruppe spricht das Zitat Wort für Wort durch, ohne vorab festgelegte Reihenfolge.'
            : 'With eyes closed, the group recites the quote word by word with no predetermined speaking order.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de'
            ? 'Schafft einen feierlichen, ruhigen Übergang zu einer Reflexion oder Andacht.'
            : 'Creates a quiet, reverent transition to devotions or shared reflection.'
        }
      ];
    }

    if (focus === 'teambuilding') {
      return [
        {
          stage: t.step1Name,
          title: language === 'de' ? 'Stand Up (Rücken an Rücken)' : 'Back-to-Back Stand Up',
          duration: '10 Min',
          description: language === 'de'
            ? 'Erst zu zweit, dann zu viert: Ohne Hände nur durch synchronen Gegendruck vom Boden aufstehen.'
            : 'Pairs, then quartets, rise from the floor without using hands purely through mutual back pressure.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de'
            ? 'Auf rutschfeste Socken achten und den Zähltakt klar vorgeben.'
            : 'Ensure non-slip footing and count a unified rhythm.'
        },
        {
          stage: t.step2Name,
          title: language === 'de' ? 'Helium Stick (Die schwebende Stange)' : 'Helium Stick',
          duration: duration === 30 ? '12 Min' : '20 Min',
          description: language === 'de'
            ? 'Eine leichte Stange liegt auf den Zeigefingern aller Teilnehmer. Das Ziel: sie gemeinsam abzulegen.'
            : 'A lightweight stick rests on index fingers. The goal is to lower it simultaneously without breaking contact.',
          materials: [language === 'de' ? 'Leichte Stange oder Schnur' : 'Thin stick or light pole'],
          tips: language === 'de'
            ? 'Vorab nicht verraten, dass die Stange unweigerlich steigt.'
            : 'Do not disclose in advance that the stick naturally rises.'
        },
        {
          stage: t.step3Name,
          title: language === 'de' ? 'Gemeinsam Zählen (The Mind)' : 'Silent Counting (The Mind)',
          duration: duration === 30 ? '8 Min' : '15 Min',
          description: language === 'de'
            ? 'Die Gruppe zählt mit geschlossenen Augen von 1 bis 20 ohne Absprachen.'
            : 'The group counts collaboratively from 1 to 20 with eyes closed and no signaling.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de'
            ? 'Nach Fehlschlägen gemeinsam tief durchatmen.'
            : 'Take a collective breath together after any reset.'
        }
      ];
    }

    if (focus === 'energy') {
      return [
        {
          stage: t.step1Name,
          title: language === 'de' ? 'Ninja' : 'Ninja',
          duration: '10 Min',
          description: language === 'de'
            ? 'Rundenbasiertes Reaktionsduell im Kreis mit festen Posen.'
            : 'Turn-based reaction game in a circle with striking and dodging poses.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de'
            ? 'Auf sanfte, präzise Berührungen achten.'
            : 'Emphasize precise, gentle taps rather than force.'
        },
        {
          stage: t.step2Name,
          title: language === 'de' ? 'SSP Showdown (Fankurve)' : 'RPS Showdown & Cheer Rally',
          duration: duration === 30 ? '12 Min' : '20 Min',
          description: language === 'de'
            ? 'Besiegte werden zur lautstarken Fankurve des Gewinners, bis zwei Titanen mit riesigen Chören im Finale stehen.'
            : 'Defeated players join the winner\'s cheer squad until two final titans face off.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de'
            ? 'Spielleiter heizen die Stimmung als Stadionsprecher an.'
            : 'Facilitators act as stadium announcers to build excitement.'
        },
        {
          stage: t.step3Name,
          title: language === 'de' ? 'Eisschollen-Rettung' : 'Ice Floe Rescue',
          duration: duration === 30 ? '8 Min' : '15 Min',
          description: language === 'de'
            ? 'Das gesamte Team muss auf Teppichfliesen einen Fluss überqueren, ohne den Boden zu berühren.'
            : 'The team crosses a river using limited carpet tiles without stepping on the floor.',
          materials: [language === 'de' ? 'Teppichfliesen oder Pappen' : 'Carpet tiles or cardboard'],
          tips: language === 'de'
            ? 'Kreative Transportketten belohnen.'
            : 'Praise creative physical chain strategies.'
        }
      ];
    }

    // Default: Evening
    return [
      {
        stage: t.step1Name,
        title: language === 'de' ? 'Wer bin ich' : 'Who Am I',
        duration: '12 Min',
        description: language === 'de'
          ? 'Zettel auf der Stirn mit Ja/Nein-Fragen erraten.'
          : 'Guess the identity on your forehead through yes/no questions.',
        materials: [language === 'de' ? 'Post-its & Stifte' : 'Sticky notes & pens'],
        tips: language === 'de'
          ? 'Lustige Insider oder Camp-Figuren wählen.'
          : 'Use funny camp characters or shared references.'
      },
      {
        stage: t.step2Name,
        title: language === 'de' ? 'Empire (Königreich)' : 'Empire',
        duration: duration === 30 ? '12 Min' : '23 Min',
        description: language === 'de'
          ? 'Geheime Begriffe einer Kategorie abfragen und gegnerische Königreiche schrittweise übernehmen.'
          : 'Guess secret aliases within a category and conquer opposing kingdoms.',
        materials: [language === 'de' ? 'Zettel, Stifte oder Empire-Tool' : 'Paper, pens or Empire tool'],
        tips: language === 'de'
          ? 'Das integrierte Live-Empire-Board nutzen.'
          : 'Use the integrated live Empire board.'
      },
      {
        stage: t.step3Name,
        title: language === 'de' ? 'Stummes Zählen' : 'Counting in Silence',
        duration: '6 Min',
        description: language === 'de'
          ? 'Ruhiges gemeinsames Zählen zum Abschluss des Abends.'
          : 'Quiet, mindful group counting to conclude the evening program.',
        materials: [language === 'de' ? 'Keine' : 'None'],
        tips: language === 'de'
          ? 'Sorgt für einen beruhigten Übergang zur Nachtruhe.'
          : 'Provides a calm transition towards bedtime.'
      }
    ];
  }, [duration, focus, language, t]);

  const handleCopySessionAgenda = () => {
    const text = `AGENDA (${duration} MIN)\nFocus: ${
      focus === 'quotes' ? t.focusQuotes :
      focus === 'teambuilding' ? t.focusTeambuilding :
      focus === 'energy' ? t.focusEnergy : t.focusEvening
    }\n\n${sessionPlan.map(p => `[${p.duration}] ${p.stage}: ${p.title}\n• ${p.description}\n• Material: ${p.materials.join(', ')}\n• Tip: ${p.tips}`).join('\n\n')}`;
    
    navigator.clipboard.writeText(text);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  const handleCopyDevotionalAgenda = () => {
    const openingText = language === 'de' 
      ? 'O Du gütiger Herr! Schenke jedem dieser Flügglinge gnädig ein Paar himmlische Schwingen...'
      : 'O Thou kind Lord! Graciously bestow a pair of heavenly wings unto each of these fledglings...';

    const readingText = language === 'de' ? selectedReading.textDe : selectedReading.textEn;

    const text = `✨ ${t.devotionalProgramTitle} (${devotionalTheme.toUpperCase()})\n\n1. ${t.devotionalOpeningPrayer}\n"${openingText}"\n\n2. ${t.devotionalSong1}\n🎵 ${openingSong.title[language]} (${openingSong.key || 'C'})\nLink & Akkorde: ${openingSong.bahaiSongsUrl}\n\n3. ${t.devotionalReading}\n"${readingText}"\n— ${selectedReading.source[language]} (${selectedReading.book[language]})\n\n4. ${t.devotionalSong2}\n🎵 ${centerSong.title[language]} (${centerSong.key || 'G'})\nLink & Akkorde: ${centerSong.bahaiSongsUrl}\n\n5. ${t.devotionalReflection}\n(3–5 Min Stille / Instrumental)\n\n6. ${t.devotionalClosingSong}\n🎵 ${closingSong.title[language]} (${closingSong.key || 'D'})\nLink & Akkorde: ${closingSong.bahaiSongsUrl}\n\n7. ${t.devotionalClosingPrayer}\n\nLieder & Akkorde via bahaisongs.com`;

    navigator.clipboard.writeText(text);
    setCopiedDevotional(true);
    setTimeout(() => setCopiedDevotional(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header & Segmented Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t.plannerHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {t.plannerHeaderDesc}
          </p>
        </div>

        {/* Apple Segmented Mode Switcher */}
        <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('session')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              activeMode === 'session'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.plannerTabSession}</span>
          </button>

          <button
            onClick={() => setActiveMode('devotional')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              activeMode === 'devotional'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.plannerTabDevotional}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: YOUTH SESSION PLANNER */}
      {activeMode === 'session' && (
        <div className="space-y-6">
          {/* Settings Card */}
          <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-7 shadow-apple-card space-y-6">
            {/* Duration Selector */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block mb-2.5">
                {t.timeAvailableLabel}:
              </span>
              <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03]">
                {[30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins as 30 | 45 | 60)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      duration === mins
                        ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {mins} Min
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Grid */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block mb-2.5">
                {t.focusLabel}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setFocus('quotes')}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    focus === 'quotes'
                      ? 'bg-black/[0.03] border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-apple-card'
                      : 'bg-[#f5f5f7] border-transparent hover:bg-black/[0.05]'
                  }`}
                >
                  <span className="font-semibold text-xs text-[#1d1d1f] block mb-1">{t.focusQuotes}</span>
                  <p className="text-[11px] text-[#86868b]">Evolution ➔ Tafel ➔ Wort-Mind</p>
                </button>

                <button
                  onClick={() => setFocus('teambuilding')}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    focus === 'teambuilding'
                      ? 'bg-black/[0.03] border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-apple-card'
                      : 'bg-[#f5f5f7] border-transparent hover:bg-black/[0.05]'
                  }`}
                >
                  <span className="font-semibold text-xs text-[#1d1d1f] block mb-1">{t.focusTeambuilding}</span>
                  <p className="text-[11px] text-[#86868b]">Stand Up ➔ Helium Stick ➔ The Mind</p>
                </button>

                <button
                  onClick={() => setFocus('energy')}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    focus === 'energy'
                      ? 'bg-black/[0.03] border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-apple-card'
                      : 'bg-[#f5f5f7] border-transparent hover:bg-black/[0.05]'
                  }`}
                >
                  <span className="font-semibold text-xs text-[#1d1d1f] block mb-1">{t.focusEnergy}</span>
                  <p className="text-[11px] text-[#86868b]">Ninja ➔ Fankurve ➔ Eisschollen</p>
                </button>

                <button
                  onClick={() => setFocus('evening')}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    focus === 'evening'
                      ? 'bg-black/[0.03] border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-apple-card'
                      : 'bg-[#f5f5f7] border-transparent hover:bg-black/[0.05]'
                  }`}
                >
                  <span className="font-semibold text-xs text-[#1d1d1f] block mb-1">{t.focusEvening}</span>
                  <p className="text-[11px] text-[#86868b]">Wer bin ich ➔ Empire ➔ Stille</p>
                </button>
              </div>
            </div>
          </div>

          {/* Agenda Output Card */}
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-card overflow-hidden">
            <div className="p-5 sm:p-6 bg-[#fafafc] border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                  {t.generatedAgendaTitle}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f]">
                  {duration} Min — {
                    focus === 'quotes' ? t.focusQuotes :
                    focus === 'teambuilding' ? t.focusTeambuilding :
                    focus === 'energy' ? t.focusEnergy : t.focusEvening
                  }
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-black/[0.08] rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                  title={t.printHandout}
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopySessionAgenda}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-full transition-all shadow-apple-pill"
                >
                  {copiedSession ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSession ? t.copiedSuccess : t.copyAgenda}</span>
                </button>
              </div>
            </div>

            {/* Agenda Timeline Items */}
            <div className="p-6 sm:p-7 space-y-4">
              {sessionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </div>

                  <div className="flex-1 bg-[#f5f5f7] border border-black/[0.03] rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.05] text-[#1d1d1f]">
                        {step.stage}
                      </span>
                      <span className="text-xs font-medium text-[#86868b]">
                        {step.duration}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-[#1d1d1f]">{step.title}</h4>
                    <p className="text-xs text-[#6e6e73] leading-relaxed font-normal">{step.description}</p>

                    <div className="pt-2.5 border-t border-black/[0.05] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[#86868b]">
                        <strong className="font-semibold text-[#1d1d1f]">{t.materialsTitle}:</strong> {step.materials.join(', ')}
                      </span>
                      <span className="text-[#1d1d1f] bg-white px-2.5 py-1 rounded-full border border-black/[0.04] text-[11px]">
                        {step.tips}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DEVOTIONAL PLANNER */}
      {activeMode === 'devotional' && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="bg-white rounded-3xl border border-black/[0.06] p-6 sm:p-7 shadow-apple-card space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] pb-4">
              <div>
                <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-600" />
                  <span>{t.plannerTabDevotional}</span>
                </h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  {language === 'de'
                    ? 'Verknüpfe Lieder direkt mit bahaisongs.com für Akkorde, Texte und Aufnahmen.'
                    : 'Directly link songs from bahaisongs.com for chords, lyrics, and audio recordings.'}
                </p>
              </div>

              <button
                onClick={onOpenBahaiSongs}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-all shadow-apple-pill"
              >
                <Music className="w-3.5 h-3.5" />
                <span>{t.openBahaiSongs}</span>
              </button>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                {t.devotionalThemeLabel}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'wahrhaftigkeit', labelDe: 'Wahrhaftigkeit', labelEn: 'Truthfulness' },
                  { id: 'herz', labelDe: 'Reines Herz', labelEn: 'Pure Heart' },
                  { id: 'einheit', labelDe: 'Einheit & Liebe', labelEn: 'Unity & Love' },
                  { id: 'dienst', labelDe: 'Dienst & Taten', labelEn: 'Service & Deeds' },
                  { id: 'mut', labelDe: 'Jugend & Mut', labelEn: 'Youth & Courage' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setDevotionalTheme(th.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      devotionalTheme === th.id
                        ? 'bg-[#1d1d1f] text-white shadow-apple-pill font-semibold'
                        : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08]'
                    }`}
                  >
                    {language === 'de' ? th.labelDe : th.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Pickers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-black/[0.05]">
              {/* Song 1 */}
              <div className="space-y-1.5 bg-[#f5f5f7] p-4 rounded-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalSong1}:
                </span>
                <select
                  value={openingSong.id}
                  onChange={(e) => {
                    const found = DEVOTIONAL_SONGS_DATA.find(s => s.id === e.target.value);
                    if (found) setOpeningSong(found);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-black/[0.08] bg-white font-medium text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                >
                  {DEVOTIONAL_SONGS_DATA.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.title[language]} ({song.key})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-1">
                  <span>Tonart: {openingSong.key}</span>
                  <a
                    href={openingSong.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0071e3] font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>bahaisongs.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Song 2 */}
              <div className="space-y-1.5 bg-[#f5f5f7] p-4 rounded-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalSong2}:
                </span>
                <select
                  value={centerSong.id}
                  onChange={(e) => {
                    const found = DEVOTIONAL_SONGS_DATA.find(s => s.id === e.target.value);
                    if (found) setCenterSong(found);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-black/[0.08] bg-white font-medium text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                >
                  {DEVOTIONAL_SONGS_DATA.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.title[language]} ({song.key})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-1">
                  <span>Tonart: {centerSong.key}</span>
                  <a
                    href={centerSong.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0071e3] font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>bahaisongs.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Song 3 */}
              <div className="space-y-1.5 bg-[#f5f5f7] p-4 rounded-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalClosingSong}:
                </span>
                <select
                  value={closingSong.id}
                  onChange={(e) => {
                    const found = DEVOTIONAL_SONGS_DATA.find(s => s.id === e.target.value);
                    if (found) setClosingSong(found);
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-black/[0.08] bg-white font-medium text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                >
                  {DEVOTIONAL_SONGS_DATA.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.title[language]} ({song.key})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-1">
                  <span>Tonart: {closingSong.key}</span>
                  <a
                    href={closingSong.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0071e3] font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>bahaisongs.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Reading Selector */}
            <div className="space-y-2 pt-3 border-t border-black/[0.05]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                {t.devotionalReading}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUOTES_DATA.map(q => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedReading(q)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedReading.id === q.id
                        ? 'bg-[#1d1d1f] text-white shadow-apple-pill font-semibold'
                        : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08]'
                    }`}
                  >
                    {q.theme[language]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Devotional Program Output Card */}
          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-card overflow-hidden">
            <div className="p-5 sm:p-6 bg-[#fafafc] border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                  {t.devotionalProgramTitle}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f]">
                  {language === 'de' ? 'Andachtsprogramm' : 'Devotional Program'} — {selectedReading.theme[language]}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-black/[0.08] rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                  title={t.printHandout}
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopyDevotionalAgenda}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-full transition-all shadow-apple-pill"
                >
                  {copiedDevotional ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDevotional ? t.copiedSuccess : t.copyDevotionalPlan}</span>
                </button>
              </div>
            </div>

            {/* Devotional Agenda Items */}
            <div className="p-6 sm:p-7 space-y-4">
              
              {/* 1. Opening Prayer */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                    {t.devotionalOpeningPrayer}
                  </span>
                  <span className="text-xs text-[#86868b] font-serif italic">‘Abdu’l-Bahá</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-[#1d1d1f] leading-relaxed">
                  {language === 'de'
                    ? '„O Du gütiger Herr! Schenke jedem dieser Flügglinge gnädig ein Paar himmlische Schwingen und gib ihnen geistige Kraft...“'
                    : '"O Thou kind Lord! Graciously bestow a pair of heavenly wings unto each of these fledglings and give them spiritual power..."'}
                </p>
              </div>

              {/* 2. Opening Song */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalSong1}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-[#1d1d1f]">
                      {openingSong.title[language]}
                    </span>
                    <span className="text-xs text-[#86868b] font-mono">({openingSong.key})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenBahaiSongs}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {language === 'de' ? 'In App öffnen' : 'Open in App'}
                    </button>
                    <span>•</span>
                    <a
                      href={openingSong.bahaiSongsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#0071e3] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>bahaisongs.com</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 3. Reading / Quote */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                    {t.devotionalReading}
                  </span>
                  <span className="text-xs text-[#86868b]">
                    {selectedReading.source[language]} ({selectedReading.book[language]})
                  </span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-[#1d1d1f] leading-relaxed bg-white p-4 rounded-xl border border-black/[0.04]">
                  „{language === 'de' ? selectedReading.textDe : selectedReading.textEn}“
                </p>
              </div>

              {/* 4. Center Song */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalSong2}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-[#1d1d1f]">
                      {centerSong.title[language]}
                    </span>
                    <span className="text-xs text-[#86868b] font-mono">({centerSong.key})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenBahaiSongs}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {language === 'de' ? 'In App öffnen' : 'Open in App'}
                    </button>
                    <span>•</span>
                    <a
                      href={centerSong.bahaiSongsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#0071e3] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>bahaisongs.com</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 5. Reflection */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalReflection}
                </span>
                <p className="text-xs text-[#6e6e73] font-normal">
                  {language === 'de'
                    ? '3 bis 5 Minuten gemeinsame Stille, sanfte Instrumentalbegleitung oder Raum für spontane Gebete der Jugendlichen.'
                    : '3 to 5 minutes of shared silence, gentle acoustic accompaniment, or space for spontaneous prayers.'}
                </p>
              </div>

              {/* 6. Closing Song */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalClosingSong}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-[#1d1d1f]">
                      {closingSong.title[language]}
                    </span>
                    <span className="text-xs text-[#86868b] font-mono">({closingSong.key})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenBahaiSongs}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      {language === 'de' ? 'In App öffnen' : 'Open in App'}
                    </button>
                    <span>•</span>
                    <a
                      href={closingSong.bahaiSongsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#0071e3] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>bahaisongs.com</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 7. Closing Prayer */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.devotionalClosingPrayer}
                </span>
                <p className="text-xs text-[#1d1d1f] font-serif italic">
                  {language === 'de'
                    ? '„O Herr! Stärke diese zarten Setzlinge, damit jeder zu einem fruchtbaren Baum werde, grün und blühend...“'
                    : '"O Lord! Strengthen these fragile seedlings that each one may become a fruitful tree, verdant and flourishing..."'}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
