import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Language } from '../types';

interface DocumentHeadProps {
  language: Language;
}

export const DocumentHead: React.FC<DocumentHeadProps> = ({ language }) => {
  const location = useLocation();
  const isDe = language === 'de';

  useEffect(() => {
    const pathname = location.pathname;
    let title: string;
    let description = isDe
      ? 'Kuratierte Spiele, Zitate zum Auswendiglernen, Andachtsplaner und Praxis-Werkzeuge für Bahá\'í-Juniorjugendgruppen und Camps.'
      : 'Curated games, scripture quotes with memorisation methods, session planner, and field tools for Bahá\'í junior youth animators and camps.';

    if (pathname === '/' || pathname === '/home') {
      title = isDe
        ? 'Junior Youth Resource Hub — Material & Impulse für Gruppenleiter'
        : 'Junior Youth Resource Hub — Resources & Inspiration for Animators';
    } else if (pathname.startsWith('/games')) {
      title = isDe ? 'Spiele-Bibliothek — JY Hub' : 'Games Library — JY Hub';
      description = isDe
        ? 'Erprobte Gruppenspiele nach Energielevel, Gruppengröße und Material filtern.'
        : 'Field-tested group games filtered by energy level, group size, and materials.';
    } else if (pathname.startsWith('/quotes')) {
      title = isDe ? 'Zitate & Lernmethoden — JY Hub' : 'Quotes & Memorisation — JY Hub';
      description = isDe
        ? 'Kanonische Bahá\'í-Zitate nach Text und Thema mit interaktiven Lernmethoden.'
        : 'Canonical Bahá\'í quotes by text and topic with interactive memorisation tools.';
    } else if (pathname.startsWith('/planner')) {
      title = isDe ? 'Ablauf-Planer — JY Hub' : 'Session Planner — JY Hub';
      description = isDe
        ? 'Gruppentreffen und Andachten per Drag & Drop planen und als Handout drucken.'
        : 'Plan group sessions and devotionals with drag-and-drop, export and print.';
    } else if (pathname.startsWith('/service-arts')) {
      title = isDe ? 'Dienst & Kunst — JY Hub' : 'Service & Arts — JY Hub';
      description = isDe
        ? 'Gemeindedienst-Projekte und kreative Ausdrucks-Impulse für Jugendliche.'
        : 'Community service projects and creative arts prompts for junior youth.';
    } else if (pathname.startsWith('/tools')) {
      title = isDe ? 'Praxis-Werkzeuge — JY Hub' : 'Field Tools — JY Hub';
      description = isDe
        ? 'Team-Generator, Runden-Timer, Impulskarten und Spiel-Assistenten.'
        : 'Team generator, round timer, reflection cards, and game assistants.';
    } else if (pathname === '/impressum') {
      title = isDe ? 'Impressum — JY Hub' : 'Legal Notice — JY Hub';
      description = 'Angaben gemäß § 5 TMG.';
    } else if (pathname === '/datenschutz') {
      title = isDe ? 'Datenschutzerklärung — JY Hub' : 'Privacy Policy — JY Hub';
      description = 'Datenschutz nach DSGVO: Keine Cookies, kein Tracking, 100% lokal.';
    } else {
      title = isDe ? '404 Seite nicht gefunden — JY Hub' : '404 Page Not Found — JY Hub';
    }

    // Set document title
    document.title = title;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', window.location.href);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + pathname);
  }, [location.pathname, isDe]);

  return null;
};
