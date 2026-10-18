import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Plus, X, Users } from 'lucide-react';
import { Language } from '../../types';
import {
  loadGroupNames, saveGroupNames,
  loadGroupPresent, saveGroupPresent,
  loadGroupTitle, saveGroupTitle
} from '../../utils/groupNames';
import { tr, Panel } from './common';

interface GroupManagerProps {
  language: Language;
  onNamesChange?: (presentNames: string[], allNames: string[]) => void;
  compact?: boolean;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  language,
  onNamesChange,
  compact = false,
}) => {
  const L = tr(language);
  const [groupTitle, setGroupTitle] = useState<string>(() => loadGroupTitle());
  const [names, setNames] = useState<string[]>(() => loadGroupNames());
  const [present, setPresent] = useState<Record<string, boolean>>(() => loadGroupPresent());
  const [newInput, setNewInput] = useState('');

  // Sync present names to parent
  useEffect(() => {
    const presentList = names.filter((n) => present[n] !== false);
    onNamesChange?.(presentList, names);
  }, [names, present, onNamesChange]);

  const handleGroupTitleChange = (val: string) => {
    setGroupTitle(val);
    saveGroupTitle(val);
  };

  const handleAddName = () => {
    const trimmed = newInput.trim();
    if (!trimmed) return;
    const items = trimmed.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    const updated = [...names];
    const updatedPresent = { ...present };

    items.forEach((item) => {
      const exists = updated.some((n) => n.toLowerCase() === item.toLowerCase());
      if (!exists) {
        updated.push(item);
        updatedPresent[item] = true;
      }
    });

    setNames(updated);
    setPresent(updatedPresent);
    saveGroupNames(updated);
    saveGroupPresent(updatedPresent);
    setNewInput('');
  };

  const handleTogglePresent = (name: string) => {
    const current = present[name] !== false;
    const updatedPresent = { ...present, [name]: !current };
    setPresent(updatedPresent);
    saveGroupPresent(updatedPresent);
  };

  const handleRemoveName = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = names.filter((n) => n !== name);
    const updatedPresent = { ...present };
    delete updatedPresent[name];
    setNames(updated);
    setPresent(updatedPresent);
    saveGroupNames(updated);
    saveGroupPresent(updatedPresent);
  };

  const handleSetAll = (status: boolean) => {
    const updatedPresent: Record<string, boolean> = {};
    names.forEach((n) => {
      updatedPresent[n] = status;
    });
    setPresent(updatedPresent);
    saveGroupPresent(updatedPresent);
  };

  const presentCount = names.filter((n) => present[n] !== false).length;

  return (
    <Panel className="space-y-4">
      {/* Header with Presence Counter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent-text" />
          <h3 className="text-sm font-bold text-text">
            {groupTitle || L('Meine Gruppe', 'My Group')}
          </h3>
          <span className="text-2xs font-bold px-2 py-0.5 rounded-chip bg-accent-subtle text-accent-text">
            {L(`${presentCount} von ${names.length} anwesend`, `${presentCount} of ${names.length} present`)}
          </span>
        </div>

        {names.length > 0 && (
          <div className="flex items-center gap-2 text-2xs">
            <button
              type="button"
              onClick={() => handleSetAll(true)}
              className="text-accent-text font-semibold hover:underline cursor-pointer flex items-center gap-1 min-h-[36px] px-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>{L('Alle anwesend', 'All present')}</span>
            </button>
            <span className="text-text-tertiary">•</span>
            <button
              type="button"
              onClick={() => handleSetAll(false)}
              className="text-text-tertiary hover:text-text cursor-pointer flex items-center gap-1 min-h-[36px] px-1"
            >
              <UserX className="w-3 h-3" />
              <span>{L('Keine', 'None')}</span>
            </button>
          </div>
        )}
      </div>

      {!compact && (
        <div>
          <label className="block text-2xs font-bold uppercase tracking-wider text-text-tertiary mb-1">
            {L('Gruppenname (optional, für Startseite)', 'Group name (optional, for home page)')}
          </label>
          <input
            type="text"
            value={groupTitle}
            onChange={(e) => handleGroupTitleChange(e.target.value)}
            placeholder={L('z. B. Lichtfunken Nordstadt', 'e.g. Sparks of Hope')}
            className="w-full px-3.5 py-2 text-xs rounded-control bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[44px]"
          />
        </div>
      )}

      {/* Chips List */}
      {names.length === 0 ? (
        <p className="text-xs text-text-tertiary py-1">
          {L('Noch keine Namen eingetragen. Füge unten die Jugendlichen deiner Gruppe hinzu.', 'No names entered yet. Add the youth of your group below.')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {names.map((name) => {
            const isPresent = present[name] !== false;
            return (
              <div
                key={name}
                className={`group inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-chip text-xs font-semibold transition-all border min-h-[44px] ${
                  isPresent
                    ? 'bg-accent-subtle text-accent-text border-accent/30 shadow-xs'
                    : 'bg-surface-2 text-text-tertiary line-through opacity-60 border-border hover:opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleTogglePresent(name)}
                  className="cursor-pointer py-1 pr-1 focus-visible:outline-hidden"
                  title={isPresent ? L('Als abwesend markieren', 'Mark as absent') : L('Als anwesend markieren', 'Mark as present')}
                >
                  <span>{name}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveName(name, e)}
                  className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-tertiary hover:text-text cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center"
                  title={L('Namen löschen', 'Remove name')}
                  aria-label={`${name} ${L('löschen', 'remove')}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newInput}
          onChange={(e) => setNewInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddName();
            }
          }}
          placeholder={L('Name eingeben...', 'Enter name...')}
          className="flex-1 px-3.5 py-2 text-xs rounded-control bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[44px]"
        />
        <button
          type="button"
          onClick={handleAddName}
          disabled={!newInput.trim()}
          className="px-3.5 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px] shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{L('Hinzufügen', 'Add')}</span>
        </button>
      </div>
      <p className="text-2xs text-text-tertiary">
        {compact
          ? L('Mehrere Namen können mit Komma getrennt werden.', 'Multiple names can be separated by commas.')
          : L('Tipp: Ein Klick auf einen Namen schaltet zwischen anwesend und abwesend um. Mehrere Namen mit Komma trennen.', 'Tip: Tap a name to toggle between present and absent. Separate multiple names with commas.')}
      </p>
    </Panel>
  );
};

