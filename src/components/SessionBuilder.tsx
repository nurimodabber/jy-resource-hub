import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, BookOpen, Copy, Check, Printer, Music, 
  Plus, Trash2, ArrowUp, ArrowDown, 
  RotateCcw, ChevronRight, X 
} from 'lucide-react';
import { 
  Language, SessionSlot, SessionSlotType 
} from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { GAMES_DATA } from '../data/games';
import { QUOTES_DATA } from '../data/quotes';
import { QUOTE_METHODS_DATA } from '../data/quoteMethods';
import { DEVOTIONAL_SONGS_DATA } from '../data/songs';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';

interface SessionBuilderProps {
  language: Language;
  onOpenBahaiSongs: () => void;
  externalSlotToAdd?: SessionSlot | null;
  onClearExternalSlot?: () => void;
}

export const SessionBuilder: React.FC<SessionBuilderProps> = ({
  language,
  onOpenBahaiSongs,
  externalSlotToAdd,
  onClearExternalSlot,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Presets definition
  const presets: { id: string; name: string; desc: string; slots: SessionSlot[] }[] = useMemo(() => [
    {
      id: 'standard',
      name: t.presetStandard,
      desc: language === 'de' ? 'Ausgewogene 75-Minuten-Struktur für wöchentliche Juniorjugendgruppen.' : 'Balanced 75-minute framework for weekly junior youth gatherings.',
      slots: [
        {
          id: 'slot-warmup-1',
          type: 'warmup',
          title: { de: 'Schnick-Schnack-Schnuck Evolution', en: 'Rock Paper Scissors Evolution' },
          durationMinutes: 10,
          description: { de: 'Lockerer Bewegungs-Einstieg, baut Hemmungen ab und bringt Energie in den Kreis.', en: 'Energizing icebreaker that breaks physical tension through play.' },
          referenceId: 'ssp-evolution',
          referenceType: 'game'
        },
        {
          id: 'slot-devo-2',
          type: 'devotional',
          title: { de: 'Eingangslied: Blessed is the Spot', en: 'Opening Choral Song: Blessed is the Spot' },
          durationMinutes: 10,
          description: { de: 'Gemeinsames Singen und Eröffnungsgebet für eine ruhige, ehrfürchtige Atmosphäre.', en: 'Opening song and reflective prayer to center the group.' },
          referenceId: 'blessed-is-the-spot',
          referenceType: 'song'
        },
        {
          id: 'slot-study-3',
          type: 'study',
          title: { de: 'Zitate-Studium & Die verschwindende Tafel', en: 'Scripture Study & Disappearing Board' },
          durationMinutes: 25,
          description: { de: 'Kollektives Einprägen eines Verses durch schrittweises Löschen von Wörtern.', en: 'Collective memorization of a scripture verse through progressive word erasure.' },
          referenceId: 'die-verschwindende-tafel',
          referenceType: 'method'
        },
        {
          id: 'slot-arts-4',
          type: 'arts_discussion',
          title: { de: 'Theater: Die Weggabelung der Bestätigungen', en: 'Drama: The Fork in the Road of Confirmation' },
          durationMinutes: 20,
          description: { de: 'Kurzes Szenenspiel zur Anwendung des Gelernten auf alltägliche Situationen.', en: 'Short two-act skit applying lesson concepts to real dilemmas.' },
          referenceId: 'breezes-two-roads-skit',
          referenceType: 'art'
        },
        {
          id: 'slot-closing-5',
          type: 'closing',
          title: { de: 'Wort-Mind (Stummes Zählen im Kreis)', en: 'Word Mind (Silent Counting)' },
          durationMinutes: 10,
          description: { de: 'Ruhiges, konzentriertes Gruppen-Abschlussspiel vor dem Auseinandergehen.', en: 'Quiet, mindful group recitation challenge to close in unity.' },
          referenceId: 'wort-mind',
          referenceType: 'game'
        }
      ]
    },
    {
      id: 'flash',
      name: t.presetFlash,
      desc: language === 'de' ? 'Kompakte 45 Minuten für Schulpause oder kurze Treffen.' : 'Compact 45-minute focus session for lunch clubs or quick gatherings.',
      slots: [
        {
          id: 'slot-flash-1',
          type: 'warmup',
          title: { de: 'Ninja Reaktionsspiel', en: 'Ninja Reaction Duel' },
          durationMinutes: 10,
          description: { de: 'Sofortige Wachsamkeit und Lachen im Kreis.', en: 'Instant alertness and laughter in a standing circle.' },
          referenceId: 'ninja',
          referenceType: 'game'
        },
        {
          id: 'slot-flash-2',
          type: 'study',
          title: { de: 'Zitate-Sprint: Erstbuchstaben-Board', en: 'Quote Sprint: First-Letter Anchors' },
          durationMinutes: 25,
          description: { de: 'Aktiver kognitiver Abruf anhand von Wortanfängen.', en: 'Active retrieval practice using initial letter prompts.' },
          referenceId: 'erstbuchstaben-staffel',
          referenceType: 'method'
        },
        {
          id: 'slot-flash-3',
          type: 'closing',
          title: { de: 'Reflexionsrunde & Gebet', en: 'Reflection Circle & Prayer' },
          durationMinutes: 10,
          description: { de: 'Ein Gedanke für den Tag und ein Abschlussgebet.', en: 'A closing thought for the day and a quiet blessing.' },
        }
      ]
    },
    {
      id: 'camp',
      name: t.presetCamp,
      desc: language === 'de' ? '2-Stunden-Block für Ferienfreizeiten mit Aktion und Dienst.' : '2-hour afternoon camp block featuring deep study, arts, and service action.',
      slots: [
        {
          id: 'slot-camp-1',
          type: 'warmup',
          title: { de: 'SSP Showdown (Fankurve)', en: 'RPS Showdown & Cheer Rally' },
          durationMinutes: 15,
          description: { de: 'Große Gruppendynamik mit wachsenden Fankurven.', en: 'High energy arena game with growing cheer squads.' },
          referenceId: 'ssp-evolution',
          referenceType: 'game'
        },
        {
          id: 'slot-camp-2',
          type: 'study',
          title: { de: 'Textstudium & Staffellauf-Memorisation', en: 'Text Study & Relay Sprint Memorisation' },
          durationMinutes: 30,
          description: { de: 'Körperliche Bewegung verknüpft mit geistigem Textverständnis.', en: 'Physical movement coupled with deep textual retention.' },
          referenceId: 'lauf-diktat',
          referenceType: 'method'
        },
        {
          id: 'slot-camp-3',
          type: 'service',
          title: { de: 'Gemeindedienst: Stadtteil-Putz & Müll-Audit', en: 'Community Service: Clean-up & Trash Audit' },
          durationMinutes: 50,
          description: { de: 'Praktisches Dienen in der Umgebung des Camp-Geländes.', en: 'Hands-on ecological service around the campsite.' },
          referenceId: 'trash-audit-cleanup',
          referenceType: 'service'
        },
        {
          id: 'slot-camp-4',
          type: 'closing',
          title: { de: 'Gemeinsames Zählen & Andacht am Lagerfeuer', en: 'Campfire Silence & Evening Devotions' },
          durationMinutes: 25,
          description: { de: 'Auswertung des Dienstes, Gesang und Abendgebet.', en: 'Service debrief, acoustic songs, and night prayer.' },
        }
      ]
    },
    {
      id: 'devotional',
      name: t.presetDevotional,
      desc: language === 'de' ? 'Feierlicher Abend mit Gebeten, Lesungen und Liedern.' : 'Devotional gathering centered on prayers, songs, and reflection.',
      slots: [
        {
          id: 'slot-devo-open',
          type: 'devotional',
          title: { de: '1. Eröffnungsgebet (‘Abdu’l-Bahá)', en: '1. Opening Prayer (‘Abdu’l-Bahá)' },
          durationMinutes: 8,
          description: { de: 'O Du gütiger Herr! Schenke jedem dieser Flügglinge gnädig ein Paar himmlische Schwingen...', en: 'O Thou kind Lord! Graciously bestow a pair of heavenly wings unto each of these fledglings...' },
        },
        {
          id: 'slot-devo-song1',
          type: 'devotional',
          title: { de: '2. Lied: Blessed is the Spot (C / G)', en: '2. Song: Blessed is the Spot (C / G)' },
          durationMinutes: 10,
          description: { de: 'Gemeinsamer Gesang mit Gitarrenbegleitung.', en: 'Choral singing with guitar accompaniment.' },
          referenceId: 'blessed-is-the-spot',
          referenceType: 'song'
        },
        {
          id: 'slot-devo-read',
          type: 'study',
          title: { de: '3. Lesung: Reinheit des Herzens', en: '3. Central Reading: Purity of Heart' },
          durationMinutes: 12,
          description: { de: '„O Sohn des Geistes! Mein erstes Gebot an dich ist dieses: Besitze ein reines, gütiges und strahlendes Herz...“', en: '"O Son of Spirit! My first counsel is this: Possess a pure, kindly and radiant heart..."' },
          referenceId: 'q-herz-rein',
          referenceType: 'quote'
        },
        {
          id: 'slot-devo-song2',
          type: 'devotional',
          title: { de: '4. Lied: Love is the Light (G / D)', en: '4. Song: Love is the Light (G / D)' },
          durationMinutes: 10,
          description: { de: 'Zweites Lied zur Vertiefung des Themas.', en: 'Second choral song reinforcing theme.' },
          referenceId: 'love-is-the-light',
          referenceType: 'song'
        },
        {
          id: 'slot-devo-refl',
          type: 'arts_discussion',
          title: { de: '5. Stille Reflexion & Spontane Gebete', en: '5. Quiet Reflection & Spontaneous Prayers' },
          durationMinutes: 12,
          description: { de: 'Sanfte Instrumentalmusik und Raum für persönliche Gebete.', en: 'Gentle acoustic picking and space for personal prayers.' },
        },
        {
          id: 'slot-devo-close',
          type: 'closing',
          title: { de: '6. Abschlusslied: Remover of Difficulties', en: '6. Closing Song: Remover of Difficulties' },
          durationMinutes: 8,
          description: { de: 'Abschlusslied und Verabschiedung.', en: 'Closing song and peaceful dismissal.' },
          referenceId: 'remover-of-difficulties',
          referenceType: 'song'
        }
      ]
    }
  ], [language, t]);

  // Persistent slots state
  const [slots, setSlots] = useState<SessionSlot[]>(() => {
    try {
      const saved = localStorage.getItem('jy_modular_session_plan');
      return saved ? JSON.parse(saved) : presets[0].slots;
    } catch {
      return presets[0].slots;
    }
  });

  const [activePresetId, setActivePresetId] = useState<string>('standard');
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  // Catalog picker modal state
  const [pickerModalSlotId, setPickerModalSlotId] = useState<string | null>(null);
  const [pickerFilter, setPickerFilter] = useState<'all' | 'games' | 'quotes' | 'songs' | 'service' | 'arts'>('all');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('jy_modular_session_plan', JSON.stringify(slots));
  }, [slots]);

  // Handle externally passed slot from ServiceArtsView
  useEffect(() => {
    if (externalSlotToAdd) {
      setSlots(prev => [...prev, externalSlotToAdd]);
      if (onClearExternalSlot) onClearExternalSlot();
    }
  }, [externalSlotToAdd, onClearExternalSlot]);

  // Compute total duration
  const totalMinutes = useMemo(() => {
    return slots.reduce((acc, slot) => acc + (slot.durationMinutes || 0), 0);
  }, [slots]);

  // Load preset
  const handleSelectPreset = (presetId: string) => {
    const p = presets.find(item => item.id === presetId);
    if (p) {
      setSlots(p.slots);
      setActivePresetId(presetId);
    }
  };

  // Slot mutations
  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slots.length) return;
    const next = [...slots];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setSlots(next);
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleAdjustDuration = (id: string, delta: number) => {
    setSlots(prev => prev.map(s => {
      if (s.id === id) {
        const nextDur = Math.max(5, s.durationMinutes + delta);
        return { ...s, durationMinutes: nextDur };
      }
      return s;
    }));
  };

  const handleAddCustomSlot = () => {
    const newSlot: SessionSlot = {
      id: `slot-custom-${Date.now()}`,
      type: 'study',
      title: { de: 'Neuer Baustein', en: 'New Agenda Block' },
      durationMinutes: 15,
      description: { de: 'Beschreibung des Programmpunkts...', en: 'Details of this agenda step...' }
    };
    setSlots(prev => [...prev, newSlot]);
  };

  // Swap slot with an item from the database
  const handleSwapSlotWithItem = (slotId: string, itemType: string, itemId: string) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id !== slotId) return slot;

      if (itemType === 'game') {
        const g = GAMES_DATA.find(x => x.id === itemId);
        if (g) {
          return {
            ...slot,
            type: g.category === 'energizer' ? 'warmup' : 'closing',
            title: g.title,
            description: g.summary,
            materials: g.materials,
            tips: g.animatorTips.de[0] ? { de: g.animatorTips.de[0], en: g.animatorTips.en[0] || '' } : undefined,
            referenceId: g.id,
            referenceType: 'game'
          };
        }
      }

      if (itemType === 'song') {
        const s = DEVOTIONAL_SONGS_DATA.find(x => x.id === itemId);
        if (s) {
          return {
            ...slot,
            type: 'devotional',
            title: s.title,
            description: { de: `Tonart: ${s.key || 'C'} • Thema: ${s.theme.de}`, en: `Key: ${s.key || 'C'} • Theme: ${s.theme.en}` },
            referenceId: s.id,
            referenceType: 'song'
          };
        }
      }

      if (itemType === 'quote') {
        const q = QUOTES_DATA.find(x => x.id === itemId);
        if (q) {
          return {
            ...slot,
            type: 'study',
            title: { de: `Zitat: ${q.theme.de} (${q.book.de.split(',')[0]})`, en: `Quote: ${q.theme.en} (${q.book.en.split(',')[0]})` },
            description: { de: `„${q.textDe}“ — ${q.source.de}`, en: `"${q.textEn}" — ${q.source.en}` },
            referenceId: q.id,
            referenceType: 'quote'
          };
        }
      }

      if (itemType === 'method') {
        const m = QUOTE_METHODS_DATA.find(x => x.id === itemId);
        if (m) {
          return {
            ...slot,
            type: 'study',
            title: m.name,
            description: m.summary,
            materials: m.materials,
            tips: m.whyItWorks,
            referenceId: m.id,
            referenceType: 'method'
          };
        }
      }

      if (itemType === 'service') {
        const sp = SERVICE_PROJECTS_DATA.find(x => x.id === itemId);
        if (sp) {
          return {
            ...slot,
            type: 'service',
            title: sp.title,
            description: sp.objective,
            materials: sp.materials,
            tips: { de: sp.animatorTips.de[0] || '', en: sp.animatorTips.en[0] || '' },
            referenceId: sp.id,
            referenceType: 'service'
          };
        }
      }

      if (itemType === 'art') {
        const art = ARTS_PROMPTS_DATA.find(x => x.id === itemId);
        if (art) {
          return {
            ...slot,
            type: 'arts_discussion',
            title: art.title,
            description: art.description,
            materials: art.materials,
            referenceId: art.id,
            referenceType: 'art'
          };
        }
      }

      return slot;
    }));

    setPickerModalSlotId(null);
  };

  // Copy WhatsApp Formatted Message
  const handleCopyWhatsApp = () => {
    let runningMinutes = 0;
    const lines = slots.map((s, idx) => {
      const start = runningMinutes;
      runningMinutes += s.durationMinutes;
      const typeEmoji = 
        s.type === 'warmup' ? '🏃‍♂️' :
        s.type === 'devotional' ? '🎵' :
        s.type === 'study' ? '📖' :
        s.type === 'arts_discussion' ? '🎨' :
        s.type === 'service' ? '🌱' : '✨';

      const matText = s.materials && s.materials[language].length > 0 ? `\n   📦 Material: ${s.materials[language].join(', ')}` : '';
      const tipText = s.tips ? `\n   💡 Tipp: ${s.tips[language]}` : '';

      return `${typeEmoji} [${start}'–${runningMinutes}'] ${idx + 1}. ${s.title[language]} (${s.durationMinutes} Min)\n   ${s.description[language]}${matText}${tipText}`;
    });

    const header = `📋 ${language === 'de' ? 'ABLAUFPLAN DER JUGENDGRUPPE' : 'JUNIOR YOUTH SESSION PLAN'} (${totalMinutes} Min Gesamtdauer)\n\n`;
    const fullText = header + lines.join('\n\n') + `\n\n🔗 ${language === 'de' ? 'Erstellt mit dem Junior Youth Hub' : 'Prepared with Junior Youth Hub'}`;

    navigator.clipboard.writeText(fullText);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2000);
  };

  const getSlotBadgeColor = (type: SessionSlotType) => {
    switch (type) {
      case 'warmup': return 'bg-amber-500/10 text-amber-800 border-amber-500/20';
      case 'devotional': return 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20';
      case 'study': return 'bg-blue-500/10 text-blue-800 border-blue-500/20';
      case 'arts_discussion': return 'bg-purple-500/10 text-purple-800 border-purple-500/20';
      case 'service': return 'bg-teal-500/10 text-teal-800 border-teal-500/20';
      case 'closing': return 'bg-rose-500/10 text-rose-800 border-rose-500/20';
      default: return 'bg-black/[0.04] text-[#1d1d1f] border-black/[0.06]';
    }
  };

  const getSlotTypeLabel = (type: SessionSlotType) => {
    switch (type) {
      case 'warmup': return t.slotWarmup;
      case 'devotional': return t.slotDevotional;
      case 'study': return t.slotStudy;
      case 'arts_discussion': return t.slotArts;
      case 'service': return t.slotService;
      case 'closing': return t.slotClosing;
      default: return '';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t.plannerHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {language === 'de'
              ? 'Erstelle einen modularen, dynamischen Ablauf für deine wöchentliche Gruppe oder Freizeit. Tausche Bausteine flexibel mit realen Spielen, Zitaten und Aktionen aus der Datenbank.'
              : 'Architect a modular gathering agenda for weekly sessions or camps. Seamlessly populate slots with games, scripture methods, and service projects.'}
          </p>
        </div>

        {/* Bahá'í Songs Modal Link */}
        <button
          onClick={onOpenBahaiSongs}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-all shadow-apple-pill self-start sm:self-auto shrink-0"
        >
          <Music className="w-3.5 h-3.5" />
          <span>{t.openBahaiSongs}</span>
        </button>
      </div>

      {/* Preset Selector Bar */}
      <div className="bg-white rounded-3xl border border-black/[0.06] p-5 sm:p-6 shadow-apple-card space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
          {t.sessionPresetsLabel}:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-black/[0.03] border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-apple-card'
                    : 'bg-[#f5f5f7] border-transparent hover:bg-black/[0.05]'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-[#1d1d1f] mb-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-[#6e6e73] leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#0071e3] flex items-center gap-0.5">
                  <span>{language === 'de' ? 'Vorlage laden' : 'Load template'}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Planner Canvas */}
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-apple-card overflow-hidden">
        {/* Top Control Bar with Live Duration Meter */}
        <div className="p-5 sm:p-6 bg-[#fafafc] border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold shadow-2xs">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                {t.totalDurationLabel}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1d1d1f]">
                {totalMinutes} {language === 'de' ? 'Minuten' : 'Minutes'}
                <span className="text-xs font-normal text-[#86868b] ml-2">({slots.length} {language === 'de' ? 'Bausteine' : 'slots'})</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 border border-black/[0.08] rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              title={t.printHandout}
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-full transition-all shadow-apple-pill"
            >
              {copiedWhatsapp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWhatsapp ? t.copiedSuccess : t.copyWhatsappBtn}</span>
            </button>
          </div>
        </div>

        {/* Slots List */}
        <div className="p-5 sm:p-7 space-y-4">
          {slots.map((slot, index) => {
            return (
              <div
                key={slot.id}
                className="bg-[#f5f5f7] border border-black/[0.04] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-black/[0.1]"
              >
                {/* Left: Step Index & Content */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {index + 1}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSlotBadgeColor(slot.type)}`}>
                        {getSlotTypeLabel(slot.type)}
                      </span>

                      <span className="text-xs font-bold text-[#1d1d1f] bg-white px-2.5 py-0.5 rounded-full border border-black/[0.05]">
                        {slot.durationMinutes} Min
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-[#1d1d1f]">
                      {slot.title[language]}
                    </h4>

                    <p className="text-xs text-[#6e6e73] font-normal leading-relaxed">
                      {slot.description[language]}
                    </p>

                    {slot.materials && slot.materials[language].length > 0 && (
                      <p className="text-[11px] text-[#86868b] pt-1">
                        <strong>{t.materialsTitle}:</strong> {slot.materials[language].join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Controls & Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/[0.04] w-full md:w-auto justify-between md:justify-end">
                  {/* Duration Stepper */}
                  <div className="flex items-center bg-white rounded-full border border-black/[0.06] p-0.5 shadow-2xs">
                    <button
                      onClick={() => handleAdjustDuration(slot.id, -5)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
                      title="-5 Min"
                    >
                      -
                    </button>
                    <span className="text-xs font-medium px-2 text-[#1d1d1f]">
                      {slot.durationMinutes}'
                    </span>
                    <button
                      onClick={() => handleAdjustDuration(slot.id, 5)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
                      title="+5 Min"
                    >
                      +
                    </button>
                  </div>

                  {/* Pick from database button */}
                  <button
                    onClick={() => {
                      setPickerModalSlotId(slot.id);
                      setPickerFilter('all');
                    }}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full bg-white hover:bg-black/[0.04] text-[#0071e3] border border-black/[0.06] transition-colors"
                    title={t.swapWithCatalog}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.swapWithCatalog}</span>
                  </button>

                  {/* Reorder Arrows */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleMoveSlot(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-20 transition-opacity"
                      title={t.moveSlotUp}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSlot(index, 'down')}
                      disabled={index === slots.length - 1}
                      className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-20 transition-opacity"
                      title={t.moveSlotDown}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Slot */}
                  <button
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 text-[#aeaeb2] hover:text-rose-600 transition-colors"
                    title={t.removeSlot}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Slot Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleAddCustomSlot}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-dashed border-black/[0.2] hover:border-black/[0.4] text-xs font-semibold text-[#1d1d1f] rounded-2xl shadow-2xs hover:bg-black/[0.02] transition-all"
            >
              <Plus className="w-4 h-4 text-[#0071e3]" />
              <span>{t.addSlotBtn}</span>
            </button>

            <button
              onClick={() => handleSelectPreset(activePresetId)}
              className="inline-flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.resetToPreset}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATALOG PICKER MODAL (Allows populating slot with any item from DB) */}
      {pickerModalSlotId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPickerModalSlotId(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-apple-modal flex flex-col overflow-hidden border border-black/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/[0.05] bg-[#fafafc] flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="font-semibold text-base text-[#1d1d1f]">
                  {t.swapWithCatalog}
                </h3>
                <p className="text-xs text-[#86868b]">
                  {language === 'de' ? 'Wähle einen Baustein aus, um diesen Programmpunkt zu belegen.' : 'Pick an item to populate this agenda block.'}
                </p>
              </div>

              <button
                onClick={() => setPickerModalSlotId(null)}
                className="p-2 text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="p-3 border-b border-black/[0.04] bg-[#f5f5f7] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'games', label: t.tabGames },
                { id: 'quotes', label: t.tabQuotes },
                { id: 'songs', label: 'Songs' },
                { id: 'service', label: t.subtabServiceProjects },
                { id: 'arts', label: t.subtabArtsPrompts },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPickerFilter(f.id as typeof pickerFilter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    pickerFilter === f.id
                      ? 'bg-[#1d1d1f] text-white shadow-apple-pill font-semibold'
                      : 'bg-white text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Catalog Items List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {/* Games */}
              {(pickerFilter === 'all' || pickerFilter === 'games') && (
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    {t.tabGames} ({GAMES_DATA.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GAMES_DATA.slice(0, 10).map(g => (
                      <div
                        key={g.id}
                        onClick={() => handleSwapSlotWithItem(pickerModalSlotId, 'game', g.id)}
                        className="p-3 bg-[#f5f5f7] hover:bg-black/[0.05] rounded-xl cursor-pointer border border-transparent hover:border-[#0071e3] transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#1d1d1f]">{g.title[language]}</span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-black/[0.05]">{g.durationMinutes}</span>
                        </div>
                        <p className="text-[11px] text-[#86868b] line-clamp-1">{g.summary[language]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes & Methods */}
              {(pickerFilter === 'all' || pickerFilter === 'quotes') && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    {t.tabQuotes} ({QUOTES_DATA.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUOTES_DATA.slice(0, 8).map(q => (
                      <div
                        key={q.id}
                        onClick={() => handleSwapSlotWithItem(pickerModalSlotId, 'quote', q.id)}
                        className="p-3 bg-[#f5f5f7] hover:bg-black/[0.05] rounded-xl cursor-pointer border border-transparent hover:border-[#0071e3] transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#1d1d1f]">{q.theme[language]}</span>
                          <span className="text-[10px] text-[#86868b]">{q.book[language].split(',')[0]}</span>
                        </div>
                        <p className="text-[11px] text-[#86868b] italic line-clamp-1">„{language === 'de' ? q.textDe : q.textEn}“</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Songs */}
              {(pickerFilter === 'all' || pickerFilter === 'songs') && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    Songs ({DEVOTIONAL_SONGS_DATA.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEVOTIONAL_SONGS_DATA.map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleSwapSlotWithItem(pickerModalSlotId, 'song', s.id)}
                        className="p-3 bg-[#f5f5f7] hover:bg-black/[0.05] rounded-xl cursor-pointer border border-transparent hover:border-[#0071e3] transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#1d1d1f]">{s.title[language]}</span>
                          <span className="text-[10px] font-mono text-[#86868b]">({s.key})</span>
                        </div>
                        <p className="text-[11px] text-[#86868b]">{s.theme[language]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Projects */}
              {(pickerFilter === 'all' || pickerFilter === 'service') && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    {t.subtabServiceProjects} ({SERVICE_PROJECTS_DATA.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICE_PROJECTS_DATA.slice(0, 8).map(sp => (
                      <div
                        key={sp.id}
                        onClick={() => handleSwapSlotWithItem(pickerModalSlotId, 'service', sp.id)}
                        className="p-3 bg-[#f5f5f7] hover:bg-black/[0.05] rounded-xl cursor-pointer border border-transparent hover:border-[#0071e3] transition-all space-y-1"
                      >
                        <span className="font-semibold text-xs text-[#1d1d1f] block">{sp.title[language]}</span>
                        <p className="text-[11px] text-[#86868b] line-clamp-1">{sp.objective[language]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Arts Prompts */}
              {(pickerFilter === 'all' || pickerFilter === 'arts') && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                    {t.subtabArtsPrompts} ({ARTS_PROMPTS_DATA.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ARTS_PROMPTS_DATA.map(art => (
                      <div
                        key={art.id}
                        onClick={() => handleSwapSlotWithItem(pickerModalSlotId, 'art', art.id)}
                        className="p-3 bg-[#f5f5f7] hover:bg-black/[0.05] rounded-xl cursor-pointer border border-transparent hover:border-[#0071e3] transition-all space-y-1"
                      >
                        <span className="font-semibold text-xs text-[#1d1d1f] block">{art.title[language]}</span>
                        <p className="text-[11px] text-[#86868b] line-clamp-1">{art.description[language]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
