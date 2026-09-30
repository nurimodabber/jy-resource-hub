import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Palette, Heart, Check, Copy, ChevronDown, ChevronUp, 
  Clock, Plus, Bookmark, ArrowRight, ShieldCheck, Compass, Music, BookOpen 
} from 'lucide-react';
import { 
  Language, ServiceProject, ArtsPrompt, ServiceProjectCategory, 
  ServiceProjectScope, ArtForm, SessionSlot 
} from '../types';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import { UI_TRANSLATIONS } from '../data/translations';

interface ServiceArtsViewProps {
  language: Language;
  searchQuery: string;
  onAddToPlanner?: (slot: SessionSlot) => void;
}

export const ServiceArtsView: React.FC<ServiceArtsViewProps> = ({
  language,
  searchQuery,
  onAddToPlanner,
}) => {
  const [subTab, setSubTab] = useState<'service' | 'arts'>('service');
  
  // Service filters
  const [selectedCategory, setSelectedCategory] = useState<ServiceProjectCategory | 'all'>('all');
  const [selectedScope, setSelectedScope] = useState<ServiceProjectScope | 'all'>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(SERVICE_PROJECTS_DATA[0].id);
  
  // Arts filters
  const [selectedArtForm, setSelectedArtForm] = useState<ArtForm | 'all'>('all');
  const [expandedArtId, setExpandedArtId] = useState<string | null>(ARTS_PROMPTS_DATA[0].id);

  // Copy notification states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const t = UI_TRANSLATIONS[language];

  // Filtered Service Projects
  const filteredProjects = useMemo(() => {
    return SERVICE_PROJECTS_DATA.filter((proj) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = proj.title[language].toLowerCase().includes(q);
        const matchesObj = proj.objective[language].toLowerCase().includes(q);
        const matchesSteps = proj.steps[language].some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesObj && !matchesSteps) return false;
      }
      if (selectedCategory !== 'all' && proj.category !== selectedCategory) return false;
      if (selectedScope !== 'all' && proj.scope !== selectedScope) return false;
      return true;
    });
  }, [searchQuery, language, selectedCategory, selectedScope]);

  // Filtered Arts Prompts
  const filteredArts = useMemo(() => {
    return ARTS_PROMPTS_DATA.filter((art) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title[language].toLowerCase().includes(q);
        const matchesDesc = art.description[language].toLowerCase().includes(q);
        const matchesTheme = art.theme[language].toLowerCase().includes(q);
        const matchesBook = art.book[language].toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTheme && !matchesBook) return false;
      }
      if (selectedArtForm !== 'all' && art.artForm !== selectedArtForm) return false;
      return true;
    });
  }, [searchQuery, language, selectedArtForm]);

  const handleCopyProject = (project: ServiceProject) => {
    const text = `🌱 ${project.title[language]} (${project.duration[language]})\n\n${t.objectiveTitle}:\n${project.objective[language]}\n\n${t.materialsTitle}:\n${project.materials[language].map(m => `• ${m}`).join('\n')}\n\n${t.stepsTitle}:\n${project.steps[language].map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\n${t.reflectionTitle}:\n${project.reflectionQuestions[language].map(q => `• ${q}`).join('\n')}\n\n${t.tipsTitle}:\n${project.animatorTips[language].map(tip => `• ${tip}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyArt = (art: ArtsPrompt) => {
    const text = `🎨 ${art.title[language]} (${art.book[language]})\n\n${art.description[language]}\n\n${t.materialsTitle}:\n${art.materials[language].map(m => `• ${m}`).join('\n')}\n\n${t.stepsTitle}:\n${art.guidingSteps[language].map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\n${t.reflectionTitle}:\n${art.reflectionPrompts[language].map(q => `• ${q}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(art.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddProjectToPlanner = (project: ServiceProject) => {
    if (!onAddToPlanner) return;
    const slot: SessionSlot = {
      id: `service-${project.id}-${Date.now()}`,
      type: 'service',
      title: project.title,
      durationMinutes: 45,
      description: project.objective,
      materials: project.materials,
      tips: {
        de: project.animatorTips.de[0] || '',
        en: project.animatorTips.en[0] || '',
      },
      referenceId: project.id,
      referenceType: 'service',
    };
    onAddToPlanner(slot);
    setAddedId(project.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleAddArtToPlanner = (art: ArtsPrompt) => {
    if (!onAddToPlanner) return;
    const slot: SessionSlot = {
      id: `art-${art.id}-${Date.now()}`,
      type: 'arts_discussion',
      title: art.title,
      durationMinutes: 25,
      description: art.description,
      materials: art.materials,
      referenceId: art.id,
      referenceType: 'art',
    };
    onAddToPlanner(slot);
    setAddedId(art.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header & Segmented Sub-View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t.serviceArtsHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {t.serviceArtsHeaderDesc}
          </p>
        </div>

        {/* Apple Segmented Switcher */}
        <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] self-start sm:self-auto shrink-0">
          <button
            onClick={() => setSubTab('service')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              subTab === 'service'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.subtabServiceProjects}</span>
            <span className="text-[10px] opacity-60">({SERVICE_PROJECTS_DATA.length})</span>
          </button>

          <button
            onClick={() => setSubTab('arts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              subTab === 'arts'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-600" />
            <span>{t.subtabArtsPrompts}</span>
            <span className="text-[10px] opacity-60">({ARTS_PROMPTS_DATA.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: COMMUNITY SERVICE PROJECTS BANK */}
      {subTab === 'service' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto pb-1 custom-scrollbar">
              <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] min-w-max">
                {[
                  { id: 'all', label: t.catAll },
                  { id: 'environmental', label: t.catEnvironmental },
                  { id: 'neighborhood', label: t.catNeighborhood },
                  { id: 'intergenerational', label: t.catIntergenerational },
                  { id: 'children', label: t.catChildren },
                  { id: 'institutional', label: t.catInstitutional },
                  { id: 'creative', label: t.catCreative },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as ServiceProjectCategory | 'all')}
                    className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope / Duration Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#86868b] font-medium">{t.projectScopeLabel}:</span>
              {[
                { id: 'all', label: t.scopeAll },
                { id: 'quick', label: t.scopeQuick },
                { id: 'medium', label: t.scopeMedium },
                { id: 'deep', label: t.scopeDeep },
              ].map((scope) => (
                <button
                  key={scope.id}
                  onClick={() => setSelectedScope(scope.id as ServiceProjectScope | 'all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    selectedScope === scope.id
                      ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-apple-pill font-semibold'
                      : 'bg-white text-[#6e6e73] border-black/[0.06] hover:text-[#1d1d1f]'
                  }`}
                >
                  {scope.label}
                </button>
              ))}

              <span className="ml-auto font-mono text-[11px] text-[#86868b]">
                {filteredProjects.length} {language === 'de' ? 'Projekte' : 'projects'}
              </span>
            </div>
          </div>

          {/* Service Projects List */}
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const isExpanded = expandedProjectId === project.id;
              const isCopied = copiedId === project.id;
              const isAdded = addedId === project.id;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-black/[0.06] shadow-apple-card overflow-hidden transition-all"
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-black/[0.01] transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800">
                          {project.category === 'environmental' && t.catEnvironmental}
                          {project.category === 'neighborhood' && t.catNeighborhood}
                          {project.category === 'intergenerational' && t.catIntergenerational}
                          {project.category === 'children' && t.catChildren}
                          {project.category === 'institutional' && t.catInstitutional}
                          {project.category === 'creative' && t.catCreative}
                        </span>

                        <span className="text-[11px] text-[#86868b] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{project.duration[language]}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight">
                        {project.title[language]}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#6e6e73] font-normal leading-relaxed line-clamp-2">
                        {project.objective[language]}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {onAddToPlanner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddProjectToPlanner(project);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all border ${
                            isAdded
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-black/[0.03] hover:bg-black/[0.07] text-[#1d1d1f] border-black/[0.06]'
                          }`}
                          title={t.addToPlanner}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-emerald-600" />}
                          <span className="hidden sm:inline">{isAdded ? t.addedToPlannerSuccess : t.addToPlanner}</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyProject(project);
                        }}
                        className="p-2 rounded-full border border-black/[0.06] text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                        title={t.copyDevotionalPlan}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <div className="p-1 text-[#86868b]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-black/[0.04] space-y-5 text-xs sm:text-sm">
                      {/* Objective */}
                      <div className="bg-[#f5f5f7] p-4 rounded-xl space-y-1">
                        <strong className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                          {t.objectiveTitle}
                        </strong>
                        <p className="text-xs sm:text-sm text-[#1d1d1f] leading-relaxed font-normal">
                          {project.objective[language]}
                        </p>
                      </div>

                      {/* Materials */}
                      <div className="space-y-1.5">
                        <strong className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                          {t.materialsTitle}
                        </strong>
                        <div className="flex flex-wrap gap-1.5">
                          {project.materials[language].map((mat, i) => (
                            <span key={i} className="bg-black/[0.04] text-[#1d1d1f] text-xs px-2.5 py-1 rounded-lg">
                              • {mat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Step-by-Step Guide */}
                      <div className="space-y-2">
                        <strong className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
                          {t.stepsTitle}
                        </strong>
                        <div className="space-y-2">
                          {project.steps[language].map((step, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white border border-black/[0.05] p-3 rounded-xl">
                              <span className="w-5 h-5 rounded-full bg-[#1d1d1f] text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs sm:text-sm text-[#1d1d1f] leading-relaxed font-normal">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Circle Reflection Questions */}
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2">
                        <strong className="text-[11px] font-semibold uppercase tracking-wider text-amber-950 block">
                          {t.reflectionTitle}
                        </strong>
                        <ul className="space-y-1 text-xs text-amber-950">
                          {project.reflectionQuestions[language].map((q, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-bold">•</span>
                              <span className="leading-relaxed">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Facilitator Tips */}
                      {project.animatorTips[language].length > 0 && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs text-emerald-950">
                          <strong className="font-semibold block mb-0.5">{t.tipsTitle}:</strong>
                          <ul className="space-y-1">
                            {project.animatorTips[language].map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span>✓</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ARTS & DRAMA PROMPTS */}
      {subTab === 'arts' && (
        <div className="space-y-6">
          {/* Art Form Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: t.artFormAll },
              { id: 'drama', label: t.artFormDrama },
              { id: 'music_poetry', label: t.artFormMusicPoetry },
              { id: 'visual_arts', label: t.artFormVisual },
              { id: 'collaborative_mural', label: t.artFormMural },
            ].map((form) => (
              <button
                key={form.id}
                onClick={() => setSelectedArtForm(form.id as ArtForm | 'all')}
                className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
                  selectedArtForm === form.id
                    ? 'bg-[#1d1d1f] text-white shadow-apple-pill font-semibold'
                    : 'bg-white text-[#6e6e73] border border-black/[0.06] hover:text-[#1d1d1f]'
                }`}
              >
                {form.label}
              </button>
            ))}

            <span className="ml-auto font-mono text-[11px] text-[#86868b]">
              {filteredArts.length} {language === 'de' ? 'Impulse' : 'prompts'}
            </span>
          </div>

          {/* Arts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredArts.map((art) => {
              const isExpanded = expandedArtId === art.id;
              const isCopied = copiedId === art.id;
              const isAdded = addedId === art.id;

              return (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-apple-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-800">
                        {art.artForm === 'drama' && t.artFormDrama}
                        {art.artForm === 'music_poetry' && t.artFormMusicPoetry}
                        {art.artForm === 'visual_arts' && t.artFormVisual}
                        {art.artForm === 'collaborative_mural' && t.artFormMural}
                      </span>

                      <span className="text-[11px] text-[#86868b] font-medium truncate">
                        {art.book[language]}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight">
                      {art.title[language]}
                    </h3>

                    <p className="text-xs text-[#6e6e73] leading-relaxed font-normal">
                      {art.description[language]}
                    </p>

                    {/* Step-by-Step Instructions */}
                    <div className="pt-2 border-t border-black/[0.04] space-y-1.5">
                      <strong className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                        {t.stepsTitle}:
                      </strong>
                      <ol className="space-y-1.5 text-xs text-[#1d1d1f]">
                        {art.guidingSteps[language].map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-semibold text-[#86868b]">{idx + 1}.</span>
                            <span className="leading-relaxed font-normal">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Reflection */}
                    <div className="p-3 bg-[#f5f5f7] border border-black/[0.03] rounded-xl text-xs space-y-1 text-[#1d1d1f]">
                      <strong className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                        {t.reflectionTitle}:
                      </strong>
                      <ul className="space-y-1 text-[#6e6e73]">
                        {art.reflectionPrompts[language].map((p, idx) => (
                          <li key={idx}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyArt(art)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? t.copiedProject : t.copyQuote}</span>
                    </button>

                    {onAddToPlanner && (
                      <button
                        onClick={() => handleAddArtToPlanner(art)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all border ${
                          isAdded
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-black/[0.03] hover:bg-black/[0.07] text-[#1d1d1f] border-black/[0.06]'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-purple-600" />}
                        <span>{isAdded ? t.addedToPlannerSuccess : t.addToPlanner}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
