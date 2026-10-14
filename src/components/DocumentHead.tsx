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
      ? 'Spiele, Zitate, Planer und Werkzeuge für Animatoren von Bahá\'í-Juniorjugendgruppen.'
      : 'Curated games, scripture quotes with memorisation methods, session planner, and field tools for Bahá\'í junior youth animators and camps.';

    if (pathname === '/' || pathname === '/home') {
      title = isDe
        ? 'Junior Youth Hub — Spiele, Zitate und Werkzeuge für Animatoren'
        : 'Junior Youth Hub — Games, quotes and tools for animators';
    } else if (pathname.startsWith('/games')) {
      title = isDe ? 'Spiele — Junior Youth Hub' : 'Games — Junior Youth Hub';
      description = isDe
        ? 'Erprobte Gruppenspiele nach Energielevel, Gruppengröße und Material filtern.'
        : 'Field-tested group games filtered by energy level, group size, and materials.';
    } else if (pathname.startsWith('/quotes')) {
      title = isDe ? 'Zitate — Junior Youth Hub' : 'Quotes — Junior Youth Hub';
      description = isDe
        ? 'Kanonische Bahá\'í-Zitate nach Text und Thema mit interaktiven Lernmethoden.'
        : 'Canonical Bahá\'í quotes by text and topic with interactive memorisation tools.';
    } else if (pathname.startsWith('/planner')) {
      title = isDe ? 'Planer — Junior Youth Hub' : 'Planner — Junior Youth Hub';
      description = isDe
        ? 'Gruppentreffen und Andachten per Drag & Drop planen und als Handout drucken.'
        : 'Plan group sessions and devotionals with drag-and-drop, export and print.';
    } else if (pathname.startsWith('/service-arts')) {
      title = isDe ? 'Dienst und Kunst — Junior Youth Hub' : 'Service and Arts — Junior Youth Hub';
      description = isDe
        ? 'Gemeindedienst-Projekte und kreative Ausdrucks-Impulse für Jugendliche.'
        : 'Community service projects and creative arts prompts for junior youth.';
    } else if (pathname.startsWith('/tools')) {
      title = isDe ? 'Werkzeuge — Junior Youth Hub' : 'Tools — Junior Youth Hub';
      description = isDe
        ? 'Empire, Rollenverteiler, Teams, Timer und Spielfinder.'
        : 'Empire, role dealer, teams, timer and game finder.';
    } else if (pathname === '/impressum') {
      title = isDe ? 'Impressum — Junior Youth Hub' : 'Legal Notice — Junior Youth Hub';
      description = 'Angaben gemäß § 5 TMG.';
    } else if (pathname === '/datenschutz') {
      title = isDe ? 'Datenschutzerklärung — Junior Youth Hub' : 'Privacy Policy — Junior Youth Hub';
      description = 'Datenschutz nach DSGVO: Keine Cookies, kein Tracking, 100% lokal.';
    } else {
      title = isDe ? 'Seite nicht gefunden — Junior Youth Hub' : 'Page not found — Junior Youth Hub';
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
