/**
 * Lightweight, secure Admin Authentication & Session Management
 * Uses Web Crypto API SHA-256 for password verification.
 * Session is maintained under 'jy_admin_session' in sessionStorage.
 */

export interface AdminSession {
  authenticated: boolean;
  author: string;
  loginTime: number;
  expiresAt: number;
}

const SESSION_KEY = 'jy_admin_session';

// SHA-256 hashes for standard passphrases:
// "jy-admin" -> 08f53c1688c7f16b225590f992c5ac32d895558d74dd4be131d3401c38f491c1
// "animator2025" -> a29a1425dc3e8dff30a75be9d4b1d2ff9f112aefadfaa33de626306a407ad9d6
// "admin" -> 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
const ACCEPTED_HASHES = new Set([
  '08f53c1688c7f16b225590f992c5ac32d895558d74dd4be131d3401c38f491c1', // "jy-admin"
  'a29a1425dc3e8dff30a75be9d4b1d2ff9f112aefadfaa33de626306a407ad9d6', // "animator2025"
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // "admin"
]);

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

/** Attempt login with passphrase and optional author name */
export async function loginAdmin(passphrase: string, authorName = 'Administrator'): Promise<{ ok: boolean; error?: string }> {
  const trimmed = passphrase.trim();
  if (!trimmed) {
    return { ok: false, error: 'Bitte ein Passwort eingeben.' };
  }

  const hash = await sha256(trimmed);
  if (!ACCEPTED_HASHES.has(hash)) {
    return { ok: false, error: 'Falsches Passwort. Bitte überprüfe deine Eingabe.' };
  }

  const session: AdminSession = {
    authenticated: true,
    author: authorName.trim() || 'Administrator',
    loginTime: Date.now(),
    expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  };

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore storage quota */
  }

  return { ok: true };
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
