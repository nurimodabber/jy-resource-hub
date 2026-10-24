import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Plus,
  RotateCcw,
  Search,
  BookOpen,
  Inbox,
  Download,
  Upload,
  Eye,
  LogOut,
  RefreshCw,
  ExternalLink,
  Settings,
  FileText,
  PanelLeft,
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
  Users,
  Layers,
  Check,
} from 'lucide-react';
import {
  Language,
  Game,
  GameCategory,
  EnergyLevel,
  PrepLevel,
  GamePurpose,
  ServiceProject,
  ArtsPrompt,
  ServiceProjectCategory,
  ServiceProjectScope,
  ArtForm,
  ActivitySetting,
  ActivityOccasion,
} from '../types';
import { QUOTES_DATA } from '../data/quotes';
import { useAdminData, AdminSpyLocation, EmpireCategory } from '../context/AdminDataContext';
import { WhoAmIPack } from '../data/roleContent';
import { RuleIdea } from '../data/empireContent';
import { ProposalItem, saveProposal } from '../utils/adminRevisions';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { exportLocalData, importLocalData, downloadText } from '../utils/backup';
import {
  fetchGitHubProposals,
  getGitHubRepo,
  updateGitHubIssueStatus,
} from '../utils/githubIssues';
import {
  AdminAccount,
  getAdminAccounts,
  createAdminAccount,
  verifyAdminLogin,
  changeAdminPassword,
  deleteAdminAccount,
  getActiveSessionAccount,
  setActiveSessionAccount,
} from '../utils/adminAuth';
import { GitHubSettingsModal } from './admin/GitHubSettingsModal';
import { Logo } from './Logo';

interface AdminViewProps {
  language: Language;
  setLanguage?: (lang: Language) => void;
}

type WorkspaceSection = 'review' | 'drafts' | 'catalog' | 'quotes' | 'operations';
type ReviewStatusTab = 'pending' | 'drafts' | 'accepted' | 'rejected';
type CatalogKindTab = 'games' | 'service' | 'arts' | 'minigames';
type MinigameSubTab = 'empire' | 'spy' | 'whoami' | 'psych';

type EditorMode =
  | {
      source: 'proposal';
      proposal: ProposalItem;
      entityKind: 'spiel' | 'dienst' | 'kunst' | 'kategorie';
    }
  | {
      source: 'catalog';
      entityKind: 'spiel' | 'dienst' | 'kunst' | 'kategorie';
      entityId: string;
      isNew?: boolean;
    };

interface UnifiedEditorDraft {
  id: string;
  kind: 'spiel' | 'dienst' | 'kunst' | 'kategorie';
  titleDe: string;
  titleEn: string;
  subtitleDe: string;
  summaryDe: string;
  summaryEn: string;
  stepsDe: string;
  stepsEn: string;
  materialsDe: string;
  tipsDe: string;
  reflectionDe: string;
  // Game metadata
  gameCategory: GameCategory;
  energyLevel: EnergyLevel;
  prepLevel: PrepLevel;
  purpose: GamePurpose;
  spaceDe: string;
  // Service & Arts metadata
  serviceCategory: ServiceProjectCategory;
  serviceScope: ServiceProjectScope;
  artForm: ArtForm;
  bookDe: string;
  setting: ActivitySetting;
  occasion: ActivityOccasion;
  // Common numbers
  durationMin: number;
  durationMax: number;
  groupMin: number;
  groupMax: number;
  // Empire category metadata
  examplesDe: string;
  mood: EmpireCategory['mood'];
  topic: EmpireCategory['topic'];
  submittedBy: string;
  githubIssueNumber?: number;
  githubUrl?: string;
}

function slugifyId(text: string, fallbackPrefix: string): string {
  const base = text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);
  return base || `${fallbackPrefix}-${Date.now().toString(36)}`;
}

