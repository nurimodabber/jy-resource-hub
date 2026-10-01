import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Check, Trash2 } from 'lucide-react';
import { Language } from '../types';
import { Button } from './ui/Button';

export interface DatenschutzViewProps {
  language: Language;
  onBack: () => void;
}

export const DatenschutzView: React.FC<DatenschutzViewProps> = ({ language, onBack }) => {
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    if (window.confirm(
      language === 'de'
        ? 'Möchtest du alle lokal im Browser gespeicherten Daten (Favoriten, Pläne, Einstellungen) wirklich löschen?'
        : 'Are you sure you want to clear all locally stored data (favorites, plans, settings)?'
    )) {
      localStorage.removeItem('jy_favorites');
      localStorage.removeItem('jy_lang');
      localStorage.removeItem('jy_theme');
      localStorage.removeItem('jy_plans');
      localStorage.removeItem('jy_active_plan_id');
      localStorage.removeItem('jy_quick_pick');
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  };

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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text tracking-tight">
            {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {language === 'de' 
              ? 'Datenschutz nach DSGVO (GDPR) — Radikal sparsam & privat' 
              : 'Data protection compliant with GDPR — Privacy by Design'}
          </p>
        </div>

        {/* Grundsatz: Keine Cookies, kein Tracking */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? '1. Keine Tracking-Cookies, keine Werbenetzwerke' : '1. No Tracking Cookies, No Ad Networks'}
          </h2>
          <p>
            {language === 'de'
              ? 'Der Junior Youth Resource Hub verwendet bewusst keine Analyse-Dienste von Drittanbietern (wie Google Analytics, Meta Pixel), keine Werbenetzwerke und keine Marketing-Cookies. Dein Besuch wird nicht über Websites hinweg nachverfolgt.'
              : 'The Junior Youth Resource Hub deliberately does not use third-party tracking services (such as Google Analytics or Meta Pixel), ad networks, or marketing cookies. Your visit is never tracked across websites.'}
          </p>
        </section>

        {/* Schutz von Juniorjugendlichen */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? '2. Konsequenter Schutz von Minderjährigen & Jugendlichen' : '2. Strict Safeguarding of Minors & Youth'}
          </h2>
          <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="font-medium text-text">
              {language === 'de'
                ? 'Diese Plattform erfasst, speichert und verarbeitet zu keinem Zeitpunkt personenbezogene Daten, Namen oder Bildaufnahmen von Juniorjugendlichen oder Kindern.'
                : 'This platform at no point collects, processes, or stores any personal data, names, or identifiable photographs of junior youth or children.'}
            </p>
            <p className="text-xs text-text-secondary mt-2">
              {language === 'de'
                ? 'Ressourcen und Planungswerkzeuge richten sich ausschließlich an erwachsene Animatoren, Mentor*innen und Koordinatoren.'
                : 'All planning tools and resources are intended exclusively for adult animators, mentors, and coordinators.'}
            </p>
          </div>
        </section>

        {/* Lokale Speicherung */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? '3. Lokale Speicherung im Browser (LocalStorage)' : '3. Local Storage in Your Browser (LocalStorage)'}
          </h2>
          <p>
            {language === 'de'
              ? 'Deine Favoriten, die gewählte Sprache (DE/EN) und dein bevorzugtes Farbschema (Hell/Dunkel) werden ausschließlich lokal in deinem Browser gespeichert. Diese Informationen verlassen dein Endgerät zu keinem Zeitpunkt.'
              : 'Your favorites, language preference (DE/EN), and theme mode (Light/Dark) are stored strictly locally in your browser. This information never leaves your device.'}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              iconPosition="left"
            >
              {language === 'de' ? 'Lokale Browserdaten jetzt löschen' : 'Clear local browser data now'}
            </Button>
            {cleared && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {language === 'de' ? 'Gelöscht!' : 'Cleared!'}
              </span>
            )}
          </div>
        </section>

        {/* Hosting bei Vercel */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? '4. Hosting & Server-Logfiles' : '4. Hosting & Server Log Files'}
          </h2>
          <p>
            {language === 'de'
              ? 'Diese Anwendung wird über Vercel Inc. (San Francisco, CA, USA) ausgeliefert. Beim Abruf einer Webseite erhebt der Provider technisch erforderliche Daten (wie anonymisierte IP-Adresse, Datum und Uhrzeit des Abrufs), um den sicheren Betrieb zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO).'
              : 'This application is hosted and delivered via Vercel Inc. When accessing a page, the hosting provider processes standard technical server logs (such as truncated IP address, date and time of request) solely to ensure server security and performance (Art. 6 (1) (f) GDPR).'}
          </p>
        </section>

        {/* Externe Einbindungen: bahaisongs.com */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? '5. Externe Einbindung (bahaisongs.com via Zwei-Klick-Lösung)' : '5. External Embeds (bahaisongs.com via 2-Click Pattern)'}
          </h2>
          <p>
            {language === 'de'
              ? 'Für Andachtslieder bieten wir eine optionale Einbindung des externen Noten- und Liedarchivs bahaisongs.com an. Um deine Privatsphäre zu schützen, wird dieser Dienst standardmäßig blockiert (Click-to-Load / Zwei-Klick-Lösung). Erst wenn du aktiv auf „Lieder-Archiv laden“ klickst, wird eine Verbindung zu bahaisongs.com aufgebaut und deine IP-Adresse an den Betreiber übertragen.'
              : 'For devotional songs, we provide an optional embed of the external sheet music archive bahaisongs.com. To protect your privacy, this service is blocked by default (click-to-load / two-click pattern). Only when you actively click "Load songs archive", a connection to bahaisongs.com is established and your IP address is transmitted to the provider.'}
          </p>
        </section>

        {/* Betroffenenrechte */}
        <section className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-base font-semibold text-text">
            {language === 'de' ? '6. Deine Rechte' : '6. Your Rights'}
          </h2>
          <p>
            {language === 'de'
              ? 'Du hast jederzeit das Recht auf Auskunft, Berichtigung oder Löschung deiner Daten nach Art. 15–21 DSGVO. Bei Fragen zum Datenschutz wende dich bitte an die im Impressum hinterlegte Kontaktadresse.'
              : 'You have the right to access, rectify, or delete your personal data under Art. 15–21 GDPR at any time. For questions regarding data privacy, please contact the address provided in the Legal Notice.'}
          </p>
        </section>
      </div>
    </div>
  );
};
