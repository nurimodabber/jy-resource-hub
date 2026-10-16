import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Check, Copy, Trash2, Clock,
  ArrowUp, ArrowDown, Plus, ChevronRight, ChevronLeft, X,
  Download, Share2, CheckSquare, Square, BookOpen, Music,
  HeartHandshake, Palette, Smile, AlertTriangle, ExternalLink,
  Calendar, Edit2, Search, SunMedium, Sparkles, GripVertical
} from 'lucide-react';
import {
  Language, SessionSlot, SessionSlotType, SessionPlan, LocalizedString
} from '../types';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { DEVOTIONAL_SONGS_DATA } from '../data/songs';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { Badge } from './ui/Badge';
import { Dialog } from './ui/Dialog';
import { IconButton } from './ui/IconButton';
import { UI_TRANSLATIONS } from '../data/translations';
import { shareResource, generateWhatsAppLink } from '../utils/share';

interface SessionBuilderProps {
  language: Language;
  onOpenBahaiSongs?: () => void;
  externalSlotToAdd?: SessionSlot | null;
  onClearExternalSlot?: () => void;
  favorites?: string[];
}

// ----------------------------------------------------
// TIME CALCULATION HELPERS
// ----------------------------------------------------
function parseTimeToMinutes(timeStr: string = '17:00'): number {
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return ((h % 24) * 60 + (m % 60));
}

