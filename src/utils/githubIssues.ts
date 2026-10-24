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
import {
  AdminAccount,
  getAdminAccounts,
  saveAdminAccounts,
  mergeAdminAccounts,
  getDeletedAccountIds,
  saveDeletedAccountIds,
} from './adminAuth';
import { Game, ServiceProject, ArtsPrompt } from '../types';
import { EmpireCategoryV2 as EmpireCategory } from '../data/empireContent';

export const STORAGE_GH_REPO_KEY = 'jy_admin_github_repo';
export const STORAGE_GH_TOKEN_KEY = 'jy_admin_github_token';
export const STORAGE_SYNCED_GAMES_KEY = 'jy_synced_approved_games';
export const STORAGE_SYNCED_CATS_KEY = 'jy_synced_approved_cats';
export const STORAGE_SYNCED_SERVICE_KEY = 'jy_synced_approved_service';
export const STORAGE_SYNCED_ARTS_KEY = 'jy_synced_approved_arts';
export const STORAGE_SYNCED_DELETED_KEY = 'jy_synced_deleted_ids';
export const DEFAULT_GH_REPO = 'nurimodabber/jy-resource-hub';

export interface GitHubConnectionStatus {
  ok: boolean;
  repo: string;
  canWrite: boolean;
  hasToken: boolean;
  user?: string;
  rateLimitRemaining?: number;
  rateLimitTotal?: number;
  openIssuesCount?: number;
  error?: string;
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

export function setGitHubRepo(repo: string): void {
  try {
    localStorage.setItem(STORAGE_GH_REPO_KEY, repo.trim() || DEFAULT_GH_REPO);
  } catch {
    /* ignore */
  }
}

export function getGitHubToken(): string {
  try {
    return localStorage.getItem(STORAGE_GH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setGitHubToken(token: string): void {
  try {
    if (token.trim()) {
      localStorage.setItem(STORAGE_GH_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(STORAGE_GH_TOKEN_KEY);
    }
  } catch {
    /* ignore */
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

/** Fetches open issues from the configured GitHub repository */
export async function fetchGitHubProposals(): Promise<{ ok: boolean; issues: ProposalItem[]; rawCount: number; error?: string }> {
  const repo = getGitHubRepo();
  const token = getGitHubToken();

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'JY-Hub-Admin',
    };
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const url = `https://api.github.com/repos/${repo}/issues?state=open&per_page=50`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        return {
          ok: false,
          issues: [],
          rawCount: 0,
          error: 'GitHub API Ratenlimit erreicht. Du kannst in den Admin-Einstellungen ein GitHub Personal Access Token (PAT) hinterlegen.',
        };
      }
      if (res.status === 404) {
        return {
          ok: false,
          issues: [],
          rawCount: 0,
          error: `GitHub Repository "${repo}" wurde nicht gefunden oder ist privat.`,
        };
      }
      return {
        ok: false,
        issues: [],
        rawCount: 0,
        error: `GitHub API Fehler: HTTP ${res.status}`,
      };
    }

    const ghIssues: GitHubIssue[] = await res.json();
    if (!Array.isArray(ghIssues)) {
      return { ok: true, issues: [], rawCount: 0 };
    }

    // Filter out PRs, keep only issues
    const realIssues = ghIssues.filter((i) => !i.pull_request);

    const proposals: ProposalItem[] = realIssues.map((issue) => {
      const parsedDraft = extractJsonDraft(issue.body);
      const isService = issue.labels.some((l) => l.name === 'dienst') || parsedDraft?.kind === 'dienst';
      const isArt = issue.labels.some((l) => l.name === 'kunst') || parsedDraft?.kind === 'kunst';
      const isCategory = issue.labels.some((l) => l.name === 'kategorie') || parsedDraft?.kind === 'kategorie';

      let type: 'spiel' | 'dienst' | 'kunst' | 'kategorie' = 'spiel';
      if (isService) type = 'dienst';
      else if (isArt) type = 'kunst';
      else if (isCategory) type = 'kategorie';

      const summary = (parsedDraft?.summary as { de?: string })?.de ||
        (issue.body ? issue.body.replace(/###[\s\S]*?\n\n/g, '').slice(0, 200).trim() : issue.title);

      return {
        id: `gh_issue_${issue.number}`,
        type,
        title: issue.title.replace(/^\[.*?\]\s*/, ''),
        summary,
        authorName: issue.user?.login || 'GitHub User',
        createdAt: new Date(issue.created_at).getTime(),
        status: 'pending',
        githubIssueNumber: issue.number,
        payload: {
          ...(parsedDraft || {}),
          githubIssueNumber: issue.number,
          githubUrl: issue.html_url,
          githubUserAvatar: issue.user?.avatar_url,
          githubUserUrl: issue.user?.html_url,
          labels: issue.labels.map((l) => l.name),
        },
      };
    });

    return {
      ok: true,
      issues: proposals,
      rawCount: realIssues.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Netzwerkfehler beim Abrufen der GitHub Issues';
    return {
      ok: false,
      issues: [],
      rawCount: 0,
      error: message,
    };
  }
}

/** Updates a GitHub issue status (and optionally its JSON payload) when accepted, edited, rejected, or deleted in the admin panel */
export async function updateGitHubIssueStatus(
  issueNumber: number,
  action: 'accept' | 'reject' | 'delete',
  reason?: string,
  updatedPayload?: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  // 1. Try serverless endpoint first (works on Vercel with process.env.GITHUB_TOKEN)
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, issueNumber, reason, updatedPayload }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      return { ok: true };
    }
  } catch {
    /* Fallback to direct client call if server endpoint unavailable */
  }

  // 2. Direct client call using user configured GitHub PAT
  const token = getGitHubToken();
  const repo = getGitHubRepo();
  if (!token) {
    return {
      ok: false,
      error: 'Kein GitHub Token auf dem Server oder im Browser hinterlegt. Status wurde lokal gespeichert.',
    };
  }

  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`,
      'User-Agent': 'JY-Hub-Admin',
      'Content-Type': 'application/json',
    };

    // Fetch existing issue labels & body
    const issueRes = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, { headers });
    const issueData = await issueRes.json();
    const currentLabels: string[] = (issueData.labels || []).map((l: { name: string }) => l.name);

    const newLabels = currentLabels.filter((l) => l !== 'vorschlag' && l !== 'status:accepted' && l !== 'übernommen' && l !== 'abgelehnt' && l !== 'gelöscht');
    let commentBody = '';

    if (action === 'accept') {
      newLabels.push('übernommen');
      commentBody = '✅ Dieser Eintrag wurde redaktionell geprüft und live im Katalog veröffentlicht.';
    } else if (action === 'reject') {
      newLabels.push('abgelehnt');
      commentBody = `❌ Dieser Vorschlag wurde abgelehnt: ${reason || 'Keine Begründung angegeben'}`;
    } else if (action === 'delete') {
      newLabels.push('gelöscht');
      commentBody = '🗑️ Dieser Eintrag wurde aus dem aktiven Katalog entfernt.';
    }

    const patchBody: Record<string, unknown> = {
      state: 'closed',
      labels: newLabels,
    };

    if (updatedPayload) {
      const existingBody = typeof issueData.body === 'string' ? issueData.body : '';
      const jsonBlock = '```json\n' + JSON.stringify(updatedPayload, null, 2) + '\n```';
      if (/```json[\s\S]*?```/.test(existingBody)) {
        patchBody.body = existingBody.replace(/```json[\s\S]*?```/, jsonBlock);
      } else {
        patchBody.body = `${existingBody}\n\n### Redaktioneller Datensatz\n${jsonBlock}`.trim();
      }
    }

    await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(patchBody),
    });

    if (commentBody) {
      await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: commentBody }),
      });
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Fehler beim Aktualisieren des GitHub Issues';
    return { ok: false, error: message };
  }
}

