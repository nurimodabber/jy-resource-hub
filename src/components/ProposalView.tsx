import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Mail,
  Compass,
  HeartHandshake,
  Palette,
  Eye,
  Pencil,
  Plus,
  Trash2,
  AlertCircle,
  WifiOff,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { FadedIconTile } from './ui/FadedIconTile';
import { Language } from '../types';
import { tr, Panel, Label, primaryBtn, secondaryBtn } from './tools/common';
import { useToast } from '../context/ToastContext';
import { JY_BOOKS } from '../utils/bookProgress';
import { saveProposal } from '../utils/adminRevisions';
import { FeedbackModal } from './FeedbackModal';
import { MyContributions } from './MyContributions';
import {
  MySubmission,
  MY_SUBMISSIONS_EVENT,
  addMySubmission,
  getMySubmissions,
  markRevised,
  refreshStatuses,
} from '../utils/mySubmissions';

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
  // JY Book fields
  relatedBook: string;
  lesson: string;
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

const EMPTY_FORM: FormState = {
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
  objective: '',
  reflectionQuestions: [],
  newQuestion: '',
  setting: 'beides',
  occasion: 'beides',
  consentOriginal: false,
  consentPrivacy: false,
  hp_website: '',
};

/**
 * What "Meine Beiträge" keeps to reopen an entry for a revision: no e-mail (it lives only encrypted
 * in the issue), no honeypot, no half-typed inputs and no consent ticks (asked again on every send).
 */
const toStoredForm = (f: FormState): Record<string, unknown> => {
  const {
    authorEmail: _mail,
    hp_website: _hp,
    newMaterial: _m,
    newQuestion: _q,
    consentOriginal: _c1,
    consentPrivacy: _c2,
    ...rest
  } = f;
  return rest;
};

/** Reopens a stored form. Only values of the expected shape are taken, so an old or damaged entry cannot break the form. */
const fromStoredForm = (stored: Record<string, unknown>): FormState => {
  const next: Record<string, unknown> = { ...EMPTY_FORM };
  for (const key of Object.keys(EMPTY_FORM) as (keyof FormState)[]) {
    const value = stored[key];
    const fallback = EMPTY_FORM[key];
    const fits = Array.isArray(fallback)
      ? Array.isArray(value) && value.every((v) => typeof v === 'string')
      : typeof value === typeof fallback;
    if (fits) next[key] = value;
  }
  const form = next as unknown as FormState;
  return {
    ...form,
    steps: [...form.steps, '', '', ''].slice(0, Math.max(3, form.steps.length)),
    authorEmail: '',
    hp_website: '',
    newMaterial: '',
    newQuestion: '',
    consentOriginal: false,
    consentPrivacy: false,
  };
};

/** Same pattern as api/submit.ts: real links and domains, not sentences like "weiter.Der". */
const CONTAINS_LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|org|net|de|io)\b)/i;

export const ProposalView: React.FC<ProposalViewProps> = (props) => {
  const [searchParams] = useSearchParams();
  // /vorschlagen and /vorschlagen?bearbeiten=<n> are the same route. The key starts a fresh form
  // when switching between a new entry and a revision, instead of carrying the old state over.
  const editParam = searchParams.get('bearbeiten');
  return <ProposalForm key={editParam === null ? 'new' : `edit-${editParam}`} {...props} />;
};

