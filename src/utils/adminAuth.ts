/**
 * Admin authentication client.
 *
 * The server (/api/sync) is the only authority for accounts, passwords and permissions. This module
 * only holds what the UI needs to render: the signed session token (sessionStorage, per tab), the
 * signed-in account and the team list the server returned. Permission checks here are for showing
 * or hiding UI; the server re-checks every action. Nothing secret is written to localStorage.
 */

export type AdminRole = 'owner' | 'editor' | 'contributor' | 'viewer';
export type AccountStatus = 'active' | 'suspended';

export interface AdminPermissions {
  canCreateDrafts: boolean;       // Create & edit backend drafts
  canPublishLive: boolean;        // Publish & edit items directly in the live catalog
  canReviewProposals: boolean;    // Accept or reject community proposals
  canEditMinigames: boolean;      // Edit Spy, WhoAmI, Empire, Psychiatrist packs
  canDeleteCatalogItems: boolean; // Remove/soft-delete items from the live catalog
  canRollbackOwnChanges: boolean; // Rollback own revisions
  // Fundamental permissions — strictly locked to 'owner' only:
  canManageAccounts: boolean;     // View/edit accounts, roles, permissions, status
  canRollbackAllChanges: boolean; // Undo/rollback ANY account's changes
  canManageSystemSettings: boolean; // System status, full backup import, system config
}

/** Account as the server exposes it: never contains a salt or password hash. */
export interface AdminAccount {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  status?: AccountStatus;
  isPrimaryOwner?: boolean;
  permissions?: AdminPermissions;
  createdAt: number;
  updatedAt?: number;
  lastLoginAt?: number;
  passwordResetRequired?: boolean;
}

export interface AuthResult {
  ok: boolean;
  account?: AdminAccount;
  code?: string;
  errorDe?: string;
  errorEn?: string;
}

const SESSION_TOKEN_KEY = 'jy_admin_session_token';
const SESSION_ACCOUNT_KEY = 'jy_admin_session_account';

/**
 * Keys written by the old client-side auth. They held password hashes, a GitHub token and a
 * client-trusted session, so they are removed on load and excluded from backups.
 */
export const LEGACY_SENSITIVE_KEYS = [
  'jy_admin_accounts',
  'jy_admin_deleted_accounts',
  'jy_admin_github_token',
  'jy_admin_pin',
];

export function purgeLegacyAdminStorage(): void {
  try {
    LEGACY_SENSITIVE_KEYS.forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem('jy_admin_active_session');
    sessionStorage.removeItem('jy_admin_authenticated');
  } catch {
    /* storage unavailable */
  }
}

export function getDefaultPermissionsForRole(role: AdminRole): AdminPermissions {
  switch (role) {
    case 'owner':
      return {
        canCreateDrafts: true,
        canPublishLive: true,
        canReviewProposals: true,
        canEditMinigames: true,
        canDeleteCatalogItems: true,
        canRollbackOwnChanges: true,
        canManageAccounts: true,
        canRollbackAllChanges: true,
        canManageSystemSettings: true,
      };
    case 'editor':
      return {
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
    case 'contributor':
      return {
        canCreateDrafts: true,
        canPublishLive: false,
        canReviewProposals: false,
        canEditMinigames: false,
        canDeleteCatalogItems: false,
        canRollbackOwnChanges: true,
        canManageAccounts: false,
        canRollbackAllChanges: false,
        canManageSystemSettings: false,
      };
    case 'viewer':
      return {
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
  }
}

/** UI-side view of permissions. Mirrors the server's masking; the server stays authoritative. */
export function getEffectivePermissions(account: AdminAccount | null | undefined): AdminPermissions {
  if (!account || account.status === 'suspended') return getDefaultPermissionsForRole('viewer');
  if (account.role === 'owner') return getDefaultPermissionsForRole('owner');
  const custom = account.permissions || getDefaultPermissionsForRole(account.role);
  return {
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
}

// --- Session ------------------------------------------------------------------------------------

export function getSessionToken(): string {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function hasAdminSession(): boolean {
  return Boolean(getSessionToken());
}

export function getActiveSessionAccount(): AdminAccount | null {
  if (!getSessionToken()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as AdminAccount) : null;
  } catch {
    return null;
  }
}

function storeSession(token: string | null, account: AdminAccount | null): void {
  try {
    if (token && account) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_ACCOUNT_KEY, JSON.stringify(account));
      sessionStorage.setItem('jy_admin_author', account.displayName);
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_ACCOUNT_KEY);
    }
  } catch {
    /* storage unavailable: the session then lasts only for this page view */
  }
  window.dispatchEvent(new CustomEvent('jy_accounts_updated'));
}

