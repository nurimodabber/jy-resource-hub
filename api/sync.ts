import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

/*
 * Admin + catalog sync endpoint.
 *
 * Security model (2026-10 hardening, see AGENTS.md "Admin security"):
 * - The server is the only authority for accounts, passwords and permissions. Clients never upload
 *   accounts or hashes; every admin action carries a signed session token and is re-checked here
 *   against the stored account (role, status, password version).
 * - The Owner is the account whose username equals OWNER_USERNAME exactly. No name matching.
 * - Passwords are PBKDF2-SHA256. Account hashes stored before this change were publicly readable
 *   through the old unauthenticated sync action, so they are rejected (reset required).
 * - Everything fails closed when a required env var is missing.
 *
 * Env: GITHUB_TOKEN, GITHUB_REPO, ADMIN_STATE_GIST_ID, OWNER_USERNAME, ADMIN_SESSION_SECRET,
 *      ADMIN_SETUP_TOKEN (temporary, owner setup/recovery), ADMIN_STATE_KEY (optional state
 *      encryption key; falls back to GITHUB_TOKEN), RESEND_API_KEY, EMAIL_FROM, OWNER_NOTIFY_EMAIL, SITE_URL.
 */

type Role = 'owner' | 'editor' | 'contributor' | 'viewer';

interface Permissions {
  canCreateDrafts: boolean;
  canPublishLive: boolean;
  canReviewProposals: boolean;
  canEditMinigames: boolean;
  canDeleteCatalogItems: boolean;
  canRollbackOwnChanges: boolean;
  canManageAccounts: boolean;
  canRollbackAllChanges: boolean;
  canManageSystemSettings: boolean;
}

interface StoredAccount {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  status: 'active' | 'suspended';
  isPrimaryOwner: boolean;
  permissions: Permissions;
  salt: string;
  passwordHash: string;
  /** 'pbkdf2-sha256' (current) or 'sha256' (legacy). Missing = legacy hash that was publicly exposed. */
  hashAlgo?: 'pbkdf2-sha256' | 'sha256';
  iterations?: number;
  /** Legacy sha256 hash that was never exposed (came from an access request); may be upgraded on login. */
  hashSafe?: boolean;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

interface AdminCloudState {
  version: number;
  updatedAt: number;
  accounts: StoredAccount[];
  deletedAccountIds: string[];
  revisions: any[];
  proposals: any[];
  /** Pending/decided access requests. Never sent to clients except to the Owner. */
  accountRequests: any[];
}

const DEFAULT_GIST_ID = 'c762dbc8bc8a824ecdf01d6000deef96';
const GIST_FILENAME = 'jy_admin_state.json';
const PBKDF2_ITERATIONS = 310000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 3_500_000;
const MAX_PAYLOAD_JSON = 40_000;
const PROPOSAL_LABELS = ['vorschlag', 'übernommen', 'abgelehnt', 'gelöscht', 'status:accepted', 'status:deleted'];
const REQUESTABLE_ROLES: Role[] = ['editor', 'contributor', 'viewer'];

const SITE_URL = (process.env.SITE_URL || 'https://juju-hub.vercel.app').replace(/\/$/, '');

// ---------------------------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------------------------

function defaultPermissions(role: Role): Permissions {
  const none: Permissions = {
    canCreateDrafts: false,
    canPublishLive: false,
    canReviewProposals: false,
    canEditMinigames: false,
    canDeleteCatalogItems: false,
    canRollbackOwnChanges: false,
    canManageAccounts: false,
    canRollbackAllChanges: false,
    canManageSystemSettings: false,
  };
  if (role === 'owner') {
    return Object.fromEntries(Object.keys(none).map((k) => [k, true])) as unknown as Permissions;
  }
  if (role === 'editor') {
    return {
      ...none,
      canCreateDrafts: true,
      canPublishLive: true,
      canReviewProposals: true,
      canEditMinigames: true,
      canRollbackOwnChanges: true,
    };
  }
  if (role === 'contributor') {
    return { ...none, canCreateDrafts: true, canRollbackOwnChanges: true };
  }
  return none;
}

/** Non-owners can never hold the three fundamental permissions, whatever is stored. */
function maskPermissions(role: Role, custom: Partial<Permissions> | undefined): Permissions {
  if (role === 'owner') return defaultPermissions('owner');
  const base = custom || defaultPermissions(role);
  return {
    canCreateDrafts: Boolean(base.canCreateDrafts),
    canPublishLive: Boolean(base.canPublishLive),
    canReviewProposals: Boolean(base.canReviewProposals),
    canEditMinigames: Boolean(base.canEditMinigames),
    canDeleteCatalogItems: Boolean(base.canDeleteCatalogItems),
    canRollbackOwnChanges: Boolean(base.canRollbackOwnChanges),
    canManageAccounts: false,
    canRollbackAllChanges: false,
    canManageSystemSettings: false,
  };
}

function ownerUsername(): string {
  return (process.env.OWNER_USERNAME || '').trim().toLowerCase();
}

/** Owner status comes only from OWNER_USERNAME; a stored role of 'owner' on any other account is demoted. */
function normalizeAccount(raw: any): StoredAccount | null {
  if (!raw || typeof raw !== 'object' || !raw.id || !raw.username) return null;
  const username = String(raw.username).trim().toLowerCase();
  const owner = ownerUsername();
  const isOwner = Boolean(owner) && username === owner;
  const storedRole: Role = ['editor', 'contributor', 'viewer'].includes(raw.role) ? raw.role : 'editor';
  const role: Role = isOwner ? 'owner' : storedRole;
  return {
    id: String(raw.id),
    username,
    displayName: String(raw.displayName || username).trim().slice(0, 80),
    role,
    status: isOwner ? 'active' : raw.status === 'suspended' ? 'suspended' : 'active',
    isPrimaryOwner: isOwner,
    permissions: maskPermissions(role, raw.permissions),
    salt: String(raw.salt || ''),
    passwordHash: String(raw.passwordHash || ''),
    hashAlgo: raw.hashAlgo === 'pbkdf2-sha256' || raw.hashAlgo === 'sha256' ? raw.hashAlgo : undefined,
    iterations: typeof raw.iterations === 'number' ? raw.iterations : undefined,
    hashSafe: raw.hashSafe === true ? true : undefined,
    createdAt: Number(raw.createdAt) || Date.now(),
    updatedAt: Number(raw.updatedAt || raw.createdAt) || Date.now(),
    lastLoginAt: raw.lastLoginAt ? Number(raw.lastLoginAt) : undefined,
  };
}

/** What clients may see about an account: never salt, hash or hash metadata. */
function publicAccount(acc: StoredAccount) {
  return {
    id: acc.id,
    username: acc.username,
    displayName: acc.displayName,
    role: acc.role,
    status: acc.status,
    isPrimaryOwner: acc.isPrimaryOwner,
    permissions: acc.permissions,
    createdAt: acc.createdAt,
    updatedAt: acc.updatedAt,
    lastLoginAt: acc.lastLoginAt,
    passwordResetRequired: !hasUsablePassword(acc),
  };
}

// ---------------------------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------------------------

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function pbkdf2Hex(password: string, salt: string, iterations: number): string {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
}

function newPasswordFields(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    salt,
    passwordHash: pbkdf2Hex(password, salt, PBKDF2_ITERATIONS),
    hashAlgo: 'pbkdf2-sha256' as const,
    iterations: PBKDF2_ITERATIONS,
    hashSafe: undefined,
  };
}

