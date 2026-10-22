import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Layers,
  Gamepad2,
  BookOpen,
  Inbox,
  History,
  RotateCcw,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  Eye,
  Download,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  GitPullRequest,
} from 'lucide-react';
import { Language, Game, GameCategory, EnergyLevel } from '../types';
import { tr, Panel, primaryBtn, secondaryBtn } from './tools/common';
import { isAuthenticated, getAdminSession, loginAdmin, logoutAdmin } from '../utils/adminAuth';
import { useAdminData, AdminSpyLocation, EmpireCategory } from '../context/AdminDataContext';
import { WhoAmIPack } from '../data/roleContent';
import { RuleIdea } from '../data/empireContent';
import { QUOTES_DATA } from '../data/quotes';
import { exportLocalData, downloadText } from '../utils/backup';
import { saveProposal, DataRevision, ProposalItem } from '../utils/adminRevisions';
import { fetchGitHubProposals, getGitHubRepo } from '../utils/githubIssues';
import { useToast } from '../context/ToastContext';

// Dedicated Sub-Editors
import { WhoAmIPackEditor } from './admin/WhoAmIPackEditor';
import { SpyLocationEditor } from './admin/SpyLocationEditor';
import { EmpireCategoryEditor } from './admin/EmpireCategoryEditor';
import { PsychiatristRuleEditor } from './admin/PsychiatristRuleEditor';
import { GitHubSettingsModal } from './admin/GitHubSettingsModal';

interface AdminViewProps {
  language: Language;
}

type AdminTab = 'overview' | 'games' | 'categories' | 'quotes' | 'inbox' | 'audit';

