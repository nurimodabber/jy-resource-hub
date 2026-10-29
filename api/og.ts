import type { IncomingMessage, ServerResponse } from 'http';

const escapeXml = (str: string = ''): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrapText = (text: string, maxCharsPerLine: number, maxLines: number): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  const consumedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (consumedWords < words.length && lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[.,;:!?]*$/, '') + '…';
  }
  return lines;
};

export function renderOgSvg(params: URLSearchParams): string {
  const type = params.get('type') || 'home';
  const rawTitle = params.get('title') || 'Junior Youth Hub';
  const rawSubtitle =
    params.get('subtitle') ||
    'Spiele, heilige Zitate, Dienst & Kunst, Treffen und Werkzeuge für Animatoren';

  const isQuote = type === 'quote';
  const badgeLabel =
    type === 'quote'
      ? 'HEILIGES ZITAT'
      : type === 'game'
      ? 'GRUPPENSPIEL'
      : type === 'activity'
      ? 'DIENST & KUNST'
      : type === 'tool'
      ? 'LIVE-WERKZEUG'
      : 'JUNIOR YOUTH HUB';

  const lines = isQuote
    ? wrapText(`„${rawTitle.replace(/^[„"“]|[“"”]$/g, '')}“`, 44, 5)
    : wrapText(rawTitle, 32, 3);

  const fontSize = isQuote ? (lines.length > 3 ? 36 : 42) : lines.length > 2 ? 52 : 60;
  const lineHeight = isQuote ? fontSize * 1.45 : fontSize * 1.22;
  const startY = isQuote ? 215 : 245;

  const textElements = lines
    .map(
      (line, idx) =>
        `<text x="96" y="${Math.round(startY + idx * lineHeight)}" fill="#EEF2FA" font-family="${
          isQuote
            ? "'Lora', Georgia, 'Times New Roman', serif"
            : "'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }" font-size="${fontSize}" font-weight="${isQuote ? '500' : '700'}" font-style="${
          isQuote ? 'italic' : 'normal'
        }">${escapeXml(line)}</text>`
    )
    .join('\n    ');

  const subtitleY = Math.min(525, Math.round(startY + lines.length * lineHeight + 28));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0E1626"/>
  <rect x="44" y="44" width="1112" height="542" rx="28" fill="#162036" stroke="#2A3858" stroke-width="2"/>
  
  <!-- Top Badge Pill -->
  <rect x="96" y="96" width="${Math.max(180, badgeLabel.length * 13 + 36)}" height="40" rx="20" fill="#1B2E55"/>
  <text x="116" y="122" fill="#A9C8FF" font-family="'Figtree', -apple-system, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">${escapeXml(badgeLabel)}</text>

  <!-- Main Title or Quote Verse -->
  ${textElements}

  <!-- Subtitle / Attribution -->
  <text x="96" y="${subtitleY}" fill="#BAC6DC" font-family="${
    isQuote ? "'Lora', Georgia, serif" : "'Figtree', -apple-system, sans-serif"
  }" font-size="24" font-weight="500">${escapeXml(
    isQuote ? `— ${rawSubtitle}` : rawSubtitle.slice(0, 85)
  )}</text>

  <!-- Footer Branding -->
  <circle cx="106" cy="542" r="8" fill="#6FA3FF"/>
  <text x="124" y="548" fill="#A3B1CA" font-family="'Figtree', -apple-system, sans-serif" font-size="18" font-weight="600">Junior Youth Hub · juju-hub.vercel.app</text>
</svg>`;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/api/og', 'https://juju-hub.vercel.app');
  const svg = renderOgSvg(url.searchParams);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
  res.end(svg);
}
