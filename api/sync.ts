import type { IncomingMessage, ServerResponse } from 'http';

interface SyncPayload {
  action: 'accept' | 'reject' | 'delete';
  issueNumber: number;
  reason?: string;
  gameId?: string;
  updatedPayload?: Record<string, unknown>;
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse): Promise<void> {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { GITHUB_TOKEN, GITHUB_REPO } = process.env;
  const repo = GITHUB_REPO || 'nurimodabber/jy-resource-hub';

  // GET: Fetch approved community content and deleted IDs from GitHub
  if (req.method === 'GET') {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'JY-Hub-Sync-Worker',
      };
      if (GITHUB_TOKEN) {
        headers.Authorization = `token ${GITHUB_TOKEN}`;
      }

      const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100`, { headers });
      if (!ghRes.ok) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: `GitHub API error: ${ghRes.status}`, approvedGames: [], deletedIds: [] }));
        return;
      }

      const issues: any[] = await ghRes.json();
      if (!Array.isArray(issues)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, approvedGames: [], deletedIds: [] }));
        return;
      }

      const approvedGames: any[] = [];
      const approvedCats: any[] = [];
      const approvedServiceProjects: any[] = [];
      const approvedArtsPrompts: any[] = [];
      const deletedIds: string[] = [];

      for (const issue of issues) {
        if (issue.pull_request) continue;
        const labelNames: string[] = (issue.labels || []).map((l: any) => l.name);

        const isApproved = labelNames.some((l) => l === 'übernommen' || l === 'status:accepted');
        const isDeleted = labelNames.some((l) => l === 'gelöscht' || l === 'status:deleted');

        // Extract JSON draft if present
        let parsedDraft: any = null;
        if (issue.body) {
          const match = issue.body.match(/```json\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            try {
              parsedDraft = JSON.parse(match[1]);
            } catch {
              /* ignore */
            }
          }
        }

        if (isDeleted) {
          if (parsedDraft?.id) deletedIds.push(parsedDraft.id);
          deletedIds.push(`gh_issue_${issue.number}`);
          deletedIds.push(`gh_game_${issue.number}`);
          deletedIds.push(`gh_service_${issue.number}`);
          deletedIds.push(`gh_art_${issue.number}`);
        } else if (isApproved && parsedDraft) {
          const isService = labelNames.includes('dienst') || parsedDraft.kind === 'dienst';
          const isArt = labelNames.includes('kunst') || parsedDraft.kind === 'kunst' || Boolean(parsedDraft.artForm);
          const isEmpireCat = Boolean(parsedDraft.prompt && parsedDraft.hint);

          if (isEmpireCat) {
            approvedCats.push({
              ...parsedDraft,
              id: parsedDraft.id || `proposal_${issue.number}`,
              status: 'draft',
            });
          } else if (isService) {
            approvedServiceProjects.push({
              ...parsedDraft,
              id: parsedDraft.id || `gh_service_${issue.number}`,
              kind: 'dienst',
              status: 'draft',
              submittedBy: parsedDraft.submittedBy || issue.user?.login || 'Community',
            });
          } else if (isArt) {
            approvedArtsPrompts.push({
              ...parsedDraft,
              id: parsedDraft.id || `gh_art_${issue.number}`,
              kind: 'kunst',
              status: 'draft',
              submittedBy: parsedDraft.submittedBy || issue.user?.login || 'Community',
            });
          } else {
            approvedGames.push({
              ...parsedDraft,
              id: parsedDraft.id || `proposal_game_${issue.number}`,
              status: 'draft',
              submittedBy: parsedDraft.submittedBy || issue.user?.login || 'Community',
            });
          }
        }
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: true,
        approvedGames,
        approvedCategories: approvedCats,
        approvedServiceProjects,
        approvedArtsPrompts,
        deletedIds,
      }));
      return;
    } catch (err: any) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: err.message, approvedGames: [], deletedIds: [] }));
      return;
    }
  }

  // POST: Admin updating issue status (Accept, Reject, Delete)
  if (req.method === 'POST') {
    if (!GITHUB_TOKEN) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: false,
        fallbackToClient: true,
        message: 'Kein Server GITHUB_TOKEN konfiguriert. Bitte Personal Access Token in den Admin-Einstellungen verwenden.',
      }));
      return;
    }

    try {
      let body: SyncPayload;
      if (req.body && typeof req.body === 'object') {
        body = req.body;
      } else {
        const rawBody = await new Promise<string>((resolve) => {
          let chunks = '';
          req.on('data', (chunk) => { chunks += chunk; });
          req.on('end', () => resolve(chunks));
        });
        body = JSON.parse(rawBody || '{}');
      }

      const { action, issueNumber, reason, updatedPayload } = body;
      if (!issueNumber) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, message: 'Missing issueNumber' }));
        return;
      }

      const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'JY-Hub-Admin',
        'Content-Type': 'application/json',
      };

      // 1. Fetch current issue to preserve tags
      const issueRes = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, { headers });
      const currentIssue = await issueRes.json();
      const currentLabels: string[] = (currentIssue.labels || []).map((l: any) => l.name);

      let newLabels = currentLabels.filter((l) => l !== 'vorschlag' && l !== 'status:accepted' && l !== 'übernommen' && l !== 'abgelehnt' && l !== 'gelöscht');
      let commentText = '';

      if (action === 'accept') {
        newLabels.push('übernommen');
        commentText = '✅ Dieser Eintrag wurde redaktionell geprüft und live im Katalog veröffentlicht.';
      } else if (action === 'reject') {
        newLabels.push('abgelehnt');
        commentText = `❌ Dieser Vorschlag wurde abgelehnt: ${reason || 'Keine Begründung angegeben'}`;
      } else if (action === 'delete') {
        newLabels.push('gelöscht');
        commentText = '🗑️ Dieser Eintrag wurde aus dem aktiven Katalog entfernt.';
      }

      const patchPayload: Record<string, unknown> = {
        state: 'closed',
        labels: newLabels,
      };

      if (updatedPayload) {
        const existingBody = typeof currentIssue.body === 'string' ? currentIssue.body : '';
        const jsonBlock = '```json\n' + JSON.stringify(updatedPayload, null, 2) + '\n```';
        if (/```json[\s\S]*?```/.test(existingBody)) {
          patchPayload.body = existingBody.replace(/```json[\s\S]*?```/, jsonBlock);
        } else {
          patchPayload.body = `${existingBody}\n\n### Redaktioneller Datensatz\n${jsonBlock}`.trim();
        }
      }

      // Update issue labels, optional body, and close it
      await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patchPayload),
      });

      // Post status comment
      if (commentText) {
        await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ body: commentText }),
        });
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, status: action, issueNumber }));
      return;
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: err.message }));
      return;
    }
  }

  res.statusCode = 405;
  res.end();
}
