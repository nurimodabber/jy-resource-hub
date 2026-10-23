import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, ExternalLink, Send, MessageSquare, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { tr } from './tools/common';

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const CONTACT_EMAILS = ['nuri@modabber.net', 'lasse.nieruch@bahai.de'];
const CONTACT_EMAIL_DISPLAY = 'nuri@modabber.net, lasse.nieruch@bahai.de';
const STORAGE_EMAIL_KEY = 'jy_user_email';

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, language }) => {
  const L = tr(language);

  // Stored / entered user email
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });

  const [topic, setTopic] = useState<'feedback' | 'question' | 'cluster' | 'other'>('feedback');
  const [message, setMessage] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Sync email to localStorage whenever edited
  useEffect(() => {
    try {
      if (userEmail.trim()) {
        localStorage.setItem(STORAGE_EMAIL_KEY, userEmail.trim());
      }
    } catch {
      /* ignore */
    }
  }, [userEmail]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAILS.join(', '));
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const getTopicLabel = (key: typeof topic) => {
    switch (key) {
      case 'feedback':
        return L('Rückmeldung zu Inhalten (Spiele/Zitate)', 'Feedback on content (Games/Quotes)');
      case 'question':
        return L('Frage zur Gruppenpraxis', 'Question on group practice');
      case 'cluster':
        return L('Impuls / Austausch Cluster Rhein-Neckar', 'Cluster Rhein-Neckar exchange');
      case 'other':
      default:
        return L('Allgemeine Anfrage', 'General inquiry');
    }
  };

  const generateMailtoUrl = () => {
    const subject = encodeURIComponent(`[Junior Youth Hub] ${getTopicLabel(topic)}`);
    const bodyLines = [
      message.trim() || (language === 'de' ? '(Deine Nachricht hier)' : '(Your message here)'),
      '',
      '---',
      userEmail.trim() ? `${language === 'de' ? 'Absender E-Mail' : 'Sender Email'}: ${userEmail.trim()}` : '',
      `${language === 'de' ? 'Kontext' : 'Context'}: Junior Youth Hub (${language === 'de' ? 'Cluster Rhein-Neckar · Experimentell' : 'Cluster Rhein-Neckar · Experimental'})`,
    ].filter(Boolean);

    const body = encodeURIComponent(bodyLines.join('\n'));
    return `mailto:${CONTACT_EMAILS.join(',')}?subject=${subject}&body=${body}`;
  };

  const handleCopyMessage = async () => {
    const fullText = [
      `An: ${CONTACT_EMAILS.join(', ')}`,
      `Betreff: [Junior Youth Hub] ${getTopicLabel(topic)}`,
      '',
      message.trim(),
      '',
      userEmail.trim() ? `Absender: ${userEmail.trim()}` : '',
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2500);
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={L('Kontakt & Rückmeldung', 'Contact & Feedback')}
      maxWidth="lg"
    >
      <div className="space-y-6 text-sm text-text">
        {/* Status notice badge */}
        <div className="p-3.5 rounded-2xl bg-surface-2 border border-border-subtle flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent-subtle text-accent-text flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-text uppercase tracking-wider">
              {L('Individuelle Initiative · Cluster Rhein-Neckar', 'Individual Initiative · Cluster Rhein-Neckar')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
              {L(
                'Dieses Projekt ist eine private, ehrenamtliche Initiative und dient als experimentelles Praxisfeld für das Junior-Jugendprogramm im Cluster Rhein-Neckar (noch nicht bundes- oder weltweit freigegeben).',
                'This project is a private volunteer initiative serving as an experimental field for the junior youth programme in Cluster Rhein-Neckar (not yet intended for nationwide or worldwide use).'
              )}
            </p>
          </div>
        </div>

        {/* Direkt-E-Mail Zeile */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {L('Direkte Kontaktadressen', 'Direct contact addresses')}
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold text-text select-all mt-0.5">
                {CONTACT_EMAIL_DISPLAY}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
                icon={copiedAddress ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                iconPosition="left"
              >
                {copiedAddress ? L('Kopiert!', 'Copied!') : L('Kopieren', 'Copy')}
              </Button>
              <a
                href={`mailto:${CONTACT_EMAILS.join(',')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-accent text-accent-contrast hover:bg-accent-hover transition-colors min-h-[36px]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{L('E-Mail öffnen', 'Open Mail')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* E-Mail hinterlegen und Nachricht vorbereiten */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-text">
              {L('E-Mail hinterlegen & Nachricht vorbereiten', 'Leave your email & compose message')}
            </h3>
          </div>

          <div className="space-y-3">
            {/* User email */}
            <div>
              <label htmlFor="user-contact-email" className="block text-xs font-semibold text-text-secondary mb-1">
                {L('Deine E-Mail-Adresse (wird lokal für Rückfragen gespeichert)', 'Your email address (saved locally for replies)')}
              </label>
              <input
                id="user-contact-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder={L('name@beispiel.de', 'name@example.com')}
                className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-2xs text-text-tertiary mt-1">
                {L(
                  'Deine E-Mail bleibt sicher auf deinem Gerät gespeichert und wird nur zur Beantwortung deiner Nachricht genutzt.',
                  'Your email is stored securely on your device and used solely to reply to your inquiry.'
                )}
              </p>
            </div>

            {/* Topic selector */}
            <div>
              <label htmlFor="contact-topic" className="block text-xs font-semibold text-text-secondary mb-1">
                {L('Thema / Anliegen', 'Topic / Concern')}
              </label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value as typeof topic)}
                className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="feedback">{L('Rückmeldung zu Inhalten (Spiele/Zitate)', 'Feedback on content (Games/Quotes)')}</option>
                <option value="question">{L('Frage zur Gruppenpraxis', 'Question on group practice')}</option>
                <option value="cluster">{L('Impuls / Austausch Cluster Rhein-Neckar', 'Cluster Rhein-Neckar exchange')}</option>
                <option value="other">{L('Allgemeine Anfrage', 'General inquiry')}</option>
              </select>
            </div>

            {/* Message textarea */}
            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-text-secondary mb-1">
                {L('Deine Nachricht / Gedanken', 'Your message / thoughts')}
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={L('Schreibe deine Rückmeldung, deinen Eindruck oder deine Frage...', 'Write your feedback, experience or question...')}
                className="w-full px-3.5 py-2.5 rounded-control bg-surface-2 border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyMessage}
              icon={copiedBody ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              iconPosition="left"
            >
              {copiedBody ? L('Nachrichtentext kopiert!', 'Message copied!') : L('Text kopieren (für Webmail)', 'Copy text (for Webmail)')}
            </Button>
            <a
              href={generateMailtoUrl()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold bg-accent text-accent-contrast hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{L('Im E-Mail-Programm öffnen', 'Open in Mail App')}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