function hasUsablePassword(acc: StoredAccount): boolean {
  return acc.hashAlgo === 'pbkdf2-sha256' || (acc.hashAlgo === 'sha256' && acc.hashSafe === true);
}

/** ok: password correct and usable. resetRequired: legacy hash that was publicly exposed. */
function checkPassword(acc: StoredAccount, password: string): { ok: boolean; upgrade: boolean; resetRequired: boolean } {
  if (!acc.salt || !acc.passwordHash || !password) return { ok: false, upgrade: false, resetRequired: false };
  if (acc.hashAlgo === 'pbkdf2-sha256') {
    const ok = timingSafeEqualStr(pbkdf2Hex(password, acc.salt, acc.iterations || PBKDF2_ITERATIONS), acc.passwordHash);
    return { ok, upgrade: false, resetRequired: false };
  }
  const legacy = crypto.createHash('sha256').update(`${acc.salt}:${password}`).digest('hex');
  const matches = timingSafeEqualStr(legacy, acc.passwordHash);
  if (acc.hashAlgo === 'sha256' && acc.hashSafe) return { ok: matches, upgrade: matches, resetRequired: false };
  return { ok: false, upgrade: false, resetRequired: matches };
}

function validPassword(pw: unknown): pw is string {
  return typeof pw === 'string' && pw.length >= 8 && pw.length <= 200;
}

// ---------------------------------------------------------------------------------------------
// Sessions (HMAC-signed, stateless; re-validated against stored account on every request)
// ---------------------------------------------------------------------------------------------

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || '';
  return s.length >= 32 ? s : '';
}

/** Changes whenever the password changes, so old sessions die with a reset. */
function passwordVersion(acc: StoredAccount): string {
  return crypto.createHash('sha256').update(`${acc.salt}:${acc.passwordHash}`).digest('hex').slice(0, 16);
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function signSession(acc: StoredAccount): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = b64url(JSON.stringify({ sub: acc.id, pv: passwordVersion(acc), exp: expiresAt }));
  const sig = b64url(crypto.createHmac('sha256', sessionSecret()).update(payload).digest());
  return { token: `${payload}.${sig}`, expiresAt };
}

function readSession(token: string, state: AdminCloudState): StoredAccount | null {
  const secret = sessionSecret();
  if (!secret || !token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = b64url(crypto.createHmac('sha256', secret).update(payload).digest());
  if (!timingSafeEqualStr(sig, expected)) return null;
  let data: { sub?: string; pv?: string; exp?: number };
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!data.sub || !data.exp || data.exp < Date.now()) return null;
  const acc = state.accounts.find((a) => a.id === data.sub);
  if (!acc || acc.status !== 'active' || !hasUsablePassword(acc)) return null;
  if (data.pv !== passwordVersion(acc)) return null;
  return acc;
}

// ---------------------------------------------------------------------------------------------
// Rate limiting (per instance; PBKDF2 cost and the failure delay add a global floor)
// ---------------------------------------------------------------------------------------------

const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

const failDelay = () => new Promise((r) => setTimeout(r, 600));

// ---------------------------------------------------------------------------------------------
// State storage (encrypted Gist)
// ---------------------------------------------------------------------------------------------

function stateKeys(): string[] {
  return [process.env.ADMIN_STATE_KEY, process.env.GITHUB_TOKEN].filter((k): k is string => Boolean(k));
}

