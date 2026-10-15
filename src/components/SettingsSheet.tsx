import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  Printer,
  Music,
  CheckCircle2,
  X,
  Plus,
  Users,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { useTheme, Theme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { exportLocalData, importLocalData, clearLocalData, downloadText } from '../utils/backup';
import { Sheet, SegmentedControl, Button, Tag, Input } from './ui';

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

  // Group members state
  const [members, setMembers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jy_group_members');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newMemberName, setNewMemberName] = useState('');

  // Offline service worker state
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setIsOfflineReady(true)).catch(() => {});
    }
  }, []);

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newMemberName.trim();
    if (!name) return;
    if (members.includes(name)) {
      showToast({ text: language === 'de' ? 'Name bereits vorhanden' : 'Name already exists' });
      return;
    }
    const updated = [...members, name];
    setMembers(updated);
    localStorage.setItem('jy_group_members', JSON.stringify(updated));
    setNewMemberName('');
  };

  const handleRemoveMember = (nameToRemove: string) => {
    const updated = members.filter((m) => m !== nameToRemove);
    setMembers(updated);
    localStorage.setItem('jy_group_members', JSON.stringify(updated));
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

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={t.tabSettings}
      description={t.siteSubtitle}
      position="bottom"
    >
      <div className="space-y-6 max-w-xl mx-auto pb-6">
        {/* 1. Darstellung */}
        <section className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
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
            className="w-full"
          />
        </section>

        {/* 2. Sprache */}
        <section className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {t.settingsLanguage}
          </label>
          <SegmentedControl
            options={[
              { id: 'de', label: 'Deutsch' },
              { id: 'en', label: 'English' },
            ]}
            value={language}
            onChange={(v) => setLanguage(v as Language)}
            className="w-full"
          />
        </section>

        {/* 3. Meine Gruppe */}
        <section className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t.settingsMyGroup}
              </label>
              <p className="text-xs text-text-secondary mt-0.5">{t.settingsMyGroupHint}</p>
            </div>
            <Users className="w-4 h-4 text-text-tertiary shrink-0" strokeWidth={1.75} />
          </div>

          <form onSubmit={handleAddMember} className="flex gap-2 pt-1">
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder={t.settingsMyGroupPlaceholder}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" size="md" icon={<Plus className="w-4 h-4" strokeWidth={1.75} />}>
              {t.settingsAddName}
            </Button>
          </form>

          {members.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {members.map((name) => (
                <Tag key={name} category="neutral" className="pr-1.5 flex items-center gap-1.5 text-sm">
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(name)}
                    className="w-4 h-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-text-tertiary hover:text-text"
                    aria-label={`${name} entfernen`}
                  >
                    <X className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-tertiary italic pt-1">
              {language === 'de' ? 'Noch keine Namen hinterlegt. Trage Namen ein, um sie in Werkzeugen zu nutzen.' : 'No names saved yet. Enter names to use in group tools.'}
            </p>
          )}
        </section>

        {/* 4. Daten & Sicherung */}
        <section className="space-y-2 pt-2 border-t border-border">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {t.settingsData}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" strokeWidth={1.75} />}
              onClick={handleExport}
              className="w-full justify-start"
            >
              {t.settingsBackup}
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Upload className="w-4 h-4" strokeWidth={1.75} />}
              onClick={() => fileRef.current?.click()}
              className="w-full justify-start"
            >
              {t.settingsRestore}
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
              size="md"
              icon={<Printer className="w-4 h-4" strokeWidth={1.75} />}
              onClick={() => {
                window.print();
                onClose();
              }}
              className="w-full justify-start"
            >
              {t.printHandout}
            </Button>

            {onOpenBahaiSongs && (
              <Button
                variant="secondary"
                size="md"
                icon={<Music className="w-4 h-4" strokeWidth={1.75} />}
                onClick={() => {
                  onOpenBahaiSongs();
                  onClose();
                }}
                className="w-full justify-start"
              >
                Bahá'í Songs
              </Button>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4 text-danger" strokeWidth={1.75} />}
              onClick={handleClear}
              className="text-danger hover:bg-danger/10 w-full justify-start"
            >
              {t.settingsDeleteAll}
            </Button>
          </div>
        </section>

        {/* 5. Über die Seite & Offline Status */}
        <section className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{t.settingsVersion}</span>
            <div className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{isOfflineReady ? t.settingsOfflineReady : t.settingsOfflineDesc}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-3">
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
        </section>
      </div>
    </Sheet>
  );
};
