import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, PencilLine, CheckCircle2, XCircle, MinusCircle, WifiOff } from 'lucide-react';
import { Language } from '../types';
import { tr, secondaryBtn } from './tools/common';
import {
  MySubmission,
  ContributionType,
  MY_SUBMISSIONS_EVENT,
  getMySubmissions,
  attentionCount,
  markAllSeen,
  refreshStatuses,
} from '../utils/mySubmissions';

/**
 * Number of own entries with news the person has not seen yet ("Änderung nötig", "Abgelehnt").
 * Drives the dot on "Beitragen". Checks the server at most every 5 minutes (refreshStatuses).
 */
export function useContributionAttention(): number {
  const [count, setCount] = useState(() => attentionCount());
  useEffect(() => {
    const update = () => setCount(attentionCount());
    window.addEventListener(MY_SUBMISSIONS_EVENT, update);
    // Another tab of the site changed the list (e.g. the person looked at it there).
    window.addEventListener('storage', update);
    refreshStatuses().then(update);
    return () => {
      window.removeEventListener(MY_SUBMISSIONS_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return count;
}

const typeLabel = (type: ContributionType, L: ReturnType<typeof tr>): string =>
  type === 'spiel'
    ? L('Spiel', 'Game')
    : type === 'dienst'
    ? L('Dienstprojekt', 'Service project')
    : type === 'kunst'
    ? L('Kunst & Ausdruck', 'Arts & expression')
    : L('Rückmeldung', 'Feedback');

const StatusLine: React.FC<{ entry: MySubmission; L: ReturnType<typeof tr>; formatDate: (t: number) => string }> = ({
  entry,
  L,
  formatDate,
}) => {
  const iconClass = 'w-4 h-4 shrink-0 mt-0.5';
  let icon: React.ReactNode;
  let text: string;
  switch (entry.status) {
    case 'changes_requested':
      icon = <PencilLine className={`${iconClass} text-accent-text`} aria-hidden="true" />;
      text = L('Änderung nötig', 'Changes needed');
      break;
    case 'accepted':
      icon = <CheckCircle2 className={`${iconClass} text-success`} aria-hidden="true" />;
      text = entry.decidedAt
        ? L(`Angenommen am ${formatDate(entry.decidedAt)}`, `Accepted on ${formatDate(entry.decidedAt)}`)
        : L('Angenommen', 'Accepted');
      break;
    case 'rejected':
      icon = <XCircle className={`${iconClass} text-danger`} aria-hidden="true" />;
      text = L('Abgelehnt', 'Declined');
      break;
    case 'deleted':
      icon = <MinusCircle className={`${iconClass} text-text-tertiary`} aria-hidden="true" />;
      text = L('Entfernt', 'Removed');
      break;
    default:
      // pending, and the moment before the first server answer
      icon = <Clock className={`${iconClass} text-text-secondary`} aria-hidden="true" />;
      text = L('In Prüfung', 'In review');
  }
  return (
    <p className="flex items-start gap-2 text-sm font-medium text-text">
      {icon}
      <span>{text}</span>
    </p>
  );
};

export const MyContributions: React.FC<{ language: Language; hideWhenEmpty?: boolean }> = ({ language, hideWhenEmpty = false }) => {
  const L = tr(language);
  const [list, setList] = useState<MySubmission[]>(getMySubmissions);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const update = () => setList(getMySubmissions());
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener(MY_SUBMISSIONS_EVENT, update);
    window.addEventListener('storage', update);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    // The person is looking at the list now: fetch fresh, then the dot on "Beitragen" goes away.
    refreshStatuses(true).then(() => {
      markAllSeen();
      update();
      setLoading(false);
    });
    return () => {
      window.removeEventListener(MY_SUBMISSIONS_EVENT, update);
      window.removeEventListener('storage', update);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (list.length === 0 && hideWhenEmpty) return null;

  const dateFormat = new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatDate = (t: number) => dateFormat.format(new Date(t));
  const sorted = [...list].sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <section aria-labelledby="my-contributions-heading" className="pt-6 border-t border-line/70 space-y-4">
      <div>
        <h2 id="my-contributions-heading" className="text-xl font-bold text-text tracking-tight">
          {L('Meine Beiträge', 'My contributions')}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          {L('Beiträge, die du von diesem Gerät gesendet hast.', 'Contributions you sent from this device.')}
        </p>
      </div>

      <div role="status" aria-live="polite" className="text-sm text-text-secondary empty:hidden">
        {!isOnline ? (
          <span className="flex items-start gap-2">
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5 text-text-tertiary" aria-hidden="true" />
            {L('Du bist offline. Du siehst den zuletzt bekannten Stand.', 'You are offline. You are seeing the last known status.')}
          </span>
        ) : loading && sorted.length > 0 ? (
          L('Status wird abgerufen …', 'Checking status …')
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {L('Du hast von diesem Gerät noch nichts gesendet.', 'You have not sent anything from this device yet.')}
        </p>
      ) : (
        <ul className="divide-y divide-line/70 border-y border-line/70">
          {sorted.map((entry) => {
            const canRevise = entry.status === 'changes_requested' && entry.type !== 'feedback';
            return (
              <li key={entry.issueNumber} className="py-4 space-y-2">
                <div>
                  <h3 className="text-base font-semibold text-text break-words">{entry.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {typeLabel(entry.type, L)}
                    {' · '}
                    {L(`Gesendet am ${formatDate(entry.submittedAt)}`, `Sent on ${formatDate(entry.submittedAt)}`)}
                    {entry.revisedAt
                      ? ` · ${L(`Überarbeitet am ${formatDate(entry.revisedAt)}`, `Revised on ${formatDate(entry.revisedAt)}`)}`
                      : ''}
                  </p>
                </div>
                <StatusLine entry={entry} L={L} formatDate={formatDate} />
                {entry.note && (entry.status === 'changes_requested' || entry.status === 'rejected') && (
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line pl-6">
                    <span className="font-semibold text-text">
                      {entry.status === 'rejected' ? L('Begründung:', 'Reason:') : L('Hinweis der Redaktion:', 'Note from the editors:')}
                    </span>{' '}
                    {entry.note}
                  </p>
                )}
                {canRevise && (
                  <div className="pl-6">
                    <Link to={`/vorschlagen?bearbeiten=${entry.issueNumber}`} className={`${secondaryBtn} focus-visible:ring-2 focus-visible:ring-accent`}>
                      <PencilLine className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {L('Überarbeiten', 'Revise')}
                        <span className="sr-only">: {entry.title}</span>
                      </span>
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