/** Signs out locally (the server token simply expires). */
export function setActiveSessionAccount(account: AdminAccount | null): void {
  if (!account) {
    teamAccounts = [];
    storeSession(null, null);
    return;
  }
  const token = getSessionToken();
  if (token) storeSession(token, account);
}

// --- Team list (from the last authenticated sync) -------------------------------------------------

let teamAccounts: AdminAccount[] = [];

export function getAdminAccounts(): AdminAccount[] {
  return teamAccounts;
}

export function setAdminAccountsFromServer(accounts: AdminAccount[], self?: AdminAccount): void {
  teamAccounts = Array.isArray(accounts) ? accounts : [];
  if (self) setActiveSessionAccount(self);
  else window.dispatchEvent(new CustomEvent('jy_accounts_updated'));
}

// --- Server calls -------------------------------------------------------------------------------

export interface ApiResult {
  ok: boolean;
  code?: string;
  [key: string]: unknown;
}

/** POSTs an action to /api/sync with the session token. A 401 ends the local session. */
export async function adminApi<T extends ApiResult = ApiResult>(payload: Record<string, unknown>): Promise<T> {
  const token = getSessionToken();
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as T;
    if (res.status === 401 && token) storeSession(null, null);
    if (data && typeof data.ok === 'boolean') return data;
    return { ok: false, code: res.status === 503 ? 'not_configured' : 'network' } as T;
  } catch {
    return { ok: false, code: 'network' } as T;
  }
}

const MESSAGES: Record<string, [string, string]> = {
  invalid: ['Ungültiger Benutzername oder falsches Passwort.', 'Invalid username or password.'],
  reset_required: [
    'Dein Passwort muss aus Sicherheitsgründen neu gesetzt werden. Bitte den Inhaber, dir ein neues Passwort zu geben. Als Inhaber nutzt du „Inhaber-Einrichtung“.',
    'For security reasons your password must be reset. Ask the owner to set a new password for you. As the owner, use "Owner setup".',
  ],
  suspended: ['Dieser Account wurde vom Inhaber vorübergehend pausiert.', 'This account has been suspended by the owner.'],
  rate_limited: ['Zu viele Versuche. Bitte warte eine Viertelstunde.', 'Too many attempts. Please wait 15 minutes.'],
  weak_password: ['Das Passwort muss mindestens 8 Zeichen lang sein.', 'The password must be at least 8 characters long.'],
  exists: ['Ein Account mit diesem Namen oder dieser E-Mail-Adresse existiert bereits.', 'An account with this name or email already exists.'],
  reserved: ['Diese E-Mail-Adresse ist für den Inhaber reserviert.', 'This email address is reserved for the owner.'],
  not_found: ['Account nicht gefunden.', 'Account not found.'],
  owner_locked: ['Der Inhaber-Account kann so nicht geändert werden.', 'The owner account cannot be changed this way.'],
  forbidden: ['Dafür fehlt dir die Berechtigung.', 'You do not have permission for this.'],
  unauthorized: ['Deine Sitzung ist abgelaufen. Bitte melde dich neu an.', 'Your session has expired. Please sign in again.'],
  setup_disabled: [
    'Die Inhaber-Einrichtung ist nicht aktiv. Setze ADMIN_SETUP_TOKEN und OWNER_USERNAME in Vercel.',
    'Owner setup is not active. Set ADMIN_SETUP_TOKEN and OWNER_USERNAME in Vercel.',
  ],
  not_configured: [
    'Der Server ist noch nicht eingerichtet (GITHUB_TOKEN / ADMIN_SESSION_SECRET fehlen).',
    'The server is not set up yet (GITHUB_TOKEN / ADMIN_SESSION_SECRET missing).',
  ],
  network: ['Keine Verbindung zum Server.', 'No connection to the server.'],
};