const ProposalForm: React.FC<ProposalViewProps> = ({ language }) => {
  const L = tr(language);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  // Revision mode: the editors asked for changes ("Änderung nötig"). The edit code is an httpOnly
  // cookie the server checks.
  const isEdit = searchParams.has('bearbeiten');
  const editNumber = /^\d+$/.test(searchParams.get('bearbeiten') || '') ? Number(searchParams.get('bearbeiten')) : null;
  const [mine, setMine] = useState<MySubmission[]>(getMySubmissions);
  const [statusChecked, setStatusChecked] = useState(!isEdit);
  const [revisionSent, setRevisionSent] = useState(false);
  const editEntry = editNumber !== null ? mine.find((s) => s.issueNumber === editNumber) : undefined;
  const editProblem: 'device' | 'status' | null =
    !isEdit || revisionSent
      ? null
      : !editEntry
      ? 'device'
      : editEntry.status !== 'changes_requested' || editEntry.type === 'feedback'
      ? 'status'
      : null;

  useEffect(() => {
    if (!isEdit) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const update = () => setMine(getMySubmissions());
    window.addEventListener(MY_SUBMISSIONS_EVENT, update);
    window.addEventListener('storage', update);
    // The stored status can be old (e.g. opened from the e-mail link): ask the server first.
    refreshStatuses(true).then(() => {
      update();
      setStatusChecked(true);
    });
    return () => {
      window.removeEventListener(MY_SUBMISSIONS_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [isEdit]);

  const [step, setStep] = useState<1 | 2 | 3>(isEdit ? 2 : 1);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Der Fehler steht direkt über „Beitrag absenden“; scrollen nur, falls der Knopf gerade am Rand klebt.
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (submitError) errorRef.current?.scrollIntoView({ block: 'nearest' });
  }, [submitError]);
  const [mailtoFallback, setMailtoFallback] = useState<string | null>(null);
  const [createdIssueUrl, setCreatedIssueUrl] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(() => searchParams.get('feedback') === 'true');

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
    if (isEdit) {
      const entry = editNumber !== null ? getMySubmissions().find((s) => s.issueNumber === editNumber) : undefined;
      return entry ? fromStoredForm(entry.form) : EMPTY_FORM;
    }
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
    return EMPTY_FORM;
  });

  // Save draft locally on edit. Not for a revision: it would overwrite the draft of a new entry.
  useEffect(() => {
    if (isEdit) return;
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
    } catch {
      /* ignore */
    }
  }, [formData, isEdit]);

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
    // Same limits as api/submit.ts, so a submission is never rejected after the user thinks it was sent.
    const title = formData.title.trim();
    const summary = formData.summary.trim();
    if (title.length < 3 || title.length > 100) {
      return L('Der Titel muss zwischen 3 und 100 Zeichen lang sein.', 'The title must be 3 to 100 characters long.');
    }
    if (summary.length < 10 || summary.length > 300) {
      return L('Die Zusammenfassung muss zwischen 10 und 300 Zeichen lang sein.', 'The summary must be 10 to 300 characters long.');
    }
    if (CONTAINS_LINK.test(title) || CONTAINS_LINK.test(summary)) {
      return L(
        'Titel und Zusammenfassung dürfen keine Web-Links enthalten. Ein Bild kannst du unten als Bild-URL angeben.',
        'Title and summary must not contain web links. You can add an image below as an image URL.'
      );
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
      formData.authorName ? `Name: ${formData.authorName}` : '',
      formData.authorEmail ? `E-Mail: ${formData.authorEmail}` : '',
    ].filter(Boolean);

    const body = encodeURIComponent(bodyLines.join('\n\n'));
    return `mailto:nuri@modabber.net,lasse.nieruch@bahai.de?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (isEdit) {
        // A revision has to reach the same entry; an e-mail would not. It is also not kept as a draft.
        setSubmitError(
          L(
            'Du bist offline. Lass diese Seite offen und sende die Überarbeitung, sobald du wieder online bist.',
            'You are offline. Keep this page open and send the revision once you are back online.'
          )
        );
        return;
      }
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
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      objective: formData.objective,
      reflectionQuestions: formData.reflectionQuestions,
      setting: formData.setting,
      occasion: formData.occasion,
      clientTimestamp: mountTime,
      hp_website: formData.hp_website,
      ...(isEdit && editNumber !== null ? { action: 'update' as const, issueNumber: editNumber } : {}),
    };

    // Store in admin inbox queue for local review and live sync (a revision is not a new entry)
    try {
      if (!isEdit) saveProposal({
        type: formData.type === 'spiel' ? 'spiel' : formData.type === 'dienst' ? 'dienst' : 'kunst',
        title: formData.title,
        subtitle: formData.subtitle,
        summary: formData.summary,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail,
        payload,
      });
    } catch {
      /* ignore */
    }

    // Only a confirmed server response counts as sent. Before, every failure (validation, rate
    // limit, GitHub outage) still showed the success screen, and the entry was lost.
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const resData = await response.json().catch(() => ({}));
      if (response.ok && resData.ok && isEdit && editNumber !== null) {
        markRevised(editNumber, formData.title.trim(), toStoredForm(formData));
        setRevisionSent(true);
        setStep(3);
        return;
      }
      if (response.ok && resData.ok) {
        if (typeof resData.issueNumber === 'number') {
          addMySubmission(
            {
              issueNumber: resData.issueNumber,
              type: formData.type,
              title: formData.title.trim(),
              submittedAt: Date.now(),
              form: toStoredForm(formData),
            });
        }
        try {
          localStorage.removeItem(STORAGE_DRAFT_KEY);
        } catch {
          /* ignore */
        }
        if (resData.issueUrl) setCreatedIssueUrl(resData.issueUrl);
        setStep(3);
        return;
      }
      if (isEdit) {
        // The server answers in German only; 403/409 are known cases, so they are shown in the page language.
        if (response.status === 409) refreshStatuses(true);
        setSubmitError(
          response.status === 403
            ? L('Dieser Beitrag kann von diesem Gerät aus nicht geändert werden.', 'This contribution cannot be changed from this device.')
            : response.status === 409
            ? L('Dieser Beitrag wartet gerade nicht auf Änderungen.', 'This contribution is not waiting for changes right now.')
            : (language === 'de' && typeof resData.error === 'string' && resData.error) ||
                L(
                  'Die Überarbeitung konnte nicht gesendet werden. Lass diese Seite offen und versuche es gleich noch einmal.',
                  'The revision could not be sent. Keep this page open and try again shortly.'
                )
        );
        return;
      }
      setMailtoFallback(generateMailtoUrl());
      setSubmitError(
        (typeof resData.error === 'string' && resData.error) ||
          L(
            'Der Vorschlag konnte nicht gesendet werden. Dein Entwurf bleibt gespeichert. Du kannst ihn per E-Mail schicken oder es später erneut versuchen.',
            'The proposal could not be sent. Your draft is kept. You can send it by email or try again later.'
          )
      );
    } catch {
      if (isEdit) {
        setSubmitError(
          L(
            'Keine Verbindung zum Server. Lass diese Seite offen und versuche es gleich noch einmal.',
            'No connection to the server. Keep this page open and try again shortly.'
          )
        );
        return;
      }
      setMailtoFallback(generateMailtoUrl());
      setSubmitError(
        L(
          'Keine Verbindung zum Server. Dein Entwurf bleibt gespeichert. Du kannst ihn per E-Mail schicken oder es später erneut versuchen.',
          'No connection to the server. Your draft is kept. You can send it by email or try again later.'
        )
      );
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
        {step > 1 && !isEdit && (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-semibold text-text-secondary hover:text-text mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{L('Zurück zu Schritt', 'Back to step')} {step - 1}</span>
          </button>
        )}
        <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
          {isEdit ? L('Beitrag überarbeiten', 'Revise your contribution') : L('Erfahrungen beitragen', 'Contribute')}
        </h1>
        {!isEdit && <p className="hidden sm:block text-base sm:text-lg text-text-secondary mt-2 max-w-2xl font-normal leading-relaxed">
          {L(
            'Du hast ein Spiel oder Projekt, das fehlt? Teile erprobte Spiele, Dienstprojekte oder künstlerische Aktivitäten mit anderen Animatoren – alle Beiträge werden vor der Veröffentlichung geprüft.',
            "Have a game or project idea that's missing? Share proven games, service projects, or creative activities with other animators – all contributions are reviewed before publishing."
          )}
        </p>}
      </div>

      {/* Revision: check the current status first, then either the editors' note or why it is not possible */}
      {isEdit && !statusChecked && (
        <p role="status" className="text-sm text-text-secondary">
          {L('Beitrag wird geladen …', 'Loading contribution …')}
        </p>
      )}
      {isEdit && statusChecked && editProblem && (
        <Panel className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-text-secondary" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-text">
                {L('Überarbeiten ist hier nicht möglich', 'You cannot revise this here')}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {editProblem === 'device'
                  ? L(
                      'Überarbeiten geht nur auf dem Gerät, von dem du den Beitrag gesendet hast.',
                      'You can only revise a contribution on the device you sent it from.'
                    )
                  : L('Dieser Beitrag wartet gerade nicht auf Änderungen.', 'This contribution is not waiting for changes right now.')}
              </p>
            </div>
          </div>
          <Link to="/vorschlagen" className={primaryBtn}>
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{L('Zur Seite Beitragen', 'Back to Contribute')}</span>
          </Link>
        </Panel>
      )}
      {isEdit && statusChecked && !editProblem && step === 2 && (
        <div role="note" className="p-4 rounded-card bg-surface-2 border border-border text-sm flex items-start gap-3">
          <MessageSquare className="w-5 h-5 shrink-0 mt-0.5 text-text-secondary" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-text">{L('Hinweis der Redaktion', 'Note from the editors')}</p>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {editEntry?.note || L('Die Redaktion bittet dich, den Beitrag zu überarbeiten.', 'The editors ask you to revise your contribution.')}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Step Indicator */}
      {!isEdit && <div className="sm:hidden flex items-center justify-between gap-3" aria-label={language === 'de' ? 'Fortschritt' : 'Progress'}>
        <div>
          <span className="text-2xs font-extrabold text-accent-text block">
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
      </div>}

      {/* Desktop Step Indicator */}
      {!isEdit && <div className="hidden sm:flex items-center gap-2 text-xs font-semibold" aria-label={language === 'de' ? 'Fortschritt' : 'Progress'}>
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
      </div>}

      {/* Step 1: Type Selection — same tiles as "Projekte & mehr", 2 × 2 so it fits one phone screen */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <FadedIconTile Icon={Compass} title={L('Spiel', 'Game')} onClick={() => { updateField('type', 'spiel'); setStep(2); }} className="!min-h-[84px] sm:!min-h-[128px] lg:!min-h-[180px]" />
          <FadedIconTile Icon={HeartHandshake} title={L('Dienstprojekt', 'Service project')} onClick={() => { updateField('type', 'dienst'); setStep(2); }} className="!min-h-[84px] sm:!min-h-[128px] lg:!min-h-[180px]" />
          <FadedIconTile Icon={Palette} title={L('Kreative Aktivität', 'Creative activity')} onClick={() => { updateField('type', 'kunst'); setStep(2); }} className="!min-h-[84px] sm:!min-h-[128px] lg:!min-h-[180px]" />
          <FadedIconTile Icon={MessageSquare} title={L('Feedback & Ideen', 'Feedback & ideas')} onClick={() => setIsFeedbackOpen(true)} className="!min-h-[84px] sm:!min-h-[128px] lg:!min-h-[180px]" />
        </div>
      )}

      {/* Step 2: Form & Live Preview */}
      {step === 2 && statusChecked && !editProblem && (
        <div className="space-y-6">
          {/* Form / Preview Toggle */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-bold text-text">
              {isEdit ? L('Deine Überarbeitung', 'Your revision') : formData.type === 'spiel' ? L('Neues Spiel beitragen', 'Contribute a game') : formData.type === 'dienst' ? L('Neues Dienstprojekt beitragen', 'Contribute a service project') : L('Kreative Aktivität beitragen', 'Contribute a creative activity')}
            </span>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-chip text-xs font-semibold bg-surface-2 hover:bg-surface-raised text-text cursor-pointer transition-colors"
            >
              {isPreview ? <Pencil className="w-3.5 h-3.5 text-accent-text" /> : <Eye className="w-3.5 h-3.5 text-accent-text" />}
              <span>{isPreview ? L('Formular bearbeiten', 'Edit form') : L('Vorschau ansehen', 'Live preview')}</span>
            </button>
          </div>

          {isPreview ? (
            /* Live Preview Card */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-control bg-accent-subtle/50 text-accent-text text-xs font-semibold flex items-center gap-2">
                <span>{L('So sieht der Beitrag später auf der Plattform aus:', 'This is how your contribution will appear on the platform:')}</span>
              </div>

              <Panel className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">
                    {formData.type === 'spiel' ? L('Spiel', 'Game') : formData.type === 'dienst' ? L('Dienstprojekt', 'Service project') : L('Kunst & Ausdruck', 'Arts & expression')} · {L('Entwurf', 'Draft')}
                    {formData.relatedBook && (
                      <>
                        {' · '}
                        {JY_BOOKS.find((b) => b.id === formData.relatedBook)?.title[language]}
                        {formData.lesson ? ` · ${L('Lektion', 'Lesson')} ${formData.lesson}` : ''}
                      </>
                    )}
                  </p>
                  <h2 className="text-2xl font-bold text-text mt-2">
                    {formData.title || L('Unbenannter Eintrag', 'Untitled')}
                  </h2>
                  {formData.subtitle && <p className="text-sm text-text-secondary mt-0.5">{formData.subtitle}</p>}
                  <p className="text-sm text-text mt-3 font-medium leading-relaxed">{formData.summary || L('Keine Beschreibung angegeben.', 'No description provided.')}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-card bg-surface-2 text-xs">
                  <div>
                    <span className="text-text-tertiary block font-semibold">{L('Dauer', 'Duration')}</span>
                    <span className="font-bold text-text">{formData.durationMin}–{formData.durationMax} {L('Min', 'min')}</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary block font-semibold">{L('Gruppe', 'Group')}</span>
                    <span className="font-bold text-text">{formData.groupSizeMin}–{formData.groupSizeMax} {L('Personen', 'people')}</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary block font-semibold">{L('Material', 'Materials')}</span>
                    <span className="font-bold text-text">{formData.materials.join(', ') || L('Ohne Material', 'No materials')}</span>
                  </div>
                </div>

                {formData.steps.some((st) => st.trim()) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-text">{L('Ablauf', 'Steps')}</h3>
                    <ol className="space-y-2 text-sm text-text-secondary">
                      {formData.steps.filter(Boolean).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="font-bold text-accent-text shrink-0">{idx + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

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
                      {isEdit
                        ? L(
                            'Deine Änderungen gibt es nur auf dieser Seite. Lass sie offen und sende die Überarbeitung, sobald du wieder online bist.',
                            'Your changes exist only on this page. Keep it open and send the revision once you are back online.'
                          )
                        : L(
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
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                    className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                      className="w-full px-3 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text text-center font-bold"
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
                      className="w-full px-3 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text text-center font-bold"
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
                      className="w-full px-3 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text text-center font-bold"
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
                      className="w-full px-3 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text text-center font-bold"
                    />
                  </div>
                </div>

                {/* Juniorjugend-Buch & Lektion (optional) */}
                <div className="pt-3 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-text">
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
                        className="w-full px-3.5 py-2.5 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                        placeholder={L('z. B. 4', 'e.g. 4')}
                        disabled={!formData.relatedBook}
                        className="w-full px-3.5 py-2.5 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent disabled:opacity-40"
                      />
                    </div>
                  </div>
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
                    placeholder={L('z.B. Kreide, Augenbinden, Seil…', 'e.g. Chalk, blindfolds…')}
                    aria-label={L('Material hinzufügen', 'Add material')}
                    className="flex-1 min-w-0 px-3.5 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3 py-2 min-h-[44px] shrink-0 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text flex items-center gap-1 cursor-pointer"
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
                        <button type="button" onClick={() => handleRemoveMaterial(i)} aria-label={L(`${m} entfernen`, `Remove ${m}`)} className="-my-2 -mr-2 inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-text-tertiary hover:text-text cursor-pointer">
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
                    className="text-xs font-bold text-accent-text hover:underline flex items-center gap-1 min-h-[44px] px-2 -mr-2 cursor-pointer"
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
                        placeholder={L(`Schritt ${idx + 1} beschreiben…`, `Describe step ${idx + 1}…`)}
                        aria-label={L(`Schritt ${idx + 1}`, `Step ${idx + 1}`)}
                        className="flex-1 px-3.5 py-2 rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                      />
                      {formData.steps.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-control text-text-tertiary hover:text-danger cursor-pointer"
                          title={L('Schritt löschen', 'Delete step')}
                          aria-label={L(`Schritt ${idx + 1} löschen`, `Delete step ${idx + 1}`)}
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
                  <h3 className="text-xs font-bold text-accent-text">
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
                      className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                        aria-label={L('Reflexionsfrage hinzufügen', 'Add reflection question')}
                        className="flex-1 min-w-0 px-3.5 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-3 py-2 min-h-[44px] shrink-0 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-text flex items-center gap-1 cursor-pointer"
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
                            <button type="button" onClick={() => handleRemoveQuestion(idx)} aria-label={L(`Frage ${idx + 1} entfernen`, `Remove question ${idx + 1}`)} className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-text-tertiary hover:text-danger cursor-pointer shrink-0">
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
                    className="w-full px-3.5 py-2 rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <Label htmlFor="prop-src">{L('Quelle oder Herkunft (optional)', 'Source or origin (optional)')}</Label>
                  <input
                    id="prop-src"
                    type="text"
                    value={formData.source}
                    onChange={(e) => updateField('source', e.target.value)}
                    placeholder={L('z.B. Selbst erfunden, JY-Camp 2024, abgewandelt von…', 'e.g. Self-invented, JY-Camp 2024…')}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                      className="w-full px-3.5 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
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
                      aria-describedby={isEdit ? 'prop-mail-hint' : undefined}
                      className="w-full px-3.5 py-2 min-h-[44px] rounded-control bg-surface-2 border border-border text-base sm:text-sm text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                    />
                    {isEdit && (
                      <p id="prop-mail-hint" className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {L(
                          'Nur ausfüllen, wenn sich deine Adresse geändert hat. Sonst behalten wir die bisherige.',
                          'Only fill this in if your address has changed. Otherwise we keep the one you gave before.'
                        )}
                      </p>
                    )}
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
                      'Ich habe die Datenschutzerklärung zur Kenntnis genommen (Beiträge werden als öffentliches GitHub Issue verarbeitet; Name und E-Mail sind freiwillig, die E-Mail wird nicht veröffentlicht).',
                      'I have read the privacy statement (Contributions are submitted as public GitHub issues; name and email are optional, the email is not published).'
                    )}
                  </span>
                </label>
              </div>

              {/* Fehler direkt über dem Absenden-Knopf: vorher stand er ~1400 px weiter oben und wurde nicht angesagt. */}
              {submitError && (
                <div ref={errorRef} role="alert" className="p-4 rounded-card bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-start gap-2.5">
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

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${primaryBtn} flex-1`}
                >
                  <span>
                    {isSubmitting
                      ? L('Wird übermittelt...', 'Submitting...')
                      : isEdit
                      ? L('Überarbeitung senden', 'Send revision')
                      : L('Beitrag absenden', 'Submit contribution')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Panel className="text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-text tracking-tight">
              {revisionSent ? L('Überarbeitung gesendet.', 'Revision sent.') : L('Danke für deinen Beitrag.', 'Thank you for your contribution.')}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {revisionSent
                ? L('Die Redaktion schaut sich deinen Beitrag erneut an.', 'The editors will look at your contribution again.')
                : L(
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
                // After a revision the page switches back to a new entry (fresh form with the saved draft).
                if (isEdit) {
                  navigate('/vorschlagen');
                  return;
                }
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

      {/* Meine Beiträge: also on the confirmation screen, so the new entry shows up right away */}
      <MyContributions language={language} hideWhenEmpty />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        language={language}
      />
    </div>
  );
};
