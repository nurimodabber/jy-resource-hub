import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const SITE_ORIGIN = 'https://jy-resource-hub.vercel.app';

async function loadTsDataModule(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(raw, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(transpiled, 'utf8').toString('base64')}`;
  return await import(dataUrl);
}

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function run() {
  const { GAMES_DATA } = await loadTsDataModule('src/data/games.ts');
  const { QUOTES_DATA } = await loadTsDataModule('src/data/quotes.ts');
  const { SERVICE_PROJECTS_DATA } = await loadTsDataModule('src/data/serviceProjects.ts');
  const { ARTS_PROMPTS_DATA } = await loadTsDataModule('src/data/artsPrompts.ts');

  const TOOL_META = {
    empire: ['Empire', 'Kategorien, Begriffe vorlesen und Reiche verfolgen für das Gruppenspiel Empire.'],
    roles: ['Rollenverteiler', 'Geheime Rollen für Spion, Wer bin ich, Werwölfe und Mörder auf einem Handy verteilen.'],
    scoreboard: ['Punktetafel', 'Punkte für Stationen oder Quizrunden ohne Beschämung erfassen.'],
    teams: ['Teams und Zweiergruppen', 'Zufällig und fair einteilen, ohne dieselben Paare zu wiederholen.'],
    timer: ['Timer & Intervall', 'Große Anzeige mit Signalton und Runden für Handy und Beamer.'],
    finder: ['Spielfinder', 'Gruppengröße und Zeit eingeben und sofort passende Spiele erhalten.'],
    ideas: ['Spontane Impulse', 'Sortierkriterien, Geschichtenanfänge und Psychiater-Regeln für die Gruppe.'],
    cards: ['Gesprächskarten', 'Fragen und heilige Zitate für das vertiefende Gespräch im Kreis.'],
  };

  const routes = [
    {
      path: '/',
      priority: '1.0',
      title: 'Junior Youth Hub — Spiele, Zitate und Werkzeuge für Animatoren',
      description:
        "Spiele, heilige Zitate, Dienst- und Kunstprojekte, Treffen-Planer und Live-Werkzeuge für Animatoren von Bahá'í-Juniorjugendgruppen.",
      ogType: 'website',
      ogQuery: 'type=home&title=Junior+Youth+Hub',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Junior Youth Hub',
        url: SITE_ORIGIN,
        inLanguage: ['de', 'en'],
        description:
          "Spiele, heilige Zitate, Dienst- und Kunstprojekte, Treffen-Planer und Live-Werkzeuge für Animatoren von Bahá'í-Juniorjugendgruppen.",
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_ORIGIN}/games?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    },
    {
      path: '/games',
      priority: '0.9',
      title: 'Spiele — Junior Youth Hub',
      description:
        'Erprobte Gruppenspiele für 11- bis 15-Jährige nach Wirkung, Energielevel, Gruppengröße und Material filtern.',
      ogType: 'website',
      ogQuery: 'type=section&title=Gruppenspiele',
    },
    {
      path: '/quotes',
      priority: '0.9',
      title: 'Zitate — Junior Youth Hub',
      description:
        "Kanonische Bahá'í-Zitate und Gebete nach Jugendbuch und Thema mit interaktiven Lernmethoden.",
      ogType: 'website',
      ogQuery: 'type=section&title=Heilige+Zitate',
    },
    {
      path: '/treffen',
      priority: '0.9',
      title: 'Treffen planen — Junior Youth Hub',
      description:
        'Gruppentreffen, Andachten und Camp-Abende mit Zeitplan und Packliste planen und live begleiten.',
      ogType: 'website',
      ogQuery: 'type=section&title=Treffen+planen',
    },
    {
      path: '/service',
      priority: '0.8',
      title: 'Dienstprojekte — Junior Youth Hub',
      description:
        'Gemeindedienst-Projekte und Aktionen für Juniorjugendgruppen und Camps.',
      ogType: 'website',
      ogQuery: 'type=section&title=Dienstprojekte',
    },
    {
      path: '/arts',
      priority: '0.8',
      title: 'Kreative Kunst — Junior Youth Hub',
      description:
        'Kreative Ausdrucks-Impulse, Theater, Musik und bildende Kunst für Juniorjugendgruppen.',
      ogType: 'website',
      ogQuery: 'type=section&title=Kreative+Kunst',
    },
    {
      path: '/service-arts',
      priority: '0.7',
      title: 'Dienst & Kunst — Junior Youth Hub',
      description:
        'Gemeindedienst-Projekte und kreative Ausdrucks-Impulse für Juniorjugendgruppen und Camps.',
      ogType: 'website',
      ogQuery: 'type=section&title=Dienst+%26+Kunst',
    },
    {
      path: '/tools',
      priority: '0.8',
      title: 'Werkzeuge — Junior Youth Hub',
      description:
        'Live-Werkzeuge für Handy und Beamer: Empire, Rollenverteiler, Teams, Timer, Punktetafel und Gesprächskarten.',
      ogType: 'website',
      ogQuery: 'type=section&title=Werkzeuge',
    },
    {
      path: '/saved',
      priority: '0.6',
      title: 'Gemerkt — Junior Youth Hub',
      description: 'Deine gespeicherten Spiele, heiligen Zitate und Projekte auf diesem Gerät.',
      ogType: 'website',
      ogQuery: 'type=section&title=Gemerkt',
    },
    {
      path: '/vorschlagen',
      priority: '0.8',
      title: 'Beitragen — Junior Youth Hub',
      description:
        'Du hast ein Spiel oder Projekt, das fehlt? Teile ein erprobtes Gruppenspiel, Dienstprojekt oder einen Kunst-Impuls für den Junior Youth Hub.',
      ogType: 'website',
      ogQuery: 'type=section&title=Beitragen',
    },
    {
      path: '/impressum',
      priority: '0.3',
      title: 'Impressum — Junior Youth Hub',
      description: 'Angaben gemäß § 5 DDG für den Junior Youth Hub.',
      ogType: 'website',
      ogQuery: 'type=section&title=Impressum',
    },
    {
      path: '/datenschutz',
      priority: '0.3',
      title: 'Datenschutzerklärung — Junior Youth Hub',
      description: 'Datenschutz nach DSGVO: Keine Cookies, kein Tracking, 100 % lokale Speicherung.',
      ogType: 'website',
      ogQuery: 'type=section&title=Datenschutz',
    },
  ];

  for (const game of GAMES_DATA) {
    const sizeStr = `${game.groupSize.min}–${game.groupSize.max} Pers.`;
    const mats = game.materials.de.filter((m) => !/^(keine|none)/i.test(m));
    const q = new URLSearchParams({
      type: 'game',
      id: game.id,
      title: game.title.de,
      subtitle: `${sizeStr} · ${game.durationMinutes}`,
    });
    routes.push({
      path: `/games/${game.id}`,
      priority: '0.8',
      title: `${game.title.de} – Spiel (${sizeStr}, ${game.durationMinutes}) | Junior Youth Hub`,
      description: `${game.summary.de} ${game.idea.de}`,
      ogType: 'article',
      ogQuery: q.toString(),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: game.title.de,
        description: game.idea.de,
        totalTime: `PT${game.durationMax || 15}M`,
        supply: mats.map((m) => ({ '@type': 'HowToSupply', name: m })),
        step: game.rules.de.map((rule, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: `Schritt ${idx + 1}`,
          text: rule,
        })),
      },
    });
  }

  for (const quote of QUOTES_DATA) {
    const q = new URLSearchParams({
      type: 'quote',
      id: quote.id,
      title: quote.textDe.slice(0, 180),
      subtitle: `${quote.source.de} · ${quote.book.de}`,
    });
    routes.push({
      path: `/quotes/${quote.id}`,
      priority: '0.8',
      title: `${quote.theme.de} – Zitat (${quote.source.de}) | Junior Youth Hub`,
      description: `„${quote.textDe}“ — ${quote.source.de} (${quote.book.de})`,
      ogType: 'article',
      ogQuery: q.toString(),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Quotation',
        name: quote.theme.de,
        text: quote.textDe,
        creator: {
          '@type': 'Person',
          name: quote.source.de.split('(')[0].trim(),
        },
        isPartOf: {
          '@type': 'Book',
          name: quote.book.de,
        },
        about: quote.theme.de,
        inLanguage: 'de',
      },
    });
  }

  for (const act of [...SERVICE_PROJECTS_DATA, ...ARTS_PROMPTS_DATA]) {
    const isService = act.kind === 'dienst';
    const kindLabel = isService ? 'Dienstprojekt' : 'Kunst & Ausdruck';
    const sizeStr = `${act.groupSize.min}–${act.groupSize.max} Pers.`;
    const desc = isService ? act.objective.de : act.description.de;
    const q = new URLSearchParams({
      type: 'activity',
      id: act.id,
      title: act.title.de,
      subtitle: `${kindLabel} · ${sizeStr}`,
    });
    const dedicatedPath = isService ? `/service/${act.id}` : `/arts/${act.id}`;
    routes.push({
      path: dedicatedPath,
      priority: '0.7',
      title: `${act.title.de} – ${kindLabel} (${sizeStr}) | Junior Youth Hub`,
      description: desc,
      ogType: 'article',
      ogQuery: q.toString(),
    });
    routes.push({
      path: `/service-arts/${act.id}`,
      priority: '0.6',
      title: `${act.title.de} – ${kindLabel} (${sizeStr}) | Junior Youth Hub`,
      description: desc,
      ogType: 'article',
      ogQuery: q.toString(),
    });
  }

  for (const [toolId, [tName, tDesc]] of Object.entries(TOOL_META)) {
    const q = new URLSearchParams({
      type: 'tool',
      id: toolId,
      title: tName,
      subtitle: tDesc,
    });
    routes.push({
      path: `/tools/${toolId}`,
      priority: '0.7',
      title: `${tName} – Werkzeug | Junior Youth Hub`,
      description: tDesc,
      ogType: 'website',
      ogQuery: q.toString(),
    });
  }

  // 1. Generate public/sitemap.xml
  const today = new Date().toISOString().slice(0, 10);
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .map((r) => {
    const url = `${SITE_ORIGIN}${r.path}`;
    return `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${r.priority}</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${escapeHtml(url)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeHtml(url)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(url)}" />
  </url>`;
  })
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`✅ Generated public/sitemap.xml with ${routes.length} routes.`);

  // 2. If dist/index.html exists, pre-render route HTML files & dist/404.html
  const distIndex = path.join(DIST, 'index.html');
  if (fs.existsSync(distIndex)) {
    let baseHtml = fs.readFileSync(distIndex, 'utf8');
    fs.copyFileSync(path.join(PUBLIC, 'sitemap.xml'), path.join(DIST, 'sitemap.xml'));
    fs.copyFileSync(path.join(PUBLIC, 'robots.txt'), path.join(DIST, 'robots.txt'));

    // Inline built stylesheet into <head> to eliminate render-blocking CSS request on Slow 4G
    const cssMatch = baseHtml.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
    if (cssMatch) {
      const cssRelPath = cssMatch[1].replace(/^\//, '');
      const cssFullPath = path.join(DIST, cssRelPath);
      if (fs.existsSync(cssFullPath)) {
        const cssContent = fs.readFileSync(cssFullPath, 'utf8');
        baseHtml = baseHtml.replace(cssMatch[0], `<style id="jy-critical-css">${cssContent}</style>`);
      }
    }

    const buildStaticRootShell = (r) => {
      const cleanHeading = r.title
        .replace(/\s*[—|]\s*Junior Youth Hub.*$/, '')
        .replace(/\s*–\s*(Spiel|Zitat|Dienstprojekt|Kunst & Ausdruck|Werkzeug).*$/, '');
      const leadText = `${r.description} Entwickelt für Animatoren von Bahá’í-Juniorjugendgruppen (11 bis 15 Jahre) zur Vorbereitung am Laptop und für den unmittelbaren Live-Einsatz auf dem Smartphone oder per Beamer in der Gruppe – inklusive Offline-Unterstützung, Filterung nach Gruppengröße und Energielevel sowie interaktiven Werkzeuge für Treffen und Camps.`;
      return `<div id="root"><div class="min-h-screen bg-bg text-text flex flex-col"><header class="sticky top-0 z-40 h-16 bg-surface border-b border-border flex items-center px-4 sm:px-6"><span class="font-bold text-base text-text">Junior Youth Hub</span></header><main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-28"><div class="max-w-4xl mx-auto space-y-6"><section class="space-y-3"><h1 class="text-2xl sm:text-3xl font-bold text-text tracking-tight">${escapeHtml(cleanHeading)}</h1><p class="text-base sm:text-lg text-text leading-relaxed">${escapeHtml(leadText)}</p></section></div></main></div></div>`;
    };

    const buildRouteHtml = (r) => {
      const canonicalUrl = `${SITE_ORIGIN}${r.path}`;
      const ogImageUrl = `${SITE_ORIGIN}/api/og?${r.ogQuery}`;
      let html = baseHtml;

      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(r.title)}</title>`);
      html = html.replace(
        /<meta name="description" content="[^"]*" \/>/,
        `<meta name="description" content="${escapeHtml(r.description)}" />`
      );
      html = html.replace(
        /<meta property="og:type" content="[^"]*" \/>/,
        `<meta property="og:type" content="${escapeHtml(r.ogType || 'website')}" />`
      );
      html = html.replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${escapeHtml(r.title)}" />`
      );
      html = html.replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${escapeHtml(r.description)}" />`
      );
      html = html.replace(
        /<meta property="og:url" content="[^"]*" \/>/,
        `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
      );
      html = html.replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`
      );
      html = html.replace(
        /<meta name="twitter:title" content="[^"]*" \/>/,
        `<meta name="twitter:title" content="${escapeHtml(r.title)}" />`
      );
      html = html.replace(
        /<meta name="twitter:description" content="[^"]*" \/>/,
        `<meta name="twitter:description" content="${escapeHtml(r.description)}" />`
      );
      html = html.replace(
        /<meta name="twitter:image" content="[^"]*" \/>/,
        `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`
      );
      html = html.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
      );
      html = html.replace(
        /<link rel="alternate" hreflang="de" href="[^"]*" \/>/,
        `<link rel="alternate" hreflang="de" href="${escapeHtml(canonicalUrl)}" />`
      );
      html = html.replace(
        /<link rel="alternate" hreflang="en" href="[^"]*" \/>/,
        `<link rel="alternate" hreflang="en" href="${escapeHtml(canonicalUrl)}" />`
      );
      html = html.replace(
        /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
        `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalUrl)}" />`
      );

      if (r.jsonLd) {
        html = html.replace(
          /<script id="jy-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/,
          `<script id="jy-jsonld" type="application/ld+json">${JSON.stringify(r.jsonLd)}</script>`
        );
      } else {
        html = html.replace(/<script id="jy-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/, '');
      }

      html = html.replace('<div id="root"></div>', buildStaticRootShell(r));

      return html;
    };

    for (const r of routes) {
      if (r.path === '/') {
        fs.writeFileSync(distIndex, buildRouteHtml(r), 'utf8');
        continue;
      }
      const targetDir = path.join(DIST, r.path.replace(/^\//, ''));
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), buildRouteHtml(r), 'utf8');
    }

    // Generate dist/404.html for real HTTP 404 responses on Vercel
    const notFoundHtml = buildRouteHtml({
      path: '/404',
      title: 'Seite nicht gefunden — Junior Youth Hub',
      description: 'Die gewünschte Ressource oder Seite existiert nicht oder wurde verschoben.',
      ogType: 'website',
      ogQuery: 'type=section&title=404+Seite+nicht+gefunden',
    });
    fs.writeFileSync(path.join(DIST, '404.html'), notFoundHtml, 'utf8');
    console.log(`✅ Pre-rendered ${routes.length} static route HTML files + dist/404.html.`);
  }
}

run().catch((err) => {
  console.error('Error in prerender-meta:', err);
  process.exit(1);
});
