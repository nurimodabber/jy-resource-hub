/**
 * Lightweight, secure Admin Authentication & Session Management
 * Uses Web Crypto API SHA-256 with salted cryptographic hashes for password verification.
 * No plaintext passwords or confidential tokens are stored in the client codebase.
 * Session is maintained under 'jy_admin_session' in sessionStorage & localStorage.
 */

export interface AdminSession {
  authenticated: boolean;
  username: string;
  author: string;
  loginTime: number;
  expiresAt: number;
}

const SESSION_KEY = 'jy_admin_session';

/**
 * Account definitions: Only salted SHA-256 hashes are stored.
 * Salt is 128-bit hex string, hash is SHA-256(salt + password).
 */
interface AdminAccount {
  username: string;
  displayName: string;
  salt: string;
  passwordHash: string;
}

const ADMIN_ACCOUNTS: Record<string, AdminAccount> = {
  nuri: {
    username: 'nuri',
    displayName: 'Nuri',
    salt: 'df4a77b3e2d79d80415584b6e9e5cf40',
    passwordHash: 'db9ae929ade3d8dfce90aee1605b0068768cd7bfce5894452c1e3170514637e4',
  },
  lasse: {
    username: 'lasse',
    displayName: 'Lasse',
    salt: '010df5c7e5225cf9c46e781079f86cca',
    passwordHash: 'eab291016e9d8d6ac4ffe3e76d46f4fddead2d70208c884b0ef5679376cf3f5e',
  },
};

/** Computes SHA-256 hex string using native Web Crypto */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Check if current session is active and not expired */
export function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (session.authenticated && session.expiresAt > Date.now()) {
      return session;
    }
    logoutAdmin();
    return null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAdminSession() !== null;
}

/** Attempt login with username and password */
export async function loginAdmin(
  usernameInput: string,
  passphraseInput: string
): Promise<{ ok: boolean; error?: string; session?: AdminSession }> {
  const normalizedUser = usernameInput.trim().toLowerCase();
  const trimmedPass = passphraseInput.trim();

  if (!normalizedUser) {
    return { ok: false, error: 'Bitte einen Benutzernamen eingeben.' };
  }
  if (!trimmedPass) {
    return { ok: false, error: 'Bitte ein Passwort eingeben.' };
  }

  const account = ADMIN_ACCOUNTS[normalizedUser];
  if (!account) {
    return { ok: false, error: 'Unbekannter Benutzername oder falsches Passwort.' };
  }

  const computedHash = await sha256(account.salt + trimmedPass);
  if (computedHash !== account.passwordHash) {
    return { ok: false, error: 'Unbekannter Benutzername oder falsches Passwort.' };
  }

  const session: AdminSession = {
    authenticated: true,
    username: account.username,
    author: account.displayName,
    loginTime: Date.now(),
    expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore storage quota */
  }

  return { ok: true, session };
}

/** Log out current admin */
export function logoutAdmin(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
