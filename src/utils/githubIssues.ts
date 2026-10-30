/**
 * GitHub Issues Integration for Community Proposals in JY Hub Admin
 * 
 * Interacts with the GitHub REST API to fetch issues created by users or community
 * members via the submission form (api/submit.ts) or directly on GitHub.
 */

import {
  ProposalItem,
  DataRevision,
  getRevisions,
  saveRevisions,
  mergeRevisions,
  getProposals,
  saveProposalsList,
  mergeProposals,
} from './adminRevisions';
import { AdminAccount, adminApi, hasAdminSession, setAdminAccountsFromServer } from './adminAuth';
import { Game, ServiceProject, ArtsPrompt } from '../types';
import { EmpireCategoryV2 as EmpireCategory } from '../data/empireContent';

export const STORAGE_GH_REPO_KEY = 'jy_admin_github_repo';
export const STORAGE_SYNCED_GAMES_KEY = 'jy_synced_approved_games';
export const STORAGE_SYNCED_CATS_KEY = 'jy_synced_approved_cats';
export const STORAGE_SYNCED_SERVICE_KEY = 'jy_synced_approved_service';
export const STORAGE_SYNCED_ARTS_KEY = 'jy_synced_approved_arts';
export const STORAGE_SYNCED_DELETED_KEY = 'jy_synced_deleted_ids';
export const DEFAULT_GH_REPO = 'nurimodabber/jy-resource-hub';

/** Server configuration as reported to the Owner by /api/sync (no secret values). */
export interface SystemStatus {
  repo: string;
  repoOk: boolean;
  canWrite: boolean;
  rateRemaining: number | null;
  ownerConfigured: boolean;
  sessionSecretConfigured: boolean;
  separateStateKey: boolean;
  setupTokenActive: boolean;
  emailConfigured: boolean;
}

export interface SyncedApprovedContent {
  approvedGames: Game[];
  approvedCategories: EmpireCategory[];
  approvedServiceProjects: ServiceProject[];
  approvedArtsPrompts: ArtsPrompt[];
  deletedEntityIds: string[];
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  labels: Array<{
    name: string;
    color: string;
  }>;
  pull_request?: Record<string, unknown>;
}

export function getGitHubRepo(): string {
  try {
    return localStorage.getItem(STORAGE_GH_REPO_KEY) || DEFAULT_GH_REPO;
  } catch {
    return DEFAULT_GH_REPO;
  }
}

