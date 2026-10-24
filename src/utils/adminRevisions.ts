/**
 * Append-only Revision Engine & Non-Destructive Versioning for JY Hub
 *
 * Guarantees:
 * 1. Physical DELETE is impossible — all deletions are soft-deletes (`action: 'soft_delete'`).
 * 2. Every creation, update, deletion, proposal review, and rollback creates an immutable revision snapshot.
 * 3. 1-click rollback is non-destructive: it appends a new 'restore' (or 'soft_delete') revision to the log
 *    and marks the original revision with `undoneByRevisionId`.
 * 4. Stored under 'jy_admin_revisions' in localStorage, backed up via backup.ts, and synced across devices via `/api/sync`.
 * 5. Changes dispatch window event 'jy_data_updated' for instant live sync across components.
 */

import { getActiveSessionAccount } from './adminAuth';

export type AdminCollection = 'games' | 'categories' | 'quotes' | 'tags' | 'proposals' | 'service' | 'arts';
export type RevisionAction = 'create' | 'update' | 'soft_delete' | 'restore';

export interface DataRevision<T = unknown> {
  revisionId: string;
  timestamp: number;
  collection: AdminCollection;
  entityId: string;
  action: RevisionAction;
  author: string;
  authorId?: string;
  authorUsername?: string;
  summary: string;
  previousSnapshot?: T;
  newSnapshot?: T;
  undoneByRevisionId?: string;
  rollbackOfRevisionId?: string;
}

export interface ProposalItem {
  id: string;
  type: 'spiel' | 'dienst' | 'kunst' | 'kategorie';
  title: string;
  subtitle?: string;
  summary: string;
  authorName?: string;
  authorEmail?: string;
  createdAt: number;
  updatedAt?: number;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  githubIssueNumber?: number;
  payload?: Record<string, unknown>;
}

export const STORAGE_REVISIONS_KEY = 'jy_admin_revisions';
export const STORAGE_PROPOSALS_KEY = 'jy_proposals';

function generateId(prefix = 'rev'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/** Retrieve all revisions, newest first. */
export function getRevisions(): DataRevision[] {
  try {
    const raw = localStorage.getItem(STORAGE_REVISIONS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function saveRevisions(revisions: DataRevision[]): void {
  try {
    const sorted = [...revisions].sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(STORAGE_REVISIONS_KEY, JSON.stringify(sorted));
  } catch {
    /* ignore */
  }
}

/** Merges local and remote revisions by revisionId without losing `undoneByRevisionId`. */
export function mergeRevisions(localRevs: DataRevision[], remoteRevs: DataRevision[]): DataRevision[] {
  const byId = new Map<string, DataRevision>();
  for (const rev of [...remoteRevs, ...localRevs]) {
    if (!rev || !rev.revisionId) continue;
    const existing = byId.get(rev.revisionId);
    if (!existing) {
      byId.set(rev.revisionId, rev);
    } else {
      byId.set(rev.revisionId, {
        ...existing,
        ...rev,
        undoneByRevisionId: rev.undoneByRevisionId || existing.undoneByRevisionId,
        rollbackOfRevisionId: rev.rollbackOfRevisionId || existing.rollbackOfRevisionId,
      });
    }
  }
  return Array.from(byId.values()).sort((a, b) => b.timestamp - a.timestamp);
}

/** Broadcast update to other tabs and active components. */
function broadcastUpdate(revision?: DataRevision) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jy_data_updated', { detail: revision }));
  }
}

/** Append a new revision to the append-only log. */
export function appendRevision<T = unknown>(params: {
  collection: AdminCollection;
  entityId: string;
  action: RevisionAction;
  author: string;
  authorId?: string;
  authorUsername?: string;
  summary: string;
  previousSnapshot?: T;
  newSnapshot?: T;
  rollbackOfRevisionId?: string;
}): DataRevision<T> {
  const sessionAccount = getActiveSessionAccount();
  const revision: DataRevision<T> = {
    revisionId: generateId('rev'),
    timestamp: Date.now(),
    collection: params.collection,
    entityId: params.entityId,
    action: params.action,
    author: params.author.trim() || sessionAccount?.displayName || 'Administrator',
    authorId: params.authorId || sessionAccount?.id,
    authorUsername: params.authorUsername || sessionAccount?.username,
    summary: params.summary,
    previousSnapshot: params.previousSnapshot,
    newSnapshot: params.newSnapshot,
    rollbackOfRevisionId: params.rollbackOfRevisionId,
  };

  try {
    const existing = getRevisions();
    const updated = [revision, ...existing];
    localStorage.setItem(STORAGE_REVISIONS_KEY, JSON.stringify(updated));
    broadcastUpdate(revision as DataRevision);
  } catch (err) {
    console.error('Failed to append revision:', err);
  }

  return revision;
}

/** Soft-delete an entity with revision tracking. */
export function softDeleteEntity<T = unknown>(
  collection: AdminCollection,
  entityId: string,
  currentSnapshot: T,
  author: string,
  summary = 'Eintrag deaktiviert (Soft-Delete)'
): DataRevision<T> {
  return appendRevision<T>({
    collection,
    entityId,
    action: 'soft_delete',
    author,
    summary,
    previousSnapshot: currentSnapshot,
    newSnapshot: undefined,
  });
}

/** Restore an entity with 1-click rollback. */
export function rollbackRevision(revisionId: string, author: string): DataRevision | null {
  const revisions = getRevisions();
  const target = revisions.find((r) => r.revisionId === revisionId);
  if (!target) return null;

  // Handle rolling back a proposal status change
  if (target.collection === 'proposals') {
    const prevProp = target.previousSnapshot as ProposalItem | undefined;
    if (prevProp && prevProp.id) {
      const list = getProposals();
      const exists = list.some((p) => p.id === prevProp.id);
      const next = exists
        ? list.map((p) => (p.id === prevProp.id ? { ...prevProp, updatedAt: Date.now() } : p))
        : [{ ...prevProp, updatedAt: Date.now() }, ...list];
      localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(next));
    }
  }

  let rollbackEntry: DataRevision;

  if (target.previousSnapshot === undefined && target.action === 'create') {
    // Rolling back a 'create' means soft-deleting the created entity
    rollbackEntry = appendRevision({
      collection: target.collection,
      entityId: target.entityId,
      action: 'soft_delete',
      author,
      summary: `Rückgängig gemacht (${target.author}): Erstellung von "${target.entityId}"`,
      previousSnapshot: target.newSnapshot,
      newSnapshot: undefined,
      rollbackOfRevisionId: target.revisionId,
    });
  } else {
    const restoredSnapshot = target.previousSnapshot;
    rollbackEntry = appendRevision({
      collection: target.collection,
      entityId: target.entityId,
      action: 'restore',
      author,
      summary: `Rückgängig gemacht (${target.author}): "${target.summary}"`,
      previousSnapshot: target.newSnapshot,
      newSnapshot: restoredSnapshot,
      rollbackOfRevisionId: target.revisionId,
    });
  }

  // Mark the target revision as undone
  try {
    const allAfterAppend = getRevisions().map((r) =>
      r.revisionId === target.revisionId ? { ...r, undoneByRevisionId: rollbackEntry.revisionId } : r
    );
    saveRevisions(allAfterAppend);
    broadcastUpdate(rollbackEntry);
  } catch {
    /* ignore */
  }

  return rollbackEntry;
}

/**
 * Rolls back all active (not yet undone) changes made by a specific account/author,
 * in reverse chronological order (newest to oldest) so intermediate edits unwind cleanly.
 */
export function rollbackAllRevisionsByAuthor(
  targetAccount: { id?: string; username?: string; displayName: string },
  actorAuthor: string
): number {
  const revisions = getRevisions();
  const matching = revisions.filter((r) => {
    if (r.undoneByRevisionId || r.rollbackOfRevisionId) return false;
    if (targetAccount.id && r.authorId === targetAccount.id) return true;
    if (targetAccount.username && r.authorUsername?.toLowerCase() === targetAccount.username.toLowerCase()) return true;
    return r.author.trim().toLowerCase() === targetAccount.displayName.trim().toLowerCase();
  });

  let count = 0;
  // Unwind newest first
  for (const rev of matching) {
    const res = rollbackRevision(rev.revisionId, actorAuthor);
    if (res) count++;
  }
  return count;
}

/** Proposals Inbox Management */
export function getProposals(): ProposalItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROPOSALS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveProposalsList(proposals: ProposalItem[]): void {
  try {
    localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(proposals));
  } catch {
    /* ignore */
  }
}

