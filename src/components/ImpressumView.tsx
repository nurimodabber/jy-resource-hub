import React from 'react';
import { ArrowLeft, Shield, Mail, Globe, MapPin, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { Button } from './ui/Button';

export interface ImpressumViewProps {
  language: Language;
  onBack: () => void;
  onOpenContact?: () => void;
}

export const ImpressumView: React.FC<ImpressumViewProps> = ({ language, onBack, onOpenContact }) => {
  const isDe = language === 'de';

  return (
    <div className="max-w-4xl w-full mx-auto py-4 sm:py-8 px-4 sm:px-6 animate-in fade-in duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        icon={<ArrowLeft className="w-4 h-4" />}
        iconPosition="left"
        className="mb-6"
      >
        {isDe ? 'Zurück' : 'Back'}
      </Button>

      <div className="bg-surface rounded-3xl border border-border-subtle p-6 sm:p-10 shadow-apple-card space-y-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text tracking-tight">
            {isDe ? 'Impressum' : 'Legal Notice (Impressum)'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isDe 
              ? 'Gesetzliche Anbieterkennzeichnung nach § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag (MStV)' 
              : 'Service provider information pursuant to § 5 DDG and § 18 (2) MStV'}
          </p>
        </div>

        {/* 1. Status: Individuelle Initiative & Erprobungsschwerpunkt Rhein-Neckar */}
        <section className="p-4 sm:p-5 rounded-2xl bg-surface-2 border border-border-subtle space-y-2.5">
          <div className="flex items-center gap-2 text-accent-text font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>{isDe ? 'Rechtlicher Status & Regionaler Fokus' : 'Legal Status & Regional Focus'}</span>
          </div>
          <p className="text-sm text-text font-medium leading-relaxed">
            {isDe
              ? 'Diese Web-App ist eine private, ehrenamtliche Einzelinitiative und keine offizielle Plattform der Bahá\'í-Gemeinde in Deutschland K.d.ö.R. oder internationaler Bahá\'í-Institutionen.'
              : 'This web app is an independent, non-commercial volunteer initiative and not an official publication of the Bahá\'í Community in Germany (K.d.ö.R.) or international Bahá\'í institutions.'}
          </p>
          <div className="text-xs text-text-secondary space-y-1.5 leading-relaxed pt-1">
            <p>
              <strong>{isDe ? 'Fokus Cluster Rhein-Neckar:' : 'Focus Cluster Rhein-Neckar:'}</strong>{' '}
              {isDe
                ? 'Das Angebot dient primär der Erprobung und Unterstützung des Junior-Jugendprogramms im Cluster Rhein-Neckar (Heidelberg, Mannheim und Umgebung). Es ist ausdrücklich noch nicht für einen deutschlandweiten oder weltweiten Einsatz freigegeben oder vorgesehen.'
                : 'This platform serves primarily to test and support the Junior Youth Spiritual Empowerment Programme in Cluster Rhein-Neckar (Heidelberg, Mannheim and surroundings). It is explicitly not yet approved or intended for nationwide or global adoption.'}
            </p>
            <p>
              <strong>{isDe ? 'Experimenteller Charakter:' : 'Experimental Status:'}</strong>{' '}
              {isDe
                ? 'Es handelt sich um ein laufendes Entwicklungsprojekt (experimentelle Phase). Alle Funktionen, Methoden und Spielabläufe werden auf Basis der praktischen Gruppenerfahrungen vor Ort erprobt und kontinuierlich angepasst.'
                : 'This is an evolving experimental project. All tools, methods, and activities are continuously refined based on local group practice.'}
            </p>
          </div>
        </section>

        {/* 2. Angaben nach § 5 DDG */}
        <section className="space-y-3 text-sm text-text-secondary">
          <h2 className="text-base font-semibold text-text">
            {isDe ? 'Diensteanbieter & Verantwortlicher' : 'Service Provider & Responsible Operator'}
          </h2>
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-2 border border-border-subtle text-xs sm:text-sm leading-relaxed space-y-2">
            <div>
              <p className="font-bold text-text">Junior Youth Resource Hub</p>
              <p className="text-text-secondary">{isDe ? 'Private Einzelinitiative' : 'Independent Initiative'}</p>
            </div>

            <div className="pt-2 border-t border-border-subtle flex flex-col gap-1.5 text-xs text-text-secondary">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                <span>Nuri Modabber · Cluster Rhein-Neckar (Baden-Württemberg, Deutschland)</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                <span className="font-mono select-all">nuri@modabber.net · lasse.nieruch@bahai.de</span>
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                <span>https://juju-hub.vercel.app</span>
              </span>
            </div>

            <div className="pt-3 flex items-center gap-3">
              {onOpenContact ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenContact}
                  icon={<Mail className="w-3.5 h-3.5" />}
                  iconPosition="left"
                >
                  {isDe ? 'Kontakt aufnehmen / E-Mail hinterlegen' : 'Open Contact / Leave email'}
                </Button>
              ) : (
                <a
                  href="mailto:nuri@modabber.net,lasse.nieruch@bahai.de"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-surface hover:bg-surface-3 border border-border text-text transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isDe ? 'E-Mail schreiben' : 'Send email'}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 3. Redaktionelle Verantwortung nach § 18 Abs. 2 MStV */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? 'Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)' : 'Editorial Responsibility (§ 18 (2) MStV)'}
          </h2>
          <p>
            {isDe
              ? 'Verantwortlich für redaktionell-didaktische Inhalte im Sinne des § 18 Abs. 2 MStV: Nuri Modabber, Cluster Rhein-Neckar, Deutschland (in redaktioneller Begleitung und Zusammenarbeit mit Lasse Nieruch; Erreichbarkeit über oben angegebene E-Mail-Adressen).'
              : 'Responsible for editorial and pedagogical content pursuant to § 18 (2) MStV: Nuri Modabber, Cluster Rhein-Neckar, Germany (in editorial collaboration with Lasse Nieruch; reachable via the email addresses above).'}
          </p>
        </section>

        {/* 4. Urheberrecht & Heilige Zitate */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? 'Urheberrecht & Heilige Texte' : 'Copyright & Sacred Scripture'}
          </h2>
          <p>
            {isDe
              ? 'Die in dieser Anwendung zitierten heiligen Schriften der Bahá\'í-Offenbarung sind den autorisierten Übersetzungen entnommen und verbleiben uneingeschränkt im Urheberrecht der jeweiligen nationalen und internationalen Herausgeber (Bahá\'í-Verlag Hofheim / Bahá\'í World Centre). Die Wiedergabe erfolgt ausschließlich zu nicht-kommerziellen Zwecken des persönlichen und gemeinschaftlichen Studiums sowie der Andacht.'
              : 'The holy scriptures cited in this application are taken from officially authorized translations and remain under the copyright of their respective publishers (Bahá\'í Publishing Trust / Bahá\'í World Centre). Reproduction is strictly non-commercial for personal and collective study and devotion.'}
          </p>
          <p className="text-xs text-text-tertiary">
            {isDe
              ? 'Die Eigenentwicklungen des Quellcodes, die Benutzeroberfläche und didaktische Ablaufbeschreibungen unterliegen der Open-Source-Lizenz (MIT-Lizenz).'
              : 'Original code developments, UI designs, and pedagogical summaries are open source under the MIT License.'}
          </p>
        </section>

        {/* 5. Haftung für Inhalte und Links */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? 'Haftung für Inhalte und externe Verweise' : 'Liability for Content & External Links'}
          </h2>
          <p>
            {isDe
              ? 'Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Für externe Verweise (Links) auf fremde Webseiten Dritter (z. B. bahaisongs.com) haben wir keinen Einfluss auf deren Gestaltung und Inhalt. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'
              : 'As a service provider, we are responsible for our own content on these pages under § 7 (1) DDG. For external links to third-party websites (such as bahaisongs.com), we have no influence on design or content; responsibility lies solely with the third-party providers.'}
          </p>
        </section>
      </div>
    </div>
  );
};
