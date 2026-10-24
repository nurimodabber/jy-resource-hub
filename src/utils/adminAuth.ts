/**
 * Multi-Account Admin Authentication, RBAC Permissions & Password Hashing (Web Crypto SHA-256 + Salt)
 * Stores salted password hashes & granular permissions under `jy_admin_accounts`
 * (automatically backed up via `backup.ts` and synced across devices via `/api/sync`).
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
  canManageSystemSettings: boolean; // GitHub settings, full backup import, system config
}

export interface AdminAccount {
  id: string;
  username: string; // Email or username (stored lowercase for lookup)
  displayName: string; // Full name shown in sidebar & audit log
  role: AdminRole;
  status?: AccountStatus;
  isPrimaryOwner?: boolean;
  permissions?: AdminPermissions;
  salt: string;
  passwordHash: string;
  createdAt: number;
  updatedAt?: number;
  lastLoginAt?: number;
}

export const STORAGE_ACCOUNTS_KEY = 'jy_admin_accounts';
export const STORAGE_DELETED_ACCOUNTS_KEY = 'jy_admin_deleted_accounts';
export const SESSION_ACTIVE_ACCOUNT_KEY = 'jy_admin_active_session';

/**
 * Checks whether an account username or displayName belongs to the project owner (Nuri Modabber).
 */
