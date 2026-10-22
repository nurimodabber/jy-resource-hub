import React, { useState } from 'react';
import { X, Check, ExternalLink, Key, FolderGit2 } from 'lucide-react';
import { Language } from '../../types';
import { tr, Panel, primaryBtn, secondaryBtn } from '../tools/common';
import {
  getGitHubRepo,
  setGitHubRepo,
  getGitHubToken,
  setGitHubToken,
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
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs select-none"
    >
      <Panel className="max-w-md w-full p-5 sm:p-6 space-y-4 text-left shadow-2">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {L('GitHub-Verbindung', 'GitHub Integration')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {L('Vorschläge direkt aus GitHub Issues einbinden', 'Sync community submissions with GitHub Issues')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-control text-text-tertiary hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent focus:outline-hidden font-mono"
              />
            </div>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-2xs text-accent hover:underline mt-1"
            >
              <span>{L('Auf GitHub öffnen', 'View on GitHub')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1.5">
              <Key className="w-3 h-3 text-text-tertiary" />
              <span>{L('Personal Access Token (optional)', 'Personal Access Token (optional)')}</span>
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_••••••••••••••••••••••••••••••••••••"
              className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent focus:outline-hidden font-mono"
            />
            <p className="text-3xs text-text-tertiary mt-1">
              {L(
                'Nur nötig bei privaten Repositories oder um das GitHub-Ratenlimit für Anfragen zu erhöhen.',
                'Only needed for private repos or to increase the GitHub API rate limit.'
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className={`${secondaryBtn} px-4 py-2 min-h-[40px] text-xs`}
            >
              {L('Abbrechen', 'Cancel')}
            </button>
            <button
              type="submit"
              className={`${primaryBtn} px-5 py-2 min-h-[40px] text-xs flex items-center gap-1.5`}
            >
              <Check className="w-4 h-4" />
              <span>{L('Speichern', 'Save')}</span>
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
};