export function mergeProposals(localProps: ProposalItem[], remoteProps: ProposalItem[]): ProposalItem[] {
  const byId = new Map<string, ProposalItem>();
  for (const p of [...remoteProps, ...localProps]) {
    if (!p || !p.id) continue;
    const existing = byId.get(p.id);
    if (!existing) {
      byId.set(p.id, p);
    } else {
      const existingTime = existing.updatedAt || existing.createdAt || 0;
      const incomingTime = p.updatedAt || p.createdAt || 0;
      byId.set(p.id, incomingTime >= existingTime ? { ...existing, ...p } : { ...p, ...existing });
    }
  }
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveProposal(
  proposal: Omit<ProposalItem, 'id' | 'createdAt' | 'status'> & {
    id?: string;
    createdAt?: number;
    status?: 'pending' | 'accepted' | 'rejected';
  }
): ProposalItem {
  const list = getProposals();
  if (proposal.id) {
    const existing = list.find((p) => p.id === proposal.id);
    if (existing) return existing;
  }
  const now = Date.now();
  const item: ProposalItem = {
    ...proposal,
    id: proposal.id || generateId('prop'),
    createdAt: proposal.createdAt || now,
    updatedAt: now,
    status: proposal.status || 'pending',
  };
  localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify([item, ...list]));
  return item;
}

export function updateProposalStatus(
  proposalId: string,
  status: 'accepted' | 'rejected',
  reason?: string,
  author?: string
): void {
  const list = getProposals();
  const previous = list.find((p) => p.id === proposalId);
  const now = Date.now();
  const updatedItem: ProposalItem | undefined = previous
    ? {
        ...previous,
        status,
        rejectionReason: reason,
        reviewedBy: author,
        updatedAt: now,
      }
    : undefined;

  const next = list.map((p) => (p.id === proposalId && updatedItem ? updatedItem : p));
  localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(next));

  if (previous && updatedItem) {
    appendRevision({
      collection: 'proposals',
      entityId: proposalId,
      action: 'update',
      author: author || 'Administrator',
      summary:
        status === 'accepted'
          ? `Vorschlag angenommen: "${previous.title}"`
          : `Vorschlag abgelehnt: "${previous.title}"${reason ? ` (${reason})` : ''}`,
      previousSnapshot: previous,
      newSnapshot: updatedItem,
    });
  } else if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jy_data_updated', { detail: { collection: 'proposals' } }));
  }
}