export function isPrimaryOwnerIdentity(username: string, displayName = ''): boolean {
  const u = (username || '').trim().toLowerCase();
  const d = (displayName || '').trim().toLowerCase();
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
        canDeleteCatalogItems: false, // Cannot delete catalog items by default
        canRollbackOwnChanges: true,
        canManageAccounts: false,
        canRollbackAllChanges: false,
        canManageSystemSettings: false,
      };
    case 'contributor':
      return {
        canCreateDrafts: true,
        canPublishLive: false, // Can only save backend drafts, not publish live directly
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

export function getEffectivePermissions(account: AdminAccount | null | undefined): AdminPermissions {
  if (!account || account.status === 'suspended') {
    return getDefaultPermissionsForRole('viewer');
  }
  if (account.role === 'owner' || account.isPrimaryOwner) {
    return getDefaultPermissionsForRole('owner');
  }
  const defaults = getDefaultPermissionsForRole(account.role);
  const custom = account.permissions || defaults;
  return {
    canCreateDrafts: Boolean(custom.canCreateDrafts),
    canPublishLive: Boolean(custom.canPublishLive),
    canReviewProposals: Boolean(custom.canReviewProposals),
    canEditMinigames: Boolean(custom.canEditMinigames),
    canDeleteCatalogItems: Boolean(custom.canDeleteCatalogItems),
    canRollbackOwnChanges: Boolean(custom.canRollbackOwnChanges),
    // Non-owners can NEVER have fundamental system permissions
    canManageAccounts: false,
    canRollbackAllChanges: false,
    canManageSystemSettings: false,
  };
}

/**
 * Normalizes an account so that:
 * 1. Nuri's account is always enforced as 'owner' (isPrimaryOwner = true) with full permissions.
 * 2. Any other account that was accidentally created as 'owner' on a separate browser's initial setup
 *    is automatically normalized to 'editor' with safe non-fundamental permissions.
 */
export function normalizeAdminAccount(raw: AdminAccount): AdminAccount {
  const isOwnerMatch = Boolean(raw.isPrimaryOwner) || isPrimaryOwnerIdentity(raw.username, raw.displayName);
  const role: AdminRole = isOwnerMatch
    ? 'owner'
    : raw.role === 'owner'
      ? 'editor'
      : raw.role || 'editor';

  const status: AccountStatus = isOwnerMatch ? 'active' : raw.status === 'suspended' ? 'suspended' : 'active';
  const permissions = isOwnerMatch
    ? getDefaultPermissionsForRole('owner')
    : getEffectivePermissions({ ...raw, role, status, isPrimaryOwner: false });

  return {
    ...raw,
    username: (raw.username || '').trim().toLowerCase(),
    displayName: (raw.displayName || raw.username || 'Team').trim(),
    role,
    status,
    isPrimaryOwner: isOwnerMatch,
    permissions,
    createdAt: raw.createdAt || Date.now(),
    updatedAt: raw.updatedAt || raw.createdAt || Date.now(),
  };
}

export function generateRandomSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const input = `${salt}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback deterministic hash if SubtleCrypto is unavailable in non-secure context
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

export function getDeletedAccountIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDeletedAccountIds(ids: string[]): void {
  try {
    const unique = Array.from(new Set(ids));
    localStorage.setItem(STORAGE_DELETED_ACCOUNTS_KEY, JSON.stringify(unique));
  } catch {
    /* ignore */
  }
}

export function getAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const deletedSet = new Set(getDeletedAccountIds());
    return parsed
      .filter((a: AdminAccount) => a && a.id && !deletedSet.has(a.id))
      .map((a: AdminAccount) => normalizeAdminAccount(a));
  } catch {
    return [];
  }
}

export function saveAdminAccounts(accounts: AdminAccount[]): void {
  try {
    const normalized = accounts.map((a) => normalizeAdminAccount(a));
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(normalized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jy_accounts_updated'));
    }
  } catch {
    /* ignore */
  }
}

/**
 * Merges local and remote admin accounts by ID or username, respecting deletedAccountIds
 * and keeping the record with the newer `updatedAt` timestamp.
 */
export function mergeAdminAccounts(
  localAccounts: AdminAccount[],
  remoteAccounts: AdminAccount[],
  deletedIds: string[] = []
): AdminAccount[] {
  const deletedSet = new Set([...getDeletedAccountIds(), ...deletedIds]);
  const byUsername = new Map<string, AdminAccount>();

  const all = [...remoteAccounts, ...localAccounts];
  for (const raw of all) {
    if (!raw || !raw.username) continue;
    if (deletedSet.has(raw.id)) continue;
    const acc = normalizeAdminAccount(raw);
    const key = acc.username.toLowerCase();
    const existing = byUsername.get(key);
    if (!existing) {
      byUsername.set(key, acc);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const incomingTime = acc.updatedAt || acc.createdAt || 0;
      const winner = incomingTime >= existingTime ? acc : existing;
      const loser = incomingTime >= existingTime ? existing : acc;
      byUsername.set(key, {
        ...loser,
        ...winner,
        // Preserve owner status if either had primary owner
        isPrimaryOwner: Boolean(winner.isPrimaryOwner || loser.isPrimaryOwner),
        role: winner.isPrimaryOwner || loser.isPrimaryOwner ? 'owner' : winner.role,
        lastLoginAt: Math.max(winner.lastLoginAt || 0, loser.lastLoginAt || 0) || undefined,
      });
    }
  }

  return Array.from(byUsername.values())
    .map((a) => normalizeAdminAccount(a))
    .sort((a, b) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1;
      if (b.role === 'owner' && a.role !== 'owner') return 1;
      return a.createdAt - b.createdAt;
    });
}

export function hasAnyAdminAccount(): boolean {
  return getAdminAccounts().length > 0;
}

export async function createAdminAccount(params: {
  username: string;
  displayName: string;
  password: string;
  role?: AdminRole;
  permissions?: Partial<AdminPermissions>;
  forceOwner?: boolean;
}): Promise<{ ok: boolean; account?: AdminAccount; errorDe?: string; errorEn?: string }> {
  const cleanUsername = params.username.trim().toLowerCase();
  const cleanDisplayName = params.displayName.trim();
  const password = params.password;

  if (!cleanUsername || cleanUsername.length < 3) {
    return {
      ok: false,
      errorDe: 'Benutzername oder E-Mail muss mindestens 3 Zeichen lang sein.',
      errorEn: 'Username or email must be at least 3 characters.',
    };
  }
  if (!cleanDisplayName || cleanDisplayName.length < 2) {
    return {
      ok: false,
      errorDe: 'Bitte gib einen Anzeigenamen ein.',
      errorEn: 'Please enter a display name.',
    };
  }
  if (!password || password.length < 8) {
    return {
      ok: false,
      errorDe: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      errorEn: 'Password must be at least 8 characters long.',
    };
  }

  const accounts = getAdminAccounts();
  if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
    return {
      ok: false,
      errorDe: 'Ein Account mit diesem Benutzernamen oder dieser E-Mail existiert bereits.',
      errorEn: 'An account with this username or email already exists.',
    };
  }

  const salt = generateRandomSalt();
  const passwordHash = await hashPasswordWithSalt(password, salt);
  const isOwner = Boolean(params.forceOwner) || isPrimaryOwnerIdentity(cleanUsername, cleanDisplayName);
  const assignedRole: AdminRole = isOwner
    ? 'owner'
    : params.role && params.role !== 'owner'
      ? params.role
      : 'editor';

  const basePerms = getDefaultPermissionsForRole(assignedRole);
  const finalPerms: AdminPermissions = isOwner
    ? basePerms
    : {
        ...basePerms,
        ...(params.permissions || {}),
        canManageAccounts: false,
        canRollbackAllChanges: false,
        canManageSystemSettings: false,
      };

  const now = Date.now();
  const newAccount: AdminAccount = normalizeAdminAccount({
    id: `acc_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUsername,
    displayName: cleanDisplayName,
    role: assignedRole,
    status: 'active',
    isPrimaryOwner: isOwner,
    permissions: finalPerms,
    salt,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: undefined,
  });

  accounts.push(newAccount);
  saveAdminAccounts(accounts);

  // Clean up legacy PIN if present
  try {
    localStorage.removeItem('jy_admin_pin');
  } catch {
    /* ignore */
  }

  return { ok: true, account: newAccount };
}