function minutesToTimeString(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getSlotTimeRange(startTimeStr: string, slotIndex: number, slots: SessionSlot[]) {
  const baseMinutes = parseTimeToMinutes(startTimeStr);
  let accumulated = 0;
  for (let i = 0; i < slotIndex; i++) {
    accumulated += slots[i].durationMinutes;
  }
  const start = baseMinutes + accumulated;
  const end = start + (slots[slotIndex]?.durationMinutes || 0);
  return {
    start: minutesToTimeString(start),
    end: minutesToTimeString(end),
  };
}

export const SLOT_CATEGORY_THEME: Record<SessionSlotType, { color: string; label: { de: string; en: string }; hex: string }> = {
  devotional: { color: 'bg-accent text-accent-contrast', hex: '#D4AE5C', label: { de: 'Andacht', en: 'Devotion' } },
  study: { color: 'bg-[#7DB6C9] text-white', hex: '#7DB6C9', label: { de: 'Zitat', en: 'Text study' } },
  warmup: { color: 'bg-[#E58A6B] text-white', hex: '#E58A6B', label: { de: 'Spiel', en: 'Game' } },
  service: { color: 'bg-[#B9C46A] text-[#1A1406]', hex: '#B9C46A', label: { de: 'Dienst', en: 'Service' } },
  arts_discussion: { color: 'bg-[#B9C46A] text-[#1A1406]', hex: '#B9C46A', label: { de: 'Kunst', en: 'Arts' } },
  closing: { color: 'bg-[#6E7F76] text-white', hex: '#6E7F76', label: { de: 'Abschluss', en: 'Closing' } },
  custom: { color: 'bg-[#889890] text-white', hex: '#889890', label: { de: 'Frei', en: 'Custom' } },
};

// ----------------------------------------------------
// URL ENCODE / DECODE HELPERS FOR PLAN SHARING
// ----------------------------------------------------
interface MinifiedSlot {
  t: SessionSlotType;
  ti: LocalizedString;
  d: number;
  de: LocalizedString;
  ri?: string;
  rt?: 'game' | 'quote' | 'method' | 'song' | 'service' | 'art';
}

interface MinifiedPlan {
  n: string;
  t?: number;
  s?: string;
  b: MinifiedSlot[];
}

function encodePlanToShareUrl(plan: SessionPlan): string {
  const minified: MinifiedPlan = {
    n: plan.name,
    t: plan.targetDurationMinutes || 75,
    s: plan.startTime || '17:00',
    b: plan.slots.map((s) => ({
      t: s.type,
      ti: s.title,
      d: s.durationMinutes,
      de: s.description,
      ri: s.referenceId,
      rt: s.referenceType,
    })),
  };
  const jsonStr = JSON.stringify(minified);
  // safe b64 in browser
  const b64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  const url = new URL(window.location.origin + '/treffen');
  url.searchParams.set('plan', b64);
  return url.toString();
}

function decodePlanFromShareParam(b64: string): { name: string; targetDurationMinutes: number; startTime: string; slots: SessionSlot[] } | null {
  try {
    const raw = decodeURIComponent(Array.prototype.map.call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const parsed = JSON.parse(raw) as MinifiedPlan;
    if (parsed && Array.isArray(parsed.b)) {
      return {
        name: parsed.n || 'Importiertes Treffen',
        targetDurationMinutes: parsed.t || 75,
        startTime: parsed.s || '17:00',
        slots: parsed.b.map((slot, idx) => ({
          id: 'slot-imp-' + Date.now() + '-' + idx,
          type: slot.t || 'custom',
          title: slot.ti || { de: 'Aktivität', en: 'Activity' },
          durationMinutes: slot.d || 15,
          description: slot.de || { de: '', en: '' },
          referenceId: slot.ri,
          referenceType: slot.rt,
        })),
      };
    }
  } catch {
    return null;
  }
  return null;
}

// ----------------------------------------------------
// PRESETS (Marked as Draft according to AGENTS.md)
// ----------------------------------------------------
export interface GatheringPreset {
  id: string;
  name: { de: string; en: string };
  desc: { de: string; en: string };
  targetDuration: number;
  status: 'draft';
  slots: Array<Omit<SessionSlot, 'id'>>;
}

export const GATHERING_PRESETS: GatheringPreset[] = [
  {
    id: 'standard-75',
    name: { de: 'Normales Treffen (75 Min)', en: 'Standard Gathering (75 min)' },
    desc: {
      de: 'Andacht 10, Zitat und Lernen 20, Spiel 15, Dienst oder Kunst 20, Abschluss 10.',
      en: 'Devotion 10, quote & study 20, game 15, service or arts 20, closing 10.'
    },
    targetDuration: 75,
    status: 'draft',
    slots: [
      {
        type: 'devotional',
        title: { de: 'Andacht & Lied: Gesegnet ist die Stätte', en: 'Devotion & Song: Blessed is the Spot' },
        durationMinutes: 10,
        description: {
          de: 'Gemeinsames Gebet und Lied zur ruhigen, ehrfürchtigen Einstimmung in die Runde.',
          en: 'Opening prayer and choral song to center the group in reverence.'
        },
        referenceType: 'song',
        referenceId: 'blessed-is-the-spot',
      },
      {
        type: 'study',
        title: { de: 'Zitatestudium: Reine Absichten', en: 'Text Study: Pure Intentions' },
        durationMinutes: 20,
        description: {
          de: 'Gemeinsames Verstehen und Memorieren mit der Methode Verschwindende Tafel.',
          en: 'Collective memorisation and understanding with the Disappearing Chalkboard method.'
        },
        referenceType: 'quote',
        referenceId: 'breezes-love-mankind',
      },
      {
        type: 'warmup',
        title: { de: 'Gruppenspiel: Schnick-Schnack-Schnuck Evolution', en: 'Group Game: RPS Evolution' },
        durationMinutes: 15,
        description: {
          de: 'Aktiver Energizer im Kreis, baut Hemmungen ab und bringt Energie und Lachen.',
          en: 'Active energizer that releases physical tension and brings laughter.'
        },
        referenceType: 'game',
        referenceId: 'ssp-evolution',
      },
      {
        type: 'arts_discussion',
        title: { de: 'Theater-Impuls: Weggabelung der Bestätigungen', en: 'Drama Prompt: The Fork in the Road' },
        durationMinutes: 20,
        description: {
          de: 'Kurze Standbilder oder Szenenspiel zur Anwendung des Zitats in realen Situationen.',
          en: 'Short skits or tableaux applying the sacred verse to daily situations.'
        },
        referenceType: 'art',
        referenceId: 'breezes-two-roads-skit',
      },
      {
        type: 'closing',
        title: { de: 'Abschlusskreis: Wort-Mind', en: 'Closing Circle: Word Mind' },
        durationMinutes: 10,
        description: {
          de: 'Ruhige Zähl-Herausforderung im Kreis und ein Gedanke für die kommende Woche.',
          en: 'Quiet mindful challenge to close in unity and reflect upon the week.'
        },
        referenceType: 'game',
        referenceId: 'wort-mind',
      },
    ],
  },
  {
    id: 'camp-120',
    name: { de: 'Camp-Abend (2 h)', en: 'Camp Evening (2 hrs)' },
    desc: {
      de: 'Andacht 10, Energizer 15, Kreativblock 45, Abendspiel 25, Reflexion 15, Abschluss 10.',
      en: 'Devotion 10, energizer 15, creative workshop 45, evening game 25, reflection 15, closing 10.'
    },
    targetDuration: 120,
    status: 'draft',
    slots: [
      {
        type: 'devotional',
        title: { de: 'Eröffnungslied & Abendandacht', en: 'Opening Choral Song & Camp Devotion' },
        durationMinutes: 10,
        description: {
          de: 'Gemeinsames Singen und ehrfürchtiges Gebet zur Eröffnung des Lagerabends.',
          en: 'Singing in the evening circle and prayer.'
        },
        referenceType: 'song',
        referenceId: 'blessed-is-the-spot',
      },
      {
        type: 'warmup',
        title: { de: 'Großgruppen-Energizer: SSP Fankurve', en: 'Large Group Energizer: RPS Arena' },
        durationMinutes: 15,
        description: {
          de: 'Wachsende Fangemeinden und pure Energie für die gesamte Lagergemeinschaft.',
          en: 'High energy arena game with growing cheer squads uniting everyone.'
        },
        referenceType: 'game',
        referenceId: 'ssp-evolution',
      },
      {
        type: 'arts_discussion',
        title: { de: 'Kreativblock: Gemeinschafts-Wandbild', en: 'Creative Workshop: Collaborative Mural' },
        durationMinutes: 45,
        description: {
          de: 'Großflächiges künstlerisches Gestalten und Vertiefen des Lagerthemas.',
          en: 'Collaborative painting exploring the camp spiritual theme.'
        },
        referenceType: 'art',
        referenceId: 'breezes-two-roads-skit',
      },
      {
        type: 'warmup',
        title: { de: 'Abendspiel: Werwölfe im Düsterwald', en: 'Evening Mystery: Werewolf' },
        durationMinutes: 25,
        description: {
          de: 'Atmosphärisches Rollen- und Deduktionsspiel in der abendlichen Runde.',
          en: 'Atmospheric social deduction in the twilight circle.'
        },
        referenceType: 'game',
        referenceId: 'werwolf',
      },
      {
        type: 'closing',
        title: { de: 'Lagerfeuer-Gespräch & Reflexion', en: 'Campfire Reflection Circle' },
        durationMinutes: 15,
        description: {
          de: 'Tagesrückblick: Momente der gegenseitigen Bestätigung und des Wachstums.',
          en: 'Review of the day: moments of mutual confirmation and personal growth.'
        },
      },
      {
        type: 'closing',
        title: { de: 'Nachtgebet & Verabschiedung', en: 'Night Prayer & Farewell' },
        durationMinutes: 10,
        description: {
          de: 'Ruhiger Segen und Ausklang in die Nachtruhe.',
          en: 'Quiet prayer and peaceful wrap-up for bedtime.'
        },
        referenceType: 'quote',
        referenceId: 'prayer-blessed-spot',
      },
    ],
  },
  {
    id: 'quick-45',
    name: { de: 'Kurz (45 Min)', en: 'Short (45 min)' },
    desc: {
      de: 'Andacht 5, Zitat 15, Spiel 15, Abschluss 10.',
      en: 'Devotion 5, quote 15, game 15, closing 10.'
    },
    targetDuration: 45,
    status: 'draft',
    slots: [
      {
        type: 'devotional',
        title: { de: 'Kurzes Eingangsgebet', en: 'Brief Opening Prayer' },
        durationMinutes: 5,
        description: {
          de: 'Ein kurzes Gebet zur inneren Sammlung aller Teilnehmenden.',
          en: 'A short prayer for centering the group.'
        },
        referenceType: 'quote',
        referenceId: 'prayer-pure-heart',
      },
      {
        type: 'study',
        title: { de: 'Zitatestudium & Erstbuchstaben', en: 'Scripture Study & Initial Letters' },
        durationMinutes: 15,
        description: {
          de: 'Kompakte Erarbeitung eines Zitats mit aktiver Abrufpraxis.',
          en: 'Compact quote study with active retrieval practice.'
        },
        referenceType: 'quote',
        referenceId: 'breezes-brother-selflessness',
      },
      {
        type: 'warmup',
        title: { de: 'Reaktionsspiel: Ninja', en: 'Reaction Duel: Ninja' },
        durationMinutes: 15,
        description: {
          de: 'Schnelle Runden für Fokus, Koordination und Spaß im Kreis.',
          en: 'Quick standing rounds for focus and alertness in the circle.'
        },
        referenceType: 'game',
        referenceId: 'ninja',
      },
      {
        type: 'closing',
        title: { de: 'Reflexionsrunde & Ausklang', en: 'Reflection Round & Departure' },
        durationMinutes: 10,
        description: {
          de: 'Ein prägender Gedanke oder eine Frage für die kommende Woche.',
          en: 'A key insight or thought for the week ahead.'
        },
      },
    ],
  },
  {
    id: 'camp-day-180',
    name: { de: 'Camp-Tag mit Programm (3 h)', en: 'Camp Day with Program (3 hrs)' },
    desc: {
      de: 'Morgenimpuls 15, Vertiefung 45, Teamaufgaben 30, Umweltdienst 60, Ausklang 30.',
      en: 'Morning devotion 15, text study 45, team challenges 30, service 60, wrap-up 30.'
    },
    targetDuration: 180,
    status: 'draft',
    slots: [
      {
        type: 'devotional',
        title: { de: 'Morgenimpuls & Lieder', en: 'Morning Devotion & Songs' },
        durationMinutes: 15,
        description: {
          de: 'Inspirierender Tagesstart mit gemeinsamen Liedern und Gebeten.',
          en: 'Inspiring start with songs and prayers.'
        },
        referenceType: 'song',
        referenceId: 'blessed-is-the-spot',
      },
      {
        type: 'study',
        title: { de: 'Vertiefungsblock: Textstudium im Plenum', en: 'Study Session: Text Deepening' },
        durationMinutes: 45,
        description: {
          de: 'Gemeinsames Erarbeiten des Zitats in Kleingruppen mit Lernmethoden.',
          en: 'Studying the sacred text in small groups.'
        },
        referenceType: 'quote',
        referenceId: 'breezes-love-mankind',
      },
      {
        type: 'warmup',
        title: { de: 'Kooperations-Parcours & Spiele', en: 'Cooperative Challenge & Games' },
        durationMinutes: 30,
        description: {
          de: 'Aktive Teamaufgaben im Freien zur Stärkung des Gruppenzusammenhalts.',
          en: 'Active outdoor cooperative challenges.'
        },
        referenceType: 'game',
        referenceId: 'ssp-evolution',
      },
      {
        type: 'service',
        title: { de: 'Praktischer Einsatz: Umweltdienst im Stadtteil', en: 'Hands-on Service: Ecological Clean-up' },
        durationMinutes: 60,
        description: {
          de: 'Gemeinsame Aktion für die Nachbarschaft oder das Camp-Gelände mit Müll-Audit.',
          en: 'Neighborhood service project and trash audit.'
        },
        referenceType: 'service',
        referenceId: 'trash-audit-cleanup',
      },
      {
        type: 'closing',
        title: { de: 'Erfahrungs-Austausch & Tagesabschluss', en: 'Sharing Circle & Daily Conclusion' },
        durationMinutes: 30,
        description: {
          de: 'Gemeinsame Auswertung der Lernerfahrungen und Abschlussgebet.',
          en: 'Consultation on learnings and final prayers.'
        },
      },
    ],
  },
];

export const SessionBuilder: React.FC<SessionBuilderProps> = ({
  language,
  favorites = [],
}) => {
  const t = UI_TRANSLATIONS[language];
  const {
    plans,
    activePlan,
    activePlanId,
    setActivePlanId,
    createNewPlan,
    deletePlan,
    renamePlan,
    updatePlanMeta,
    duplicatePlan,
    addSlotToPlan,
    updateSlot,
    removeSlot,
    reorderSlots,
    duplicateSlot,
    clearActivePlan,
    loadPresetIntoPlan,
  } = usePlanner();
  const { showToast } = useToast();

  // Local UI states
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [isMyPlansOpen, setIsMyPlansOpen] = useState(false);
  const [isPackingListOpen, setIsPackingListOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Resource preview modal state
  const [previewItem, setPreviewItem] = useState<{
    type: 'game' | 'quote' | 'song' | 'service' | 'art' | 'method';
    id: string;
  } | null>(null);

  // Picker states
  const [pickerTab, setPickerTab] = useState<'devotional' | 'study' | 'games' | 'service_arts' | 'saved'>('games');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerGameDuration, setPickerGameDuration] = useState<'all' | '10' | '20'>('all');
  const [pickerGameGroupSize, setPickerGameGroupSize] = useState<'all' | 'small' | 'large'>('all');
  const [pickerCampOnly, setPickerCampOnly] = useState(false);

  // "Durchführen" (Run/Execution) Mode State
  const [isRunningMode, setIsRunningMode] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  // Drag & Drop + Keyboard Reordering State
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState<string>('');

  // Packed checklist items in localStorage
  const packedStorageKey = useMemo(() => `jy_packed_items_${activePlan?.id || 'default'}`, [activePlan?.id]);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(packedStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(packedStorageKey, JSON.stringify(packedItems));
    } catch {
      // ignore
    }
  }, [packedItems, packedStorageKey]);

  // URL Import check on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      const imported = decodePlanFromShareParam(planParam);
      if (imported && imported.slots.length > 0) {
        const created = createNewPlan(
          imported.name,
          imported.slots,
          imported.targetDurationMinutes,
          imported.startTime
        );
        setActivePlanId(created.id);
        showToast({ text: t.treffenPlanImported });
        // remove parameter from URL cleanly
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, [createNewPlan, setActivePlanId, showToast, t.treffenPlanImported]);

  // Fallback: If no plan exists, initialize one
  useEffect(() => {
    if (plans.length === 0) {
      createNewPlan(language === 'de' ? 'Mein Treffen' : 'My Gathering');
    }
  }, [plans.length, createNewPlan, language]);

  const slots = useMemo(() => activePlan?.slots || [], [activePlan?.slots]);
  const totalMinutes = useMemo(() => slots.reduce((acc, s) => acc + s.durationMinutes, 0), [slots]);
  const targetDuration = activePlan?.targetDurationMinutes || 75;
  const startTime = activePlan?.startTime || '17:00';
  const durationDiff = totalMinutes - targetDuration;

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

  // Countdown timer for active block in "Durchführen" mode
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

  const handleApplyPreset = (preset: GatheringPreset) => {
    loadPresetIntoPlan(
      preset.slots as SessionSlot[],
      preset.name[language],
      preset.targetDuration
    );
    setIsTemplateDialogOpen(false);
    showToast({
      text: language === 'de' ? `Vorlage „${preset.name.de}“ geladen` : `Template "${preset.name.en}" loaded`,
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    const result = removeSlot(slotId);
    showToast({
      text: t.treffenSlotRemoved,
      undo: {
        label: t.treffenUndo,
        onClick: () => result.undo(),
      },
    });
  };

  const handleClearAll = () => {
    if (window.confirm(t.treffenClearConfirm)) {
      const result = clearActivePlan();
      showToast({
        text: language === 'de' ? 'Treffen geleert' : 'Gathering cleared',
        undo: {
          label: t.treffenUndo,
          onClick: () => result.undo(),
        },
      });
    }
  };

  // Open resource picker
  const handleOpenPicker = (slotId?: string, defaultType?: SessionSlotType) => {
    setEditingSlotId(slotId || null);
    setPickerSearch('');

    // Determine initial tab from slot type
    const slot = slotId ? slots.find((s) => s.id === slotId) : null;
    const type = slot?.type || defaultType;

    if (type === 'devotional') {
      setPickerTab('devotional');
    } else if (type === 'study') {
      setPickerTab('study');
    } else if (type === 'service' || type === 'arts_discussion') {
      setPickerTab('service_arts');
    } else {
      setPickerTab('games');
    }

    setIsPickerOpen(true);
  };

  // Slot type badge helper
  const renderSlotTypeBadge = (type: SessionSlotType) => {
    switch (type) {
      case 'devotional':
        return <Badge category="devotional" size="sm" icon={<BookOpen className="w-3 h-3" />}>{t.treffenBlockAndacht}</Badge>;
      case 'study':
        return <Badge category="study" size="sm" icon={<Sparkles className="w-3 h-3" />}>{t.treffenBlockZitat}</Badge>;
      case 'warmup':
        return <Badge category="energizer" size="sm" icon={<Smile className="w-3 h-3" />}>{t.treffenBlockSpiel}</Badge>;
      case 'service':
        return <Badge category="service" size="sm" icon={<HeartHandshake className="w-3 h-3" />}>{t.treffenBlockDienstKunst}</Badge>;
      case 'arts_discussion':
        return <Badge category="arts" size="sm" icon={<Palette className="w-3 h-3" />}>{t.treffenBlockDienstKunst}</Badge>;
      case 'closing':
        return <Badge category="social" size="sm" icon={<SunMedium className="w-3 h-3" />}>{t.treffenBlockAbschluss}</Badge>;
      case 'custom':
      default:
        return <Badge category="neutral" size="sm" icon={<Clock className="w-3 h-3" />}>{t.treffenBlockFrei}</Badge>;
    }
  };

  // Mini rhythm bar for presets
  const renderPresetRhythmBar = (presetSlots: Array<Omit<SessionSlot, 'id'>>) => {
    const presetTotal = presetSlots.reduce((sum, s) => sum + s.durationMinutes, 0) || 1;
    return (
      <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5 bg-surface-2 border border-line/40 my-2">
        {presetSlots.map((s, idx) => {
          const theme = SLOT_CATEGORY_THEME[s.type] || SLOT_CATEGORY_THEME.custom;
          const widthPct = (s.durationMinutes / presetTotal) * 100;
          return (
            <div
              key={idx}
              style={{ width: `${widthPct}%`, backgroundColor: theme.hex }}
              title={`${s.title[language] || s.title.de}: ${s.durationMinutes} Min.`}
              className="h-full transition-all"
            />
          );
        })}
      </div>
    );
  };

  // Resolve materials across all slots in active plan
  const gatheredMaterials = useMemo(() => {
    const list: Array<{ name: string; sourceTitle: string; id: string }> = [];
    const seen = new Set<string>();

    slots.forEach((slot, idx) => {
      let rawMaterials: string[] = [];

      if (slot.materials && slot.materials[language]) {
        rawMaterials = slot.materials[language];
      } else if (slot.referenceType === 'game' && slot.referenceId) {
        const game = GAMES_DATA.find((g) => g.id === slot.referenceId);
        if (game?.materials && game.materials[language]) rawMaterials = game.materials[language];
      } else if (slot.referenceType === 'method' && slot.referenceId) {
        const method = QUOTE_METHODS_DATA.find((m) => m.id === slot.referenceId);
        if (method?.materials && method.materials[language]) rawMaterials = method.materials[language];
      } else if (slot.referenceType === 'service' && slot.referenceId) {
        const proj = SERVICE_PROJECTS_DATA.find((p) => p.id === slot.referenceId);
        if (proj?.materials && proj.materials[language]) rawMaterials = proj.materials[language];
      } else if (slot.referenceType === 'art' && slot.referenceId) {
        const art = ARTS_PROMPTS_DATA.find((a) => a.id === slot.referenceId);
        if (art?.materials && art.materials[language]) rawMaterials = art.materials[language];
      }

      rawMaterials.forEach((item) => {
        const trimmed = item.trim();
        // filter trivial items like "Keine", "None", "-"
        if (trimmed && !trimmed.match(/^(keine|kein material|none|-)$/i)) {
          const key = trimmed.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            list.push({
              name: trimmed,
              sourceTitle: slot.title[language],
              id: `mat-${idx}-${trimmed}`,
            });
          }
        }
      });
    });

    return list;
  }, [slots, language]);

  // Formatted Agenda for WhatsApp or Clipboard
  const agendaText = useMemo(() => {
    if (!activePlan) return '';
    const header = `*${activePlan.name}*\n` +
      `🕒 ${startTime} · ${totalMinutes} Min. (${slots.length} ${t.treffenTitle})\n\n`;
    const body = slots.map((s, idx) => {
      const times = getSlotTimeRange(startTime, idx, slots);
      return `${times.start}–${times.end} [${s.durationMinutes}′] *${s.title[language]}*\n${s.description[language]}`;
    }).join('\n\n');
    return header + body;
  }, [activePlan, slots, totalMinutes, startTime, language, t.treffenTitle]);

  const handleCopyAgenda = async () => {
    try {
      await navigator.clipboard.writeText(agendaText);
      showToast({ text: t.treffenCopied });
    } catch {
      // fallback
    }
  };

  const handleShareLink = async () => {
    if (!activePlan) return;
    const url = encodePlanToShareUrl(activePlan);
    const result = await shareResource({
      title: activePlan.name,
      text: `${activePlan.name} (${totalMinutes} Min.) – Junior Youth Hub`,
      url,
    });
    if (result.method === 'clipboard') {
      showToast({ text: t.treffenShareLinkCopied });
    }
  };

  const whatsappLink = generateWhatsAppLink(agendaText);

  // Filtered items in resource picker
  const filteredPrayers = useMemo(() => {
    return QUOTES_DATA.filter((q) => {
      const isPrayer = q.mainBook?.de === 'Gebete & Andacht' || q.book?.de === 'Gebete & Andacht';
      if (!isPrayer) return false;
      const text = language === 'de' ? q.textDe : q.textEn;
      const section = q.section ? q.section[language] : (q.book ? q.book[language] : '');
      const theme = q.theme ? q.theme[language] : '';
      if (!pickerSearch) return true;
      const s = pickerSearch.toLowerCase();
      return text.toLowerCase().includes(s) || section.toLowerCase().includes(s) || theme.toLowerCase().includes(s);
    });
  }, [pickerSearch, language]);

  const filteredSongs = useMemo(() => {
    return DEVOTIONAL_SONGS_DATA.filter((s) => {
      if (!pickerSearch) return true;
      return (
        s.title[language].toLowerCase().includes(pickerSearch.toLowerCase()) ||
        s.theme[language].toLowerCase().includes(pickerSearch.toLowerCase())
      );
    });
  }, [pickerSearch, language]);

  const filteredQuotes = useMemo(() => {
    return QUOTES_DATA.filter((q) => {
      const isPrayer = q.mainBook?.de === 'Gebete & Andacht' || q.book?.de === 'Gebete & Andacht';
      if (isPrayer) return false;
      if (!pickerSearch) return true;
      const text = language === 'de' ? q.textDe : q.textEn;
      const mainBook = q.mainBook ? q.mainBook[language] : q.book[language];
      const section = q.section ? q.section[language] : '';
      const s = pickerSearch.toLowerCase();
      return text.toLowerCase().includes(s) || mainBook.toLowerCase().includes(s) || section.toLowerCase().includes(s);
    });
  }, [pickerSearch, language]);

  const filteredMethods = useMemo(() => {
    return QUOTE_METHODS_DATA.filter((m) => {
      if (!pickerSearch) return true;
      return (
        m.name[language].toLowerCase().includes(pickerSearch.toLowerCase()) ||
        m.summary[language].toLowerCase().includes(pickerSearch.toLowerCase())
      );
    });
  }, [pickerSearch, language]);

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter((g) => {
      if (pickerGameDuration === '10' && g.durationMax > 15) return false;
      if (pickerGameDuration === '20' && (g.durationMin < 15 || g.durationMax > 25)) return false;
      if (pickerGameGroupSize === 'small' && g.groupSize.min > 8) return false;
      if (pickerGameGroupSize === 'large' && g.groupSize.max < 15) return false;
      if (!pickerSearch) return true;
      return (
        g.title[language].toLowerCase().includes(pickerSearch.toLowerCase()) ||
        g.summary[language].toLowerCase().includes(pickerSearch.toLowerCase())
      );
    });
  }, [pickerSearch, pickerGameDuration, pickerGameGroupSize, language]);

  const filteredServices = useMemo(() => {
    return SERVICE_PROJECTS_DATA.filter((p) => {
      if (pickerCampOnly && p.occasion !== 'camp' && p.occasion !== 'beides') return false;
      if (!pickerSearch) return true;
      return (
        p.title[language].toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.objective[language].toLowerCase().includes(pickerSearch.toLowerCase())
      );
    });
  }, [pickerSearch, pickerCampOnly, language]);

  const filteredArts = useMemo(() => {
    return ARTS_PROMPTS_DATA.filter((a) => {
      if (pickerCampOnly && a.occasion !== 'camp' && a.occasion !== 'beides') return false;
      if (!pickerSearch) return true;
      return (
        a.title[language].toLowerCase().includes(pickerSearch.toLowerCase()) ||
        a.description[language].toLowerCase().includes(pickerSearch.toLowerCase())
      );
    });
  }, [pickerSearch, pickerCampOnly, language]);

  // Handle selecting an item from the picker
  const handleSelectResource = (item: {
    title: LocalizedString;
    description: LocalizedString;
    type: SessionSlotType;
    refId: string;
    refType: 'game' | 'quote' | 'method' | 'song' | 'service' | 'art';
    duration?: number;
    materials?: { de: string[]; en: string[] };
  }) => {
    if (editingSlotId) {
      updateSlot(editingSlotId, {
        title: item.title,
        description: item.description,
        type: item.type,
        referenceId: item.refId,
        referenceType: item.refType,
        durationMinutes: item.duration || 15,
        materials: item.materials,
      });
      showToast({ text: t.treffenSlotUpdated });
    } else {
      addSlotToPlan({
        type: item.type,
        title: item.title,
        description: item.description,
        durationMinutes: item.duration || 15,
        referenceId: item.refId,
        referenceType: item.refType,
        materials: item.materials,
      });
      showToast({ text: t.treffenSlotAdded });
    }
    setIsPickerOpen(false);
  };

  // Add a blank slot of specific type
  const handleAddBlankSlot = (type: SessionSlotType) => {
    const titles: Record<SessionSlotType, { de: string; en: string }> = {
      devotional: { de: 'Andacht & Gebet', en: 'Devotion & Prayer' },
      study: { de: 'Zitatestudium & Lernen', en: 'Text Study & Practice' },
      warmup: { de: 'Spiel & Energizer', en: 'Game & Energizer' },
      service: { de: 'Gemeindedienst', en: 'Community Service' },
      arts_discussion: { de: 'Kreatives Gestalten & Kunst', en: 'Creative Expression & Arts' },
      closing: { de: 'Abschlusskreis & Reflexion', en: 'Closing Circle & Reflection' },
      custom: { de: 'Freier Baustein', en: 'Custom Block' },
    };
    addSlotToPlan({
      type,
      title: titles[type] || { de: 'Neuer Baustein', en: 'New Block' },
      description: { de: '', en: '' },
      durationMinutes: 15,
    });
    showToast({ text: t.treffenSlotAdded });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">

      {/* ==================================================== */}
      {/* 1. PRINTABLE ONE-PAGE VIEW (Shown exclusively in @media print) */}
      {/* ==================================================== */}
      <div className="hidden print:block font-sans text-black leading-snug p-2">
        <div className="border-b-2 border-black pb-3 mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{activePlan?.name || 'Ablaufplan'}</h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Junior Youth Hub · {language === 'de' ? 'Beginn:' : 'Start:'} {startTime} Uhr · {totalMinutes} Min. ({slots.length} {t.treffenTitle})
            </p>
          </div>
          <div className="text-right text-2xs text-neutral-500">
            {new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>

        {/* Schedule Table */}
        <table className="w-full text-left text-xs border-collapse mb-5">
          <thead>
            <tr className="border-b border-black text-2xs uppercase tracking-wider font-bold">
              <th className="py-1.5 pr-2 w-20">{language === 'de' ? 'Zeit' : 'Time'}</th>
              <th className="py-1.5 px-2 w-16">{language === 'de' ? 'Dauer' : 'Duration'}</th>
              <th className="py-1.5 px-2">{language === 'de' ? 'Baustein & Inhalt' : 'Block & Content'}</th>
              <th className="py-1.5 pl-2 w-36">{language === 'de' ? 'Material' : 'Materials'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {slots.map((slot, idx) => {
              const times = getSlotTimeRange(startTime, idx, slots);
              return (
                <tr key={slot.id} className="align-top py-2">
                  <td className="py-2 pr-2 font-mono font-bold text-neutral-800 whitespace-nowrap">
                    {times.start}–{times.end}
                  </td>
                  <td className="py-2 px-2 text-neutral-600 font-medium whitespace-nowrap">
                    {slot.durationMinutes}′
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-bold text-black">{slot.title[language]}</div>
                    {slot.description[language] && (
                      <div className="text-2xs text-neutral-600 mt-0.5">{slot.description[language]}</div>
                    )}
                  </td>
                  <td className="py-2 pl-2 text-2xs text-neutral-600">
                    {slot.materials && slot.materials[language]?.join(', ') || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Packing Checklist in Print */}
        {gatheredMaterials.length > 0 && (
          <div className="border-t border-black pt-3 mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
              {t.treffenPackingList} ({gatheredMaterials.length})
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-neutral-800">
              {gatheredMaterials.map((mat) => (
                <div key={mat.id} className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-black rounded-xs inline-block shrink-0" />
                  <span className="truncate">{mat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 2. PLAN HEADER & TOOLBAR (Screen View) */}
      {/* ==================================================== */}
      <div className="bg-surface rounded-card border border-border p-5 sm:p-6 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Plan Title & Renaming */}
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-text">
                {t.treffenTitle}
              </span>
              <span className="text-text-tertiary">•</span>
              <span className="text-xs font-medium text-text-secondary">
                {slots.length} {language === 'de' ? 'Bausteine' : 'blocks'} · {totalMinutes} Min.
              </span>
            </div>

            {isRenaming ? (
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  className="px-3.5 py-1.5 text-base font-bold rounded-control bg-surface-2 border border-border text-text focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nameInput.trim() && activePlan) {
                      renamePlan(activePlan.id, nameInput.trim());
                    }
                    setIsRenaming(false);
                  }}
                  className="px-3 py-2 rounded-control bg-accent text-accent-contrast text-xs font-bold cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight truncate">
                  {activePlan?.name || (language === 'de' ? 'Mein Treffen' : 'My Gathering')}
                </h1>
                <IconButton
                  label={language === 'de' ? 'Name ändern' : 'Rename gathering'}
                  onClick={() => {
                    setNameInput(activePlan?.name || '');
                    setIsRenaming(true);
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-text-tertiary hover:text-text"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </IconButton>
              </div>
            )}
            <p className="text-xs text-text-secondary line-clamp-1">
              {t.treffenSubtitle}
            </p>
          </div>

          {/* Primary Action: "Treffen starten" */}
          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={slots.length === 0}
                title={slots.length === 0 ? t.treffenStartDisabledHint : undefined}
                aria-describedby={slots.length === 0 ? 'treffen-start-hint' : undefined}
                onClick={handleStartRunMode}
                className="px-4 py-2.5 rounded-control bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.treffenStartLive}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTemplateDialogOpen(true)}
                className="px-3.5 py-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px]"
              >
                {t.treffenChoosePreset}
              </button>

              <button
                type="button"
                onClick={() => setIsMyPlansOpen(true)}
                className="px-3 py-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-medium text-text-secondary hover:text-text transition-colors cursor-pointer min-h-[44px] flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.treffenMyPlans}</span>
              </button>
            </div>
            {slots.length === 0 && (
              <p id="treffen-start-hint" className="text-2xs text-text-secondary">
                {t.treffenStartDisabledHint}
              </p>
            )}
          </div>

        </div>

        {/* Schedule Meta Controls: Start Time & Duration Target */}
        {slots.length > 0 && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Start Time input */}
              <div className="flex items-center gap-2 bg-surface-2 px-3 py-1.5 rounded-control border border-border">
                <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="font-semibold text-text-secondary">{t.treffenStartTime}:</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    if (activePlan) {
                      updatePlanMeta(activePlan.id, { startTime: e.target.value });
                    }
                  }}
                  className="bg-transparent font-bold text-text focus:outline-hidden cursor-pointer"
                />
              </div>

              {/* Target Duration Selector */}
              <div className="flex items-center gap-2 bg-surface-2 px-3 py-1.5 rounded-control border border-border">
                <span className="font-semibold text-text-secondary">{t.treffenTargetDuration}:</span>
                <select
                  value={targetDuration}
                  onChange={(e) => {
                    if (activePlan) {
                      updatePlanMeta(activePlan.id, { targetDurationMinutes: parseInt(e.target.value, 10) || 75 });
                    }
                  }}
                  className="bg-transparent font-bold text-text focus:outline-hidden cursor-pointer"
                >
                  <option value={45}>45 Min.</option>
                  <option value={60}>60 Min.</option>
                  <option value={75}>75 Min.</option>
                  <option value={90}>90 Min.</option>
                  <option value={120}>120 Min. (2 h)</option>
                  <option value={180}>180 Min. (3 h)</option>
                </select>
              </div>

              {/* Total Duration vs. Target Diff Badge */}
              <div className="flex items-center gap-1.5">
                {durationDiff > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-amber-500/15 text-amber-800 dark:text-amber-200 font-semibold text-2xs border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>+{durationDiff} Min. ({t.treffenOverTimeWarning})</span>
                  </span>
                ) : durationDiff < 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-accent-subtle text-accent-text font-semibold text-2xs">
                    <span>{durationDiff} Min. ({t.treffenUnderTimeWarning})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-semibold text-2xs">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.treffenExactTime} ({totalMinutes} Min.)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions (Packliste, Share, Print) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPackingListOpen(true)}
                className="px-2.5 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-semibold text-2xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
              >
                <CheckSquare className="w-3.5 h-3.5 text-accent-text" />
                <span>{t.treffenPackingList} {gatheredMaterials.length > 0 && `(${gatheredMaterials.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-2.5 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-semibold text-2xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
              >
                <Share2 className="w-3.5 h-3.5 text-text-tertiary" />
                <span>{t.treffenSharePlan}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-text font-semibold text-2xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5 text-text-tertiary" />
                <span>{t.treffenPrintPlan}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 3. EMPTY STATE: 4 GUIDED PRESETS (No empty void) */}
      {/* ==================================================== */}
      {slots.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-6 sm:p-10 shadow-xs text-center space-y-6 print:hidden">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-text flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-accent-text shrink-0" />
              <span>{language === 'de' ? 'Ablauf mit einem Klick starten' : 'Start your gathering with one tap'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              {language === 'de'
                ? 'Wähle einen erprobten Ablauf. Jeder Baustein lässt sich danach mit einem Fingertipp anpassen.'
                : 'Choose a proven gathering arc. Every block can be tailored with a single tap.'}
            </p>
          </div>

          {/* 4 Large Preset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-3xl mx-auto text-left">
            {GATHERING_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-4 sm:p-5 rounded-card bg-surface-2 hover:bg-surface-raised border border-border hover:border-accent/40 text-left transition-all flex flex-col justify-between group min-h-[140px] cursor-pointer"
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                      {preset.name[language]}
                    </span>
                    <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-control bg-surface border border-line text-text-secondary shrink-0">
                      {preset.targetDuration} Min.
                    </span>
                  </div>
                  {renderPresetRhythmBar(preset.slots)}
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {preset.desc[language]}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-2xs font-semibold text-accent-text mt-3">
                  <span>{language === 'de' ? 'Vorlage übernehmen' : 'Apply template'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          {/* Blank start option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleAddBlankSlot('devotional')}
              className="text-xs font-medium text-text-tertiary hover:text-text transition-colors underline cursor-pointer min-h-[36px] px-2"
            >
              {t.treffenPresetEmptyDesc} ({t.treffenPresetEmpty})
            </button>
          </div>
        </div>
      ) : (
        /* ==================================================== */
        /* 4. PROPORTIONAL TIMELINE & VERTICAL SLOTS (Drag & Drop + Keyboard ArrowUp/ArrowDown) */
        /* ==================================================== */
        <div className="space-y-4 print:hidden">
          {/* Proportional Session Timeline Bar */}
          <div className="bg-surface rounded-card border border-line p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xs uppercase tracking-wider text-text-tertiary font-bold">
                  {language === 'de' ? 'Ablauf-Rhythmus' : 'Gathering Arc'}
                </span>
                <span className="text-text-tertiary">·</span>
                <span className="font-mono font-semibold text-text">
                  {startTime} – {minutesToTimeString(parseTimeToMinutes(startTime) + totalMinutes)}
                </span>
              </div>
              <span className="font-mono text-2xs text-text-secondary">
                {totalMinutes} / {targetDuration} Min.
              </span>
            </div>

            {/* The Proportional Segmented Bar */}
            <div
              role="region"
              aria-label={language === 'de' ? 'Proportionale Zeitachse des Treffens' : 'Proportional gathering timeline'}
              className="relative w-full h-11 rounded-control overflow-hidden flex gap-1 bg-surface-2 p-1 border border-line"
            >
              {slots.map((slot, idx) => {
                const widthPct = (slot.durationMinutes / (totalMinutes || 1)) * 100;
                const theme = SLOT_CATEGORY_THEME[slot.type] || SLOT_CATEGORY_THEME.custom;
                const times = getSlotTimeRange(startTime, idx, slots);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      const el = document.querySelector(`[data-slot-id="${slot.id}"]`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-2', 'ring-accent');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-accent'), 1500);
                      }
                    }}
                    title={`${slot.title[language] || slot.title.de} (${times.start}–${times.end}, ${slot.durationMinutes} Min.)`}
                    style={{ width: `${widthPct}%`, minWidth: '28px' }}
                    className="group relative h-full rounded-xs transition-all hover:brightness-110 flex items-center justify-center px-1 overflow-hidden focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                  >
                    <div
                      className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: theme.hex }}
                    />
                    <div className="relative z-10 text-center truncate px-0.5 pointer-events-none">
                      <span className="text-2xs font-mono font-bold leading-none text-white drop-shadow-xs block truncate">
                        {widthPct > 10 ? `${slot.durationMinutes}′` : ''}
                      </span>
                      {widthPct > 16 && (
                        <span className="text-3xs font-sans font-medium leading-none text-white/90 drop-shadow-xs block truncate mt-0.5">
                          {theme.label[language]}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend pills under the timeline */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-2xs text-text-secondary font-mono">
              {Array.from(new Set(slots.map((s) => s.type))).map((type) => {
                const theme = SLOT_CATEGORY_THEME[type] || SLOT_CATEGORY_THEME.custom;
                const count = slots.filter((s) => s.type === type).length;
                const typeMins = slots.filter((s) => s.type === type).reduce((sum, s) => sum + s.durationMinutes, 0);
                return (
                  <div key={type} className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: theme.hex }}
                    />
                    <span>
                      {theme.label[language]}: <strong className="text-text font-bold">{typeMins}′</strong> ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {reorderAnnouncement}
          </div>
          {slots.map((slot, index) => {
            const timeRange = getSlotTimeRange(startTime, index, slots);
            const isDragged = draggedSlotIndex === index;
            const isDragOver = dragOverSlotIndex === index && draggedSlotIndex !== index;
            const theme = SLOT_CATEGORY_THEME[slot.type] || SLOT_CATEGORY_THEME.custom;

            const handleMoveSlot = (fromIdx: number, toIdx: number) => {
              if (toIdx < 0 || toIdx >= slots.length || fromIdx === toIdx) return;
              reorderSlots(fromIdx, toIdx);
              setReorderAnnouncement(
                language === 'de'
                  ? `Baustein „${slot.title.de}“ auf Position ${toIdx + 1} verschoben.`
                  : `Moved "${slot.title.en}" to position ${toIdx + 1}.`
              );
            };

            return (
              <div
                key={slot.id}
                data-slot-id={slot.id}
                draggable
                onDragStart={(e) => {
                  setDraggedSlotIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', String(index));
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverSlotIndex !== index) {
                    setDragOverSlotIndex(index);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIdx = draggedSlotIndex !== null ? draggedSlotIndex : Number(e.dataTransfer.getData('text/plain'));
                  if (!isNaN(fromIdx) && fromIdx !== index) {
                    handleMoveSlot(fromIdx, index);
                  }
                  setDraggedSlotIndex(null);
                  setDragOverSlotIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedSlotIndex(null);
                  setDragOverSlotIndex(null);
                }}
                onKeyDown={(e) => {
                  const tag = (e.target as HTMLElement)?.tagName;
                  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
                  if (e.key === 'ArrowUp' && index > 0) {
                    e.preventDefault();
                    handleMoveSlot(index, index - 1);
                  } else if (e.key === 'ArrowDown' && index < slots.length - 1) {
                    e.preventDefault();
                    handleMoveSlot(index, index + 1);
                  }
                }}
                style={{ borderLeftColor: theme.hex, borderLeftWidth: '4px' }}
                className={`bg-surface rounded-card border p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDragged
                    ? 'opacity-50 border-accent'
                    : isDragOver
                    ? 'border-accent ring-2 ring-accent/30'
                    : 'border-line hover:border-accent/40'
                }`}
              >
                {/* Left: Drag Handle + Clock Time Pill + Content */}
                <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  {/* Accessible Drag / Keyboard Reorder Handle */}
                  <button
                    type="button"
                    aria-label={
                      language === 'de'
                        ? `Baustein ${index + 1} (${slot.title.de}) verschieben – Pfeiltasten hoch/runter oder ziehen`
                        : `Reorder block ${index + 1} (${slot.title.en}) – use Up/Down arrow keys or drag`
                    }
                    title={
                      language === 'de'
                        ? 'Ziehen oder mit Pfeiltasten ↑/↓ sortieren'
                        : 'Drag or use ↑/↓ arrow keys to reorder'
                    }
                    className="min-w-[36px] min-h-[44px] flex items-center justify-center rounded-control text-text-tertiary hover:text-text hover:bg-surface-2 cursor-grab active:cursor-grabbing shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  {/* Time Badge (Calculated from Start Time) */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-20 py-1 px-1.5 rounded-control bg-surface-2 border border-border text-center">
                    <span className="text-xs font-mono font-bold text-text whitespace-nowrap">
                      {timeRange.start}
                    </span>
                    <span className="text-2xs font-mono text-text-tertiary whitespace-nowrap">
                      bis {timeRange.end}
                    </span>
                  </div>

                  {/* Slot Main Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderSlotTypeBadge(slot.type)}
                      <span className="text-2xs font-semibold text-text-tertiary">
                        #{index + 1}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-text truncate">
                      {slot.title[language]}
                    </h3>

                    {slot.description[language] && (
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {slot.description[language]}
                      </p>
                    )}

                    {/* Linked Resource Launcher */}
                    {slot.referenceType && slot.referenceId && (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewItem({ type: slot.referenceType as 'game' | 'quote' | 'song' | 'service' | 'art' | 'method', id: slot.referenceId as string })}
                          className="inline-flex items-center gap-1.5 text-2xs font-semibold text-accent-text hover:underline cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>
                            {slot.referenceType === 'game' && (language === 'de' ? 'Spielregeln ansehen' : 'View game rules')}
                            {slot.referenceType === 'quote' && (language === 'de' ? 'Heiliges Zitat lesen' : 'Read holy verse')}
                            {slot.referenceType === 'song' && (language === 'de' ? 'Lied auf BahaiSongs' : 'Listen on BahaiSongs')}
                            {slot.referenceType === 'service' && (language === 'de' ? 'Dienst-Anleitung' : 'Service project guide')}
                            {slot.referenceType === 'art' && (language === 'de' ? 'Kunst-Impuls' : 'Arts prompt')}
                            {slot.referenceType === 'method' && (language === 'de' ? 'Lernmethode' : 'Memorisation method')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right: Duration Stepper + Slot Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  
                  {/* Duration Stepper (- / + 5 Min, min 44px touch targets) */}
                  <div className="flex items-center gap-1 bg-surface-2 rounded-control p-1 border border-border">
                    <IconButton
                      label={language === 'de' ? 'Dauer um 5 Min. verringern' : 'Decrease duration by 5 min'}
                      onClick={() => updateSlot(slot.id, { durationMinutes: Math.max(5, slot.durationMinutes - 5) })}
                      size="sm"
                      variant="ghost"
                      className="text-text hover:bg-surface font-bold text-sm"
                    >
                      -
                    </IconButton>
                    <span className="text-xs font-bold px-1.5 text-text min-w-[38px] text-center font-mono">
                      {slot.durationMinutes}′
                    </span>
                    <IconButton
                      label={language === 'de' ? 'Dauer um 5 Min. erhöhen' : 'Increase duration by 5 min'}
                      onClick={() => updateSlot(slot.id, { durationMinutes: slot.durationMinutes + 5 })}
                      size="sm"
                      variant="ghost"
                      className="text-text hover:bg-surface font-bold text-sm"
                    >
                      +
                    </IconButton>
                  </div>

                  {/* "Tauschen / Auswählen" Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenPicker(slot.id)}
                    className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[44px]"
                  >
                    {t.treffenSwapResource}
                  </button>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-0.5">
                    <IconButton
                      label={t.treffenMoveUp}
                      disabled={index === 0}
                      onClick={() => handleMoveSlot(index, index - 1)}
                      size="sm"
                      variant="ghost"
                      className="text-text-tertiary hover:text-text disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </IconButton>
                    <IconButton
                      label={t.treffenMoveDown}
                      disabled={index === slots.length - 1}
                      onClick={() => handleMoveSlot(index, index + 1)}
                      size="sm"
                      variant="ghost"
                      className="text-text-tertiary hover:text-text disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>

                  {/* Duplicate Slot */}
                  <IconButton
                    label={t.treffenDuplicateSlot}
                    onClick={() => duplicateSlot(slot.id)}
                    size="sm"
                    variant="ghost"
                    className="text-text-tertiary hover:text-text"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </IconButton>

                  {/* Delete Slot with Undo */}
                  <IconButton
                    label={t.treffenDeleteSlot}
                    onClick={() => handleDeleteSlot(slot.id)}
                    size="sm"
                    variant="ghost"
                    className="text-text-tertiary hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconButton>

                </div>

              </div>
            );
          })}

          {/* Add Block Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPicker()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-control bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>{t.treffenAddBlock}</span>
              </button>

              {/* Quick type adder buttons */}
              <button
                type="button"
                onClick={() => handleAddBlankSlot('devotional')}
                className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text transition-colors min-h-[38px]"
              >
                + {t.treffenBlockAndacht}
              </button>
              <button
                type="button"
                onClick={() => handleAddBlankSlot('study')}
                className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text transition-colors min-h-[38px]"
              >
                + {t.treffenBlockZitat}
              </button>
              <button
                type="button"
                onClick={() => handleAddBlankSlot('warmup')}
                className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text transition-colors min-h-[38px]"
              >
                + {t.treffenBlockSpiel}
              </button>
              <button
                type="button"
                onClick={() => handleAddBlankSlot('arts_discussion')}
                className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text transition-colors min-h-[38px]"
              >
                + {t.treffenBlockDienstKunst}
              </button>
              <button
                type="button"
                onClick={() => handleAddBlankSlot('closing')}
                className="px-3 py-2 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-2xs font-semibold text-text transition-colors min-h-[38px]"
              >
                + {t.treffenBlockAbschluss}
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control text-2xs font-medium text-text-tertiary hover:text-danger transition-colors cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Ablauf leeren' : 'Clear plan'}</span>
            </button>
          </div>
        </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. RESOURCE PICKER SHEET (Dialog) */}
      {/* ==================================================== */}
      <Dialog
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title={editingSlotId ? t.treffenSwapResource : t.treffenAddBlock}
        description={language === 'de' ? 'Wähle aus Gebeten, Liedern, Zitaten, Spielen und Projekten.' : 'Select from prayers, songs, scripture, games, and projects.'}
        maxWidth="xl"
      >
        <div className="space-y-4 pt-1">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setPickerTab('devotional')}
              className={`px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                pickerTab === 'devotional' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {t.treffenBlockAndacht}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('study')}
              className={`px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                pickerTab === 'study' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {t.treffenBlockZitat}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('games')}
              className={`px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                pickerTab === 'games' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {t.treffenBlockSpiel}
            </button>
            <button
              type="button"
              onClick={() => setPickerTab('service_arts')}
              className={`px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                pickerTab === 'service_arts' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {t.treffenBlockDienstKunst}
            </button>
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => setPickerTab('saved')}
                className={`px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  pickerTab === 'saved' ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                {language === 'de' ? `Gemerkt (${favorites.length})` : `Saved (${favorites.length})`}
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder={language === 'de' ? 'Titel, Text oder Thema durchsuchen...' : 'Search title, text, or topic...'}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-control bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Sub-Filters for Games */}
          {pickerTab === 'games' && (
            <div className="flex flex-wrap items-center gap-2 text-2xs">
              <span className="font-semibold text-text-tertiary">{language === 'de' ? 'Dauer:' : 'Duration:'}</span>
              {(['all', '10', '20'] as const).map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setPickerGameDuration(dur)}
                  className={`px-2.5 py-1 rounded-chip border transition-colors cursor-pointer ${
                    pickerGameDuration === dur
                      ? 'bg-accent text-accent-contrast border-transparent font-bold'
                      : 'bg-surface-2 text-text-secondary border-border hover:text-text'
                  }`}
                >
                  {dur === 'all' ? (language === 'de' ? 'Alle' : 'All') : `${dur} Min.`}
                </button>
              ))}

              <span className="font-semibold text-text-tertiary ml-2">{language === 'de' ? 'Gruppe:' : 'Group:'}</span>
              {(['all', 'small', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setPickerGameGroupSize(sz)}
                  className={`px-2.5 py-1 rounded-chip border transition-colors cursor-pointer ${
                    pickerGameGroupSize === sz
                      ? 'bg-accent text-accent-contrast border-transparent font-bold'
                      : 'bg-surface-2 text-text-secondary border-border hover:text-text'
                  }`}
                >
                  {sz === 'all' ? (language === 'de' ? 'Alle' : 'All') : sz === 'small' ? (language === 'de' ? 'Bis 8' : 'Up to 8') : (language === 'de' ? '15+' : '15+')}
                </button>
              ))}
            </div>
          )}

          {/* Sub-Filters for Service & Arts */}
          {pickerTab === 'service_arts' && (
            <div className="flex items-center gap-2 text-2xs">
              <button
                type="button"
                onClick={() => setPickerCampOnly(!pickerCampOnly)}
                className={`px-3 py-1 rounded-chip border transition-colors cursor-pointer ${
                  pickerCampOnly
                    ? 'bg-accent text-accent-contrast border-transparent font-bold'
                    : 'bg-surface-2 text-text-secondary border-border hover:text-text'
                }`}
              >
                ⛺ {language === 'de' ? 'Nur Camp-tauglich' : 'Camp suitable only'}
              </button>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            
            {/* 1. Devotional Tab (Prayers + Songs) */}
            {pickerTab === 'devotional' && (
              <div className="space-y-2">
                <div className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-1 pt-1">
                  {language === 'de' ? 'Heilige Gebete' : 'Sacred Prayers'} ({filteredPrayers.length})
                </div>
                {filteredPrayers.map((prayer) => {
                  const sectionTitle = prayer.section ? prayer.section[language] : (prayer.book ? prayer.book[language] : '');
                  const prayerText = language === 'de' ? prayer.textDe : prayer.textEn;
                  return (
                    <div
                      key={prayer.id}
                      onClick={() => handleSelectResource({
                        title: {
                          de: prayer.theme ? `${prayer.section?.de || prayer.book.de}: ${prayer.theme.de}` : (prayer.section?.de || prayer.book.de),
                          en: prayer.theme ? `${prayer.section?.en || prayer.book.en}: ${prayer.theme.en}` : (prayer.section?.en || prayer.book.en),
                        },
                        description: {
                          de: prayer.textDe.slice(0, 120) + '...',
                          en: prayer.textEn.slice(0, 120) + '...',
                        },
                        type: 'devotional',
                        refId: prayer.id,
                        refType: 'quote',
                        duration: 10,
                      })}
                      className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-2xs font-bold text-accent-text">{sectionTitle}</span>
                          {prayer.theme && <span className="text-2xs text-text-secondary">• {prayer.theme[language]}</span>}
                        </div>
                        <p className="font-serif text-xs text-text line-clamp-2 italic">
                          „{prayerText}“
                        </p>
                      </div>
                      <span className="text-2xs font-semibold text-accent-text shrink-0">10′</span>
                    </div>
                  );
                })}

                <div className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-1 pt-3">
                  {language === 'de' ? 'Andachtslieder' : 'Devotional Songs'} ({filteredSongs.length})
                </div>
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleSelectResource({
                      title: song.title,
                      description: {
                        de: `Gemeinsames Singen (${song.theme.de})`,
                        en: `Group singing (${song.theme.en})`,
                      },
                      type: 'devotional',
                      refId: song.id,
                      refType: 'song',
                      duration: 10,
                    })}
                    className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-accent-text" />
                        <h4 className="text-xs font-bold text-text">{song.title[language]}</h4>
                      </div>
                      <p className="text-2xs text-text-secondary mt-0.5">{song.theme[language]}</p>
                    </div>
                    <span className="text-2xs font-semibold text-accent-text shrink-0">10′</span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Study Tab (Quotes + Methods) */}
            {pickerTab === 'study' && (
              <div className="space-y-2">
                <div className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-1 pt-1">
                  {language === 'de' ? 'Zitate aus dem Jugendprogramm' : 'Curriculum Scripture Quotes'} ({filteredQuotes.length})
                </div>
                {filteredQuotes.map((quote) => {
                  const bookTitle = quote.mainBook ? quote.mainBook[language] : quote.book[language];
                  const sectionTitle = quote.section ? quote.section[language] : '';
                  const quoteText = language === 'de' ? quote.textDe : quote.textEn;
                  return (
                    <div
                      key={quote.id}
                      onClick={() => handleSelectResource({
                        title: {
                          de: `${quote.mainBook?.de || quote.book.de}${quote.section ? ` (${quote.section.de})` : ''}`,
                          en: `${quote.mainBook?.en || quote.book.en}${quote.section ? ` (${quote.section.en})` : ''}`,
                        },
                        description: {
                          de: quote.textDe.slice(0, 130) + '...',
                          en: quote.textEn.slice(0, 130) + '...',
                        },
                        type: 'study',
                        refId: quote.id,
                        refType: 'quote',
                        duration: 20,
                      })}
                      className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-2xs font-bold text-accent-text mb-0.5">
                          {bookTitle}{sectionTitle ? ` · ${sectionTitle}` : ''}
                        </div>
                        <p className="font-serif text-xs text-text line-clamp-2">
                          „{quoteText}“
                        </p>
                      </div>
                      <span className="text-2xs font-semibold text-accent-text shrink-0">20′</span>
                    </div>
                  );
                })}

                <div className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-1 pt-3">
                  {language === 'de' ? 'Lernmethoden (50 Methoden)' : 'Memorisation Methods'} ({filteredMethods.length})
                </div>
                {filteredMethods.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectResource({
                      title: m.name,
                      description: m.summary,
                      type: 'study',
                      refId: m.id,
                      refType: 'method',
                      duration: parseInt(m.durationMinutes.replace(/[^0-9]/g, ''), 10) || 20,
                      materials: m.materials,
                    })}
                    className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text">{m.name[language]}</h4>
                      <p className="text-2xs text-text-secondary mt-0.5 line-clamp-1">{m.summary[language]}</p>
                    </div>
                    <span className="text-2xs font-semibold text-accent-text shrink-0">{m.durationMinutes}′</span>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Games Tab */}
            {pickerTab === 'games' && filteredGames.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelectResource({
                  title: g.title,
                  description: g.summary,
                  type: g.energyLevel === 'calm' ? 'closing' : 'warmup',
                  refId: g.id,
                  refType: 'game',
                  duration: parseInt(g.durationMinutes.replace(/[^0-9]/g, ''), 10) || 15,
                  materials: g.materials,
                })}
                className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-text">{g.title[language]}</h4>
                  <p className="text-2xs text-text-secondary mt-0.5 line-clamp-1">{g.summary[language]}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-text-tertiary">👥 {g.groupSize.min}–{g.groupSize.max}</span>
                    <span className="text-2xs text-text-tertiary">• {g.space[language]}</span>
                  </div>
                </div>
                <span className="text-2xs font-semibold text-accent-text shrink-0">{g.durationMinutes}′</span>
              </div>
            ))}

            {/* 4. Service & Arts Tab */}
            {pickerTab === 'service_arts' && (
              <div className="space-y-2">
                <div className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-1 pt-1">
                  {language === 'de' ? 'Dienstprojekte' : 'Service Projects'} ({filteredServices.length})
                </div>
                {filteredServices.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectResource({
                      title: proj.title,
                      description: proj.objective,
                      type: 'service',
                      refId: proj.id,
                      refType: 'service',
                      duration: proj.durationMin || 45,
                      materials: proj.materials,
                    })}
                    className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text">{proj.title[language]}</h4>
                      <p className="text-2xs text-text-secondary mt-0.5 line-clamp-1">{proj.objective[language]}</p>
                    </div>
                    <span className="text-2xs font-semibold text-accent-text shrink-0">{proj.durationMin}–{proj.durationMax}′</span>
                  </div>
                ))}

                <div className="text-2xs font-bold uppercase tracking-wider text-text-tertiary px-1 pt-3">
                  {language === 'de' ? 'Kunst- & Theaterimpulse' : 'Arts & Drama Prompts'} ({filteredArts.length})
                </div>
                {filteredArts.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectResource({
                      title: art.title,
                      description: art.description,
                      type: 'arts_discussion',
                      refId: art.id,
                      refType: 'art',
                      duration: art.durationMin || 30,
                      materials: art.materials,
                    })}
                    className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text">{art.title[language]}</h4>
                      <p className="text-2xs text-text-secondary mt-0.5 line-clamp-1">{art.description[language]}</p>
                    </div>
                    <span className="text-2xs font-semibold text-accent-text shrink-0">{art.durationMin}–{art.durationMax}′</span>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Saved Tab */}
            {pickerTab === 'saved' && (
              favorites.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-6">
                  {language === 'de' ? 'Keine gemerkten Favoriten vorhanden.' : 'No saved favorites yet.'}
                </p>
              ) : (
                filteredGames.filter((g) => favorites.includes(g.id)).map((g) => (
                  <div
                    key={g.id}
                    onClick={() => handleSelectResource({
                      title: g.title,
                      description: g.summary,
                      type: g.energyLevel === 'calm' ? 'closing' : 'warmup',
                      refId: g.id,
                      refType: 'game',
                      duration: parseInt(g.durationMinutes.replace(/[^0-9]/g, ''), 10) || 15,
                      materials: g.materials,
                    })}
                    className="p-3 rounded-card bg-surface-2 hover:bg-surface-raised border border-border transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-text">{g.title[language]}</h4>
                      <p className="text-2xs text-text-secondary mt-0.5 line-clamp-1">{g.summary[language]}</p>
                    </div>
                    <span className="text-2xs font-semibold text-accent-text shrink-0">{g.durationMinutes}′</span>
                  </div>
                ))
              )
            )}

          </div>
        </div>
      </Dialog>

      {/* ==================================================== */}
      {/* 6. TEMPLATES (PRESETS) DIALOG */}
      {/* ==================================================== */}
      <Dialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        title={t.treffenChoosePreset}
        description={language === 'de' ? 'Wähle eine erprobte Struktur für dein Treffen.' : 'Choose a proven gathering framework.'}
        maxWidth="lg"
      >
        <div className="space-y-3 pt-2">
          {GATHERING_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="p-4 sm:p-5 rounded-card bg-surface-2 hover:bg-surface-raised border border-line hover:border-accent/40 transition-colors cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                  {preset.name[language]}
                </h4>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-control bg-surface border border-line text-text-secondary shrink-0">
                  {preset.targetDuration} Min.
                </span>
              </div>
              {renderPresetRhythmBar(preset.slots)}
              <p className="text-xs text-text-secondary leading-relaxed">
                {preset.desc[language]}
              </p>
            </div>
          ))}
        </div>
      </Dialog>

      {/* ==================================================== */}
      {/* 7. "MEINE TREFFEN" (SAVED PLANS) DIALOG */}
      {/* ==================================================== */}
      <Dialog
        isOpen={isMyPlansOpen}
        onClose={() => setIsMyPlansOpen(false)}
        title={t.treffenMyPlans}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {plans.length} {language === 'de' ? 'gespeicherte Abläufe' : 'saved gatherings'}
            </span>
            <button
              type="button"
              onClick={() => {
                createNewPlan();
                setIsMyPlansOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-accent text-accent-contrast text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.treffenNewPlan}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            {plans.map((p) => {
              const isActive = p.id === activePlanId;
              const pDuration = p.slots.reduce((sum, s) => sum + s.durationMinutes, 0);
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-card border transition-colors flex items-center justify-between gap-3 ${
                    isActive ? 'bg-surface-raised border-accent' : 'bg-surface-2 border-border hover:border-accent/30'
                  }`}
                >
                  <div
                    onClick={() => {
                      setActivePlanId(p.id);
                      setIsMyPlansOpen(false);
                    }}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text truncate">{p.name}</h4>
                      {isActive && (
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-chip bg-accent text-accent-contrast">
                          {language === 'de' ? 'Aktiv' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-2xs text-text-secondary mt-0.5">
                      {p.slots.length} {language === 'de' ? 'Bausteine' : 'blocks'} · {pDuration} Min.
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Duplicate "Nächste Woche" */}
                    <button
                      type="button"
                      onClick={() => duplicatePlan(p.id)}
                      className="px-2.5 py-1.5 rounded-control bg-surface hover:bg-surface-raised border border-border text-2xs font-semibold text-text transition-colors cursor-pointer"
                      title={t.treffenDuplicateWeek}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Plan */}
                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t.treffenDeleteConfirm)) {
                            deletePlan(p.id);
                          }
                        }}
                        className="p-1.5 rounded-control text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        title={t.treffenDeleteSlot}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>

      {/* ==================================================== */}
      {/* 8. PACKING LIST DIALOG */}
      {/* ==================================================== */}
      <Dialog
        isOpen={isPackingListOpen}
        onClose={() => setIsPackingListOpen(false)}
        title={`${t.treffenPackingList} (${gatheredMaterials.length})`}
        description={language === 'de' ? 'Automatisch ermittelt aus allen Aktivitäten dieses Ablaufs.' : 'Automatically generated from all activities in this gathering.'}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          {gatheredMaterials.length === 0 ? (
            <p className="text-xs text-text-tertiary text-center py-6">
              {t.treffenPackingListEmpty}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-2xs">
                <button
                  type="button"
                  onClick={() => {
                    const all: Record<string, boolean> = {};
                    gatheredMaterials.forEach((m) => { all[m.id] = true; });
                    setPackedItems(all);
                  }}
                  className="font-semibold text-accent-text hover:underline cursor-pointer"
                >
                  {t.treffenCheckAll}
                </button>
                <button
                  type="button"
                  onClick={() => setPackedItems({})}
                  className="font-semibold text-text-tertiary hover:text-text cursor-pointer"
                >
                  {t.treffenUncheckAll}
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {gatheredMaterials.map((mat) => {
                  const isChecked = !!packedItems[mat.id];
                  return (
                    <div
                      key={mat.id}
                      onClick={() => setPackedItems((prev) => ({ ...prev, [mat.id]: !prev[mat.id] }))}
                      className={`p-3 rounded-control border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked ? 'bg-surface-2/60 border-border opacity-70' : 'bg-surface-2 border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-text-tertiary shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold ${isChecked ? 'line-through text-text-tertiary' : 'text-text'}`}>
                            {mat.name}
                          </span>
                          <p className="text-2xs text-text-secondary truncate mt-0.5">
                            {mat.sourceTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* ==================================================== */}
      {/* 9. SHARE DIALOG (WhatsApp + Direct URL) */}
      {/* ==================================================== */}
      <Dialog
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={t.treffenSharePlan}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-text-secondary leading-relaxed">
            {language === 'de'
              ? 'Teile den Ablauf mit deinen Mit-Animatoren per Link oder kopiere die Tagesordnung für WhatsApp.'
              : 'Share the gathering arc with co-animators via link or copy the agenda for WhatsApp.'}
          </p>

          <div className="space-y-2.5">
            {/* Share Link */}
            <button
              type="button"
              onClick={handleShareLink}
              className="w-full px-4 py-3 rounded-control bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'de' ? 'Link zum Übernehmen teilen' : 'Share importable link'}</span>
            </button>

            {/* WhatsApp Export */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 rounded-control bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] dark:text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 border border-[#25D366]/30 transition-colors cursor-pointer"
            >
              <span>WhatsApp Ablauf senden</span>
            </a>

            {/* Copy Agenda */}
            <button
              type="button"
              onClick={handleCopyAgenda}
              className="w-full px-4 py-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border font-semibold text-xs text-text flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-text-tertiary" />
              <span>{t.treffenCopyAgenda}</span>
            </button>
          </div>
        </div>
      </Dialog>

      {/* ==================================================== */}
      {/* 10. QUICK RESOURCE PREVIEW MODAL */}
      {/* ==================================================== */}
      {previewItem && (
        <Dialog
          isOpen={true}
          onClose={() => setPreviewItem(null)}
          title={language === 'de' ? 'Vorschau' : 'Preview'}
          maxWidth="lg"
        >
          <div className="pt-2">
            {/* Game Preview */}
            {previewItem.type === 'game' && (() => {
              const game = GAMES_DATA.find((g) => g.id === previewItem.id);
              if (!game) return <p className="text-xs text-text-tertiary">Nicht gefunden</p>;
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-text">{game.title[language]}</h3>
                    <p className="text-text-secondary mt-1">{game.summary[language]}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-text mb-1">{language === 'de' ? 'Ablauf & Regeln' : 'Rules & Steps'}:</h4>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      {game.rules[language].map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  {game.animatorTips[language].length > 0 && (
                    <div className="bg-surface-2 p-3 rounded-control border border-border">
                      <h4 className="font-bold text-text mb-1">{language === 'de' ? 'Tipp für Animatoren' : 'Animator Tip'}:</h4>
                      <p className="text-text-secondary">{game.animatorTips[language][0]}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Quote / Prayer Preview (Lora Serif Reverence) */}
            {previewItem.type === 'quote' && (() => {
              const quote = QUOTES_DATA.find((q) => q.id === previewItem.id);
              if (!quote) return <p className="text-xs text-text-tertiary">Nicht gefunden</p>;
              return (
                <div className="space-y-4 py-2">
                  <div className="text-2xs font-bold uppercase tracking-wider text-accent-text">
                    {quote.mainBook?.[language] || quote.book[language]}{quote.section ? ` · ${quote.section[language]}` : ''}
                  </div>
                  <div className="p-6 bg-surface-2 rounded-card border border-border text-center">
                    <p className="font-serif text-base sm:text-lg text-text leading-relaxed">
                      „{language === 'de' ? quote.textDe : quote.textEn}“
                    </p>
                    <p className="font-sans text-xs text-text-secondary mt-4">
                      — {quote.source[language]}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Song Preview */}
            {previewItem.type === 'song' && (() => {
              const song = DEVOTIONAL_SONGS_DATA.find((s) => s.id === previewItem.id);
              if (!song) return <p className="text-xs text-text-tertiary">Nicht gefunden</p>;
              return (
                <div className="space-y-4 py-2">
                  <div>
                    <h3 className="text-base font-bold text-text">{song.title[language]}</h3>
                    <p className="text-text-secondary text-xs mt-1">{song.theme[language]}</p>
                  </div>
                  <a
                    href={song.bahaiSongsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-control bg-accent text-accent-contrast font-bold text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Lied auf BahaiSongs anhören & Akkorde ansehen</span>
                  </a>
                </div>
              );
            })()}

            {/* Service Project Preview */}
            {previewItem.type === 'service' && (() => {
              const proj = SERVICE_PROJECTS_DATA.find((p) => p.id === previewItem.id);
              if (!proj) return <p className="text-xs text-text-tertiary">Nicht gefunden</p>;
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-text">{proj.title[language]}</h3>
                    <p className="text-text-secondary mt-1">{proj.objective[language]}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-text mb-1">{language === 'de' ? 'Schritte zur Durchführung' : 'Steps'}:</h4>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      {proj.steps[language].map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* Arts Prompt Preview */}
            {previewItem.type === 'art' && (() => {
              const art = ARTS_PROMPTS_DATA.find((a) => a.id === previewItem.id);
              if (!art) return <p className="text-xs text-text-tertiary">Nicht gefunden</p>;
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-text">{art.title[language]}</h3>
                    <p className="text-text-secondary mt-1">{art.description[language]}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-text mb-1">{language === 'de' ? 'Anleitung' : 'Guiding Steps'}:</h4>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      {art.guidingSteps[language].map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {/* Method Preview */}
            {previewItem.type === 'method' && (() => {
              const method = QUOTE_METHODS_DATA.find((m) => m.id === previewItem.id);
              if (!method) return <p className="text-xs text-text-tertiary">Nicht gefunden</p>;
              return (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-text">{method.name[language]}</h3>
                    <p className="text-text-secondary mt-1">{method.summary[language]}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-text mb-1">{language === 'de' ? 'Ablauf' : 'Steps'}:</h4>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      {method.steps.map((s, i) => <li key={i}><strong className="text-text">{s.name[language]}:</strong> {s.description[language]}</li>)}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </Dialog>
      )}

      {/* ==================================================== */}
      {/* 11. "TREFFEN STARTEN" FULLSCREEN LIVE EXECUTION MODE */}
      {/* ==================================================== */}
      {isRunningMode && slots.length > 0 && (
        <div
          className="fixed inset-0 z-70 bg-bg text-text p-4 sm:p-8 flex flex-col justify-between safe-top safe-bottom animate-in fade-in duration-200 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Bar: Progress & Exit */}
          <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-control bg-accent text-accent-contrast">
                {currentBlockIndex + 1} / {slots.length}
              </span>
              <div>
                <h2 className="text-sm font-bold text-text truncate">
                  {activePlan?.name}
                </h2>
                <span className="text-2xs font-mono text-text-tertiary">
                  {getSlotTimeRange(startTime, currentBlockIndex, slots).start} – {getSlotTimeRange(startTime, currentBlockIndex, slots).end}
                </span>
              </div>
            </div>

            <IconButton
              label={t.treffenExitLive}
              onClick={() => setIsRunningMode(false)}
              size="md"
              variant="ghost"
              className="text-text-secondary hover:text-text bg-surface-2"
            >
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          {/* Center Stage: Large Block Details & Countdown */}
          <div className="my-auto max-w-2xl mx-auto w-full text-center space-y-6 py-6">
            <div className="inline-flex">
              {renderSlotTypeBadge(slots[currentBlockIndex].type)}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight leading-tight">
              {slots[currentBlockIndex].title[language]}
            </h1>

            {slots[currentBlockIndex].description[language] && (
              <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed">
                {slots[currentBlockIndex].description[language]}
              </p>
            )}

            {/* Big Countdown Timer Display */}
            <div className="py-2">
              <div className="text-6xl sm:text-8xl tabular-nums font-mono font-extrabold text-accent-text tracking-tighter">
                {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
                {String(timerSecondsLeft % 60).padStart(2, '0')}
              </div>
              <p className="text-2xs text-text-tertiary mt-2">
                {t.treffenWakeLockActive}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="px-6 py-3 rounded-control bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer min-h-[48px]"
              >
                {isTimerActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTimerActive ? (language === 'de' ? 'Pause' : 'Pause') : (language === 'de' ? 'Start' : 'Start')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTimerSecondsLeft(slots[currentBlockIndex].durationMinutes * 60)}
                className="px-4 py-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[48px]"
                title={language === 'de' ? 'Timer zurücksetzen' : 'Reset timer'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setTimerSecondsLeft((prev) => prev + 60)}
                className="px-3.5 py-3 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text transition-colors cursor-pointer min-h-[48px]"
              >
                +1m
              </button>
            </div>

            {/* Linked Content Launcher in Live Mode */}
            {slots[currentBlockIndex].referenceType && slots[currentBlockIndex].referenceId && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem({
                    type: slots[currentBlockIndex].referenceType as 'game' | 'quote' | 'song' | 'service' | 'art' | 'method',
                    id: slots[currentBlockIndex].referenceId as string,
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-bold text-accent-text transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    {slots[currentBlockIndex].referenceType === 'game' && t.treffenOpenGame}
                    {slots[currentBlockIndex].referenceType === 'quote' && t.treffenOpenQuote}
                    {slots[currentBlockIndex].referenceType === 'song' && t.treffenOpenSong}
                    {slots[currentBlockIndex].referenceType === 'service' && t.treffenOpenProject}
                    {slots[currentBlockIndex].referenceType === 'art' && t.treffenOpenProject}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Bar: Prev / Next Block Navigation */}
          <div className="flex items-center justify-between border-t border-border pt-4 shrink-0">
            <button
              type="button"
              disabled={currentBlockIndex === 0}
              onClick={handlePrevBlock}
              className="px-4 py-2.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text disabled:opacity-30 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.treffenPrevBlock}</span>
            </button>

            <button
              type="button"
              disabled={currentBlockIndex === slots.length - 1}
              onClick={handleNextBlock}
              className="px-5 py-2.5 rounded-control bg-accent text-accent-contrast hover:bg-accent-hover text-xs font-bold disabled:opacity-30 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
            >
              <span>{t.treffenNextBlock}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