export const AdminView: React.FC<AdminViewProps> = ({ language, setLanguage }) => {
  const L = useCallback((de: string, en: string) => (language === 'de' ? de : en), [language]);
  const { showToast: rawShowToast } = useToast();
  const showToast = useCallback((text: string) => rawShowToast({ text }), [rawShowToast]);
  const { isDark, setTheme } = useTheme();
  const adminData = useAdminData();

  // Multi-Account Authentication State (Salted SHA-256)
  const [accounts, setAccounts] = useState<AdminAccount[]>(() => getAdminAccounts());
  const [currentAccount, setCurrentAccount] = useState<AdminAccount | null>(() => getActiveSessionAccount());
  const isAuthenticated = Boolean(currentAccount);
  const adminAuthor = currentAccount?.displayName || 'Redaktion';

  // Login / First-Account Setup Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [setupDisplayName, setSetupDisplayName] = useState('');
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Account Management State (inside Operations)
  const [newAccDisplayName, setNewAccDisplayName] = useState('');
  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccRole, setNewAccRole] = useState<'owner' | 'editor'>('editor');
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');

  // Portal Navigation State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('review');
  const [reviewTab, setReviewTab] = useState<ReviewStatusTab>('pending');
  const [catalogTab, setCatalogTab] = useState<CatalogKindTab>('games');
  const [minigameSubTab, setMinigameSubTab] = useState<MinigameSubTab>('empire');

  // Filter & Search States
  const [reviewTypeFilter, setReviewTypeFilter] = useState<'all' | 'spiel' | 'dienst' | 'kunst' | 'kategorie'>('all');
  const [reviewSubmitterFilter, setReviewSubmitterFilter] = useState<string>('all');
  const [reviewSearch, setReviewSearch] = useState('');

  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<'all' | 'online' | 'draft'>('all');
  const [catalogGameCatFilter, setCatalogGameCatFilter] = useState<string>('all');
  const [quotesSearch, setQuotesSearch] = useState('');

  // Active Detail Editor State (Screenshot 2 view)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [draftForm, setDraftForm] = useState<UnifiedEditorDraft | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Quick Modals for Spy/WhoAmI/Psychiatrist & GitHub Settings
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [editingSpyLoc, setEditingSpyLoc] = useState<AdminSpyLocation | null>(null);
  const [editingWhoPack, setEditingWhoPack] = useState<WhoAmIPack | null>(null);
  const [editingPsychRule, setEditingPsychRule] = useState<RuleIdea | null>(null);

  // GitHub Sync State
  const [ghProposals, setGhProposals] = useState<ProposalItem[]>([]);
  const [isSyncingGh, setIsSyncingGh] = useState(false);
  const [_ghSyncError, setGhSyncError] = useState<string | null>(null);

  const syncWithGitHub = useCallback(
    async (silent = false) => {
      setIsSyncingGh(true);
      setGhSyncError(null);
      const res = await fetchGitHubProposals();
      setIsSyncingGh(false);
      if (res.ok) {
        setGhProposals(res.issues);
        if (!silent) {
          showToast(
            L(
              `${res.issues.length} offene Einreichungen von GitHub geladen`,
              `Loaded ${res.issues.length} open submissions from GitHub`
            )
          );
        }
      } else {
        setGhSyncError(res.error || 'Sync-Fehler');
        if (!silent && res.error) {
          showToast(res.error);
        }
      }
    },
    [L, showToast]
  );

  useEffect(() => {
    if (isAuthenticated) {
      syncWithGitHub(true);
    }
  }, [isAuthenticated, syncWithGitHub]);

  // Combined proposals (Local + GitHub)
  const combinedProposals = useMemo(() => {
    const localMap = new Map(adminData.proposals.map((p) => [p.id, p]));
    const result: ProposalItem[] = [...adminData.proposals];
    for (const ghp of ghProposals) {
      if (!localMap.has(ghp.id)) {
        result.push(ghp);
      }
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [adminData.proposals, ghProposals]);

  // All backend-only draft items across collections
  const backendDraftItems = useMemo(() => {
    const items: Array<{
      id: string;
      kind: 'spiel' | 'dienst' | 'kunst' | 'kategorie';
      title: string;
      summary: string;
      submittedBy: string;
      updatedAt: number;
    }> = [];

    for (const g of adminData.adminGames) {
      if (adminData.backendDraftIds.has(g.id)) {
        const rev = adminData.revisions.find((r) => r.entityId === g.id);
        items.push({
          id: g.id,
          kind: 'spiel',
          title: g.title[language] || g.title.de,
          summary: g.summary[language] || g.summary.de,
          submittedBy: g.submittedBy || rev?.author || adminAuthor,
          updatedAt: rev?.timestamp || Date.now(),
        });
      }
    }
    for (const s of adminData.adminServiceProjects) {
      if (adminData.backendDraftIds.has(s.id)) {
        const rev = adminData.revisions.find((r) => r.entityId === s.id);
        items.push({
          id: s.id,
          kind: 'dienst',
          title: s.title[language] || s.title.de,
          summary: s.objective[language] || s.objective.de,
          submittedBy: s.submittedBy || rev?.author || adminAuthor,
          updatedAt: rev?.timestamp || Date.now(),
        });
      }
    }
    for (const a of adminData.adminArtsPrompts) {
      if (adminData.backendDraftIds.has(a.id)) {
        const rev = adminData.revisions.find((r) => r.entityId === a.id);
        items.push({
          id: a.id,
          kind: 'kunst',
          title: a.title[language] || a.title.de,
          summary: a.description[language] || a.description.de,
          submittedBy: a.submittedBy || rev?.author || adminAuthor,
          updatedAt: rev?.timestamp || Date.now(),
        });
      }
    }
    for (const c of adminData.adminEmpireCategories) {
      if (adminData.backendDraftIds.has(c.id)) {
        const rev = adminData.revisions.find((r) => r.entityId === `empire_${c.id}`);
        items.push({
          id: c.id,
          kind: 'kategorie',
          title: c.prompt[language] || c.prompt.de,
          summary: c.hint[language] || c.hint.de,
          submittedBy: rev?.author || adminAuthor,
          updatedAt: rev?.timestamp || Date.now(),
        });
      }
    }

    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [
    adminData.adminGames,
    adminData.adminServiceProjects,
    adminData.adminArtsPrompts,
    adminData.adminEmpireCategories,
    adminData.backendDraftIds,
    adminData.revisions,
    language,
    adminAuthor,
  ]);

  // Unique submitters for Review dropdown
  const allSubmitters = useMemo(() => {
    const set = new Set<string>();
    for (const p of combinedProposals) {
      if (p.authorName) set.add(p.authorName);
    }
    for (const d of backendDraftItems) {
      if (d.submittedBy) set.add(d.submittedBy);
    }
    return Array.from(set);
  }, [combinedProposals, backendDraftItems]);

  // Counts for Sidebar & Tabs
  const pendingProposalsCount = useMemo(
    () => combinedProposals.filter((p) => p.status === 'pending').length,
    [combinedProposals]
  );
  const acceptedProposalsCount = useMemo(
    () => combinedProposals.filter((p) => p.status === 'accepted').length,
    [combinedProposals]
  );
  const rejectedProposalsCount = useMemo(
    () => combinedProposals.filter((p) => p.status === 'rejected').length,
    [combinedProposals]
  );
  const totalOnlineCatalogCount =
    adminData.games.length +
    adminData.serviceProjects.length +
    adminData.artsPrompts.length +
    adminData.empireCategories.length;

  // Open Editor from a Proposal
  const openProposalInEditor = useCallback((prop: ProposalItem) => {
    const p = prop.payload || {};
    const stepsArr = Array.isArray(p.steps) && p.steps.length ? (p.steps as string[]) : [prop.summary];
    const matArr = Array.isArray(p.materials) ? (p.materials as string[]) : [];
    const reflArr = Array.isArray(p.reflectionQuestions) ? (p.reflectionQuestions as string[]) : [];
    const tipsStr = typeof p.animatorTips === 'string' ? p.animatorTips : '';

    const defaultId = prop.githubIssueNumber
      ? prop.type === 'dienst'
        ? `gh_service_${prop.githubIssueNumber}`
        : prop.type === 'kunst'
          ? `gh_art_${prop.githubIssueNumber}`
          : prop.type === 'kategorie'
            ? `gh_cat_${prop.githubIssueNumber}`
            : `gh_game_${prop.githubIssueNumber}`
      : slugifyId(prop.title, prop.type);

    setDraftForm({
      id: defaultId,
      kind: prop.type,
      titleDe: prop.title,
      titleEn: prop.title,
      subtitleDe: prop.subtitle || '',
      summaryDe: (p.objective as string) || prop.summary || '',
      summaryEn: (p.objective as string) || prop.summary || '',
      stepsDe: stepsArr.join('\n'),
      stepsEn: stepsArr.join('\n'),
      materialsDe: matArr.join(', '),
      tipsDe: tipsStr,
      reflectionDe: reflArr.join('\n'),
      gameCategory: (p.category as GameCategory) || 'cooperative',
      energyLevel: (p.energyLevel as EnergyLevel) || 'medium',
      prepLevel: matArr.length > 0 ? 'low_prep' : 'instant',
      purpose: 'zusammenarbeit',
      spaceDe: 'Drinnen oder draußen',
      serviceCategory: (p.category as ServiceProjectCategory) || 'neighborhood',
      serviceScope: (p.scope as ServiceProjectScope) || 'medium',
      artForm: (p.artForm as ArtForm) || 'visual_arts',
      bookDe: (p.relatedBook as string) || 'Allgemein',
      setting: (p.setting as ActivitySetting) || 'beides',
      occasion: (p.occasion as ActivityOccasion) || 'beides',
      durationMin: Number(p.durationMin) || (prop.type === 'spiel' ? 10 : 30),
      durationMax: Number(p.durationMax) || (prop.type === 'spiel' ? 20 : 60),
      groupMin: Number(p.groupSizeMin) || 4,
      groupMax: Number(p.groupSizeMax) || 16,
      examplesDe: 'Beispiel 1, Beispiel 2, Beispiel 3',
      mood: 'fun',
      topic: 'everyday',
      submittedBy: prop.authorName || 'Community',
      githubIssueNumber: prop.githubIssueNumber || (p.githubIssueNumber as number | undefined),
      githubUrl: p.githubUrl as string | undefined,
    });
    setReviewComment('');
    setEditorMode({
      source: 'proposal',
      proposal: prop,
      entityKind: prop.type,
    });
  }, []);

  // Open Editor from a Catalog Item (or Backend Draft)
  const openCatalogItemInEditor = useCallback(
    (kind: 'spiel' | 'dienst' | 'kunst' | 'kategorie', id: string) => {
      if (kind === 'spiel') {
        const g = adminData.adminGames.find((x) => x.id === id);
        if (!g) return;
        setDraftForm({
          id: g.id,
          kind: 'spiel',
          titleDe: g.title.de,
          titleEn: g.title.en || g.title.de,
          subtitleDe: g.subtitle?.de || '',
          summaryDe: g.summary.de,
          summaryEn: g.summary.en || g.summary.de,
          stepsDe: g.rules.de.join('\n'),
          stepsEn: (g.rules.en || g.rules.de).join('\n'),
          materialsDe: g.materials.de.join(', '),
          tipsDe: g.animatorTips.de.join('\n'),
          reflectionDe: '',
          gameCategory: g.category,
          energyLevel: g.energyLevel,
          prepLevel: g.prepLevel,
          purpose: g.purpose,
          spaceDe: g.space.de,
          serviceCategory: 'neighborhood',
          serviceScope: 'medium',
          artForm: 'visual_arts',
          bookDe: 'Allgemein',
          setting: 'beides',
          occasion: 'beides',
          durationMin: g.durationMin,
          durationMax: g.durationMax,
          groupMin: g.groupSize.min,
          groupMax: g.groupSize.max,
          examplesDe: '',
          mood: 'fun',
          topic: 'everyday',
          submittedBy: g.submittedBy || 'Katalog',
        });
      } else if (kind === 'dienst') {
        const s = adminData.adminServiceProjects.find((x) => x.id === id);
        if (!s) return;
        setDraftForm({
          id: s.id,
          kind: 'dienst',
          titleDe: s.title.de,
          titleEn: s.title.en || s.title.de,
          subtitleDe: s.theme?.de || '',
          summaryDe: s.objective.de,
          summaryEn: s.objective.en || s.objective.de,
          stepsDe: s.steps.de.join('\n'),
          stepsEn: (s.steps.en || s.steps.de).join('\n'),
          materialsDe: s.materials.de.join(', '),
          tipsDe: s.animatorTips.de.join('\n'),
          reflectionDe: s.reflectionQuestions.de.join('\n'),
          gameCategory: 'cooperative',
          energyLevel: 'medium',
          prepLevel: 'low_prep',
          purpose: 'zusammenarbeit',
          spaceDe: 'Drinnen oder draußen',
          serviceCategory: s.category,
          serviceScope: s.scope,
          artForm: 'visual_arts',
          bookDe: s.relatedBook || 'Allgemein',
          setting: s.setting,
          occasion: s.occasion,
          durationMin: s.durationMin,
          durationMax: s.durationMax,
          groupMin: s.groupSize.min,
          groupMax: s.groupSize.max,
          examplesDe: '',
          mood: 'fun',
          topic: 'everyday',
          submittedBy: s.submittedBy || 'Katalog',
        });
      } else if (kind === 'kunst') {
        const a = adminData.adminArtsPrompts.find((x) => x.id === id);
        if (!a) return;
        setDraftForm({
          id: a.id,
          kind: 'kunst',
          titleDe: a.title.de,
          titleEn: a.title.en || a.title.de,
          subtitleDe: a.theme.de,
          summaryDe: a.description.de,
          summaryEn: a.description.en || a.description.de,
          stepsDe: a.guidingSteps.de.join('\n'),
          stepsEn: (a.guidingSteps.en || a.guidingSteps.de).join('\n'),
          materialsDe: a.materials.de.join(', '),
          tipsDe: (a.animatorTips?.de || []).join('\n'),
          reflectionDe: a.reflectionPrompts.de.join('\n'),
          gameCategory: 'cooperative',
          energyLevel: 'calm',
          prepLevel: 'low_prep',
          purpose: 'ruhe',
          spaceDe: 'Drinnen',
          serviceCategory: 'creative',
          serviceScope: 'medium',
          artForm: a.artForm,
          bookDe: a.book.de,
          setting: a.setting,
          occasion: a.occasion,
          durationMin: a.durationMin,
          durationMax: a.durationMax,
          groupMin: a.groupSize.min,
          groupMax: a.groupSize.max,
          examplesDe: '',
          mood: 'thoughtful',
          topic: 'community',
          submittedBy: a.submittedBy || 'Katalog',
        });
      } else if (kind === 'kategorie') {
        const c = adminData.adminEmpireCategories.find((x) => x.id === id);
        if (!c) return;
        setDraftForm({
          id: c.id,
          kind: 'kategorie',
          titleDe: c.prompt.de,
          titleEn: c.prompt.en || c.prompt.de,
          subtitleDe: '',
          summaryDe: c.hint.de,
          summaryEn: c.hint.en || c.hint.de,
          stepsDe: '',
          stepsEn: '',
          materialsDe: '',
          tipsDe: '',
          reflectionDe: '',
          gameCategory: 'cooperative',
          energyLevel: 'medium',
          prepLevel: 'instant',
          purpose: 'raten',
          spaceDe: '',
          serviceCategory: 'neighborhood',
          serviceScope: 'quick',
          artForm: 'visual_arts',
          bookDe: '',
          setting: 'beides',
          occasion: 'beides',
          durationMin: 10,
          durationMax: 20,
          groupMin: 4,
          groupMax: 20,
          examplesDe: c.examples.de.join(', '),
          mood: c.mood,
          topic: c.topic,
          submittedBy: 'Katalog',
        });
      }

      setReviewComment('');
      setEditorMode({
        source: 'catalog',
        entityKind: kind,
        entityId: id,
        isNew: false,
      });
    },
    [
      adminData.adminGames,
      adminData.adminServiceProjects,
      adminData.adminArtsPrompts,
      adminData.adminEmpireCategories,
    ]
  );

  // Create a brand new item in Editor
  const openNewItemInEditor = useCallback((kind: 'spiel' | 'dienst' | 'kunst' | 'kategorie') => {
    const newId = `${kind}_${Date.now().toString(36)}`;
    setDraftForm({
      id: newId,
      kind,
      titleDe: '',
      titleEn: '',
      subtitleDe: '',
      summaryDe: '',
      summaryEn: '',
      stepsDe: '',
      stepsEn: '',
      materialsDe: '',
      tipsDe: '',
      reflectionDe: '',
      gameCategory: 'cooperative',
      energyLevel: 'medium',
      prepLevel: 'instant',
      purpose: 'zusammenarbeit',
      spaceDe: 'Drinnen oder draußen',
      serviceCategory: 'neighborhood',
      serviceScope: 'medium',
      artForm: 'visual_arts',
      bookDe: 'Allgemein',
      setting: 'beides',
      occasion: 'beides',
      durationMin: kind === 'spiel' ? 10 : 30,
      durationMax: kind === 'spiel' ? 20 : 60,
      groupMin: 4,
      groupMax: 15,
      examplesDe: '',
      mood: 'fun',
      topic: 'everyday',
      submittedBy: adminAuthor,
    });
    setReviewComment('');
    setEditorMode({
      source: 'catalog',
      entityKind: kind,
      entityId: newId,
      isNew: true,
    });
  }, [adminAuthor]);

  // Save or Publish from the Unified Detail Editor
  const handleSaveFromEditor = useCallback(
    (asDraft: boolean) => {
      if (!draftForm || !editorMode) return;
      if (!draftForm.titleDe.trim()) {
        showToast(L('Bitte gib mindestens einen deutschen Titel ein.', 'Please enter at least a German title.'));
        return;
      }

      const finalId = draftForm.id.trim() || slugifyId(draftForm.titleDe, draftForm.kind);
      const titleDe = draftForm.titleDe.trim();
      const titleEn = draftForm.titleEn.trim() || titleDe;
      const summaryDe = draftForm.summaryDe.trim();
      const summaryEn = draftForm.summaryEn.trim() || summaryDe;

      const stepsDe = draftForm.stepsDe
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const stepsEn = draftForm.stepsEn
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const finalStepsEn = stepsEn.length > 0 ? stepsEn : stepsDe;

      const materialsArr = draftForm.materialsDe
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const tipsArr = draftForm.tipsDe
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const reflArr = draftForm.reflectionDe
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const summaryNote =
        reviewComment.trim() ||
        (asDraft
          ? `Als Entwurf im Backend gespeichert: "${titleDe}"`
          : `Im Katalog veröffentlicht / aktualisiert: "${titleDe}"`);

      let savedPayloadForGitHub: Record<string, unknown> = {};

      if (draftForm.kind === 'spiel') {
        const gameObj: Game = {
          id: finalId,
          title: { de: titleDe, en: titleEn },
          subtitle: draftForm.subtitleDe.trim()
            ? { de: draftForm.subtitleDe.trim(), en: draftForm.subtitleDe.trim() }
            : undefined,
          category: draftForm.gameCategory,
          energyLevel: draftForm.energyLevel,
          purpose: draftForm.purpose,
          groupSize: { min: Number(draftForm.groupMin) || 4, max: Number(draftForm.groupMax) || 20 },
          prepLevel: draftForm.prepLevel,
          materials: { de: materialsArr, en: materialsArr },
          durationMinutes: `${draftForm.durationMin}–${draftForm.durationMax} Min`,
          durationMin: Number(draftForm.durationMin) || 10,
          durationMax: Number(draftForm.durationMax) || 20,
          space: { de: draftForm.spaceDe || 'Drinnen oder draußen', en: draftForm.spaceDe || 'Indoors or outdoors' },
          summary: { de: summaryDe, en: summaryEn },
          idea: { de: summaryDe, en: summaryEn },
          rules: { de: stepsDe.length ? stepsDe : [summaryDe], en: finalStepsEn.length ? finalStepsEn : [summaryEn] },
          animatorTips: { de: tipsArr, en: tipsArr },
          status: 'draft',
          submittedBy: draftForm.submittedBy || adminAuthor,
        };
        adminData.saveGame(gameObj, adminAuthor, summaryNote, asDraft);
        savedPayloadForGitHub = gameObj as unknown as Record<string, unknown>;
      } else if (draftForm.kind === 'dienst') {
        const serviceObj: ServiceProject = {
          id: finalId,
          kind: 'dienst',
          title: { de: titleDe, en: titleEn },
          category: draftForm.serviceCategory,
          scope: draftForm.serviceScope,
          theme: draftForm.subtitleDe.trim()
            ? { de: draftForm.subtitleDe.trim(), en: draftForm.subtitleDe.trim() }
            : undefined,
          objective: { de: summaryDe, en: summaryEn },
          durationMin: Number(draftForm.durationMin) || 30,
          durationMax: Number(draftForm.durationMax) || 60,
          duration: {
            de: `${draftForm.durationMin}–${draftForm.durationMax} Min`,
            en: `${draftForm.durationMin}–${draftForm.durationMax} min`,
          },
          groupSize: { min: Number(draftForm.groupMin) || 4, max: Number(draftForm.groupMax) || 15 },
          setting: draftForm.setting,
          occasion: draftForm.occasion,
          materials: { de: materialsArr, en: materialsArr },
          steps: { de: stepsDe.length ? stepsDe : [summaryDe], en: finalStepsEn.length ? finalStepsEn : [summaryEn] },
          reflectionQuestions: { de: reflArr, en: reflArr },
          animatorTips: { de: tipsArr, en: tipsArr },
          relatedBook: draftForm.bookDe || undefined,
          status: 'draft',
          submittedBy: draftForm.submittedBy || adminAuthor,
        };
        adminData.saveServiceProject(serviceObj, adminAuthor, summaryNote, asDraft);
        savedPayloadForGitHub = serviceObj as unknown as Record<string, unknown>;
      } else if (draftForm.kind === 'kunst') {
        const artObj: ArtsPrompt = {
          id: finalId,
          kind: 'kunst',
          title: { de: titleDe, en: titleEn },
          book: { de: draftForm.bookDe || 'Allgemein', en: draftForm.bookDe || 'General' },
          artForm: draftForm.artForm,
          theme: {
            de: draftForm.subtitleDe.trim() || titleDe,
            en: draftForm.subtitleDe.trim() || titleEn,
          },
          description: { de: summaryDe, en: summaryEn },
          durationMin: Number(draftForm.durationMin) || 30,
          durationMax: Number(draftForm.durationMax) || 60,
          duration: {
            de: `${draftForm.durationMin}–${draftForm.durationMax} Min`,
            en: `${draftForm.durationMin}–${draftForm.durationMax} min`,
          },
          groupSize: { min: Number(draftForm.groupMin) || 3, max: Number(draftForm.groupMax) || 20 },
          setting: draftForm.setting,
          occasion: draftForm.occasion,
          materials: { de: materialsArr, en: materialsArr },
          guidingSteps: {
            de: stepsDe.length ? stepsDe : [summaryDe],
            en: finalStepsEn.length ? finalStepsEn : [summaryEn],
          },
          reflectionPrompts: { de: reflArr, en: reflArr },
          animatorTips: { de: tipsArr, en: tipsArr },
          status: 'draft',
          submittedBy: draftForm.submittedBy || adminAuthor,
        };
        adminData.saveArtsPrompt(artObj, adminAuthor, summaryNote, asDraft);
        savedPayloadForGitHub = artObj as unknown as Record<string, unknown>;
      } else if (draftForm.kind === 'kategorie') {
        const exArr = draftForm.examplesDe
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const catObj: EmpireCategory = {
          id: finalId,
          prompt: { de: titleDe, en: titleEn },
          hint: { de: summaryDe, en: summaryEn },
          examples: { de: exArr, en: exArr },
          mood: draftForm.mood,
          topic: draftForm.topic,
          age: 'all',
          shy: true,
          personal: false,
          status: 'draft',
        };
        adminData.saveEmpireCategory(catObj, adminAuthor, summaryNote, asDraft);
        savedPayloadForGitHub = catObj as unknown as Record<string, unknown>;
      }

      // If this came from an open proposal, update proposal status & GitHub issue
      if (editorMode.source === 'proposal') {
        const prop = editorMode.proposal;
        if (!adminData.proposals.some((p) => p.id === prop.id)) {
          saveProposal({ ...prop, status: asDraft ? 'pending' : 'accepted' });
        }
        if (!asDraft) {
          if (prop.githubIssueNumber) {
            updateGitHubIssueStatus(prop.githubIssueNumber, 'accept', summaryNote, savedPayloadForGitHub).catch(
              () => {}
            );
          }
          setGhProposals((prev) => prev.filter((p) => p.id !== prop.id));
          adminData.refresh();
        }
      }

      showToast(
        asDraft
          ? L(
              `"${titleDe}" als Entwurf im Backend gespeichert (noch nicht öffentlich).`,
              `"${titleDe}" saved as draft in backend (not public yet).`
            )
          : L(
              `"${titleDe}" ist jetzt live online und jederzeit weiter bearbeitbar.`,
              `"${titleDe}" is now live online and remains editable anytime.`
            )
      );

      setEditorMode(null);
      setDraftForm(null);
    },
    [draftForm, editorMode, reviewComment, adminAuthor, adminData, showToast, L]
  );

  // Reject or Delete from the Unified Detail Editor
  const handleRejectOrDeleteFromEditor = useCallback(() => {
    if (!editorMode || !draftForm) return;

    if (editorMode.source === 'proposal') {
      const prop = editorMode.proposal;
      if (!adminData.proposals.some((p) => p.id === prop.id)) {
        saveProposal(prop);
      }
      adminData.rejectProposal(prop.id, reviewComment.trim() || 'Redaktionell abgelehnt', adminAuthor);
      setGhProposals((prev) => prev.filter((p) => p.id !== prop.id));
      showToast(L('Vorschlag wurde abgelehnt.', 'Proposal was rejected.'));
    } else {
      const reason = reviewComment.trim() || `Aus Katalog entfernt von ${adminAuthor}`;
      if (draftForm.kind === 'spiel') {
        adminData.deleteGame(draftForm.id, adminAuthor, reason);
      } else if (draftForm.kind === 'dienst') {
        adminData.deleteServiceProject(draftForm.id, adminAuthor, reason);
      } else if (draftForm.kind === 'kunst') {
        adminData.deleteArtsPrompt(draftForm.id, adminAuthor, reason);
      } else if (draftForm.kind === 'kategorie') {
        adminData.deleteEmpireCategory(draftForm.id, adminAuthor);
      }
      showToast(L('Eintrag wurde aus dem Katalog entfernt.', 'Item was removed from catalog.'));
    }

    setEditorMode(null);
    setDraftForm(null);
  }, [editorMode, draftForm, reviewComment, adminAuthor, adminData, showToast, L]);

  // Filtered lists for Review View
  const filteredReviewProposals = useMemo(() => {
    const q = reviewSearch.toLowerCase().trim();
    return combinedProposals.filter((p) => {
      if (reviewTab === 'pending' && p.status !== 'pending') return false;
      if (reviewTab === 'accepted' && p.status !== 'accepted') return false;
      if (reviewTab === 'rejected' && p.status !== 'rejected') return false;
      if (reviewTypeFilter !== 'all' && p.type !== reviewTypeFilter) return false;
      if (reviewSubmitterFilter !== 'all' && (p.authorName || '') !== reviewSubmitterFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [combinedProposals, reviewTab, reviewTypeFilter, reviewSubmitterFilter, reviewSearch]);

  const filteredBackendDrafts = useMemo(() => {
    const q = reviewSearch.toLowerCase().trim();
    return backendDraftItems.filter((item) => {
      if (reviewTypeFilter !== 'all' && item.kind !== reviewTypeFilter) return false;
      if (reviewSubmitterFilter !== 'all' && item.submittedBy !== reviewSubmitterFilter) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [backendDraftItems, reviewTypeFilter, reviewSubmitterFilter, reviewSearch]);

  // Filtered lists for Catalog View
  const filteredCatalogGames = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    return adminData.adminGames.filter((g) => {
      const isDraft = adminData.backendDraftIds.has(g.id);
      if (catalogStatusFilter === 'online' && isDraft) return false;
      if (catalogStatusFilter === 'draft' && !isDraft) return false;
      if (catalogGameCatFilter !== 'all' && g.category !== catalogGameCatFilter) return false;
      if (
        q &&
        !g.title.de.toLowerCase().includes(q) &&
        !g.title.en.toLowerCase().includes(q) &&
        !g.summary.de.toLowerCase().includes(q) &&
        !g.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [adminData.adminGames, adminData.backendDraftIds, catalogSearch, catalogStatusFilter, catalogGameCatFilter]);

  const filteredCatalogService = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    return adminData.adminServiceProjects.filter((s) => {
      const isDraft = adminData.backendDraftIds.has(s.id);
      if (catalogStatusFilter === 'online' && isDraft) return false;
      if (catalogStatusFilter === 'draft' && !isDraft) return false;
      if (
        q &&
        !s.title.de.toLowerCase().includes(q) &&
        !s.title.en.toLowerCase().includes(q) &&
        !s.objective.de.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [adminData.adminServiceProjects, adminData.backendDraftIds, catalogSearch, catalogStatusFilter]);

  const filteredCatalogArts = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    return adminData.adminArtsPrompts.filter((a) => {
      const isDraft = adminData.backendDraftIds.has(a.id);
      if (catalogStatusFilter === 'online' && isDraft) return false;
      if (catalogStatusFilter === 'draft' && !isDraft) return false;
      if (
        q &&
        !a.title.de.toLowerCase().includes(q) &&
        !a.title.en.toLowerCase().includes(q) &&
        !a.description.de.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [adminData.adminArtsPrompts, adminData.backendDraftIds, catalogSearch, catalogStatusFilter]);

  const filteredCatalogEmpire = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    return adminData.adminEmpireCategories.filter((c) => {
      const isDraft = adminData.backendDraftIds.has(c.id);
      if (catalogStatusFilter === 'online' && isDraft) return false;
      if (catalogStatusFilter === 'draft' && !isDraft) return false;
      if (q && !c.prompt.de.toLowerCase().includes(q) && !c.hint.de.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [adminData.adminEmpireCategories, adminData.backendDraftIds, catalogSearch, catalogStatusFilter]);

  const filteredQuotes = useMemo(() => {
    const q = quotesSearch.toLowerCase().trim();
    if (!q) return QUOTES_DATA;
    return QUOTES_DATA.filter(
      (item) =>
        item.textDe.toLowerCase().includes(q) ||
        item.textEn.toLowerCase().includes(q) ||
        item.theme.de.toLowerCase().includes(q) ||
        item.book.de.toLowerCase().includes(q)
    );
  }, [quotesSearch]);

  // Revisions for the currently open item in Editor
  const currentEntityRevisions = useMemo(() => {
    if (!draftForm) return [];
    return adminData.revisions.filter(
      (r) => r.entityId === draftForm.id || r.entityId === `empire_${draftForm.id}`
    );
  }, [adminData.revisions, draftForm]);

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (loginPassword !== setupPasswordConfirm) {
      setAuthError(L('Die beiden Passwörter stimmen nicht überein.', 'Passwords do not match.'));
      return;
    }
    setIsAuthSubmitting(true);
    const res = await createAdminAccount({
      username: loginUsername,
      displayName: setupDisplayName,
      password: loginPassword,
      role: 'owner',
    });
    setIsAuthSubmitting(false);

    if (!res.ok || !res.account) {
      setAuthError(L(res.errorDe || 'Fehler beim Anlegen.', res.errorEn || 'Error creating account.'));
      return;
    }

    setAccounts(getAdminAccounts());
    setActiveSessionAccount(res.account);
    setCurrentAccount(res.account);
    setLoginPassword('');
    setSetupPasswordConfirm('');
    showToast(L(`Willkommen, ${res.account.displayName}`, `Welcome, ${res.account.displayName}`));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);
    const res = await verifyAdminLogin(loginUsername, loginPassword);
    setIsAuthSubmitting(false);

    if (!res.ok || !res.account) {
      setAuthError(L(res.errorDe || 'Anmeldung fehlgeschlagen.', res.errorEn || 'Sign-in failed.'));
      return;
    }

    setAccounts(getAdminAccounts());
    setCurrentAccount(res.account);
    setLoginPassword('');
    showToast(L(`Angemeldet als ${res.account.displayName}`, `Signed in as ${res.account.displayName}`));
  };

  const handleLogout = () => {
    setActiveSessionAccount(null);
    setCurrentAccount(null);
    setLoginPassword('');
  };

  const handleCreateTeamAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAdminAccount({
      username: newAccUsername,
      displayName: newAccDisplayName,
      password: newAccPassword,
      role: newAccRole,
    });
    if (!res.ok) {
      showToast(L(res.errorDe || 'Fehler', res.errorEn || 'Error'));
      return;
    }
    setAccounts(getAdminAccounts());
    setNewAccDisplayName('');
    setNewAccUsername('');
    setNewAccPassword('');
    showToast(
      L(
        `Account für "${res.account?.displayName}" wurde angelegt.`,
        `Account for "${res.account?.displayName}" created.`
      )
    );
  };

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;
    const res = await changeAdminPassword(currentAccount.id, currentPwdInput, newPwdInput);
    if (!res.ok) {
      showToast(L(res.errorDe || 'Fehler', res.errorEn || 'Error'));
      return;
    }
    setCurrentPwdInput('');
    setNewPwdInput('');
    showToast(L('Dein Passwort wurde erfolgreich geändert.', 'Your password was updated.'));
  };

  const handleRemoveAccount = (targetId: string) => {
    if (!currentAccount) return;
    const res = deleteAdminAccount(targetId, currentAccount.id);
    if (!res.ok) {
      showToast(L(res.errorDe || 'Fehler', res.errorEn || 'Error'));
      return;
    }
    setAccounts(getAdminAccounts());
    showToast(L('Account wurde entfernt.', 'Account was removed.'));
  };

  const formatShortDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const kindLabel = (kind: 'spiel' | 'dienst' | 'kunst' | 'kategorie') => {
    switch (kind) {
      case 'spiel':
        return L('Spiel', 'Game');
      case 'dienst':
        return L('Dienstprojekt', 'Service project');
      case 'kunst':
        return L('Kunstimpuls', 'Arts prompt');
      case 'kategorie':
        return L('Minispiel-Kategorie', 'Mini-game category');
    }
  };

  // --- LOGIN OR INITIAL ACCOUNT SETUP SCREEN ---
  if (!isAuthenticated) {
    const isInitialSetup = accounts.length === 0;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bg">
        <div className="w-full max-w-md bg-surface border border-border rounded-card p-6 sm:p-8 shadow-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-surface-2 border border-border flex items-center justify-center text-accent">
                <Logo className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-text tracking-tight">Junior Youth Hub</h1>
                <p className="text-xs text-text-secondary">
                  {isInitialSetup
                    ? L('Erstmalige Administrator-Einrichtung', 'Initial Administrator Setup')
                    : L('Redaktions-Portal · Anmeldung', 'Editorial Portal · Sign In')}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="text-xs font-semibold text-text-secondary hover:text-text inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-control hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {L('Zur Webseite', 'Back to site')}
            </Link>
          </div>

          {isInitialSetup ? (
            <form onSubmit={handleInitialSetup} className="space-y-4">
              <div className="p-3.5 rounded-control bg-surface-2 border border-border text-xs text-text-secondary leading-relaxed">
                {L(
                  'Es existiert noch kein Account. Lege jetzt deinen ersten persönlichen Administrator-Zugang mit eigenem Passwort an. Weitere Team-Accounts kannst du danach im Portal erstellen.',
                  'No account exists yet. Create your first personal administrator account with a secure password. You can create additional team accounts inside the portal afterwards.'
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {L('Vollständiger Name', 'Full Name')}
                </label>
                <input
                  type="text"
                  value={setupDisplayName}
                  onChange={(e) => setSetupDisplayName(e.target.value)}
                  placeholder="z. B. Nuri Milan Modabber"
                  className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {L('Benutzername oder E-Mail', 'Username or Email')}
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="z. B. nuri@modabber.net"
                  className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {L('Passwort (mind. 8 Zeichen)', 'Password (min. 8 characters)')}
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {L('Passwort bestätigen', 'Confirm Password')}
                </label>
                <input
                  type="password"
                  value={setupPasswordConfirm}
                  onChange={(e) => setSetupPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                  required
                  minLength={8}
                />
              </div>

              {authError && <p className="text-xs font-semibold text-danger">{authError}</p>}

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3 rounded-control bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors cursor-pointer min-h-[44px]"
              >
                {L('Administrator-Account anlegen', 'Create Administrator Account')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {L('Benutzername oder E-Mail', 'Username or Email')}
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="z. B. nuri@modabber.net"
                  className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5">
                  {L('Passwort', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder={L('Dein persönliches Passwort', 'Your personal password')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                    required
                  />
                </div>
              </div>

              {authError && <p className="text-xs font-semibold text-danger">{authError}</p>}

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3 rounded-control bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition-colors cursor-pointer min-h-[44px]"
              >
                {L('Anmelden', 'Sign In')}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Sidebar Content (shared between Desktop fixed sidebar and Mobile drawer)
  const renderSidebarContent = (onNavigateItem?: () => void) => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Brand & Navigation */}
      <div className="space-y-6 p-4">
        {/* Brand Header (Bahá'í Songs Portal style) */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-control bg-surface-2 border border-border flex items-center justify-center text-text shrink-0">
              <Logo className="w-5 h-5 text-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-sm text-text tracking-tight">Junior Youth Hub</div>
              <div className="text-xs text-text-tertiary">{L('Portal', 'Portal')}</div>
            </div>
          </div>
        </div>

        {/* Workspace Navigation */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1.5 text-xs font-semibold text-text-tertiary">
            {L('Arbeitsbereich', 'Workspace')}
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveSection('catalog');
              setEditorMode(null);
              onNavigateItem?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-control text-sm font-semibold transition-colors cursor-pointer min-h-[40px] ${
              activeSection === 'catalog' && !editorMode
                ? 'bg-surface-2 text-text'
                : 'text-text-secondary hover:bg-surface-2/60 hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-text-tertiary" />
              <span>{L('Katalog', 'Catalog')}</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
              {totalOnlineCatalogCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('quotes');
              setEditorMode(null);
              onNavigateItem?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-control text-sm font-semibold transition-colors cursor-pointer min-h-[40px] ${
              activeSection === 'quotes' && !editorMode
                ? 'bg-surface-2 text-text'
                : 'text-text-secondary hover:bg-surface-2/60 hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-text-tertiary" />
              <span>{L('Heilige Worte', 'Sacred Quotes')}</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
              {QUOTES_DATA.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('review');
              setReviewTab('pending');
              setEditorMode(null);
              onNavigateItem?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-control text-sm font-semibold transition-colors cursor-pointer min-h-[40px] ${
              activeSection === 'review' && !editorMode
                ? 'bg-surface-2 text-text'
                : 'text-text-secondary hover:bg-surface-2/60 hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-text-tertiary" />
              <span>{L('Prüfung', 'Review')}</span>
            </span>
            {pendingProposalsCount > 0 && (
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-accent text-accent-contrast">
                {pendingProposalsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('drafts');
              setEditorMode(null);
              onNavigateItem?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-control text-sm font-semibold transition-colors cursor-pointer min-h-[40px] ${
              activeSection === 'drafts' && !editorMode
                ? 'bg-surface-2 text-text'
                : 'text-text-secondary hover:bg-surface-2/60 hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-text-tertiary" />
              <span>{L('Entwürfe', 'Drafts')}</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
              {backendDraftItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('operations');
              setEditorMode(null);
              onNavigateItem?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-control text-sm font-semibold transition-colors cursor-pointer min-h-[40px] ${
              activeSection === 'operations' && !editorMode
                ? 'bg-surface-2 text-text'
                : 'text-text-secondary hover:bg-surface-2/60 hover:text-text'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-text-tertiary" />
              <span>{L('Betrieb & Sync', 'Operations')}</span>
            </span>
          </button>
        </div>

        {/* Quick Create Box */}
        <div className="pt-2 border-t border-border">
          <div className="px-2.5 pb-2 text-xs font-semibold text-text-tertiary">
            {L('Schnellerstellung', 'Quick Create')}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                openNewItemInEditor('spiel');
                onNavigateItem?.();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{L('Spiel', 'Game')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openNewItemInEditor('dienst');
                onNavigateItem?.();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{L('Dienst', 'Service')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openNewItemInEditor('kunst');
                onNavigateItem?.();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{L('Kunst', 'Art')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                openNewItemInEditor('kategorie');
                onNavigateItem?.();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{L('Minispiel', 'Mini-game')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Session Controls (Screenshot 1 bottom-left style) */}
      <div className="p-4 border-t border-border space-y-3 bg-surface/50">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors min-h-[34px]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{L('Zur Webseite', 'Public Site')}</span>
          </Link>
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-control bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[34px]"
            title={L('Darstellung wechseln', 'Toggle theme')}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          {setLanguage && (
            <button
              type="button"
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
              className="px-2.5 py-1.5 rounded-control text-xs font-bold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[34px]"
              title={L('Sprache wechseln', 'Switch language')}
            >
              {language.toUpperCase()}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-extrabold text-text shrink-0">
              {adminAuthor
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'AD'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text truncate">{adminAuthor}</div>
              <div className="text-2xs text-text-tertiary truncate">
                {currentAccount?.username || getGitHubRepo()}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-control text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer shrink-0"
            title={L('Abmelden', 'Sign out')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Desktop Left Sidebar */}
      {sidebarOpen && (
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface/40 sticky top-0 h-screen">
          {renderSidebarContent()}
        </aside>
      )}

      {/* Mobile Drawer Sidebar */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-surface border-r border-border h-full z-10 flex flex-col">
            {renderSidebarContent(() => setMobileDrawerOpen(false))}
          </aside>
        </div>
      )}

      {/* Right Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb Bar (Screenshot 1 top bar style) */}
        <header className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 bg-bg/90 backdrop-blur-xs sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileDrawerOpen(true);
                } else {
                  setSidebarOpen((v) => !v);
                }
              }}
              className="p-2 rounded-control text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Sidebar umschalten"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <span className="h-4 w-px bg-border" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              {editorMode && draftForm ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditorMode(null);
                      setDraftForm(null);
                    }}
                    className="font-semibold text-text-secondary hover:text-text transition-colors cursor-pointer truncate"
                  >
                    {editorMode.source === 'proposal'
                      ? L('Prüfung', 'Review')
                      : activeSection === 'drafts'
                        ? L('Entwürfe', 'Drafts')
                        : L('Katalog', 'Catalog')}
                  </button>
                  <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
                  <span className="font-bold text-text truncate">
                    {draftForm.titleDe || L('Neuer Eintrag', 'New Item')}
                  </span>
                </>
              ) : (
                <span className="font-semibold text-text">
                  {activeSection === 'review' && L('Prüfung', 'Review')}
                  {activeSection === 'drafts' && L('Entwürfe (Nur im Backend)', 'Drafts (Backend only)')}
                  {activeSection === 'catalog' && L('Katalog', 'Catalog')}
                  {activeSection === 'quotes' && L('Heilige Worte', 'Sacred Quotes')}
                  {activeSection === 'operations' && L('Betrieb & Sync', 'Operations')}
                </span>
              )}
            </div>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => syncWithGitHub(false)}
              disabled={isSyncingGh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGh ? 'animate-spin text-accent' : ''}`} />
              <span className="hidden sm:inline">{L('GitHub Sync', 'GitHub Sync')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsGitHubModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {/* ===================================================================
              DETAIL / REVIEW / LIVE-PREVIEW EDITOR VIEW (Screenshot 2 Style!)
             =================================================================== */}
          {editorMode && draftForm ? (
            <div className="space-y-8 pb-16">
              {/* Back Link & Title Header */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditorMode(null);
                    setDraftForm(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {editorMode.source === 'proposal'
                      ? L('Zurück zur Prüfung', 'Back to Review')
                      : L('Zurück zur Übersicht', 'Back to list')}
                  </span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                      {draftForm.titleDe || L('Neuer Eintrag', 'New Entry')}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full border border-border bg-surface text-text-secondary font-semibold">
                        {kindLabel(draftForm.kind)}
                      </span>

                      {editorMode.source === 'proposal' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-2 text-text font-bold">
                          {L('Eingereicht', 'Submitted')}
                        </span>
                      ) : adminData.backendDraftIds.has(draftForm.id) ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-warning/15 text-warning font-bold">
                          {L('Entwurf · Nur im Backend', 'Draft · Backend only')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 text-success font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          {L('Online im Katalog', 'Live in Catalog')}
                        </span>
                      )}

                      <span className="text-text-secondary font-semibold">{draftForm.submittedBy}</span>

                      {draftForm.githubIssueNumber && (
                        <a
                          href={
                            draftForm.githubUrl ||
                            `https://github.com/${getGitHubRepo()}/issues/${draftForm.githubIssueNumber}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                        >
                          <span>GitHub #{draftForm.githubIssueNumber}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Title Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    {L('Titel (Deutsch)', 'Title (German)')}
                  </label>
                  <input
                    type="text"
                    value={draftForm.titleDe}
                    onChange={(e) => setDraftForm({ ...draftForm, titleDe: e.target.value })}
                    placeholder={L('Name des Eintrags...', 'Entry title...')}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface border border-border text-sm font-semibold text-text focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    {L('Titel (Englisch – optional)', 'Title (English – optional)')}
                  </label>
                  <input
                    type="text"
                    value={draftForm.titleEn}
                    onChange={(e) => setDraftForm({ ...draftForm, titleEn: e.target.value })}
                    placeholder={draftForm.titleDe || 'English title...'}
                    className="w-full px-3.5 py-2.5 rounded-control bg-surface border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              {/* Side-by-Side Editor & Live Preview (Screenshot 2 Lead sheets / Preview layout) */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-text">
                    {L('Inhalt & Live-Vorschau', 'Content & Live Preview')}
                  </h2>
                  <span className="text-xs text-text-tertiary">
                    {L('Änderungen links werden rechts sofort als Vorschau dargestellt', 'Edits on the left update the preview in real time')}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* LEFT COLUMN: Structured Content Inputs */}
                  <div className="space-y-4 bg-surface border border-border rounded-card p-5">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        {draftForm.kind === 'dienst'
                          ? L('Ziel des Dienstprojekts (DE)', 'Service Objective (DE)')
                          : draftForm.kind === 'kategorie'
                            ? L('Hinweis / Untertitel für Spielleitung', 'Hint / Subtitle for Facilitator')
                            : L('Kurzbeschreibung / Kernidee (DE)', 'Summary / Core Idea (DE)')}
                      </label>
                      <textarea
                        rows={3}
                        value={draftForm.summaryDe}
                        onChange={(e) => setDraftForm({ ...draftForm, summaryDe: e.target.value })}
                        placeholder={L('Kurze Zusammenfassung worum es geht...', 'Brief summary...')}
                        className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                      />
                    </div>

                    {draftForm.kind !== 'kategorie' ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            {draftForm.kind === 'spiel'
                              ? L('Spielregeln & Ablauf (eine Regel pro Zeile)', 'Game Rules & Steps (one per line)')
                              : L('Schritte zur Durchführung (ein Schritt pro Zeile)', 'Implementation Steps (one per line)')}
                          </label>
                          <textarea
                            rows={8}
                            value={draftForm.stepsDe}
                            onChange={(e) => setDraftForm({ ...draftForm, stepsDe: e.target.value })}
                            placeholder={L(
                              '1. Alle stehen im Kreis...\n2. Die Spielleitung erklärt...\n3. Nach jeder Runde...',
                              'Step 1...\nStep 2...'
                            )}
                            className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm font-mono text-text focus:outline-hidden focus:border-accent leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                              {L('Materialien (kommagetrennt)', 'Materials (comma-separated)')}
                            </label>
                            <input
                              type="text"
                              value={draftForm.materialsDe}
                              onChange={(e) => setDraftForm({ ...draftForm, materialsDe: e.target.value })}
                              placeholder={L('Keine, oder z. B. Ball, Papier', 'None, or e.g. Ball, paper')}
                              className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                              {L('Untertitel / Thema (optional)', 'Subtitle / Theme (optional)')}
                            </label>
                            <input
                              type="text"
                              value={draftForm.subtitleDe}
                              onChange={(e) => setDraftForm({ ...draftForm, subtitleDe: e.target.value })}
                              placeholder={L('z. B. Vertrauen & Teamgeist', 'e.g. Trust & Teamwork')}
                              className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                            />
                          </div>
                        </div>

                        {(draftForm.kind === 'dienst' || draftForm.kind === 'kunst') && (
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                              {L('Reflexionsfragen für die Gruppe (eine pro Zeile)', 'Reflection Questions (one per line)')}
                            </label>
                            <textarea
                              rows={3}
                              value={draftForm.reflectionDe}
                              onChange={(e) => setDraftForm({ ...draftForm, reflectionDe: e.target.value })}
                              placeholder={L('Was haben wir bei dieser Aktion gelernt?', 'What did we learn?')}
                              className="w-full px-3.5 py-2 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            {L('Tipps für Animatoren (ein Tipp pro Zeile)', 'Animator Tips (one per line)')}
                          </label>
                          <textarea
                            rows={2}
                            value={draftForm.tipsDe}
                            onChange={(e) => setDraftForm({ ...draftForm, tipsDe: e.target.value })}
                            placeholder={L('Achte darauf, dass ruhigere Jugendliche...', 'Make sure quieter youth...')}
                            className="w-full px-3.5 py-2 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                          {L('Beispiel-Antworten (kommagetrennt)', 'Example Answers (comma-separated)')}
                        </label>
                        <textarea
                          rows={4}
                          value={draftForm.examplesDe}
                          onChange={(e) => setDraftForm({ ...draftForm, examplesDe: e.target.value })}
                          placeholder="Apfel, Banane, Kirsche, Mango..."
                          className="w-full px-3.5 py-2.5 rounded-control bg-bg border border-border text-sm text-text focus:outline-hidden focus:border-accent"
                        />
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: Live Website Preview (Screenshot 2 Preview box style) */}
                  <div className="bg-surface border border-border rounded-card p-5 space-y-5 lg:sticky lg:top-20">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-accent" />
                        {L('Live-Vorschau auf der Webseite', 'Live Website Preview')}
                      </span>
                      <span className="text-2xs font-mono text-text-tertiary">/{draftForm.kind}/{draftForm.id}</span>
                    </div>

                    {/* Card Preview */}
                    <div className="bg-bg border border-border rounded-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block text-2xs font-bold px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent-text mb-1.5">
                            {kindLabel(draftForm.kind)}
                          </span>
                          <h3 className="text-base font-extrabold text-text">
                            {draftForm.titleDe || L('Unbenannter Eintrag', 'Untitled Entry')}
                          </h3>
                          {draftForm.subtitleDe && (
                            <p className="text-xs text-text-tertiary">{draftForm.subtitleDe}</p>
                          )}
                        </div>
                        {draftForm.kind !== 'kategorie' && (
                          <span className="text-xs font-semibold text-text-secondary bg-surface px-2.5 py-1 rounded-full border border-border shrink-0">
                            {draftForm.durationMin}–{draftForm.durationMax} Min
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {draftForm.summaryDe || L('Noch keine Beschreibung eingegeben...', 'No summary entered yet...')}
                      </p>

                      {draftForm.kind !== 'kategorie' && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-2xs text-text-tertiary font-semibold">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border">
                            <Users className="w-3 h-3" />
                            {draftForm.groupMin}–{draftForm.groupMax} {L('TN', 'p.')}
                          </span>
                          {draftForm.materialsDe.trim() ? (
                            <span className="px-2 py-0.5 rounded-full bg-surface border border-border">
                              {L('Material:', 'Materials:')} {draftForm.materialsDe}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-surface border border-border">
                              {L('Ohne Material', 'No materials')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Steps / Content Preview */}
                    {draftForm.kind !== 'kategorie' ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-text-secondary">
                          {draftForm.kind === 'spiel' ? L('Ablauf & Regeln', 'Rules & Flow') : L('Durchführung', 'Steps')}
                        </h4>
                        <ol className="space-y-2">
                          {(draftForm.stepsDe
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean).length > 0
                            ? draftForm.stepsDe
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : [L('Noch keine Schritte eingetragen.', 'No steps entered yet.')]
                          ).map((step, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-text leading-relaxed">
                              <span className="w-5 h-5 rounded-full bg-surface-2 border border-border text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{step.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-text-secondary">
                          {L('Beispiele', 'Examples')}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {draftForm.examplesDe
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((ex, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full text-xs bg-bg border border-border text-text"
                              >
                                {ex}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata & Classification Section (Screenshot 2 "Scores" section style) */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h2 className="text-base font-extrabold text-text">
                  {L('Metadaten & Filter-Einordnung', 'Metadata & Filter Classification')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-surface border border-border rounded-card p-5">
                  {draftForm.kind === 'spiel' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Spiel-Kategorie', 'Game Category')}
                        </label>
                        <select
                          value={draftForm.gameCategory}
                          onChange={(e) =>
                            setDraftForm({ ...draftForm, gameCategory: e.target.value as GameCategory })
                          }
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="cooperative">{L('Kooperativ', 'Cooperative')}</option>
                          <option value="energizer">{L('Energizer', 'Energizer')}</option>
                          <option value="social_deduction">{L('Deduktion / Rollen', 'Social Deduction')}</option>
                          <option value="competitive">{L('Wettkampf', 'Competitive')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Energie-Level', 'Energy Level')}
                        </label>
                        <select
                          value={draftForm.energyLevel}
                          onChange={(e) =>
                            setDraftForm({ ...draftForm, energyLevel: e.target.value as EnergyLevel })
                          }
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="high">{L('Hoch (Bewegung)', 'High (Active)')}</option>
                          <option value="medium">{L('Mittel', 'Medium')}</option>
                          <option value="calm">{L('Ruhig / Fokus', 'Calm / Focus')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Vorbereitung', 'Preparation')}
                        </label>
                        <select
                          value={draftForm.prepLevel}
                          onChange={(e) => setDraftForm({ ...draftForm, prepLevel: e.target.value as PrepLevel })}
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="instant">{L('Sofort spielbar', 'Instant / No prep')}</option>
                          <option value="low_prep">{L('Wenig Vorbereitung', 'Low prep')}</option>
                          <option value="materials_needed">{L('Material nötig', 'Materials needed')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('pädagogischer Zweck', 'Purpose')}
                        </label>
                        <select
                          value={draftForm.purpose}
                          onChange={(e) => setDraftForm({ ...draftForm, purpose: e.target.value as GamePurpose })}
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="zusammenarbeit">{L('Zusammenarbeit', 'Cooperation')}</option>
                          <option value="kennenlernen">{L('Kennenlernen', 'Icebreaker')}</option>
                          <option value="energie">{L('Energie', 'Energy')}</option>
                          <option value="ruhe">{L('Ruhe & Fokus', 'Calm & Focus')}</option>
                          <option value="raten">{L('Raten & Denken', 'Guessing')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {draftForm.kind === 'dienst' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Dienst-Bereich', 'Service Category')}
                        </label>
                        <select
                          value={draftForm.serviceCategory}
                          onChange={(e) =>
                            setDraftForm({
                              ...draftForm,
                              serviceCategory: e.target.value as ServiceProjectCategory,
                            })
                          }
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="neighborhood">{L('Nachbarschaft', 'Neighborhood')}</option>
                          <option value="environmental">{L('Umwelt & Natur', 'Environment')}</option>
                          <option value="intergenerational">{L('Generationen', 'Intergenerational')}</option>
                          <option value="children">{L('Kinder', 'Children')}</option>
                          <option value="creative">{L('Kreativer Dienst', 'Creative Service')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Umfang', 'Scope')}
                        </label>
                        <select
                          value={draftForm.serviceScope}
                          onChange={(e) =>
                            setDraftForm({ ...draftForm, serviceScope: e.target.value as ServiceProjectScope })
                          }
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="quick">{L('Kurzaktion (1 Treffen)', 'Quick (1 meeting)')}</option>
                          <option value="medium">{L('Mittel (2–3 Treffen)', 'Medium (2–3 meetings)')}</option>
                          <option value="deep">{L('Längerfristiges Projekt', 'Long-term project')}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {draftForm.kind === 'kunst' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Kunstform', 'Art Form')}
                        </label>
                        <select
                          value={draftForm.artForm}
                          onChange={(e) => setDraftForm({ ...draftForm, artForm: e.target.value as ArtForm })}
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        >
                          <option value="visual_arts">{L('Bildende Kunst & Basteln', 'Visual Arts')}</option>
                          <option value="drama">{L('Theater & Rollenspiel', 'Drama & Roleplay')}</option>
                          <option value="music_poetry">{L('Musik, Rhythmus & Poesie', 'Music & Poetry')}</option>
                          <option value="collaborative_mural">{L('Gemeinschaftswerk', 'Collaborative Work')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Buchbezug', 'Related Book')}
                        </label>
                        <input
                          type="text"
                          value={draftForm.bookDe}
                          onChange={(e) => setDraftForm({ ...draftForm, bookDe: e.target.value })}
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                        />
                      </div>
                    </>
                  )}

                  {draftForm.kind !== 'kategorie' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Dauer (Min – Max in Minuten)', 'Duration (Min – Max)')}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={draftForm.durationMin}
                            onChange={(e) => setDraftForm({ ...draftForm, durationMin: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                          />
                          <span className="text-text-tertiary">–</span>
                          <input
                            type="number"
                            value={draftForm.durationMax}
                            onChange={(e) => setDraftForm({ ...draftForm, durationMax: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Gruppengröße (Min – Max)', 'Group Size (Min – Max)')}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={draftForm.groupMin}
                            onChange={(e) => setDraftForm({ ...draftForm, groupMin: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                          />
                          <span className="text-text-tertiary">–</span>
                          <input
                            type="number"
                            value={draftForm.groupMax}
                            onChange={(e) => setDraftForm({ ...draftForm, groupMax: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submission & Revision Activity Box (Screenshot 2 "Submission activity" box style) */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pt-4 border-t border-border">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-text">
                    {L('Verlauf & Aktivität', 'Submission & Revision Activity')}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {L(
                      'Jede Speicherung wird versioniert und kann bei Bedarf mit einem Klick zurückgesetzt werden.',
                      'Every save is versioned and can be restored with one click.'
                    )}
                  </p>
                </div>

                <div className="w-full md:w-96 bg-surface border border-border rounded-card p-4 space-y-2.5">
                  <div className="text-xs font-bold text-text">{L('Aktivitäts-Protokoll', 'Activity Log')}</div>
                  <div className="text-xs text-text-secondary">
                    <span className="font-semibold text-text">{L('Erstellt / Eingereicht', 'Submitted')}</span>{' '}
                    {L('von', 'by')} <span className="font-semibold text-text">{draftForm.submittedBy}</span>
                  </div>
                  {currentEntityRevisions.slice(0, 3).map((rev) => (
                    <div
                      key={rev.revisionId}
                      className="flex items-center justify-between gap-2 pt-2 border-t border-border text-2xs text-text-secondary"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-text truncate">{rev.summary}</div>
                        <div className="text-text-tertiary">
                          {rev.author} · {new Date(rev.timestamp).toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          adminData.rollback(rev.revisionId, adminAuthor);
                          showToast(L('Version wiederhergestellt', 'Revision restored'));
                          setEditorMode(null);
                        }}
                        className="px-2 py-1 rounded-control bg-surface-2 hover:bg-border text-text font-semibold shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Editorial Decision Bar (Screenshot 2 "Editor review" split boxes style!) */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-text">
                    {L('Redaktionelle Freigabe & Status', 'Editorial Review & Publishing')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Box: Save as Backend Draft or Reject/Delete */}
                  <div className="bg-surface border border-border rounded-card p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-extrabold text-text">
                        {L('Als Entwurf behalten oder ablehnen', 'Keep as backend draft or reject')}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {L(
                          'Ein „Entwurf“ ist nur hier im Backend sichtbar und noch nicht auf der öffentlichen Webseite.',
                          'A "Draft" is only visible here in the backend and not yet on the public website.'
                        )}
                      </p>
                      <div className="pt-1">
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Redaktions-Notiz / Begründung (optional)', 'Editorial note / reason (optional)')}
                        </label>
                        <textarea
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={L(
                            'Optionale Notiz für das Änderungsprotokoll oder Grund für Ablehnung...',
                            'Optional note for revision log or rejection reason...'
                          )}
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-xs text-text focus:outline-hidden focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveFromEditor(true)}
                        className="px-4 py-2.5 rounded-control bg-surface-2 hover:bg-border text-text font-bold text-xs transition-colors cursor-pointer min-h-[40px]"
                      >
                        {L('Als Entwurf speichern (Nur Backend)', 'Save as Draft (Backend only)')}
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectOrDeleteFromEditor}
                        className="px-4 py-2.5 rounded-control bg-danger/15 hover:bg-danger text-danger hover:text-white font-bold text-xs transition-colors cursor-pointer min-h-[40px]"
                      >
                        {editorMode.source === 'proposal'
                          ? L('Ablehnen', 'Reject')
                          : L('Aus Katalog entfernen', 'Remove from Catalog')}
                      </button>
                    </div>
                  </div>

                  {/* Right Box: Accept into Catalog / Publish immediately online */}
                  <div className="bg-surface border border-border rounded-card p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-extrabold text-text">
                        {editorMode.source === 'proposal' || adminData.backendDraftIds.has(draftForm.id)
                          ? L('Freigeben & sofort veröffentlichen', 'Accept & publish immediately')
                          : L('Änderungen live im Katalog speichern', 'Save changes live in Catalog')}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        {L(
                          'Sobald du den Eintrag freigibst, ist er sofort auf der Webseite online und bleibt im Katalog jederzeit bearbeitbar.',
                          'As soon as you accept this entry, it goes live on the website immediately and remains editable in the Catalog anytime.'
                        )}
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Katalog-Kennung (Slug / ID)', 'Catalog Slug / ID')}
                        </label>
                        <input
                          type="text"
                          value={draftForm.id}
                          readOnly={editorMode.source === 'catalog' && !editorMode.isNew}
                          onChange={(e) => setDraftForm({ ...draftForm, id: e.target.value })}
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-xs font-mono text-text-secondary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveFromEditor(false)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control bg-accent hover:bg-accent-hover text-accent-contrast font-extrabold text-xs transition-colors cursor-pointer min-h-[40px] shadow-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {editorMode.source === 'proposal' || adminData.backendDraftIds.has(draftForm.id)
                            ? L('In Katalog übernehmen (Sofort online)', 'Accept into Catalog (Live now)')
                            : L('Änderungen live speichern', 'Save live changes')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ===================================================================
                LIST & WORKSPACE VIEWS (Screenshot 1 Style!)
               =================================================================== */
            <>
              {/* 1. REVIEW OR DRAFTS SECTION */}
              {(activeSection === 'review' || activeSection === 'drafts') && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                        {activeSection === 'drafts' ? L('Entwürfe', 'Drafts') : L('Prüfung', 'Review')}
                      </h1>
                      <p className="text-xs text-text-secondary mt-1">
                        {activeSection === 'drafts'
                          ? L(
                              'Einträge, die aktuell nur hier im Backend gespeichert sind. Klicke auf einen Eintrag, um ihn zu bearbeiten und live zu schalten.',
                              'Items currently stored only in the backend. Click any item to edit and publish live.'
                            )
                          : L(
                              'Einreichungen aus der Community und von GitHub prüfen, bearbeiten und direkt im Katalog freischalten.',
                              'Review, edit, and publish community submissions directly into the live catalog.'
                            )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openNewItemInEditor('spiel')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-control bg-accent text-accent-contrast text-xs font-extrabold hover:bg-accent-hover transition-colors cursor-pointer min-h-[38px] self-start"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{L('Neuer Entwurf', 'New Draft')}</span>
                    </button>
                  </div>

                  {/* Horizontal Underline Tabs (Screenshot 1 style) */}
                  {activeSection === 'review' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
                      {[
                        { id: 'pending', label: L('Offen', 'Needs review'), count: pendingProposalsCount },
                        { id: 'drafts', label: L('Entwürfe (Backend)', 'Drafts (Backend)'), count: backendDraftItems.length },
                        { id: 'accepted', label: L('Angenommen', 'Accepted'), count: acceptedProposalsCount },
                        { id: 'rejected', label: L('Abgelehnt', 'Rejected'), count: rejectedProposalsCount },
                      ].map((tItem) => {
                        const active = reviewTab === tItem.id;
                        return (
                          <button
                            key={tItem.id}
                            type="button"
                            onClick={() => setReviewTab(tItem.id as ReviewStatusTab)}
                            className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                              active
                                ? 'border-text text-text'
                                : 'border-transparent text-text-tertiary hover:text-text-secondary'
                            }`}
                          >
                            <span>{tItem.label}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-extrabold ${
                                active
                                  ? 'bg-text text-bg'
                                  : 'bg-surface-2 text-text-secondary'
                              }`}
                            >
                              {tItem.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Unified Table Box (Screenshot 1 style) */}
                  <div className="bg-surface border border-border rounded-card overflow-hidden">
                    {/* Filter Header Bar inside the table box */}
                    <div className="p-3 sm:px-4 sm:py-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={reviewSearch}
                          onChange={(e) => setReviewSearch(e.target.value)}
                          placeholder={L('Einträge durchsuchen...', 'Search entries...')}
                          className="w-full pl-9 pr-3 py-1.5 rounded-control bg-bg border border-border text-xs text-text focus:outline-hidden focus:border-accent min-h-[34px]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Segmented Type Filter */}
                        <div className="inline-flex rounded-control border border-border bg-bg p-0.5">
                          {(
                            [
                              { id: 'all', label: L('Alle', 'All') },
                              { id: 'spiel', label: L('Spiele', 'Games') },
                              { id: 'dienst', label: L('Dienst', 'Service') },
                              { id: 'kunst', label: L('Kunst', 'Art') },
                              { id: 'kategorie', label: L('Minispiele', 'Mini-games') },
                            ] as const
                          ).map((seg) => (
                            <button
                              key={seg.id}
                              type="button"
                              onClick={() => setReviewTypeFilter(seg.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                reviewTypeFilter === seg.id
                                  ? 'bg-surface-2 text-text font-bold'
                                  : 'text-text-tertiary hover:text-text'
                              }`}
                            >
                              {seg.label}
                            </button>
                          ))}
                        </div>

                        {/* Submitter Dropdown */}
                        <select
                          value={reviewSubmitterFilter}
                          onChange={(e) => setReviewSubmitterFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-control bg-bg border border-border text-xs font-semibold text-text-secondary min-h-[34px]"
                        >
                          <option value="all">{L('Alle Einreicher', 'All submitters')}</option>
                          {allSubmitters.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Rows List */}
                    <div className="divide-y divide-border">
                      {activeSection === 'drafts' || reviewTab === 'drafts' ? (
                        filteredBackendDrafts.length === 0 ? (
                          <div className="p-10 text-center space-y-2">
                            <p className="text-sm font-bold text-text">
                              {L('Keine unveröffentlichten Entwürfe im Backend', 'No unpublished drafts in backend')}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {L(
                                'Alle aktiven Einträge sind bereits online im Katalog veröffentlicht.',
                                'All active entries are already live in the catalog.'
                              )}
                            </p>
                          </div>
                        ) : (
                          filteredBackendDrafts.map((dItem) => (
                            <button
                              key={`${dItem.kind}_${dItem.id}`}
                              type="button"
                              onClick={() => openCatalogItemInEditor(dItem.kind, dItem.id)}
                              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                                    {dItem.title}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold border border-border text-text-secondary">
                                    {kindLabel(dItem.kind)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-warning/15 text-warning">
                                    {L('Entwurf · Nur Backend', 'Draft · Backend only')}
                                  </span>
                                </div>
                                <div className="text-xs text-text-tertiary truncate">
                                  {dItem.submittedBy} · {dItem.summary}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 text-xs text-text-tertiary">
                                <span>{formatShortDate(dItem.updatedAt)}</span>
                                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </button>
                          ))
                        )
                      ) : filteredReviewProposals.length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                          <p className="text-sm font-bold text-text">
                            {L('Keine Einträge in dieser Ansicht', 'No items in this view')}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {L(
                              'Neue Vorschläge von der Webseite oder von GitHub erscheinen automatisch hier.',
                              'New proposals from the website or GitHub appear here automatically.'
                            )}
                          </p>
                        </div>
                      ) : (
                        filteredReviewProposals.map((prop) => (
                          <button
                            key={prop.id}
                            type="button"
                            onClick={() => openProposalInEditor(prop)}
                            className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer group"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                                  {prop.title}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-2xs font-semibold border border-border text-text-secondary">
                                  {L('Neu:', 'New:')} {kindLabel(prop.type)}
                                </span>
                                {prop.githubIssueNumber && (
                                  <span className="text-2xs font-mono text-text-tertiary">
                                    #{prop.githubIssueNumber}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-tertiary truncate">
                                {prop.authorName || 'Community'}
                                {prop.summary ? ` · ${prop.summary}` : ''}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-xs text-text-tertiary">
                              <span>{formatShortDate(prop.createdAt)}</span>
                              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CATALOG SECTION (All Live & Draft Items, Clickable to Edit) */}
              {activeSection === 'catalog' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                        {L('Katalog', 'Catalog')}
                      </h1>
                      <p className="text-xs text-text-secondary mt-1">
                        {L(
                          'Alle veröffentlichten Inhalte und Entwürfe. Klicke auf einen beliebigen Eintrag, um ihn live zu bearbeiten.',
                          'All published items and drafts. Click any entry to edit it live.'
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openNewItemInEditor(
                          catalogTab === 'games'
                            ? 'spiel'
                            : catalogTab === 'service'
                              ? 'dienst'
                              : catalogTab === 'arts'
                                ? 'kunst'
                                : 'kategorie'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-control bg-accent text-accent-contrast text-xs font-extrabold hover:bg-accent-hover transition-colors cursor-pointer min-h-[38px] self-start"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{L('Neuer Eintrag', 'New Entry')}</span>
                    </button>
                  </div>

                  {/* Underline Category Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
                    {[
                      { id: 'games', label: L('Spiele', 'Games'), count: adminData.adminGames.length },
                      {
                        id: 'service',
                        label: L('Dienstprojekte', 'Service Projects'),
                        count: adminData.adminServiceProjects.length,
                      },
                      {
                        id: 'arts',
                        label: L('Kunstimpulse', 'Arts Prompts'),
                        count: adminData.adminArtsPrompts.length,
                      },
                      {
                        id: 'minigames',
                        label: L('Minispiele', 'Mini-Games'),
                        count:
                          adminData.adminEmpireCategories.length +
                          adminData.adminSpyLocations.length +
                          adminData.adminWhoAmIPacks.length +
                          adminData.adminPsychiatristRules.length,
                      },
                    ].map((cTab) => {
                      const active = catalogTab === cTab.id;
                      return (
                        <button
                          key={cTab.id}
                          type="button"
                          onClick={() => setCatalogTab(cTab.id as CatalogKindTab)}
                          className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                            active
                              ? 'border-text text-text'
                              : 'border-transparent text-text-tertiary hover:text-text-secondary'
                          }`}
                        >
                          <span>{cTab.label}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-extrabold ${
                              active ? 'bg-text text-bg' : 'bg-surface-2 text-text-secondary'
                            }`}
                          >
                            {cTab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Catalog Table Container */}
                  <div className="bg-surface border border-border rounded-card overflow-hidden">
                    <div className="p-3 sm:px-4 sm:py-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                          placeholder={L('Im Katalog suchen...', 'Search catalog...')}
                          className="w-full pl-9 pr-3 py-1.5 rounded-control bg-bg border border-border text-xs text-text focus:outline-hidden focus:border-accent min-h-[34px]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {catalogTab === 'minigames' && (
                          <div className="inline-flex rounded-control border border-border bg-bg p-0.5">
                            {(
                              [
                                { id: 'empire', label: 'Empire' },
                                { id: 'spy', label: L('Spion', 'Spy') },
                                { id: 'whoami', label: L('Wer bin ich', 'Who Am I') },
                                { id: 'psych', label: L('Psychiater', 'Psychiatrist') },
                              ] as const
                            ).map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => setMinigameSubTab(sub.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  minigameSubTab === sub.id
                                    ? 'bg-surface-2 text-text font-bold'
                                    : 'text-text-tertiary hover:text-text'
                                }`}
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {catalogTab === 'games' && (
                          <select
                            value={catalogGameCatFilter}
                            onChange={(e) => setCatalogGameCatFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-control bg-bg border border-border text-xs font-semibold text-text-secondary min-h-[34px]"
                          >
                            <option value="all">{L('Alle Kategorien', 'All categories')}</option>
                            <option value="cooperative">{L('Kooperativ', 'Cooperative')}</option>
                            <option value="energizer">{L('Energizer', 'Energizer')}</option>
                            <option value="social_deduction">{L('Deduktion', 'Social Deduction')}</option>
                            <option value="competitive">{L('Wettkampf', 'Competitive')}</option>
                          </select>
                        )}

                        {/* Online vs Draft Filter */}
                        <div className="inline-flex rounded-control border border-border bg-bg p-0.5">
                          {(
                            [
                              { id: 'all', label: L('Alle', 'All') },
                              { id: 'online', label: L('Online', 'Live') },
                              { id: 'draft', label: L('Entwürfe', 'Drafts') },
                            ] as const
                          ).map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setCatalogStatusFilter(st.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                catalogStatusFilter === st.id
                                  ? 'bg-surface-2 text-text font-bold'
                                  : 'text-text-tertiary hover:text-text'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Catalog Rows */}
                    <div className="divide-y divide-border">
                      {catalogTab === 'games' &&
                        filteredCatalogGames.map((g) => {
                          const isDraft = adminData.backendDraftIds.has(g.id);
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => openCatalogItemInEditor('spiel', g.id)}
                              className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                                    {g.title[language] || g.title.de}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold border border-border text-text-secondary">
                                    {g.category}
                                  </span>
                                  {isDraft ? (
                                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-warning/15 text-warning">
                                      {L('Entwurf · Nur Backend', 'Draft · Backend only')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
                                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                      Online
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-text-tertiary truncate">
                                  {g.durationMinutes} · {g.groupSize.min}–{g.groupSize.max} TN ·{' '}
                                  {g.summary[language] || g.summary.de}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-xs text-text-tertiary">
                                <span className="hidden sm:inline font-mono text-2xs">{g.id}</span>
                                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </button>
                          );
                        })}

                      {catalogTab === 'service' &&
                        filteredCatalogService.map((s) => {
                          const isDraft = adminData.backendDraftIds.has(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => openCatalogItemInEditor('dienst', s.id)}
                              className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                                    {s.title[language] || s.title.de}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold border border-border text-text-secondary">
                                    {s.category}
                                  </span>
                                  {isDraft ? (
                                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-warning/15 text-warning">
                                      {L('Entwurf · Nur Backend', 'Draft · Backend only')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
                                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                      Online
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-text-tertiary truncate">
                                  {s.duration[language] || s.duration.de} · {s.objective[language] || s.objective.de}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-xs text-text-tertiary">
                                <span className="hidden sm:inline font-mono text-2xs">{s.id}</span>
                                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </button>
                          );
                        })}

                      {catalogTab === 'arts' &&
                        filteredCatalogArts.map((a) => {
                          const isDraft = adminData.backendDraftIds.has(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => openCatalogItemInEditor('kunst', a.id)}
                              className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                                    {a.title[language] || a.title.de}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-2xs font-semibold border border-border text-text-secondary">
                                    {a.artForm}
                                  </span>
                                  {isDraft ? (
                                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-warning/15 text-warning">
                                      {L('Entwurf · Nur Backend', 'Draft · Backend only')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
                                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                      Online
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-text-tertiary truncate">
                                  {a.book[language] || a.book.de} · {a.description[language] || a.description.de}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-xs text-text-tertiary">
                                <span className="hidden sm:inline font-mono text-2xs">{a.id}</span>
                                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </button>
                          );
                        })}

                      {catalogTab === 'minigames' && minigameSubTab === 'empire' &&
                        filteredCatalogEmpire.map((c) => {
                          const isDraft = adminData.backendDraftIds.has(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => openCatalogItemInEditor('kategorie', c.id)}
                              className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-surface-2/60 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                                    {c.prompt[language] || c.prompt.de}
                                  </span>
                                  {isDraft ? (
                                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-warning/15 text-warning">
                                      {L('Entwurf · Nur Backend', 'Draft · Backend only')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
                                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                                      Online
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-text-tertiary truncate">
                                  {c.hint[language] || c.hint.de} · {c.examples.de.slice(0, 4).join(', ')}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-text-tertiary opacity-50 group-hover:opacity-100" />
                            </button>
                          );
                        })}

                      {catalogTab === 'minigames' && minigameSubTab === 'spy' &&
                        adminData.adminSpyLocations.map((loc) => (
                          <div
                            key={loc.id}
                            className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-surface-2/40"
                          >
                            <div>
                              <div className="font-bold text-sm text-text">{loc.name[language] || loc.name.de}</div>
                              <div className="text-xs text-text-tertiary">
                                {loc.roles.map((r) => r[language] || r.de).join(', ')}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingSpyLoc(loc)}
                              className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-border text-xs font-semibold text-text cursor-pointer"
                            >
                              {L('Bearbeiten', 'Edit')}
                            </button>
                          </div>
                        ))}

                      {catalogTab === 'minigames' && minigameSubTab === 'whoami' &&
                        adminData.adminWhoAmIPacks.map((pack) => (
                          <div
                            key={pack.id}
                            className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-surface-2/40"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-text">{pack.name[language] || pack.name.de}</div>
                              <div className="text-xs text-text-tertiary truncate">
                                {pack.entries.map((c) => c[language] || c.de).join(', ')}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingWhoPack(pack)}
                              className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-border text-xs font-semibold text-text cursor-pointer shrink-0"
                            >
                              {L('Bearbeiten', 'Edit')}
                            </button>
                          </div>
                        ))}

                      {catalogTab === 'minigames' && minigameSubTab === 'psych' &&
                        adminData.adminPsychiatristRules.map((rule) => (
                          <div
                            key={rule.id}
                            className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-surface-2/40"
                          >
                            <div>
                              <div className="font-bold text-sm text-text">{rule.text[language] || rule.text.de}</div>
                              <div className="text-xs text-text-tertiary">{rule.difficulty}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingPsychRule(rule)}
                              className="px-3 py-1.5 rounded-control bg-surface-2 hover:bg-border text-xs font-semibold text-text cursor-pointer shrink-0"
                            >
                              {L('Bearbeiten', 'Edit')}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SACRED QUOTES SECTION (Read-only per Rule 1) */}
              {activeSection === 'quotes' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                        {L('Heilige Worte', 'Sacred Quotes')}
                      </h1>
                      <p className="text-xs text-text-secondary mt-1">
                        {L(
                          'Schreibgeschützter Referenzkatalog (85 verifizierte Zitate). Heilige Texte sind vor Veränderungen geschützt.',
                          'Read-only reference catalog (85 verified quotes). Sacred texts are protected against modification.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface border border-border rounded-card overflow-hidden">
                    <div className="p-3 sm:px-4 sm:py-3 border-b border-border flex items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={quotesSearch}
                          onChange={(e) => setQuotesSearch(e.target.value)}
                          placeholder={L('Zitate durchsuchen...', 'Search quotes...')}
                          className="w-full pl-9 pr-3 py-1.5 rounded-control bg-bg border border-border text-xs text-text focus:outline-hidden focus:border-accent min-h-[34px]"
                        />
                      </div>
                      <span className="text-xs font-semibold text-text-tertiary">
                        {filteredQuotes.length} {L('Zitate', 'Quotes')}
                      </span>
                    </div>

                    <div className="divide-y divide-border">
                      {filteredQuotes.map((q) => (
                        <div key={q.id} className="p-5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border">
                              {q.book[language] || q.book.de}
                            </span>
                            <span className="text-2xs font-mono text-text-tertiary">{q.id}</span>
                          </div>
                          <p className="font-serif text-base text-text leading-relaxed">
                            „{language === 'de' ? q.textDe : q.textEn}“
                          </p>
                          <p className="text-xs text-text-tertiary">{q.source[language] || q.source.de}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. OPERATIONS, SYNC & REVISION LOG SECTION */}
              {activeSection === 'operations' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                      {L('Betrieb & Synchronisation', 'Operations & Sync')}
                    </h1>
                    <p className="text-xs text-text-secondary mt-1">
                      {L(
                        'GitHub-Verbindung, Team-Accounts, Änderungsprotokoll (Rollback) und Datensicherung.',
                        'GitHub connection, team accounts, full revision history (rollback), and backup.'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface border border-border rounded-card p-5 space-y-3">
                      <h3 className="text-sm font-extrabold text-text">GitHub Issues Sync</h3>
                      <p className="text-xs text-text-secondary">
                        Repository: <span className="font-mono text-text">{getGitHubRepo()}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsGitHubModalOpen(true)}
                        className="w-full py-2 rounded-control bg-surface-2 hover:bg-border text-xs font-bold text-text transition-colors cursor-pointer min-h-[38px]"
                      >
                        {L('Verbindung & Token verwalten', 'Manage Connection & Token')}
                      </button>
                    </div>

                    <div className="bg-surface border border-border rounded-card p-5 space-y-3">
                      <h3 className="text-sm font-extrabold text-text">{L('Datensicherung', 'Backup & Restore')}</h3>
                      <p className="text-xs text-text-secondary">
                        {L('Alle lokalen Daten und Revisionen als JSON sichern.', 'Export or import all local data.')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const json = exportLocalData();
                            downloadText(`jy-hub-backup-${new Date().toISOString().slice(0, 10)}.json`, json);
                            showToast(L('Backup heruntergeladen', 'Backup downloaded'));
                          }}
                          className="flex-1 py-2 rounded-control bg-surface-2 hover:bg-border text-xs font-bold text-text transition-colors cursor-pointer min-h-[38px] inline-flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>
                        <label className="flex-1 py-2 rounded-control bg-surface-2 hover:bg-border text-xs font-bold text-text transition-colors cursor-pointer min-h-[38px] inline-flex items-center justify-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import</span>
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const text = await file.text();
                                importLocalData(text);
                                adminData.refresh();
                                showToast(L('Backup erfolgreich importiert', 'Backup imported'));
                              } catch {
                                showToast(L('Ungültige Backup-Datei', 'Invalid backup file'));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="bg-surface border border-border rounded-card p-5 space-y-3">
                      <h3 className="text-sm font-extrabold text-text">
                        {L('Eigenes Passwort ändern', 'Change Your Password')}
                      </h3>
                      <form onSubmit={handleChangeOwnPassword} className="space-y-2">
                        <input
                          type="password"
                          value={currentPwdInput}
                          onChange={(e) => setCurrentPwdInput(e.target.value)}
                          placeholder={L('Aktuelles Passwort...', 'Current password...')}
                          className="w-full px-3 py-1.5 rounded-control bg-bg border border-border text-xs text-text"
                          required
                        />
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={newPwdInput}
                            onChange={(e) => setNewPwdInput(e.target.value)}
                            placeholder={L('Neues Passwort (mind. 8 Z.)...', 'New password (min. 8 ch.)...')}
                            className="flex-1 px-3 py-1.5 rounded-control bg-bg border border-border text-xs text-text"
                            required
                            minLength={8}
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-control bg-accent text-accent-contrast text-xs font-bold cursor-pointer"
                          >
                            {L('Ändern', 'Update')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Team & Accounts Management Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Create New Account Form */}
                    <form
                      onSubmit={handleCreateTeamAccount}
                      className="lg:col-span-2 bg-surface border border-border rounded-card p-5 space-y-3.5 self-start"
                    >
                      <div>
                        <h3 className="text-sm font-extrabold text-text">
                          {L('Neuen Account anlegen', 'Create New Account')}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {L(
                            'Erstelle für jedes Team-Mitglied einen eigenen Zugang mit eigenem Passwort.',
                            'Create a dedicated account with its own password for each team member.'
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Vollständiger Name', 'Full Name')}
                        </label>
                        <input
                          type="text"
                          value={newAccDisplayName}
                          onChange={(e) => setNewAccDisplayName(e.target.value)}
                          placeholder="z. B. Victor Bertis"
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-xs text-text"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          {L('Benutzername oder E-Mail', 'Username or Email')}
                        </label>
                        <input
                          type="text"
                          value={newAccUsername}
                          onChange={(e) => setNewAccUsername(e.target.value)}
                          placeholder="z. B. victor@example.org"
                          className="w-full px-3 py-2 rounded-control bg-bg border border-border text-xs text-text"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">
                            {L('Rolle', 'Role')}
                          </label>
                          <select
                            value={newAccRole}
                            onChange={(e) => setNewAccRole(e.target.value as 'owner' | 'editor')}
                            className="w-full px-2.5 py-2 rounded-control bg-bg border border-border text-xs text-text"
                          >
                            <option value="editor">{L('Redaktion', 'Editor')}</option>
                            <option value="owner">{L('Administrator', 'Administrator')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary mb-1">
                            {L('Passwort (mind. 8 Z.)', 'Password (min. 8 ch.)')}
                          </label>
                          <input
                            type="password"
                            value={newAccPassword}
                            onChange={(e) => setNewAccPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-control bg-bg border border-border text-xs text-text"
                            required
                            minLength={8}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-control bg-accent hover:bg-accent-hover text-accent-contrast text-xs font-extrabold transition-colors cursor-pointer min-h-[38px]"
                      >
                        + {L('Account anlegen', 'Create Account')}
                      </button>
                    </form>

                    {/* Active Accounts List */}
                    <div className="lg:col-span-3 bg-surface border border-border rounded-card overflow-hidden self-start">
                      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-text">
                          {L('Registrierte Accounts', 'Registered Accounts')} ({accounts.length})
                        </h3>
                        <span className="text-2xs text-text-tertiary">SHA-256 + Salt</span>
                      </div>
                      <div className="divide-y divide-border">
                        {accounts.map((acc) => {
                          const isSelf = acc.id === currentAccount?.id;
                          return (
                            <div
                              key={acc.id}
                              className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center font-extrabold text-text shrink-0">
                                  {acc.displayName
                                    .split(' ')
                                    .map((p) => p[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-text truncate">{acc.displayName}</span>
                                    <span className="px-2 py-0.5 rounded-full text-2xs font-semibold border border-border text-text-secondary">
                                      {acc.role === 'owner'
                                        ? L('Administrator', 'Admin')
                                        : L('Redaktion', 'Editor')}
                                    </span>
                                    {isSelf && (
                                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-accent-subtle text-accent-text">
                                        {L('Du', 'You')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-text-tertiary truncate">
                                    {acc.username} · {L('Angelegt:', 'Created:')} {formatShortDate(acc.createdAt)}
                                  </div>
                                </div>
                              </div>

                              {!isSelf && accounts.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAccount(acc.id)}
                                  className="px-2.5 py-1.5 rounded-control bg-danger/10 hover:bg-danger text-danger hover:text-white font-semibold transition-colors cursor-pointer shrink-0"
                                >
                                  {L('Entfernen', 'Remove')}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Full Revision Log */}
                  <div className="bg-surface border border-border rounded-card overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-text">
                        {L('Revisions-Verlauf', 'Revision History')} ({adminData.revisions.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {adminData.revisions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-text-tertiary">
                          {L('Noch keine Änderungen protokolliert.', 'No revisions logged yet.')}
                        </div>
                      ) : (
                        adminData.revisions.map((rev) => (
                          <div
                            key={rev.revisionId}
                            className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-text truncate">{rev.summary}</div>
                              <div className="text-text-tertiary">
                                {rev.author} · {rev.collection} · {rev.entityId} ·{' '}
                                {new Date(rev.timestamp).toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                adminData.rollback(rev.revisionId, adminAuthor);
                                showToast(L('Änderung zurückgesetzt', 'Revision rolled back'));
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-surface-2 hover:bg-border text-text font-semibold shrink-0 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{L('Zurücksetzen', 'Rollback')}</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick Edit Modal for Spy Location */}
      {editingSpyLoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-extrabold text-text">{L('Spion-Ort bearbeiten', 'Edit Spy Location')}</h3>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Name (DE)</label>
              <input
                type="text"
                value={editingSpyLoc.name.de}
                onChange={(e) =>
                  setEditingSpyLoc({ ...editingSpyLoc, name: { ...editingSpyLoc.name, de: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {L('Rollen (kommagetrennt)', 'Roles (comma-separated)')}
              </label>
              <input
                type="text"
                value={editingSpyLoc.roles.map((r) => r.de).join(', ')}
                onChange={(e) => {
                  const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setEditingSpyLoc({
                    ...editingSpyLoc,
                    roles: parts.map((p) => ({ de: p, en: p })),
                  });
                }}
                className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSpyLoc(null)}
                className="px-4 py-2 rounded-control bg-surface-2 text-xs font-bold text-text cursor-pointer"
              >
                {L('Abbrechen', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  adminData.saveSpyLocation(editingSpyLoc, adminAuthor, `Spion-Ort "${editingSpyLoc.name.de}" aktualisiert`);
                  setEditingSpyLoc(null);
                  showToast(L('Live gespeichert', 'Saved live'));
                }}
                className="px-4 py-2 rounded-control bg-accent text-accent-contrast text-xs font-bold cursor-pointer"
              >
                {L('Live speichern', 'Save live')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal for WhoAmI Pack */}
      {editingWhoPack && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-extrabold text-text">{L('Wer-bin-ich Paket bearbeiten', 'Edit Who Am I Pack')}</h3>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Name (DE)</label>
              <input
                type="text"
                value={editingWhoPack.name.de}
                onChange={(e) =>
                  setEditingWhoPack({ ...editingWhoPack, name: { ...editingWhoPack.name, de: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {L('Begriffe (kommagetrennt)', 'Characters (comma-separated)')}
              </label>
              <textarea
                rows={4}
                value={editingWhoPack.entries.map((c) => c.de).join(', ')}
                onChange={(e) => {
                  const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setEditingWhoPack({
                    ...editingWhoPack,
                    entries: parts.map((p) => ({ de: p, en: p })),
                  });
                }}
                className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingWhoPack(null)}
                className="px-4 py-2 rounded-control bg-surface-2 text-xs font-bold text-text cursor-pointer"
              >
                {L('Abbrechen', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  adminData.saveWhoAmIPack(editingWhoPack, adminAuthor, `Wer-bin-ich "${editingWhoPack.name.de}" aktualisiert`);
                  setEditingWhoPack(null);
                  showToast(L('Live gespeichert', 'Saved live'));
                }}
                className="px-4 py-2 rounded-control bg-accent text-accent-contrast text-xs font-bold cursor-pointer"
              >
                {L('Live speichern', 'Save live')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal for Psychiatrist Rule */}
      {editingPsychRule && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-extrabold text-text">{L('Psychiater-Tick bearbeiten', 'Edit Psychiatrist Rule')}</h3>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Regel (DE)</label>
              <textarea
                rows={3}
                value={editingPsychRule.text.de}
                onChange={(e) =>
                  setEditingPsychRule({ ...editingPsychRule, text: { ...editingPsychRule.text, de: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-control bg-bg border border-border text-sm text-text"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPsychRule(null)}
                className="px-4 py-2 rounded-control bg-surface-2 text-xs font-bold text-text cursor-pointer"
              >
                {L('Abbrechen', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  adminData.savePsychiatristRule(editingPsychRule, adminAuthor, `Psychiater-Regel aktualisiert`);
                  setEditingPsychRule(null);
                  showToast(L('Live gespeichert', 'Saved live'));
                }}
                className="px-4 py-2 rounded-control bg-accent text-accent-contrast text-xs font-bold cursor-pointer"
              >
                {L('Live speichern', 'Save live')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Settings Modal */}
      {isGitHubModalOpen && (
        <GitHubSettingsModal
          onClose={() => setIsGitHubModalOpen(false)}
          onSaved={() => syncWithGitHub(false)}
          language={language}
        />
      )}
    </div>
  );
};
export default AdminView;