/** Tests the GitHub connection, repository accessibility, token write permissions, and rate limits */
export async function testGitHubConnection(customRepo?: string, customToken?: string): Promise<GitHubConnectionStatus> {
  const repo = (customRepo !== undefined ? customRepo : getGitHubRepo()).trim() || DEFAULT_GH_REPO;
  const token = (customToken !== undefined ? customToken : getGitHubToken()).trim();

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'JY-Hub-Admin',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    const remaining = Number(repoRes.headers.get('x-ratelimit-remaining'));
    const limit = Number(repoRes.headers.get('x-ratelimit-limit'));

    if (!repoRes.ok) {
      if (repoRes.status === 401) {
        return {
          ok: false,
          repo,
          canWrite: false,
          hasToken: !!token,
          error: 'Ungültiges Personal Access Token (HTTP 401).',
        };
      }
      if (repoRes.status === 404) {
        return {
          ok: false,
          repo,
          canWrite: false,
          hasToken: !!token,
          error: `Repository "${repo}" nicht gefunden oder nicht öffentlich zugänglich.`,
        };
      }
      return {
        ok: false,
        repo,
        canWrite: false,
        hasToken: !!token,
        rateLimitRemaining: !Number.isNaN(remaining) ? remaining : undefined,
        rateLimitTotal: !Number.isNaN(limit) ? limit : undefined,
        error: `GitHub API Status: HTTP ${repoRes.status}`,
      };
    }

    const repoData = await repoRes.json();
    const canPush = Boolean(repoData.permissions?.push || repoData.permissions?.admin || repoData.permissions?.maintain);
    let userLogin: string | undefined;

    if (token) {
      try {
        const userRes = await fetch('https://api.github.com/user', { headers });
        if (userRes.ok) {
          const userData = await userRes.json();
          userLogin = userData.login;
        }
      } catch {
        /* ignore */
      }
    }

    return {
      ok: true,
      repo,
      canWrite: canPush || (!!token && !!userLogin),
      hasToken: !!token,
      user: userLogin,
      rateLimitRemaining: !Number.isNaN(remaining) ? remaining : undefined,
      rateLimitTotal: !Number.isNaN(limit) ? limit : undefined,
      openIssuesCount: typeof repoData.open_issues_count === 'number' ? repoData.open_issues_count : undefined,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      repo,
      canWrite: false,
      hasToken: !!token,
      error: err instanceof Error ? err.message : 'Verbindung zu GitHub fehlgeschlagen',
    };
  }
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

  // 2. Direct public GitHub REST API call
  const repo = getGitHubRepo();
  const token = getGitHubToken();
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'JY-Hub-Client',
    };
    if (token) {
      headers.Authorization = `token ${token}`;
    }

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
 * Two-way cloud sync for Admin Accounts, Deleted Account IDs, Revisions, and Proposals via `/api/sync`.
 * Ensures accounts signed into on any device (e.g. a friend's browser) become viewable from the Owner's
 * account, and permission/role updates or rollbacks propagate across devices.
 */
export async function syncAdminStateWithCloud(): Promise<{
  ok: boolean;
  accounts: AdminAccount[];
  revisions: DataRevision[];
  proposals: ProposalItem[];
}> {
  const localAccounts = getAdminAccounts();
  const localDeletedAccountIds = getDeletedAccountIds();
  const localRevisions = getRevisions();
  const localProposals = getProposals();

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_admin_state',
        accounts: localAccounts,
        deletedAccountIds: localDeletedAccountIds,
        revisions: localRevisions,
        proposals: localProposals,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        accounts: localAccounts,
        revisions: localRevisions,
        proposals: localProposals,
      };
    }

    const data = await res.json();
    if (!data?.ok || !data?.state) {
      return {
        ok: false,
        accounts: localAccounts,
        revisions: localRevisions,
        proposals: localProposals,
      };
    }

    const remoteState = data.state;
    const mergedDeletedIds = Array.from(
      new Set([...localDeletedAccountIds, ...(remoteState.deletedAccountIds || [])])
    );
    saveDeletedAccountIds(mergedDeletedIds);

    const mergedAccounts = mergeAdminAccounts(
      localAccounts,
      Array.isArray(remoteState.accounts) ? remoteState.accounts : [],
      mergedDeletedIds
    );
    saveAdminAccounts(mergedAccounts);

    const mergedRevs = mergeRevisions(
      localRevisions,
      Array.isArray(remoteState.revisions) ? remoteState.revisions : []
    );
    saveRevisions(mergedRevs);

    const mergedProps = mergeProposals(
      localProposals,
      Array.isArray(remoteState.proposals) ? remoteState.proposals : []
    );
    saveProposalsList(mergedProps);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jy_data_updated'));
      window.dispatchEvent(new CustomEvent('jy_accounts_updated'));
    }

    return {
      ok: true,
      accounts: mergedAccounts,
      revisions: mergedRevs,
      proposals: mergedProps,
    };
  } catch {
    return {
      ok: false,
      accounts: localAccounts,
      revisions: localRevisions,
      proposals: localProposals,
    };
  }
}
