import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Game } from '../types';
import { GAMES_DATA } from '../data/games';
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
  getProposals,
  updateProposalStatus,
  softDeleteEntity,
} from '../utils/adminRevisions';
import {
  fetchApprovedGitHubContent,
  getCachedApprovedContent,
  updateGitHubIssueStatus,
  STORAGE_SYNCED_DELETED_KEY,
} from '../utils/githubIssues';

export type AdminSpyLocation = SpyLocation & { status?: 'draft' };
export type EmpireCategory = EmpireCategoryV2;

export interface AdminDataContextType {
  revisions: DataRevision[];
  games: Game[];
  spyLocations: AdminSpyLocation[];
  whoAmIPacks: WhoAmIPack[];
  empireCategories: EmpireCategory[];
  psychiatristRules: RuleIdea[];
  proposals: ProposalItem[];
  saveGame: (game: Game, author: string, summary: string) => DataRevision;
  deleteGame: (gameId: string, author: string, summary?: string) => DataRevision | null;
  saveSpyLocation: (location: AdminSpyLocation, author: string, summary: string) => DataRevision;
  deleteSpyLocation: (id: string, author: string) => DataRevision | null;
  saveWhoAmIPack: (pack: WhoAmIPack, author: string, summary: string) => DataRevision;
  deleteWhoAmIPack: (id: string, author: string) => DataRevision | null;
  saveEmpireCategory: (category: EmpireCategory, author: string, summary: string) => DataRevision;
  deleteEmpireCategory: (id: string, author: string) => DataRevision | null;
  savePsychiatristRule: (rule: RuleIdea, author: string, summary: string) => DataRevision;
  deletePsychiatristRule: (id: string, author: string) => DataRevision | null;
  acceptProposal: (proposalId: string, author: string) => void;
  rejectProposal: (proposalId: string, reason: string, author: string) => void;
  rollback: (revisionId: string, author: string) => DataRevision | null;
  refresh: () => void;
}

