import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface SyncPayload {
  action: 'accept' | 'reject' | 'delete' | 'sync_admin_state';
  issueNumber?: number;
  reason?: string;
  gameId?: string;
  updatedPayload?: Record<string, unknown>;
  // For action === 'sync_admin_state'
  accounts?: any[];
  deletedAccountIds?: string[];
  revisions?: any[];
  proposals?: any[];
}

interface AdminCloudState {
  version: number;
  updatedAt: number;
  accounts: any[];
  deletedAccountIds: string[];
  revisions: any[];
  proposals: any[];
}

const DEFAULT_GIST_ID = 'c762dbc8bc8a824ecdf01d6000deef96';
const GIST_FILENAME = 'jy_admin_state.json';

function isOwnerIdentityServer(username = '', displayName = ''): boolean {
  const u = username.trim().toLowerCase();
  const d = displayName.trim().toLowerCase();
  if (!u && !d) return false;
  return (
    u === 'nuri@modabber.net' ||
    u === 'milan.modabber@gmail.com' ||
    u === 'nurimodabber' ||
    u === 'nuri' ||
    u.includes('modabber') ||
    u.startsWith('nuri@') ||
    u.startsWith('nuri.') ||
    d.includes('nuri') ||
    d.includes('modabber')
  );
}

function normalizeServerAccount(raw: any): any {
  const isOwner = Boolean(raw.isPrimaryOwner) || isOwnerIdentityServer(raw.username, raw.displayName);
  const role = isOwner ? 'owner' : raw.role === 'owner' ? 'editor' : raw.role || 'editor';
  const status = isOwner ? 'active' : raw.status === 'suspended' ? 'suspended' : 'active';

  const defaultPerms =
    role === 'owner'
      ? {
          canCreateDrafts: true,
          canPublishLive: true,
          canReviewProposals: true,
          canEditMinigames: true,
          canDeleteCatalogItems: true,
          canRollbackOwnChanges: true,
          canManageAccounts: true,
          canRollbackAllChanges: true,
          canManageSystemSettings: true,
        }
      : role === 'contributor'
        ? {
            canCreateDrafts: true,
            canPublishLive: false,
            canReviewProposals: false,
            canEditMinigames: false,
            canDeleteCatalogItems: false,
            canRollbackOwnChanges: true,
            canManageAccounts: false,
            canRollbackAllChanges: false,
            canManageSystemSettings: false,
          }
        : role === 'viewer'
          ? {
              canCreateDrafts: false,
              canPublishLive: false,
              canReviewProposals: false,
              canEditMinigames: false,
              canDeleteCatalogItems: false,
              canRollbackOwnChanges: false,
              canManageAccounts: false,
              canRollbackAllChanges: false,
              canManageSystemSettings: false,
            }
          : {
              canCreateDrafts: true,
              canPublishLive: true,
              canReviewProposals: true,
              canEditMinigames: true,
              canDeleteCatalogItems: false,
              canRollbackOwnChanges: true,
              canManageAccounts: false,
              canRollbackAllChanges: false,
              canManageSystemSettings: false,
            };

  const custom = raw.permissions || defaultPerms;
  const permissions = isOwner
    ? defaultPerms
    : {
        canCreateDrafts: Boolean(custom.canCreateDrafts),
        canPublishLive: Boolean(custom.canPublishLive),
        canReviewProposals: Boolean(custom.canReviewProposals),
        canEditMinigames: Boolean(custom.canEditMinigames),
        canDeleteCatalogItems: Boolean(custom.canDeleteCatalogItems),
        canRollbackOwnChanges: Boolean(custom.canRollbackOwnChanges),
        canManageAccounts: false,
        canRollbackAllChanges: false,
        canManageSystemSettings: false,
      };

  return {
    ...raw,
    username: (raw.username || '').trim().toLowerCase(),
    displayName: (raw.displayName || raw.username || 'Team').trim(),
    role,
    status,
    isPrimaryOwner: isOwner,
    permissions,
    createdAt: raw.createdAt || Date.now(),
    updatedAt: raw.updatedAt || raw.createdAt || Date.now(),
  };
}

