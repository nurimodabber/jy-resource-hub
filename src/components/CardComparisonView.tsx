import React, { useState } from 'react';
import {
  Users,
  Bookmark,
  Share2,
  Sprout,
  Infinity as InfinityIcon,
  Drama,
  Quote as QuoteIcon,
  Flame,
  Sparkles,
  Layers,
  BookOpen,
  Brain,
  Check,
} from 'lucide-react';
import { Language } from '../types';

interface CardComparisonViewProps {
  language?: Language;
}

export const CardComparisonView: React.FC<CardComparisonViewProps> = () => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'v1-dienst': false,
    'v1-spiel': true,
    'v1-theater': false,
    'v1-zitat': true,
  });

  const toggleFav = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyFeedback = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-zinc-100 font-sans pb-32">
      {/* Sticky Subnav Bar */}
      <header className="sticky top-0 z-40 bg-[#0E0F12]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" /> Redesign V2 Vergleich
              </span>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                Karten-System: 5 Design-Varianten im Direktvergleich
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identischer 4-Karten-Datensatz (Dienstprojekt, Spiel, Kreative Aktivität, Heiliges Zitat) in 5 kuratierten Stilen.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
            <a href="#variation-1" className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 transition-colors whitespace-nowrap">
              1. Linear Precision
            </a>
            <a href="#variation-2" className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 transition-colors whitespace-nowrap">
              2. Editorial Literary
            </a>
            <a href="#variation-3" className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 transition-colors whitespace-nowrap">
              3. Semantic Glow
            </a>
            <a href="#variation-4" className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 transition-colors whitespace-nowrap">
              4. Facilitator Spec
            </a>
            <a href="#variation-5" className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 transition-colors whitespace-nowrap">
              5. Minimalist Glass
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">

        {/* Intro Banner */}
        <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
              Behobene Baseline-Inkonsistenzen in allen 5 Varianten:
            </h2>
            <ul className="text-xs text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-1 list-disc list-inside">
              <li><strong className="text-zinc-300">Teilnehmer-Label:</strong> Immer konsistent »4–20 Personen« & »6–16 Personen«</li>
              <li><strong className="text-zinc-300">Aktions-Positionierung:</strong> Bookmark & Share immer einheitlich oben rechts</li>
              <li><strong className="text-zinc-300">Wasserzeichen entfernt:</strong> Keine unruhigen, verpixelten Riesen-Vektoren mehr</li>
              <li><strong className="text-zinc-300">Footer-Ausrichtung:</strong> Perfekte Grundlinien-Harmonie über <code className="text-zinc-400 font-mono">mt-auto</code></li>
            </ul>
          </div>
          <div className="text-xs text-zinc-400 border-l border-white/[0.08] pl-4 hidden md:block">
            Viewport: <strong>Responsive Grid</strong><br />
            Hover & Klick auf Lesezeichen sind interaktiv.
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* VARIATION 1: Linear / Raycast Precision */}
        {/* ------------------------------------------------------------------ */}
        <section id="variation-1" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.08] pb-3 gap-2">
            <div>
              <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest">
                Variation 1
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Linear / Raycast Precision
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Technischer Dark Mode, 14px Micro-Pill Kategorie-Icons, strukturierte Metadaten-Chips, subtiler oberer Kanten-Lichteinfall.
              </p>
            </div>
            <button
              onClick={() => copyFeedback('v1')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedId === 'v1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
              {copiedId === 'v1' ? 'Favorisiert' : 'V1 als Favorit merken'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Card 1: Dienstprojekt */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-white/[0.16] hover:bg-[#15171b] transition-all duration-150">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sprout className="w-3.5 h-3.5" />
                    Dienstprojekt
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">90–120 Min</span>
                </div>
                <button
                  onClick={() => toggleFav('v1-dienst')}
                  className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                  aria-label="Merken"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v1-dienst'] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-zinc-100 group-hover:text-white tracking-[-0.01em] mb-2">
                Stadtteil-Putz &amp; Müll-Audit
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 max-w-[60ch] mb-6">
                Den eigenen Sozialraum konkret von Müll befreien und durch ein systematisches Audit verstehen, welche Konsummuster den Stadtteil belasten.
              </p>

              <div className="mt-auto pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  4–20 Personen
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  Draußen
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  Kooperation
                </span>
              </div>
            </div>

            {/* Card 2: Spiel */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-white/[0.16] hover:bg-[#15171b] transition-all duration-150">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <InfinityIcon className="w-3.5 h-3.5" />
                    Spiel
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">10–20 Min</span>
                </div>
                <button
                  onClick={() => toggleFav('v1-spiel')}
                  className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                  aria-label="Merken"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v1-spiel'] ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-zinc-100 group-hover:text-white tracking-[-0.01em] mb-2">
                Der menschliche Knoten
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 max-w-[60ch] mb-6">
                Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch geschicktes Steigen und Drehen entknoten.
              </p>

              <div className="mt-auto pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  6–16 Personen
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Mittel
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  Ohne Material
                </span>
              </div>
            </div>

            {/* Card 3: Kreative Aktivität */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-white/[0.16] hover:bg-[#15171b] transition-all duration-150">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Drama className="w-3.5 h-3.5" />
                    Kreativ
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">45–60 Min</span>
                </div>
                <button
                  onClick={() => toggleFav('v1-theater')}
                  className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                  aria-label="Merken"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v1-theater'] ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-zinc-100 group-hover:text-white tracking-[-0.01em] mb-2">
                Theater: Die Weggabelung
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 max-w-[60ch] mb-6">
                Ein kurzes Szenenspiel in zwei Akten: Wie verändert sich der Ausgang einer scheinbar unlösbaren Situation, wenn jemand aufgibt vs. mutig vorangeht.
              </p>

              <div className="mt-auto pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  4–20 Personen
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <BookOpen className="w-3 h-3 text-zinc-400" />
                  Buch 1
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  Drinnen
                </span>
              </div>
            </div>

            {/* Card 4: Heiliges Zitat */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#121316] border border-dashed border-amber-500/30 hover:border-amber-500/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:bg-[#16171c] transition-all duration-150">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <QuoteIcon className="w-3.5 h-3.5" />
                    Zitat · Lektion 1
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFav('v1-zitat')}
                    className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                    aria-label="Merken"
                  >
                    <Bookmark className={`w-4 h-4 ${favorites['v1-zitat'] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <blockquote className="font-serif text-[17px] leading-[1.65] text-zinc-200 group-hover:text-white mb-6">
                »Ihr seid erschaffen, einander Liebe zu bezeigen, nicht Eigensinn und Groll. Seid nicht stolz auf eure Eigenliebe, sondern auf die Liebe zu euren Mitgeschöpfen. Rühmt euch nicht der Liebe zu eurem Vaterland, sondern der Liebe zur ganzen Menschheit.«
              </blockquote>

              <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="font-serif text-amber-200/90 tracking-wide font-medium">
                  — Bahá'u'lláh
                </span>
                <span className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors">
                  <Brain className="w-3.5 h-3.5" />
                  Lernen
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* VARIATION 2: Editorial Literary (Readwise / NYT Dark) */}
        {/* ------------------------------------------------------------------ */}
        <section id="variation-2" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.08] pb-3 gap-2">
            <div>
              <span className="text-xs font-mono font-medium text-amber-300 uppercase tracking-widest">
                Variation 2
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Editorial Literary
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Warmes Obsidian (#161514), großzügige 28px Innenabstände, Hairline-Trenner über dem Titel, Lora Serif dominant.
              </p>
            </div>
            <button
              onClick={() => copyFeedback('v2')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedId === 'v2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
              {copiedId === 'v2' ? 'Favorisiert' : 'V2 als Favorit merken'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Card 1: Dienstprojekt */}
            <div className="group relative flex flex-col p-7 rounded-2xl bg-[#161514] border border-[rgba(255,248,240,0.06)] hover:border-[rgba(255,248,240,0.14)] transition-all duration-200">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-wider text-emerald-300/80 font-mono pb-3 border-b border-white/[0.06] mb-4">
                <span className="whitespace-nowrap">Dienstprojekt · 90–120 Min</span>
                <button
                  onClick={() => toggleFav('v2-dienst')}
                  className="text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v2-dienst'] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[23px] font-normal leading-snug text-[#F5F5F4] group-hover:text-white mb-2.5">
                Stadtteil-Putz &amp; Müll-Audit
              </h3>

              <p className="text-sm leading-relaxed text-[#A8A29E] line-clamp-2 mb-6">
                Den eigenen Sozialraum konkret von Müll befreien und durch ein systematisches Audit verstehen, welche Konsummuster den Stadtteil belasten.
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-stone-400 border-t border-white/[0.04]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  4–20 Personen
                </span>
                <span>Draußen</span>
              </div>
            </div>

            {/* Card 2: Spiel */}
            <div className="group relative flex flex-col p-7 rounded-2xl bg-[#161514] border border-[rgba(255,248,240,0.06)] hover:border-[rgba(255,248,240,0.14)] transition-all duration-200">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-wider text-indigo-300/80 font-mono pb-3 border-b border-white/[0.06] mb-4">
                <span className="whitespace-nowrap">Spiel · 10–20 Min</span>
                <button
                  onClick={() => toggleFav('v2-spiel')}
                  className="text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v2-spiel'] ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[23px] font-normal leading-snug text-[#F5F5F4] group-hover:text-white mb-2.5">
                Der menschliche Knoten
              </h3>

              <p className="text-sm leading-relaxed text-[#A8A29E] line-clamp-2 mb-6">
                Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch geschicktes Steigen und Drehen entknoten.
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-stone-400 border-t border-white/[0.04]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  6–16 Personen
                </span>
                <span>Mittlere Energie</span>
              </div>
            </div>

            {/* Card 3: Kreativ */}
            <div className="group relative flex flex-col p-7 rounded-2xl bg-[#161514] border border-[rgba(255,248,240,0.06)] hover:border-[rgba(255,248,240,0.14)] transition-all duration-200">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-wider text-rose-300/80 font-mono pb-3 border-b border-white/[0.06] mb-4">
                <span className="whitespace-nowrap">Theater · 45–60 Min</span>
                <button
                  onClick={() => toggleFav('v2-theater')}
                  className="text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v2-theater'] ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[23px] font-normal leading-snug text-[#F5F5F4] group-hover:text-white mb-2.5">
                Theater: Die Weggabelung
              </h3>

              <p className="text-sm leading-relaxed text-[#A8A29E] line-clamp-2 mb-6">
                Ein kurzes Szenenspiel in zwei Akten: Wie verändert sich der Ausgang einer scheinbar unlösbaren Situation, wenn jemand aufgibt vs. mutig vorangeht.
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-stone-400 border-t border-white/[0.04]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  4–20 Personen
                </span>
                <span>Drinnen</span>
              </div>
            </div>

            {/* Card 4: Zitat */}
            <div className="group relative flex flex-col p-7 rounded-2xl bg-[#1C1A18] border-l-4 border-amber-400/70 border-y border-r border-[rgba(255,248,240,0.06)] shadow-lg hover:border-[rgba(255,248,240,0.16)] transition-all duration-200">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-wider text-amber-200/80 font-mono pb-3 border-b border-white/[0.06] mb-4 gap-2">
                <span className="truncate">Buch 1 · Lektion 1</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFav('v2-zitat')}
                    className="text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${favorites['v2-zitat'] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button className="text-stone-400 hover:text-stone-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <blockquote className="font-serif italic text-[18px] leading-[1.65] text-amber-100/90 mb-6">
                »Ihr seid erschaffen, einander Liebe zu bezeigen, nicht Eigensinn und Groll. Seid nicht stolz auf eure Eigenliebe, sondern auf die Liebe zu euren Mitgeschöpfen. Rühmt euch nicht der Liebe zu eurem Vaterland, sondern der Liebe zur ganzen Menschheit.«
              </blockquote>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-white/[0.04]">
                <span className="font-serif not-italic text-sm text-amber-200/90 font-medium">
                  — Bahá'u'lláh
                </span>
                <span className="font-mono text-[11px] text-amber-300/60 uppercase">Heiliger Text</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* VARIATION 3: Subtle Semantic Glow (Color-Coded Bento) */}
        {/* ------------------------------------------------------------------ */}
        <section id="variation-3" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.08] pb-3 gap-2">
            <div>
              <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-widest">
                Variation 3
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Subtle Semantic Glow
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Kategorie-Erkennung in 0,2 Sekunden via 8% sanftem Eck-Glow (Smaragd, Indigo, Rose, Gold), leuchtender Status-Punkt, Full-Bleed Divider.
              </p>
            </div>
            <button
              onClick={() => copyFeedback('v3')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedId === 'v3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
              {copiedId === 'v3' ? 'Favorisiert' : 'V3 als Favorit merken'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Card 1: Dienst */}
            <div className="group relative overflow-hidden flex flex-col p-6 rounded-2xl bg-[#131316] border border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200">
              {/* Radial Glow */}
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-15"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  <span className="text-xs font-medium text-zinc-300">Dienstprojekt</span>
                  <span className="text-xs text-zinc-500">· 90–120 Min</span>
                </div>
                <button
                  onClick={() => toggleFav('v3-dienst')}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v3-dienst'] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-zinc-100 group-hover:text-white mb-2">
                Stadtteil-Putz &amp; Müll-Audit
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Den eigenen Sozialraum konkret von Müll befreien und durch ein systematisches Audit verstehen, welche Konsummuster den Stadtteil belasten.
              </p>

              <div className="mt-auto -mx-6 -mb-6 px-6 py-3.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  4–20 Personen
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                  Draußen
                </span>
              </div>
            </div>

            {/* Card 2: Spiel */}
            <div className="group relative overflow-hidden flex flex-col p-6 rounded-2xl bg-[#131316] border border-white/[0.08] hover:border-indigo-500/30 transition-all duration-200">
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-15"
                style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366f1]" />
                  <span className="text-xs font-medium text-zinc-300">Spiel</span>
                  <span className="text-xs text-zinc-500">· 10–20 Min</span>
                </div>
                <button
                  onClick={() => toggleFav('v3-spiel')}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v3-spiel'] ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-zinc-100 group-hover:text-white mb-2">
                Der menschliche Knoten
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch geschicktes Steigen und Drehen entknoten.
              </p>

              <div className="mt-auto -mx-6 -mb-6 px-6 py-3.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  6–16 Personen
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                  Mittlere Energie
                </span>
              </div>
            </div>

            {/* Card 3: Kreativ */}
            <div className="group relative overflow-hidden flex flex-col p-6 rounded-2xl bg-[#131316] border border-white/[0.08] hover:border-rose-500/30 transition-all duration-200">
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-15"
                style={{ background: 'radial-gradient(circle, #F43F5E 0%, transparent 70%)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                  <span className="text-xs font-medium text-zinc-300">Kreativ</span>
                  <span className="text-xs text-zinc-500">· 45–60 Min</span>
                </div>
                <button
                  onClick={() => toggleFav('v3-theater')}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v3-theater'] ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-zinc-100 group-hover:text-white mb-2">
                Theater: Die Weggabelung
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Ein kurzes Szenenspiel in zwei Akten: Wie verändert sich der Ausgang einer scheinbar unlösbaren Situation, wenn jemand aufgibt vs. mutig vorangeht.
              </p>

              <div className="mt-auto -mx-6 -mb-6 px-6 py-3.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  4–20 Personen
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]">
                  Schauspiel
                </span>
              </div>
            </div>

            {/* Card 4: Zitat */}
            <div className="group relative overflow-hidden flex flex-col p-6 rounded-2xl bg-[#141318] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200">
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-20"
                style={{ background: 'radial-gradient(circle, #D97706 0%, transparent 70%)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#d97706] shrink-0" />
                  <span className="text-xs font-medium text-amber-200 truncate">Buch 1 · Lektion 1</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFav('v3-zitat')}
                    className="p-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${favorites['v3-zitat'] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <blockquote className="font-serif text-[17px] leading-[1.65] text-amber-50/90 mb-6">
                »Ihr seid erschaffen, einander Liebe zu bezeigen, nicht Eigensinn und Groll. Seid nicht stolz auf eure Eigenliebe, sondern auf die Liebe zu euren Mitgeschöpfen. Rühmt euch nicht der Liebe zu eurem Vaterland, sondern der Liebe zur ganzen Menschheit.«
              </blockquote>

              <div className="mt-auto -mx-6 -mb-6 px-6 py-3.5 border-t border-amber-500/10 bg-amber-500/[0.02] flex items-center justify-between text-xs">
                <span className="font-serif text-amber-200 font-medium">
                  — Bahá'u'lláh
                </span>
                <span className="text-[11px] text-zinc-400">Heiliger Text</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* VARIATION 4: Structured Facilitator Spec-Sheet */}
        {/* ------------------------------------------------------------------ */}
        <section id="variation-4" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.08] pb-3 gap-2">
            <div>
              <span className="text-xs font-mono font-medium text-purple-400 uppercase tracking-widest">
                Variation 4
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Structured Facilitator Spec-Sheet
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Optimiert für schnelles Planen unter Zeitdruck: 3-Spalten Spec-Bar unten (Dauer, Personen, Setting), Zitat bricht das Raster harmonisch.
              </p>
            </div>
            <button
              onClick={() => copyFeedback('v4')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedId === 'v4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
              {copiedId === 'v4' ? 'Favorisiert' : 'V4 als Favorit merken'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Card 1: Dienst */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/[0.16] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Dienstprojekt
                </span>
                <button
                  onClick={() => toggleFav('v4-dienst')}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v4-dienst'] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-white mb-2">
                Stadtteil-Putz &amp; Müll-Audit
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Den eigenen Sozialraum konkret von Müll befreien und durch ein systematisches Audit verstehen, welche Konsummuster den Stadtteil belasten.
              </p>

              {/* 3-Spalten Spec-Bar */}
              <div className="mt-auto -mx-6 -mb-6 rounded-b-2xl bg-white/[0.02] border-t border-white/[0.06] px-4 py-3 grid grid-cols-3 gap-2 text-center text-xs divide-x divide-white/[0.06]">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase">Dauer</span>
                  <span className="font-medium text-zinc-200 mt-0.5">90–120m</span>
                </div>
                <div className="flex flex-col items-center justify-center pl-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Gruppe</span>
                  <span className="font-medium text-zinc-200 mt-0.5 whitespace-nowrap">4–20 Pers.</span>
                </div>
                <div className="flex flex-col items-center justify-center pl-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Ort</span>
                  <span className="font-medium text-zinc-200 mt-0.5">Draußen</span>
                </div>
              </div>
            </div>

            {/* Card 2: Spiel */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/[0.16] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Spiel
                </span>
                <button
                  onClick={() => toggleFav('v4-spiel')}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v4-spiel'] ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-white mb-2">
                Der menschliche Knoten
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch geschicktes Steigen und Drehen entknoten.
              </p>

              {/* 3-Spalten Spec-Bar */}
              <div className="mt-auto -mx-6 -mb-6 rounded-b-2xl bg-white/[0.02] border-t border-white/[0.06] px-4 py-3 grid grid-cols-3 gap-2 text-center text-xs divide-x divide-white/[0.06]">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase">Dauer</span>
                  <span className="font-medium text-zinc-200 mt-0.5">10–20m</span>
                </div>
                <div className="flex flex-col items-center justify-center pl-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Gruppe</span>
                  <span className="font-medium text-zinc-200 mt-0.5 whitespace-nowrap">6–16 Pers.</span>
                </div>
                <div className="flex flex-col items-center justify-center pl-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Energie</span>
                  <span className="font-medium text-zinc-200 mt-0.5">Mittel</span>
                </div>
              </div>
            </div>

            {/* Card 3: Kreativ */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#141417] border border-white/[0.08] hover:border-white/[0.16] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Kreativ
                </span>
                <button
                  onClick={() => toggleFav('v4-theater')}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v4-theater'] ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-white mb-2">
                Theater: Die Weggabelung
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Ein kurzes Szenenspiel in zwei Akten: Wie verändert sich der Ausgang einer scheinbar unlösbaren Situation, wenn jemand aufgibt vs. mutig vorangeht.
              </p>

              {/* 3-Spalten Spec-Bar */}
              <div className="mt-auto -mx-6 -mb-6 rounded-b-2xl bg-white/[0.02] border-t border-white/[0.06] px-4 py-3 grid grid-cols-3 gap-2 text-center text-xs divide-x divide-white/[0.06]">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 uppercase">Dauer</span>
                  <span className="font-medium text-zinc-200 mt-0.5">45–60m</span>
                </div>
                <div className="flex flex-col items-center justify-center pl-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Gruppe</span>
                  <span className="font-medium text-zinc-200 mt-0.5 whitespace-nowrap">4–20 Pers.</span>
                </div>
                <div className="flex flex-col items-center justify-center pl-2">
                  <span className="text-[10px] text-zinc-500 uppercase">Ort</span>
                  <span className="font-medium text-zinc-200 mt-0.5">Drinnen</span>
                </div>
              </div>
            </div>

            {/* Card 4: Zitat - breaks spec sheet grid deliberately */}
            <div className="group relative flex flex-col p-6 rounded-2xl bg-[#17161b] border border-amber-500/30 hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Brisen der Bestätigung · Lektion 1
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFav('v4-zitat')}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <Bookmark className={`w-4 h-4 ${favorites['v4-zitat'] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button className="p-1 text-zinc-400 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <blockquote className="font-serif text-[17px] leading-[1.65] text-amber-100/90 mb-6">
                »Ihr seid erschaffen, einander Liebe zu bezeigen, nicht Eigensinn und Groll. Seid nicht stolz auf eure Eigenliebe, sondern auf die Liebe zu euren Mitgeschöpfen. Rühmt euch nicht der Liebe zu eurem Vaterland, sondern der Liebe zur ganzen Menschheit.«
              </blockquote>

              <div className="mt-auto -mx-6 -mb-6 rounded-b-2xl bg-amber-500/[0.04] border-t border-amber-500/20 px-6 py-3.5 flex items-center justify-between text-xs">
                <span className="font-serif text-amber-200 font-medium">
                  — Bahá'u'lláh
                </span>
                <span className="text-zinc-400 text-[11px]">Auswendiglernen</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* VARIATION 5: Minimalist Glass & Micro-Interaction */}
        {/* ------------------------------------------------------------------ */}
        <section id="variation-5" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.08] pb-3 gap-2">
            <div>
              <span className="text-xs font-mono font-medium text-pink-400 uppercase tracking-widest">
                Variation 5
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Minimalist Glass &amp; Micro-Interaction
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Apple/Arc Style: 36x36px abgerundete Icon-Kachel, 24px Rundung, ruhiger Weißraum, übergroße typografische Anführungszeichen beim Zitat.
              </p>
            </div>
            <button
              onClick={() => copyFeedback('v5')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-zinc-300 transition-colors self-start sm:self-auto"
            >
              {copiedId === 'v5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
              {copiedId === 'v5' ? 'Favorisiert' : 'V5 als Favorit merken'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Card 1: Dienst */}
            <div className="group relative flex flex-col p-6 rounded-3xl bg-[#18181B] border border-white/[0.08] hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Dienstprojekt</div>
                    <div className="text-[11px] text-zinc-500">90–120 Min</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFav('v5-dienst')}
                  className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v5-dienst'] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-white mb-2">
                Stadtteil-Putz &amp; Müll-Audit
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Den eigenen Sozialraum konkret von Müll befreien und durch ein systematisches Audit verstehen, welche Konsummuster den Stadtteil belasten.
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  4–20 Personen
                </span>
                <span className="text-zinc-500">Draußen</span>
              </div>
            </div>

            {/* Card 2: Spiel */}
            <div className="group relative flex flex-col p-6 rounded-3xl bg-[#18181B] border border-white/[0.08] hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <InfinityIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Spiel</div>
                    <div className="text-[11px] text-zinc-500">10–20 Min</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFav('v5-spiel')}
                  className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v5-spiel'] ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-white mb-2">
                Der menschliche Knoten
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Alle greifen sich kreuz und quer an den Händen und müssen das Gewirr durch geschicktes Steigen und Drehen entknoten.
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  6–16 Personen
                </span>
                <span className="text-zinc-500">Mittel</span>
              </div>
            </div>

            {/* Card 3: Kreativ */}
            <div className="group relative flex flex-col p-6 rounded-3xl bg-[#18181B] border border-white/[0.08] hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Drama className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Kreativ</div>
                    <div className="text-[11px] text-zinc-500">45–60 Min</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFav('v5-theater')}
                  className="p-2 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${favorites['v5-theater'] ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <h3 className="font-serif text-[21px] font-medium leading-snug text-white mb-2">
                Theater: Die Weggabelung
              </h3>

              <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 mb-6">
                Ein kurzes Szenenspiel in zwei Akten: Wie verändert sich der Ausgang einer scheinbar unlösbaren Situation, wenn jemand aufgibt vs. mutig vorangeht.
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  4–20 Personen
                </span>
                <span className="text-zinc-500">Drinnen</span>
              </div>
            </div>

            {/* Card 4: Zitat mit Watermark Anführungszeichen */}
            <div className="group relative overflow-hidden flex flex-col p-6 rounded-3xl bg-[#1a191f] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-0.5">
              {/* Subtle background quotation marks */}
              <span className="absolute -top-3 left-4 text-8xl font-serif text-white/[0.03] select-none pointer-events-none">
                “
              </span>

              <div className="flex items-center justify-between mb-4 z-10">
                <span className="text-xs font-medium text-amber-200/90">
                  Brisen der Bestätigung · Lektion 1
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFav('v5-zitat')}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white"
                  >
                    <Bookmark className={`w-4 h-4 ${favorites['v5-zitat'] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <blockquote className="font-serif text-[17px] leading-[1.65] text-zinc-200 group-hover:text-white mb-6 z-10">
                »Ihr seid erschaffen, einander Liebe zu bezeigen, nicht Eigensinn und Groll. Seid nicht stolz auf eure Eigenliebe, sondern auf die Liebe zu euren Mitgeschöpfen. Rühmt euch nicht der Liebe zu eurem Vaterland, sondern der Liebe zur ganzen Menschheit.«
              </blockquote>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.06] z-10">
                <span className="font-serif text-amber-200 font-medium">
                  — Bahá'u'lláh
                </span>
                <span className="text-[11px] text-zinc-500">Heiliger Text</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
