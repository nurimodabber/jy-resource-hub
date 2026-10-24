/**
 * Multi-Account Admin Authentication & Password Hashing (Web Crypto SHA-256 + Salt)
 * Stores salted password hashes under `jy_admin_accounts` (automatically backed up via `backup.ts`).
 */

export interface AdminAccount {
  id: string;
  username: string; // Email or username (stored lowercase for lookup)
  displayName: string; // Full name shown in sidebar & audit log
  role: 'owner' | 'editor';
  salt: string;
  passwordHash: string;
  createdAt: number;
  lastLoginAt?: number;
}

export const STORAGE_ACCOUNTS_KEY = 'jy_admin_accounts';
export const SESSION_ACTIVE_ACCOUNT_KEY = 'jy_admin_active_session';

function generateRandomSalt(): string {
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

export function getAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminAccounts(accounts: AdminAccount[]): void {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

export function hasAnyAdminAccount(): boolean {
  return getAdminAccounts().length > 0;
}

export async function createAdminAccount(params: {
  username: string;
  displayName: string;
  password: string;
  role?: 'owner' | 'editor';
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
  const isFirst = accounts.length === 0;

  const newAccount: AdminAccount = {
    id: `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUsername,
    displayName: cleanDisplayName,
    role: isFirst ? 'owner' : params.role || 'editor',
    salt,
    passwordHash,
    createdAt: Date.now(),
    lastLoginAt: isFirst ? Date.now() : undefined,
  };

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

  const computedHash = await hashPasswordWithSalt(password, account.salt);
  if (computedHash !== account.passwordHash) {
    return {
      ok: false,
      errorDe: 'Ungültiger Benutzername oder falsches Passwort.',
      errorEn: 'Invalid username or password.',
    };
  }

  account.lastLoginAt = Date.now();
  saveAdminAccounts(accounts);
  setActiveSessionAccount(account);

  return { ok: true, account };
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
  saveAdminAccounts(accounts);

  return { ok: true };
}

export function deleteAdminAccount(
  targetAccountId: string,
  currentAccountId: string
): { ok: boolean; errorDe?: string; errorEn?: string } {
  if (targetAccountId === currentAccountId) {
    return {
      ok: false,
      errorDe: 'Du kannst deinen eigenen aktuell angemeldeten Account nicht löschen.',
      errorEn: 'You cannot delete your own currently signed-in account.',
    };
  }

  const accounts = getAdminAccounts();
  if (accounts.length <= 1) {
    return {
      ok: false,
      errorDe: 'Der letzte Administrator-Account kann nicht gelöscht werden.',
      errorEn: 'The last administrator account cannot be deleted.',
    };
  }

  const filtered = accounts.filter((a) => a.id !== targetAccountId);
  saveAdminAccounts(filtered);
  return { ok: true };
}

export function getActiveSessionAccount(): AdminAccount | null {
  try {
    const raw = sessionStorage.getItem(SESSION_ACTIVE_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accountId?: string };
    if (!parsed?.accountId) return null;
    const accounts = getAdminAccounts();
    return accounts.find((a) => a.id === parsed.accountId) || null;
  } catch {
    return null;
  }
}

export function setActiveSessionAccount(account: AdminAccount | null): void {
  try {
    if (!account) {
      sessionStorage.removeItem(SESSION_ACTIVE_ACCOUNT_KEY);
      sessionStorage.removeItem('jy_admin_authenticated');
    } else {
      sessionStorage.setItem(SESSION_ACTIVE_ACCOUNT_KEY, JSON.stringify({ accountId: account.id }));
      sessionStorage.setItem('jy_admin_author', account.displayName);
    }
  } catch {
    /* ignore */
  }
}
