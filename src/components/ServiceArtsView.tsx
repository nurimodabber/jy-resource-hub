import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Palette, Heart, Check, Copy, Clock, Plus, 
  X, MessageCircle, ChevronRight, SlidersHorizontal, Sparkles 
} from 'lucide-react';
import { 
  Language, ServiceProject, ArtsPrompt, ServiceProjectCategory, 
  ServiceProjectScope, ArtForm, SessionSlot 
} from '../types';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { UI_TRANSLATIONS } from '../data/translations';
import { Badge } from './ui/Badge';
import { Dialog } from './ui/Dialog';
import { Sheet } from './ui/Sheet';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';
import { generateWhatsAppLink } from '../utils/share';

interface ServiceArtsViewProps {
  language: Language;
  searchQuery: string;
  onAddToPlanner?: (slot: SessionSlot) => void;
  selectedId?: string | null;
}

type TabType = 'all' | 'service' | 'arts';

export const ServiceArtsView: React.FC<ServiceArtsViewProps> = ({
  language,
  searchQuery: externalSearchQuery,
  selectedId: propSelectedId,
}) => {
  const { id: routeId } = useParams<{ id?: string }>();
  const effectiveId = propSelectedId ?? routeId;
  const t = UI_TRANSLATIONS[language];
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceProjectCategory | 'all'>('all');
  const [selectedScope, setSelectedScope] = useState<ServiceProjectScope | 'all'>('all');
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm | 'all'>('all');

  const [activeItem, setActiveItem] = useState<{
    type: 'service' | 'art';
    data: ServiceProject | ArtsPrompt;
  } | null>(null);

  // Sync prop / route param
  useEffect(() => {
    if (effectiveId) {
      const serviceMatch = SERVICE_PROJECTS_DATA.find((p) => p.id === effectiveId);
      if (serviceMatch) {
        setActiveItem({ type: 'service', data: serviceMatch });
        return;
      }
      const artMatch = ARTS_PROMPTS_DATA.find((a) => a.id === effectiveId);
      if (artMatch) {
        setActiveItem({ type: 'art', data: artMatch });
      }
    } else {
      setActiveItem(null);
    }
  }, [effectiveId]);

  const effectiveSearch = externalSearchQuery || localSearch;

  // Filtered service items
  const filteredProjects = useMemo(() => {
    if (activeTab === 'arts') return [];
    return SERVICE_PROJECTS_DATA.filter((proj) => {
      if (effectiveSearch.trim()) {
        const q = effectiveSearch.toLowerCase();
        const matchesTitle = proj.title[language].toLowerCase().includes(q);
        const matchesObj = proj.objective[language].toLowerCase().includes(q);
        if (!matchesTitle && !matchesObj) return false;
      }
      if (selectedCategory !== 'all' && proj.category !== selectedCategory) return false;
      if (selectedScope !== 'all' && proj.scope !== selectedScope) return false;
      return true;
    });
  }, [activeTab, effectiveSearch, language, selectedCategory, selectedScope]);

  // Filtered arts items
  const filteredArts = useMemo(() => {
    if (activeTab === 'service') return [];
    return ARTS_PROMPTS_DATA.filter((art) => {
      if (effectiveSearch.trim()) {
        const q = effectiveSearch.toLowerCase();
        const matchesTitle = art.title[language].toLowerCase().includes(q);
        const matchesDesc = art.description[language].toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (selectedArtForm !== 'all' && art.artForm !== selectedArtForm) return false;
      return true;
    });
  }, [activeTab, effectiveSearch, language, selectedArtForm]);

  const totalCount = filteredProjects.length + filteredArts.length;

  const handleSelectItem = (type: 'service' | 'art', item: ServiceProject | ArtsPrompt) => {
    setActiveItem({ type, data: item });
  };

  const handleCloseDialog = () => {
    setActiveItem(null);
  };

  const handleAddToPlan = () => {
    if (!activeItem) return;
    if (activeItem.type === 'service') {
      const proj = activeItem.data as ServiceProject;
      const result = addSlotToPlan({
        type: 'service',
        title: proj.title,
        durationMinutes: 45,
        description: proj.objective,
        referenceId: proj.id,
        referenceType: 'service',
      });
      showToast({
        text: language === 'de' ? 'Projekt zum Plan hinzugefügt' : 'Project added to plan',
        action: { label: language === 'de' ? 'Plan öffnen' : 'Open Plan', onClick: () => navigate('/planner') },
        undo: { label: language === 'de' ? 'Rückgängig' : 'Undo', onClick: () => result.undo() },
      });
    } else {
      const art = activeItem.data as ArtsPrompt;
      const result = addSlotToPlan({
        type: 'arts_discussion',
        title: art.title,
        durationMinutes: 30,
        description: art.description,
        referenceId: art.id,
        referenceType: 'art',
      });
      showToast({
        text: language === 'de' ? 'Kunst-Aktivität hinzugefügt' : 'Art activity added',
        action: { label: language === 'de' ? 'Plan öffnen' : 'Open Plan', onClick: () => navigate('/planner') },
        undo: { label: language === 'de' ? 'Rückgängig' : 'Undo', onClick: () => result.undo() },
      });
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!activeItem) return;
    let text: string;
    if (activeItem.type === 'service') {
      const p = activeItem.data as ServiceProject;
      text = `${p.title[language]}\n\n${p.objective[language]}\n\nSchritte:\n${p.steps[language].map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    } else {
      const a = activeItem.data as ArtsPrompt;
      text = `${a.title[language]} (${a.book[language]})\n\n${a.description[language]}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* 1. Section Header & Segment Control */}
      <div className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {t.tabServiceArts}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              {language === 'de' 
                ? 'Gemeindeprojekte & kreative Kunstideen für Juniorjugendgruppen.' 
                : 'Community service and creative arts for junior youth.'}
            </p>
          </div>

          {/* Segment Toggle: Alle / Dienst / Kunst */}
          <div className="flex items-center p-1 bg-surface-2 rounded-2xl border border-border shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-surface text-text shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {language === 'de' ? 'Alle' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('service')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'service'
                  ? 'bg-surface text-text shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-accent-text" />
              <span>{language === 'de' ? 'Dienst' : 'Service'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'arts'
                  ? 'bg-surface text-text shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-accent-text" />
              <span>{language === 'de' ? 'Kunst' : 'Arts'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filter Sheet Button */}
        <div className="mt-4 flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'de' ? 'Projekte & Kunstideen durchsuchen...' : 'Search service & art prompts...'}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[40px] ${
              selectedCategory !== 'all' || selectedScope !== 'all' || selectedArtForm !== 'all'
                ? 'bg-accent text-accent-contrast border-accent'
                : 'bg-surface-2 text-text-secondary hover:text-text border-border'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'de' ? 'Filter' : 'Filter'}</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Cards Grid (Same anatomy as Spiele) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Projects */}
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            role="button"
            tabIndex={0}
            onClick={() => handleSelectItem('service', project)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectItem('service', project);
              }
            }}
            className="group relative bg-surface rounded-2xl border border-border p-5 shadow-xs hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge category="service" size="sm">
                    {language === 'de' ? 'Dienstprojekt' : 'Service Project'}
                  </Badge>
                  <Badge category="neutral" size="sm">
                    {project.duration[language]}
                  </Badge>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors mb-1.5 leading-snug">
                {project.title[language]}
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">
                {project.objective[language]}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span className="text-text-tertiary">
                {project.steps[language].length} {language === 'de' ? 'Schritte' : 'steps'}
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-accent-text group-hover:translate-x-1 transition-transform">
                <span>{language === 'de' ? 'Details ansehen' : 'View Details'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}

        {/* Arts Prompts */}
        {filteredArts.map((art) => (
          <article
            key={art.id}
            role="button"
            tabIndex={0}
            onClick={() => handleSelectItem('art', art)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectItem('art', art);
              }
            }}
            className="group relative bg-surface rounded-2xl border border-border p-5 shadow-xs hover:border-accent/40 hover:shadow-apple-card transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge category="arts" size="sm">
                    {art.theme[language]}
                  </Badge>
                  <Badge category="neutral" size="sm">
                    {art.book[language]}
                  </Badge>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-accent transition-colors mb-1.5 leading-snug">
                {art.title[language]}
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">
                {art.description[language]}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <span className="text-text-tertiary">
                {art.guidingSteps[language].length} {language === 'de' ? 'Schritte' : 'steps'}
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-accent-text group-hover:translate-x-1 transition-transform">
                <span>{language === 'de' ? 'Details ansehen' : 'View Details'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {totalCount === 0 && (
        <div className="p-8 text-center bg-surface rounded-3xl border border-border">
          <p className="text-sm text-text-secondary">
            {language === 'de' ? 'Keine Aktivitäten für diese Filter gefunden.' : 'No activities found matching these filters.'}
          </p>
        </div>
      )}

      {/* 3. Detail Dialog (Same design & order as Spiele) */}
      {activeItem && (
        <Dialog
          isOpen={true}
          onClose={handleCloseDialog}
          maxWidth="lg"
          showCloseButton={false}
        >
          <div className="space-y-5">
            {/* Title Row with Close X */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge category={activeItem.type === 'service' ? 'service' : 'arts'} size="md">
                    {activeItem.type === 'service' ? (language === 'de' ? 'Dienstprojekt' : 'Service') : (language === 'de' ? 'Kreativer Ausdruck' : 'Arts')}
                  </Badge>
                  {activeItem.type === 'art' && (
                    <Badge category="neutral" size="md">
                      {(activeItem.data as ArtsPrompt).book[language]}
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight leading-tight">
                  {activeItem.data.title[language]}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDialog}
                className="p-2 rounded-full text-text-secondary hover:text-text transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-surface-2 rounded-2xl border border-border text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-tertiary text-2xs font-medium">{language === 'de' ? 'Dauer' : 'Duration'}</p>
                  <p className="font-semibold text-text leading-snug">
                    {activeItem.type === 'service' ? (activeItem.data as ServiceProject).duration[language] : '30–45 Min.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
                <div>
                  <p className="text-text-tertiary text-2xs font-medium">{language === 'de' ? 'Fokus' : 'Focus'}</p>
                  <p className="font-semibold text-text leading-snug">
                    {activeItem.type === 'service' ? (language === 'de' ? 'Gemeindedienst' : 'Community') : (activeItem.data as ArtsPrompt).theme[language]}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button: "Zum Plan hinzufügen" */}
            <div>
              <button
                type="button"
                onClick={handleAddToPlan}
                className="w-full py-3 px-4 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'de' ? 'Zum Plan hinzufügen' : 'Add to Session Plan'}</span>
              </button>
            </div>

            {/* Content: Description & Steps */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {language === 'de' ? 'Ziel & Beschreibung' : 'Objective & Description'}
                </h3>
                <p className="text-text bg-surface-2 border border-border p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm">
                  {activeItem.type === 'service' 
                    ? (activeItem.data as ServiceProject).objective[language]
                    : (activeItem.data as ArtsPrompt).description[language]}
                </p>
              </div>

              {/* Materials */}
              {activeItem.data.materials[language].length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                    {language === 'de' ? 'Benötigtes Material' : 'Materials Needed'}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.data.materials[language].map((mat, i) => (
                      <span key={i} className="text-xs font-medium bg-surface-2 text-text px-2.5 py-1 rounded-full border border-border">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Guiding Steps */}
              <div className="space-y-2">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {language === 'de' ? 'Schritt für Schritt' : 'Step by Step'}
                </h3>
                <div className="space-y-2 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
                  {(activeItem.type === 'service' 
                    ? (activeItem.data as ServiceProject).steps[language] 
                    : (activeItem.data as ArtsPrompt).guidingSteps[language]
                  ).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-2 border border-border">
                      <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-text leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Utilities */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer min-h-[36px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'de' ? 'Kopiert!' : 'Copied!') : (language === 'de' ? 'Kopieren' : 'Copy')}</span>
              </button>

              <a
                href={generateWhatsAppLink(
                  `${activeItem.data.title[language]} — JY Hub`,
                  `${window.location.origin}/service-arts`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer min-h-[36px]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </Dialog>
      )}

      {/* 4. Filter Sheet */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title={language === 'de' ? 'Filter & Kategorien' : 'Filters & Categories'}
        position="bottom"
      >
        <div className="space-y-5 pb-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {language === 'de' ? 'Dienst-Umfang' : 'Service Scope'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedScope('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedScope === 'all'
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {language === 'de' ? 'Alle Umfänge' : 'All Scopes'}
              </button>
              {(['quick', 'medium', 'deep'] as ServiceProjectScope[]).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setSelectedScope(scope)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedScope === scope
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {scope === 'quick' ? '1–2h Quick' : scope === 'medium' ? 'Halbtag' : 'Mehrtägig'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {language === 'de' ? 'Projekt-Kategorie' : 'Project Category'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {language === 'de' ? 'Alle Kategorien' : 'All Categories'}
              </button>
              {(['neighborhood', 'environmental', 'intergenerational', 'children', 'institutional', 'creative'] as ServiceProjectCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {cat === 'neighborhood' ? (language === 'de' ? 'Nachbarschaft' : 'Neighborhood')
                    : cat === 'environmental' ? (language === 'de' ? 'Umwelt' : 'Environment')
                    : cat === 'intergenerational' ? (language === 'de' ? 'Generationen' : 'Intergenerational')
                    : cat === 'children' ? (language === 'de' ? 'Kinder' : 'Children')
                    : cat === 'institutional' ? (language === 'de' ? 'Gemeinde' : 'Community')
                    : (language === 'de' ? 'Kreativ' : 'Creative')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
              {language === 'de' ? 'Kunstform' : 'Art Form'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedArtForm('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedArtForm === 'all'
                    ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                    : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                }`}
              >
                {language === 'de' ? 'Alle Formen' : 'All Forms'}
              </button>
              {(['drama', 'music_poetry', 'visual_arts', 'collaborative_mural'] as ArtForm[]).map((form) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => setSelectedArtForm(form)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedArtForm === form
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {form === 'drama' ? (language === 'de' ? 'Theater & Drama' : 'Drama')
                    : form === 'music_poetry' ? (language === 'de' ? 'Musik & Poesie' : 'Music & Poetry')
                    : form === 'visual_arts' ? (language === 'de' ? 'Bildende Kunst' : 'Visual Arts')
                    : (language === 'de' ? 'Gemeinschaftskunst' : 'Mural')}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(false)}
              className="w-full py-3 rounded-xl bg-accent text-accent-contrast font-semibold text-xs transition-colors cursor-pointer"
            >
              {language === 'de' ? `${totalCount} Aktivitäten anzeigen` : `Show ${totalCount} Activities`}
            </button>
          </div>
        </div>
      </Sheet>

    </div>
  );
};