/** Parses embedded JSON draft from GitHub Issue markdown body */
function extractJsonDraft(body: string | null): Record<string, unknown> | null {
  if (!body) return null;
  const match = body.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match || !match[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

type ServerIssue = Pick<GitHubIssue, 'number' | 'title' | 'body' | 'html_url' | 'created_at'> & {
  labels: Array<{ name: string }>;
  user?: { login: string; avatar_url: string; html_url: string };
  contactName?: string;
  contactEmail?: string;
};

/** Open community proposals, loaded through the server (needs a session with review rights). */
export async function fetchGitHubProposals(): Promise<{ ok: boolean; issues: ProposalItem[]; rawCount: number; error?: string }> {
  if (!hasAdminSession()) return { ok: false, issues: [], rawCount: 0, error: 'Nicht angemeldet.' };
  const res = await adminApi<{ ok: boolean; code?: string; issues?: ServerIssue[] }>({ action: 'list_proposals' });
  if (!res.ok || !Array.isArray(res.issues)) {
    return {
      ok: false,
      issues: [],
      rawCount: 0,
      error:
        res.code === 'forbidden'
          ? 'Für Einreichungen fehlt dir die Prüf-Berechtigung.'
          : 'Einreichungen konnten nicht geladen werden.',
    };
  }

  const proposals: ProposalItem[] = res.issues.map((issue) => {
    const parsedDraft = extractJsonDraft(issue.body);
    const labelNames = issue.labels.map((l) => l.name);
    const isService = labelNames.includes('dienst') || parsedDraft?.kind === 'dienst';
    const isArt = labelNames.includes('kunst') || parsedDraft?.kind === 'kunst';
    const isCategory = labelNames.includes('kategorie') || parsedDraft?.kind === 'kategorie';

    let type: 'spiel' | 'dienst' | 'kunst' | 'kategorie' = 'spiel';
    if (isService) type = 'dienst';
    else if (isArt) type = 'kunst';
    else if (isCategory) type = 'kategorie';

    const summary =
      (parsedDraft?.summary as { de?: string })?.de ||
      (issue.body ? issue.body.replace(/###[\s\S]*?\n\n/g, '').slice(0, 200).trim() : issue.title);

    return {
      id: `gh_issue_${issue.number}`,
      type,
      title: issue.title.replace(/^\[.*?\]\s*/, ''),
      summary,
      authorName: issue.contactName || issue.user?.login || 'GitHub User',
      authorEmail: issue.contactEmail,
      createdAt: new Date(issue.created_at).getTime(),
      status: 'pending',
      githubIssueNumber: issue.number,
      payload: {
        ...(parsedDraft || {}),
        githubIssueNumber: issue.number,
        githubUrl: issue.html_url,
        githubUserAvatar: issue.user?.avatar_url,
        githubUserUrl: issue.user?.html_url,
        labels: labelNames,
      },
    };
  });

  return { ok: true, issues: proposals, rawCount: proposals.length };
}

/** Accept / reject / delete a community proposal issue. Only the server holds the GitHub token. */
export async function updateGitHubIssueStatus(
  issueNumber: number,
  action: 'accept' | 'reject' | 'delete',
  reason?: string,
  updatedPayload?: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const res = await adminApi({ action, issueNumber, reason, updatedPayload });
  if (res.ok) return { ok: true };
  return {
    ok: false,
    error:
      res.code === 'forbidden' || res.code === 'not_a_proposal'
        ? 'Dafür fehlt die Berechtigung.'
        : res.code === 'unauthorized'
          ? 'Sitzung abgelaufen. Bitte neu anmelden.'
          : 'GitHub-Status konnte nicht aktualisiert werden. Änderung ist lokal gespeichert.',
  };
}

/** Owner-only: which server settings are configured (never the values themselves). */
export async function fetchSystemStatus(): Promise<{ ok: boolean; status?: SystemStatus; code?: string }> {
  const res = await adminApi<{ ok: boolean; code?: string; status?: SystemStatus }>({ action: 'system_status' });
  return res.ok ? { ok: true, status: res.status } : { ok: false, code: res.code };
}

/** Fetches approved community content & deleted IDs from GitHub to sync with live website */
export async function fetchApprovedGitHubContent(): Promise<SyncedApprovedContent> {
  // 1. Try serverless /api/sync endpoint
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.approvedGames)) {
        try {
          localStorage.setItem(STORAGE_SYNCED_GAMES_KEY, JSON.stringify(data.approvedGames));
          localStorage.setItem(STORAGE_SYNCED_CATS_KEY, JSON.stringify(data.approvedCategories || []));
          localStorage.setItem(STORAGE_SYNCED_SERVICE_KEY, JSON.stringify(data.approvedServiceProjects || []));
          localStorage.setItem(STORAGE_SYNCED_ARTS_KEY, JSON.stringify(data.approvedArtsPrompts || []));
          localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(data.deletedIds || []));
        } catch {
          /* ignore */
        }
        return {
          approvedGames: data.approvedGames,
          approvedCategories: data.approvedCategories || [],
          approvedServiceProjects: data.approvedServiceProjects || [],
          approvedArtsPrompts: data.approvedArtsPrompts || [],
          deletedEntityIds: data.deletedIds || [],
        };
      }
    }
  } catch {
    /* Fallback to public GitHub API */
  }

  // 2. Direct public GitHub REST API call (unauthenticated; public repository)
  const repo = getGitHubRepo();
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100`, { headers });

    if (!res.ok) {
      return getCachedApprovedContent();
    }

    const issues: GitHubIssue[] = await res.json();
    if (!Array.isArray(issues)) {
      return getCachedApprovedContent();
    }

    const approvedGames: Game[] = [];
    const approvedCats: EmpireCategory[] = [];
    const approvedServiceProjects: ServiceProject[] = [];
    const approvedArtsPrompts: ArtsPrompt[] = [];
    const deletedEntityIds: string[] = [];

    for (const issue of issues) {
      if (issue.pull_request) continue;
      const labelNames: string[] = (issue.labels || []).map((l) => l.name);
      const isApproved = labelNames.some((l) => l === 'übernommen' || l === 'status:accepted');
      const isDeleted = labelNames.some((l) => l === 'gelöscht' || l === 'status:deleted');

      const parsedDraft = extractJsonDraft(issue.body);

      if (isDeleted) {
        if (parsedDraft?.id) deletedEntityIds.push(parsedDraft.id as string);
        deletedEntityIds.push(`gh_issue_${issue.number}`);
        deletedEntityIds.push(`gh_game_${issue.number}`);
        deletedEntityIds.push(`gh_service_${issue.number}`);
        deletedEntityIds.push(`gh_art_${issue.number}`);
      } else if (isApproved && parsedDraft) {
        const isService = labelNames.includes('dienst') || parsedDraft.kind === 'dienst';
        const isArt = labelNames.includes('kunst') || parsedDraft.kind === 'kunst' || Boolean(parsedDraft.artForm);
        const isEmpireCat = Boolean(parsedDraft.prompt && parsedDraft.hint);

        if (isEmpireCat) {
          approvedCats.push({
            ...(parsedDraft as unknown as EmpireCategory),
            id: (parsedDraft.id as string) || `proposal_${issue.number}`,
            status: 'draft',
          });
        } else if (isService) {
          approvedServiceProjects.push({
            ...(parsedDraft as unknown as ServiceProject),
            id: (parsedDraft.id as string) || `gh_service_${issue.number}`,
            kind: 'dienst',
            status: 'draft',
            submittedBy: (parsedDraft.submittedBy as string) || issue.user?.login || 'Community',
          });
        } else if (isArt) {
          approvedArtsPrompts.push({
            ...(parsedDraft as unknown as ArtsPrompt),
            id: (parsedDraft.id as string) || `gh_art_${issue.number}`,
            kind: 'kunst',
            status: 'draft',
            submittedBy: (parsedDraft.submittedBy as string) || issue.user?.login || 'Community',
          });
        } else {
          approvedGames.push({
            ...(parsedDraft as unknown as Game),
            id: (parsedDraft.id as string) || `proposal_game_${issue.number}`,
            status: 'draft',
            submittedBy: (parsedDraft.submittedBy as string) || issue.user?.login || 'Community',
          });
        }
      }
    }

    try {
      localStorage.setItem(STORAGE_SYNCED_GAMES_KEY, JSON.stringify(approvedGames));
      localStorage.setItem(STORAGE_SYNCED_CATS_KEY, JSON.stringify(approvedCats));
      localStorage.setItem(STORAGE_SYNCED_SERVICE_KEY, JSON.stringify(approvedServiceProjects));
      localStorage.setItem(STORAGE_SYNCED_ARTS_KEY, JSON.stringify(approvedArtsPrompts));
      localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(deletedEntityIds));
    } catch {
      /* ignore */
    }

    return {
      approvedGames,
      approvedCategories: approvedCats,
      approvedServiceProjects,
      approvedArtsPrompts,
      deletedEntityIds,
    };
  } catch {
    return getCachedApprovedContent();
  }
}

/** Loads cached approved community content from localStorage */
export function getCachedApprovedContent(): SyncedApprovedContent {
  try {
    const rawGames = localStorage.getItem(STORAGE_SYNCED_GAMES_KEY);
    const rawCats = localStorage.getItem(STORAGE_SYNCED_CATS_KEY);
    const rawService = localStorage.getItem(STORAGE_SYNCED_SERVICE_KEY);
    const rawArts = localStorage.getItem(STORAGE_SYNCED_ARTS_KEY);
    const rawDeleted = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);

    return {
      approvedGames: rawGames ? JSON.parse(rawGames) : [],
      approvedCategories: rawCats ? JSON.parse(rawCats) : [],
      approvedServiceProjects: rawService ? JSON.parse(rawService) : [],
      approvedArtsPrompts: rawArts ? JSON.parse(rawArts) : [],
      deletedEntityIds: rawDeleted ? JSON.parse(rawDeleted) : [],
    };
  } catch {
    return {
      approvedGames: [],
      approvedCategories: [],
      approvedServiceProjects: [],
      approvedArtsPrompts: [],
      deletedEntityIds: [],
    };
  }
}

/**
 * Two-way sync of the revision log and proposals via `/api/sync` (session required). The server
 * stamps authorship, enforces permissions and returns the team list without any password data.
 */
export async function syncAdminStateWithCloud(): Promise<{
  ok: boolean;
  accounts: AdminAccount[];
  revisions: DataRevision[];
  proposals: ProposalItem[];
  pendingRequestCount?: number;
}> {
  const localRevisions = getRevisions();
  const localProposals = getProposals();
  const offline = { ok: false, accounts: [] as AdminAccount[], revisions: localRevisions, proposals: localProposals };
  if (!hasAdminSession()) return offline;

  const data = await adminApi<{
    ok: boolean;
    account?: AdminAccount;
    state?: { accounts?: AdminAccount[]; revisions?: DataRevision[]; proposals?: ProposalItem[] };
    pendingRequestCount?: number;
  }>({ action: 'sync_admin_state', revisions: localRevisions, proposals: localProposals });
  if (!data.ok || !data.state) return offline;

  const accounts = Array.isArray(data.state.accounts) ? data.state.accounts : [];
  setAdminAccountsFromServer(accounts, data.account);

  const mergedRevs = mergeRevisions(localRevisions, Array.isArray(data.state.revisions) ? data.state.revisions : []);
  saveRevisions(mergedRevs);
  const mergedProps = mergeProposals(localProposals, Array.isArray(data.state.proposals) ? data.state.proposals : []);
  saveProposalsList(mergedProps);

  window.dispatchEvent(new CustomEvent('jy_data_updated'));
  return {
    ok: true,
    accounts,
    revisions: mergedRevs,
    proposals: mergedProps,
    pendingRequestCount: typeof data.pendingRequestCount === 'number' ? data.pendingRequestCount : 0,
  };
}

export interface AccountRequest {
  id: string;
  displayName: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  decidedAt?: number;
  decidedRole?: string;
}

interface AccountRequestApiResult {
  ok: boolean;
  code?: string;
  message?: string;
}

/**
 * Sends an access request. The password travels over HTTPS and is hashed on the server (PBKDF2);
 * no account exists until the Owner approves.
 */
export async function submitAccountRequest(params: {
  displayName: string;
  email: string;
  message: string;
  password: string;
}): Promise<AccountRequestApiResult> {
  return adminApi({ action: 'request_account', ...params });
}

export async function fetchAccountRequests(): Promise<AccountRequestApiResult & { requests?: AccountRequest[] }> {
  return adminApi({ action: 'list_account_requests' });
}

export async function decideAccountRequest(params: {
  requestId: string;
  decision: 'approve' | 'reject';
  role?: 'editor' | 'contributor' | 'viewer';
}): Promise<AccountRequestApiResult & { emailSent?: boolean }> {
  return adminApi({ action: 'decide_account_request', ...params });
}
