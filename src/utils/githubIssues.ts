/**
 * GitHub Issues Integration for Community Proposals in JY Hub Admin
 * 
 * Interacts with the GitHub REST API to fetch issues created by users or community
 * members via the submission form (api/submit.ts) or directly on GitHub.
 */

import { ProposalItem } from './adminRevisions';
import { Game } from '../types';
import { EmpireCategoryV2 as EmpireCategory } from '../data/empireContent';

export const STORAGE_GH_REPO_KEY = 'jy_admin_github_repo';
export const STORAGE_GH_TOKEN_KEY = 'jy_admin_github_token';
export const STORAGE_SYNCED_GAMES_KEY = 'jy_synced_approved_games';
export const STORAGE_SYNCED_CATS_KEY = 'jy_synced_approved_cats';
export const STORAGE_SYNCED_DELETED_KEY = 'jy_synced_deleted_ids';
export const DEFAULT_GH_REPO = 'nurimodabber/jy-resource-hub';

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

/** Updates a GitHub issue status when accepted, rejected, or deleted in the admin panel */
export async function updateGitHubIssueStatus(
  issueNumber: number,
  action: 'accept' | 'reject' | 'delete',
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  // 1. Try serverless endpoint first (works on Vercel with process.env.GITHUB_TOKEN)
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, issueNumber, reason }),
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

    // Fetch existing issue labels
    const issueRes = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, { headers });
    const issueData = await issueRes.json();
    const currentLabels: string[] = (issueData.labels || []).map((l: { name: string }) => l.name);

    const newLabels = currentLabels.filter((l) => l !== 'vorschlag' && l !== 'status:accepted' && l !== 'übernommen' && l !== 'abgelehnt' && l !== 'gelöscht');
    let commentBody = '';

    if (action === 'accept') {
      newLabels.push('übernommen');
      commentBody = '✅ Dieser Vorschlag wurde redaktionell geprüft und auf der Website freigeschaltet.';
    } else if (action === 'reject') {
      newLabels.push('abgelehnt');
      commentBody = `❌ Dieser Vorschlag wurde abgelehnt: ${reason || 'Keine Begründung angegeben'}`;
    } else if (action === 'delete') {
      newLabels.push('gelöscht');
      commentBody = '🗑️ Dieser Eintrag wurde aus der aktiven Website-Datenbank entfernt.';
    }

    await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        state: 'closed',
        labels: newLabels,
      }),
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

/** Fetches approved community content & deleted IDs from GitHub to sync with live website */
export async function fetchApprovedGitHubContent(): Promise<{
  approvedGames: Game[];
  approvedCategories: EmpireCategory[];
  deletedEntityIds: string[];
}> {
  // 1. Try serverless /api/sync endpoint
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.approvedGames)) {
        try {
          localStorage.setItem(STORAGE_SYNCED_GAMES_KEY, JSON.stringify(data.approvedGames));
          localStorage.setItem(STORAGE_SYNCED_CATS_KEY, JSON.stringify(data.approvedCategories || []));
          localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(data.deletedIds || []));
        } catch {
          /* ignore */
        }
        return {
          approvedGames: data.approvedGames,
          approvedCategories: data.approvedCategories || [],
          deletedEntityIds: data.deletedIds || [],
        };
      }
    }
  } catch {
    /* Fallback to public GitHub API */
  }

  // 2. Direct public GitHub REST API call
  const repo = getGitHubRepo();
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'JY-Hub-Client',
      },
    });

    if (!res.ok) {
      return getCachedApprovedContent();
    }

    const issues: GitHubIssue[] = await res.json();
    if (!Array.isArray(issues)) {
      return getCachedApprovedContent();
    }

    const approvedGames: Game[] = [];
    const approvedCats: EmpireCategory[] = [];
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
      } else if (isApproved && parsedDraft) {
        if (parsedDraft.prompt && parsedDraft.hint) {
          approvedCats.push({
            ...(parsedDraft as unknown as EmpireCategory),
            id: (parsedDraft.id as string) || `proposal_${issue.number}`,
            status: 'draft',
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
      localStorage.setItem(STORAGE_SYNCED_DELETED_KEY, JSON.stringify(deletedEntityIds));
    } catch {
      /* ignore */
    }

    return { approvedGames, approvedCategories: approvedCats, deletedEntityIds };
  } catch {
    return getCachedApprovedContent();
  }
}

/** Loads cached approved community content from localStorage */
export function getCachedApprovedContent(): {
  approvedGames: Game[];
  approvedCategories: EmpireCategory[];
  deletedEntityIds: string[];
} {
  try {
    const rawGames = localStorage.getItem(STORAGE_SYNCED_GAMES_KEY);
    const rawCats = localStorage.getItem(STORAGE_SYNCED_CATS_KEY);
    const rawDeleted = localStorage.getItem(STORAGE_SYNCED_DELETED_KEY);

    return {
      approvedGames: rawGames ? JSON.parse(rawGames) : [],
      approvedCategories: rawCats ? JSON.parse(rawCats) : [],
      deletedEntityIds: rawDeleted ? JSON.parse(rawDeleted) : [],
    };
  } catch {
    return { approvedGames: [], approvedCategories: [], deletedEntityIds: [] };
  }
}
