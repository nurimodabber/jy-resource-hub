/**
 * "Meine Beiträge": the contributions sent from this device, without any account (owner decision,
 * 2026-11-07). The list lives in `jy_my_submissions` and is part of the backup. The edit tokens
 * live separately in `jy_submission_tokens` and never go into a backup (AGENTS.md rule 6): whoever
 * holds a token can revise that entry while the editors ask for changes.
 */

export type ContributionStatus = 'pending' | 'changes_requested' | 'accepted' | 'rejected' | 'deleted' | 'unknown';
export type ContributionType = 'spiel' | 'dienst' | 'kunst' | 'feedback';

export interface MySubmission {
  issueNumber: number;
  type: ContributionType;
  title: string;
  submittedAt: number;
  /** Last time this device sent a revision. */
  revisedAt?: number;
  /** The form state as sent, to reopen it for a revision. Never contains the e-mail address. */
  form: Record<string, unknown>;
  status?: ContributionStatus;
  note?: string;
  decidedAt?: number;
  /** Status the person has already seen in "Meine Beiträge"; drives the notification dot. */
  seenStatus?: ContributionStatus;
}

export const MY_SUBMISSIONS_KEY = 'jy_my_submissions';
export const SUBMISSION_TOKENS_KEY = 'jy_submission_tokens';
export const MY_SUBMISSIONS_EVENT = 'jy_my_submissions_updated';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: the list simply isn't kept */
  }
};

const notify = (): void => {
  window.dispatchEvent(new CustomEvent(MY_SUBMISSIONS_EVENT));
};

export function getMySubmissions(): MySubmission[] {
  const list = read<MySubmission[]>(MY_SUBMISSIONS_KEY, []);
  return Array.isArray(list) ? list.filter((s) => s && Number.isInteger(s.issueNumber)) : [];
}

function saveList(list: MySubmission[]): void {
  write(MY_SUBMISSIONS_KEY, list);
  notify();
}

export function getEditToken(issueNumber: number): string | null {
  const tokens = read<Record<string, string>>(SUBMISSION_TOKENS_KEY, {});
  return typeof tokens[String(issueNumber)] === 'string' ? tokens[String(issueNumber)] : null;
}

/** Call after the server confirmed a new submission. */
export function addMySubmission(entry: Omit<MySubmission, 'status' | 'seenStatus'>, editToken?: string): void {
  const { authorEmail: _omit, ...form } = entry.form as Record<string, unknown> & { authorEmail?: unknown };
  const list = getMySubmissions().filter((s) => s.issueNumber !== entry.issueNumber);
  saveList([{ ...entry, form, status: 'pending', seenStatus: 'pending' }, ...list]);
  if (editToken) {
    const tokens = read<Record<string, string>>(SUBMISSION_TOKENS_KEY, {});
    write(SUBMISSION_TOKENS_KEY, { ...tokens, [String(entry.issueNumber)]: editToken });
  }
}

/** Call after the server confirmed a revision: the entry is back in review. */
export function markRevised(issueNumber: number, title: string, form: Record<string, unknown>): void {
  const { authorEmail: _omit, ...clean } = form as Record<string, unknown> & { authorEmail?: unknown };
  saveList(
    getMySubmissions().map((s) =>
      s.issueNumber === issueNumber
        ? { ...s, title, form: clean, revisedAt: Date.now(), status: 'pending', seenStatus: 'pending', note: undefined, decidedAt: undefined }
        : s
    )
  );
}

export const needsAttention = (s: MySubmission): boolean =>
  (s.status === 'changes_requested' || s.status === 'rejected') && s.seenStatus !== s.status;

export const attentionCount = (list: MySubmission[] = getMySubmissions()): number => list.filter(needsAttention).length;

/** Call when "Meine Beiträge" was shown: the dot disappears until the next status change. */
export function markAllSeen(): void {
  const list = getMySubmissions();
  if (!list.some((s) => s.seenStatus !== s.status)) return;
  saveList(list.map((s) => ({ ...s, seenStatus: s.status })));
}

let lastCheck = 0;
let inFlight: Promise<MySubmission[]> | null = null;

/**
 * Fetches the current status from GET /api/sync?issues=… (public, cached 30 s at the edge).
 * Without `force`, asks at most every 5 minutes; does nothing when there are no own entries.
 */
export function refreshStatuses(force = false): Promise<MySubmission[]> {
  const list = getMySubmissions();
  if (list.length === 0) return Promise.resolve(list);
  if (!force && Date.now() - lastCheck < 5 * 60_000) return Promise.resolve(list);
  if (inFlight) return inFlight;
  lastCheck = Date.now();
  const numbers = list.map((s) => s.issueNumber).slice(0, 30).join(',');
  inFlight = fetch(`/api/sync?issues=${numbers}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { ok?: boolean; items?: { number: number; status: ContributionStatus; note?: string; decidedAt?: number }[] } | null) => {
      if (!data?.ok || !Array.isArray(data.items)) return getMySubmissions();
      const byNumber = new Map(data.items.map((i) => [i.number, i]));
      const next = getMySubmissions().map((s) => {
        const item = byNumber.get(s.issueNumber);
        // "unknown" (e.g. GitHub briefly unreachable for one issue) keeps the last known status.
        if (!item || item.status === 'unknown') return s;
        return { ...s, status: item.status, note: item.note, decidedAt: item.decidedAt };
      });
      saveList(next);
      return next;
    })
    .catch(() => getMySubmissions())
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}
