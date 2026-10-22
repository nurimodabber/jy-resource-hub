import React, { useState } from 'react';
import { X, Check, Brain } from 'lucide-react';
import { RuleIdea } from '../../data/empireContent';
import { Language } from '../../types';
import { tr, Panel, primaryBtn, secondaryBtn } from '../tools/common';

interface PsychiatristRuleEditorProps {
  rule: RuleIdea | null;
  language: Language;
  onClose: () => void;
  onSave: (rule: RuleIdea) => void;
}

export const PsychiatristRuleEditor: React.FC<PsychiatristRuleEditorProps> = ({
  rule,
  language,
  onClose,
  onSave,
}) => {
  const L = tr(language);

  const [id, _setId] = useState(rule?.id || `psych_${Date.now()}`);
  const [textDe, setTextDe] = useState(rule?.text.de || '');
  const [textEn, setTextEn] = useState(rule?.text.en || '');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(rule?.difficulty || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const de = textDe.trim() || 'Neue geheime Regel';
    const en = textEn.trim() || de;

    const updated: RuleIdea = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      text: { de, en },
      difficulty,
      status: 'draft',
    };
    onSave(updated);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs select-none"
    >
      <Panel className="max-w-lg w-full max-h-[92vh] flex flex-col p-5 sm:p-6 space-y-4 text-left shadow-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {rule ? L('Psychiater-Regel bearbeiten', 'Edit Psychiatrist Rule') : L('Neue Psychiater-Regel anlegen', 'New Psychiatrist Rule')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {L('Geheime Gruppenregel für das Fragespiel', 'Secret group rule for the question game')}
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
          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
              {L('Geheime Regel (Deutsch)', 'Secret Rule (German)')}
            </label>
            <textarea
              rows={3}
              required
              value={textDe}
              onChange={(e) => setTextDe(e.target.value)}
              placeholder="z. B. Beantworte jede Frage so, als wärst du die Person links von dir."
              className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
              {L('Geheime Regel (Englisch)', 'Secret Rule (English)')}
            </label>
            <textarea
              rows={3}
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
              placeholder="e.g. Answer each question as if you are the person to your left."
              className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
              {L('Schwierigkeitsgrad', 'Difficulty Level')}
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
            >
              <option value={1}>{L('Stufe 1 (Einfach - leicht zu erraten)', 'Level 1 (Easy - simple to guess)')}</option>
              <option value={2}>{L('Stufe 2 (Mittel - erfordert genaues Zuhören)', 'Level 2 (Medium - careful listening)')}</option>
              <option value={3}>{L('Stufe 3 (Knifflig - komplexe Muster)', 'Level 3 (Tricky - complex patterns)')}</option>
            </select>
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
              <span>{L('Regel speichern', 'Save Rule')}</span>
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
};