const BASE_SPY_LOCATIONS: AdminSpyLocation[] = SPY_PACKS.flatMap((p) => p.locations);

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [revisions, setRevisions] = useState<DataRevision[]>(() => getRevisions());
  const [proposals, setProposals] = useState<ProposalItem[]>(() => getProposals());
  const [syncedData, setSyncedData] = useState<{
    approvedGames: Game[];
    approvedCategories: EmpireCategory[];
    deletedEntityIds: string[];
  }>(() => getCachedApprovedContent());

  const refresh = useCallback(() => {
    setRevisions(getRevisions());
    setProposals(getProposals());
    setSyncedData(getCachedApprovedContent());
  }, []);

  // Fetch live approved content from GitHub on mount
  useEffect(() => {
    let active = true;
    fetchApprovedGitHubContent().then((data) => {
      if (active) {
        setSyncedData(data);
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Listen to live update events from window and storage
  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener('jy_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('jy_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  // Compute Active Overrides from Append-only Log + Synced Content
  const games = useMemo(() => {
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

    // Merge static baseline + synced approved games
    const baseAndSynced: Game[] = [...GAMES_DATA];
    for (const sg of syncedData.approvedGames) {
      if (!baseAndSynced.some((b) => b.id === sg.id)) {
        baseAndSynced.push(sg);
      }
    }

    const result: Game[] = [];
    const processedIds = new Set<string>();

    for (const baseGame of baseAndSynced) {
      if (deletedIdsSet.has(baseGame.id)) {
        continue;
      }
      const override = entityMap.get(baseGame.id);
      if (override) {
        if (!override.deleted && override.data) {
          result.push(override.data);
        }
      } else {
        result.push(baseGame);
      }
      processedIds.add(baseGame.id);
    }

    // Add newly created games that were not in base or synced data
    for (const [id, override] of entityMap.entries()) {
      if (!processedIds.has(id) && !override.deleted && override.data && !deletedIdsSet.has(id)) {
        result.push(override.data);
      }
    }

    return result;
  }, [revisions, syncedData]);

  const spyLocations = useMemo(() => {
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

  const whoAmIPacks = useMemo(() => {
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

  const empireCategories = useMemo(() => {
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
      if (!baseAndSynced.some((b) => b.id === sc.id)) {
        baseAndSynced.push(sc);
      }
    }

    const res: EmpireCategory[] = [];
    const seen = new Set<string>();

    for (const cat of baseAndSynced) {
      if (deletedIdsSet.has(cat.id)) continue;
      const ov = map.get(cat.id);
      if (ov) {
        if (!ov.deleted && ov.data) res.push(ov.data);
      } else {
        res.push(cat);
      }
      seen.add(cat.id);
    }

    for (const [id, ov] of map.entries()) {
      if (!seen.has(id) && !ov.deleted && ov.data && !deletedIdsSet.has(id)) {
        res.push(ov.data);
      }
    }
    return res;
  }, [revisions, syncedData]);

  const psychiatristRules = useMemo(() => {
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

  // Actions
  const saveGame = useCallback((game: Game, author: string, summary: string) => {
    const existing = games.find((g) => g.id === game.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'games',
      entityId: game.id,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...game, status: 'draft' },
    });
    refresh();
    return rev;
  }, [games, refresh]);

  const deleteGame = useCallback((gameId: string, author: string, summary = 'Spiel gelöscht (Soft-Delete)') => {
    const existing = games.find((g) => g.id === gameId);
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
    const ghMatch = gameId.match(/^gh_game_(\d+)$/) || gameId.match(/^proposal_gh_issue_(\d+)$/);
    if (ghMatch && ghMatch[1]) {
      updateGitHubIssueStatus(Number(ghMatch[1]), 'delete', summary).catch(() => {});
    }

    refresh();
    return rev;
  }, [games, refresh]);

  const saveSpyLocation = useCallback((loc: AdminSpyLocation, author: string, summary: string) => {
    const existing = spyLocations.find((l) => l.id === loc.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `spy_${loc.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...loc, status: 'draft' },
    });
    refresh();
    return rev;
  }, [spyLocations, refresh]);

  const deleteSpyLocation = useCallback((id: string, author: string) => {
    const existing = spyLocations.find((l) => l.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `spy_${id}`, existing, author, `Spion-Ort "${existing.name.de}" deaktiviert`);
    refresh();
    return rev;
  }, [spyLocations, refresh]);

  const saveWhoAmIPack = useCallback((pack: WhoAmIPack, author: string, summary: string) => {
    const existing = whoAmIPacks.find((p) => p.id === pack.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `whoami_${pack.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...pack, status: 'draft' },
    });
    refresh();
    return rev;
  }, [whoAmIPacks, refresh]);

  const deleteWhoAmIPack = useCallback((id: string, author: string) => {
    const existing = whoAmIPacks.find((p) => p.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `whoami_${id}`, existing, author, `Wer-bin-ich-Paket "${existing.name.de}" deaktiviert`);
    refresh();
    return rev;
  }, [whoAmIPacks, refresh]);

  const saveEmpireCategory = useCallback((cat: EmpireCategory, author: string, summary: string) => {
    const existing = empireCategories.find((c) => c.id === cat.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `empire_${cat.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...cat, status: 'draft' },
    });
    refresh();
    return rev;
  }, [empireCategories, refresh]);

  const deleteEmpireCategory = useCallback((id: string, author: string) => {
    const existing = empireCategories.find((c) => c.id === id);
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
  }, [empireCategories, refresh]);

  const savePsychiatristRule = useCallback((rule: RuleIdea, author: string, summary: string) => {
    const existing = psychiatristRules.find((r) => r.id === rule.id);
    const action = existing ? 'update' : 'create';
    const rev = appendRevision({
      collection: 'categories',
      entityId: `psych_${rule.id}`,
      action,
      author,
      summary,
      previousSnapshot: existing,
      newSnapshot: { ...rule, status: 'draft' },
    });
    refresh();
    return rev;
  }, [psychiatristRules, refresh]);

  const deletePsychiatristRule = useCallback((id: string, author: string) => {
    const existing = psychiatristRules.find((r) => r.id === id);
    if (!existing) return null;
    const rev = softDeleteEntity('categories', `psych_${id}`, existing, author, `Psychiater-Regel "${existing.text.de}" deaktiviert`);
    refresh();
    return rev;
  }, [psychiatristRules, refresh]);

  const acceptProposal = useCallback(async (proposalId: string, author: string) => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return;

    if (prop.githubIssueNumber) {
      updateGitHubIssueStatus(prop.githubIssueNumber, 'accept').catch(() => {});
    }

    const tips = typeof prop.payload?.animatorTips === 'string' && prop.payload.animatorTips.trim()
      ? [prop.payload.animatorTips.trim()]
      : [];

    const steps = Array.isArray(prop.payload?.steps) && prop.payload?.steps.length
      ? (prop.payload.steps as string[])
      : [prop.summary];

    const entityId = prop.githubIssueNumber
      ? `gh_game_${prop.githubIssueNumber}`
      : `proposal_${prop.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (prop.type === 'spiel') {
      const newGame: Game = {
        id: entityId,
        title: { de: prop.title, en: prop.title },
        subtitle: prop.subtitle ? { de: prop.subtitle, en: prop.subtitle } : undefined,
        category: 'cooperative',
        energyLevel: 'medium',
        purpose: 'zusammenarbeit',
        groupSize: { min: 4, max: 20 },
        prepLevel: 'instant',
        materials: { de: [], en: [] },
        durationMinutes: '15 Min',
        durationMin: 10,
        durationMax: 20,
        space: { de: 'Drinnen oder draußen', en: 'Indoors or outdoors' },
        summary: { de: prop.summary, en: prop.summary },
        idea: { de: prop.summary, en: prop.summary },
        rules: { de: steps, en: steps },
        animatorTips: { de: tips, en: tips },
        status: 'draft',
        submittedBy: prop.authorName || 'Community',
      };
      saveGame(newGame, author, `Vorschlag "${prop.title}" als Spiel übernommen`);
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

    updateProposalStatus(proposalId, 'accepted');
    refresh();
  }, [proposals, saveGame, saveEmpireCategory, refresh]);

  const rejectProposal = useCallback((proposalId: string, reason: string, author: string) => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (prop?.githubIssueNumber) {
      updateGitHubIssueStatus(prop.githubIssueNumber, 'reject', reason).catch(() => {});
    }
    updateProposalStatus(proposalId, 'rejected', reason);
    appendRevision({
      collection: 'proposals',
      entityId: proposalId,
      action: 'soft_delete',
      author,
      summary: `Vorschlag abgelehnt: ${reason || 'Keine Angabe'}`,
    });
    refresh();
  }, [proposals, refresh]);

  const rollback = useCallback((revisionId: string, author: string) => {
    const rev = rollbackRevision(revisionId, author);
    refresh();
    return rev;
  }, [refresh]);

  return (
    <AdminDataContext.Provider
      value={{
        revisions,
        games,
        spyLocations,
        whoAmIPacks,
        empireCategories,
        psychiatristRules,
        proposals,
        saveGame,
        deleteGame,
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
