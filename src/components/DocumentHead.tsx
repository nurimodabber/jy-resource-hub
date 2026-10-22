import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { useAdminData } from '../context/AdminDataContext';
import { QUOTES_DATA } from '../data/quotes';
import { SERVICE_PROJECTS_DATA } from '../data/serviceProjects';
import { ARTS_PROMPTS_DATA } from '../data/artsPrompts';

interface DocumentHeadProps {
  language: Language;
}

const TOOL_META: Record<string, { de: [string, string]; en: [string, string] }> = {
  teams: {
    de: ['Teams und Zweiergruppen', 'Zufällig und fair einteilen, ohne dieselben Paare zu wiederholen.'],
    en: ['Teams and pairs', 'Split fairly at random without repeating the same pairs.'],
  },
  timer: {
    de: ['Timer & Intervall', 'Große Anzeige mit Signalton und Runden für die Gruppe.'],
    en: ['Timer & Interval', 'Large display with chime and rounds for the group.'],
  },
  scoreboard: {
    de: ['Punktetafel', 'Punkte für Stationen oder Quizrunden ohne Beschämung erfassen.'],
    en: ['Scoreboard', 'Track points for stations or quiz rounds without shaming.'],
  },
  cards: {
    de: ['Gesprächskarten', 'Fragen und heilige Zitate für das vertiefende Gespräch im Kreis.'],
    en: ['Conversation cards', 'Questions and sacred scripture for deeper circle conversations.'],
  },
  group: {
    de: ['Meine Gruppe', 'Gemeinsame Namens- und Anwesenheitsliste für alle Werkzeuge.'],
    en: ['My group', 'Shared member presence list across all tools.'],
  },
};

