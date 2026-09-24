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
  const [customSongTitle, setCustomSongTitle] = useState('');
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
          title: language === 'de' ? 'Schere-Stein-Papier Fankurve' : 'RPS Cheering Train',
          duration: duration === 30 ? '10 Min' : '18 Min',
          description: language === 'de'
            ? 'Verlierer werden zum lautstarken Fanclub hinter ihrem Sieger.'
            : 'Duels escalate into growing cheering trains culminating in a championship clash.',
          materials: [language === 'de' ? 'Keine' : 'None'],
          tips: language === 'de'
            ? 'Die Jugendlichen anfeuern, laut den Namen ihres Champions zu rufen.'
            : 'Encourage high volume cheering for the train leaders.'
        },
        {
          stage: t.step3Name,
          title: language === 'de' ? 'Eisschollen-Rettung' : 'Ice Flow Crossing',
          duration: duration === 30 ? '10 Min' : '17 Min',
          description: language === 'de'
            ? 'Die Gruppe überquert einen Raum mit weniger Trittflächen als Personen.'
            : 'Cross a simulated river using fewer stepping tiles than players.',
          materials: [language === 'de' ? 'Blätter oder Teppichfliesen' : 'Paper sheets or foam tiles'],
          tips: language === 'de'
            ? 'Erfordert körperliche gegenseitige Unterstützung.'
            : 'Demands close balance and continuous passing of tiles.'
        }
      ];
    }

    // evening
    return [
      {
        stage: t.step1Name,
        title: language === 'de' ? 'Der Psychiater' : 'The Psychiatrist',
        duration: '12 Min',
        description: language === 'de'
          ? 'Ein Ermittler verlässt den Raum, die Gruppe vereinbart ein geheimes Verhaltensmuster.'
          : 'An investigator leaves while the group agrees on a subtle behavioral pattern.',
        materials: [language === 'de' ? 'Keine' : 'None'],
        tips: language === 'de'
          ? 'Der Klassiker „Jeder antwortet für den linken Nachbarn“ funktioniert am besten.'
          : 'Answering for the person on the left is the most reliable rule.'
      },
      {
        stage: t.step2Name,
        title: language === 'de' ? 'Empire (Königreich)' : 'Empire',
        duration: duration === 30 ? '18 Min' : '33 Min',
        description: language === 'de'
          ? 'Jeder schreibt eine geheime Antwort auf. Wer Identitäten errät, gliedert Mitspieler ein.'
          : 'Each player submits a secret identity. Guessing players absorbs them into expanding kingdoms.',
        materials: [language === 'de' ? 'Zettel & Stifte oder digitales Empire-Board' : 'Paper slips or in-app Empire Board'],
        tips: language === 'de'
          ? 'Verwendet die vorgefertigten Themenkarten aus dem Toolkit!'
          : 'Use the pre-made topic categories from the Toolkits section.'
      },
      {
        stage: t.step3Name,
        title: language === 'de' ? 'Gemeinsam Zählen (The Mind)' : 'Silent Counting (The Mind)',
        duration: '5 Min',
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

    const text = `✨ ${t.devotionalProgramTitle} (${devotionalTheme.toUpperCase()})\n\n1. ${t.devotionalOpeningPrayer}\n"${openingText}"\n\n2. ${t.devotionalSong1}\n🎵 ${openingSong.title[language]} (${openingSong.key || 'C'})\nLink & Akkorde: ${openingSong.bahaiSongsUrl}\n\n3. ${t.devotionalReading}\n"${readingText}"\n— ${selectedReading.source[language]} (${selectedReading.book[language]})\n\n4. ${t.devotionalSong2}\n🎵 ${centerSong.title[language]} (${centerSong.key || 'G'})\nLink & Akkorde: ${centerSong.bahaiSongsUrl}\n\n5. ${t.devotionalReflection}\n(3–5 Min Stille / Gitarrenmelodie)\n\n6. ${t.devotionalClosingSong}\n🎵 ${closingSong.title[language]} (${closingSong.key || 'D'})\nLink & Akkorde: ${closingSong.bahaiSongsUrl}\n\n7. ${t.devotionalClosingPrayer}\n\nLieder & Akkorde via bahaisongs.com`;

    navigator.clipboard.writeText(text);
    setCopiedDevotional(true);
    setTimeout(() => setCopiedDevotional(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {t.plannerHeaderTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
          {t.plannerHeaderDesc}
        </p>

        {/* Tab switch between Session & Devotional */}
        <div className="flex border-b border-stone-200 gap-2 sm:gap-6 mt-5 overflow-x-auto">
          <button
            onClick={() => setActiveMode('session')}
            className={`flex items-center gap-1.5 py-2.5 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeMode === 'session'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.plannerTabSession}</span>
          </button>

          <button
            onClick={() => setActiveMode('devotional')}
            className={`flex items-center gap-1.5 py-2.5 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeMode === 'devotional'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Music className="w-4 h-4 text-emerald-800" />
            <span>{t.plannerTabDevotional}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: YOUTH SESSION PLANNER */}
      {activeMode === 'session' && (
        <div className="space-y-6">
          {/* Control Panel */}
          <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs space-y-5">
            {/* Duration */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                {t.timeAvailableLabel}:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins as 30 | 45 | 60)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      duration === mins
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mins} Min</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Focus */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                {t.focusLabel}:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setFocus('quotes')}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    focus === 'quotes'
                      ? 'bg-stone-100/90 border-stone-900 text-stone-900 ring-1 ring-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-bold text-xs block mb-0.5">{t.focusQuotes}</span>
                  <p className="text-[11px] text-stone-500">Evolution ➔ Tafel ➔ Wort-Mind</p>
                </button>

                <button
                  onClick={() => setFocus('teambuilding')}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    focus === 'teambuilding'
                      ? 'bg-stone-100/90 border-stone-900 text-stone-900 ring-1 ring-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-bold text-xs block mb-0.5">{t.focusTeambuilding}</span>
                  <p className="text-[11px] text-stone-500">Stand Up ➔ Helium Stick ➔ The Mind</p>
                </button>

                <button
                  onClick={() => setFocus('energy')}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    focus === 'energy'
                      ? 'bg-stone-100/90 border-stone-900 text-stone-900 ring-1 ring-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-bold text-xs block mb-0.5">{t.focusEnergy}</span>
                  <p className="text-[11px] text-stone-500">Ninja ➔ Fankurve ➔ Eisschollen</p>
                </button>

                <button
                  onClick={() => setFocus('evening')}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    focus === 'evening'
                      ? 'bg-stone-100/90 border-stone-900 text-stone-900 ring-1 ring-stone-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-bold text-xs block mb-0.5">{t.focusEvening}</span>
                  <p className="text-[11px] text-stone-500">Psychiater ➔ Empire ➔ Ausklang</p>
                </button>
              </div>
            </div>
          </div>

          {/* Output Timeline */}
          <div className="bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {t.generatedAgendaTitle}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {focus === 'quotes' && t.focusQuotes}
                  {focus === 'teambuilding' && t.focusTeambuilding}
                  {focus === 'energy' && t.focusEnergy}
                  {focus === 'evening' && t.focusEvening}
                  {' '}({duration} Min)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white transition-colors"
                  title={t.printHandout}
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopySessionAgenda}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                >
                  {copiedSession ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSession ? t.copiedSuccess : t.copyAgenda}</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {sessionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-stone-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>

                  <div className="flex-1 bg-stone-50 border border-stone-200/70 rounded-xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                        {step.stage}
                      </span>
                      <span className="text-xs font-medium text-stone-500">
                        {step.duration}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900">{step.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{step.description}</p>

                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-stone-500">
                        <strong>{t.materialsTitle}:</strong> {step.materials.join(', ')}
                      </span>
                      <span className="text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200/60 text-[11px]">
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

      {/* MODE 2: DEVOTIONAL PLANNER WITH BAHÁ'Í SONGS LINKING */}
      {activeMode === 'devotional' && (
        <div className="space-y-6">
          {/* Controls: Theme & Bahá'í Songs Launcher */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-800" />
                  <span>{t.plannerTabDevotional}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'de'
                    ? 'Verknüpfe Lieder direkt mit bahaisongs.com für Akkorde, Texte und Aufnahmen.'
                    : 'Directly link songs from bahaisongs.com for chords, lyrics, and audio recordings.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenBahaiSongs}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{t.openBahaiSongs}</span>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                {t.devotionalThemeLabel}:
              </label>
              <div className="flex flex-wrap gap-2">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      devotionalTheme === th.id
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {language === 'de' ? th.labelDe : th.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Pickers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
              {/* Song 1 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.devotionalSong1}:
                </label>
                <select
                  value={openingSong.id}
                  onChange={(e) => {
                    const found = DEVOTIONAL_SONGS_DATA.find(s => s.id === e.target.value);
                    if (found) setOpeningSong(found);
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  {DEVOTIONAL_SONGS_DATA.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.title[language]} ({song.key})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Tonart: {openingSong.key}</span>
                  <a
                    href={openingSong.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>bahaisongs.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Song 2 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.devotionalSong2}:
                </label>
                <select
                  value={centerSong.id}
                  onChange={(e) => {
                    const found = DEVOTIONAL_SONGS_DATA.find(s => s.id === e.target.value);
                    if (found) setCenterSong(found);
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  {DEVOTIONAL_SONGS_DATA.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.title[language]} ({song.key})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Tonart: {centerSong.key}</span>
                  <a
                    href={centerSong.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>bahaisongs.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Song 3 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.devotionalClosingSong}:
                </label>
                <select
                  value={closingSong.id}
                  onChange={(e) => {
                    const found = DEVOTIONAL_SONGS_DATA.find(s => s.id === e.target.value);
                    if (found) setClosingSong(found);
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                >
                  {DEVOTIONAL_SONGS_DATA.map(song => (
                    <option key={song.id} value={song.id}>
                      {song.title[language]} ({song.key})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Tonart: {closingSong.key}</span>
                  <a
                    href={closingSong.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>bahaisongs.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Reading Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                {t.devotionalReading}:
              </label>
              <div className="flex flex-wrap gap-2">
                {QUOTES_DATA.map(q => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedReading(q)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedReading.id === q.id
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {q.theme[language]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Devotional Program Output Card */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {t.devotionalProgramTitle}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {language === 'de' ? 'Andachtsprogramm' : 'Devotional Program'} — {selectedReading.theme[language]}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white transition-colors"
                  title={t.printHandout}
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopyDevotionalAgenda}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                >
                  {copiedDevotional ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDevotional ? t.copiedSuccess : t.copyDevotionalPlan}</span>
                </button>
              </div>
            </div>

            {/* Devotional Agenda Items */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* 1. Opening Prayer */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    {t.devotionalOpeningPrayer}
                  </span>
                  <span className="text-xs text-stone-400 font-serif italic">‘Abdu’l-Bahá</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-stone-800 leading-relaxed">
                  {language === 'de'
                    ? '„O Du gütiger Herr! Schenke jedem dieser Flügglinge gnädig ein Paar himmlische Schwingen und gib ihnen geistige Kraft...“'
                    : '"O Thou kind Lord! Graciously bestow a pair of heavenly wings unto each of these fledglings and give them spiritual power..."'}
                </p>
              </div>

              {/* 2. Opening Song */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.devotionalSong1}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-800" />
                    <span className="text-sm font-bold text-stone-900">
                      {openingSong.title[language]}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">({openingSong.key})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenBahaiSongs}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      {language === 'de' ? 'In App öffnen' : 'Open in App'}
                    </button>
                    <span>•</span>
                    <a
                      href={openingSong.bahaiSongsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-stone-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>bahaisongs.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 3. Reading / Quote */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    {t.devotionalReading}
                  </span>
                  <span className="text-xs text-stone-500">
                    {selectedReading.source[language]} ({selectedReading.book[language]})
                  </span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-stone-900 leading-relaxed bg-white p-3.5 rounded-lg border border-stone-200/60">
                  „{language === 'de' ? selectedReading.textDe : selectedReading.textEn}“
                </p>
              </div>

              {/* 4. Center Song */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.devotionalSong2}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-800" />
                    <span className="text-sm font-bold text-stone-900">
                      {centerSong.title[language]}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">({centerSong.key})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenBahaiSongs}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      {language === 'de' ? 'In App öffnen' : 'Open in App'}
                    </button>
                    <span>•</span>
                    <a
                      href={centerSong.bahaiSongsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-stone-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>bahaisongs.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 5. Reflection */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.devotionalReflection}
                </span>
                <p className="text-xs text-stone-600">
                  {language === 'de'
                    ? '3 bis 5 Minuten gemeinsame Stille, sanfte Instrumentalbegleitung oder Raum für spontane Gebete der Jugendlichen.'
                    : '3 to 5 minutes of shared silence, gentle acoustic accompaniment, or space for spontaneous prayers.'}
                </p>
              </div>

              {/* 6. Closing Song */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.devotionalClosingSong}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-800" />
                    <span className="text-sm font-bold text-stone-900">
                      {closingSong.title[language]}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">({closingSong.key})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenBahaiSongs}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      {language === 'de' ? 'In App öffnen' : 'Open in App'}
                    </button>
                    <span>•</span>
                    <a
                      href={closingSong.bahaiSongsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-stone-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>bahaisongs.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 7. Closing Prayer */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.devotionalClosingPrayer}
                </span>
                <p className="text-xs text-stone-600 font-serif italic">
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