function encryptState(state: AdminCloudState): string {
  const key = crypto.createHash('sha256').update(stateKeys()[0]).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), 'utf8'), cipher.final()]);
  return JSON.stringify({
    encrypted: true,
    v: 1,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
    data: encrypted.toString('base64'),
  });
}

function emptyState(): AdminCloudState {
  return { version: 1, updatedAt: 0, accounts: [], deletedAccountIds: [], revisions: [], proposals: [], accountRequests: [] };
}

function normalizeState(raw: any): AdminCloudState {
  const deleted = new Set<string>(Array.isArray(raw?.deletedAccountIds) ? raw.deletedAccountIds : []);
  const byUser = new Map<string, StoredAccount>();
  for (const a of Array.isArray(raw?.accounts) ? raw.accounts : []) {
    const acc = normalizeAccount(a);
    if (!acc || deleted.has(acc.id)) continue;
    const existing = byUser.get(acc.username);
    if (!existing || acc.updatedAt > existing.updatedAt) byUser.set(acc.username, acc);
  }
  return {
    version: 1,
    updatedAt: Number(raw?.updatedAt) || 0,
    accounts: Array.from(byUser.values()).sort((a, b) =>
      a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : a.createdAt - b.createdAt
    ),
    deletedAccountIds: Array.from(deleted),
    revisions: Array.isArray(raw?.revisions) ? raw.revisions : [],
    proposals: Array.isArray(raw?.proposals) ? raw.proposals : [],
    accountRequests: Array.isArray(raw?.accountRequests) ? raw.accountRequests : [],
  };
}

/**
 * Throws when the content exists but cannot be decrypted. The old code returned an empty state
 * here, and the next write would then have overwritten every account in the Gist.
 */
function decryptState(rawContent: string): AdminCloudState {
  if (!rawContent) return emptyState();
  const parsed = JSON.parse(rawContent);
  if (!(parsed && parsed.encrypted === true)) return normalizeState(parsed);
  for (const secret of stateKeys()) {
    try {
      const key = crypto.createHash('sha256').update(secret).digest();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'));
      const plain = Buffer.concat([decipher.update(Buffer.from(parsed.data, 'base64')), decipher.final()]).toString('utf8');
      return normalizeState(JSON.parse(plain));
    } catch {
      /* try next key */
    }
  }
  throw new Error('state_undecryptable');
}

function fingerprint(s: AdminCloudState): string {
  return crypto.createHash('sha256').update(JSON.stringify({ ...s, updatedAt: 0 })).digest('hex');
}

let cache: { state: AdminCloudState; fp: string; at: number } | null = null;

function gistId(): string {
  return process.env.ADMIN_STATE_GIST_ID || DEFAULT_GIST_ID;
}

function ghHeaders(): Record<string, string> {
  return {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'JY-Hub-Admin',
    'Content-Type': 'application/json',
  };
}

