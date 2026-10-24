import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Game,
  ServiceProject,
  ArtsPrompt,
  ServiceProjectCategory,
  ServiceProjectScope,
  ArtForm,
  ActivitySetting,
  ActivityOccasion,
} from '../types';
import { GAMES_DATA } from '../data/games';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';
import {
  SPY_PACKS,
  WHO_AM_I_PACKS,
  SpyLocation,
  WhoAmIPack,
} from '../data/roleContent';
import {
  EMPIRE_CATEGORIES_V2,
  PSYCHIATRIST_RULES,
  EmpireCategoryV2,
  RuleIdea,
} from '../data/empireContent';
import {
  DataRevision,
  ProposalItem,
  getRevisions,
  appendRevision,
  rollbackRevision,
  rollbackAllRevisionsByAuthor,
  getProposals,
  updateProposalStatus,
  softDeleteEntity,
} from '../utils/adminRevisions';
import {
  fetchApprovedGitHubContent,
  getCachedApprovedContent,
  updateGitHubIssueStatus,
  syncAdminStateWithCloud,
  STORAGE_SYNCED_DELETED_KEY,
  SyncedApprovedContent,
} from '../utils/githubIssues';
import { hasAnyAdminAccount } from '../utils/adminAuth';

export type AdminSpyLocation = SpyLocation & { status?: 'draft' };
export type EmpireCategory = EmpireCategoryV2;

