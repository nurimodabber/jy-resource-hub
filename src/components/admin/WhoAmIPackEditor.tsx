import React, { useState } from 'react';
import { X, Plus, Trash2, Search, Check, Sparkles, User } from 'lucide-react';
import { WhoAmIPack } from '../../data/roleContent';
import { Language } from '../../types';
import { tr, primaryBtn, secondaryBtn } from '../tools/common';

interface WhoAmIPackEditorProps {
  pack: WhoAmIPack | null;
  language: Language;
  onClose: () => void;
  onSave: (pack: WhoAmIPack) => void;
}

export const WhoAmIPackEditor: React.FC<WhoAmIPackEditorProps> = ({
  pack,
  language,
  onClose,
  onSave,
}) => {
  const L = tr(language);

  const [id, setId] = useState(pack?.id || `pack_${Date.now()}`);
  const [nameDe, setNameDe] = useState(pack?.name.de || '');
  const [nameEn, setNameEn] = useState(pack?.name.en || '');
  const [difficulty, setDifficulty] = useState<number>(pack?.difficulty || 1);
  const [entries, setEntries] = useState<Array<{ de: string; en: string }>>(
    pack ? [...pack.entries] : []
  );

  // Character search inside pack
  const [charSearch, setCharSearch] = useState('');

  // New character inputs
  const [newCharDe, setNewCharDe] = useState('');
  const [newCharEn, setNewCharEn] = useState('');

  const filteredEntries = entries.filter(
    (e) =>
      !charSearch.trim() ||
      e.de.toLowerCase().includes(charSearch.toLowerCase()) ||
      e.en.toLowerCase().includes(charSearch.toLowerCase())
  );

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    const de = newCharDe.trim();
    if (!de) return;
    const en = newCharEn.trim() || de;
    setEntries((prev) => [...prev, { de, en }]);
    setNewCharDe('');
    setNewCharEn('');
  };

  const handleUpdateEntry = (indexInFiltered: number, field: 'de' | 'en', val: string) => {
    const targetEntry = filteredEntries[indexInFiltered];
    const actualIndex = entries.findIndex((e) => e === targetEntry);
    if (actualIndex === -1) return;

    setEntries((prev) => {
      const copy = [...prev];
      copy[actualIndex] = { ...copy[actualIndex], [field]: val };
      return copy;
    });
  };

  const handleDeleteEntry = (indexInFiltered: number) => {
    const targetEntry = filteredEntries[indexInFiltered];
    setEntries((prev) => prev.filter((e) => e !== targetEntry));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const de = nameDe.trim() || 'Neues Themenpaket';
    const en = nameEn.trim() || de;

    const updated: WhoAmIPack = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: { de, en },
      difficulty: (Number(difficulty) as 1 | 2 | 3) || 1,
      entries,
      status: 'draft',
    };
    onSave(updated);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] glass-surface-panel rounded-dialog shadow-2 border border-border flex flex-col p-5 sm:p-6 space-y-4 text-left outline-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {pack ? L('Wer-bin-ich Paket bearbeiten', 'Edit Who Am I Pack') : L('Neues Wer-bin-ich Paket anlegen', 'New Who Am I Pack')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {entries.length} {L('Begriffe & Figuren im Paket', 'characters & figures in pack')}
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Paket-Name (DE)', 'Pack Name (DE)')}
              </label>
              <input
                type="text"
                required
                value={nameDe}
                onChange={(e) => setNameDe(e.target.value)}
                placeholder="z. B. Science-Fiction"
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Paket-Name (EN)', 'Pack Name (EN)')}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Science Fiction"
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Schwierigkeit', 'Difficulty')}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              >
                <option value={1}>{L('Stufe 1 (Leicht & Bekannt)', 'Level 1 (Easy & Familiar)')}</option>
                <option value={2}>{L('Stufe 2 (Knifflig & Inspirierend)', 'Level 2 (Challenging & Thoughtful)')}</option>
                <option value={3}>{L('Stufe 3 (Experte)', 'Level 3 (Expert)')}</option>
              </select>
            </div>
          </div>

          {!pack && (
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Eindeutige ID', 'Identifier ID')}
              </label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-control bg-surface-2 border border-border text-xs font-mono text-text"
              />
            </div>
          )}

          {/* Character / Entries Management Section */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                <span>{L('Figuren & Charaktere bearbeiten', 'Manage Figures & Characters')}</span>
              </label>

              <div className="relative w-44 sm:w-56">
                <input
                  type="text"
                  value={charSearch}
                  onChange={(e) => setCharSearch(e.target.value)}
                  placeholder={L('Figur suchen...', 'Search figure...')}
                  className="w-full pl-7 pr-3 py-1 rounded-control bg-surface-2 border border-border text-2xs text-text focus:border-accent focus:outline-hidden"
                />
                <Search className="w-3 h-3 text-text-tertiary absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Add Character Bar */}
            <div className="p-3 rounded-control bg-surface-2/60 border border-border space-y-2">
              <span className="text-2xs font-bold text-text-secondary block">
                {L('Neue Figur / neuen Begriff zum Paket hinzufügen:', 'Add new figure/term to pack:')}
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newCharDe}
                  onChange={(e) => setNewCharDe(e.target.value)}
                  placeholder={L('Name (Deutsch), z. B. Einstein', 'Name (German)')}
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-control bg-surface border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                />
                <input
                  type="text"
                  value={newCharEn}
                  onChange={(e) => setNewCharEn(e.target.value)}
                  placeholder={L('Name (Englisch)', 'Name (English)')}
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-control bg-surface border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddCharacter}
                  disabled={!newCharDe.trim()}
                  className="w-full sm:w-auto px-4 py-1.5 min-h-[34px] rounded-control bg-accent hover:bg-accent-hover text-accent-contrast text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{L('Hinzufügen', 'Add')}</span>
                </button>
              </div>
            </div>

            {/* Character List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {filteredEntries.length === 0 ? (
                <p className="text-2xs text-text-tertiary text-center py-4">
                  {charSearch ? L('Keine Figuren gefunden', 'No figures found') : L('Noch keine Figuren im Paket', 'No figures in pack yet')}
                </p>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 rounded-control bg-surface border border-border/70 hover:border-border transition-colors"
                  >
                    <span className="text-3xs font-mono text-text-tertiary w-6 text-center tabular-nums">
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={entry.de}
                      onChange={(e) => handleUpdateEntry(idx, 'de', e.target.value)}
                      placeholder="Deutsch"
                      className="flex-1 px-2.5 py-1 rounded-control bg-surface-2 border border-border/60 text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                    />

                    <input
                      type="text"
                      value={entry.en}
                      onChange={(e) => handleUpdateEntry(idx, 'en', e.target.value)}
                      placeholder="English"
                      className="flex-1 px-2.5 py-1 rounded-control bg-surface-2 border border-border/60 text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                    />

                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(idx)}
                      className="p-1.5 rounded-control text-text-tertiary hover:bg-rose-500/15 hover:text-rose-500 transition-colors cursor-pointer"
                      title={L('Figur entfernen', 'Remove figure')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 shrink-0">
          <span className="text-2xs text-text-tertiary">
            {L('Wird als Entwurf (status: draft) mit Revisions-Schnappschuss gespeichert', 'Saved as draft with revision snapshot')}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`${secondaryBtn} px-4 py-2 min-h-[40px] text-xs`}
            >
              {L('Abbrechen', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`${primaryBtn} px-5 py-2 min-h-[40px] text-xs flex items-center gap-1.5`}
            >
              <Check className="w-4 h-4" />
              <span>{L('Paket speichern', 'Save Pack')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