let sessionPasswordInMemory = '';

/** Password of the current sign-in, held in memory only. Empty after a page reload. */
export function getSessionPasswordInMemory(): string {
  return sessionPasswordInMemory;
}

export async function verifyAdminLogin(
  username: string,
  password: string
): Promise<{ ok: boolean; account?: AdminAccount; errorDe?: string; errorEn?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const accounts = getAdminAccounts();
  const account = accounts.find((a) => a.username.toLowerCase() === cleanUsername);

  if (!account) {
    return {
      ok: false,
      errorDe: 'Ungültiger Benutzername oder falsches Passwort.',
      errorEn: 'Invalid username or password.',
    };
  }

  if (account.status === 'suspended' && account.role !== 'owner') {
    return {
      ok: false,
      errorDe: 'Dieser Account wurde vom Inhaber vorübergehend pausiert.',
      errorEn: 'This account has been suspended by the owner.',
    };
  }

  const computedHash = await hashPasswordWithSalt(password, account.salt);
  if (computedHash !== account.passwordHash) {
    return {
      ok: false,
      errorDe: 'Ungültiger Benutzername oder falsches Passwort.',
      errorEn: 'Invalid username or password.',
    };
  }

  account.lastLoginAt = Date.now();
  account.updatedAt = Date.now();
  saveAdminAccounts(accounts);
  setActiveSessionAccount(account);
  // Kept in memory only (never persisted) so the Owner can confirm access-request decisions.
  sessionPasswordInMemory = password;

  return { ok: true, account };
}

/**
 * Allows the Owner to update another account's role, status, and granular permissions.
 */
