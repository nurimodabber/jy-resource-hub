import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, FolderGit2, RefreshCw, ShieldCheck, AlertCircle, Activity } from 'lucide-react';
import { Language } from '../../types';
import { tr, secondaryBtn } from '../tools/common';
import { fetchSystemStatus, SystemStatus } from '../../utils/githubIssues';

interface GitHubSettingsModalProps {
  language: Language;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Owner-only server status. Secrets (GitHub token, session secret, setup token) live only in the
 * Vercel environment; this panel shows whether each one is configured, never its value.
 */
export const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({ language, onClose, onSaved }) => {
  const L = tr(language);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await fetchSystemStatus();
    setIsLoading(false);
    if (res.ok && res.status) {
      setStatus(res.status);
    } else {
      setError(L('Status konnte nicht geladen werden.', 'Status could not be loaded.'));
    }
  }, [L]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows: Array<{ label: string; ok: boolean; hint: string }> = status
    ? [
        { label: L('Repository erreichbar', 'Repository reachable'), ok: status.repoOk, hint: status.repo },
        { label: L('Schreibrecht (GITHUB_TOKEN)', 'Write access (GITHUB_TOKEN)'), ok: status.canWrite, hint: '' },
        { label: L('Inhaber festgelegt (OWNER_USERNAME)', 'Owner set (OWNER_USERNAME)'), ok: status.ownerConfigured, hint: '' },
        { label: L('Sitzungs-Schlüssel (ADMIN_SESSION_SECRET)', 'Session key (ADMIN_SESSION_SECRET)'), ok: status.sessionSecretConfigured, hint: '' },
        { label: L('Eigener Daten-Schlüssel (ADMIN_STATE_KEY)', 'Separate data key (ADMIN_STATE_KEY)'), ok: status.separateStateKey, hint: L('empfohlen', 'recommended') },
        { label: L('E-Mail-Versand (RESEND_API_KEY)', 'Email delivery (RESEND_API_KEY)'), ok: status.emailConfigured, hint: '' },
        {
          label: L('Einrichtungs-Token entfernt', 'Setup token removed'),
          ok: !status.setupTokenActive,
          hint: status.setupTokenActive ? L('ADMIN_SETUP_TOKEN in Vercel löschen', 'Delete ADMIN_SETUP_TOKEN in Vercel') : '',
        },
      ]
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-status-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
    >
      <div className="relative w-full max-w-md glass-surface-panel rounded-dialog shadow-2 border border-border p-5 sm:p-6 space-y-4 text-left outline-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="system-status-title" className="text-base font-bold text-text">
                {L('Server & GitHub-Status', 'Server & GitHub Status')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {L('Schlüssel liegen nur in den Vercel-Einstellungen', 'Secrets live only in the Vercel settings')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-control flex items-center justify-center text-text-tertiary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer outline-none"
            aria-label={L('Schließen', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-control bg-surface-2/80 border border-border p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text">
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span>{L('Konfiguration', 'Configuration')}</span>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="liquid-pill-secondary inline-flex items-center gap-1 px-3 py-1 text-2xs font-semibold text-text-secondary hover:text-text cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{L('Neu prüfen', 'Check again')}</span>
            </button>
          </div>

          {error && <p className="text-2xs font-semibold text-danger">{error}</p>}
          {!status && !error && <p className="text-2xs text-text-tertiary">{L('Wird geprüft …', 'Checking …')}</p>}

          {rows.length > 0 && (
            <ul className="space-y-1.5 text-2xs">
              {rows.map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-text-secondary">
                    {row.label}
                    {row.hint && <span className="block text-text-tertiary">{row.hint}</span>}
                  </span>
                  {row.ok ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-success shrink-0">
                      <Check className="w-3.5 h-3.5" />
                      {L('OK', 'OK')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-danger shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {L('Fehlt', 'Missing')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {status?.rateRemaining != null && (
            <p className="text-2xs text-text-tertiary">
              {L('GitHub-Anfragen übrig diese Stunde:', 'GitHub requests left this hour:')} {status.rateRemaining}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 text-2xs text-text-secondary leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p>
            {L(
              'Ein GitHub-Token im Browser ist nicht mehr möglich: Alle GitHub-Aktionen laufen über den Server und prüfen deine Berechtigung.',
              'A GitHub token in the browser is no longer possible: all GitHub actions run on the server and check your permissions.'
            )}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className={secondaryBtn}
            onClick={() => {
              onSaved();
              onClose();
            }}
          >
            {L('Einreichungen neu laden', 'Reload submissions')}
          </button>
        </div>
      </div>
    </div>
  );
};
