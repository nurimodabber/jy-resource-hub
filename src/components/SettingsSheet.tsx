import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  Printer,
  Music,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useTheme, Theme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { exportLocalData, importLocalData, clearLocalData, downloadText } from '../utils/backup';
import { loadGroupTitle, loadGroupNames, loadGroupPresent } from '../utils/groupNames';
import { Sheet, SegmentedControl, Button } from './ui';
import { GroupManager } from './tools/GroupManager';

export interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenBahaiSongs?: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  onOpenBahaiSongs,
}) => {
  const t = UI_TRANSLATIONS[language];
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isGroupExpanded, setIsGroupExpanded] = useState(false);

  // Draft setting
  const [hideDrafts, setHideDrafts] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jy_hide_drafts') === 'true';
    } catch {
      return false;
    }
  });

  // Offline service worker state
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setIsOfflineReady(true)).catch(() => {});
    }
  }, []);

  const handleToggleDrafts = (val: boolean) => {
    setHideDrafts(val);
    try {
      localStorage.setItem('jy_hide_drafts', val ? 'true' : 'false');
    } catch {
      /* ignore */
    }
    showToast({
      text: language === 'de'
        ? (val ? 'Entwürfe werden ausgeblendet' : 'Entwürfe werden angezeigt')
        : (val ? 'Draft content hidden' : 'Draft content shown'),
    });
  };

  const handleExport = () => {
    downloadText(`jy-hub-backup-${new Date().toISOString().slice(0, 10)}.json`, exportLocalData());
    showToast({ text: language === 'de' ? 'Sicherung heruntergeladen' : 'Backup downloaded' });
  };

  const handleImport = async (file?: File | null) => {
    if (!file) return;
    try {
      const n = importLocalData(await file.text());
      showToast({
        text: language === 'de' ? `${n} Einträge wiederhergestellt. Seite lädt neu...` : `${n} entries restored. Reloading...`,
      });
      setTimeout(() => window.location.reload(), 800);
    } catch {
      showToast({ text: language === 'de' ? 'Datei nicht lesbar' : 'File unreadable' });
    }
  };

  const handleClear = () => {
    if (window.confirm(t.settingsDeleteConfirm)) {
      clearLocalData();
      window.location.reload();
    }
  };

  // Group summary
  const groupTitle = loadGroupTitle();
  const groupNames = loadGroupNames();
  const groupPresent = loadGroupPresent();
  const presentCount = groupNames.filter((n) => groupPresent[n] !== false).length;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.tabSettings}
      description={language === 'de' ? 'App-Einstellungen, Gruppe & Datensicherung' : 'App preferences, group & backup'}
      position="bottom"
    >
      <div className="space-y-4 max-w-xl mx-auto pb-4">
        {/* 1. Darstellung & Sprache nebeneinander */}
        <div className="bg-surface-2/40 border border-border/80 rounded-card p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <section className="space-y-1.5">
              <label className="block text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {t.settingsAppearance}
              </label>
              <SegmentedControl
                options={[
                  { id: 'light', label: language === 'de' ? 'Hell' : 'Light' },
                  { id: 'dark', label: language === 'de' ? 'Dunkel' : 'Dark' },
                  { id: 'system', label: language === 'de' ? 'System' : 'System' },
                ]}
                value={theme}
                onChange={(v) => setTheme(v as Theme)}
                fullWidth
                size="sm"
              />
            </section>

            <section className="space-y-1.5">
              <label className="block text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {t.settingsLanguage}
              </label>
              <SegmentedControl
                options={[
                  { id: 'de', label: 'Deutsch' },
                  { id: 'en', label: 'English' },
                ]}
                value={language}
                onChange={(v) => setLanguage(v as Language)}
                fullWidth
                size="sm"
              />
            </section>
          </div>
        </div>

        {/* 2. Entwürfe Filter Card */}
        <div className="bg-surface-2/40 border border-border/80 rounded-card p-3 sm:p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 pr-2">
            <span className="block text-xs font-semibold text-text">
              {t.settingsHideDrafts}
            </span>
            <p className="text-2xs text-text-secondary mt-0.5 leading-snug">
              {t.settingsHideDraftsHint}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 min-h-[44px]">
            <input
              type="checkbox"
              checked={hideDrafts}
              onChange={(e) => handleToggleDrafts(e.target.checked)}
              className="sr-only peer"
              aria-label={t.settingsHideDrafts}
            />
            <div className="w-11 h-6 bg-surface-2 border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:border-accent"></div>
          </label>
        </div>

        {/* 3. Meine Gruppe Collapsible Card */}
        <div className="bg-surface-2/40 border border-border/80 rounded-card p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-control bg-accent-subtle flex items-center justify-center shrink-0 text-accent-text">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-text truncate">
                  {groupTitle || (language === 'de' ? 'Meine Gruppe' : 'My Group')}
                </span>
                <span className="block text-2xs text-text-secondary truncate">
                  {groupNames.length > 0
                    ? (language === 'de' ? `${presentCount} von ${groupNames.length} anwesend` : `${presentCount} of ${groupNames.length} present`)
                    : (language === 'de' ? 'Keine Namen hinterlegt' : 'No youth entered yet')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGroupExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 text-xs font-semibold rounded-control text-accent hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
              aria-expanded={isGroupExpanded}
            >
              <span>{isGroupExpanded ? (language === 'de' ? 'Schließen' : 'Close') : (language === 'de' ? 'Verwalten' : 'Manage')}</span>
              {isGroupExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isGroupExpanded && (
            <div className="pt-2 border-t border-border/60">
              <GroupManager language={language} compact={true} />
            </div>
          )}
        </div>

        {/* 4. Daten & Sicherung */}
        <div className="bg-surface-2/40 border border-border/80 rounded-card p-3 sm:p-4 space-y-2.5">
          <label className="block text-2xs font-bold uppercase tracking-wider text-text-tertiary">
            {t.settingsData}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />}
              onClick={handleExport}
              className="w-full justify-start text-xs min-h-[44px]"
            >
              <span className="truncate">{t.settingsBackup}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />}
              onClick={() => fileRef.current?.click()}
              className="w-full justify-start text-xs min-h-[44px]"
            >
              <span className="truncate">{t.settingsRestore}</span>
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => handleImport(e.target.files?.[0])}
            />

            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />}
              onClick={() => {
                window.print();
                onClose();
              }}
              className="w-full justify-start text-xs min-h-[44px]"
            >
              <span className="truncate">{t.printHandout}</span>
            </Button>

            {onOpenBahaiSongs && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Music className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />}
                onClick={() => {
                  onOpenBahaiSongs();
                  onClose();
                }}
                className="w-full justify-start text-xs min-h-[44px]"
              >
                <span className="truncate">Bahá'í Songs</span>
              </Button>
            )}
          </div>

          <div className="pt-1">
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5 text-danger shrink-0" strokeWidth={1.75} />}
              onClick={handleClear}
              className="text-danger hover:bg-danger/10 w-full justify-start text-xs min-h-[40px]"
            >
              <span>{t.settingsDeleteAll}</span>
            </Button>
          </div>
        </div>

        {/* 5. Über die Seite & Offline Status */}
        <div className="pt-2 border-t border-border/80 space-y-2">
          <div className="flex items-center justify-between text-2xs text-text-secondary px-1">
            <span>{t.settingsVersion}</span>
            <div className="flex items-center gap-1.5 text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{isOfflineReady ? t.settingsOfflineReady : t.settingsOfflineDesc}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-2xs text-text-secondary px-1">
            <div className="flex items-center gap-2.5">
              <Link to="/impressum" onClick={onClose} className="hover:text-text">
                {t.impressumTitle}
              </Link>
              <span>·</span>
              <Link to="/datenschutz" onClick={onClose} className="hover:text-text">
                {t.datenschutzTitle}
              </Link>
            </div>
            <Link to="/vorschlagen" onClick={onClose} className="hover:text-accent font-medium">
              {t.settingsSubmitProposal}
            </Link>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