export function updateAdminAccountPermissions(params: {
  targetAccountId: string;
  actorAccount: AdminAccount;
  role?: AdminRole;
  status?: AccountStatus;
  permissions?: Partial<AdminPermissions>;
  displayName?: string;
}): { ok: boolean; account?: AdminAccount; errorDe?: string; errorEn?: string } {
  if (params.actorAccount.role !== 'owner' && !params.actorAccount.isPrimaryOwner) {
    return {
      ok: false,
      errorDe: 'Nur der Inhaber-Account (Owner) darf Rollen und Berechtigungen ändern.',
      errorEn: 'Only the Owner account can change roles and permissions.',
    };
  }

  const accounts = getAdminAccounts();
  const idx = accounts.findIndex((a) => a.id === params.targetAccountId);
  if (idx < 0) {
    return {
      ok: false,
      errorDe: 'Account nicht gefunden.',
      errorEn: 'Account not found.',
    };
  }

  const target = accounts[idx];
  if (target.isPrimaryOwner && target.id !== params.actorAccount.id) {
    return {
      ok: false,
      errorDe: 'Der Haupt-Inhaber-Account kann nicht eingeschränkt werden.',
      errorEn: 'The primary Owner account cannot be restricted.',
    };
  }

  const nextRole: AdminRole = target.isPrimaryOwner
    ? 'owner'
    : params.role && params.role !== 'owner'
      ? params.role
      : target.role === 'owner'
        ? 'editor'
        : target.role;

  const nextStatus: AccountStatus = target.isPrimaryOwner
    ? 'active'
    : params.status || target.status || 'active';

  // If role changed and no explicit permissions override was passed, use the new role's defaults
  const basePermissions =
    params.role && params.role !== target.role && !params.permissions
      ? getDefaultPermissionsForRole(nextRole)
      : target.permissions || getDefaultPermissionsForRole(nextRole);

  const mergedPermissions: AdminPermissions = target.isPrimaryOwner
    ? getDefaultPermissionsForRole('owner')
    : {
        ...basePermissions,
        ...(params.permissions || {}),
        canManageAccounts: false,
        canRollbackAllChanges: false,
        canManageSystemSettings: false,
      };

  const updated: AdminAccount = normalizeAdminAccount({
    ...target,
    displayName: params.displayName ? params.displayName.trim() : target.displayName,
    role: nextRole,
    status: nextStatus,
    permissions: mergedPermissions,
    updatedAt: Date.now(),
  });

  accounts[idx] = updated;
  saveAdminAccounts(accounts);
  return { ok: true, account: updated };
}

/**
 * Explicitly claims or sets the given account as the Primary Owner, and ensures all other accounts are non-owners.
 */
export function claimOwnerAccount(targetAccountId: string): { ok: boolean; account?: AdminAccount } {
  const accounts = getAdminAccounts();
  let claimed: AdminAccount | undefined;

  const updated = accounts.map((acc) => {
    if (acc.id === targetAccountId) {
      const next: AdminAccount = {
        ...acc,
        role: 'owner',
        status: 'active',
        isPrimaryOwner: true,
        permissions: getDefaultPermissionsForRole('owner'),
        updatedAt: Date.now(),
      };
      claimed = next;
      return next;
    }
    return {
      ...acc,
      role: acc.role === 'owner' ? 'editor' : acc.role,
      isPrimaryOwner: false,
      permissions: getEffectivePermissions({ ...acc, role: acc.role === 'owner' ? 'editor' : acc.role, isPrimaryOwner: false }),
      updatedAt: Date.now(),
    };
  });

  saveAdminAccounts(updated);
  if (claimed) {
    setActiveSessionAccount(claimed);
  }
  return { ok: Boolean(claimed), account: claimed };
}

/**
 * Allows the Owner to reset a team member's password without needing their old password.
 */
export async function resetAdminAccountPasswordByOwner(
  targetAccountId: string,
  newPassword: string,
  actorAccount: AdminAccount
): Promise<{ ok: boolean; errorDe?: string; errorEn?: string }> {
  if (actorAccount.role !== 'owner' && !actorAccount.isPrimaryOwner) {
    return {
      ok: false,
      errorDe: 'Nur der Inhaber-Account darf Passwörter zurücksetzen.',
      errorEn: 'Only the Owner account can reset passwords.',
    };
  }
  if (!newPassword || newPassword.length < 8) {
    return {
      ok: false,
      errorDe: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.',
      errorEn: 'New password must be at least 8 characters long.',
    };
  }

  const accounts = getAdminAccounts();
  const account = accounts.find((a) => a.id === targetAccountId);
  if (!account) {
    return {
      ok: false,
      errorDe: 'Account nicht gefunden.',
      errorEn: 'Account not found.',
    };
  }

  const newSalt = generateRandomSalt();
  account.salt = newSalt;
  account.passwordHash = await hashPasswordWithSalt(newPassword, newSalt);
  account.updatedAt = Date.now();
  saveAdminAccounts(accounts);

  return { ok: true };
}

