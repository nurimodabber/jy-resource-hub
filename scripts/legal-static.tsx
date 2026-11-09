/**
 * Build-time only (scripts/prerender-meta.mjs): renders the real privacy and imprint pages to HTML,
 * so they are readable without JavaScript (crawlers, scanners, blocked scripts). Uses the same
 * components as the app, so the legal text exists in one place only.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { DatenschutzView } from '../src/components/DatenschutzView';
import { ImpressumView } from '../src/components/ImpressumView';

const noop = () => {};

export const renderLegalPages = (): Record<string, string> => ({
  '/datenschutz': renderToStaticMarkup(<DatenschutzView language="de" onBack={noop} onOpenContact={noop} />),
  '/impressum': renderToStaticMarkup(<ImpressumView language="de" onBack={noop} onOpenContact={noop} />),
});
