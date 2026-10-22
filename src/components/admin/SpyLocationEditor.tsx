import React, { useState } from 'react';
import { X, Plus, Trash2, Check, MapPin, Users } from 'lucide-react';
import { AdminSpyLocation } from '../../context/AdminDataContext';
import { Language } from '../../types';
import { tr, primaryBtn, secondaryBtn } from '../tools/common';

interface SpyLocationEditorProps {
  location: AdminSpyLocation | null;
  language: Language;
  onClose: () => void;
  onSave: (loc: AdminSpyLocation) => void;
}

export const SpyLocationEditor: React.FC<SpyLocationEditorProps> = ({
  location,
  language,
  onClose,
  onSave,
}) => {
  const L = tr(language);

  const [id, setId] = useState(location?.id || `spy_loc_${Date.now()}`);
  const [nameDe, setNameDe] = useState(location?.name.de || '');
  const [nameEn, setNameEn] = useState(location?.name.en || '');
  const [roles, setRoles] = useState<Array<{ de: string; en: string }>>(
    location ? [...location.roles] : [
      { de: 'Rolle 1', en: 'Role 1' },
      { de: 'Rolle 2', en: 'Role 2' },
      { de: 'Rolle 3', en: 'Role 3' },
      { de: 'Rolle 4', en: 'Role 4' },
      { de: 'Rolle 5', en: 'Role 5' },
      { de: 'Rolle 6', en: 'Role 6' },
      { de: 'Rolle 7', en: 'Role 7' },
    ]
  );

  const [newRoleDe, setNewRoleDe] = useState('');
  const [newRoleEn, setNewRoleEn] = useState('');

  const handleUpdateRole = (index: number, field: 'de' | 'en', val: string) => {
    setRoles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDeleteRole = (index: number) => {
    setRoles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const de = newRoleDe.trim();
    if (!de) return;
    const en = newRoleEn.trim() || de;
    setRoles((prev) => [...prev, { de, en }]);
    setNewRoleDe('');
    setNewRoleEn('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const de = nameDe.trim() || 'Neuer Ort';
    const en = nameEn.trim() || de;

    const updated: AdminSpyLocation = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: { de, en },
      roles,
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
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {location ? L('Spion-Ort bearbeiten', 'Edit Spy Location') : L('Neuen Spion-Ort anlegen', 'New Spy Location')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {roles.length} {L('Rollen zugeordnet (optimal: 7)', 'roles assigned (optimal: 7)')}
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

        {/* Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Name des Ortes (Deutsch)', 'Location Name (German)')}
              </label>
              <input
                type="text"
                required
                value={nameDe}
                onChange={(e) => setNameDe(e.target.value)}
                placeholder="z. B. Schwimmbad"
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Name des Ortes (Englisch)', 'Location Name (English)')}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Swimming Pool"
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          {!location && (
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

          {/* Roles Management */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span>{L('Rollen an diesem Ort (DE / EN)', 'Roles at this Location')}</span>
            </label>

            {/* Quick Add Role */}
            <div className="p-3 rounded-control bg-surface-2/60 border border-border space-y-2">
              <span className="text-2xs font-bold text-text-secondary block">
                {L('Neue Rolle hinzufügen:', 'Add new role:')}
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newRoleDe}
                  onChange={(e) => setNewRoleDe(e.target.value)}
                  placeholder={L('Rolle (Deutsch), z. B. Bademeister', 'Role (German)')}
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-control bg-surface border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                />
                <input
                  type="text"
                  value={newRoleEn}
                  onChange={(e) => setNewRoleEn(e.target.value)}
                  placeholder={L('Rolle (Englisch), z. B. Lifeguard', 'Role (English)')}
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-control bg-surface border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  disabled={!newRoleDe.trim()}
                  className="w-full sm:w-auto px-4 py-1.5 min-h-[34px] rounded-control bg-accent hover:bg-accent-hover text-accent-contrast text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{L('Hinzufügen', 'Add')}</span>
                </button>
              </div>
            </div>

            {/* Roles List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1.5 rounded-control bg-surface border border-border/70 hover:border-border transition-colors"
                >
                  <span className="text-3xs font-mono text-text-tertiary w-6 text-center tabular-nums">
                    {idx + 1}
                  </span>

                  <input
                    type="text"
                    value={role.de}
                    onChange={(e) => handleUpdateRole(idx, 'de', e.target.value)}
                    placeholder="Deutsch"
                    className="flex-1 px-2.5 py-1 rounded-control bg-surface-2 border border-border/60 text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                  />

                  <input
                    type="text"
                    value={role.en}
                    onChange={(e) => handleUpdateRole(idx, 'en', e.target.value)}
                    placeholder="English"
                    className="flex-1 px-2.5 py-1 rounded-control bg-surface-2 border border-border/60 text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteRole(idx)}
                    className="p-1.5 rounded-control text-text-tertiary hover:bg-rose-500/15 hover:text-rose-500 transition-colors cursor-pointer"
                    title={L('Rolle entfernen', 'Remove role')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 shrink-0">
          <span className="text-2xs text-text-tertiary">
            {L('Wird als Entwurf mit Revisions-Schnappschuss gespeichert', 'Saved as draft with revision snapshot')}
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
              <span>{L('Ort speichern', 'Save Location')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
