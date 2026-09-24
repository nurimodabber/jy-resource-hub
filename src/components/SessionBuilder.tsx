import React, { useState } from 'react';
import { Clock, BookOpen, Compass, Copy, Check, Printer, Shield, Flame } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface SessionBuilderProps {
  language: Language;
}

interface PlanStep {
  stage: string;
  title: string;
  duration: string;
  description: string;
  materials: string[];
  tips: string;
}

export const SessionBuilder: React.FC<SessionBuilderProps> = ({ language }) => {
  const [duration, setDuration] = useState<30 | 45 | 60>(45);
  const [focus, setFocus] = useState<'quotes' | 'teambuilding' | 'energy' | 'evening'>('quotes');
  const [copied, setCopied] = useState(false);

  const t = UI_TRANSLATIONS[language];

  const plan: PlanStep[] = React.useMemo(() => {
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

  const handleCopyAgenda = () => {
    const text = `AGENDA (${duration} MIN)\nFocus: ${
      focus === 'quotes' ? t.focusQuotes :
      focus === 'teambuilding' ? t.focusTeambuilding :
      focus === 'energy' ? t.focusEnergy : t.focusEvening
    }\n\n${plan.map(p => `[${p.duration}] ${p.stage}: ${p.title}\n• ${p.description}\n• Material: ${p.materials.join(', ')}\n• Tip: ${p.tips}`).join('\n\n')}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {t.plannerHeaderTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
          {t.plannerHeaderDesc}
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs space-y-5">
        {/* Row 1: Duration */}
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

        {/* Row 2: Focus */}
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
        {/* Output Header */}
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
              onClick={handleCopyAgenda}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedSuccess : t.copyAgenda}</span>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="p-5 sm:p-6 space-y-4">
          {plan.map((step, idx) => (
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
  );
};