async function loadState(): Promise<AdminCloudState> {
  if (cache && Date.now() - cache.at < 15000) return structuredClone(cache.state);
  let content: string | null = null;
  // CDN read first: it does not count against the GitHub REST rate limit.
  try {
    const owner = process.env.ADMIN_STATE_GIST_OWNER || 'nurimodabber';
    const raw = await fetch(`https://gist.githubusercontent.com/${owner}/${gistId()}/raw/${GIST_FILENAME}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (raw.ok) content = await raw.text();
  } catch {
    /* fall back to REST */
  }
  if (!content) {
    const res = await fetch(`https://api.github.com/gists/${gistId()}`, { headers: ghHeaders() });
    if (!res.ok) throw new Error(`gist_read_${res.status}`);
    const data: any = await res.json();
    content = data?.files?.[GIST_FILENAME]?.content || '';
  }
  const state = decryptState(content || '');
  cache = { state, fp: fingerprint(state), at: Date.now() };
  return structuredClone(state);
}

/** Throws on failure: callers report it instead of pretending a password change was saved. */
async function saveState(state: AdminCloudState): Promise<void> {
  const fp = fingerprint(state);
  if (cache && cache.fp === fp) return;
  state.updatedAt = Date.now();
  const res = await fetch(`https://api.github.com/gists/${gistId()}`, {
    method: 'PATCH',
    headers: ghHeaders(),
    body: JSON.stringify({ files: { [GIST_FILENAME]: { content: encryptState(state) } } }),
  });
  if (!res.ok) throw new Error(`gist_write_${res.status}`);
  cache = { state: structuredClone(state), fp, at: Date.now() };
}

// ---------------------------------------------------------------------------------------------
// Revisions & proposals (append-only log; authorship is stamped server-side)
// ---------------------------------------------------------------------------------------------

function canEditCatalog(p: Permissions): boolean {
  return p.canCreateDrafts || p.canPublishLive || p.canEditMinigames || p.canDeleteCatalogItems;
}

function mergeRevisions(remote: any[], incoming: unknown, actor: StoredAccount): any[] {
  const map = new Map<string, any>();
  for (const r of remote) if (r?.revisionId) map.set(r.revisionId, r);
  const list = Array.isArray(incoming) ? incoming : [];
  for (const rev of list) {
    if (!rev || typeof rev !== 'object' || typeof rev.revisionId !== 'string') continue;
    const existing = map.get(rev.revisionId);
    if (!existing) {
      if (!canEditCatalog(actor.permissions)) continue;
      map.set(rev.revisionId, {
        ...rev,
        timestamp: Number(rev.timestamp) || Date.now(),
        author: actor.displayName,
        authorId: actor.id,
        authorUsername: actor.username,
      });
      continue;
    }
    // Existing entries are immutable except for being marked as undone, which needs rollback rights.
    if (rev.undoneByRevisionId && !existing.undoneByRevisionId) {
      const own = existing.authorId === actor.id;
      if (actor.permissions.canRollbackAllChanges || (own && actor.permissions.canRollbackOwnChanges)) {
        map.set(rev.revisionId, { ...existing, undoneByRevisionId: String(rev.undoneByRevisionId) });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 500);
}

function mergeProposals(remote: any[], incoming: unknown, actor: StoredAccount): any[] {
  const map = new Map<string, any>();
  for (const p of remote) if (p?.id) map.set(p.id, p);
  if (actor.permissions.canReviewProposals || actor.permissions.canCreateDrafts) {
    for (const prop of Array.isArray(incoming) ? incoming : []) {
      if (!prop || typeof prop !== 'object' || typeof prop.id !== 'string') continue;
      const existing = map.get(prop.id);
      if (existing && !actor.permissions.canReviewProposals) continue;
      const existingTime = existing ? existing.updatedAt || existing.createdAt || 0 : -1;
      const incomingTime = prop.updatedAt || prop.createdAt || 0;
      if (!existing || incomingTime >= existingTime) map.set(prop.id, { ...(existing || {}), ...prop });
    }
  }
  return Array.from(map.values())
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 300);
}

/** Submitter emails are only for reviewers. */
function proposalsFor(actor: StoredAccount, proposals: any[]): any[] {
  if (actor.permissions.canReviewProposals) return proposals;
  return proposals.map(({ authorEmail: _omit, ...rest }) => rest);
}

// ---------------------------------------------------------------------------------------------
// Contact data embedded (encrypted) by /api/submit into the public issue
// ---------------------------------------------------------------------------------------------

function decryptContact(body: string): { name?: string; email?: string } | null {
  const m = /<!--\s*jy-contact:([A-Za-z0-9_\-.]+)\s*-->/.exec(body || '');
  if (!m) return null;
  const [iv, tag, data] = m[1].split('.');
  for (const secret of stateKeys()) {
    try {
      const key = crypto.createHash('sha256').update(secret).digest();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
      decipher.setAuthTag(Buffer.from(tag, 'base64url'));
      const plain = Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
      return JSON.parse(plain);
    } catch {
      /* next key */
    }
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Email (Resend)
// ---------------------------------------------------------------------------------------------

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendEmail(params: { to: string; subject: string; text: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.EMAIL_FROM || 'Junior Youth Hub <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [params.to], subject: params.subject, text: params.text, html: params.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const ROLE_LABELS_MAIL: Record<string, { de: string; en: string }> = {
  editor: { de: 'Redaktion', en: 'Editor' },
  contributor: { de: 'Mitarbeit (Entwürfe)', en: 'Contributor (drafts)' },
  viewer: { de: 'Nur Ansicht', en: 'View only' },
};

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
  return { subject: 'Dein Zugang ist freigegeben / Your access is approved – Junior Youth Hub', text, html };
}

// ---------------------------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------------------------

function sendJson(res: ServerResponse, status: number, payload: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

/** Browsers always send Origin on cross-site POSTs; same-origin requests from the admin UI pass. */
function isSameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function clientIp(req: IncomingMessage): string {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

async function readBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await new Promise<string>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY_BYTES) reject(new Error('too_large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
  return JSON.parse(raw || '{}');
}

function bearer(req: IncomingMessage): string {
  const h = String(req.headers.authorization || '');
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

// ---------------------------------------------------------------------------------------------
// Public GET: approved community content for every visitor
// ---------------------------------------------------------------------------------------------

async function handleGet(res: ServerResponse): Promise<void> {
  const repo = process.env.GITHUB_REPO || 'nurimodabber/jy-resource-hub';
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'JY-Hub-Sync-Worker' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  const empty = { approvedGames: [], approvedCategories: [], approvedServiceProjects: [], approvedArtsPrompts: [], deletedIds: [] };
  try {
    const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100`, { headers });
    if (!ghRes.ok) return sendJson(res, 200, { ok: false, error: 'upstream', ...empty });
    const issues: any[] = await ghRes.json();
    if (!Array.isArray(issues)) return sendJson(res, 200, { ok: true, ...empty });

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
      let parsedDraft: any = null;
      const match = typeof issue.body === 'string' ? issue.body.match(/```json\s*([\s\S]*?)\s*```/) : null;
      if (match?.[1]) {
        try {
          parsedDraft = JSON.parse(match[1]);
        } catch {
          /* ignore */
        }
      }
      if (parsedDraft && typeof parsedDraft === 'object') {
        // Older submissions put contact details into the draft; never serve them publicly.
        delete parsedDraft.authorEmail;
        delete parsedDraft.email;
      }

      if (isDeleted) {
        if (parsedDraft?.id) deletedIds.push(parsedDraft.id);
        deletedIds.push(`gh_issue_${issue.number}`, `gh_game_${issue.number}`, `gh_service_${issue.number}`, `gh_art_${issue.number}`);
      } else if (isApproved && parsedDraft) {
        const isService = labelNames.includes('dienst') || parsedDraft.kind === 'dienst';
        const isArt = labelNames.includes('kunst') || parsedDraft.kind === 'kunst' || Boolean(parsedDraft.artForm);
        const isEmpireCat = Boolean(parsedDraft.prompt && parsedDraft.hint);
        const submittedBy = parsedDraft.submittedBy || issue.user?.login || 'Community';
        if (isEmpireCat) {
          approvedCats.push({ ...parsedDraft, id: parsedDraft.id || `proposal_${issue.number}`, status: 'draft' });
        } else if (isService) {
          approvedServiceProjects.push({ ...parsedDraft, id: parsedDraft.id || `gh_service_${issue.number}`, kind: 'dienst', status: 'draft', submittedBy });
        } else if (isArt) {
          approvedArtsPrompts.push({ ...parsedDraft, id: parsedDraft.id || `gh_art_${issue.number}`, kind: 'kunst', status: 'draft', submittedBy });
        } else {
          approvedGames.push({ ...parsedDraft, id: parsedDraft.id || `proposal_game_${issue.number}`, status: 'draft', submittedBy });
        }
      }
    }
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    sendJson(res, 200, { ok: true, approvedGames, approvedCategories: approvedCats, approvedServiceProjects, approvedArtsPrompts, deletedIds });
  } catch {
    sendJson(res, 200, { ok: false, error: 'unavailable', ...empty });
  }
}

// ---------------------------------------------------------------------------------------------
// POST actions
// ---------------------------------------------------------------------------------------------

type Ctx = { req: IncomingMessage; res: ServerResponse; body: any };

const deny = (res: ServerResponse, status = 403, code = 'forbidden') => sendJson(res, status, { ok: false, code });

async function requireSession(ctx: Ctx): Promise<{ state: AdminCloudState; actor: StoredAccount } | null> {
  const state = await loadState();
  const actor = readSession(bearer(ctx.req), state);
  if (!actor) {
    sendJson(ctx.res, 401, { ok: false, code: 'unauthorized' });
    return null;
  }
  return { state, actor };
}

async function actionLogin({ req, res, body }: Ctx) {
  const username = String(body.username || '').trim().toLowerCase().slice(0, 120);
  const password = String(body.password || '');
  if (rateLimited(`login:${clientIp(req)}`, 10, 15 * 60_000) || rateLimited(`login-user:${username}`, 10, 15 * 60_000)) {
    return sendJson(res, 429, { ok: false, code: 'rate_limited' });
  }
  const state = await loadState();
  const acc = state.accounts.find((a) => a.username === username);
  if (!acc) {
    // Spend comparable time so response timing does not reveal which usernames exist.
    pbkdf2Hex(password || 'x', 'timing-equaliser', PBKDF2_ITERATIONS);
    await failDelay();
    return sendJson(res, 200, { ok: false, code: 'invalid' });
  }
  const check = checkPassword(acc, password);
  if (check.resetRequired) return sendJson(res, 200, { ok: false, code: 'reset_required' });
  if (!check.ok) {
    await failDelay();
    return sendJson(res, 200, { ok: false, code: 'invalid' });
  }
  if (acc.status !== 'active') return sendJson(res, 200, { ok: false, code: 'suspended' });
  if (check.upgrade) Object.assign(acc, newPasswordFields(password), { updatedAt: Date.now() });
  acc.lastLoginAt = Date.now();
  if (check.upgrade) await saveState(state);
  const session = signSession(acc);
  sendJson(res, 200, { ok: true, ...session, account: publicAccount(acc) });
}

/** One-time Owner setup/recovery: needs ADMIN_SETUP_TOKEN (remove it from Vercel afterwards). */
async function actionSetupOwner({ req, res, body }: Ctx) {
  const setupToken = process.env.ADMIN_SETUP_TOKEN || '';
  const owner = ownerUsername();
  if (rateLimited(`setup:${clientIp(req)}`, 5, 60 * 60_000)) return sendJson(res, 429, { ok: false, code: 'rate_limited' });
  if (setupToken.length < 16 || !owner) return sendJson(res, 200, { ok: false, code: 'setup_disabled' });
  const username = String(body.username || '').trim().toLowerCase();
  if (!timingSafeEqualStr(String(body.setupToken || ''), setupToken) || username !== owner) {
    await failDelay();
    return sendJson(res, 200, { ok: false, code: 'invalid' });
  }
  if (!validPassword(body.password)) return sendJson(res, 200, { ok: false, code: 'weak_password' });
  const state = await loadState();
  const now = Date.now();
  let acc = state.accounts.find((a) => a.username === owner);
  if (!acc) {
    acc = normalizeAccount({ id: `acc_${now.toString(36)}_${crypto.randomBytes(3).toString('hex')}`, username: owner, createdAt: now })!;
    state.accounts.unshift(acc);
  }
  Object.assign(acc, newPasswordFields(body.password), {
    displayName: String(body.displayName || acc.displayName || owner).trim().slice(0, 80),
    status: 'active',
    updatedAt: now,
    lastLoginAt: now,
  });
  await saveState(state);
  sendJson(res, 200, { ok: true, ...signSession(acc), account: publicAccount(acc) });
}

async function actionSession(ctx: Ctx) {
  const s = await requireSession(ctx);
  if (!s) return;
  sendJson(ctx.res, 200, { ok: true, account: publicAccount(s.actor) });
}

async function actionSyncState(ctx: Ctx) {
  const s = await requireSession(ctx);
  if (!s) return;
  const { state, actor } = s;
  state.revisions = mergeRevisions(state.revisions, ctx.body.revisions, actor);
  state.proposals = mergeProposals(state.proposals, ctx.body.proposals, actor);
  await saveState(state);
  const isOwner = actor.role === 'owner';
  sendJson(ctx.res, 200, {
    ok: true,
    account: publicAccount(actor),
    state: {
      accounts: state.accounts.map(publicAccount),
      deletedAccountIds: state.deletedAccountIds,
      revisions: state.revisions,
      proposals: proposalsFor(actor, state.proposals),
    },
    pendingRequestCount: isOwner ? state.accountRequests.filter((r) => r?.status === 'pending').length : 0,
  });
}

async function actionRequestAccount({ req, res, body }: Ctx) {
  if (rateLimited(`request:${clientIp(req)}`, 5, 60 * 60_000)) return sendJson(res, 429, { ok: false, code: 'limit' });
  const displayName = String(body.displayName || '').trim().slice(0, 80);
  const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
  const message = String(body.message || '').trim().slice(0, 400);
  if (displayName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return sendJson(res, 400, { ok: false, code: 'invalid' });
  if (!validPassword(body.password)) return sendJson(res, 400, { ok: false, code: 'weak_password' });
  if (email === ownerUsername()) return sendJson(res, 400, { ok: false, code: 'reserved' });

  const state = await loadState();
  if (state.accounts.some((a) => a.username === email)) return sendJson(res, 200, { ok: false, code: 'exists' });
  const pending = state.accountRequests.filter((r) => r?.status === 'pending');
  if (pending.some((r) => r.email === email)) return sendJson(res, 200, { ok: false, code: 'pending' });
  if (pending.length >= 50) return sendJson(res, 429, { ok: false, code: 'limit' });

  const pw = newPasswordFields(body.password);
  state.accountRequests = [
    ...state.accountRequests,
    {
      id: `req_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
      displayName,
      email,
      message,
      salt: pw.salt,
      passwordHash: pw.passwordHash,
      hashAlgo: pw.hashAlgo,
      iterations: pw.iterations,
      status: 'pending',
      createdAt: Date.now(),
    },
  ].slice(-200);
  await saveState(state);

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
}

async function requireOwner(ctx: Ctx) {
  const s = await requireSession(ctx);
  if (!s) return null;
  if (s.actor.role !== 'owner') {
    deny(ctx.res);
    return null;
  }
  return s;
}

async function actionListRequests(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const requests = s.state.accountRequests
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
  sendJson(ctx.res, 200, { ok: true, requests });
}

async function actionDecideRequest(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const { state } = s;
  const target = state.accountRequests.find((r) => r.id === ctx.body.requestId);
  if (!target || target.status !== 'pending') return sendJson(ctx.res, 200, { ok: false, code: 'not_found' });
  const now = Date.now();
  if (ctx.body.decision === 'reject') {
    Object.assign(target, { status: 'rejected', decidedAt: now });
    delete target.salt;
    delete target.passwordHash;
    await saveState(state);
    return sendJson(ctx.res, 200, { ok: true, decision: 'reject' });
  }
  if (target.email === ownerUsername()) return sendJson(ctx.res, 200, { ok: false, code: 'reserved' });
  if (state.accounts.some((a) => a.username === target.email)) return sendJson(ctx.res, 200, { ok: false, code: 'exists' });
  const role: Role = REQUESTABLE_ROLES.includes(ctx.body.role) ? ctx.body.role : 'contributor';
  // Requests made before the hardening carry a client-side sha256 hash. Those were never exposed
  // (requests were never sent to clients), so they stay usable and are upgraded at first login.
  const pbkdf2 = target.hashAlgo === 'pbkdf2-sha256';
  const account = normalizeAccount({
    id: `acc_${now.toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
    username: target.email,
    displayName: target.displayName,
    role,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })!;
  Object.assign(account, {
    salt: target.salt,
    passwordHash: target.passwordHash,
    hashAlgo: pbkdf2 ? 'pbkdf2-sha256' : 'sha256',
    iterations: pbkdf2 ? target.iterations : undefined,
    hashSafe: pbkdf2 ? undefined : true,
  });
  state.accounts.push(account);
  Object.assign(target, { status: 'approved', decidedAt: now, decidedRole: role });
  delete target.salt;
  delete target.passwordHash;
  await saveState(state);
  const emailSent = await sendEmail({ to: target.email, ...buildApprovalEmail(target.displayName, target.email, role) });
  sendJson(ctx.res, 200, { ok: true, decision: 'approve', emailSent });
}

async function actionCreateAccount(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const { state } = s;
  const username = String(ctx.body.username || '').trim().toLowerCase().slice(0, 120);
  const displayName = String(ctx.body.displayName || '').trim().slice(0, 80);
  if (username.length < 3 || displayName.length < 2) return sendJson(ctx.res, 200, { ok: false, code: 'invalid' });
  if (!validPassword(ctx.body.password)) return sendJson(ctx.res, 200, { ok: false, code: 'weak_password' });
  if (username === ownerUsername()) return sendJson(ctx.res, 200, { ok: false, code: 'reserved' });
  if (state.accounts.some((a) => a.username === username || a.displayName.toLowerCase() === displayName.toLowerCase())) {
    return sendJson(ctx.res, 200, { ok: false, code: 'exists' });
  }
  const role: Role = REQUESTABLE_ROLES.includes(ctx.body.role) ? ctx.body.role : 'editor';
  const now = Date.now();
  const account = normalizeAccount({
    id: `acc_${now.toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
    username,
    displayName,
    role,
    permissions: ctx.body.permissions ? { ...defaultPermissions(role), ...ctx.body.permissions } : undefined,
    createdAt: now,
    updatedAt: now,
  })!;
  Object.assign(account, newPasswordFields(ctx.body.password));
  state.accounts.push(account);
  await saveState(state);
  sendJson(ctx.res, 200, { ok: true, account: publicAccount(account) });
}

async function actionUpdateAccount(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const { state } = s;
  const target = state.accounts.find((a) => a.id === ctx.body.targetAccountId);
  if (!target) return sendJson(ctx.res, 200, { ok: false, code: 'not_found' });
  if (target.role === 'owner') return sendJson(ctx.res, 200, { ok: false, code: 'owner_locked' });
  const role: Role = REQUESTABLE_ROLES.includes(ctx.body.role) ? ctx.body.role : target.role;
  const basePerms = ctx.body.role && ctx.body.role !== target.role && !ctx.body.permissions ? defaultPermissions(role) : target.permissions;
  target.role = role;
  if (ctx.body.status === 'active' || ctx.body.status === 'suspended') target.status = ctx.body.status;
  target.permissions = maskPermissions(role, { ...basePerms, ...(ctx.body.permissions || {}) });
  if (typeof ctx.body.displayName === 'string' && ctx.body.displayName.trim().length >= 2) {
    target.displayName = ctx.body.displayName.trim().slice(0, 80);
  }
  target.updatedAt = Date.now();
  await saveState(state);
  sendJson(ctx.res, 200, { ok: true, account: publicAccount(target) });
}

async function actionResetPassword(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const target = s.state.accounts.find((a) => a.id === ctx.body.targetAccountId);
  if (!target) return sendJson(ctx.res, 200, { ok: false, code: 'not_found' });
  if (!validPassword(ctx.body.newPassword)) return sendJson(ctx.res, 200, { ok: false, code: 'weak_password' });
  Object.assign(target, newPasswordFields(ctx.body.newPassword), { updatedAt: Date.now() });
  await saveState(s.state);
  sendJson(ctx.res, 200, { ok: true });
}

async function actionDeleteAccount(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const { state, actor } = s;
  const target = state.accounts.find((a) => a.id === ctx.body.targetAccountId);
  if (!target) return sendJson(ctx.res, 200, { ok: false, code: 'not_found' });
  if (target.role === 'owner' || target.id === actor.id) return sendJson(ctx.res, 200, { ok: false, code: 'owner_locked' });
  state.accounts = state.accounts.filter((a) => a.id !== target.id);
  state.deletedAccountIds = Array.from(new Set([...state.deletedAccountIds, target.id]));
  await saveState(state);
  sendJson(ctx.res, 200, { ok: true });
}

async function actionChangePassword(ctx: Ctx) {
  const s = await requireSession(ctx);
  if (!s) return;
  const { state, actor } = s;
  if (rateLimited(`pwchange:${actor.id}`, 10, 15 * 60_000)) return sendJson(ctx.res, 429, { ok: false, code: 'rate_limited' });
  if (!checkPassword(actor, String(ctx.body.currentPassword || '')).ok) {
    await failDelay();
    return sendJson(ctx.res, 200, { ok: false, code: 'invalid' });
  }
  if (!validPassword(ctx.body.newPassword)) return sendJson(ctx.res, 200, { ok: false, code: 'weak_password' });
  Object.assign(actor, newPasswordFields(ctx.body.newPassword), { updatedAt: Date.now() });
  await saveState(state);
  // The old token is now invalid (password version changed); hand out a fresh one.
  sendJson(ctx.res, 200, { ok: true, ...signSession(actor), account: publicAccount(actor) });
}

async function actionListProposals(ctx: Ctx) {
  const s = await requireSession(ctx);
  if (!s) return;
  if (!s.actor.permissions.canReviewProposals) return deny(ctx.res);
  const repo = process.env.GITHUB_REPO || 'nurimodabber/jy-resource-hub';
  const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=50`, { headers: ghHeaders() });
  if (!ghRes.ok) return sendJson(ctx.res, 200, { ok: false, code: 'upstream', status: ghRes.status });
  const list: any[] = await ghRes.json();
  const issues = (Array.isArray(list) ? list : [])
    .filter((i) => !i.pull_request)
    .map((i) => {
      const contact = decryptContact(i.body || '');
      return {
        number: i.number,
        title: i.title,
        body: String(i.body || '').replace(/<!--\s*jy-contact:[^>]*-->/g, ''),
        labels: (i.labels || []).map((l: any) => ({ name: l.name })),
        created_at: i.created_at,
        html_url: i.html_url,
        user: i.user ? { login: i.user.login, avatar_url: i.user.avatar_url, html_url: i.user.html_url } : undefined,
        contactName: contact?.name,
        contactEmail: contact?.email,
      };
    });
  sendJson(ctx.res, 200, { ok: true, issues });
}

async function actionIssue(ctx: Ctx) {
  const s = await requireSession(ctx);
  if (!s) return;
  const { actor } = s;
  const { action, reason, updatedPayload } = ctx.body;
  const issueNumber = Number(ctx.body.issueNumber);
  if (!Number.isInteger(issueNumber) || issueNumber <= 0) return sendJson(ctx.res, 400, { ok: false, code: 'invalid' });

  const p = actor.permissions;
  const allowed =
    action === 'accept'
      ? p.canReviewProposals || p.canPublishLive
      : action === 'reject'
        ? p.canReviewProposals
        : action === 'delete'
          ? p.canDeleteCatalogItems
          : false;
  if (!allowed) return deny(ctx.res);
  if (updatedPayload !== undefined) {
    if (!updatedPayload || typeof updatedPayload !== 'object' || Array.isArray(updatedPayload)) {
      return sendJson(ctx.res, 400, { ok: false, code: 'invalid' });
    }
    if (JSON.stringify(updatedPayload).length > MAX_PAYLOAD_JSON) return sendJson(ctx.res, 413, { ok: false, code: 'too_large' });
  }

  const repo = process.env.GITHUB_REPO || 'nurimodabber/jy-resource-hub';
  const issueRes = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, { headers: ghHeaders() });
  if (!issueRes.ok) return sendJson(ctx.res, 200, { ok: false, code: 'not_found' });
  const current = await issueRes.json();
  const labels: string[] = (current.labels || []).map((l: any) => l.name);
  // Only community proposal issues may be touched; never arbitrary issues or pull requests.
  if (current.pull_request || !labels.some((l) => PROPOSAL_LABELS.includes(l))) return deny(ctx.res, 403, 'not_a_proposal');

  const newLabels = labels.filter((l) => !['vorschlag', 'status:accepted', 'übernommen', 'abgelehnt', 'gelöscht'].includes(l));
  let comment = '';
  if (action === 'accept') {
    newLabels.push('übernommen');
    comment = '✅ Dieser Eintrag wurde redaktionell geprüft und live im Katalog veröffentlicht.';
  } else if (action === 'reject') {
    newLabels.push('abgelehnt');
    const why = String(reason || 'Keine Begründung angegeben').slice(0, 500).replace(/@/g, '@\u200b');
    comment = `❌ Dieser Vorschlag wurde abgelehnt: ${why}`;
  } else {
    newLabels.push('gelöscht');
    comment = '🗑️ Dieser Eintrag wurde aus dem aktiven Katalog entfernt.';
  }

  const patch: Record<string, unknown> = { state: 'closed', labels: newLabels };
  if (updatedPayload) {
    const clean = { ...updatedPayload } as Record<string, unknown>;
    delete clean.authorEmail;
    delete clean.email;
    const block = '```json\n' + JSON.stringify(clean, null, 2) + '\n```';
    const existing = typeof current.body === 'string' ? current.body : '';
    patch.body = /```json[\s\S]*?```/.test(existing)
      ? existing.replace(/```json[\s\S]*?```/, block)
      : `${existing}\n\n### Redaktioneller Datensatz\n${block}`.trim();
  }
  const patchRes = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    headers: ghHeaders(),
    body: JSON.stringify(patch),
  });
  if (!patchRes.ok) return sendJson(ctx.res, 200, { ok: false, code: 'upstream' });
  await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ body: comment }),
  });
  sendJson(ctx.res, 200, { ok: true, status: action, issueNumber });
}

