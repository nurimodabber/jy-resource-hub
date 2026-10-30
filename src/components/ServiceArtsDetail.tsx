import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { IconButton } from './ui/IconButton';
import { getBookById } from '../utils/bookProgress';
import { ShareMenu } from './ui/ShareMenu';
import { tr } from './tools/common';

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
      <div className="flex items-center justify-between gap-3 mb-6 print:hidden">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text px-2.5 py-1.5 rounded-control hover:bg-surface-2 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{backLabel}</span>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            label={isFavorite ? t.savedItems : L('Merken', 'Bookmark')}
            variant={isFavorite ? 'secondary' : 'outline'}
            size="md"
            className={`min-w-[44px] min-h-[44px] ${isFavorite ? 'text-accent bg-accent-subtle/80 border-accent/30' : 'text-text-secondary'}`}
            onClick={(e) => onToggleFavorite(activity.id, e)}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
          </IconButton>

          <ShareMenu
            textToCopy={shareText}
            urlToCopy={currentUrl}
            language={language}
            align="right"
          />
        </div>
      </div>

      {/* 2. Main Card */}
      <div className="bg-surface rounded-card border border-border/80 overflow-hidden shadow-xs">
        {/* Optional hero image */}
        {activity.imageUrl && (
          <div className="aspect-16/9 w-full bg-surface-2 border-b border-border/80 overflow-hidden">
            <img
              src={activity.imageUrl}
              alt={activity.title[language]}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 md:p-10">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-xs text-text-tertiary font-medium flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-chip text-2xs font-semibold bg-accent/8 text-accent border border-accent/20">
                {categoryLabel}
              </span>
              {activity.duration && (
                <>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="text-xs text-text-secondary">{activity.duration[language]}</span>
                </>
              )}
              {activity.groupSize && (
                <>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="text-xs text-text-secondary">
                    {language === 'de'
                      ? `${activity.groupSize.min}–${activity.groupSize.max} Personen`
                      : `${activity.groupSize.min}–${activity.groupSize.max} youth`}
                  </span>
                </>
              )}
              {activity.setting && activity.setting !== 'beides' && (
                <>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="text-xs text-text-secondary">
                    {activity.setting === 'draussen'
                      ? language === 'de'
                        ? 'Draußen'
                        : 'Outdoors'
                      : language === 'de'
                      ? 'Drinnen'
                      : 'Indoors'}
                  </span>
                </>
              )}
              {bookTitle && (
                <>
                  <span className="text-border" aria-hidden="true">·</span>
                  <span className="text-xs text-text-secondary font-medium">
                    {bookTitle}{activity.lesson ? ` · L. ${activity.lesson}` : ''}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text text-balance leading-[1.14]">
              {activity.title[language]}
            </h1>

            {themeLabel && themeLabel !== categoryLabel && (
              <p className="text-xs text-text-secondary mt-2.5 font-medium">
                {language === 'de' ? 'Thema' : 'Theme'}: {themeLabel}
              </p>
            )}
          </header>

          {/* Section 1: Was uns geleitet hat (Leitgedanke & Motivation) */}
          <section className="mb-10 pl-5 border-l-2 border-accent/70 py-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              {L('Was uns geleitet hat', 'What guided our initiative')}
            </h2>
            <p className="font-serif text-lg sm:text-xl text-text leading-relaxed italic">
              „{objectiveText}“
            </p>
          </section>

          {/* Section 2: Wie die Idee lebendig wurde (Erfahrungsbericht & Orientierung) */}
          <section className="mb-8">
            <div className="mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
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
                  className="flex items-start gap-4 p-4 sm:p-5 rounded-card border border-border/80 bg-surface hover:bg-surface-2/40 transition-colors shadow-2xs"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
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
            <section className="mb-8 rounded-card border border-border bg-surface-2 p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
                className="w-full flex items-center justify-between text-left print:hidden cursor-pointer"
                aria-expanded={isQuestionsOpen}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text">
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
            <section className="rounded-card border border-border bg-surface-2 p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setIsTipsOpen(!isTipsOpen)}
                className="w-full flex items-center justify-between text-left print:hidden cursor-pointer"
                aria-expanded={isTipsOpen}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-text">
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
