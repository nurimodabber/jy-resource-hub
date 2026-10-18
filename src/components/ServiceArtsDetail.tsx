import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Printer,
  Share2,
  Copy,
  Check,
  ChevronDown,
  MoreVertical,
  CheckSquare,
  Square,
  Users,
  Clock,
  MapPin,
  Package,
  BookOpen,
  Sparkles,
  Heart,
  Palette,
} from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { shareResource } from '../utils/share';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Badge } from './ui/Badge';
import { getBookById } from '../utils/bookProgress';
import { Sheet } from './ui/Sheet';
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
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

  const isService = activity.kind === 'dienst';
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const [isTipsOpen, setIsTipsOpen] = useState(true);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Normalized fields across service and arts
  const objectiveText = isService
    ? activity.objective[language]
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

  const subtitle = isService
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

  const settingLabel =
    activity.setting === 'drinnen'
      ? t.settingDrinnen
      : activity.setting === 'draussen'
      ? t.settingDraussen
      : t.settingBeides;

  const occasionLabel =
    activity.occasion === 'treffen'
      ? t.occasionTreffen
      : activity.occasion === 'camp'
      ? t.occasionCamp
      : t.occasionBeides;

  const durationStr = activity.duration
    ? activity.duration[language]
    : `${activity.durationMin}–${activity.durationMax} Min`;

  const bookMeta = activity.relatedBook ? getBookById(activity.relatedBook) : null;
  const bookTitle = bookMeta ? bookMeta.title[language] : (activity.kind === 'kunst' && activity.book ? activity.book[language] : null);

  const toggleStepCheck = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleAddToPlan = () => {
    const result = addSlotToPlan({
      type: isService ? 'service' : 'arts_discussion',
      title: { de: activity.title.de, en: activity.title.en },
      durationMinutes: activity.durationMin || 60,
      description: { de: objectiveText, en: objectiveText },
      referenceId: activity.id,
      referenceType: isService ? 'service' : 'art',
    });
    showToast({
      text: L('Zum Treffen hinzugefügt', 'Added to gathering'),
      action: {
        label: L('Treffen öffnen', 'Open gathering'),
        onClick: () => navigate('/treffen'),
      },
      undo: {
        label: L('Rückgängig', 'Undo'),
        onClick: () => result.undo(),
      },
    });
  };

  const handleCopy = async () => {
    const text = `${activity.title[language]}\n\n${objectiveText}\n\n${stepsList
      .map((r, i) => `${i + 1}. ${r}`)
      .join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ text: t.copiedProject });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
    setIsMobileMoreOpen(false);
  };

  const handleShare = () => {
    shareResource({
      title: `${activity.title[language]} – ${t.siteTitle}`,
      text: activity.title[language],
      url: `${window.location.origin}/${isService ? 'service' : 'arts'}/${activity.id}`,
    });
    setIsMobileMoreOpen(false);
  };

  const handlePrint = () => {
    setIsMobileMoreOpen(false);
    window.print();
  };

  return (
    <article className="max-w-5xl mx-auto pb-36 lg:pb-16 px-4 sm:px-6">
      {/* Back to list */}
      <div className="mb-4 print:hidden">
        <Link
          to={isService ? '/service' : '/arts'}
          className="inline-flex items-center gap-1.5 -ml-2 px-3 min-h-[44px] rounded-control text-sm font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isService ? t.backToServiceOverview : t.backToArtsOverview}
        </Link>
      </div>

      {/* Main Grid */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-8">
          {activity.imageUrl && (
            <div className="mb-6 overflow-hidden rounded-card border border-border aspect-16/9 sm:aspect-21/9 bg-surface-2 shadow-xs">
              <img
                src={activity.imageUrl}
                alt={activity.title[language]}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <header className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0">
                {isService ? <Heart className="w-4 h-4 text-accent fill-accent/20" /> : <Palette className="w-4 h-4 text-accent" />}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                {isService ? 'Dienstprojekt' : 'Kreative Kunst'} · {subtitle}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text text-balance">
              {activity.title[language]}
            </h1>

            {/* Meta as Badges */}
            <div className="flex flex-wrap gap-2 mt-4 print:hidden">
              {bookTitle && (
                <Badge size="md" category="neutral">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                  {bookTitle}{activity.lesson ? ` · ${language === 'de' ? 'Lektion' : 'Lesson'} ${activity.lesson}` : ''}
                </Badge>
              )}
              <Badge size="md" category="neutral">
                <Clock className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {durationStr}
              </Badge>
              <Badge size="md" category="neutral">
                <Users className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {activity.groupSize.min}–{activity.groupSize.max} {t.peopleSuffix}
              </Badge>
              <Badge size="md" category="neutral">
                <MapPin className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {settingLabel}
              </Badge>
              <Badge size="md" category="neutral">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {occasionLabel}
              </Badge>
              <Badge size="md" category={hasNoMaterials ? 'accent' : 'neutral'}>
                <Package className="w-3.5 h-3.5 mr-1 text-text-tertiary" />
                {hasNoMaterials ? t.noMaterialNeeded : materials.join(', ')}
              </Badge>
            </div>

            {/* Print Meta */}
            <div className="hidden print:block mt-2 text-sm text-text-secondary">
              {durationStr} · {activity.groupSize.min}–{activity.groupSize.max} {t.peopleSuffix} · {settingLabel} · {occasionLabel}
            </div>
          </header>

          {/* Section 1: Ziel & Wirkung / Idee */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              {t.objectiveTitle}
            </h2>
            <p className="text-base sm:text-lg text-text leading-relaxed">
              {objectiveText}
            </p>
          </section>

          {/* Section 2: Material */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
              {t.materialsTitle}
            </h2>
            {hasNoMaterials ? (
              <p className="text-sm text-text-secondary">{t.noMaterialNeeded}</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm text-text">
                {materials.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Section 3: Schritte mit Checkboxen zum Abhaken */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                {t.stepsChecklistTitle}
              </h2>
              {checkedSteps.size > 0 && (
                <button
                  type="button"
                  onClick={() => setCheckedSteps(new Set())}
                  className="text-xs text-text-secondary hover:text-text underline print:hidden"
                >
                  {L('Häkchen zurücksetzen', 'Reset checks')}
                </button>
              )}
            </div>

            <ol className="space-y-3">
              {stepsList.map((step, idx) => {
                const isChecked = checkedSteps.has(idx);
                return (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-card border transition-all ${
                      isChecked
                        ? 'bg-surface-2/60 border-border opacity-70'
                        : 'bg-surface border-border hover:border-border-strong'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleStepCheck(idx)}
                      className="mt-0.5 min-w-[28px] min-h-[28px] flex items-center justify-center text-text-tertiary hover:text-accent focus-visible:outline-none print:hidden"
                      aria-label={`${L('Schritt', 'Step')} ${idx + 1}`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-accent" />
                      ) : (
                        <Square className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-text-tertiary tabular-nums block mb-0.5">
                        {L('Schritt', 'Step')} {idx + 1}
                      </span>
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isChecked ? 'line-through text-text-secondary' : 'text-text'
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Section 4: Reflexionsfragen als einklappbarer Block */}
          {reflectionList.length > 0 && (
            <section className="mb-8 rounded-card border border-border bg-surface-2 p-5">
              <button
                type="button"
                onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
                className="w-full flex items-center justify-between text-left print:hidden"
                aria-expanded={isQuestionsOpen}
              >
                <h2 className="text-base font-semibold text-text">
                  {t.reflectionTitle}
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
                    isQuestionsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className="hidden print:block font-bold text-sm text-text mb-2">
                {t.reflectionTitle}
              </div>

              {isQuestionsOpen && (
                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-text-secondary leading-relaxed">
                  {reflectionList.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Section 5: Tipps für Animatoren als einklappbarer Block */}
          {tipsList.length > 0 && (
            <section className="mb-8 rounded-card border border-border bg-surface-2 p-5">
              <button
                type="button"
                onClick={() => setIsTipsOpen(!isTipsOpen)}
                className="w-full flex items-center justify-between text-left print:hidden"
                aria-expanded={isTipsOpen}
              >
                <h2 className="text-base font-semibold text-text">
                  {t.animatorTipsTitle}
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
                    isTipsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className="hidden print:block font-bold text-sm text-text mb-2">
                {t.animatorTipsTitle}
              </div>

              {isTipsOpen && (
                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-text-secondary leading-relaxed">
                  {tipsList.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Section 6: Verbindung zu Zitaten (Link auf passende Zitate ohne Textkopie) */}
          {!isService && 'book' in activity && activity.book && (
            <section className="mb-8 p-5 rounded-card border border-border bg-surface print:hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-2">
                {t.quoteConnectionTitle}
              </h2>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-text">{activity.book[language]}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{activity.theme[language]}</p>
                </div>
                <Link
                  to="/quotes"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-accent-subtle text-accent-text text-xs font-semibold hover:bg-accent/20 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {t.viewRelatedQuotes}
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sticky Action Bar on Desktop */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 print:hidden">
          <div className="p-5 rounded-card bg-surface border border-border shadow-1 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-tertiary">
              {L('Aktionen', 'Actions')}
            </h2>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={handleAddToPlan}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.addToMeeting}
            </Button>

            <Button
              variant={isFavorite ? 'secondary' : 'outline'}
              size="md"
              className={`w-full justify-center ${isFavorite ? 'text-accent' : ''}`}
              onClick={(e) => onToggleFavorite(activity.id, e)}
              aria-pressed={isFavorite}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current text-accent' : ''}`} />
              {isFavorite ? t.savedItems : L('Merken', 'Save')}
            </Button>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-text-secondary"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-accent" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? t.copiedSuccess : t.copyRules}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-text-secondary"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t.shareBtn}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-text-secondary"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                {L('Drucken', 'Print')}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Fixed bottom action bar on Mobile (<1024px) above BottomTabBar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-surface backdrop-blur-md border-t border-border p-3 shadow-2 flex items-center gap-2 print:hidden">
        <Button
          variant="primary"
          size="md"
          className="flex-1 justify-center min-h-[44px]"
          onClick={handleAddToPlan}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t.addToMeeting}
        </Button>

        <IconButton
          label={isFavorite ? t.savedItems : L('Merken', 'Save')}
          variant={isFavorite ? 'secondary' : 'outline'}
          size="md"
          className={`shrink-0 min-w-[44px] min-h-[44px] ${isFavorite ? 'text-accent' : ''}`}
          onClick={(e) => onToggleFavorite(activity.id, e)}
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-accent' : ''}`} />
        </IconButton>

        <IconButton
          label={L('Mehr Optionen', 'More options')}
          variant="outline"
          size="md"
          className="shrink-0 min-w-[44px] min-h-[44px]"
          onClick={() => setIsMobileMoreOpen(true)}
        >
          <MoreVertical className="w-4 h-4" />
        </IconButton>
      </div>

      {/* Mobile More Sheet */}
      <Sheet
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        title={activity.title[language]}
      >
        <div className="space-y-2 py-2">
          <Button variant="outline" size="lg" className="w-full justify-start" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-2.5 text-accent" /> : <Copy className="w-4 h-4 mr-2.5" />}
            {copied ? t.copiedSuccess : t.copyRules}
          </Button>

          <Button variant="outline" size="lg" className="w-full justify-start" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2.5" />
            {t.shareBtn}
          </Button>

          <Button variant="outline" size="lg" className="w-full justify-start" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2.5" />
            {L('Drucken', 'Print')}
          </Button>
        </div>
      </Sheet>
    </article>
  );
};
