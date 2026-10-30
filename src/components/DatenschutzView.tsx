import React, { useEffect, useState } from 'react';
import { useConfirm } from './ui/ConfirmDialog';
import { clearLocalData } from '../utils/backup';

const CLEARED_FLAG = 'jy_privacy_cleared';
import { ArrowLeft, ShieldCheck, Check, Trash2, Mail } from 'lucide-react';
import { Language } from '../types';
import { Button } from './ui/Button';

export interface DatenschutzViewProps {
  language: Language;
  onBack: () => void;
  onOpenContact?: () => void;
}

export const DatenschutzView: React.FC<DatenschutzViewProps> = ({ language, onBack, onOpenContact }) => {
  // The page reloads after clearing, so the confirmation survives via a sessionStorage flag.
  // Initializers must stay pure (StrictMode runs them twice), so the flag is removed in the effect.
  const [cleared, setCleared] = useState(() => {
    try {
      return sessionStorage.getItem(CLEARED_FLAG) === '1';
    } catch {
      return false;
    }
  });
  const isDe = language === 'de';
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    if (!cleared) return;
    try {
      sessionStorage.removeItem(CLEARED_FLAG);
    } catch {
      // ignore
    }
    const timer = setTimeout(() => setCleared(false), 4000);
    return () => clearTimeout(timer);
  }, [cleared]);

  const handleClearData = async () => {
    const ok = await confirm({
      title: isDe ? 'Lokale Daten löschen?' : 'Clear local data?',
      message: isDe
        ? 'Favoriten, Gruppenliste, Punktestände, Einstellungen und alle anderen auf diesem Gerät gespeicherten Daten werden entfernt.'
        : 'Favorites, group roster, scores, settings and all other data stored on this device will be removed.',
      confirmLabel: isDe ? 'Löschen' : 'Clear',
      cancelLabel: isDe ? 'Abbrechen' : 'Cancel',
    });
    if (!ok) return;
    // Clear every jy_* key, not a fixed list: tools add their own keys (jy_group_names can hold
    // junior youths' names). Reload because in-memory app state would otherwise write the old
    // values straight back on the next change.
    clearLocalData();
    try {
      sessionStorage.setItem(CLEARED_FLAG, '1');
    } catch {
      // confirmation is optional
    }
    window.location.reload();
  };

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
          <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text tracking-tight">
            {isDe ? 'Datenschutzerklärung' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isDe 
              ? 'Transparente Information nach Art. 13 DSGVO — Sparsamkeit by Design & kein Tracking' 
              : 'Information pursuant to Art. 13 GDPR — Privacy by Design & Zero Tracking'}
          </p>
        </div>

        {/* 1. Verantwortlicher & Grundsatz */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '1. Verantwortliche Stelle & Grundsatz' : '1. Controller & Principles'}
          </h2>
          <p>
            {isDe
              ? 'Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist Nuri Modabber, Cluster Rhein-Neckar, Deutschland (in redaktioneller Zusammenarbeit mit Lasse Nieruch; E-Mail: nuri@modabber.net · lasse.nieruch@bahai.de). Der Schutz deiner Privatsphäre ist für dieses Projekt oberste Priorität. Diese Web-App wurde nach dem Grundsatz „Privacy by Design“ entwickelt: Sie funktioniert ohne Benutzerkonto, ohne Registrierung und ohne den Einsatz von Tracking- oder Analysediensten Dritter.'
              : 'The data controller pursuant to the General Data Protection Regulation (GDPR) is Nuri Modabber, Cluster Rhein-Neckar, Germany (in editorial collaboration with Lasse Nieruch; Email: nuri@modabber.net · lasse.nieruch@bahai.de). This application is built around Privacy by Design: no user registration, no user profiles, and no third-party tracking.'}
          </p>
        </section>

        {/* 2. Keine Cookies & kein Tracking */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '2. Keine Tracking-Cookies, keine Werbenetzwerke' : '2. No Tracking Cookies, No Ad Networks'}
          </h2>
          <p>
            {isDe
              ? 'Wir setzen keine Marketing-Cookies, keine Werbetracker und keine Webanalyse-Tools (wie Google Analytics, Meta Pixel etc.) ein. Dein Nutzungsverhalten wird zu keinem Zeitpunkt ausgewertet, profiliert oder an Werbepartner übertragen.'
              : 'We do not employ marketing cookies, ad networks, or third-party web analytics (such as Google Analytics or Meta Pixel). Your activity is never profiled or shared with advertising partners.'}
          </p>
        </section>

        {/* 3. Konsequenter Schutz von Minderjährigen & Jugendlichen */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '3. Konsequenter Schutz von Minderjährigen & Juniorjugendlichen' : '3. Strict Safeguarding of Minors & Youth'}
          </h2>
          <div className="p-4 rounded-2xl bg-accent-subtle/40 border border-accent/20">
            <p className="font-medium text-text">
              {isDe
                ? 'Diese Plattform erfasst, speichert und verarbeitet zu keinem Zeitpunkt personenbezogene Daten, Namen oder Bildaufnahmen von Juniorjugendlichen oder Kindern auf Servern.'
                : 'This platform at no point collects, processes, or transmits personal data, names, or photos of junior youth or children to servers.'}
            </p>
            <p className="text-xs text-text-secondary mt-2">
              {isDe
                ? 'Die angebotenen Ressourcen und didaktischen Werkzeuge richten sich ausschließlich an erwachsene und jugendliche Animatoren zur Vorbereitung und Begleitung ihrer Aktivitäten.'
                : 'All resources and companion tools are directed exclusively to animators for session preparation and activity facilitation.'}
            </p>
          </div>
        </section>

        {/* 4. Lokale Speicherung im Browser (LocalStorage) */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '4. Lokale Speicherung im Browser (LocalStorage gem. § 25 Abs. 2 Nr. 2 TDDDG)' : '4. Local Storage (§ 25 (2) No. 2 TDDDG)'}
          </h2>
          <p>
            {isDe
              ? 'Damit du die Web-App komfortabel und offline nutzen kannst, werden deine persönlichen Einstellungen (Sprachwahl DE/EN, Farbschema, Glaseffekt-Transparenz, Lesezeichen/Merkliste sowie lokal in den Werkzeugen geführte Namenslisten) ausschließlich im lokalen Speicher deines Browsers (LocalStorage) abgelegt. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG (technisch erforderlich zur Bereitstellung der von dir aufgerufenen Funktionen). Diese Daten verlassen dein Gerät zu keinem Zeitpunkt.'
              : 'To enable offline functionality and preserve your preferences (language, theme mode, transparency slider, bookmarks, and local tool rosters), data is stored strictly in your browser’s local storage pursuant to § 25 (2) No. 2 TDDDG. These items never leave your device.'}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              iconPosition="left"
            >
              {isDe ? 'Lokale Browserdaten jetzt löschen' : 'Clear local browser data now'}
            </Button>
            {cleared && (
              <span className="text-xs text-success flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {isDe ? 'Gelöscht!' : 'Cleared!'}
              </span>
            )}
          </div>
        </section>

        {/* 5. Hosting bei Vercel Inc. */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '5. Hosting & Technisch erforderliche Server-Logfiles' : '5. Hosting & Server Log Files'}
          </h2>
          <p>
            {isDe
              ? 'Diese Website wird über Vercel Inc. (San Francisco, CA, USA) gehostet. Beim technischen Aufruf einer Seite erfasst der Hoster flüchtige Server-Logdaten (wie IP-Adresse, Datum/Uhrzeit des Abrufs, User-Agent des Browsers), die ausschließlich zur Aufrechterhaltung der Netzsicherheit und Fehleranalyse erforderlich sind. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren Betrieb). Vercel Inc. ist zertifiziert nach dem EU-U.S. Data Privacy Framework bzw. verwendet Standardvertragsklauseln der EU-Kommission (Art. 46 DSGVO).'
              : 'This site is hosted via Vercel Inc. Server logs (truncated IP address, request timestamp, user agent) are processed strictly for technical stability and cybersecurity (Art. 6 (1) (f) GDPR). Vercel is certified under the EU-U.S. Data Privacy Framework.'}
          </p>
        </section>

        {/* 6. Kontaktaufnahme per E-Mail */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '6. Kontaktaufnahme per E-Mail oder Kontakt-Dialog' : '6. Contact by Email or Contact Dialog'}
          </h2>
          <p>
            {isDe
              ? 'Wenn du über den Kontakt-Button oder per E-Mail an nuri@modabber.net oder lasse.nieruch@bahai.de mit uns in Verbindung trittst, werden deine Angaben (wie E-Mail-Adresse, Name und der Inhalt deiner Nachricht) ausschließlich zur Bearbeitung und Beantwortung deiner Anfrage verarbeitet (Art. 6 Abs. 1 lit. f DSGVO bzw. Art. 6 Abs. 1 lit. b DSGVO). Deine Daten werden nicht für Werbezwecke verwendet und nach Abschluss der Bearbeitung gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.'
              : 'When you contact us via the contact dialog or email to nuri@modabber.net or lasse.nieruch@bahai.de, your email address, message, and details are processed solely to address your inquiry (Art. 6 (1) (f)/(b) GDPR). No marketing use occurs.'}
          </p>
          {onOpenContact && (
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenContact}
                icon={<Mail className="w-3.5 h-3.5 text-accent" />}
                iconPosition="left"
              >
                {isDe ? 'Kontakt aufnehmen / E-Mail hinterlegen' : 'Open Contact Dialog'}
              </Button>
            </div>
          )}
        </section>

        {/* 7. Externe Einbindungen: bahaisongs.com via Zwei-Klick-Lösung */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '7. Externe Einbindung (bahaisongs.com via Zwei-Klick-Lösung)' : '7. External Embeds (bahaisongs.com via Two-Click Solution)'}
          </h2>
          <p>
            {isDe
              ? 'Für Noten und Audioaufnahmen von Andachtsliedern verlinken wir auf das gemeinnützige Liedarchiv bahaisongs.com. Zum Schutz deiner Privatsphäre wird eine externe Einbindung standardmäßig blockiert (Click-to-Load). Erst wenn du aktiv auf „Lieder-Archiv laden“ klickst, wird eine Verbindung zu bahaisongs.com aufgebaut und deine IP-Adresse übertragen (Art. 6 Abs. 1 lit. a DSGVO).'
              : 'For sheet music and audio, optional embeds from bahaisongs.com are blocked by default. Only upon active user click is a connection initiated (Art. 6 (1) (a) GDPR).'}
          </p>
        </section>

        {/* 8. Vorschläge einreichen (GitHub Issues) */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '8. Vorschläge für Spiele & Projekte einreichen' : '8. Submitting Game & Project Proposals'}
          </h2>
          <p>
            {isDe
              ? 'Über das Formular „Vorschlag einreichen“ eingesendete Beiträge werden über eine serverseitige Schnittstelle als Issue im Projekt-Repository angelegt. Die Angabe von Name und E-Mail-Adresse ist freiwillig und dient lediglich eventuellen Rückfragen zur didaktischen Umsetzung (Art. 6 Abs. 1 lit. a / f DSGVO).'
              : 'Proposals submitted via the contribution form are processed into repository issues. Providing your name or email is strictly voluntary and used only for pedagogical clarification.'}
          </p>
        </section>

        {/* 9. Betroffenenrechte & Aufsichtsbehörde */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {isDe ? '9. Deine Rechte & Aufsichtsbehörde' : '9. Your Rights & Supervisory Authority'}
          </h2>
          <p>
            {isDe
              ? 'Du hast jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO) bezüglich deiner personenbezogenen Daten.'
              : 'You have the right to access (Art. 15 GDPR), rectification (Art. 16 GDPR), deletion (Art. 17 GDPR), and restriction of processing (Art. 18 GDPR) regarding your data.'}
          </p>
          <div className="p-4 rounded-2xl bg-surface-2 border border-border-subtle text-xs space-y-1">
            <p className="font-bold text-text">
              {isDe ? 'Zuständige Aufsichtsbehörde für Baden-Württemberg (Cluster Rhein-Neckar):' : 'Supervisory Authority (Baden-Württemberg, Cluster Rhein-Neckar):'}
            </p>
            <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW)</p>
            <p>Lautenschlagerstraße 20, 70173 Stuttgart · Telefon: 0711/61 55 41-0</p>
            <p>Web: https://www.baden-wuerttemberg.datenschutz.de</p>
          </div>
        </section>
      </div>
      {confirmDialog}
    </div>
  );
};
