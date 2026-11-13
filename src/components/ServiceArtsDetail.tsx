import React, { useState } from 'react';
import { GlassIconButton } from './ui/Button';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  ChevronDown,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { getBookById } from '../utils/bookProgress';
import { ShareMenu } from './ui/ShareMenu';
import { IconTile } from './ui/IconTile';
import { activityTone } from '../data/activityTones';
import { tr } from './tools/common';

// Gleiche Felder wie die Eckdaten auf der Spielseite (GamePage). Ohne shrink-0: nur das Buch-Feld
// (min-w-0) darf schrumpfen und kürzen, die anderen hält ihr Inhalt auf voller Breite.
const FACT = 'inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-surface-2 border border-border font-medium whitespace-nowrap shadow-2xs';

interface ServiceArtsDetailProps {
  activity: ActivityItem;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ServiceArtsDetail: React.FC<ServiceArtsDetailProps> = ({
  activity,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);

  const isService = activity.kind === 'dienst';
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const [isTipsOpen, setIsTipsOpen] = useState(true);

  // Normalized fields across service and arts
  const objectiveText = isService
    ? (activity.guidedBy ? activity.guidedBy[language] : activity.objective[language])
    : activity.description[language];

  const stepsList = isService
    ? activity.steps[language]
    : activity.guidingSteps[language];

  const reflectionList = isService
    ? activity.reflectionQuestions[language]
    : activity.reflectionPrompts[language];

  const tipsList = activity.animatorTips ? activity.animatorTips[language] : [];

  const materials = activity.materials[language].filter((m) => !/^(keine|none)/i.test(m));
  const hasNoMaterials = materials.length === 0;

  const categoryLabel = isService
    ? activity.category === 'environmental'
      ? t.catEnvironmental
      : activity.category === 'neighborhood'
      ? t.catNeighborhood
      : activity.category === 'intergenerational'
      ? t.catIntergenerational
      : activity.category === 'children'
      ? t.catChildren
      : activity.category === 'institutional'
      ? t.catInstitutional
      : t.catCreative
    : activity.artForm === 'drama'
    ? t.artFormDrama
    : activity.artForm === 'music_poetry'
    ? t.artFormMusicPoetry
    : activity.artForm === 'visual_arts'
    ? t.artFormVisual
    : t.artFormMural;

  const { tone, icon: toneIcon } = activityTone(activity);

  const themeLabel = activity.theme
    ? activity.theme[language]
    : undefined;

  // Associated book & lesson if present
  const bookMeta = activity.relatedBook ? getBookById(activity.relatedBook) : null;
  const bookTitle = bookMeta
    ? bookMeta.title[language]
    : activity.kind === 'kunst' && activity.book
    ? activity.book[language]
    : null;

  const backUrl = isService ? '/service' : '/arts';
  const backLabel = isService ? t.subtabServiceProjects : t.subtabArtsPrompts;
  const shareText = `„${activity.title[language]}“ — ${categoryLabel}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <article className="max-w-4xl mx-auto pb-20">
      {/* 1. Header Toolbar */}
      <div className="hidden md:flex items-center justify-between gap-3 mb-6 print:hidden">
        {/* Mobil übernimmt der Glas-Zurück-Knopf in der Kopfzeile */}
        <Link
          to={backUrl}
          className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text px-2.5 py-1.5 rounded-control hover:bg-surface-2 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{backLabel}</span>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <GlassIconButton
            label={isFavorite ? t.savedItems : L('Merken', 'Bookmark')}
            aria-pressed={isFavorite}
            icon={<Bookmark className={`w-[18px] h-[18px] ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.9} />}
            onClick={(e) => onToggleFavorite(activity.id, e)}
          />

          <ShareMenu
            textToCopy={shareText}
            urlToCopy={currentUrl}
            language={language}
            align="right"
            glass
          />
        </div>
      </div>

      {/* 2. Main Card */}
      <div className="bg-surface rounded-card border border-border/80 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-8 md:p-10">
          <header className={`mb-8 tone-${tone}`}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <IconTile icon={toneIcon} size="xl" />
                <span className="text-sm font-semibold tone-text truncate">{categoryLabel}</span>
              </div>
              {/* Mobil: Merken/Teilen neben dem Icon statt in einer eigenen leeren Zeile */}
              <div className="flex md:hidden items-center gap-1.5 shrink-0 print:hidden">
                <GlassIconButton
                  label={isFavorite ? t.savedItems : L('Merken', 'Bookmark')}
                  aria-pressed={isFavorite}
                  icon={<Bookmark className={`w-[18px] h-[18px] ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.9} />}
                  onClick={(e) => onToggleFavorite(activity.id, e)}
                />
                <ShareMenu textToCopy={shareText} urlToCopy={currentUrl} language={language} align="right" glass />
              </div>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text text-balance leading-[1.14]">
              {activity.title[language]}
            </h1>

            {/* Eckdaten wie auf der Spielseite: unter dem Titel, je ein Feld mit Icon (kein hängender Trennpunkt beim Umbruch) */}
            <div role="group" aria-label={L('Eckdaten', 'Key facts')} className="flex items-center gap-1 sm:gap-1.5 flex-wrap mt-3 text-xs text-text-secondary">
              {activity.duration && (
                <span className={FACT}>
                  <Clock className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                  <span>{activity.duration[language]}</span>
                </span>
              )}
              {activity.groupSize && (
                <span className={FACT}>
                  <Users className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                  <span>
                    {language === 'de'
                      ? `${activity.groupSize.min}–${activity.groupSize.max} Personen`
                      : `${activity.groupSize.min}–${activity.groupSize.max} youth`}
                  </span>
                </span>
              )}
              {activity.setting && activity.setting !== 'beides' && (
                <span className={FACT}>
                  <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                  <span>
                    {activity.setting === 'draussen'
                      ? language === 'de'
                        ? 'Draußen'
                        : 'Outdoors'
                      : language === 'de'
                      ? 'Drinnen'
                      : 'Indoors'}
                  </span>
                </span>
              )}
              {bookTitle && (
                <span className={`${FACT} min-w-0`}>
                  <BookOpen className="w-3.5 h-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {bookTitle}{activity.lesson ? ` · L. ${activity.lesson}` : ''}
                  </span>
                </span>
              )}
            </div>

            {themeLabel && themeLabel !== categoryLabel && (
              <p className="text-xs text-text-secondary mt-2.5 font-medium">
                {language === 'de' ? 'Thema' : 'Theme'}: {themeLabel}
              </p>
            )}
          </header>

          {/* Section 1: Was uns geleitet hat (Leitgedanke & Motivation) */}
          <section className="mb-10 py-1">
            <h2 className="text-xs font-bold text-text-tertiary mb-2">
              {L('Was uns geleitet hat', 'What guided our initiative')}
            </h2>
            {/* Normale Schrift ohne Anführungszeichen: Serif kursiv mit „…“ ist heiligen Texten vorbehalten. */}
            <p className="text-base sm:text-lg text-text leading-relaxed">
              {objectiveText}
            </p>
          </section>

          {/* Section 2: Wie die Idee lebendig wurde (Erfahrungsbericht & Orientierung) */}
          <section className="mb-8">
            <div className="mb-3">
              <h2 className="text-xs font-bold text-text-tertiary">
                {L('Wie die Idee lebendig wurde (Erfahrungsbericht)', 'How the idea took shape (Case study)')}
              </h2>
              <p className="text-xs text-text-secondary italic mt-1">
                {L(
                  'Dies ist ein erprobtes Praxisbeispiel einer Gruppe. Passt die Schwerpunkte und Schritte frei an die Gegebenheiten eurer Nachbarschaft und die Ideen der Jugendlichen an.',
                  'This is a field-tested case study from one group. Feel free to adapt the emphasis and flow to your own neighborhood and the youth’s ideas.'
                )}
              </p>
            </div>

            <ol className="space-y-3.5">
              {stepsList.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4"
                >
                  <span className="font-serif text-lg font-bold text-accent shrink-0 w-6 text-center tabular-nums leading-none mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-text leading-relaxed">
                      {step}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Section 3: Material & Vorbereitung (nur wenn nötig) */}
          {!hasNoMaterials && (
            <section className="mb-8">
              <h2 className="text-xs font-bold text-text-tertiary mb-2">
                {t.materialsTitle}
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-text leading-relaxed">
                {materials.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Section 4: Reflexionsfragen im Kreis */}
          {reflectionList.length > 0 && (
            <section className="mb-8 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
                className="w-full min-h-[44px] flex items-center justify-between text-left print:hidden cursor-pointer"
                aria-expanded={isQuestionsOpen}
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-text">
                    {L('Reflexionsfragen im Kreis', 'Reflection questions for the circle')}
                  </h2>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                    isQuestionsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className={`${isQuestionsOpen ? 'block mt-4' : 'hidden'} print:block space-y-2.5`}>
                <p className="text-xs text-text-secondary italic mb-2">
                  {L(
                    'Gemeinsam nach der Aktion besprechen, was die Jugendlichen erlebt und innerlich mitgenommen haben.',
                    'Consult together after the initiative to reflect on what the youth experienced and learned.'
                  )}
                </p>
                <ul className="space-y-2">
                  {reflectionList.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-text leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Section 5: Tipps für Animatoren */}
          {tipsList.length > 0 && (
            <section className="border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setIsTipsOpen(!isTipsOpen)}
                className="w-full min-h-[44px] flex items-center justify-between text-left print:hidden cursor-pointer"
                aria-expanded={isTipsOpen}
              >
                <h2 className="text-xs font-bold text-text">
                  {t.animatorTipsTitle}
                </h2>
                <ChevronDown
                  className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                    isTipsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className={`${isTipsOpen ? 'block mt-4' : 'hidden'} print:block space-y-2`}>
                <ul className="space-y-2">
                  {tipsList.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-text-secondary leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary mt-2.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
};
