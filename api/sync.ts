import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface SyncPayload {
  action:
    | 'accept'
    | 'reject'
    | 'delete'
    | 'sync_admin_state'
    | 'request_account'
    | 'list_account_requests'
    | 'decide_account_request';
  issueNumber?: number;
  reason?: string;
  gameId?: string;
  updatedPayload?: Record<string, unknown>;
  // For action === 'sync_admin_state'
  accounts?: any[];
  deletedAccountIds?: string[];
  revisions?: any[];
  proposals?: any[];
  // For action === 'request_account'
  displayName?: string;
  email?: string;
  message?: string;
  salt?: string;
  passwordHash?: string;
  // For action === 'list_account_requests' | 'decide_account_request' (Owner re-authenticates)
  ownerUsername?: string;
  ownerPassword?: string;
  requestId?: string;
  decision?: 'approve' | 'reject';
  role?: string;
}

interface AdminCloudState {
  version: number;
  updatedAt: number;
  accounts: any[];
  deletedAccountIds: string[];
  revisions: any[];
  proposals: any[];
  /** Pending/decided access requests. Never sent to clients except via the Owner-authenticated action. */
  accountRequests: any[];
}

const DEFAULT_GIST_ID = 'c762dbc8bc8a824ecdf01d6000deef96';
const GIST_FILENAME = 'jy_admin_state.json';

let cachedCloudState: { state: AdminCloudState; fingerprint: string; fetchedAt: number } | null = null;

function stateFingerprint(s: AdminCloudState): string {
  return JSON.stringify({
    accounts: (s.accounts || []).map((a) => ({
      id: a.id,
      username: a.username,
      displayName: a.displayName,
      role: a.role,
      status: a.status,
      permissions: a.permissions,
      passwordHash: a.passwordHash,
      updatedAt: a.updatedAt,
    })),
    deletedAccountIds: s.deletedAccountIds || [],
    revisionsCount: (s.revisions || []).length,
    latestRevisionId: s.revisions?.[0]?.revisionId || '',
    undoneCount: (s.revisions || []).filter((r) => r?.undoneByRevisionId).length,
    proposalsCount: (s.proposals || []).length,
    accountRequests: (s.accountRequests || []).map((r) => ({ id: r.id, status: r.status })),
  });
}

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
    accountRequests: [],
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
        accountRequests: Array.isArray(state.accountRequests) ? state.accountRequests : [],
      };
    }
    return {
      version: 1,
      updatedAt: parsed.updatedAt || 0,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      deletedAccountIds: Array.isArray(parsed.deletedAccountIds) ? parsed.deletedAccountIds : [],
      revisions: Array.isArray(parsed.revisions) ? parsed.revisions : [],
      proposals: Array.isArray(parsed.proposals) ? parsed.proposals : [],
      accountRequests: Array.isArray(parsed.accountRequests) ? parsed.accountRequests : [],
    };
  } catch {
    return empty;
  }
}

