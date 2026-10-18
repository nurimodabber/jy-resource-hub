import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Mail,
  Gamepad2,
  HeartHandshake,
  Palette,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  WifiOff,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { Language } from '../types';
import { tr, Panel, Label, primaryBtn, secondaryBtn } from './tools/common';
import { useToast } from '../context/ToastContext';
import { JY_BOOKS } from '../utils/bookProgress';

export interface ProposalViewProps {
  language: Language;
}

type ProposalType = 'spiel' | 'dienst' | 'kunst';

interface FormState {
  type: ProposalType;
  title: string;
  subtitle: string;
  summary: string;
  groupSizeMin: number;
  groupSizeMax: number;
  durationMin: number;
  durationMax: number;
  materials: string[];
  newMaterial: string;
  steps: string[];
  animatorTips: string;
  source: string;
  authorName: string;
  authorEmail: string;
  // JY Book and image fields
  relatedBook: string;
  lesson: string;
  imageUrl: string;
  // Specific fields for service/arts
  objective: string;
  reflectionQuestions: string[];
  newQuestion: string;
  setting: 'drinnen' | 'draussen' | 'beides';
  occasion: 'treffen' | 'camp' | 'beides';
  // Checkboxes
  consentOriginal: boolean;
  consentPrivacy: boolean;
  // Honeypot
  hp_website: string;
}

const STORAGE_DRAFT_KEY = 'jy_submit_draft';