export const DocumentHead: React.FC<DocumentHeadProps> = ({ language }) => {
  const location = useLocation();
  const isDe = language === 'de';
  const adminData = useAdminData();
  const allGames = adminData.games.length > 0 ? adminData.games : GAMES_DATA;

  useEffect(() => {
    const pathname = location.pathname;
    const origin = window.location.origin;

    let title: string;
    let description = isDe
      ? 'Spiele, heilige Zitate, Dienst- und Kunstprojekte und Live-Werkzeuge für Animatoren von Bahá\'í-Juniorjugendgruppen.'
      : 'Curated games, sacred scripture quotes, service and arts projects, and live tools for Bahá\'í junior youth animators.';
    let ogType = 'website';
    const ogParams = new URLSearchParams();
    let jsonLd: Record<string, unknown> | null = null;

    if (pathname === '/' || pathname === '/home') {
      title = isDe
        ? 'Junior Youth Hub — Spiele, Zitate und Werkzeuge für Animatoren'
        : 'Junior Youth Hub — Games, quotes and tools for animators';
      ogParams.set('type', 'home');
      ogParams.set('title', 'Junior Youth Hub');
      ogParams.set('subtitle', isDe ? 'Spiele · Heilige Zitate · Werkzeuge' : 'Games · Sacred Quotes · Tools');

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Junior Youth Hub',
        url: origin,
        inLanguage: ['de', 'en'],
        description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/games?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
    } else if (pathname === '/games') {
      title = isDe ? 'Spiele — Junior Youth Hub' : 'Games — Junior Youth Hub';
      description = isDe
        ? 'Erprobte Gruppenspiele für 11- bis 15-Jährige nach Wirkung, Energielevel, Gruppengröße und Material filtern.'
        : 'Field-tested group games for ages 11–15 filtered by purpose, energy level, group size, and materials.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Gruppenspiele' : 'Group Games');
      ogParams.set('subtitle', description);
    } else if (pathname.startsWith('/games/')) {
      const gameId = pathname.replace('/games/', '').split('/')[0];
      const game = allGames.find((g) => g.id === gameId);
      if (game) {
        const gTitle = game.title[language];
        const sizeStr = `${game.groupSize.min}–${game.groupSize.max} ${isDe ? 'Pers.' : 'ppl'}`;
        title = isDe
          ? `${gTitle} – Spiel (${sizeStr}, ${game.durationMinutes}) | Junior Youth Hub`
          : `${gTitle} – Game (${sizeStr}, ${game.durationMinutes}) | Junior Youth Hub`;
        description = `${game.summary[language]} ${game.idea[language]}`;
        ogType = 'article';
        ogParams.set('type', 'game');
        ogParams.set('id', game.id);
        ogParams.set('title', gTitle);
        ogParams.set('subtitle', `${sizeStr} · ${game.durationMinutes}`);

        const mats = game.materials[language].filter((m) => !/^(keine|none)/i.test(m));
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: gTitle,
          description: game.idea[language],
          totalTime: `PT${game.durationMax || 15}M`,
          supply: mats.map((m) => ({ '@type': 'HowToSupply', name: m })),
          step: game.rules[language].map((rule, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: isDe ? `Schritt ${idx + 1}` : `Step ${idx + 1}`,
            text: rule,
          })),
        };
      } else {
        title = isDe ? 'Spiel nicht gefunden — Junior Youth Hub' : 'Game not found — Junior Youth Hub';
      }
    } else if (pathname === '/quotes') {
      title = isDe ? 'Zitate — Junior Youth Hub' : 'Quotes — Junior Youth Hub';
      description = isDe
        ? 'Kanonische Bahá\'í-Zitate und Gebete nach Jugendbuch und Thema mit interaktiven Lernmethoden.'
        : 'Canonical Bahá\'í quotes and prayers by book and topic with interactive memorisation tools.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Heilige Zitate & Gebete' : 'Sacred Quotes & Prayers');
      ogParams.set('subtitle', description);
    } else if (pathname.startsWith('/quotes/')) {
      const quoteId = pathname.replace('/quotes/', '').split('/')[0];
      const quote = QUOTES_DATA.find((q) => q.id === quoteId);
      if (quote) {
        const qTheme = quote.theme[language];
        const qSource = quote.source[language];
        const qText = isDe ? quote.textDe : quote.textEn;
        const qBook = quote.book[language];
        title = isDe
          ? `${qTheme} – Zitat (${qSource}) | Junior Youth Hub`
          : `${qTheme} – Quote (${qSource}) | Junior Youth Hub`;
        description = `„${qText}“ — ${qSource} (${qBook})`;
        ogType = 'article';
        ogParams.set('type', 'quote');
        ogParams.set('id', quote.id);
        ogParams.set('title', qText.slice(0, 180));
        ogParams.set('subtitle', `${qSource} · ${qBook}`);

        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Quotation',
          name: qTheme,
          text: qText,
          creator: {
            '@type': 'Person',
            name: qSource.split('(')[0].trim(),
          },
          isPartOf: {
            '@type': 'Book',
            name: qBook,
          },
          about: qTheme,
          inLanguage: language,
        };
      } else {
        title = isDe ? 'Zitat nicht gefunden — Junior Youth Hub' : 'Quote not found — Junior Youth Hub';
      }
    } else if (pathname === '/service') {
      title = isDe ? 'Dienstprojekte — Junior Youth Hub' : 'Service Projects — Junior Youth Hub';
      description = isDe
        ? 'Gemeindedienst-Projekte und Aktionen für Juniorjugendgruppen und Camps.'
        : 'Community service projects and action ideas for junior youth groups and camps.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Dienstprojekte' : 'Service Projects');
      ogParams.set('subtitle', description);
    } else if (pathname.startsWith('/service/')) {
      const actId = pathname.replace('/service/', '').split('/')[0];
      const activity = SERVICE_PROJECTS_DATA.find((a) => a.id === actId);
      if (activity) {
        const aTitle = activity.title[language];
        const kindLabel = isDe ? 'Dienstprojekt' : 'Service Project';
        const sizeStr = `${activity.groupSize.min}–${activity.groupSize.max} ${isDe ? 'Pers.' : 'ppl'}`;
        title = `${aTitle} – ${kindLabel} (${sizeStr}) | Junior Youth Hub`;
        description = activity.objective[language];
        ogType = 'article';
        ogParams.set('type', 'activity');
        ogParams.set('id', activity.id);
        ogParams.set('title', aTitle);
        ogParams.set('subtitle', `${kindLabel} · ${sizeStr}`);
      } else {
        title = isDe ? 'Dienstprojekt nicht gefunden — Junior Youth Hub' : 'Service project not found — Junior Youth Hub';
      }
    } else if (pathname === '/arts') {
      title = isDe ? 'Kreative Kunst — Junior Youth Hub' : 'Creative Arts — Junior Youth Hub';
      description = isDe
        ? 'Kreative Ausdrucks-Impulse, Theater, Musik und bildende Kunst für Juniorjugendgruppen.'
        : 'Creative arts prompts, drama, music and visual arts for junior youth groups.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Kreative Kunst' : 'Creative Arts');
      ogParams.set('subtitle', description);
    } else if (pathname.startsWith('/arts/')) {
      const actId = pathname.replace('/arts/', '').split('/')[0];
      const activity = ARTS_PROMPTS_DATA.find((a) => a.id === actId);
      if (activity) {
        const aTitle = activity.title[language];
        const kindLabel = isDe ? 'Kreative Kunst' : 'Creative Arts';
        const sizeStr = `${activity.groupSize.min}–${activity.groupSize.max} ${isDe ? 'Pers.' : 'ppl'}`;
        title = `${aTitle} – ${kindLabel} (${sizeStr}) | Junior Youth Hub`;
        description = activity.description[language];
        ogType = 'article';
        ogParams.set('type', 'activity');
        ogParams.set('id', activity.id);
        ogParams.set('title', aTitle);
        ogParams.set('subtitle', `${kindLabel} · ${sizeStr}`);
      } else {
        title = isDe ? 'Kunst-Impuls nicht gefunden — Junior Youth Hub' : 'Creative art prompt not found — Junior Youth Hub';
      }
    } else if (pathname === '/service-arts') {
      title = isDe ? 'Dienst & Kunst — Junior Youth Hub' : 'Service & Arts — Junior Youth Hub';
      description = isDe
        ? 'Gemeindedienst-Projekte und kreative Ausdrucks-Impulse für Juniorjugendgruppen und Camps.'
        : 'Community service projects and creative arts prompts for junior youth groups and camps.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Dienst & Kunst' : 'Service & Arts');
      ogParams.set('subtitle', description);
    } else if (pathname.startsWith('/service-arts/')) {
      const actId = pathname.replace('/service-arts/', '').split('/')[0];
      const allActivities = [...SERVICE_PROJECTS_DATA, ...ARTS_PROMPTS_DATA];
      const activity = allActivities.find((a) => a.id === actId);
      if (activity) {
        const aTitle = activity.title[language];
        const kindLabel =
          activity.kind === 'dienst'
            ? isDe ? 'Dienstprojekt' : 'Service Project'
            : isDe ? 'Kunst & Ausdruck' : 'Arts & Drama';
        const sizeStr = `${activity.groupSize.min}–${activity.groupSize.max} ${isDe ? 'Pers.' : 'ppl'}`;
        title = `${aTitle} – ${kindLabel} (${sizeStr}) | Junior Youth Hub`;
        description = activity.kind === 'dienst' ? activity.objective[language] : activity.description[language];
        ogType = 'article';
        ogParams.set('type', 'activity');
        ogParams.set('id', activity.id);
        ogParams.set('title', aTitle);
        ogParams.set('subtitle', `${kindLabel} · ${sizeStr}`);
      } else {
        title = isDe ? 'Projekt nicht gefunden — Junior Youth Hub' : 'Project not found — Junior Youth Hub';
      }
    } else if (pathname === '/tools') {
      title = isDe ? 'Werkzeuge — Junior Youth Hub' : 'Tools — Junior Youth Hub';
      description = isDe
        ? 'Live-Werkzeuge für die Gruppe: Teams, Timer, Punktetafel, Gesprächskarten und Namensliste.'
        : 'Live tools for the group: Teams, timer, scoreboard, conversation cards and member list.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Werkzeuge' : 'Tools');
      ogParams.set('subtitle', description);
    } else if (pathname.startsWith('/tools/')) {
      const toolId = pathname.replace('/tools/', '').split('/')[0];
      const toolMeta = TOOL_META[toolId];
      if (toolMeta) {
        const [tName, tDesc] = toolMeta[language];
        title = isDe
          ? `${tName} – Werkzeug | Junior Youth Hub`
          : `${tName} – Tool | Junior Youth Hub`;
        description = tDesc;
        ogParams.set('type', 'tool');
        ogParams.set('id', toolId);
        ogParams.set('title', tName);
        ogParams.set('subtitle', tDesc);
      } else {
        title = isDe ? 'Werkzeuge — Junior Youth Hub' : 'Tools — Junior Youth Hub';
      }
    } else if (pathname === '/saved') {
      title = isDe ? 'Gemerkt — Junior Youth Hub' : 'Saved — Junior Youth Hub';
      description = isDe
        ? 'Deine gespeicherten Spiele, heiligen Zitate und Projekte auf diesem Gerät.'
        : 'Your saved games, sacred scripture quotes and projects on this device.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Gemerkte Inhalte' : 'Saved Items');
    } else if (pathname === '/vorschlagen') {
      title = isDe ? 'Beitragen — Junior Youth Hub' : 'Contribute — Junior Youth Hub';
      description = isDe
        ? 'Teile ein erprobtes Gruppenspiel, Dienstprojekt oder einen Kunst-Impuls für den Junior Youth Hub.'
        : 'Contribute a field-tested group game, service project or arts prompt for the Junior Youth Hub.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Beitragen' : 'Contribute');
    } else if (pathname === '/impressum') {
      title = isDe ? 'Impressum — Junior Youth Hub' : 'Legal Notice — Junior Youth Hub';
      description = 'Angaben gemäß § 5 DDG für den Junior Youth Hub.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Impressum' : 'Legal Notice');
    } else if (pathname === '/datenschutz') {
      title = isDe ? 'Datenschutzerklärung — Junior Youth Hub' : 'Privacy Policy — Junior Youth Hub';
      description = 'Datenschutz nach DSGVO: Keine Cookies, kein Tracking, 100 % lokale Speicherung auf deinem Gerät.';
      ogParams.set('type', 'section');
      ogParams.set('title', isDe ? 'Datenschutzerklärung' : 'Privacy Policy');
    } else if (pathname === '/_design') {
      title = 'Designsystem — Junior Youth Hub';
      description = 'Komponenten-Galerie und Design-Tokens des Junior Youth Hub.';
    } else {
      title = isDe ? 'Seite nicht gefunden — Junior Youth Hub' : 'Page not found — Junior Youth Hub';
      description = isDe
        ? 'Die angeforderte Seite wurde nicht gefunden.'
        : 'The requested page could not be found.';
    }

    document.title = title;

    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const canonicalUrl = `${origin}${pathname === '/home' ? '/' : pathname}`;
    const ogImageUrl = `${origin}/api/og?${ogParams.toString()}`;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Junior Youth Hub');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImageUrl);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:locale', isDe ? 'de_DE' : 'en_US');
    setMetaTag('property', 'og:locale:alternate', isDe ? 'en_US' : 'de_DE');

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImageUrl);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Hreflang links (de, en, x-default)
    const setHreflang = (langCode: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${langCode}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', langCode);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };
    setHreflang('de', canonicalUrl);
    setHreflang('en', canonicalUrl);
    setHreflang('x-default', canonicalUrl);

    // JSON-LD Structured Data
    const existingLd = document.getElementById('jy-jsonld');
    if (jsonLd) {
      const script = existingLd || document.createElement('script');
      script.id = 'jy-jsonld';
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(jsonLd);
      if (!existingLd) document.head.appendChild(script);
    } else if (existingLd) {
      existingLd.remove();
    }
  }, [allGames, location.pathname, isDe, language]);

  return null;
};