function mergeServerAdminState(remote: AdminCloudState, incoming: Partial<AdminCloudState>): AdminCloudState {
  const deletedSet = new Set([...(remote.deletedAccountIds || []), ...(incoming.deletedAccountIds || [])]);

  // 1. Merge accounts:
  //    - Enforce a SINGLE Owner account across the entire system (key = '__primary_owner__')
  //    - Deduplicate other accounts by username AND by normalized displayName
  //    - Automatically add superseded duplicate account IDs to deletedAccountIds so no browser can resurrect them
  const accMap = new Map<string, any>();
  const nameToKey = new Map<string, string>();

  const isBetterOwnerCandidate = (candidate: any, current: any): boolean => {
    const candPreferred = candidate.username === 'nuri@modabber.net' ? 2 : candidate.displayName.length > 6 ? 1 : 0;
    const currPreferred = current.username === 'nuri@modabber.net' ? 2 : current.displayName.length > 6 ? 1 : 0;
    if (candPreferred !== currPreferred) return candPreferred > currPreferred;
    return (candidate.updatedAt || candidate.createdAt || 0) >= (current.updatedAt || current.createdAt || 0);
  };

  for (const raw of [...(remote.accounts || []), ...(incoming.accounts || [])]) {
    if (!raw || !raw.username) continue;
    if (raw.id && deletedSet.has(raw.id)) continue;
    const norm = normalizeServerAccount(raw);
    const isOwnerAcc = norm.role === 'owner' || Boolean(norm.isPrimaryOwner);
    const nameKey = (norm.displayName || '').trim().toLowerCase();
    const userKey = norm.username.toLowerCase();

    let key = isOwnerAcc ? '__primary_owner__' : userKey;
    if (!isOwnerAcc && !accMap.has(key) && nameKey && nameToKey.has(nameKey)) {
      key = nameToKey.get(nameKey)!;
    }

    const existing = accMap.get(key);
    if (!existing) {
      accMap.set(key, norm);
      if (!isOwnerAcc && nameKey) nameToKey.set(nameKey, key);
    } else {
      const incomingWins = isOwnerAcc
        ? isBetterOwnerCandidate(norm, existing)
        : (norm.updatedAt || norm.createdAt || 0) >= (existing.updatedAt || existing.createdAt || 0);
      const winner = incomingWins ? norm : existing;
      const loser = incomingWins ? existing : norm;

      if (loser.id && winner.id && loser.id !== winner.id) {
        deletedSet.add(loser.id);
      }

      accMap.set(
        key,
        normalizeServerAccount({
          ...loser,
          ...winner,
          id: winner.id,
          username: winner.username,
          displayName: winner.displayName,
          salt: winner.salt,
          passwordHash: winner.passwordHash,
          isPrimaryOwner: Boolean(winner.isPrimaryOwner || loser.isPrimaryOwner),
          createdAt: Math.min(winner.createdAt || Date.now(), loser.createdAt || Date.now()),
          lastLoginAt: Math.max(winner.lastLoginAt || 0, loser.lastLoginAt || 0) || undefined,
        })
      );
    }
  }

  const deletedAccountIds = Array.from(deletedSet);

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
    accountRequests: remote.accountRequests || [],
  };
}

