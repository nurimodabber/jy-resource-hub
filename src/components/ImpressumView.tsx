import React from 'react';
import { ArrowLeft, Shield, Mail, Globe } from 'lucide-react';
import { Language } from '../types';
import { Button } from './ui/Button';

export interface ImpressumViewProps {
  language: Language;
  onBack: () => void;
}

export const ImpressumView: React.FC<ImpressumViewProps> = ({ language, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 animate-in fade-in duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        icon={<ArrowLeft className="w-4 h-4" />}
        iconPosition="left"
        className="mb-6"
      >
        {language === 'de' ? 'Zurück' : 'Back'}
      </Button>

      <div className="bg-surface rounded-3xl border border-border-subtle p-6 sm:p-10 shadow-apple-card space-y-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text tracking-tight">
            {language === 'de' ? 'Impressum' : 'Legal Notice (Impressum)'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {language === 'de' 
              ? 'Angaben gemäß § 5 TMG / Verantwortlich für den Inhalt' 
              : 'Information pursuant to German Telemedia Act (§ 5 TMG)'}
          </p>
        </div>

        {/* Angaben */}
        <section className="space-y-3 text-sm text-text-secondary">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? 'Dienstanbieter & Betreiber' : 'Service Provider & Operator'}
          </h2>
          <div className="p-4 rounded-2xl bg-surface-2 border border-border-subtle text-xs sm:text-sm font-mono leading-relaxed">
            <p className="font-semibold text-text">Junior Youth Resource Hub</p>
            <p>c/o Nuri Modabber</p>
            <p>[Straße & Hausnummer / Address placeholder]</p>
            <p>[PLZ & Ort / City placeholder], Deutschland</p>
            <div className="mt-3 pt-3 border-t border-border-subtle flex flex-col gap-1 text-xs">
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>E-Mail: info@jy-resource-hub.vercel.app</span>
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span>Web: https://jy-resource-hub.vercel.app</span>
              </span>
            </div>
          </div>
        </section>

        {/* Zweck & Gemeinnützigkeit */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? 'Zweck des Angebots' : 'Purpose of the Platform'}
          </h2>
          <p>
            {language === 'de'
              ? 'Diese Web-App ist ein nicht-kommerzielles, ehrenamtliches Praxis-Werkzeug für Animatoren von Bahá\'í-Juniorjugendgruppen und Sommercamps. Sie dient dem Erfahrungsaustausch und der Unterstützung bei der Vorbereitung von Stunden.'
              : 'This web application is a non-commercial, voluntary educational toolkit for animators of Bahá\'í junior youth groups and summer camps. It serves pedagogical preparation and experience sharing.'}
          </p>
        </section>

        {/* Urheberrecht */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? 'Urheberrecht & Zitate' : 'Copyright & Scripture Quotes'}
          </h2>
          <p>
            {language === 'de'
              ? 'Die in dieser Anwendung zitierten heiligen Schriften der Bahá\'í-Offenbarung sind aus den offiziell autorisierten Übersetzungen entnommen und verbleiben im Urheberrecht der jeweiligen nationalen oder internationalen Herausgeber (Bahá\'í-Verlag / Bahá\'í World Centre). Die Benutzeroberfläche und Programmierung stehen unter Open-Source-Lizenz (MIT).'
              : 'The sacred scripture quotes cited within this application are taken from officially authorized translations and remain under the copyright of their respective publishers (Bahá\'í Publishing Trust / Bahá\'í World Centre). The software and UI code are open source under the MIT License.'}
          </p>
        </section>

        {/* Haftungshinweis */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? 'Haftung für Inhalte und Links' : 'Liability for Content & Links'}
          </h2>
          <p>
            {language === 'de'
              ? 'Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Verweise auf externe Websites Dritter (wie bahaisongs.com) unterliegen der Haftung der jeweiligen Betreiber.'
              : 'As a service provider, we are responsible for our own content on these pages under § 7 (1) TMG. External links to third-party websites (such as bahaisongs.com) are the responsibility of their respective operators.'}
          </p>
        </section>
      </div>
    </div>
  );
};
