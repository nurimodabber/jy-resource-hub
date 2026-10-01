import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Clock, Plus, Trash2, ArrowUp, ArrowDown, 
  RotateCcw, Share2, Play, Pause, ChevronRight, ChevronLeft, 
  X, Check, Copy, Edit2, Download
} from 'lucide-react';
import { 
  Language, SessionSlot, SessionSlotType 
} from '../types';
import { GAMES_DATA } from '../data/games';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { DEVOTIONAL_SONGS_DATA } from '../data/songs';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { Badge } from './ui/Badge';
import { Dialog } from './ui/Dialog';
import { generateWhatsAppLink } from '../utils/share';

interface SessionBuilderProps {
  language: Language;
  onOpenBahaiSongs?: () => void;
  externalSlotToAdd?: SessionSlot | null;
  onClearExternalSlot?: () => void;
  favorites?: string[];
}

export const SessionBuilder: React.FC<SessionBuilderProps> = ({
  language,
  favorites = [],
}) => {
  const { 
    plans, 
    activePlan, 
    activePlanId, 
    setActivePlanId, 
    createNewPlan, 
    deletePlan, 
    renamePlan, 
    addSlotToPlan, 
    updateSlot, 
    removeSlot, 
    reorderSlots, 
    clearActivePlan,
    loadPresetIntoPlan 
  } = usePlanner();
  const { showToast } = useToast();

  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [pickerTab, setPickerTab] = useState<'games' | 'quotes' | 'songs' | 'service' | 'arts' | 'saved'>('games');
  const [pickerSearch, setPickerSearch] = useState('');

  // "Durchführen" (Run/Execution) Mode State
  const [isRunningMode, setIsRunningMode] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  // Fallback: If no plan exists at all, initialize empty plan container
  useEffect(() => {
    if (plans.length === 0) {
      createNewPlan(language === 'de' ? 'Mein Ablauf' : 'My Session Plan');
    }
  }, [plans.length, createNewPlan, language]);

  const slots = useMemo(() => activePlan?.slots || [], [activePlan?.slots]);
  const totalMinutes = useMemo(() => slots.reduce((acc, s) => acc + s.durationMinutes, 0), [slots]);

  // Screen Wake Lock API for "Durchführen" mode
  useEffect(() => {
    if (isRunningMode) {
      if ('wakeLock' in navigator && (navigator as unknown as { wakeLock?: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock) {
        (navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen').then((lock) => {
          wakeLockRef.current = lock;
        }).catch(() => {});
      }
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      setIsTimerActive(false);
    }
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isRunningMode]);

  // Countdown timer for active block
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunningMode && isTimerActive && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunningMode, isTimerActive, timerSecondsLeft]);

  const handleStartRunMode = () => {
    if (slots.length === 0) return;
    setCurrentBlockIndex(0);
    setTimerSecondsLeft(slots[0].durationMinutes * 60);
    setIsTimerActive(true);
    setIsRunningMode(true);
  };

  const handleNextBlock = () => {
    if (currentBlockIndex < slots.length - 1) {
      const nextIdx = currentBlockIndex + 1;
      setCurrentBlockIndex(nextIdx);
      setTimerSecondsLeft(slots[nextIdx].durationMinutes * 60);
      setIsTimerActive(true);
    }
  };

  const handlePrevBlock = () => {
    if (currentBlockIndex > 0) {
      const prevIdx = currentBlockIndex - 1;
      setCurrentBlockIndex(prevIdx);
      setTimerSecondsLeft(slots[prevIdx].durationMinutes * 60);
      setIsTimerActive(true);
    }
  };

  // Preset templates
  const presets = useMemo(() => [
    {
      id: 'standard-75',
      name: language === 'de' ? 'Ausgewogene JG-Stunde (75 Min)' : 'Standard Session (75 min)',
      desc: language === 'de' ? 'Warmup, Eröffnungslied, Zitatestudium, Theater/Kunst, Abschluss' : 'Warmup, opening song, scripture study, arts, closing',
      slots: [
        {
          id: 'p1',
          type: 'warmup' as SessionSlotType,
          title: { de: 'Schnick-Schnack-Schnuck Evolution', en: 'Rock Paper Scissors Evolution' },
          durationMinutes: 10,
          description: { de: 'Lockerer Einstieg, baut Hemmungen ab und bringt Energie in den Kreis.', en: 'Energizing icebreaker that breaks physical tension.' },
          referenceId: 'ssp-evolution',
          referenceType: 'game' as const,
        },
        {
          id: 'p2',
          type: 'devotional' as SessionSlotType,
          title: { de: 'Eingangslied: Blessed is the Spot', en: 'Opening Choral Song: Blessed is the Spot' },
          durationMinutes: 10,
          description: { de: 'Gemeinsames Singen für eine ruhige, ehrfürchtige Atmosphäre.', en: 'Opening song and reflective prayer to center the group.' },
          referenceId: 'blessed-is-the-spot',
          referenceType: 'song' as const,
        },
        {
          id: 'p3',
          type: 'study' as SessionSlotType,
          title: { de: 'Zitate-Studium & Verschwindende Tafel', en: 'Scripture Study & Disappearing Board' },
          durationMinutes: 25,
          description: { de: 'Kollektives Einprägen durch schrittweises Löschen von Wörtern.', en: 'Progressive word erasure for collective retention.' },
          referenceId: 'die-verschwindende-tafel',
          referenceType: 'method' as const,
        },
        {
          id: 'p4',
          type: 'arts_discussion' as SessionSlotType,
          title: { de: 'Theater: Die Weggabelung der Bestätigungen', en: 'Drama: The Fork in the Road of Confirmation' },
          durationMinutes: 20,
          description: { de: 'Kurzes Szenenspiel zur praktischen Anwendung des Gelernten.', en: 'Short skit applying lesson concepts to real dilemmas.' },
          referenceId: 'breezes-two-roads-skit',
          referenceType: 'art' as const,
        },
        {
          id: 'p5',
          type: 'closing' as SessionSlotType,
          title: { de: 'Wort-Mind (Stummes Zählen)', en: 'Word Mind (Silent Counting)' },
          durationMinutes: 10,
          description: { de: 'Ruhiges, konzentriertes Abschlussspiel im Kreis.', en: 'Quiet mindful challenge to close in unity.' },
          referenceId: 'wort-mind',
          referenceType: 'game' as const,
        },
      ],
    },
    {
      id: 'quick-45',
      name: language === 'de' ? 'Kompakte Stunde (45 Min)' : 'Quick Session (45 min)',
      desc: language === 'de' ? 'Schneller Einstieg, Kernzitat und kurze Reflexion für begrenzte Zeit.' : 'Quick icebreaker, core quote, and closing reflection.',
      slots: [
        {
          id: 'q1',
          type: 'warmup' as SessionSlotType,
          title: { de: 'Ninja Reaktionsspiel', en: 'Ninja Reaction Duel' },
          durationMinutes: 10,
          description: { de: 'Sofortige Wachsamkeit und Lachen im Kreis.', en: 'Instant alertness and laughter in a standing circle.' },
          referenceId: 'ninja',
          referenceType: 'game' as const,
        },
        {
          id: 'q2',
          type: 'study' as SessionSlotType,
          title: { de: 'Erstbuchstaben-Board', en: 'First-Letter Anchors' },
          durationMinutes: 25,
          description: { de: 'Aktiver kognitiver Abruf anhand von Wortanfängen.', en: 'Active retrieval practice using initial letter prompts.' },
          referenceId: 'erstbuchstaben-staffel',
          referenceType: 'method' as const,
        },
        {
          id: 'q3',
          type: 'closing' as SessionSlotType,
          title: { de: 'Reflexionsrunde & Gebet', en: 'Reflection Circle & Prayer' },
          durationMinutes: 10,
          description: { de: 'Ein Gedanke für die Woche und Abschlusssegen.', en: 'A closing thought for the week and prayer.' },
        },
      ],
    },
    {
      id: 'camp-120',
      name: language === 'de' ? 'Camp-Block (120 Min)' : 'Camp Block (120 min)',
      desc: language === 'de' ? 'Ausführlicher Freizeit-Block mit Warmup, Vertiefung, Aktion und Dienst.' : 'Deep camp session with warmup, text study, and community service.',
      slots: [
        {
          id: 'c1',
          type: 'warmup' as SessionSlotType,
          title: { de: 'SSP Showdown (Fankurve)', en: 'RPS Showdown & Cheer Rally' },
          durationMinutes: 15,
          description: { de: 'Große Gruppendynamik mit wachsenden Fankurven.', en: 'High energy arena game with growing cheer squads.' },
          referenceId: 'ssp-evolution',
          referenceType: 'game' as const,
        },
        {
          id: 'c2',
          type: 'study' as SessionSlotType,
          title: { de: 'Textstudium & Staffellauf', en: 'Text Study & Relay Sprint' },
          durationMinutes: 30,
          description: { de: 'Körperliche Bewegung verknüpft mit Textverständnis.', en: 'Physical movement coupled with retention.' },
          referenceId: 'lauf-diktat',
          referenceType: 'method' as const,
        },
        {
          id: 'c3',
          type: 'service' as SessionSlotType,
          title: { de: 'Gemeindedienst: Stadtteil-Putz & Müll-Audit', en: 'Clean-up & Trash Audit' },
          durationMinutes: 50,
          description: { de: 'Praktisches Dienen in der Umgebung des Geländes.', en: 'Hands-on ecological service around the campsite.' },
          referenceId: 'trash-audit-cleanup',
          referenceType: 'service' as const,
        },
        {
          id: 'c4',
          type: 'closing' as SessionSlotType,
          title: { de: 'Gemeinsames Abschlusslied', en: 'Closing Song' },
          durationMinutes: 25,
          description: { de: 'Ausklang mit Liedern und Gebeten.', en: 'Closing songs and prayers.' },
          referenceId: 'blessed-is-the-spot',
          referenceType: 'song' as const,
        },
      ],
    },
  ], [language]);

  const handleApplyPreset = (preset: typeof presets[0]) => {
    loadPresetIntoPlan(preset.slots, preset.name);
    setIsTemplateDialogOpen(false);
    showToast({
      text: language === 'de' ? `Vorlage „${preset.name}“ geladen` : `Template "${preset.name}" loaded`,
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    const result = removeSlot(slotId);
    showToast({
      text: language === 'de' ? 'Block entfernt' : 'Block removed',
      undo: {
        label: language === 'de' ? 'Rückgängig' : 'Undo',
        onClick: () => result.undo(),
      },
    });
  };

  const handleClearAll = () => {
    if (window.confirm(language === 'de' ? 'Möchtest du alle Blöcke dieses Ablaufs wirklich leeren?' : 'Clear all blocks in this plan?')) {
      const result = clearActivePlan();
      showToast({
        text: language === 'de' ? 'Ablauf geleert' : 'Plan cleared',
        undo: {
          label: language === 'de' ? 'Rückgängig' : 'Undo',
          onClick: () => result.undo(),
        },
      });
    }
  };

  const handleOpenLibraryPicker = (slotId?: string) => {
    setEditingSlotId(slotId || null);
    setIsPickerOpen(true);
  };

  const handleSelectFromLibrary = (
    item: { 
      title: { de: string; en: string }; 
      desc: { de: string; en: string }; 
      type: SessionSlotType; 
      refId: string; 
      refType: 'game' | 'quote' | 'method' | 'song' | 'service' | 'art';
      duration?: number;
    }
  ) => {
    if (editingSlotId) {
      updateSlot(editingSlotId, {
        title: item.title,
        description: item.desc,
        type: item.type,
        referenceId: item.refId,
        referenceType: item.refType,
        durationMinutes: item.duration || 15,
      });
      showToast({ text: language === 'de' ? 'Block aktualisiert' : 'Block updated' });
    } else {
      addSlotToPlan({
        type: item.type,
        title: item.title,
        description: item.desc,
        durationMinutes: item.duration || 15,
        referenceId: item.refId,
        referenceType: item.refType,
      });
      showToast({ text: language === 'de' ? 'Block hinzugefügt' : 'Block added' });
    }
    setIsPickerOpen(false);
  };

  // Agenda text generator for WhatsApp or Clipboard
  const agendaText = useMemo(() => {
    if (!activePlan) return '';
    const header = `${activePlan.name} (${totalMinutes} Min.)\n` +
      `${language === 'de' ? 'Ablauf für die Juniorjugendgruppe:' : 'Agenda for junior youth session:'}\n\n`;
    const body = slots.map((s, idx) => `${idx + 1}. [${s.durationMinutes}′] ${s.title[language]} — ${s.description[language]}`).join('\n\n');
    return header + body;
  }, [activePlan, slots, totalMinutes, language]);

  const [copiedShare, setCopiedShare] = useState(false);
  const handleCopyAgenda = () => {
    navigator.clipboard.writeText(agendaText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const whatsappLink = generateWhatsAppLink(agendaText);

  // Filtered items in library picker
  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter((g) => g.title[language].toLowerCase().includes(pickerSearch.toLowerCase()));
  }, [pickerSearch, language]);

  const filteredQuotesAndMethods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((m) => m.name[language].toLowerCase().includes(pickerSearch.toLowerCase()));
  }, [pickerSearch, language]);

  const filteredSongs = useMemo(() => {
    return DEVOTIONAL_SONGS_DATA.filter((s) => s.title[language].toLowerCase().includes(pickerSearch.toLowerCase()));
  }, [pickerSearch, language]);

  const filteredService = useMemo(() => {
    return SERVICE_PROJECTS_DATA.filter((p) => p.title[language].toLowerCase().includes(pickerSearch.toLowerCase()));
  }, [pickerSearch, language]);

  const filteredArts = useMemo(() => {
    return ARTS_PROMPTS_DATA.filter((a) => a.title[language].toLowerCase().includes(pickerSearch.toLowerCase()));
  }, [pickerSearch, language]);

  const getSlotTypeBadge = (type: SessionSlotType) => {
    switch (type) {
      case 'warmup': return <Badge category="energizer" size="sm">{language === 'de' ? 'Warmup' : 'Warmup'}</Badge>;
      case 'devotional': return <Badge category="devotional" size="sm">{language === 'de' ? 'Andacht / Lied' : 'Devotional'}</Badge>;
      case 'study': return <Badge category="study" size="sm">{language === 'de' ? 'Textstudium' : 'Study'}</Badge>;
      case 'arts_discussion': return <Badge category="arts" size="sm">{language === 'de' ? 'Kunst & Gespräch' : 'Arts'}</Badge>;
      case 'service': return <Badge category="service" size="sm">{language === 'de' ? 'Dienst' : 'Service'}</Badge>;
      case 'closing': return <Badge category="social" size="sm">{language === 'de' ? 'Abschluss' : 'Closing'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Printable One-Page Header (Only visible in Print) */}
      <div className="hidden print:block mb-6 border-b border-black pb-4">
        <h1 className="text-2xl font-bold text-black">{activePlan?.name || 'Ablaufplan'}</h1>
        <p className="text-sm text-neutral-600 mt-1">
          {slots.length} Aktivitäten · Gesamtdauer: {totalMinutes} Minuten · Erstellt mit JY Hub
        </p>
      </div>

      {/* Plan Header Bar */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Plan Selector & Rename */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                {language === 'de' ? 'Ablaufplan' : 'Session Plan'}
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="text-xs font-semibold text-accent-text">
                {slots.length} {language === 'de' ? 'Blöcke' : 'blocks'} · {totalMinutes} Min.
              </span>
            </div>

            {isRenaming ? (
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  className="px-3 py-1.5 text-base font-bold rounded-xl bg-surface-2 border border-border text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nameInput.trim() && activePlan) {
                      renamePlan(activePlan.id, nameInput.trim());
                    }
                    setIsRenaming(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-accent text-accent-contrast text-xs font-semibold"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-text truncate">
                  {activePlan?.name || (language === 'de' ? 'Mein Ablauf' : 'My Session Plan')}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(activePlan?.name || '');
                    setIsRenaming(true);
                  }}
                  className="p-1 rounded-lg text-text-tertiary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label="Name ändern"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {plans.length > 1 && activePlan && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(language === 'de' ? `Plan "${activePlan.name}" wirklich löschen?` : `Delete plan "${activePlan.name}"?`)) {
                        deletePlan(activePlan.id);
                      }
                    }}
                    className="p-1 rounded-lg text-text-tertiary hover:text-red-500 hover:bg-surface-2 transition-colors cursor-pointer"
                    aria-label={language === 'de' ? 'Plan löschen' : 'Delete plan'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Primary Action: "Durchführen" (Run Mode) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {slots.length > 0 && (
              <button
                type="button"
                onClick={handleStartRunMode}
                className="px-4 py-2.5 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[40px]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'de' ? 'Durchführen' : 'Run Session'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsTemplateDialogOpen(true)}
              className="px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px]"
            >
              {language === 'de' ? 'Vorlage laden' : 'Load Template'}
            </button>

            <button
              type="button"
              onClick={() => createNewPlan()}
              className="px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px]"
            >
              {language === 'de' ? '+ Neuer Plan' : '+ New Plan'}
            </button>
          </div>

        </div>

        {/* Plan Switcher Pills if multiple plans exist */}
        {plans.length > 1 && (
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlanId(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activePlanId === p.id
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slots List or Empty State */}
      {slots.length === 0 ? (
        /* Empty State: 3 calm choices */
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-surface-2 text-accent-text flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text">
              {language === 'de' ? 'Dein Ablauf ist noch leer' : 'Your plan is empty'}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              {language === 'de' 
                ? 'Wähle eine erprobte Vorlage oder stelle deine eigenen Aktivitäten zusammen.'
                : 'Start with a proven framework or pick your activities step by step.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => setIsTemplateDialogOpen(true)}
              className="p-4 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border text-left transition-colors flex flex-col justify-between group min-h-[110px]"
            >
              <div>
                <span className="text-xs font-bold text-text group-hover:text-accent transition-colors block">
                  {language === 'de' ? '1. Vorlage wählen' : '1. Choose Template'}
                </span>
                <span className="text-2xs text-text-secondary mt-1 block">
                  {language === 'de' ? '75 Min Standard, 45 Min Schnell oder 2h Camp.' : '75 min standard, 45 min quick, or 2h camp.'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all mt-2" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenLibraryPicker()}
              className="p-4 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border text-left transition-colors flex flex-col justify-between group min-h-[110px]"
            >
              <div>
                <span className="text-xs font-bold text-text group-hover:text-accent transition-colors block">
                  {language === 'de' ? '2. Mit Spiel beginnen' : '2. Start with Game'}
                </span>
                <span className="text-2xs text-text-secondary mt-1 block">
                  {language === 'de'
                    ? `Wähle aus ${GAMES_DATA.length} erprobten Spielen.`
                    : `Pick from ${GAMES_DATA.length} field-tested games.`}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all mt-2" />
            </button>

            <button
              type="button"
              onClick={() => {
                setPickerTab('saved');
                handleOpenLibraryPicker();
              }}
              className="p-4 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border text-left transition-colors flex flex-col justify-between group min-h-[110px]"
            >
              <div>
                <span className="text-xs font-bold text-text group-hover:text-accent transition-colors block">
                  {language === 'de' ? '3. Aus Gemerkten' : '3. From Saved'}
                </span>
                <span className="text-2xs text-text-secondary mt-1 block">
                  {language === 'de' ? 'Deine gespeicherten Favoriten einfügen.' : 'Insert your bookmarked activities.'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all mt-2" />
            </button>
          </div>
        </div>
      ) : (
        /* Plan Slots List */
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-accent/40"
            >
              {/* Order index + Content */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-7 h-7 rounded-xl bg-surface-2 font-bold text-xs text-text flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {getSlotTypeBadge(slot.type)}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-text truncate">
                    {slot.title[language]}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
                    {slot.description[language]}
                  </p>
                </div>
              </div>

              {/* Duration Stepper & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                {/* Duration Stepper (min 44px touch targets) */}
                <div className="flex items-center gap-1 bg-surface-2 rounded-xl p-0.5 border border-border">
                  <button
                    type="button"
                    onClick={() => updateSlot(slot.id, { durationMinutes: Math.max(5, slot.durationMinutes - 5) })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:bg-surface font-bold text-sm min-h-[32px] cursor-pointer"
                    aria-label="Dauer verringern"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold px-1 text-text min-w-[36px] text-center">
                    {slot.durationMinutes}′
                  </span>
                  <button
                    type="button"
                    onClick={() => updateSlot(slot.id, { durationMinutes: slot.durationMinutes + 5 })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:bg-surface font-bold text-sm min-h-[32px] cursor-pointer"
                    aria-label="Dauer erhöhen"
                  >
                    +
                  </button>
                </div>

                {/* "Ändern" (Change Slot Item) */}
                <button
                  type="button"
                  onClick={() => handleOpenLibraryPicker(slot.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-medium text-text transition-colors cursor-pointer min-h-[36px]"
                >
                  {language === 'de' ? 'Ändern' : 'Change'}
                </button>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderSlots(index, index - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text disabled:opacity-30 min-h-[32px]"
                    aria-label="Nach oben verschieben"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === slots.length - 1}
                    onClick={() => reorderSlots(index, index + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text disabled:opacity-30 min-h-[32px]"
                    aria-label="Nach unten verschieben"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-colors min-h-[32px]"
                  aria-label="Block löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add block button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleOpenLibraryPicker()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'de' ? 'Block hinzufügen' : 'Add Block'}</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-text-tertiary hover:text-red-500 transition-colors min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Ablauf leeren' : 'Clear Plan'}</span>
            </button>
          </div>

          {/* Bottom Share & Export Toolbar (Secondary Actions) */}
          <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAgenda}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-medium text-text transition-colors cursor-pointer min-h-[38px]"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShare ? (language === 'de' ? 'Kopiert!' : 'Copied!') : (language === 'de' ? 'Ablauf kopieren' : 'Copy Agenda')}</span>
              </button>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-medium text-text transition-colors cursor-pointer min-h-[38px]"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-medium text-text transition-colors cursor-pointer min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5 text-text-tertiary" />
                <span>{language === 'de' ? 'Drucken (1 Seite)' : 'Print (1 Page)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Dialog */}
      <Dialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        title={language === 'de' ? 'Ablauf-Vorlage wählen' : 'Choose Session Template'}
        maxWidth="md"
        showCloseButton={true}
      >
        <div className="space-y-3 pt-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="p-4 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                  {preset.name}
                </h4>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text">
                  {preset.slots.length} {language === 'de' ? 'Blöcke' : 'slots'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {preset.desc}
              </p>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Library Slot Item Picker Dialog */}
      <Dialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title={editingSlotId ? (language === 'de' ? 'Aktivität ändern' : 'Change Activity') : (language === 'de' ? 'Aktivität hinzufügen' : 'Add Activity')}
        maxWidth="lg"
        showCloseButton={true}
      >
        <div className="space-y-4 pt-1">
          {/* Subtab Navigation (Games, Quotes/Methods, Songs, Service, Arts, Saved) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setPickerTab('games')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                pickerTab === 'games' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Spiele' : 'Games'}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('quotes')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                pickerTab === 'quotes' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Zitate & Methoden' : 'Quotes & Methods'}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('songs')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                pickerTab === 'songs' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Lieder' : 'Songs'}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('service')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                pickerTab === 'service' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Dienst' : 'Service'}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('arts')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                pickerTab === 'arts' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Kunst' : 'Arts'}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('saved')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                pickerTab === 'saved' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? `Gemerkt (${favorites.length})` : `Saved (${favorites.length})`}
            </button>
          </div>

          {/* Search Box */}
          <input
            type="text"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder={language === 'de' ? 'Titel oder Thema durchsuchen...' : 'Search title or topic...'}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent"
          />

          {/* Items List */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            {pickerTab === 'games' && filteredGames.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelectFromLibrary({
                  title: g.title,
                  desc: g.summary,
                  type: g.energyLevel === 'calm' ? 'closing' : 'warmup',
                  refId: g.id,
                  refType: 'game',
                  duration: parseInt(g.durationMinutes.replace(/[^0-9]/g, '')) || 15,
                })}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{g.title[language]}</h4>
                  <p className="text-2xs text-text-secondary line-clamp-1">{g.summary[language]}</p>
                </div>
                <span className="text-2xs font-semibold text-accent-text ml-2 shrink-0">{g.durationMinutes}′</span>
              </div>
            ))}

            {pickerTab === 'quotes' && filteredQuotesAndMethods.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectFromLibrary({
                  title: m.name,
                  desc: m.summary,
                  type: 'study',
                  refId: m.id,
                  refType: 'method',
                  duration: parseInt(m.durationMinutes.replace(/[^0-9]/g, '')) || 25,
                })}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{m.name[language]}</h4>
                  <p className="text-2xs text-text-secondary line-clamp-1">{m.summary[language]}</p>
                </div>
                <span className="text-2xs font-semibold text-accent-text ml-2 shrink-0">{m.durationMinutes}′</span>
              </div>
            ))}

            {pickerTab === 'songs' && filteredSongs.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectFromLibrary({
                  title: s.title,
                  desc: { de: `Andachtslied (${s.theme.de})`, en: `Devotional song (${s.theme.en})` },
                  type: 'devotional',
                  refId: s.id,
                  refType: 'song',
                  duration: 10,
                })}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{s.title[language]}</h4>
                  <p className="text-2xs text-text-secondary line-clamp-1">{s.theme[language]}</p>
                </div>
                <span className="text-2xs font-semibold text-accent-text ml-2 shrink-0">10′</span>
              </div>
            ))}

            {pickerTab === 'service' && filteredService.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectFromLibrary({
                  title: p.title,
                  desc: p.objective,
                  type: 'service',
                  refId: p.id,
                  refType: 'service',
                  duration: 45,
                })}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{p.title[language]}</h4>
                  <p className="text-2xs text-text-secondary line-clamp-1">{p.objective[language]}</p>
                </div>
                <span className="text-2xs font-semibold text-accent-text ml-2 shrink-0">45′</span>
              </div>
            ))}

            {pickerTab === 'arts' && filteredArts.map((a) => (
              <div
                key={a.id}
                onClick={() => handleSelectFromLibrary({
                  title: a.title,
                  desc: a.description,
                  type: 'arts_discussion',
                  refId: a.id,
                  refType: 'art',
                  duration: 30,
                })}
                className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{a.title[language]}</h4>
                  <p className="text-2xs text-text-secondary line-clamp-1">{a.description[language]}</p>
                </div>
                <span className="text-2xs font-semibold text-accent-text ml-2 shrink-0">30′</span>
              </div>
            ))}

            {pickerTab === 'saved' && (
              favorites.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-6">
                  {language === 'de' ? 'Keine gemerkten Elemente vorhanden.' : 'No saved items yet.'}
                </p>
              ) : (
                filteredGames.filter((g) => favorites.includes(g.id)).map((g) => (
                  <div
                    key={g.id}
                    onClick={() => handleSelectFromLibrary({
                      title: g.title,
                      desc: g.summary,
                      type: g.energyLevel === 'calm' ? 'closing' : 'warmup',
                      refId: g.id,
                      refType: 'game',
                      duration: parseInt(g.durationMinutes.replace(/[^0-9]/g, '')) || 15,
                    })}
                    className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text">{g.title[language]}</h4>
                      <p className="text-2xs text-text-secondary line-clamp-1">{g.summary[language]}</p>
                    </div>
                    <span className="text-2xs font-semibold text-accent-text ml-2 shrink-0">{g.durationMinutes}′</span>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </Dialog>

      {/* "Durchführen" Full-Screen Live Execution Mode */}
      {isRunningMode && slots.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-bg text-text p-6 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar: Progress & Close */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-accent-contrast">
                {currentBlockIndex + 1} / {slots.length}
              </span>
              <h2 className="text-sm font-semibold text-text-secondary truncate">
                {activePlan?.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsRunningMode(false)}
              className="p-2 rounded-full bg-surface-2 hover:bg-surface-raised text-text-secondary hover:text-text cursor-pointer"
              aria-label="Durchführen beenden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Block Content: Large, Clear, Readable */}
          <div className="my-auto max-w-2xl mx-auto w-full text-center space-y-6">
            <div className="inline-flex">
              {getSlotTypeBadge(slots[currentBlockIndex].type)}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight">
              {slots[currentBlockIndex].title[language]}
            </h1>

            <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed">
              {slots[currentBlockIndex].description[language]}
            </p>

            {/* Countdown Timer Display */}
            <div className="py-4">
              <div className="text-5xl sm:text-7xl font-mono font-bold text-accent-text tracking-tighter">
                {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
                {String(timerSecondsLeft % 60).padStart(2, '0')}
              </div>
              <p className="text-2xs text-text-tertiary mt-2">
                {language === 'de' ? 'Display bleibt aktiv (Wake Lock)' : 'Screen kept awake (Wake Lock active)'}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="px-6 py-3 rounded-2xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {isTimerActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTimerActive ? (language === 'de' ? 'Pause' : 'Pause') : (language === 'de' ? 'Start' : 'Start')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTimerSecondsLeft(slots[currentBlockIndex].durationMinutes * 60)}
                className="px-4 py-3 rounded-2xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
                title="Timer zurücksetzen"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Prev / Next Block Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              disabled={currentBlockIndex === 0}
              onClick={handlePrevBlock}
              className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text disabled:opacity-30 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'de' ? 'Vorheriger Block' : 'Previous Block'}</span>
            </button>

            <button
              type="button"
              disabled={currentBlockIndex === slots.length - 1}
              onClick={handleNextBlock}
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover text-xs font-semibold disabled:opacity-30 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <span>{language === 'de' ? 'Nächster Block' : 'Next Block'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