/** Owner-only system status; reports which pieces are configured without revealing values. */
async function actionSystemStatus(ctx: Ctx) {
  const s = await requireOwner(ctx);
  if (!s) return;
  const repo = process.env.GITHUB_REPO || 'nurimodabber/jy-resource-hub';
  let repoOk = false;
  let canWrite = false;
  let rateRemaining: number | null = null;
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders() });
    repoOk = r.ok;
    rateRemaining = Number(r.headers.get('x-ratelimit-remaining')) || null;
    if (r.ok) canWrite = Boolean((await r.json())?.permissions?.push);
  } catch {
    /* report as not ok */
  }
  sendJson(ctx.res, 200, {
    ok: true,
    status: {
      repo,
      repoOk,
      canWrite,
      rateRemaining,
      ownerConfigured: Boolean(ownerUsername()),
      sessionSecretConfigured: Boolean(sessionSecret()),
      separateStateKey: Boolean(process.env.ADMIN_STATE_KEY),
      setupTokenActive: (process.env.ADMIN_SETUP_TOKEN || '').length >= 16,
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
    },
  });
}

const ACTIONS: Record<string, (ctx: Ctx) => Promise<void>> = {
  login: actionLogin,
  setup_owner: actionSetupOwner,
  session: actionSession,
  sync_admin_state: actionSyncState,
  request_account: actionRequestAccount,
  list_account_requests: actionListRequests,
  decide_account_request: actionDecideRequest,
  create_account: actionCreateAccount,
  update_account: actionUpdateAccount,
  reset_password: actionResetPassword,
  delete_account: actionDeleteAccount,
  change_password: actionChangePassword,
  list_proposals: actionListProposals,
  accept: actionIssue,
  reject: actionIssue,
  delete: actionIssue,
  system_status: actionSystemStatus,
};

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse): Promise<void> {
  // Same-origin only: no CORS headers. The admin UI is served from this domain.
  if (req.method === 'GET') return handleGet(res);
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST');
    res.end();
    return;
  }
  if (!isSameOrigin(req)) return deny(res, 403, 'cross_origin');
  if (!process.env.GITHUB_TOKEN || !sessionSecret()) {
    // Fail closed: without a server token and session secret there is no safe admin backend.
    return sendJson(res, 503, { ok: false, code: 'not_configured' });
  }

  let body: any;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, code: 'bad_request' });
  }
  const run = body && typeof body.action === 'string' ? ACTIONS[body.action] : undefined;
  if (!run) return sendJson(res, 400, { ok: false, code: 'unknown_action' });

  try {
    await run({ req, res, body });
  } catch (err) {
    console.error('admin sync error', body.action, err instanceof Error ? err.message : err);
    if (!res.writableEnded) sendJson(res, 503, { ok: false, code: 'unavailable' });
  }
}
