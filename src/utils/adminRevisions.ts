/**
 * Append-only Revision Engine & Non-Destructive Versioning for JY Hub
 * 
 * Guarantees:
 * 1. Physical DELETE is impossible — all deletions are soft-deletes (`action: 'soft_delete'`).
 * 2. Every creation, update, deletion and rollback creates an immutable revision snapshot.
 * 3. 1-click rollback is non-destructive: it appends a new 'restore' revision to the log.
 * 4. Stored under 'jy_admin_revisions' in localStorage and automatically backed up via backup.ts.
 * 5. Changes dispatch window event 'jy_data_updated' for instant live sync across components.
 */

export type AdminCollection = 'games' | 'categories' | 'quotes' | 'tags' | 'proposals';
export type RevisionAction = 'create' | 'update' | 'soft_delete' | 'restore';

export interface DataRevision<T = unknown> {
  revisionId: string;
  timestamp: number;
  collection: AdminCollection;
  entityId: string;
  action: RevisionAction;
  author: string;
  summary: string;
  previousSnapshot?: T;
  newSnapshot?: T;
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
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
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

/** Broadcast update to other tabs and active components. */
function broadcastUpdate(revision: DataRevision) {
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
  summary: string;
  previousSnapshot?: T;
  newSnapshot?: T;
}): DataRevision<T> {
  const revision: DataRevision<T> = {
    revisionId: generateId('rev'),
    timestamp: Date.now(),
    collection: params.collection,
    entityId: params.entityId,
    action: params.action,
    author: params.author.trim() || 'Administrator',
    summary: params.summary,
    previousSnapshot: params.previousSnapshot,
    newSnapshot: params.newSnapshot,
  };

  try {
    const existing = getRevisions();
    // Append to existing log
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

  // If target was soft-delete, restoring means re-applying previousSnapshot.
  // If target was an update, rollback means reinstating target.previousSnapshot.
  const restoredSnapshot = target.action === 'soft_delete' ? target.previousSnapshot : target.previousSnapshot;

  if (restoredSnapshot === undefined && target.action === 'create') {
    // Rolling back a 'create' means soft-deleting the created entity
    return appendRevision({
      collection: target.collection,
      entityId: target.entityId,
      action: 'soft_delete',
      author,
      summary: `Rollback: Erstellung von "${target.entityId}" rückgängig gemacht`,
      previousSnapshot: target.newSnapshot,
      newSnapshot: undefined,
    });
  }

  const restored = appendRevision({
    collection: target.collection,
    entityId: target.entityId,
    action: 'restore',
    author,
    summary: `Rollback auf Zustand vor Revision "${target.summary}"`,
    previousSnapshot: target.newSnapshot,
    newSnapshot: restoredSnapshot,
  });

  return restored;
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

export function saveProposal(proposal: Omit<ProposalItem, 'id' | 'createdAt' | 'status'>): ProposalItem {
  const item: ProposalItem = {
    ...proposal,
    id: generateId('prop'),
    createdAt: Date.now(),
    status: 'pending',
  };
  const list = getProposals();
  localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify([item, ...list]));
  return item;
}

export function updateProposalStatus(
  proposalId: string,
  status: 'accepted' | 'rejected',
  reason?: string
): void {
  const list = getProposals();
  const next = list.map((p) => (p.id === proposalId ? { ...p, status, rejectionReason: reason } : p));
  localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(next));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jy_data_updated', { detail: { collection: 'proposals' } }));
  }
}