function encryptState(state: AdminCloudState, secret: string): string {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(state);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    encrypted: true,
    v: 1,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('base64'),
  });
}

function decryptState(rawContent: string, secret: string): AdminCloudState {
  const empty: AdminCloudState = {
    version: 1,
    updatedAt: 0,
    accounts: [],
    deletedAccountIds: [],
    revisions: [],
    proposals: [],
  };
  if (!rawContent) return empty;
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed && parsed.encrypted === true && parsed.iv && parsed.tag && parsed.data) {
      const key = crypto.createHash('sha256').update(secret).digest();
      const iv = Buffer.from(parsed.iv, 'hex');
      const tag = Buffer.from(parsed.tag, 'hex');
      const data = Buffer.from(parsed.data, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
      const state = JSON.parse(decrypted);
      return {
        version: 1,
        updatedAt: state.updatedAt || 0,
        accounts: Array.isArray(state.accounts) ? state.accounts : [],
        deletedAccountIds: Array.isArray(state.deletedAccountIds) ? state.deletedAccountIds : [],
        revisions: Array.isArray(state.revisions) ? state.revisions : [],
        proposals: Array.isArray(state.proposals) ? state.proposals : [],
      };
    }
    return {
      version: 1,
      updatedAt: parsed.updatedAt || 0,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      deletedAccountIds: Array.isArray(parsed.deletedAccountIds) ? parsed.deletedAccountIds : [],
      revisions: Array.isArray(parsed.revisions) ? parsed.revisions : [],
      proposals: Array.isArray(parsed.proposals) ? parsed.proposals : [],
    };
  } catch {
    return empty;
  }
}

