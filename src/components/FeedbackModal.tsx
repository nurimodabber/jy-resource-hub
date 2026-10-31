import React, { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, AlertTriangle, BookOpen, Send, Check } from 'lucide-react';
import { Language } from '../types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { tr } from './tools/common';
import { useToast } from '../context/ToastContext';
import { saveFeedback } from '../utils/adminRevisions';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type FeedbackCategory = 'general' | 'idea' | 'bug' | 'content';

const STORAGE_EMAIL_KEY = 'jy_user_email';
const STORAGE_NAME_KEY = 'jy_user_name';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, language }) => {
  const L = tr(language);
  const { showToast } = useToast();

  const [category, setCategory] = useState<FeedbackCategory>('idea');
  const [message, setMessage] = useState('');
  const [authorName, setAuthorName] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_NAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [authorEmail, setAuthorEmail] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync author data to localStorage
  useEffect(() => {
    try {
      if (authorName.trim()) localStorage.setItem(STORAGE_NAME_KEY, authorName.trim());
      if (authorEmail.trim()) localStorage.setItem(STORAGE_EMAIL_KEY, authorEmail.trim());
    } catch {
      /* ignore */
    }
  }, [authorName, authorEmail]);

  // Reset submitted state when reopened
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
    }
  }, [isOpen]);

  const categories: Array<{ id: FeedbackCategory; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'idea', label: L('Idee & Wunsch', 'Idea & Request'), icon: Lightbulb },
    { id: 'general', label: L('Allgemeines', 'General'), icon: MessageSquare },
    { id: 'bug', label: L('Problem melden', 'Report Issue'), icon: AlertTriangle },
    { id: 'content', label: L('Inhalt & Zitate', 'Content & Quotes'), icon: BookOpen },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = message.trim();
    if (!cleanMsg || cleanMsg.length < 5) return;

    setIsSubmitting(true);

    try {
      // 1. Save in local/synced proposals queue for admin inspection
      saveFeedback({
        category,
        message: cleanMsg,
        authorName: authorName.trim() || undefined,
        authorEmail: authorEmail.trim() || undefined,
      });

      // 2. Submit to backend API if available
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'feedback',
            title: `Feedback: ${cleanMsg.slice(0, 48)}`,
            summary: cleanMsg,
            authorName: authorName.trim() || undefined,
            authorEmail: authorEmail.trim() || undefined,
            clientTimestamp: Date.now() - 5000,
          }),
        });
      } catch {
        /* Offline or local-only fallback is fine */
      }

      setSubmitted(true);
      showToast({ text: L('Vielen Dank für dein Feedback!', 'Thank you for your feedback!') });
      setTimeout(() => {
        setMessage('');
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={L('Feedback abgeben', 'Share Feedback')}
      description={L(
        'Hast du Ideen, Wünsche oder Anmerkungen zum Junior Youth Hub? Teile deine Gedanken mit uns.',
        'Do you have ideas, requests, or notes about the Junior Youth Hub? Share your thoughts with us.'
      )}
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-text">
            {L('Feedback erhalten!', 'Feedback received!')}
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            {L(
              'Deine Rückmeldung wurde gespeichert und wird im Backend geprüft. Danke für deinen Beitrag!',
              'Your feedback has been saved and will be reviewed in the backend. Thank you for your contribution!'
            )}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Category selector */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              {L('Kategorie', 'Category')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-control text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent/10 border-accent text-accent font-bold shadow-2xs'
                        : 'bg-surface border-border text-text-secondary hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-tertiary'}`} />
                    <span className="text-2xs truncate max-w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label htmlFor="feedback-message" className="block text-xs font-semibold text-text-secondary mb-1.5">
              {L('Deine Rückmeldung oder Idee', 'Your feedback or idea')}{' '}
              <span className="text-accent">*</span>
            </label>
            <textarea
              id="feedback-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={L(
                'Was gefällt dir, was fehlt oder was könnte verbessert werden?',
                'What do you like, what is missing, or what could be improved?'
              )}
              className="w-full px-3 py-2.5 rounded-control bg-bg border border-border text-text text-sm placeholder:text-text-tertiary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent resize-y min-h-[96px]"
              autoFocus
            />
            <span className="text-2xs text-text-tertiary block mt-1">
              {L('Mindestens 5 Zeichen.', 'At least 5 characters.')}
            </span>
          </div>

          {/* Optional Author info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="feedback-author-name" className="block text-2xs font-semibold text-text-tertiary mb-1">
                {L('Dein Name (optional)', 'Your name (optional)')}
              </label>
              <input
                id="feedback-author-name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={L('z. B. Samira', 'e.g. Samira')}
                className="w-full px-3 py-1.5 rounded-control bg-bg border border-border text-text text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="feedback-author-email" className="block text-2xs font-semibold text-text-tertiary mb-1">
                {L('E-Mail für Rückfragen (optional)', 'Email for follow-up (optional)')}
              </label>
              <input
                id="feedback-author-email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="name@beispiel.de"
                className="w-full px-3 py-1.5 rounded-control bg-bg border border-border text-text text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              {L('Abbrechen', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || message.trim().length < 5}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? L('Wird gesendet...', 'Sending...') : L('Feedback absenden', 'Send Feedback')}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
