import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Language } from '../types';
import { Button } from './ui/Button';

export interface NutzungsbedingungenViewProps {
  language: Language;
  onBack: () => void;
}

type Text = { de: string; en: string };

// Freigegeben vom Inhaber am 2026-11-10. Liability, licence for contributions and governing law are
// legal statements: change them only with the owner.
const SECTIONS: { title: Text; paragraphs: Text[] }[] = [
  {
    title: { de: '1. Worum es geht', en: '1. Scope' },
    paragraphs: [
      {
        de: 'Juju Hub ist eine private, ehrenamtliche Initiative für Animatoren von Juniorjugendgruppen (Angaben im Impressum). Diese Bedingungen gelten, wenn du die Webseite nutzt oder einen Beitrag einsendest. Du brauchst dafür kein Konto.',
        en: 'Juju Hub is a private volunteer initiative for animators of junior youth groups (details in the legal notice). These terms apply when you use the website or send in a contribution. You do not need an account.',
      },
    ],
  },
  {
    title: { de: '2. Kostenlos und ohne Gewähr', en: '2. Free and as is' },
    paragraphs: [
      {
        de: 'Die Nutzung ist kostenlos. Es gibt keinen Anspruch darauf, dass die Seite immer erreichbar ist oder dass Inhalte vollständig sind. Inhalte und Funktionen können sich jederzeit ändern oder wegfallen.',
        en: 'Using the site is free. There is no right to constant availability or complete content. Content and features may change or be removed at any time.',
      },
    ],
  },
  {
    title: { de: '3. Deine Verantwortung in der Gruppe', en: '3. Your responsibility in the group' },
    paragraphs: [
      {
        de: 'Spiele, Projekte und Werkzeuge sind Anregungen. Du entscheidest, was zu deiner Gruppe passt, und sorgst bei der Durchführung für Aufsicht und Sicherheit der Juniorjugendlichen.',
        en: 'Games, projects and tools are suggestions. You decide what suits your group and take care of supervision and safety of the junior youth when you run them.',
      },
    ],
  },
  {
    title: { de: '4. Haftung', en: '4. Liability' },
    paragraphs: [
      {
        de: 'Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Im Übrigen ist die Haftung ausgeschlossen, soweit das Gesetz es erlaubt. Für eigene Inhalte und externe Links gilt außerdem der Abschnitt zur Haftung im Impressum.',
        en: 'We are fully liable for intent and gross negligence and for injury to life, body or health. Otherwise liability is excluded as far as the law permits. For our own content and external links, the liability section of the legal notice also applies.',
      },
    ],
  },
  {
    title: { de: '5. Heilige Texte und Urheberrecht', en: '5. Sacred texts and copyright' },
    paragraphs: [
      {
        de: 'Zitate aus den Bahá’í-Schriften werden unverändert und mit Quelle wiedergegeben. Die Rechte an Texten und Übersetzungen liegen bei den jeweiligen Rechteinhabern (siehe Impressum). Nutze sie nur nicht-kommerziell für Studium, Andacht und die Arbeit mit deiner Gruppe.',
        en: 'Quotations from the Bahá’í Writings are reproduced unchanged and with their source. The rights to texts and translations remain with their holders (see legal notice). Use them only non-commercially for study, devotion and your work with your group.',
      },
    ],
  },
  {
    title: { de: '6. Eigene Beiträge', en: '6. Your contributions' },
    paragraphs: [
      {
        de: 'Mit dem Einsenden bestätigst du, dass du den Inhalt selbst geschrieben hast oder ihn weitergeben darfst. Du erlaubst, dass die Redaktion ihn prüft, sprachlich anpasst, kürzt und kostenlos auf Juju Hub veröffentlicht, ohne zeitliche Begrenzung. Du darfst deinen Beitrag weiterhin auch anderswo verwenden.',
        en: 'By sending a contribution you confirm that you wrote it yourself or may share it. You allow the editors to review, edit, shorten and publish it free of charge on Juju Hub, without time limit. You may still use your contribution elsewhere.',
      },
      {
        de: 'Beiträge enthalten keine Namen, Fotos oder anderen Daten von Juniorjugendlichen, keine Werbung und nichts Rechtswidriges oder Verletzendes. Es gibt keinen Anspruch auf Veröffentlichung. Die Redaktion kann Beiträge ablehnen oder später entfernen. Wenn du deinen veröffentlichten Beitrag entfernt haben möchtest, schreib uns über den Kontakt.',
        en: 'Contributions contain no names, photos or other data of junior youth, no advertising and nothing unlawful or hurtful. There is no right to publication. The editors may decline contributions or remove them later. If you want your published contribution removed, write to us via the contact form.',
      },
    ],
  },
  {
    title: { de: '7. Änderungen und Recht', en: '7. Changes and law' },
    paragraphs: [
      {
        de: 'Wir können diese Bedingungen anpassen. Es gilt die Fassung, die hier steht. Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften deines Wohnsitzlandes bleiben unberührt.',
        en: 'We may change these terms. The version shown here applies. German law applies. Mandatory consumer protection rules of your country of residence remain unaffected.',
      },
    ],
  },
];

export const NutzungsbedingungenView: React.FC<NutzungsbedingungenViewProps> = ({ language, onBack }) => {
  const isDe = language === 'de';
  const pick = (t: Text) => (isDe ? t.de : t.en);

  return (
    <div className="max-w-4xl w-full mx-auto animate-in fade-in duration-200">
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

      <div className="space-y-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
            {isDe ? 'Nutzungsbedingungen' : 'Terms of Use'}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2">
            {isDe ? 'Stand: November 2026' : 'As of November 2026'}
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title.de} className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <h2 className="text-base font-semibold text-text">{pick(section.title)}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.de}>{pick(p)}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};