function mergeServerAdminState(remote: AdminCloudState, incoming: Partial<AdminCloudState>): AdminCloudState {
  const deletedAccountIds = Array.from(
    new Set([...(remote.deletedAccountIds || []), ...(incoming.deletedAccountIds || [])])
  );
  const deletedSet = new Set(deletedAccountIds);

  // 1. Merge accounts by username
  const accMap = new Map<string, any>();
  for (const raw of [...(remote.accounts || []), ...(incoming.accounts || [])]) {
    if (!raw || !raw.username) continue;
    if (raw.id && deletedSet.has(raw.id)) continue;
    const norm = normalizeServerAccount(raw);
    const key = norm.username.toLowerCase();
    const existing = accMap.get(key);
    if (!existing) {
      accMap.set(key, norm);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const incomingTime = norm.updatedAt || norm.createdAt || 0;
      const winner = incomingTime >= existingTime ? norm : existing;
      const loser = incomingTime >= existingTime ? existing : norm;
      accMap.set(
        key,
        normalizeServerAccount({
          ...loser,
          ...winner,
          isPrimaryOwner: Boolean(winner.isPrimaryOwner || loser.isPrimaryOwner),
          lastLoginAt: Math.max(winner.lastLoginAt || 0, loser.lastLoginAt || 0) || undefined,
        })
      );
    }
  }

  // 2. Merge revisions by revisionId
  const revMap = new Map<string, any>();
  for (const rev of [...(remote.revisions || []), ...(incoming.revisions || [])]) {
    if (!rev || !rev.revisionId) continue;
    const existing = revMap.get(rev.revisionId);
    if (!existing) {
      revMap.set(rev.revisionId, rev);
    } else {
      revMap.set(rev.revisionId, {
        ...existing,
        ...rev,
        undoneByRevisionId: rev.undoneByRevisionId || existing.undoneByRevisionId,
        rollbackOfRevisionId: rev.rollbackOfRevisionId || existing.rollbackOfRevisionId,
      });
    }
  }

  // 3. Merge proposals by id
  const propMap = new Map<string, any>();
  for (const prop of [...(remote.proposals || []), ...(incoming.proposals || [])]) {
    if (!prop || !prop.id) continue;
    const existing = propMap.get(prop.id);
    if (!existing) {
      propMap.set(prop.id, prop);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const incomingTime = prop.updatedAt || prop.createdAt || 0;
      propMap.set(prop.id, incomingTime >= existingTime ? { ...existing, ...prop } : { ...prop, ...existing });
    }
  }

  return {
    version: 1,
    updatedAt: Date.now(),
    accounts: Array.from(accMap.values()).sort((a, b) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    }),
    deletedAccountIds,
    revisions: Array.from(revMap.values())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 500),
    proposals: Array.from(propMap.values())
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 300),
  };
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

  const { GITHUB_TOKEN, GITHUB_REPO, ADMIN_STATE_GIST_ID } = process.env;
  const repo = GITHUB_REPO || 'nurimodabber/jy-resource-hub';
  const gistId = ADMIN_STATE_GIST_ID || DEFAULT_GIST_ID;

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
      res.end(
        JSON.stringify({
          ok: true,
          approvedGames,
          approvedCategories: approvedCats,
          approvedServiceProjects,
          approvedArtsPrompts,
          deletedIds,
        })
      );
      return;
    } catch (err: any) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: err.message, approvedGames: [], deletedIds: [] }));
      return;
    }
  }

  // POST: Admin updating issue status OR syncing multi-account admin state
  if (req.method === 'POST') {
    if (!GITHUB_TOKEN) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ok: false,
          fallbackToClient: true,
          message: 'Kein Server GITHUB_TOKEN konfiguriert. Bitte Personal Access Token in den Admin-Einstellungen verwenden.',
        })
      );
      return;
    }

    try {
      let body: SyncPayload;
      if (req.body && typeof req.body === 'object') {
        body = req.body;
      } else {
        const rawBody = await new Promise<string>((resolve) => {
          let chunks = '';
          req.on('data', (chunk) => {
            chunks += chunk;
          });
          req.on('end', () => resolve(chunks));
        });
        body = JSON.parse(rawBody || '{}');
      }

      const headers = {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'JY-Hub-Admin',
        'Content-Type': 'application/json',
      };

      // --- ACTION: SYNC MULTI-ACCOUNT ADMIN STATE & REVISIONS ---
      if (body.action === 'sync_admin_state') {
        const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
        if (!gistRes.ok) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: `Gist read HTTP ${gistRes.status}` }));
          return;
        }

        const gistData: any = await gistRes.json();
        const fileObj = gistData?.files?.[GIST_FILENAME];
        const rawContent = fileObj?.content || '';
        const remoteState = decryptState(rawContent, GITHUB_TOKEN);

        const hasIncomingChanges =
          (Array.isArray(body.accounts) && body.accounts.length > 0) ||
          (Array.isArray(body.deletedAccountIds) && body.deletedAccountIds.length > 0) ||
          (Array.isArray(body.revisions) && body.revisions.length > 0) ||
          (Array.isArray(body.proposals) && body.proposals.length > 0);

        const mergedState = mergeServerAdminState(remoteState, {
          accounts: body.accounts || [],
          deletedAccountIds: body.deletedAccountIds || [],
          revisions: body.revisions || [],
          proposals: body.proposals || [],
        });

        if (hasIncomingChanges || !rawContent.includes('"encrypted":true')) {
          const encryptedContent = encryptState(mergedState, GITHUB_TOKEN);
          await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              files: {
                [GIST_FILENAME]: {
                  content: encryptedContent,
                },
              },
            }),
          });
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            ok: true,
            state: mergedState,
          })
        );
        return;
      }

      // --- ACTION: UPDATE GITHUB ISSUE STATUS (accept / reject / delete) ---
      const { action, issueNumber, reason, updatedPayload } = body;
      if (!issueNumber) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, message: 'Missing issueNumber' }));
        return;
      }

      // 1. Fetch current issue to preserve tags
      const issueRes = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, { headers });
      const currentIssue = await issueRes.json();
      const currentLabels: string[] = (currentIssue.labels || []).map((l: any) => l.name);

      const newLabels = currentLabels.filter(
        (l) =>
          l !== 'vorschlag' &&
          l !== 'status:accepted' &&
          l !== 'übernommen' &&
          l !== 'abgelehnt' &&
          l !== 'gelöscht'
      );
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
