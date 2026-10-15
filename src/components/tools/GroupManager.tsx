import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Plus, X, Users } from 'lucide-react';
import { Language } from '../../types';
import {
  loadGroupNames, saveGroupNames,
  loadGroupPresent, saveGroupPresent
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
  const [names, setNames] = useState<string[]>(() => loadGroupNames());
  const [present, setPresent] = useState<Record<string, boolean>>(() => loadGroupPresent());
  const [newInput, setNewInput] = useState('');

  // Sync present names to parent
  useEffect(() => {
    const presentList = names.filter((n) => present[n] !== false);
    onNamesChange?.(presentList, names);
  }, [names, present, onNamesChange]);

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
            {L('Meine Gruppe', 'My Group')}
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
              className="text-accent-text font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>{L('Alle anwesend', 'All present')}</span>
            </button>
            <span className="text-text-tertiary">•</span>
            <button
              type="button"
              onClick={() => handleSetAll(false)}
              className="text-text-tertiary hover:text-text cursor-pointer flex items-center gap-1"
            >
              <UserX className="w-3 h-3" />
              <span>{L('Keine', 'None')}</span>
            </button>
          </div>
        )}
      </div>

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
              <button
                key={name}
                type="button"
                onClick={() => handleTogglePresent(name)}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-xs font-semibold transition-all cursor-pointer border min-h-[36px] ${
                  isPresent
                    ? 'bg-accent-subtle text-accent-text border-accent/30 shadow-xs'
                    : 'bg-surface-2 text-text-tertiary line-through opacity-60 border-border hover:opacity-100'
                }`}
                title={isPresent ? L('Als abwesend markieren', 'Mark as absent') : L('Als anwesend markieren', 'Mark as present')}
              >
                <span>{name}</span>
                <span
                  onClick={(e) => handleRemoveName(name, e)}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-tertiary hover:text-text ml-0.5 cursor-pointer"
                  title={L('Namen löschen', 'Remove name')}
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
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
          placeholder={L('Name hinzufügen (oder mehrere mit Komma)...', 'Add name (or comma-separated)...')}
          className="flex-1 px-3.5 py-2 text-xs rounded-control bg-surface-2 border border-border text-text placeholder:text-text-tertiary focus:outline-hidden focus:ring-2 focus:ring-accent min-h-[40px]"
        />
        <button
          type="button"
          onClick={handleAddName}
          disabled={!newInput.trim()}
          className="px-3.5 py-2 rounded-control bg-accent text-accent-contrast font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>{L('Hinzufügen', 'Add')}</span>
        </button>
      </div>
      {!compact && (
        <p className="text-2xs text-text-tertiary">
          {L('Tipp: Ein Klick auf einen Namen schaltet zwischen anwesend und abwesend um. Alle Werkzeuge nutzen diese Liste.', 'Tip: Tap a name to toggle between present and absent. All tools share this group list.')}
        </p>
      )}
    </Panel>
  );
};