export interface AdminDataContextType {
  revisions: DataRevision[];
  backendDraftIds: Set<string>;
  games: Game[];
  serviceProjects: ServiceProject[];
  artsPrompts: ArtsPrompt[];
  spyLocations: AdminSpyLocation[];
  whoAmIPacks: WhoAmIPack[];
  empireCategories: EmpireCategory[];
  psychiatristRules: RuleIdea[];
  adminGames: Game[];
  adminServiceProjects: ServiceProject[];
  adminArtsPrompts: ArtsPrompt[];
  adminSpyLocations: AdminSpyLocation[];
  adminWhoAmIPacks: WhoAmIPack[];
  adminEmpireCategories: EmpireCategory[];
  adminPsychiatristRules: RuleIdea[];
  proposals: ProposalItem[];
  saveGame: (game: Game, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deleteGame: (gameId: string, author: string, summary?: string) => DataRevision | null;
  saveServiceProject: (project: ServiceProject, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deleteServiceProject: (id: string, author: string, summary?: string) => DataRevision | null;
  saveArtsPrompt: (prompt: ArtsPrompt, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deleteArtsPrompt: (id: string, author: string, summary?: string) => DataRevision | null;
  saveSpyLocation: (location: AdminSpyLocation, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deleteSpyLocation: (id: string, author: string) => DataRevision | null;
  saveWhoAmIPack: (pack: WhoAmIPack, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deleteWhoAmIPack: (id: string, author: string) => DataRevision | null;
  saveEmpireCategory: (category: EmpireCategory, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deleteEmpireCategory: (id: string, author: string) => DataRevision | null;
  savePsychiatristRule: (rule: RuleIdea, author: string, summary: string, asDraft?: boolean) => DataRevision;
  deletePsychiatristRule: (id: string, author: string) => DataRevision | null;
  acceptProposal: (proposalId: string, author: string) => void;
  rejectProposal: (proposalId: string, reason: string, author: string) => void;
  rollback: (revisionId: string, author: string) => DataRevision | null;
  rollbackByAuthor: (
    targetAccount: { id?: string; username?: string; displayName: string },
    author: string
  ) => number;
  syncCloudState: () => Promise<boolean>;
  refresh: () => void;
}

const BASE_SPY_LOCATIONS: AdminSpyLocation[] = SPY_PACKS.flatMap((p) => p.locations);

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [revisions, setRevisions] = useState<DataRevision[]>(() => getRevisions());
  const [proposals, setProposals] = useState<ProposalItem[]>(() => getProposals());
  const [syncedData, setSyncedData] = useState<SyncedApprovedContent>(() => getCachedApprovedContent());

  const refresh = useCallback(() => {
    setRevisions(getRevisions());
    setProposals(getProposals());
    setSyncedData(getCachedApprovedContent());
  }, []);

  const syncCloudState = useCallback(async () => {
    const res = await syncAdminStateWithCloud();
    if (res.ok) {
      refresh();
    }
    return res.ok;
  }, [refresh]);

  // Fetch live approved content from GitHub on mount, and sync admin accounts/revisions if present
  useEffect(() => {
    let active = true;
    fetchApprovedGitHubContent().then((data) => {
      if (active) {
        setSyncedData(data);
      }
    }).catch(() => {});

    if (
      hasAnyAdminAccount() ||
      getRevisions().length > 0 ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'))
    ) {
      syncAdminStateWithCloud()
        .then((res) => {
          if (active && res.ok) {
            refresh();
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [refresh]);

  // Listen to live update events from window and storage
  useEffect(() => {
    const handleUpdate = (e?: Event) => {
      refresh();
      const detail = (e as CustomEvent | undefined)?.detail;
      if (detail && detail.revisionId) {
        syncAdminStateWithCloud().catch(() => {});
      }
    };
    window.addEventListener('jy_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('jy_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  // Track which entity IDs are currently saved as backend-only drafts (offline from public website)
  const backendDraftIds = useMemo(() => {
    const draftSet = new Set<string>();
    const chronological = [...revisions].reverse();
    for (const rev of chronological) {
      const cleanId = rev.entityId.replace(/^(spy_|whoami_|empire_|psych_)/, '');
      if (rev.action === 'soft_delete') {
        draftSet.delete(rev.entityId);
        draftSet.delete(cleanId);
      } else if (rev.newSnapshot && typeof rev.newSnapshot === 'object') {
        const snap = rev.newSnapshot as { isBackendDraft?: boolean };
        if (snap.isBackendDraft === true) {
          draftSet.add(rev.entityId);
          draftSet.add(cleanId);
        } else {
          draftSet.delete(rev.entityId);
          draftSet.delete(cleanId);
        }
      }
    }
    return draftSet;
  }, [revisions]);

  // Compute Active Overrides from Append-only Log + Synced Content
  const adminGames = useMemo(() => {
    const gameRevisions = revisions.filter((r) => r.collection === 'games');
    const entityMap = new Map<string, { deleted: boolean; data?: Game }>();

    // Process from oldest to newest to compute net active state
    const chronological = [...gameRevisions].reverse();
    for (const rev of chronological) {
      if (rev.action === 'soft_delete') {
        entityMap.set(rev.entityId, { deleted: true });
      } else if (rev.action === 'create' || rev.action === 'update' || rev.action === 'restore') {
        if (rev.newSnapshot) {
          entityMap.set(rev.entityId, { deleted: false, data: rev.newSnapshot as Game });
        }
      }
    }

    const deletedIdsSet = new Set(syncedData.deletedEntityIds);

    // Merge static baseline + synced approved games (synced overrides static if same ID)
    const baseAndSynced: Game[] = [...GAMES_DATA];
    for (const sg of syncedData.approvedGames) {
      const idx = baseAndSynced.findIndex((b) => b.id === sg.id);
      if (idx >= 0) {
        baseAndSynced[idx] = sg;
      } else {
        baseAndSynced.push(sg);
      }
    }

    const result: Game[] = [];
    const processedIds = new Set<string>();

    for (const baseGame of baseAndSynced) {
      const override = entityMap.get(baseGame.id);
      if (override) {
        if (!override.deleted && override.data) {
          result.push(override.data);
        }
      } else if (!deletedIdsSet.has(baseGame.id)) {
        result.push(baseGame);
      }
      processedIds.add(baseGame.id);
    }

    // Add newly created games that were not in base or synced data
    for (const [id, override] of entityMap.entries()) {
      if (!processedIds.has(id) && !override.deleted && override.data) {
        result.push(override.data);
      }
    }

    return result;
  }, [revisions, syncedData]);

  const games = useMemo(
    () => adminGames.filter((g) => !backendDraftIds.has(g.id)),
    [adminGames, backendDraftIds]
  );

  const adminServiceProjects = useMemo(() => {
    const serviceRevisions = revisions.filter((r) => r.collection === 'service');
    const entityMap = new Map<string, { deleted: boolean; data?: ServiceProject }>();

    const chronological = [...serviceRevisions].reverse();
    for (const rev of chronological) {
      if (rev.action === 'soft_delete') {
        entityMap.set(rev.entityId, { deleted: true });
      } else if (rev.action === 'create' || rev.action === 'update' || rev.action === 'restore') {
        if (rev.newSnapshot) {
          entityMap.set(rev.entityId, { deleted: false, data: rev.newSnapshot as ServiceProject });
        }
      }
    }

    const deletedIdsSet = new Set(syncedData.deletedEntityIds);
    const baseAndSynced: ServiceProject[] = [...SERVICE_PROJECTS_DATA];
    for (const sp of syncedData.approvedServiceProjects || []) {
      const idx = baseAndSynced.findIndex((b) => b.id === sp.id);
      if (idx >= 0) {
        baseAndSynced[idx] = sp;
      } else {
        baseAndSynced.push(sp);
      }
    }

    const result: ServiceProject[] = [];
    const processedIds = new Set<string>();

    for (const baseSp of baseAndSynced) {
      const override = entityMap.get(baseSp.id);
      if (override) {
        if (!override.deleted && override.data) result.push(override.data);
      } else if (!deletedIdsSet.has(baseSp.id)) {
        result.push(baseSp);
      }
      processedIds.add(baseSp.id);
    }

    for (const [id, override] of entityMap.entries()) {
      if (!processedIds.has(id) && !override.deleted && override.data) {
        result.push(override.data);
      }
    }

    return result;
  }, [revisions, syncedData]);

  const serviceProjects = useMemo(
    () => adminServiceProjects.filter((p) => !backendDraftIds.has(p.id)),
    [adminServiceProjects, backendDraftIds]
  );

  const adminArtsPrompts = useMemo(() => {
    const artsRevisions = revisions.filter((r) => r.collection === 'arts');
    const entityMap = new Map<string, { deleted: boolean; data?: ArtsPrompt }>();

    const chronological = [...artsRevisions].reverse();
    for (const rev of chronological) {
      if (rev.action === 'soft_delete') {
        entityMap.set(rev.entityId, { deleted: true });
      } else if (rev.action === 'create' || rev.action === 'update' || rev.action === 'restore') {
        if (rev.newSnapshot) {
          entityMap.set(rev.entityId, { deleted: false, data: rev.newSnapshot as ArtsPrompt });
        }
      }
    }

    const deletedIdsSet = new Set(syncedData.deletedEntityIds);
    const baseAndSynced: ArtsPrompt[] = [...ARTS_PROMPTS_DATA];
    for (const ap of syncedData.approvedArtsPrompts || []) {
      const idx = baseAndSynced.findIndex((b) => b.id === ap.id);
      if (idx >= 0) {
        baseAndSynced[idx] = ap;
      } else {
        baseAndSynced.push(ap);
      }
    }

    const result: ArtsPrompt[] = [];
    const processedIds = new Set<string>();

    for (const baseAp of baseAndSynced) {
      const override = entityMap.get(baseAp.id);
      if (override) {
        if (!override.deleted && override.data) result.push(override.data);
      } else if (!deletedIdsSet.has(baseAp.id)) {
        result.push(baseAp);
      }
      processedIds.add(baseAp.id);
    }

    for (const [id, override] of entityMap.entries()) {
      if (!processedIds.has(id) && !override.deleted && override.data) {
        result.push(override.data);
      }
    }

    return result;
  }, [revisions, syncedData]);

  const artsPrompts = useMemo(
    () => adminArtsPrompts.filter((a) => !backendDraftIds.has(a.id)),
    [adminArtsPrompts, backendDraftIds]
  );

  const adminSpyLocations = useMemo(() => {
    const catRevisions = revisions.filter((r) => r.collection === 'categories' && r.entityId.startsWith('spy_'));
    const map = new Map<string, { deleted: boolean; data?: AdminSpyLocation }>();
    const chronological = [...catRevisions].reverse();

    for (const rev of chronological) {
      const actualId = rev.entityId.replace(/^spy_/, '');
      if (rev.action === 'soft_delete') {
        map.set(actualId, { deleted: true });
      } else if (rev.newSnapshot) {
        map.set(actualId, { deleted: false, data: rev.newSnapshot as AdminSpyLocation });
      }
    }

    const res: AdminSpyLocation[] = [];
    const seen = new Set<string>();

    for (const loc of BASE_SPY_LOCATIONS) {
      const ov = map.get(loc.id);
      if (ov) {
        if (!ov.deleted && ov.data) res.push(ov.data);
      } else {
        res.push(loc);
      }
      seen.add(loc.id);
    }

    for (const [id, ov] of map.entries()) {
      if (!seen.has(id) && !ov.deleted && ov.data) {
        res.push(ov.data);
      }
    }
    return res;
  }, [revisions]);

  const spyLocations = useMemo(
    () => adminSpyLocations.filter((l) => !backendDraftIds.has(l.id)),
    [adminSpyLocations, backendDraftIds]
  );

  const adminWhoAmIPacks = useMemo(() => {
    const catRevisions = revisions.filter((r) => r.collection === 'categories' && r.entityId.startsWith('whoami_'));
    const map = new Map<string, { deleted: boolean; data?: WhoAmIPack }>();
    const chronological = [...catRevisions].reverse();

    for (const rev of chronological) {
      const actualId = rev.entityId.replace(/^whoami_/, '');
      if (rev.action === 'soft_delete') {
        map.set(actualId, { deleted: true });
      } else if (rev.newSnapshot) {
        map.set(actualId, { deleted: false, data: rev.newSnapshot as WhoAmIPack });
      }
    }

    const res: WhoAmIPack[] = [];
    const seen = new Set<string>();

    for (const pack of WHO_AM_I_PACKS) {
      const ov = map.get(pack.id);
      if (ov) {
        if (!ov.deleted && ov.data) res.push(ov.data);
      } else {
        res.push(pack);
      }
      seen.add(pack.id);
    }

    for (const [id, ov] of map.entries()) {
      if (!seen.has(id) && !ov.deleted && ov.data) {
        res.push(ov.data);
      }
    }
    return res;
  }, [revisions]);

  const whoAmIPacks = useMemo(
    () => adminWhoAmIPacks.filter((p) => !backendDraftIds.has(p.id)),
    [adminWhoAmIPacks, backendDraftIds]
  );

  const adminEmpireCategories = useMemo(() => {
    const catRevisions = revisions.filter((r) => r.collection === 'categories' && r.entityId.startsWith('empire_'));
    const map = new Map<string, { deleted: boolean; data?: EmpireCategory }>();
    const chronological = [...catRevisions].reverse();

    for (const rev of chronological) {
      const actualId = rev.entityId.replace(/^empire_/, '');
      if (rev.action === 'soft_delete') {
        map.set(actualId, { deleted: true });
      } else if (rev.newSnapshot) {
        map.set(actualId, { deleted: false, data: rev.newSnapshot as EmpireCategory });
      }
    }

    const deletedIdsSet = new Set(syncedData.deletedEntityIds);
    const baseAndSynced: EmpireCategory[] = [...EMPIRE_CATEGORIES_V2];
    for (const sc of syncedData.approvedCategories) {
      const idx = baseAndSynced.findIndex((b) => b.id === sc.id);
      if (idx >= 0) {
        baseAndSynced[idx] = sc;
      } else {
        baseAndSynced.push(sc);
      }
    }

    const res: EmpireCategory[] = [];
    const seen = new Set<string>();

    for (const cat of baseAndSynced) {
      const ov = map.get(cat.id);
      if (ov) {
        if (!ov.deleted && ov.data) res.push(ov.data);
      } else if (!deletedIdsSet.has(cat.id)) {
        res.push(cat);
      }
      seen.add(cat.id);
    }

    for (const [id, ov] of map.entries()) {
      if (!seen.has(id) && !ov.deleted && ov.data) {
        res.push(ov.data);
      }
    }
    return res;
  }, [revisions, syncedData]);

  const empireCategories = useMemo(
    () => adminEmpireCategories.filter((c) => !backendDraftIds.has(c.id)),
    [adminEmpireCategories, backendDraftIds]
  );

  const adminPsychiatristRules = useMemo(() => {
    const catRevisions = revisions.filter((r) => r.collection === 'categories' && r.entityId.startsWith('psych_'));
    const map = new Map<string, { deleted: boolean; data?: RuleIdea }>();
    const chronological = [...catRevisions].reverse();

    for (const rev of chronological) {
      const actualId = rev.entityId.replace(/^psych_/, '');
      if (rev.action === 'soft_delete') {
        map.set(actualId, { deleted: true });
      } else if (rev.newSnapshot) {
        map.set(actualId, { deleted: false, data: rev.newSnapshot as RuleIdea });
      }
    }

    const res: RuleIdea[] = [];
    const seen = new Set<string>();

    for (const rule of PSYCHIATRIST_RULES) {
      const ov = map.get(rule.id);
      if (ov) {
        if (!ov.deleted && ov.data) res.push(ov.data);
      } else {
        res.push(rule);
      }
      seen.add(rule.id);
    }

    for (const [id, ov] of map.entries()) {
      if (!seen.has(id) && !ov.deleted && ov.data) {
        res.push(ov.data);
      }
    }
    return res;
  }, [revisions]);

  const psychiatristRules = useMemo(
    () => adminPsychiatristRules.filter((r) => !backendDraftIds.has(r.id)),
    [adminPsychiatristRules, backendDraftIds]
  );

  // Actions
  const saveGame = useCallback((game: Game, author: string, summary: string, asDraft = false) => {
    const existing = adminGames.find((g) => g.id === game.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'games',
      entityId: game.id,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...game, status: 'draft', isBackendDraft: asDraft } as Game,
    });

    if (!asDraft) {
      const ghMatch = game.id.match(/^gh_game_(\d+)$/) || game.id.match(/^proposal_gh_issue_(\d+)$/) || game.id.match(/^proposal_game_(\d+)$/);
      if (ghMatch && ghMatch[1]) {
        updateGitHubIssueStatus(Number(ghMatch[1]), 'accept', summary, game as unknown as Record<string, unknown>).catch(() => {});
      }
    }

    refresh();
    return rev;
  }, [adminGames, refresh]);

  const deleteGame = useCallback((gameId: string, author: string, summary = 'Spiel gelöscht (Soft-Delete)') => {
    const existing = adminGames.find((g) => g.id === gameId);
    if (!existing) return null;
    const rev = softDeleteEntity('games', gameId, existing, author, summary);

    // Persist to deleted entity IDs for live website filtering
    try {
      const raw = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(gameId)) {
        list.push(gameId);
        localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(list));
      }
    } catch {
      /* ignore */
    }

    // Check if game was imported from a GitHub issue
    const ghMatch = gameId.match(/^gh_game_(\d+)$/) || gameId.match(/^proposal_gh_issue_(\d+)$/) || gameId.match(/^proposal_game_(\d+)$/);
    if (ghMatch && ghMatch[1]) {
      updateGitHubIssueStatus(Number(ghMatch[1]), 'delete', summary).catch(() => {});
    }

    refresh();
    return rev;
  }, [adminGames, refresh]);

  const saveSpyLocation = useCallback((loc: AdminSpyLocation, author: string, summary: string, asDraft = false) => {
    const existing = adminSpyLocations.find((l) => l.id === loc.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `spy_${loc.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...loc, status: 'draft', isBackendDraft: asDraft } as AdminSpyLocation,
    });
    refresh();
    return rev;
  }, [adminSpyLocations, refresh]);

  const deleteSpyLocation = useCallback((id: string, author: string) => {
    const existing = adminSpyLocations.find((l) => l.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `spy_${id}`, existing, author, `Spion-Ort "${existing.name.de}" deaktiviert`);
    refresh();
    return rev;
  }, [adminSpyLocations, refresh]);

  const saveWhoAmIPack = useCallback((pack: WhoAmIPack, author: string, summary: string, asDraft = false) => {
    const existing = adminWhoAmIPacks.find((p) => p.id === pack.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `whoami_${pack.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...pack, status: 'draft', isBackendDraft: asDraft } as WhoAmIPack,
    });
    refresh();
    return rev;
  }, [adminWhoAmIPacks, refresh]);

  const deleteWhoAmIPack = useCallback((id: string, author: string) => {
    const existing = adminWhoAmIPacks.find((p) => p.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `whoami_${id}`, existing, author, `Wer-bin-ich-Paket "${existing.name.de}" deaktiviert`);
    refresh();
    return rev;
  }, [adminWhoAmIPacks, refresh]);

  const saveEmpireCategory = useCallback((cat: EmpireCategory, author: string, summary: string, asDraft = false) => {
    const existing = adminEmpireCategories.find((c) => c.id === cat.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `empire_${cat.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...cat, status: 'draft', isBackendDraft: asDraft } as EmpireCategory,
    });

    if (!asDraft) {
      const ghMatch = cat.id.match(/^gh_cat_(\d+)$/) || cat.id.match(/^proposal_(\d+)$/);
      if (ghMatch && ghMatch[1]) {
        updateGitHubIssueStatus(Number(ghMatch[1]), 'accept', summary, cat as unknown as Record<string, unknown>).catch(() => {});
      }
    }

    refresh();
    return rev;
  }, [adminEmpireCategories, refresh]);

  const deleteEmpireCategory = useCallback((id: string, author: string) => {
    const existing = adminEmpireCategories.find((c) => c.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `empire_${id}`, existing, author, `Empire-Kategorie "${existing.prompt.de}" gelöscht`);

    try {
      const raw = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(list));
      }
    } catch {
      /* ignore */
    }

    const ghMatch = id.match(/^gh_cat_(\d+)$/) || id.match(/^proposal_gh_issue_(\d+)$/);
    if (ghMatch && ghMatch[1]) {
      updateGitHubIssueStatus(Number(ghMatch[1]), 'delete', `Kategorie gelöscht`).catch(() => {});
    }

    refresh();
    return rev;
  }, [adminEmpireCategories, refresh]);

  const savePsychiatristRule = useCallback((rule: RuleIdea, author: string, summary: string, asDraft = false) => {
    const existing = adminPsychiatristRules.find((r) => r.id === rule.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `psych_${rule.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...rule, status: 'draft', isBackendDraft: asDraft } as RuleIdea,
    });
    refresh();
    return rev;
  }, [adminPsychiatristRules, refresh]);

  const deletePsychiatristRule = useCallback((id: string, author: string) => {
    const existing = adminPsychiatristRules.find((r) => r.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `psych_${id}`, existing, author, `Psychiater-Regel "${existing.text.de}" deaktiviert`);
    refresh();
    return rev;
  }, [adminPsychiatristRules, refresh]);

  const saveServiceProject = useCallback((project: ServiceProject, author: string, summary: string, asDraft = false) => {
    const existing = adminServiceProjects.find((p) => p.id === project.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'service',
      entityId: project.id,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...project, status: 'draft', isBackendDraft: asDraft } as ServiceProject,
    });

    if (!asDraft) {
      const ghMatch = project.id.match(/^gh_service_(\d+)$/) || project.id.match(/^proposal_gh_issue_(\d+)$/);
      if (ghMatch && ghMatch[1]) {
        updateGitHubIssueStatus(Number(ghMatch[1]), 'accept', summary, project as unknown as Record<string, unknown>).catch(() => {});
      }
    }

    refresh();
    return rev;
  }, [adminServiceProjects, refresh]);

  const deleteServiceProject = useCallback((id: string, author: string, summary = 'Dienstprojekt gelöscht (Soft-Delete)') => {
    const existing = adminServiceProjects.find((p) => p.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('service', id, existing, author, summary);

    try {
      const raw = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(list));
      }
    } catch {
      /* ignore */
    }

    const ghMatch = id.match(/^gh_service_(\d+)$/) || id.match(/^proposal_gh_issue_(\d+)$/);
    if (ghMatch && ghMatch[1]) {
      updateGitHubIssueStatus(Number(ghMatch[1]), 'delete', summary).catch(() => {});
    }

    refresh();
    return rev;
  }, [adminServiceProjects, refresh]);

  const saveArtsPrompt = useCallback((prompt: ArtsPrompt, author: string, summary: string, asDraft = false) => {
    const existing = adminArtsPrompts.find((a) => a.id === prompt.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'arts',
      entityId: prompt.id,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...prompt, status: 'draft', isBackendDraft: asDraft } as ArtsPrompt,
    });

    if (!asDraft) {
      const ghMatch = prompt.id.match(/^gh_art_(\d+)$/) || prompt.id.match(/^proposal_gh_issue_(\d+)$/);
      if (ghMatch && ghMatch[1]) {
        updateGitHubIssueStatus(Number(ghMatch[1]), 'accept', summary, prompt as unknown as Record<string, unknown>).catch(() => {});
      }
    }

    refresh();
    return rev;
  }, [adminArtsPrompts, refresh]);

  const deleteArtsPrompt = useCallback((id: string, author: string, summary = 'Kunst-Impuls gelöscht (Soft-Delete)') => {
    const existing = adminArtsPrompts.find((a) => a.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('arts', id, existing, author, summary);

    try {
      const raw = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(list));
      }
    } catch {
      /* ignore */
    }

    const ghMatch = id.match(/^gh_art_(\d+)$/) || id.match(/^proposal_gh_issue_(\d+)$/);
    if (ghMatch && ghMatch[1]) {
      updateGitHubIssueStatus(Number(ghMatch[1]), 'delete', summary).catch(() => {});
    }

    refresh();
    return rev;
  }, [adminArtsPrompts, refresh]);

  const acceptProposal = useCallback(async (proposalId: string, author: string) => {
    const prop = proposals.find((p) => p.id === proposalId) || getProposals().find((p) => p.id === proposalId);
    if (!prop) return;

    const ghIssueNum = prop.githubIssueNumber || (prop.payload?.githubIssueNumber as number | undefined);
    if (ghIssueNum) {
      updateGitHubIssueStatus(ghIssueNum, 'accept').catch(() => {});
    }

    const tips = typeof prop.payload?.animatorTips === 'string' && prop.payload.animatorTips.trim()
      ? [prop.payload.animatorTips.trim()]
      : [];

    const steps = Array.isArray(prop.payload?.steps) && prop.payload?.steps.length
      ? (prop.payload.steps as string[])
      : [prop.summary];

    const materials = Array.isArray(prop.payload?.materials)
      ? (prop.payload.materials as string[])
      : [];

    const reflectionQuestions = Array.isArray(prop.payload?.reflectionQuestions)
      ? (prop.payload.reflectionQuestions as string[])
      : [];

    const entityId = ghIssueNum
      ? `gh_game_${ghIssueNum}`
      : `proposal_${prop.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (prop.type === 'spiel') {
      const dMin = Number(prop.payload?.durationMin) || 10;
      const dMax = Number(prop.payload?.durationMax) || 20;
      const newGame: Game = {
        id: entityId,
        title: { de: prop.title, en: prop.title },
        subtitle: prop.subtitle ? { de: prop.subtitle, en: prop.subtitle } : undefined,
        category: 'cooperative',
        energyLevel: 'medium',
        purpose: 'zusammenarbeit',
        groupSize: {
          min: Number(prop.payload?.groupSizeMin) || 4,
          max: Number(prop.payload?.groupSizeMax) || 20,
        },
        prepLevel: materials.length > 0 ? 'low_prep' : 'instant',
        materials: { de: materials, en: materials },
        durationMinutes: `${dMin}–${dMax} Min`,
        durationMin: dMin,
        durationMax: dMax,
        space: { de: 'Drinnen oder draußen', en: 'Indoors or outdoors' },
        summary: { de: prop.summary, en: prop.summary },
        idea: { de: prop.summary, en: prop.summary },
        rules: { de: steps, en: steps },
        animatorTips: { de: tips, en: tips },
        status: 'draft',
        submittedBy: prop.authorName || 'Community',
      };
      saveGame(newGame, author, `Vorschlag "${prop.title}" als Spiel übernommen`);
    } else if (prop.type === 'dienst') {
      const serviceId = prop.githubIssueNumber
        ? `gh_service_${prop.githubIssueNumber}`
        : `proposal_service_${prop.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const dMin = Number(prop.payload?.durationMin) || 30;
      const dMax = Number(prop.payload?.durationMax) || 60;
      const newService: ServiceProject = {
        id: serviceId,
        kind: 'dienst',
        title: { de: prop.title, en: prop.title },
        category: (prop.payload?.category as ServiceProjectCategory) || 'neighborhood',
        scope: (prop.payload?.scope as ServiceProjectScope) || 'medium',
        objective: {
          de: (prop.payload?.objective as string) || prop.summary,
          en: (prop.payload?.objective as string) || prop.summary,
        },
        durationMin: dMin,
        durationMax: dMax,
        duration: { de: `${dMin}–${dMax} Min`, en: `${dMin}–${dMax} min` },
        groupSize: {
          min: Number(prop.payload?.groupSizeMin) || 4,
          max: Number(prop.payload?.groupSizeMax) || 15,
        },
        setting: (prop.payload?.setting as ActivitySetting) || 'beides',
        occasion: (prop.payload?.occasion as ActivityOccasion) || 'beides',
        materials: { de: materials, en: materials },
        steps: { de: steps, en: steps },
        reflectionQuestions: { de: reflectionQuestions, en: reflectionQuestions },
        animatorTips: { de: tips, en: tips },
        status: 'draft',
        submittedBy: prop.authorName || 'Community',
      };
      saveServiceProject(newService, author, `Vorschlag "${prop.title}" als Dienstprojekt übernommen`);
    } else if (prop.type === 'kunst') {
      const artId = prop.githubIssueNumber
        ? `gh_art_${prop.githubIssueNumber}`
        : `proposal_art_${prop.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const dMin = Number(prop.payload?.durationMin) || 30;
      const dMax = Number(prop.payload?.durationMax) || 60;
      const newArt: ArtsPrompt = {
        id: artId,
        kind: 'kunst',
        title: { de: prop.title, en: prop.title },
        book: {
          de: (prop.payload?.relatedBook as string) || 'Allgemein',
          en: (prop.payload?.relatedBook as string) || 'General',
        },
        artForm: (prop.payload?.artForm as ArtForm) || 'visual_arts',
        theme: { de: prop.title, en: prop.title },
        description: { de: prop.summary, en: prop.summary },
        durationMin: dMin,
        durationMax: dMax,
        duration: { de: `${dMin}–${dMax} Min`, en: `${dMin}–${dMax} min` },
        groupSize: {
          min: Number(prop.payload?.groupSizeMin) || 3,
          max: Number(prop.payload?.groupSizeMax) || 20,
        },
        setting: (prop.payload?.setting as ActivitySetting) || 'beides',
        occasion: (prop.payload?.occasion as ActivityOccasion) || 'beides',
        materials: { de: materials, en: materials },
        guidingSteps: { de: steps, en: steps },
        reflectionPrompts: { de: reflectionQuestions, en: reflectionQuestions },
        animatorTips: { de: tips, en: tips },
        status: 'draft',
        submittedBy: prop.authorName || 'Community',
      };
      saveArtsPrompt(newArt, author, `Vorschlag "${prop.title}" als Kunst-Impuls übernommen`);
    } else if (prop.type === 'kategorie') {
      const catId = prop.githubIssueNumber
        ? `gh_cat_${prop.githubIssueNumber}`
        : `proposal_${prop.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const newCat: EmpireCategory = {
        id: catId,
        prompt: { de: prop.title, en: prop.title },
        hint: { de: prop.summary, en: prop.summary },
        examples: { de: ['Beispiel 1', 'Beispiel 2'], en: ['Example 1', 'Example 2'] },
        mood: 'fun',
        topic: 'everyday',
        age: 'all',
        shy: true,
        personal: false,
        status: 'draft',
      };
      saveEmpireCategory(newCat, author, `Vorschlag "${prop.title}" als Empire-Kategorie übernommen`);
    }

    updateProposalStatus(proposalId, 'accepted', undefined, author);
    refresh();
  }, [proposals, saveGame, saveServiceProject, saveArtsPrompt, saveEmpireCategory, refresh]);

  const rejectProposal = useCallback((proposalId: string, reason: string, author: string) => {
    const prop = proposals.find((p) => p.id === proposalId) || getProposals().find((p) => p.id === proposalId);
    const ghIssueNum = prop?.githubIssueNumber || (prop?.payload?.githubIssueNumber as number | undefined);
    if (ghIssueNum) {
      updateGitHubIssueStatus(ghIssueNum, 'reject', reason).catch(() => {});
    }
    updateProposalStatus(proposalId, 'rejected', reason, author);
    refresh();
  }, [proposals, refresh]);

  const removeEntityFromDeletedCache = useCallback((entityId: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);
      if (!raw) return;
      const list: string[] = JSON.parse(raw);
      const cleanId = entityId.replace(/^(spy_|whoami_|empire_|psych_)/, '');
      const filtered = list.filter((id) => id !== entityId && id !== cleanId);
      localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(filtered));
    } catch {
      /* ignore */
    }
  }, []);

  const rollback = useCallback((revisionId: string, author: string) => {
    const rev = rollbackRevision(revisionId, author);
    if (rev && rev.action === 'restore') {
      removeEntityFromDeletedCache(rev.entityId);
    }
    refresh();
    syncAdminStateWithCloud().catch(() => {});
    return rev;
  }, [refresh, removeEntityFromDeletedCache]);

  const rollbackByAuthor = useCallback(
    (targetAccount: { id?: string; username?: string; displayName: string }, author: string) => {
      const count = rollbackAllRevisionsByAuthor(targetAccount, author);
      if (count > 0) {
        refresh();
        syncAdminStateWithCloud().catch(() => {});
      }
      return count;
    },
    [refresh]
  );

  return (
    <AdminDataContext.Provider
      value={{
        revisions,
        backendDraftIds,
        games,
        serviceProjects,
        artsPrompts,
        spyLocations,
        whoAmIPacks,
        empireCategories,
        psychiatristRules,
        adminGames,
        adminServiceProjects,
        adminArtsPrompts,
        adminSpyLocations,
        adminWhoAmIPacks,
        adminEmpireCategories,
        adminPsychiatristRules,
        proposals,
        saveGame,
        deleteGame,
        saveServiceProject,
        deleteServiceProject,
        saveArtsPrompt,
        deleteArtsPrompt,
        saveSpyLocation,
        deleteSpyLocation,
        saveWhoAmIPack,
        deleteWhoAmIPack,
        saveEmpireCategory,
        deleteEmpireCategory,
        savePsychiatristRule,
        deletePsychiatristRule,
        acceptProposal,
        rejectProposal,
        rollback,
        rollbackByAuthor,
        syncCloudState,
        refresh,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
