/**
 * GitHub Issues Integration for Community Proposals in JY Hub Admin
 * 
 * Interacts with the GitHub REST API to fetch issues created by users or community
 * members via the submission form (api/submit.ts) or directly on GitHub.
 */

import { ProposalItem } from './adminRevisions';

export const STORAGE_GH_REPO_KEY = 'jy_admin_github_repo';
export const STORAGE_GH_TOKEN_KEY = 'jy_admin_github_token';
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