export function describeAuthCode(code: string | undefined): { errorDe: string; errorEn: string } {
  const [de, en] = MESSAGES[code || ''] || ['Die Aktion ist fehlgeschlagen.', 'The action failed.'];
  return { errorDe: de, errorEn: en };
}

function fail(code: string | undefined): AuthResult {
  return { ok: false, code, ...describeAuthCode(code) };
}

type SessionResponse = ApiResult & { token?: string; account?: AdminAccount };

export async function verifyAdminLogin(username: string, password: string): Promise<AuthResult> {
  const res = await adminApi<SessionResponse>({ action: 'login', username: username.trim().toLowerCase(), password });
  if (!res.ok || !res.token || !res.account) return fail(res.code);
  storeSession(res.token, res.account);
  return { ok: true, account: res.account };
}

/** Owner setup/recovery with the temporary ADMIN_SETUP_TOKEN from the Vercel settings. */
export async function setupOwnerAccount(params: {
  setupToken: string;
  username: string;
  displayName: string;
  password: string;
}): Promise<AuthResult> {
  const res = await adminApi<SessionResponse>({ action: 'setup_owner', ...params, username: params.username.trim().toLowerCase() });
  if (!res.ok || !res.token || !res.account) return fail(res.code);
  storeSession(res.token, res.account);
  return { ok: true, account: res.account };
}

export async function createAdminAccount(params: {
  username: string;
  displayName: string;
  password: string;
  role?: AdminRole;
  permissions?: Partial<AdminPermissions>;
}): Promise<AuthResult> {
  const res = await adminApi<ApiResult & { account?: AdminAccount }>({ action: 'create_account', ...params });
  if (!res.ok || !res.account) return fail(res.code);
  teamAccounts = [...teamAccounts, res.account];
  return { ok: true, account: res.account };
}

export async function updateAdminAccountPermissions(params: {
  targetAccountId: string;
  role?: AdminRole;
  status?: AccountStatus;
  permissions?: Partial<AdminPermissions>;
  displayName?: string;
}): Promise<AuthResult> {
  const res = await adminApi<ApiResult & { account?: AdminAccount }>({ action: 'update_account', ...params });
  if (!res.ok || !res.account) return fail(res.code);
  const updated = res.account;
  teamAccounts = teamAccounts.map((a) => (a.id === updated.id ? updated : a));
  return { ok: true, account: updated };
}

export async function resetAdminAccountPasswordByOwner(targetAccountId: string, newPassword: string): Promise<AuthResult> {
  const res = await adminApi({ action: 'reset_password', targetAccountId, newPassword });
  return res.ok ? { ok: true } : fail(res.code);
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
  const res = await adminApi<SessionResponse>({ action: 'change_password', currentPassword, newPassword });
  if (!res.ok || !res.token || !res.account) return fail(res.code);
  // The old token died with the old password; keep working with the fresh one.
  storeSession(res.token, res.account);
  return { ok: true, account: res.account };
}

export async function deleteAdminAccount(targetAccountId: string): Promise<AuthResult> {
  const res = await adminApi({ action: 'delete_account', targetAccountId });
  if (!res.ok) return fail(res.code);
  teamAccounts = teamAccounts.filter((a) => a.id !== targetAccountId);
  return { ok: true };
}
