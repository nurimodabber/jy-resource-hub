import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, ExternalLink, Key, FolderGit2, RefreshCw, ShieldCheck, AlertCircle, Activity } from 'lucide-react';
import { Language } from '../../types';
import { tr, primaryBtn, secondaryBtn } from '../tools/common';
import {
  getGitHubRepo,
  setGitHubRepo,
  getGitHubToken,
  setGitHubToken,
  testGitHubConnection,
  GitHubConnectionStatus,
  DEFAULT_GH_REPO,
} from '../../utils/githubIssues';

interface GitHubSettingsModalProps {
  language: Language;
  onClose: () => void;
  onSaved: () => void;
}

export const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({
  language,
  onClose,
  onSaved,
}) => {
  const L = tr(language);

  const [repo, setRepo] = useState(getGitHubRepo());
  const [token, setToken] = useState(getGitHubToken());
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<GitHubConnectionStatus | null>(null);

  const runConnectionTest = useCallback(async (targetRepo: string, targetToken: string) => {
    setIsTesting(true);
    const res = await testGitHubConnection(targetRepo, targetToken);
    setStatus(res);
    setIsTesting(false);
  }, []);

  useEffect(() => {
    runConnectionTest(getGitHubRepo(), getGitHubToken());
  }, [runConnectionTest]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGitHubRepo(repo.trim() || DEFAULT_GH_REPO);
    setGitHubToken(token.trim());
    onSaved();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
    >
      <div className="relative w-full max-w-md glass-surface-panel rounded-dialog shadow-2 border border-border p-5 sm:p-6 space-y-4 text-left outline-none">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {L('GitHub-Verbindung & Diagnose', 'GitHub Integration & Diagnostics')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {L('Öffentliche Datenbank für Vorschläge und Live-Synchronisation', 'Public repository for proposals and live synchronization')}
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

        {/* Live Status Diagnostic Card */}
        <div className="rounded-control bg-surface-2/80 border border-border p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text">
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span>{L('Verbindungsstatus', 'Connection Status')}</span>
            </div>
            <button
              type="button"
              onClick={() => runConnectionTest(repo, token)}
              disabled={isTesting}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-control bg-surface border border-border text-2xs font-semibold text-text-secondary hover:text-text transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{L('Verbindung prüfen', 'Test connection')}</span>
            </button>
          </div>

          {status ? (
            <div className="space-y-1.5 text-2xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{L('Repository:', 'Repository:')}</span>
                {status.ok ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-success">
                    <Check className="w-3.5 h-3.5" />
                    <span>{L('Erreichbar', 'Accessible')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-danger">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{L('Nicht erreichbar', 'Unreachable')}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{L('Berechtigung:', 'Permissions:')}</span>
                {status.canWrite ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-success">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {status.user
                        ? L(`Schreibzugriff (@${status.user})`, `Write access (@${status.user})`)
                        : L('Schreibzugriff aktiv', 'Write access active')}
                    </span>
                  </span>
                ) : (
                  <span className="font-semibold text-text-secondary">
                    {L('Nur Lesezugriff (Kein Token)', 'Read-only (No token)')}
                  </span>
                )}
              </div>

              {status.rateLimitRemaining !== undefined && status.rateLimitTotal !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">{L('API-Kontingent:', 'API Quota:')}</span>
                  <span className="font-mono font-semibold text-text">
                    {status.rateLimitRemaining} / {status.rateLimitTotal} {L('frei', 'remaining')}
                  </span>
                </div>
              )}

              {status.error && (
                <div className="pt-1 text-danger font-medium flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{status.error}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-2xs text-text-tertiary py-1">
              {L('Prüfe Verbindung zu GitHub...', 'Checking GitHub connection...')}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-text">
          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
              {L('GitHub Repository (owner/repo)', 'GitHub Repository (owner/repo)')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="nurimodabber/jy-resource-hub"
                className="w-full px-3 py-2.5 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent outline-none font-mono"
              />
            </div>
            <a
              href={`https://github.com/${repo}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-2xs text-accent hover:underline mt-1.5"
            >
              <span>{L('GitHub Issues öffnen', 'Open GitHub Issues')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1.5">
              <Key className="w-3 h-3 text-text-tertiary" />
              <span>{L('Personal Access Token (für Schreibzugriff)', 'Personal Access Token (for write access)')}</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_••••••••••••••••••••••••••••••••••••"
              className="w-full px-3 py-2.5 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent outline-none font-mono"
            />
            <p className="text-2xs text-text-tertiary mt-1.5 font-normal leading-relaxed">
              {L(
                'Mit hinterlegtem Token (Berechtigung: public_repo oder Issues Read/Write) setzen Klicks auf „Übernehmen“ oder „Löschen“ die Labels direkt live auf GitHub.',
                'With a token configured (scope: public_repo or Issues Read/Write), clicking Accept or Delete updates labels directly live on GitHub.'
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className={`${secondaryBtn} px-4 py-2 min-h-[44px] text-xs`}
            >
              {L('Abbrechen', 'Cancel')}
            </button>
            <button
              type="submit"
              className={`${primaryBtn} px-5 py-2 min-h-[44px] text-xs flex items-center gap-1.5`}
            >
              <Check className="w-4 h-4" />
              <span>{L('Speichern', 'Save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