const SITE_URL = (process.env.SITE_URL || 'https://jy-resource-hub.vercel.app').replace(/\/$/, '');
const REQUESTABLE_ROLES = ['editor', 'contributor', 'viewer'] as const;
const ROLE_LABELS_MAIL: Record<string, { de: string; en: string }> = {
  editor: { de: 'Redaktion', en: 'Editor' },
  contributor: { de: 'Mitarbeit (Entwürfe)', en: 'Contributor (drafts)' },
  viewer: { de: 'Nur Ansicht', en: 'View only' },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Sends a transactional email through Resend. Never throws. */
async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY ist nicht konfiguriert.' };
  const from = process.env.EMAIL_FROM || 'Junior Youth Hub <onboarding@resend.dev>';
  try {
    const mailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [params.to], subject: params.subject, text: params.text, html: params.html }),
    });
    if (!mailRes.ok) {
      const detail = await mailRes.text().catch(() => '');
      return { sent: false, error: `E-Mail-Dienst HTTP ${mailRes.status} ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err?.message || 'E-Mail konnte nicht gesendet werden.' };
  }
}

function buildApprovalEmail(displayName: string, email: string, role: string) {
  const roleLabel = ROLE_LABELS_MAIL[role] || ROLE_LABELS_MAIL.contributor;
  const loginUrl = `${SITE_URL}/admin`;
  const text = [
    `Hallo ${displayName},`,
    '',
    'dein Zugang zum Redaktionsportal des Junior Youth Hub ist freigegeben. Du kannst dich jetzt anmelden.',
    `Benutzername: ${email}`,
    'Passwort: das Passwort, das du bei deiner Anfrage gewählt hast.',
    `Rolle: ${roleLabel.de}`,
    `Anmelden: ${loginUrl}`,
    '',
    'Du hast keinen Zugang angefragt? Dann ignoriere diese E-Mail.',
    '',
    '---',
    '',
    `Hello ${displayName},`,
    '',
    'your access to the Junior Youth Hub editorial portal is approved. You can sign in now.',
    `Username: ${email}`,
    'Password: the password you chose when you requested access.',
    `Role: ${roleLabel.en}`,
    `Sign in: ${loginUrl}`,
    '',
    'You did not request access? Then please ignore this email.',
  ].join('\n');
  const name = escapeHtml(displayName);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1b2430;max-width:520px">
<p>Hallo ${name},</p>
<p>dein Zugang zum Redaktionsportal des Junior Youth Hub ist freigegeben. Du kannst dich jetzt anmelden.</p>
<p>Benutzername: <strong>${escapeHtml(email)}</strong><br>Passwort: das Passwort, das du bei deiner Anfrage gewählt hast.<br>Rolle: ${escapeHtml(roleLabel.de)}</p>
<p><a href="${loginUrl}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:bold">Zum Redaktionsportal</a></p>
<p style="color:#5b6573">Du hast keinen Zugang angefragt? Dann ignoriere diese E-Mail.</p>
<hr style="border:none;border-top:1px solid #d9dee5;margin:24px 0">
<p>Hello ${name},</p>
<p>your access to the Junior Youth Hub editorial portal is approved. You can sign in now.</p>
<p>Username: <strong>${escapeHtml(email)}</strong><br>Password: the password you chose when you requested access.<br>Role: ${escapeHtml(roleLabel.en)}</p>
<p><a href="${loginUrl}">Open the editorial portal</a></p>
<p style="color:#5b6573">You did not request access? Then please ignore this email.</p>
</div>`;
  return {
    subject: 'Dein Zugang ist freigegeben / Your access is approved – Junior Youth Hub',
    text,
    html,
  };
}

/** Re-authenticates the Owner against the stored salted hash (the password itself is never stored). */
function verifyOwnerCredentials(state: AdminCloudState, username = '', password = ''): boolean {
  const u = username.trim().toLowerCase();
  if (!u || !password) return false;
  const raw =
    (state.accounts || []).find((a) => (a?.username || '').toLowerCase() === u) ||
    (isOwnerIdentityServer(u)
      ? (state.accounts || []).find((a) => a?.role === 'owner' || a?.isPrimaryOwner)
      : undefined);
  if (!raw || !raw.salt || !raw.passwordHash) return false;
  const acc = normalizeServerAccount(raw);
  if (acc.role !== 'owner' || acc.status !== 'active') return false;
  const computed = Buffer.from(crypto.createHash('sha256').update(`${raw.salt}:${password}`).digest('hex'));
  const stored = Buffer.from(String(raw.passwordHash));
  return computed.length === stored.length && crypto.timingSafeEqual(computed, stored);
}

function sendJson(res: ServerResponse, status: number, payload: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
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

      const loadCloudState = async (): Promise<AdminCloudState> => {
        if (cachedCloudState && Date.now() - cachedCloudState.fetchedAt < 15000) {
          return cachedCloudState.state;
        }
        // 1. Zero-rate-limit read via raw Gist URL (Fastly CDN, does not count against GitHub REST API limit)
        try {
          const rawRes = await fetch(
            `https://gist.githubusercontent.com/nurimodabber/${gistId}/raw/${GIST_FILENAME}?t=${Date.now()}`,
            { headers: { 'Cache-Control': 'no-cache' } }
          );
          if (rawRes.ok) {
            const rawText = await rawRes.text();
            if (rawText) {
              const decrypted = decryptState(rawText, GITHUB_TOKEN);
              const normalized = mergeServerAdminState(decrypted, {});
              cachedCloudState = {
                state: normalized,
                fingerprint: stateFingerprint(normalized),
                fetchedAt: Date.now(),
              };
              return normalized;
            }
          }
        } catch {
          /* fall through to REST API */
        }

        // 2. Fallback to GitHub REST API
        const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
        if (!gistRes.ok) {
          if (cachedCloudState) return cachedCloudState.state;
          throw new Error(`Gist read HTTP ${gistRes.status}`);
        }
        const gistData: any = await gistRes.json();
        const rawContent = gistData?.files?.[GIST_FILENAME]?.content || '';
        const decrypted = decryptState(rawContent, GITHUB_TOKEN);
        const normalized = mergeServerAdminState(decrypted, {});
        cachedCloudState = {
          state: normalized,
          fingerprint: stateFingerprint(normalized),
          fetchedAt: Date.now(),
        };
        return normalized;
      };

      const saveCloudState = async (state: AdminCloudState): Promise<void> => {
        const nextFp = stateFingerprint(state);
        const prevFp = cachedCloudState?.fingerprint;
        cachedCloudState = { state, fingerprint: nextFp, fetchedAt: Date.now() };
        if (prevFp && prevFp === nextFp) {
          return;
        }
        try {
          await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ files: { [GIST_FILENAME]: { content: encryptState(state, GITHUB_TOKEN) } } }),
          });
        } catch {
          /* keep in-memory state if rate-limited */
        }
      };

      // --- ACTION: PUBLIC ACCESS REQUEST (no account is created, Owner must approve) ---
      if (body.action === 'request_account') {
        const displayName = String(body.displayName || '').trim().slice(0, 80);
        const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
        const message = String(body.message || '').trim().slice(0, 400);
        const salt = String(body.salt || '');
        const passwordHash = String(body.passwordHash || '');

        if (displayName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          sendJson(res, 400, { ok: false, code: 'invalid', message: 'Name oder E-Mail-Adresse ungültig.' });
          return;
        }
        if (!/^[0-9a-f]{32}$/.test(salt) || !/^[0-9a-f]{64}$/.test(passwordHash)) {
          sendJson(res, 400, { ok: false, code: 'invalid', message: 'Ungültige Passwortdaten.' });
          return;
        }
        if (isOwnerIdentityServer(email, displayName)) {
          sendJson(res, 400, {
            ok: false,
            code: 'reserved',
            message: 'Dieser Name oder diese E-Mail-Adresse ist für den Inhaber reserviert.',
          });
          return;
        }

        const state = await loadCloudState();
        const lowerDisplay = displayName.trim().toLowerCase();
        if (
          (state.accounts || []).some(
            (a) =>
              (a?.username || '').toLowerCase() === email ||
              (a?.displayName || '').trim().toLowerCase() === lowerDisplay
          )
        ) {
          sendJson(res, 200, {
            ok: false,
            code: 'exists',
            message: 'Für diesen Namen oder diese E-Mail-Adresse gibt es schon einen Account.',
          });
          return;
        }
        const pending = (state.accountRequests || []).filter((r) => r?.status === 'pending');
        if (pending.some((r) => r.email === email || (r.displayName || '').trim().toLowerCase() === lowerDisplay)) {
          sendJson(res, 200, {
            ok: false,
            code: 'pending',
            message: 'Für diesen Namen oder diese E-Mail-Adresse liegt schon eine Anfrage vor.',
          });
          return;
        }
        if (pending.length >= 50) {
          sendJson(res, 429, { ok: false, code: 'limit', message: 'Es liegen gerade zu viele Anfragen vor. Versuche es später erneut.' });
          return;
        }

        state.accountRequests = [
          ...(state.accountRequests || []),
          {
            id: `req_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
            displayName,
            email,
            message,
            salt,
            passwordHash,
            status: 'pending',
            createdAt: Date.now(),
          },
        ].slice(-200);
        state.updatedAt = Date.now();
        await saveCloudState(state);

        const notifyTo = process.env.OWNER_NOTIFY_EMAIL;
        if (notifyTo) {
          await sendEmail({
            to: notifyTo,
            subject: `Neue Zugangsanfrage: ${displayName}`,
            text: `${displayName} (${email}) bittet um Zugang zum Redaktionsportal.\n\n${message ? `Nachricht: ${message}\n\n` : ''}Prüfen: ${SITE_URL}/admin`,
            html: `<p>${escapeHtml(displayName)} (${escapeHtml(email)}) bittet um Zugang zum Redaktionsportal.</p>${
              message ? `<p>Nachricht: ${escapeHtml(message)}</p>` : ''
            }<p><a href="${SITE_URL}/admin">Anfrage prüfen</a></p>`,
          });
        }

        sendJson(res, 200, { ok: true });
        return;
      }

      // --- ACTIONS REQUIRING OWNER RE-AUTHENTICATION ---
      if (body.action === 'list_account_requests' || body.action === 'decide_account_request') {
        const state = await loadCloudState();
        if (!verifyOwnerCredentials(state, body.ownerUsername, body.ownerPassword)) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          sendJson(res, 200, {
            ok: false,
            code: 'unauthorized',
            message: 'Inhaber-Passwort nicht korrekt oder Inhaber-Account noch nicht in der Cloud.',
          });
          return;
        }

        const publicRequests = (state.accountRequests || [])
          .map((r) => ({
            id: r.id,
            displayName: r.displayName,
            email: r.email,
            message: r.message || '',
            status: r.status,
            createdAt: r.createdAt,
            decidedAt: r.decidedAt,
            decidedRole: r.decidedRole,
          }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        if (body.action === 'list_account_requests') {
          sendJson(res, 200, { ok: true, requests: publicRequests });
          return;
        }

        const target = (state.accountRequests || []).find((r) => r.id === body.requestId);
        if (!target || target.status !== 'pending') {
          sendJson(res, 200, { ok: false, code: 'not_found', message: 'Anfrage nicht gefunden oder schon entschieden.' });
          return;
        }

        if (body.decision === 'reject') {
          target.status = 'rejected';
          target.decidedAt = Date.now();
          state.updatedAt = Date.now();
          await saveCloudState(state);
          sendJson(res, 200, { ok: true, decision: 'reject' });
          return;
        }

        if (isOwnerIdentityServer(target.email, target.displayName)) {
          sendJson(res, 200, { ok: false, code: 'reserved', message: 'Name oder E-Mail ist für den Inhaber reserviert.' });
          return;
        }
        if ((state.accounts || []).some((a) => (a?.username || '').toLowerCase() === target.email)) {
          sendJson(res, 200, { ok: false, code: 'exists', message: 'Es gibt schon einen Account mit dieser E-Mail-Adresse.' });
          return;
        }

        const role = (REQUESTABLE_ROLES as readonly string[]).includes(String(body.role)) ? String(body.role) : 'contributor';
        const now = Date.now();
        const newAccount = normalizeServerAccount({
          id: `acc_${now.toString(36)}_${crypto.randomBytes(2).toString('hex')}`,
          username: target.email,
          displayName: target.displayName,
          role,
          status: 'active',
          salt: target.salt,
          passwordHash: target.passwordHash,
          createdAt: now,
          updatedAt: now,
        });
        state.accounts = [...(state.accounts || []), newAccount];
        target.status = 'approved';
        target.decidedAt = now;
        target.decidedRole = role;
        // Credentials now live on the account; drop them from the request record.
        delete target.salt;
        delete target.passwordHash;
        state.updatedAt = now;
        await saveCloudState(state);

        const mail = buildApprovalEmail(target.displayName, target.email, role);
        const mailResult = await sendEmail({ to: target.email, ...mail });
        sendJson(res, 200, {
          ok: true,
          decision: 'approve',
          emailSent: mailResult.sent,
          emailError: mailResult.error,
        });
        return;
      }

      // --- ACTION: SYNC MULTI-ACCOUNT ADMIN STATE & REVISIONS ---
      if (body.action === 'sync_admin_state') {
        const remoteState = await loadCloudState();
        const remoteFp = stateFingerprint(remoteState);

        const mergedState = mergeServerAdminState(remoteState, {
          accounts: body.accounts || [],
          deletedAccountIds: body.deletedAccountIds || [],
          revisions: body.revisions || [],
          proposals: body.proposals || [],
        });

        if (stateFingerprint(mergedState) !== remoteFp) {
          await saveCloudState(mergedState);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            ok: true,
            state: { ...mergedState, accountRequests: undefined },
            pendingRequestCount: (mergedState.accountRequests || []).filter((r) => r?.status === 'pending').length,
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