export async function changeAdminPassword(
  accountId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; errorDe?: string; errorEn?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return {
      ok: false,
      errorDe: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.',
      errorEn: 'New password must be at least 8 characters long.',
    };
  }

  const accounts = getAdminAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (!account) {
    return {
      ok: false,
      errorDe: 'Account nicht gefunden.',
      errorEn: 'Account not found.',
    };
  }

  const currentHash = await hashPasswordWithSalt(currentPassword, account.salt);
  if (currentHash !== account.passwordHash) {
    return {
      ok: false,
      errorDe: 'Das aktuelle Passwort ist nicht korrekt.',
      errorEn: 'Current password is incorrect.',
    };
  }

  const newSalt = generateRandomSalt();
  account.salt = newSalt;
  account.passwordHash = await hashPasswordWithSalt(newPassword, newSalt);
  account.updatedAt = Date.now();
  saveAdminAccounts(accounts);

  return { ok: true };
}

export function deleteAdminAccount(
  targetAccountId: string,
  currentAccountId: string
): { ok: boolean; errorDe?: string; errorEn?: string } {
  const accounts = getAdminAccounts();
  const actor = accounts.find((a) => a.id === currentAccountId);
  if (!actor || (actor.role !== 'owner' && !actor.isPrimaryOwner)) {
    return {
      ok: false,
      errorDe: 'Nur der Inhaber-Account kann andere Accounts entfernen.',
      errorEn: 'Only the Owner account can remove accounts.',
    };
  }

  if (targetAccountId === currentAccountId) {
    return {
      ok: false,
      errorDe: 'Du kannst deinen eigenen aktuell angemeldeten Account nicht löschen.',
      errorEn: 'You cannot delete your own currently signed-in account.',
    };
  }

  const target = accounts.find((a) => a.id === targetAccountId);
  if (target?.isPrimaryOwner) {
    return {
      ok: false,
      errorDe: 'Der Inhaber-Account kann nicht gelöscht werden.',
      errorEn: 'The Owner account cannot be deleted.',
    };
  }

  if (accounts.length <= 1) {
    return {
      ok: false,
      errorDe: 'Der letzte Administrator-Account kann nicht gelöscht werden.',
      errorEn: 'The last administrator account cannot be deleted.',
    };
  }

  const deletedIds = getDeletedAccountIds();
  saveDeletedAccountIds([...deletedIds, targetAccountId]);

  const filtered = accounts.filter((a) => a.id !== targetAccountId);
  saveAdminAccounts(filtered);
  return { ok: true };
}

export function getActiveSessionAccount(): AdminAccount | null {
  try {
    const raw = sessionStorage.getItem(SESSION_ACTIVE_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accountId?: string; username?: string };
    if (!parsed?.accountId && !parsed?.username) return null;
    const accounts = getAdminAccounts();
    const found =
      accounts.find((a) => a.id === parsed.accountId) ||
      (parsed.username ? accounts.find((a) => a.username.toLowerCase() === parsed.username?.toLowerCase()) : undefined) ||
      null;
    if (found && found.status === 'suspended' && found.role !== 'owner') {
      setActiveSessionAccount(null);
      return null;
    }
    return found;
  } catch {
    return null;
  }
}

export function setActiveSessionAccount(account: AdminAccount | null): void {
  try {
    if (!account) {
      sessionPasswordInMemory = '';
      sessionStorage.removeItem(SESSION_ACTIVE_ACCOUNT_KEY);
      sessionStorage.removeItem('jy_admin_authenticated');
    } else {
      sessionStorage.setItem(
        SESSION_ACTIVE_ACCOUNT_KEY,
        JSON.stringify({ accountId: account.id, username: account.username })
      );
      sessionStorage.setItem('jy_admin_author', account.displayName);
    }
  } catch {
    /* ignore */
  }
}