export const AdminView: React.FC<AdminViewProps> = ({ language }) => {
  const L = tr(language);
  const { showToast } = useToast();
  const adminData = useAdminData();

  // Authentication State
  const [authed, setAuthed] = useState<boolean>(() => isAuthenticated());
  const [usernameInput, setUsernameInput] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Sub-category Tab for Minigames
  const [categoryType, setCategoryType] = useState<'empire' | 'whoami' | 'spy' | 'psych'>('empire');

  // Modals & Drawers for Games & Minigames
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);

  const [editingWhoAmIPack, setEditingWhoAmIPack] = useState<WhoAmIPack | null>(null);
  const [isAddingWhoAmIPack, setIsAddingWhoAmIPack] = useState(false);

  const [editingSpyLoc, setEditingSpyLoc] = useState<AdminSpyLocation | null>(null);
  const [isAddingSpyLoc, setIsAddingSpyLoc] = useState(false);

  const [editingEmpireCat, setEditingEmpireCat] = useState<EmpireCategory | null>(null);
  const [isAddingEmpireCat, setIsAddingEmpireCat] = useState(false);

  const [editingPsychRule, setEditingPsychRule] = useState<RuleIdea | null>(null);
  const [isAddingPsychRule, setIsAddingPsychRule] = useState(false);

  // Revisions & Audit Log
  const [selectedRevision, setSelectedRevision] = useState<DataRevision | null>(null);
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // GitHub Issues Integration State
  const [isGitHubSettingsOpen, setIsGitHubSettingsOpen] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [gitHubProposals, setGitHubProposals] = useState<ProposalItem[]>([]);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'github' | 'local'>('all');
  const [ghRepoName, setGhRepoName] = useState(() => getGitHubRepo());

  const currentSession = getAdminSession();
  const currentAuthor = currentSession?.author || 'Administrator';

  // GitHub Sync Callback
  const handleSyncGitHub = useCallback(async (quiet = false) => {
    setIsSyncingGitHub(true);
    const res = await fetchGitHubProposals();
    setIsSyncingGitHub(false);
    if (res.ok) {
      setGitHubProposals(res.issues);
      if (!quiet) {
        showToast({
          text: language === 'de'
            ? `${res.issues.length} Vorschläge aus GitHub geladen`
            : `Loaded ${res.issues.length} proposals from GitHub`,
        });
      }
    } else if (!quiet) {
      showToast({ text: res.error || 'Fehler beim Abrufen der GitHub Issues' });
    }
  }, [language, showToast]);

  // Auto-sync when entering inbox tab if not loaded yet
  useEffect(() => {
    if (authed && activeTab === 'inbox' && gitHubProposals.length === 0) {
      handleSyncGitHub(true);
    }
  }, [authed, activeTab, gitHubProposals.length, handleSyncGitHub]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await loginAdmin(usernameInput, passphrase);
    if (res.ok) {
      setAuthed(true);
      setPassphrase('');
      showToast({ text: L(`Willkommen zurück, ${res.session?.author || 'Admin'}!`, `Welcome back, ${res.session?.author || 'Admin'}!`) });
    } else {
      setAuthError(res.error || 'Fehler beim Anmelden');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
    showToast({ text: L('Abgemeldet', 'Logged out') });
  };

  // Filtered lists
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return adminData.games;
    const q = searchQuery.toLowerCase();
    return adminData.games.filter(
      (g) =>
        g.title.de.toLowerCase().includes(q) ||
        g.title.en.toLowerCase().includes(q) ||
        g.summary.de.toLowerCase().includes(q)
    );
  }, [adminData.games, searchQuery]);

  const filteredRevisions = useMemo(() => {
    if (!searchQuery.trim()) return adminData.revisions;
    const q = searchQuery.toLowerCase();
    return adminData.revisions.filter(
      (r) =>
        r.summary.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.entityId.toLowerCase().includes(q) ||
        r.collection.toLowerCase().includes(q)
    );
  }, [adminData.revisions, searchQuery]);

  // Combined Proposals Feed (Local + GitHub)
  const combinedProposals = useMemo(() => {
    const local = adminData.proposals;
    const gh = gitHubProposals.filter((g) => !local.some((l) => l.id === g.id));

    if (inboxFilter === 'local') return local;
    if (inboxFilter === 'github') return gh;
    return [...gh, ...local];
  }, [adminData.proposals, gitHubProposals, inboxFilter]);

  // Rollback Action
  const handleRollback = (revisionId: string) => {
    const rev = adminData.rollback(revisionId, currentAuthor);
    if (rev) {
      showToast({ text: L('Rollback erfolgreich ausgeführt', 'Rollback successfully applied') });
      setSelectedRevision(null);
    } else {
      showToast({ text: L('Rollback fehlgeschlagen', 'Rollback failed') });
    }
  };

  // Accept Proposal (from local or GitHub)
  const handleAcceptProposal = (prop: ProposalItem) => {
    if (!adminData.proposals.some((p) => p.id === prop.id)) {
      saveProposal(prop);
      adminData.refresh();
    }
    adminData.acceptProposal(prop.id, currentAuthor);
    showToast({ text: L('Vorschlag als Entwurf übernommen', 'Proposal accepted as draft') });
  };

  // Create sample proposal for instant local testing
  const handleCreateSampleProposal = () => {
    saveProposal({
      type: 'kategorie',
      title: 'Dinge, die man im Zeltlager um Mitternacht hört',
      summary: 'Lustige und typische Geräusche und Sätze, wenn alle eigentlich schlafen sollten.',
      authorName: 'Muster-Animator',
      authorEmail: 'animator@example.org',
    });
    adminData.refresh();
    showToast({ text: L('Beispiel-Vorschlag im Eingang erstellt', 'Sample proposal created in inbox') });
  };

  // =========================================================================
  // 1. PASSWORD GATE
  // =========================================================================
  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <Panel className="p-6 sm:p-8 space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" strokeWidth={1.75} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-text">
              {L('Admin-Bereich', 'Admin Dashboard')}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {L(
                'Geschützter Verwaltungsbereich mit Revisions-Protokoll und Live-Sync.',
                'Protected management dashboard with append-only revision logging and live sync.'
              )}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-2xs font-bold text-text uppercase tracking-wider mb-1">
                {L('Benutzername', 'Username')}
              </label>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="z. B. nuri oder lasse"
                className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-text uppercase tracking-wider mb-1">
                {L('Passwort', 'Password')}
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className={`${primaryBtn} w-full py-2.5 min-h-[44px] text-sm flex items-center justify-center gap-2 cursor-pointer`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{L('Anmelden', 'Sign In')}</span>
            </button>
          </form>

          <p className="text-2xs text-text-tertiary pt-2 border-t border-border/50">
            {L(
              'Geschützter Redaktionszugang für autorisierte Accounts mit kryptografischer SHA-256-Prüfung.',
              'Protected editorial access for authorized accounts with cryptographic SHA-256 validation.'
            )}
          </p>
        </Panel>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Live-Sync aktiv" />
            <h1 className="text-2xl font-black tracking-tight text-text">
              {L('Admin-Dashboard', 'Admin Dashboard')}
            </h1>
            <span className="text-2xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold uppercase tracking-wider">
              Phase 4 · Live
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {L('Angemeldet als:', 'Logged in as:')} <strong className="text-text">{currentAuthor}</strong> · {L('Änderungen wirken sofort live und sind 100 % revisionssicher.', 'Edits apply live instantly and are fully auditable.')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsGitHubSettingsOpen(true)}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            title={L('GitHub Repository Verbindung anpassen', 'Configure GitHub repository integration')}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-accent" />
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const json = exportLocalData();
              downloadText(`jy-hub-backup-${new Date().toISOString().slice(0, 10)}.json`, json);
              showToast({ text: L('Backup heruntergeladen', 'Backup downloaded') });
            }}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
            title={L('Komplettes Backup inklusive Revisionsverlauf herunterladen', 'Download full backup including revisions')}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{L('Backup', 'Backup')}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 min-h-[38px] rounded-control bg-surface-2 hover:bg-rose-500/15 hover:text-rose-500 border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{L('Abmelden', 'Log Out')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border/40 scrollbar-none" role="tablist">
        {[
          { id: 'overview', label: L('Übersicht', 'Overview'), icon: Layers },
          { id: 'games', label: `${L('Spiele', 'Games')} (${adminData.games.length})`, icon: Gamepad2 },
          { id: 'categories', label: L('Minispiel-Kategorien', 'Minigame Categories'), icon: Sparkles },
          { id: 'quotes', label: `${L('Zitate', 'Quotes')} (${QUOTES_DATA.length})`, icon: BookOpen },
          { id: 'inbox', label: `${L('Vorschläge', 'Inbox')} (${combinedProposals.filter(p => p.status === 'pending').length})`, icon: Inbox },
          { id: 'audit', label: `${L('Revisions-Log', 'Audit Log')} (${adminData.revisions.length})`, icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => {
              setActiveTab(id as AdminTab);
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 min-h-[40px] rounded-control text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === id
                ? 'bg-accent text-accent-contrast shadow-xs'
                : 'text-text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* TAB: OVERVIEW                                                       */}
      {/* =================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Panel className="p-4 sm:p-5 text-center space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Aktive Spiele', 'Active Games')}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-text tabular-nums">
                {adminData.games.length}
              </p>
            </Panel>

            <Panel className="p-4 sm:p-5 text-center space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Minispiel-Pakete', 'Minigame Packs')}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-text tabular-nums">
                {adminData.whoAmIPacks.length + adminData.empireCategories.length + adminData.spyLocations.length + adminData.psychiatristRules.length}
              </p>
            </Panel>

            <Panel className="p-4 sm:p-5 text-center space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Vorschläge im Eingang', 'Inbox Proposals')}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-accent tabular-nums">
                {combinedProposals.filter((p) => p.status === 'pending').length}
              </p>
            </Panel>

            <Panel className="p-4 sm:p-5 text-center space-y-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {L('Revisions-Schnappschüsse', 'Total Revisions')}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-text tabular-nums">
                {adminData.revisions.length}
              </p>
            </Panel>
          </div>

          {/* Quick Actions Panel */}
          <Panel className="p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">
              {L('Schnellzugriff & Aktionen', 'Quick Actions')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('categories');
                  setCategoryType('whoami');
                  setIsAddingWhoAmIPack(true);
                }}
                className="p-3.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text">{L('Wer-bin-ich Paket anlegen', 'New Who Am I Pack')}</p>
                  <p className="text-2xs text-text-tertiary">{L('Figuren & Charaktere hinzufügen', 'Add figures & terms')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('inbox');
                  handleSyncGitHub();
                }}
                className="p-3.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-control bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text">{L('GitHub Issues synchronisieren', 'Sync GitHub Issues')}</p>
                  <p className="text-2xs text-text-tertiary">{L(`Repo: ${ghRepoName}`, `Repo: ${ghRepoName}`)}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className="p-3.5 rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-left transition-all cursor-pointer flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-control bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text">{L('Audit-Log & Rollback', 'Audit Log & Rollback')}</p>
                  <p className="text-2xs text-text-tertiary">{L('1-Klick-Wiederherstellung', '1-click non-destructive restore')}</p>
                </div>
              </button>
            </div>
          </Panel>

          {/* GitHub Integration Info Banner */}
          <div className="p-4 rounded-card bg-surface-2 border border-border text-xs text-text-secondary flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-text">
                <FolderGit2 className="w-4 h-4 text-accent" />
                <span>{L('GitHub Community-Integration aktiv', 'GitHub Community Integration Active')}</span>
              </div>
              <p className="text-2xs leading-relaxed max-w-2xl">
                {L(
                  `Nutzer-Einreichungen aus dem Vorschlagen-Formular fließen direkt in GitHub Issues unter "${ghRepoName}". Im Reiter „Vorschläge“ kannst du diese live synchronisieren, ansehen und mit 1 Klick als Entwurf in die lokale Datenbank übernehmen.`,
                  `User submissions stream into GitHub Issues at "${ghRepoName}". In the "Inbox" tab you can sync them live, review details, and approve them with one click into the database.`
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGitHubSettingsOpen(true)}
              className="px-3 py-1.5 rounded-control bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-raised transition-colors shrink-0 cursor-pointer"
            >
              {L('Einstellungen', 'Settings')}
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: GAMES                                                          */}
      {/* =================================================================== */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={L('Spiele durchsuchen...', 'Search games...')}
                className="w-full pl-9 pr-4 py-2 min-h-[40px] rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setIsAddingGame(true)}
              className={`${primaryBtn} px-4 py-2 min-h-[40px] text-xs flex items-center gap-1.5 shrink-0`}
            >
              <Plus className="w-4 h-4" />
              <span>{L('Neues Spiel hinzufügen', 'Add New Game')}</span>
            </button>
          </div>

          <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-surface-2/50 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text truncate">
                      {game.title[language] || game.title.de}
                    </span>
                    {game.status === 'draft' && (
                      <span className="text-3xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                        Draft
                      </span>
                    )}
                    <span className="text-2xs text-text-tertiary shrink-0">
                      ID: {game.id}
                    </span>
                  </div>
                  <p className="text-2xs text-text-secondary line-clamp-1">
                    {game.summary[language] || game.summary.de}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingGame(game)}
                    className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-surface-2 text-text-secondary hover:text-text transition-colors cursor-pointer flex items-center justify-center"
                    title={L('Bearbeiten', 'Edit')}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(L(`Soll das Spiel „${game.title.de}“ wirklich deaktiviert werden? (Reversibel im Revisions-Log)`, `Deactivate "${game.title.de}"? (Reversible in audit log)`))) {
                        adminData.deleteGame(game.id, currentAuthor);
                        showToast({ text: L('Spiel deaktiviert (Soft-Delete)', 'Game deactivated') });
                      }
                    }}
                    className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-rose-500/15 text-text-tertiary hover:text-rose-500 transition-colors cursor-pointer flex items-center justify-center"
                    title={L('Deaktivieren (Soft-Delete)', 'Deactivate')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: MINIGAME CATEGORIES & CHARACTER EDITORS                        */}
      {/* =================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Sub-selector Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-control border border-border w-fit">
              {[
                { id: 'empire' as const, label: `Empire (${adminData.empireCategories.length})` },
                { id: 'whoami' as const, label: `Wer bin ich (${adminData.whoAmIPacks.length})` },
                { id: 'spy' as const, label: `Spion (${adminData.spyLocations.length})` },
                { id: 'psych' as const, label: `Psychiater (${adminData.psychiatristRules.length})` },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategoryType(id)}
                  className={`px-3 py-1.5 min-h-[34px] rounded-control text-xs font-bold transition-all cursor-pointer ${
                    categoryType === id ? 'bg-surface text-text shadow-xs' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Quick Add Button for the selected subcategory */}
            {categoryType === 'empire' && (
              <button
                type="button"
                onClick={() => setIsAddingEmpireCat(true)}
                className={`${primaryBtn} px-3.5 py-1.5 min-h-[36px] text-xs flex items-center gap-1.5 shrink-0`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{L('Neue Empire-Kategorie', 'New Empire Topic')}</span>
              </button>
            )}

            {categoryType === 'whoami' && (
              <button
                type="button"
                onClick={() => setIsAddingWhoAmIPack(true)}
                className={`${primaryBtn} px-3.5 py-1.5 min-h-[36px] text-xs flex items-center gap-1.5 shrink-0`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{L('Neues Wer-bin-ich Paket', 'New Who Am I Pack')}</span>
              </button>
            )}

            {categoryType === 'spy' && (
              <button
                type="button"
                onClick={() => setIsAddingSpyLoc(true)}
                className={`${primaryBtn} px-3.5 py-1.5 min-h-[36px] text-xs flex items-center gap-1.5 shrink-0`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{L('Neuen Spion-Ort', 'New Spy Location')}</span>
              </button>
            )}

            {categoryType === 'psych' && (
              <button
                type="button"
                onClick={() => setIsAddingPsychRule(true)}
                className={`${primaryBtn} px-3.5 py-1.5 min-h-[36px] text-xs flex items-center gap-1.5 shrink-0`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{L('Neue Psychiater-Regel', 'New Psychiatrist Rule')}</span>
              </button>
            )}
          </div>

          {/* Empire Topics */}
          {categoryType === 'empire' && (
            <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
              {adminData.empireCategories.map((cat) => (
                <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-2/40">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text truncate">{cat.prompt[language] || cat.prompt.de}</p>
                      <span className="text-3xs uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-surface-2 text-text-tertiary border border-border">
                        {cat.mood}
                      </span>
                    </div>
                    <p className="text-2xs text-text-secondary truncate">{cat.hint[language] || cat.hint.de}</p>
                    <div className="flex items-center gap-1.5 pt-0.5 text-3xs text-text-tertiary">
                      <span>{L('Beispiele:', 'Examples:')}</span>
                      <span className="truncate italic">
                        {(cat.examples[language] || cat.examples.de).join(' · ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingEmpireCat(cat)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-surface-2 text-text-secondary hover:text-text transition-colors cursor-pointer"
                      title={L('Kategorie bearbeiten', 'Edit topic')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(L(`Kategorie „${cat.prompt.de}“ deaktivieren?`, `Deactivate category?`))) {
                          adminData.deleteEmpireCategory(cat.id, currentAuthor);
                          showToast({ text: L('Kategorie deaktiviert', 'Category deactivated') });
                        }
                      }}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-rose-500/15 text-text-tertiary hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Who Am I Packs (Individual Character Customization) */}
          {categoryType === 'whoami' && (
            <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
              {adminData.whoAmIPacks.map((pack) => (
                <div key={pack.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-2/40">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text truncate">{pack.name[language] || pack.name.de}</p>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                        {pack.entries.length} {L('Figuren & Begriffe', 'figures')}
                      </span>
                      <span className="text-3xs text-text-tertiary">
                        {pack.difficulty === 1 ? L('Stufe 1 (Leicht)', 'Level 1') : pack.difficulty === 2 ? L('Stufe 2 (Mittel)', 'Level 2') : L('Stufe 3 (Experte)', 'Level 3')}
                      </span>
                    </div>
                    <p className="text-2xs text-text-secondary truncate">
                      {pack.entries.slice(0, 6).map((e) => e.de).join(', ')}...
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingWhoAmIPack(pack)}
                      className="px-2.5 py-1.5 min-h-[36px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={L('Figuren & Begriffe bearbeiten', 'Edit figures & terms')}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-accent" />
                      <span>{L('Figuren anpassen', 'Customize figures')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(L(`Paket „${pack.name.de}“ deaktivieren?`, `Deactivate pack?`))) {
                          adminData.deleteWhoAmIPack(pack.id, currentAuthor);
                          showToast({ text: L('Paket deaktiviert', 'Pack deactivated') });
                        }
                      }}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-rose-500/15 text-text-tertiary hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spy Locations (7 Roles Customization) */}
          {categoryType === 'spy' && (
            <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
              {adminData.spyLocations.map((loc) => (
                <div key={loc.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-2/40">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text truncate">{loc.name[language] || loc.name.de}</p>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                        {loc.roles.length} {L('Rollen', 'roles')}
                      </span>
                    </div>
                    <p className="text-2xs text-text-secondary truncate">
                      {loc.roles.map((r) => r.de).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingSpyLoc(loc)}
                      className="px-2.5 py-1.5 min-h-[36px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={L('Rollen anpassen', 'Edit roles')}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-accent" />
                      <span>{L('Rollen bearbeiten', 'Edit roles')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(L(`Ort „${loc.name.de}“ deaktivieren?`, `Deactivate location?`))) {
                          adminData.deleteSpyLocation(loc.id, currentAuthor);
                          showToast({ text: L('Ort deaktiviert', 'Location deactivated') });
                        }
                      }}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-rose-500/15 text-text-tertiary hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Psychiatrist Rules */}
          {categoryType === 'psych' && (
            <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
              {adminData.psychiatristRules.map((rule) => (
                <div key={rule.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-surface-2/40">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-text truncate">„{rule.text[language] || rule.text.de}“</p>
                    <span className="text-2xs text-accent font-semibold">Stufe {rule.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingPsychRule(rule)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-surface-2 text-text-secondary hover:text-text transition-colors cursor-pointer"
                      title={L('Regel bearbeiten', 'Edit rule')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(L(`Regel deaktivieren?`, `Deactivate rule?`))) {
                          adminData.deletePsychiatristRule(rule.id, currentAuthor);
                          showToast({ text: L('Regel deaktiviert', 'Rule deactivated') });
                        }
                      }}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-control hover:bg-rose-500/15 text-text-tertiary hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: QUOTES & TAGS (STRICT READ-ONLY FOR SCRIPTURE PER RULE 1)       */}
      {/* =================================================================== */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-card bg-surface-2 border border-border text-xs text-text-secondary flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-text">
                {L('Integrität der heiligen Schriften (Regel 1)', 'Scripture Integrity (Rule 1)')}
              </p>
              <p className="text-2xs leading-relaxed">
                {L(
                  'Heilige Texte (QUOTES_DATA) sind kanonisch unveränderlich und schreibgeschützt. Hier können Verknüpfungen, Buch-Zuordnungen und Themen-Tags überprüft werden.',
                  'Sacred scripture (QUOTES_DATA) is immutable by project rule. Here you can inspect theme tags, lesson mapping, and audio links.'
                )}
              </p>
            </div>
          </div>

          <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
            {QUOTES_DATA.map((quote) => (
              <div key={quote.id} className="p-3.5 sm:p-4 hover:bg-surface-2/40 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                      {quote.book ? (typeof quote.book === 'object' ? quote.book.de : `Buch ${quote.book}`) : 'Allgemein'}
                    </span>
                    <span className="text-xs font-bold text-text">{quote.theme.de}</span>
                  </div>
                  <span className="text-2xs text-text-tertiary">{quote.source.de}</span>
                </div>
                <p className="text-xs font-serif text-text/90 italic line-clamp-2 pt-0.5">
                  „{quote.textDe}“
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: PROPOSALS INBOX (WITH LIVE GITHUB ISSUES INTEGRATION)          */}
      {/* =================================================================== */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Inbox Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-control border border-border w-fit text-2xs font-bold">
              <button
                type="button"
                onClick={() => setInboxFilter('all')}
                className={`px-3 py-1.5 rounded-control transition-all cursor-pointer ${
                  inboxFilter === 'all' ? 'bg-surface text-text shadow-xs' : 'text-text-secondary hover:text-text'
                }`}
              >
                {L('Alle Vorschläge', 'All')} ({combinedProposals.length})
              </button>
              <button
                type="button"
                onClick={() => setInboxFilter('github')}
                className={`px-3 py-1.5 rounded-control transition-all cursor-pointer flex items-center gap-1.5 ${
                  inboxFilter === 'github' ? 'bg-surface text-text shadow-xs' : 'text-text-secondary hover:text-text'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />
                <span>GitHub ({gitHubProposals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setInboxFilter('local')}
                className={`px-3 py-1.5 rounded-control transition-all cursor-pointer ${
                  inboxFilter === 'local' ? 'bg-surface text-text shadow-xs' : 'text-text-secondary hover:text-text'
                }`}
              >
                {L('Lokal', 'Local')} ({adminData.proposals.length})
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSyncGitHub()}
                disabled={isSyncingGitHub}
                className="px-3 py-1.5 min-h-[36px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title={L('Offene Issues von GitHub neu laden', 'Refresh open issues from GitHub')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-accent' : ''}`} />
                <span>{isSyncingGitHub ? L('Synchronisiere...', 'Syncing...') : L('GitHub Sync', 'GitHub Sync')}</span>
              </button>

              <button
                type="button"
                onClick={handleCreateSampleProposal}
                className="px-3 py-1.5 min-h-[36px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{L('Test-Vorschlag', 'Test Item')}</span>
              </button>
            </div>
          </div>

          {combinedProposals.length === 0 ? (
            <Panel className="p-8 text-center space-y-3">
              <Inbox className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
              <p className="text-sm font-bold text-text">{L('Keine offenen Vorschläge', 'No pending proposals')}</p>
              <p className="text-xs text-text-tertiary max-w-md mx-auto">
                {L(
                  'Vorschläge, die Nutzer über das Vorschlagen-Formular oder direkt als GitHub Issue einreichen, erscheinen automatisch hier.',
                  'Submissions created via the proposal form or as GitHub issues will appear here automatically.'
                )}
              </p>
              <button
                type="button"
                onClick={() => handleSyncGitHub()}
                className={`${secondaryBtn} px-4 py-2 min-h-[38px] text-xs inline-flex items-center gap-1.5 mx-auto`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{L('GitHub prüfen', 'Check GitHub')}</span>
              </button>
            </Panel>
          ) : (
            <div className="space-y-3">
              {combinedProposals.map((prop) => {
                const isGithub = !!prop.payload?.githubIssueNumber;
                return (
                  <Panel key={prop.id} className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                            {prop.type}
                          </span>

                          {isGithub ? (
                            <a
                              href={prop.payload?.githubUrl as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:underline"
                            >
                              <GitPullRequest className="w-3 h-3" />
                              <span>GitHub #{prop.payload?.githubIssueNumber as number}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </a>
                          ) : (
                            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-surface-2 text-text-tertiary border border-border">
                              Lokal
                            </span>
                          )}

                          <h3 className="text-sm font-bold text-text truncate">{prop.title}</h3>

                          <span className={`text-3xs font-bold uppercase px-1.5 py-0.5 rounded-full ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : prop.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}>
                            {prop.status}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary leading-relaxed">{prop.summary}</p>

                        <div className="flex items-center gap-3 text-2xs text-text-tertiary pt-1">
                          <div className="flex items-center gap-1.5">
                            {typeof prop.payload?.githubUserAvatar === 'string' && (
                              <img
                                src={prop.payload.githubUserAvatar}
                                alt=""
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span>{L('Von:', 'By:')} <strong className="text-text-secondary">{prop.authorName || 'Anonym'}</strong></span>
                          </div>
                          <span>·</span>
                          <span>{new Date(prop.createdAt).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}</span>
                        </div>
                      </div>

                      {prop.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAcceptProposal(prop)}
                            className={`${primaryBtn} px-3 py-1.5 min-h-[36px] text-xs flex items-center gap-1.5`}
                            title={L('Als Entwurf in die Datenbank übernehmen', 'Approve into database as draft')}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{L('Übernehmen', 'Accept')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRejectingProposalId(prop.id);
                              setRejectReason('');
                            }}
                            className="px-3 py-1.5 min-h-[36px] rounded-control bg-surface-2 hover:bg-rose-500/15 hover:text-rose-500 border border-border text-xs font-semibold text-text flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{L('Ablehnen', 'Reject')}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {rejectingProposalId === prop.id && (
                      <div className="pt-3 border-t border-border/60 space-y-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={L('Grund für Ablehnung (optional)', 'Reason for rejection (optional)')}
                          className="w-full px-3 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent focus:outline-hidden"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRejectingProposalId(null)}
                            className="text-2xs text-text-tertiary hover:underline px-2"
                          >
                            {L('Abbrechen', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              adminData.rejectProposal(prop.id, rejectReason, currentAuthor);
                              setRejectingProposalId(null);
                              showToast({ text: L('Vorschlag archiviert', 'Proposal rejected') });
                            }}
                            className="px-3 py-1 rounded-control bg-rose-500 text-white text-xs font-bold cursor-pointer"
                          >
                            {L('Bestätigen', 'Confirm')}
                          </button>
                        </div>
                      </div>
                    )}
                  </Panel>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: AUDIT LOG & 1-CLICK ROLLBACK (CRITICAL NON-DESTRUCTIVE LOG)    */}
      {/* =================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={L('Revisions-Log durchsuchen...', 'Search audit log...')}
                className="w-full pl-9 pr-4 py-2 min-h-[40px] rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <span className="text-2xs text-text-tertiary">
              {filteredRevisions.length} {L('Schnappschüsse gespeichert', 'snapshots recorded')}
            </span>
          </div>

          {filteredRevisions.length === 0 ? (
            <Panel className="p-8 text-center space-y-2">
              <History className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
              <p className="text-sm font-bold text-text">{L('Noch keine Revisionen erfasst', 'No revisions yet')}</p>
              <p className="text-xs text-text-tertiary">
                {L('Jede Erstellung, Bearbeitung oder Löschung erzeugt hier automatisch einen unlöschbaren Schnappschuss.', 'Every edit or soft-deletion will automatically be recorded here.')}
              </p>
            </Panel>
          ) : (
            <div className="divide-y divide-border/60 rounded-card border border-border bg-surface overflow-hidden">
              {filteredRevisions.map((rev) => (
                <div key={rev.revisionId} className="p-3.5 sm:p-4 hover:bg-surface-2/40 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          rev.action === 'create'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : rev.action === 'update'
                            ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                            : rev.action === 'soft_delete'
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            : 'bg-purple-500/15 text-purple-500 border border-purple-500/30'
                        }`}>
                          {rev.action}
                        </span>

                        <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                          {rev.collection} · {rev.entityId}
                        </span>

                        <span className="text-2xs text-text-tertiary">
                          {new Date(rev.timestamp).toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-text">{rev.summary}</p>
                      <p className="text-2xs text-text-tertiary">
                        {L('Autor:', 'Author:')} <strong className="text-text-secondary">{rev.author}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedRevision(selectedRevision?.revisionId === rev.revisionId ? null : rev)}
                        className="px-2.5 py-1 min-h-[34px] rounded-control bg-surface-2 hover:bg-surface-raised border border-border text-xs font-semibold text-text flex items-center gap-1 transition-colors cursor-pointer"
                        title={L('Schnappschuss-Details ansehen', 'View snapshot')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{L('Details', 'Details')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRollback(rev.revisionId)}
                        className="px-3 py-1 min-h-[34px] rounded-control bg-accent/15 hover:bg-accent text-accent hover:text-accent-contrast border border-accent/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                        title={L('1-Klick-Rollback auf diesen Zustand', 'Roll back to this state')}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{L('Wiederherstellen', 'Rollback')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Snapshot Inspector */}
                  {selectedRevision?.revisionId === rev.revisionId && (
                    <div className="p-3 rounded-control bg-surface-2 border border-border text-2xs space-y-2 mt-2">
                      <p className="font-bold text-text uppercase tracking-wider">
                        {L('Schnappschuss-Vergleich (Diff)', 'Snapshot Inspector')}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto font-mono">
                        <div>
                          <p className="text-text-tertiary font-bold mb-1">{L('Vorheriger Zustand:', 'Previous State:')}</p>
                          <pre className="p-2 rounded-control bg-surface border border-border overflow-x-auto text-text-secondary">
                            {rev.previousSnapshot ? JSON.stringify(rev.previousSnapshot, null, 2) : 'null'}
                          </pre>
                        </div>
                        <div>
                          <p className="text-accent font-bold mb-1">{L('Neuer Zustand:', 'New State:')}</p>
                          <pre className="p-2 rounded-control bg-surface border border-border overflow-x-auto text-text">
                            {rev.newSnapshot ? JSON.stringify(rev.newSnapshot, null, 2) : 'null (Soft-Deleted)'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* EDIT / CREATE GAME MODAL                                            */}
      {/* =================================================================== */}
      {(editingGame || isAddingGame) && (
        <GameEditModal
          game={editingGame}
          language={language}
          onClose={() => {
            setEditingGame(null);
            setIsAddingGame(false);
          }}
          onSave={(gameData) => {
            adminData.saveGame(
              gameData,
              currentAuthor,
              isAddingGame ? `Neues Spiel "${gameData.title.de}" angelegt` : `Spiel "${gameData.title.de}" bearbeitet`
            );
            setEditingGame(null);
            setIsAddingGame(false);
            showToast({ text: L('Spiel gespeichert (status: draft)', 'Game saved as draft') });
          }}
        />
      )}

      {/* WHO AM I PACK & CHARACTER EDITOR */}
      {(editingWhoAmIPack || isAddingWhoAmIPack) && (
        <WhoAmIPackEditor
          pack={editingWhoAmIPack}
          language={language}
          onClose={() => {
            setEditingWhoAmIPack(null);
            setIsAddingWhoAmIPack(false);
          }}
          onSave={(packData) => {
            adminData.saveWhoAmIPack(
              packData,
              currentAuthor,
              isAddingWhoAmIPack ? `Neues Wer-bin-ich Paket "${packData.name.de}" angelegt` : `Wer-bin-ich Paket "${packData.name.de}" (${packData.entries.length} Figuren) bearbeitet`
            );
            setEditingWhoAmIPack(null);
            setIsAddingWhoAmIPack(false);
            showToast({ text: L('Paket & Figuren gespeichert (status: draft)', 'Pack & figures saved as draft') });
          }}
        />
      )}

      {/* SPY LOCATION & 7 ROLES EDITOR */}
      {(editingSpyLoc || isAddingSpyLoc) && (
        <SpyLocationEditor
          location={editingSpyLoc}
          language={language}
          onClose={() => {
            setEditingSpyLoc(null);
            setIsAddingSpyLoc(false);
          }}
          onSave={(locData) => {
            adminData.saveSpyLocation(
              locData,
              currentAuthor,
              isAddingSpyLoc ? `Neuer Spion-Ort "${locData.name.de}" angelegt` : `Spion-Ort "${locData.name.de}" (${locData.roles.length} Rollen) bearbeitet`
            );
            setEditingSpyLoc(null);
            setIsAddingSpyLoc(false);
            showToast({ text: L('Spion-Ort & Rollen gespeichert (status: draft)', 'Spy location & roles saved as draft') });
          }}
        />
      )}

      {/* EMPIRE CATEGORY & EXAMPLES EDITOR */}
      {(editingEmpireCat || isAddingEmpireCat) && (
        <EmpireCategoryEditor
          category={editingEmpireCat}
          language={language}
          onClose={() => {
            setEditingEmpireCat(null);
            setIsAddingEmpireCat(false);
          }}
          onSave={(catData) => {
            adminData.saveEmpireCategory(
              catData,
              currentAuthor,
              isAddingEmpireCat ? `Neue Empire-Kategorie "${catData.prompt.de}" angelegt` : `Empire-Kategorie "${catData.prompt.de}" bearbeitet`
            );
            setEditingEmpireCat(null);
            setIsAddingEmpireCat(false);
            showToast({ text: L('Empire-Kategorie gespeichert (status: draft)', 'Empire topic saved as draft') });
          }}
        />
      )}

      {/* PSYCHIATRIST RULE EDITOR */}
      {(editingPsychRule || isAddingPsychRule) && (
        <PsychiatristRuleEditor
          rule={editingPsychRule}
          language={language}
          onClose={() => {
            setEditingPsychRule(null);
            setIsAddingPsychRule(false);
          }}
          onSave={(ruleData) => {
            adminData.savePsychiatristRule(
              ruleData,
              currentAuthor,
              isAddingPsychRule ? `Neue Psychiater-Regel angelegt` : `Psychiater-Regel "${ruleData.text.de}" bearbeitet`
            );
            setEditingPsychRule(null);
            setIsAddingPsychRule(false);
            showToast({ text: L('Psychiater-Regel gespeichert (status: draft)', 'Psychiatrist rule saved as draft') });
          }}
        />
      )}

      {/* GITHUB SETTINGS MODAL */}
      {isGitHubSettingsOpen && (
        <GitHubSettingsModal
          language={language}
          onClose={() => setIsGitHubSettingsOpen(false)}
          onSaved={() => {
            setGhRepoName(getGitHubRepo());
            handleSyncGitHub(false);
          }}
        />
      )}
    </div>
  );
};

/** Inline Game Edit / Create Modal */
const GameEditModal: React.FC<{
  game: Game | null;
  language: Language;
  onClose: () => void;
  onSave: (game: Game) => void;
}> = ({ game, language, onClose, onSave }) => {
  const L = tr(language);

  const [id, setId] = useState(game?.id || `game_${Date.now()}`);
  const [titleDe, setTitleDe] = useState(game?.title.de || '');
  const [titleEn, setTitleEn] = useState(game?.title.en || '');
  const [summaryDe, setSummaryDe] = useState(game?.summary.de || '');
  const [summaryEn, setSummaryEn] = useState(game?.summary.en || '');
  const [category, setCategory] = useState(game?.category || 'cooperative');
  const [energyLevel, setEnergyLevel] = useState(game?.energyLevel || 'medium');
  const [minPlayers, setMinPlayers] = useState(game?.groupSize.min || 4);
  const [maxPlayers, setMaxPlayers] = useState(game?.groupSize.max || 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Game = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      title: { de: titleDe.trim() || 'Unbenanntes Spiel', en: titleEn.trim() || titleDe.trim() || 'Untitled Game' },
      category: category as GameCategory,
      energyLevel: energyLevel as EnergyLevel,
      purpose: game?.purpose || 'zusammenarbeit',
      groupSize: { min: Number(minPlayers), max: Number(maxPlayers) },
      prepLevel: game?.prepLevel || 'instant',
      materials: game?.materials || { de: [], en: [] },
      durationMinutes: game?.durationMinutes || '15 Min',
      durationMin: game?.durationMin || 10,
      durationMax: game?.durationMax || 20,
      space: game?.space || { de: 'Drinnen oder draußen', en: 'Indoors or outdoors' },
      summary: { de: summaryDe.trim(), en: summaryEn.trim() || summaryDe.trim() },
      idea: game?.idea || { de: summaryDe.trim(), en: summaryEn.trim() || summaryDe.trim() },
      rules: game?.rules || { de: [summaryDe.trim()], en: [summaryEn.trim() || summaryDe.trim()] },
      animatorTips: game?.animatorTips || { de: [], en: [] },
      status: 'draft',
      submittedBy: game?.submittedBy || 'Admin',
    };
    onSave(updated);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] glass-surface-panel rounded-dialog shadow-2 border border-border overflow-y-auto p-6 space-y-4 text-left outline-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <h2 className="text-base font-bold text-text">
            {game ? L('Spiel bearbeiten', 'Edit Game') : L('Neues Spiel anlegen', 'New Game')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-control text-text-tertiary hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-text">
          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
              {L('Eindeutige ID', 'Identifier ID')}
            </label>
            <input
              type="text"
              required
              disabled={!!game}
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Titel (Deutsch)', 'Title (German)')}
              </label>
              <input
                type="text"
                required
                value={titleDe}
                onChange={(e) => setTitleDe(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Titel (Englisch)', 'Title (English)')}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Kurzbeschreibung (Deutsch)', 'Summary (German)')}
              </label>
              <textarea
                rows={3}
                required
                value={summaryDe}
                onChange={(e) => setSummaryDe(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Kurzbeschreibung (Englisch)', 'Summary (English)')}
              </label>
              <textarea
                rows={3}
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Kategorie', 'Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GameCategory)}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              >
                <option value="cooperative">{L('Kooperativ', 'Cooperative')}</option>
                <option value="competitive">{L('Wettbewerb', 'Competitive')}</option>
                <option value="social_deduction">{L('Social Deduction', 'Social Deduction')}</option>
                <option value="energizer">{L('Energizer', 'Energizer')}</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Energielevel', 'Energy Level')}
              </label>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as EnergyLevel)}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              >
                <option value="high">{L('Hoch', 'High')}</option>
                <option value="medium">{L('Mittel', 'Medium')}</option>
                <option value="calm">{L('Ruhig', 'Calm')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Min. Spieler', 'Min Players')}
              </label>
              <input
                type="number"
                min={2}
                value={minPlayers}
                onChange={(e) => setMinPlayers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Max. Spieler', 'Max Players')}
              </label>
              <input
                type="number"
                min={minPlayers}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text"
              />
            </div>
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
              className={`${primaryBtn} px-5 py-2 min-h-[40px] text-xs`}
            >
              {L('Speichern (Draft)', 'Save Draft')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