export const ProposalView: React.FC<ProposalViewProps> = ({ language }) => {
  const L = tr(language);
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mailtoFallback, setMailtoFallback] = useState<string | null>(null);
  const [createdIssueUrl, setCreatedIssueUrl] = useState<string | null>(null);

  const [mountTime] = useState(() => Date.now());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [formData, setFormData] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          hp_website: '',
        };
      }
    } catch {
      /* ignore */
    }
    return {
      type: 'spiel',
      title: '',
      subtitle: '',
      summary: '',
      groupSizeMin: 4,
      groupSizeMax: 16,
      durationMin: 15,
      durationMax: 30,
      materials: [],
      newMaterial: '',
      steps: ['', '', ''],
      animatorTips: '',
      source: '',
      authorName: '',
      authorEmail: '',
      relatedBook: '',
      lesson: '',
      imageUrl: '',
      objective: '',
      reflectionQuestions: [],
      newQuestion: '',
      setting: 'beides',
      occasion: 'beides',
      consentOriginal: false,
      consentPrivacy: false,
      hp_website: '',
    };
  });

  // Save draft locally on edit
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
    } catch {
      /* ignore */
    }
  }, [formData]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStepChange = (index: number, val: string) => {
    const nextSteps = [...formData.steps];
    nextSteps[index] = val;
    updateField('steps', nextSteps);
  };

  const handleAddStep = () => {
    updateField('steps', [...formData.steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (formData.steps.length <= 3) return;
    updateField('steps', formData.steps.filter((_, i) => i !== index));
  };

  const handleAddMaterial = () => {
    const trimmed = formData.newMaterial.trim();
    if (!trimmed) return;
    updateField('materials', [...formData.materials, trimmed]);
    updateField('newMaterial', '');
  };

  const handleRemoveMaterial = (index: number) => {
    updateField('materials', formData.materials.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    const trimmed = formData.newQuestion.trim();
    if (!trimmed) return;
    updateField('reflectionQuestions', [...formData.reflectionQuestions, trimmed]);
    updateField('newQuestion', '');
  };

  const handleRemoveQuestion = (index: number) => {
    updateField('reflectionQuestions', formData.reflectionQuestions.filter((_, i) => i !== index));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim() || formData.title.length < 3) {
      return L('Bitte gib einen aussagekräftigen Titel an (mind. 3 Zeichen).', 'Please enter a title (min. 3 characters).');
    }
    if (!formData.summary.trim() || formData.summary.length < 10) {
      return L('Bitte gib eine kurze Zusammenfassung an (mind. 10 Zeichen).', 'Please enter a short summary (min. 10 characters).');
    }
    const validSteps = formData.steps.map((s) => s.trim()).filter(Boolean);
    if (validSteps.length < 3) {
      return L('Bitte beschreibe mindestens 3 Ablaufschritte.', 'Please describe at least 3 steps.');
    }
    if (!formData.consentOriginal) {
      return L('Bitte bestätige, dass du den Inhalt weitergeben darfst.', 'Please confirm that you are allowed to share this content.');
    }
    if (!formData.consentPrivacy) {
      return L('Bitte bestätige die Kenntnisnahme des Datenschutzhinweises.', 'Please confirm that you have read the privacy notice.');
    }
    return null;
  };

  const generateMailtoUrl = () => {
    const subject = encodeURIComponent(`[Vorschlag ${formData.type}] ${formData.title}`);
    const bodyLines = [
      `Titel: ${formData.title}`,
      formData.subtitle ? `Untertitel: ${formData.subtitle}` : '',
      `Art: ${formData.type}`,
      `Dauer: ${formData.durationMin}–${formData.durationMax} Min`,
      `Gruppe: ${formData.groupSizeMin}–${formData.groupSizeMax} Personen`,
      `Zusammenfassung: ${formData.summary}`,
      `Material: ${formData.materials.join(', ') || 'Kein Material'}`,
      `Ablauf:\n${formData.steps.filter(Boolean).map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`,
      formData.animatorTips ? `Tipps: ${formData.animatorTips}` : '',
      formData.source ? `Quelle: ${formData.source}` : '',
      formData.relatedBook ? `Juniorjugend-Buch: ${JY_BOOKS.find((b) => b.id === formData.relatedBook)?.title[language] || formData.relatedBook}${formData.lesson ? ` (Lektion ${formData.lesson})` : ''}` : '',
      formData.imageUrl ? `Bild-URL: ${formData.imageUrl}` : '',
      formData.authorName ? `Name: ${formData.authorName}` : '',
      formData.authorEmail ? `E-Mail: ${formData.authorEmail}` : '',
    ].filter(Boolean);

    const body = encodeURIComponent(bodyLines.join('\n\n'));
    return `mailto:kontakt@junior-youth.de?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setMailtoFallback(generateMailtoUrl());
      setSubmitError(
        L(
          'Du bist offline. Dein Entwurf bleibt im Browser gespeichert – du kannst ihn jetzt als E-Mail absenden oder später übermitteln.',
          'You are offline. Your draft remains saved locally – you can send it via email now or submit later.'
        )
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      type: formData.type,
      title: formData.title,
      subtitle: formData.subtitle,
      summary: formData.summary,
      groupSizeMin: formData.groupSizeMin,
      groupSizeMax: formData.groupSizeMax,
      durationMin: formData.durationMin,
      durationMax: formData.durationMax,
      materials: formData.materials,
      steps: formData.steps.filter(Boolean),
      animatorTips: formData.animatorTips,
      source: formData.source,
      relatedBook: formData.relatedBook || undefined,
      lesson: formData.lesson ? Number(formData.lesson) : undefined,
      imageUrl: formData.imageUrl || undefined,
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      objective: formData.objective,
      reflectionQuestions: formData.reflectionQuestions,
      setting: formData.setting,
      occasion: formData.occasion,
      clientTimestamp: mountTime,
      hp_website: formData.hp_website,
    };

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok && resData.ok) {
        setCreatedIssueUrl(resData.issueUrl || null);
        try {
          localStorage.removeItem(STORAGE_DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setStep(3);
      } else if (resData.fallback === 'mailto' || !response.ok) {
        setMailtoFallback(generateMailtoUrl());
        setSubmitError(resData.error || resData.message || L('Automatische Übertragung nicht möglich. Bitte sende den Vorschlag per E-Mail.', 'Automated transmission failed. Please send your proposal via email.'));
      }
    } catch {
      setMailtoFallback(generateMailtoUrl());
      setSubmitError(L('Verbindungsfehler. Du kannst deinen Vorschlag einfach direkt per E-Mail senden.', 'Connection error. You can send your proposal directly via email.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = () => {
    const text = `Vorschlag: ${formData.title} (${formData.type})\n${formData.summary}\n\nAblauf:\n${formData.steps.filter(Boolean).map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard?.writeText(text);
    showToast({ text: L('Zusammenfassung kopiert', 'Summary copied') });
  };

  return (
    <div className="max-w-6xl w-full mx-auto pb-28 space-y-6">
      {/* Header */}
      <div>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{L('Zurück zu Schritt', 'Back to step')} {step - 1}</span>
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          {L('Erfahrungen beitragen', 'Contribute')}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-lg leading-relaxed">
          {L(
            'Du hast ein Spiel oder Projekt, das fehlt? Teile erprobte Spiele, Dienstprojekte oder künstlerische Aktivitäten mit anderen Animatoren – alle Beiträge werden vor der Veröffentlichung geprüft.',
            "Have a game or project idea that's missing? Share proven games, service projects, or creative activities with other animators – all contributions are reviewed before publishing."
          )}
        </p>
      </div>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-border" aria-label="Fortschritt">
        <div>
          <span className="text-2xs font-extrabold uppercase tracking-wider text-accent block">
            {L(`Schritt ${step} von 3`, `Step ${step} of 3`)}
          </span>
          <span className="text-sm font-bold text-text">
            {step === 1
              ? L('Art wählen', 'Choose type')
              : step === 2
              ? L('Details & Ablauf', 'Details & Steps')
              : L('Bestätigung', 'Confirmation')}
          </span>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-200 ${
                s === step
                  ? 'w-6 bg-accent'
                  : s < step
                  ? 'w-2.5 bg-accent/40'
                  : 'w-2.5 bg-surface-2 border border-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-semibold" aria-label="Fortschritt">
        <span className={`px-3 py-1 rounded-chip ${step === 1 ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary'}`}>
          1. {L('Art wählen', 'Choose type')}
        </span>
        <span className="text-text-tertiary">→</span>
        <span className={`px-3 py-1 rounded-chip ${step === 2 ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary'}`}>
          2. {L('Details & Ablauf', 'Details & Steps')}
        </span>
        <span className="text-text-tertiary">→</span>
        <span className={`px-3 py-1 rounded-chip ${step === 3 ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary'}`}>
          3. {L('Bestätigung', 'Confirmation')}
        </span>
      </div>

      {/* Step 1: Type Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              updateField('type', 'spiel');
              setStep(2);
            }}
            className="flex flex-col items-start p-6 rounded-card bg-surface border border-border hover:border-accent hover:shadow-1 transition-all text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-text group-hover:text-accent-text transition-colors">
              {L('Gruppenspiel', 'Group Game')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              {L('Kooperative Spiele, Kennenlernspiele oder lebhafte Energizer.', 'Cooperative games, icebreakers, or lively energizers.')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              updateField('type', 'dienst');
              setStep(2);
            }}
            className="flex flex-col items-start p-6 rounded-card bg-surface border border-border hover:border-accent hover:shadow-1 transition-all text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-text group-hover:text-accent-text transition-colors">
              {L('Dienstprojekt', 'Service Project')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              {L('Gemeinwohlorientierte Aktionen in Nachbarschaft oder Natur.', 'Community service actions in the neighborhood or nature.')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              updateField('type', 'kunst');
              setStep(2);
            }}
            className="flex flex-col items-start p-6 rounded-card bg-surface border border-border hover:border-accent hover:shadow-1 transition-all text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-text group-hover:text-accent-text transition-colors">
              {L('Kreative Aktivität', 'Creative Activity')}
            </h2>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              {L('Theater, Zeichnen, Musik oder Poesie für die Gruppe.', 'Drama, visual arts, music, or poetry for the group.')}
            </p>
          </button>
        </div>
      )}

      {/* Step 2: Form & Live Preview */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Form / Preview Toggle */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold text-text uppercase tracking-wider">
              {formData.type === 'spiel' ? L('Neues Spiel beitragen', 'Contribute a game') : formData.type === 'dienst' ? L('Neues Dienstprojekt beitragen', 'Contribute a service project') : L('Kreative Aktivität beitragen', 'Contribute a creative activity')}
            </span>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-xs font-semibold bg-surface-2 hover:bg-surface-raised text-text cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-accent-text" />
              <span>{isPreview ? L('Formular bearbeiten', 'Edit form') : L('Vorschau ansehen', 'Live preview')}</span>
            </button>
          </div>

          {isPreview ? (
            /* Live Preview Card */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-control bg-accent-subtle/50 text-accent-text text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{L('So sieht der Beitrag später auf der Plattform aus:', 'This is how your contribution will appear on the platform:')}</span>
              </div>

              <Panel className="p-6 sm:p-8 space-y-6">
                {formData.imageUrl && (
                  <div className="overflow-hidden rounded-card border border-border aspect-16/9 bg-surface-2 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6">
                    <img src={formData.imageUrl} alt="Vorschau" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="px-2.5 py-0.5 rounded-chip text-2xs font-extrabold uppercase tracking-wider bg-accent-subtle text-accent-text">
                      {formData.type === 'spiel' ? 'Spiel' : formData.type === 'dienst' ? 'Dienstprojekt' : 'Kunst & Ausdruck'} · Entwurf
                    </span>
                    {formData.relatedBook && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-chip text-2xs font-medium bg-surface-2 text-text-secondary border border-border">
                        <BookOpen className="w-3 h-3 text-text-tertiary" />
                        <span>{JY_BOOKS.find((b) => b.id === formData.relatedBook)?.title[language]}{formData.lesson ? ` · ${language === 'de' ? 'Lektion' : 'Lesson'} ${formData.lesson}` : ''}</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-text mt-2">
                    {formData.title || L('Unbenannter Eintrag', 'Untitled')}
                  </h2>
                  {formData.subtitle && <p className="text-sm text-text-secondary mt-0.5">{formData.subtitle}</p>}
                  <p className="text-sm text-text mt-3 font-medium leading-relaxed">{formData.summary || L('Keine Beschreibung angegeben.', 'No description provided.')}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-card bg-surface-2 text-xs">
                  <div>
                    <span className="text-text-tertiary block font-semibold">{L('Dauer', 'Duration')}</span>
                    <span className="font-bold text-text">{formData.durationMin}–{formData.durationMax} min</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary block font-semibold">{L('Gruppe', 'Group')}</span>
                    <span className="font-bold text-text">{formData.groupSizeMin}–{formData.groupSizeMax} Personen</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary block font-semibold">{L('Material', 'Materials')}</span>
                    <span className="font-bold text-text">{formData.materials.join(', ') || L('Ohne Material', 'No materials')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-text uppercase tracking-wider">{L('Ablauf', 'Steps')}</h3>
                  <ol className="space-y-2 text-sm text-text-secondary">
                    {formData.steps.filter(Boolean).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="font-bold text-accent-text shrink-0">{idx + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {formData.animatorTips && (
                  <div className="p-4 rounded-card bg-accent-subtle/30 border border-accent/20 text-xs space-y-1">
                    <span className="font-bold text-text block">{L('Tipp für Animatoren', 'Tip for animators')}</span>
                    <p className="text-text-secondary leading-relaxed">{formData.animatorTips}</p>
                  </div>
                )}
              </Panel>
            </div>
          ) : (
            /* Main Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isOnline && (
                <div
                  role="status"
                  className="p-4 rounded-card bg-surface-2 border border-border text-xs text-text flex items-start gap-3"
                >
                  <WifiOff className="w-5 h-5 shrink-0 text-text-tertiary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-text">
                      {L('Du bist gerade offline', 'You are currently offline')}
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                      {L(
                        'Dein Entwurf bleibt sicher lokal in diesem Browser gespeichert. Sobald du wieder online bist, kannst du ihn absenden – oder direkt per E-Mail vorbereiten.',
                        'Your draft is safely saved locally in this browser. You can submit it once back online – or prepare it via email now.'
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Honeypot field (hidden from genuine users) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="hp_website">Website</label>
                <input
                  type="text"
                  id="hp_website"
                  name="hp_website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.hp_website}
                  onChange={(e) => updateField('hp_website', e.target.value)}
                />
              </div>

              {submitError && (
                <div className="p-4 rounded-card bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p>{submitError}</p>
                    {mailtoFallback && (
                      <a
                        href={mailtoFallback}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-danger text-white text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{L('Jetzt per E-Mail absenden', 'Send via email now')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <Panel className="space-y-4">
                <div>
                  <Label htmlFor="prop-title">{L('Titel *', 'Title *')}</Label>
                  <input
                    id="prop-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder={L('z.B. Brückenbauer im Nebel', 'e.g. Bridge Builder in the Fog')}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <Label htmlFor="prop-sub">{L('Untertitel (optional)', 'Subtitle (optional)')}</Label>
                  <input
                    id="prop-sub"
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder={L('z.B. Kooperatives Vertrauensspiel', 'e.g. Cooperative trust game')}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <Label htmlFor="prop-sum">{L('Zusammenfassung in einem Satz *', 'Summary in one sentence *')}</Label>
                  <textarea
                    id="prop-sum"
                    required
                    rows={2}
                    value={formData.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    placeholder={L('Worum geht es in wenigen Worten?', 'What is it about in a few words?')}
                    className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="prop-gmin">{L('Gruppe min', 'Group min')}</Label>
                    <input
                      id="prop-gmin"
                      type="number"
                      min={2}
                      max={50}
                      value={formData.groupSizeMin}
                      onChange={(e) => updateField('groupSizeMin', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-sm text-text text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prop-gmax">{L('Gruppe max', 'Group max')}</Label>
                    <input
                      id="prop-gmax"
                      type="number"
                      min={formData.groupSizeMin}
                      max={100}
                      value={formData.groupSizeMax}
                      onChange={(e) => updateField('groupSizeMax', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-sm text-text text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prop-dmin">{L('Dauer min', 'Duration min')}</Label>
                    <input
                      id="prop-dmin"
                      type="number"
                      min={5}
                      max={180}
                      value={formData.durationMin}
                      onChange={(e) => updateField('durationMin', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-sm text-text text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prop-dmax">{L('Dauer max', 'Duration max')}</Label>
                    <input
                      id="prop-dmax"
                      type="number"
                      min={formData.durationMin}
                      max={360}
                      value={formData.durationMax}
                      onChange={(e) => updateField('durationMax', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-sm text-text text-center font-bold"
                    />
                  </div>
                </div>

                {/* Juniorjugend-Buch & Lektion (optional) */}
                <div className="pt-3 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-text uppercase tracking-wider">
                      {L('Juniorjugend-Buch & Lektion (optional)', 'Junior Youth Book & Lesson (optional)')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Label htmlFor="prop-book">
                        {L('Zugehöriges Juniorjugend-Buch', 'Related Junior Youth Book')}
                      </Label>
                      <select
                        id="prop-book"
                        value={formData.relatedBook}
                        onChange={(e) => {
                          updateField('relatedBook', e.target.value);
                          if (!e.target.value) updateField('lesson', '');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                      >
                        <option value="">{L('— Kein bestimmtes Buch / allgemein —', '— No specific book / general —')}</option>
                        {JY_BOOKS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title[language]} ({b.totalLessons} {L('Lektionen', 'lessons')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="prop-lesson">
                        {L('Lektion (optional)', 'Lesson (optional)')}
                      </Label>
                      <input
                        id="prop-lesson"
                        type="number"
                        min={1}
                        max={30}
                        value={formData.lesson}
                        onChange={(e) => updateField('lesson', e.target.value)}
                        placeholder="z.B. 4"
                        disabled={!formData.relatedBook}
                        className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>

                {/* Bild-Link / Foto verlinken (optional) */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-text uppercase tracking-wider">
                      {L('Bild-Link / Foto verlinken (optional)', 'Image link / Photo (optional)')}
                    </span>
                  </div>
                  <Label htmlFor="prop-image">
                    {L('Web-Adresse zu einem Foto (z.B. Unsplash, Imgur oder Website)', 'Web address to a photo (e.g. Unsplash, Imgur or website)')}
                  </Label>
                  <input
                    id="prop-image"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => updateField('imageUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-2xs text-text-tertiary">
                    {L(
                      'Wenn du ein Foto der Aktion, des Kunstwerks oder des Spiels hast, gib hier den Link an. Es wird auf der Karte und Detailseite dargestellt.',
                      'If you have a photo of the action, artwork, or game, provide the link here. It will be shown on the card and detail view.'
                    )}
                  </p>
                  {formData.imageUrl && (
                    <div className="mt-2 p-2 rounded-control bg-surface border border-border flex items-center gap-3">
                      <img
                        src={formData.imageUrl}
                        alt="Vorschau"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-16 h-16 rounded-md object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <span className="font-semibold text-text block">{L('Bildvorschau', 'Image preview')}</span>
                        <span className="truncate block text-2xs text-text-tertiary mt-0.5">{formData.imageUrl}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>

              {/* Materials */}
              <Panel className="space-y-3">
                <Label>{L('Benötigtes Material', 'Required Materials')}</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newMaterial}
                    onChange={(e) => updateField('newMaterial', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMaterial();
                      }
                    }}
                    placeholder={L('z.B. Kreide, Augenbinden, Seil...', 'e.g. Chalk, blindfolds...')}
                    className="flex-1 px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{L('Hinzufügen', 'Add')}</span>
                  </button>
                </div>
                {formData.materials.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.materials.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-surface-2 text-xs text-text font-medium border border-border">
                        <span>{m}</span>
                        <button type="button" onClick={() => handleRemoveMaterial(i)} className="p-0.5 text-text-tertiary hover:text-text cursor-pointer">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Panel>

              {/* Steps (Minimum 3) */}
              <Panel className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{L('Ablauf (mindestens 3 Schritte) *', 'Steps (at least 3 steps) *')}</Label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-xs font-bold text-accent-text hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{L('Schritt ergänzen', 'Add step')}</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.steps.map((st, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-6 text-center text-xs font-bold text-text-tertiary pt-2.5 shrink-0">
                        {idx + 1}.
                      </span>
                      <textarea
                        rows={2}
                        value={st}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        placeholder={L(`Schritt ${idx + 1} beschreiben...`, `Describe step ${idx + 1}...`)}
                        className="flex-1 px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                      />
                      {formData.steps.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-2 text-text-tertiary hover:text-danger cursor-pointer pt-2"
                          title={L('Schritt löschen', 'Delete step')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Service/Arts specific inputs */}
              {(formData.type === 'dienst' || formData.type === 'kunst') && (
                <Panel className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-accent-text">
                    {L('Zusatzangaben für Projekt & Reflexion', 'Project & reflection details')}
                  </h3>
                  <div>
                    <Label htmlFor="prop-obj">{L('Ziel des Projekts', 'Objective')}</Label>
                    <textarea
                      id="prop-obj"
                      rows={2}
                      value={formData.objective}
                      onChange={(e) => updateField('objective', e.target.value)}
                      placeholder={L('Welche Wirkung soll die Aktion erzielen?', 'What impact should this have?')}
                      className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <Label>{L('Reflexionsfragen für die Gruppe', 'Reflection questions')}</Label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.newQuestion}
                        onChange={(e) => updateField('newQuestion', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddQuestion();
                          }
                        }}
                        placeholder={L('z.B. Was hat euch bei dieser Aktion am meisten überrascht?', 'e.g. What surprised you most?')}
                        className="flex-1 px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{L('Frage addieren', 'Add')}</span>
                      </button>
                    </div>
                    {formData.reflectionQuestions.length > 0 && (
                      <ul className="space-y-1 pt-2 list-disc pl-5 text-xs text-text-secondary">
                        {formData.reflectionQuestions.map((q, idx) => (
                          <li key={idx} className="flex items-center justify-between gap-2">
                            <span>{q}</span>
                            <button type="button" onClick={() => handleRemoveQuestion(idx)} className="text-text-tertiary hover:text-danger p-0.5 cursor-pointer">
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Panel>
              )}

              {/* Animator Tips & Origin */}
              <Panel className="space-y-4">
                <div>
                  <Label htmlFor="prop-tips">{L('Tipps für Animatoren (optional)', 'Tips for animators (optional)')}</Label>
                  <textarea
                    id="prop-tips"
                    rows={2}
                    value={formData.animatorTips}
                    onChange={(e) => updateField('animatorTips', e.target.value)}
                    placeholder={L('Worauf sollte die Spielleitung besonders achten?', 'What should animators pay attention to?')}
                    className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <Label htmlFor="prop-src">{L('Quelle oder Herkunft (optional)', 'Source or origin (optional)')}</Label>
                  <input
                    id="prop-src"
                    type="text"
                    value={formData.source}
                    onChange={(e) => updateField('source', e.target.value)}
                    placeholder={L('z.B. Selbst erfunden, JY-Camp 2024, abgewandelt von...', 'e.g. Self-invented, JY-Camp 2024...')}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label htmlFor="prop-name">{L('Dein Name oder Kürzel (optional)', 'Your name or initials (optional)')}</Label>
                    <input
                      id="prop-name"
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => updateField('authorName', e.target.value)}
                      placeholder={L('Wird auf Wunsch als Autor genannt', 'Shown as author if desired')}
                      className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prop-mail">{L('E-Mail (optional, nur für Rückfragen)', 'Email (optional, questions only)')}</Label>
                    <input
                      id="prop-mail"
                      type="email"
                      value={formData.authorEmail}
                      onChange={(e) => updateField('authorEmail', e.target.value)}
                      placeholder="name@beispiel.de"
                      className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </Panel>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 text-xs text-text cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentOriginal}
                    onChange={(e) => updateField('consentOriginal', e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent mt-0.5 shrink-0"
                  />
                  <span>{L('Ich habe den Inhalt selbst geschrieben oder darf ihn für die Plattform weitergeben.', 'I created this content myself or have permission to share it.')}</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-text cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentPrivacy}
                    onChange={(e) => updateField('consentPrivacy', e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent mt-0.5 shrink-0"
                  />
                  <span>
                    {L(
                      'Ich habe die Datenschutzerklärung zur Kenntnis genommen (Beiträge werden als GitHub Issue verarbeitet; E-Mail/Name sind freiwillig).',
                      'I have read the privacy statement (Contributions are submitted as GitHub issues; name/email are optional).'
                    )}
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${primaryBtn} flex-1`}
                >
                  <span>{isSubmitting ? L('Wird übermittelt...', 'Submitting...') : L('Beitrag absenden', 'Submit contribution')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Panel className="p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-text tracking-tight">
              {L('Danke für deinen Beitrag!', 'Thank you for your contribution!')}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {L(
                'Wir schauen uns deinen Beitrag an und binden ihn nach redaktioneller Prüfung in die passende Kategorie ein.',
                'We will review your contribution and incorporate it into the matching category after editorial review.'
              )}
            </p>
          </div>

          {createdIssueUrl && (
            <p className="text-xs text-text-tertiary">
              {L('Öffentliches GitHub-Issue:', 'Public GitHub Issue:')}{' '}
              <a href={createdIssueUrl} target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline font-semibold">
                {createdIssueUrl}
              </a>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleCopySummary}
              className={`${secondaryBtn}`}
            >
              <Copy className="w-4 h-4" />
              <span>{L('Zusammenfassung kopieren', 'Copy summary')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setFormData((prev) => ({
                  ...prev,
                  title: '',
                  subtitle: '',
                  summary: '',
                  steps: ['', '', ''],
                  materials: [],
                }));
              }}
              className={`${primaryBtn}`}
            >
              <span>{L('Weiteren Beitrag einreichen', 'Contribute another idea')}</span>
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
};
