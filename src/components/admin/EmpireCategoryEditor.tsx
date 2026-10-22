import React, { useState } from 'react';
import { X, Check, Crown } from 'lucide-react';
import { EmpireCategory } from '../../context/AdminDataContext';
import { Language } from '../../types';
import { tr, Panel, primaryBtn, secondaryBtn } from '../tools/common';

interface EmpireCategoryEditorProps {
  category: EmpireCategory | null;
  language: Language;
  onClose: () => void;
  onSave: (cat: EmpireCategory) => void;
}

export const EmpireCategoryEditor: React.FC<EmpireCategoryEditorProps> = ({
  category,
  language,
  onClose,
  onSave,
}) => {
  const L = tr(language);

  const [id, _setId] = useState(category?.id || `empire_${Date.now()}`);
  const [promptDe, setPromptDe] = useState(category?.prompt.de || '');
  const [promptEn, setPromptEn] = useState(category?.prompt.en || '');
  const [hintDe, setHintDe] = useState(category?.hint.de || '');
  const [hintEn, setHintEn] = useState(category?.hint.en || '');
  const [mood, setMood] = useState<'fun' | 'calm' | 'thoughtful'>(category?.mood || 'fun');
  const [topic, setTopic] = useState<EmpireCategory['topic']>(category?.topic || 'everyday');

  // Examples: 3 examples
  const [ex1De, setEx1De] = useState(category?.examples.de[0] || '');
  const [ex1En, setEx1En] = useState(category?.examples.en[0] || '');
  const [ex2De, setEx2De] = useState(category?.examples.de[1] || '');
  const [ex2En, setEx2En] = useState(category?.examples.en[1] || '');
  const [ex3De, setEx3De] = useState(category?.examples.de[2] || '');
  const [ex3En, setEx3En] = useState(category?.examples.en[2] || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const de = promptDe.trim() || 'Neue Kategorie';
    const en = promptEn.trim() || de;

    const updated: EmpireCategory = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      prompt: { de, en },
      hint: { de: hintDe.trim() || 'Schreib deine Antwort auf.', en: hintEn.trim() || 'Write your answer.' },
      examples: {
        de: [ex1De.trim() || 'Beispiel 1', ex2De.trim() || 'Beispiel 2', ex3De.trim() || 'Beispiel 3'],
        en: [ex1En.trim() || ex1De.trim() || 'Example 1', ex2En.trim() || ex2De.trim() || 'Example 2', ex3En.trim() || ex3De.trim() || 'Example 3'],
      },
      mood,
      topic,
      age: 'all',
      shy: true,
      personal: false,
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
      <Panel className="max-w-2xl w-full max-h-[92vh] flex flex-col p-5 sm:p-6 space-y-4 text-left shadow-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-control bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {category ? L('Empire-Kategorie bearbeiten', 'Edit Empire Topic') : L('Neue Empire-Kategorie anlegen', 'New Empire Topic')}
              </h2>
              <p className="text-2xs text-text-secondary">
                {L('Themenvorschlag, Anweisung & 3 Beispielzettel', 'Topic prompt, instruction & 3 example slips')}
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

        {/* Form Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Kategorie-Titel (Deutsch)', 'Topic Title (German)')}
              </label>
              <input
                type="text"
                required
                value={promptDe}
                onChange={(e) => setPromptDe(e.target.value)}
                placeholder="z. B. Das Beste an einem Regentag"
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Kategorie-Titel (Englisch)', 'Topic Title (English)')}
              </label>
              <input
                type="text"
                value={promptEn}
                onChange={(e) => setPromptEn(e.target.value)}
                placeholder="e.g. The best thing about a rainy day"
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Hint / Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Hinweis / Schreib-Impuls (Deutsch)', 'Writing Hint (German)')}
              </label>
              <input
                type="text"
                required
                value={hintDe}
                onChange={(e) => setHintDe(e.target.value)}
                placeholder="z. B. Schreib eine Sache auf, die du dann tust."
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Hinweis / Schreib-Impuls (Englisch)', 'Writing Hint (English)')}
              </label>
              <input
                type="text"
                value={hintEn}
                onChange={(e) => setHintEn(e.target.value)}
                placeholder="e.g. Write down one thing you do then."
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs text-text focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Mood & Topic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Stimmung / Mood', 'Mood')}
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as 'fun' | 'calm' | 'thoughtful')}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              >
                <option value="fun">{L('Lustig', 'Fun')}</option>
                <option value="calm">{L('Ruhig', 'Calm')}</option>
                <option value="thoughtful">{L('Nachdenklich', 'Thoughtful')}</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary mb-1">
                {L('Themenbereich', 'Topic Area')}
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as EmpireCategory['topic'])}
                className="w-full px-3 py-2 rounded-control bg-surface-2 border border-border text-xs font-semibold text-text focus:border-accent focus:outline-hidden"
              >
                <option value="school">{L('Schule & Alltag', 'School & Daily')}</option>
                <option value="camp">{L('Camp & Zeltlager', 'Camp & Retreat')}</option>
                <option value="food">{L('Essen & Küche', 'Food & Kitchen')}</option>
                <option value="nature">{L('Natur & Umwelt', 'Nature & Outdoors')}</option>
                <option value="travel">{L('Reisen & Orte', 'Travel & Places')}</option>
                <option value="community">{L('Gemeinschaft', 'Community')}</option>
                <option value="values">{L('Werte & Tugenden', 'Values & Virtues')}</option>
                <option value="everyday">{L('Allgemein', 'General Everyday')}</option>
              </select>
            </div>
          </div>

          {/* 3 Example Answers */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-text">
              {L('3 Beispiel-Antworten (als Orientierung für die Gruppe)', '3 Example Answers')}
            </label>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ex1De}
                  onChange={(e) => setEx1De(e.target.value)}
                  placeholder="Beispiel 1 (DE)"
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text"
                />
                <input
                  type="text"
                  value={ex1En}
                  onChange={(e) => setEx1En(e.target.value)}
                  placeholder="Example 1 (EN)"
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ex2De}
                  onChange={(e) => setEx2De(e.target.value)}
                  placeholder="Beispiel 2 (DE)"
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text"
                />
                <input
                  type="text"
                  value={ex2En}
                  onChange={(e) => setEx2En(e.target.value)}
                  placeholder="Example 2 (EN)"
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ex3De}
                  onChange={(e) => setEx3De(e.target.value)}
                  placeholder="Beispiel 3 (DE)"
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text"
                />
                <input
                  type="text"
                  value={ex3En}
                  onChange={(e) => setEx3En(e.target.value)}
                  placeholder="Example 3 (EN)"
                  className="px-2.5 py-1.5 rounded-control bg-surface-2 border border-border text-xs text-text"
                />
              </div>
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
              <span>{L('Kategorie speichern', 'Save Topic')}</span>
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
};
