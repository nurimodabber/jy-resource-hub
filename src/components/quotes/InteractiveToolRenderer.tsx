import React from 'react';
import { X } from 'lucide-react';
import { QuoteItem, Language, QuoteMethod } from '../../types';
import { QUOTE_METHODS_DATA } from '../../data/quoteMethods';

export type InteractiveTool = 
  | 'chalkboard' 
  | 'firstLetter' 
  | 'cloze' 
  | 'wordPuzzle' 
  | 'imposter' 
  | 'typeRecall' 
  | 'cascade' 
  | 'metronome' 
  | 'codeClicker' 
  | 'speedRun' 
  | 'flashReader';

export const METHOD_TO_TOOL_MAP: Record<string, InteractiveTool> = {
  'die-verschwindende-tafel': 'chalkboard',
  'erstbuchstaben-geruest': 'firstLetter',
  'zitate-lochkarte': 'cloze',
  'zitate-puzzle-im-raum': 'wordPuzzle',
  'fehler-sucher': 'imposter',
  'kollektives-tafel-schreiben': 'typeRecall',
  'zitate-treppe': 'cascade',
  'metronom-steigerung': 'metronome',
  'der-klick-ersatz': 'codeClicker',
  'kreis-sprint': 'speedRun',
  'echokammer': 'flashReader',
};

export const TOOL_TO_METHOD_MAP: Record<InteractiveTool, string> = {
  chalkboard: 'die-verschwindende-tafel',
  firstLetter: 'erstbuchstaben-geruest',
  cloze: 'zitate-lochkarte',
  wordPuzzle: 'zitate-puzzle-im-raum',
  imposter: 'fehler-sucher',
  typeRecall: 'kollektives-tafel-schreiben',
  cascade: 'zitate-treppe',
  metronome: 'metronom-steigerung',
  codeClicker: 'der-klick-ersatz',
  speedRun: 'kreis-sprint',
  flashReader: 'echokammer',
};

export const INTERACTIVE_TOOLS: { id: InteractiveTool; methodId: string }[] = [
  { id: 'chalkboard', methodId: 'die-verschwindende-tafel' },
  { id: 'firstLetter', methodId: 'erstbuchstaben-geruest' },
  { id: 'cloze', methodId: 'zitate-lochkarte' },
  { id: 'wordPuzzle', methodId: 'zitate-puzzle-im-raum' },
  { id: 'imposter', methodId: 'fehler-sucher' },
  { id: 'typeRecall', methodId: 'kollektives-tafel-schreiben' },
  { id: 'cascade', methodId: 'zitate-treppe' },
  { id: 'metronome', methodId: 'metronom-steigerung' },
  { id: 'codeClicker', methodId: 'der-klick-ersatz' },
  { id: 'speedRun', methodId: 'kreis-sprint' },
  { id: 'flashReader', methodId: 'echokammer' },
];

export const getToolMethod = (toolId: InteractiveTool): QuoteMethod | undefined => {
  const methodId = TOOL_TO_METHOD_MAP[toolId];
  return QUOTE_METHODS_DATA.find((m) => m.id === methodId);
};

// 11 Interactive Practice Simulators
const Chalkboard = React.lazy(() => import('./Chalkboard').then((m) => ({ default: m.Chalkboard })));
const FirstLetterBoard = React.lazy(() => import('./FirstLetterBoard').then((m) => ({ default: m.FirstLetterBoard })));
const ClozeTest = React.lazy(() => import('./ClozeTest').then((m) => ({ default: m.ClozeTest })));
const WordPuzzle = React.lazy(() => import('./WordPuzzle').then((m) => ({ default: m.WordPuzzle })));
const ImposterDetector = React.lazy(() => import('./ImposterDetector').then((m) => ({ default: m.ImposterDetector })));
const TypeRecall = React.lazy(() => import('./TypeRecall').then((m) => ({ default: m.TypeRecall })));
const CumulativeCascade = React.lazy(() => import('./CumulativeCascade').then((m) => ({ default: m.CumulativeCascade })));
const MetronomePacer = React.lazy(() => import('./MetronomePacer').then((m) => ({ default: m.MetronomePacer })));
const CodeClicker = React.lazy(() => import('./CodeClicker').then((m) => ({ default: m.CodeClicker })));
const SpeedRunTimer = React.lazy(() => import('./SpeedRunTimer').then((m) => ({ default: m.SpeedRunTimer })));
const FlashReader = React.lazy(() => import('./FlashReader').then((m) => ({ default: m.FlashReader })));

interface InteractiveToolRendererProps {
  tool: InteractiveTool;
  quote: QuoteItem;
  language: Language;
  onClose: () => void;
  onSelectTool?: (tool: InteractiveTool) => void;
  showSwitcher?: boolean;
}

export const InteractiveToolRenderer: React.FC<InteractiveToolRendererProps> = ({
  tool,
  quote,
  language,
  onClose,
  onSelectTool,
  showSwitcher = true,
}) => {
  const isDe = language === 'de';
  const currentMethod = getToolMethod(tool);
  const hasSwitcher = showSwitcher && !!onSelectTool;
  const chipsRef = React.useRef<HTMLDivElement>(null);

  // Keep the selected method visible in the sideways-scrolling row (scrollLeft, not scrollIntoView,
  // which would also move the page while it scrolls to the tool).
  React.useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.offsetLeft;
    const hidden = left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth;
    if (hidden) row.scrollLeft = left - 16;
  }, [tool]);

  // No outer card: each tool already draws its own card, and a frame around it was a card in a card.
  return (
    <section 
      aria-label={currentMethod?.name[language] || (isDe ? 'Interaktive Web-App' : 'Interactive Web-App')}
      className="space-y-3 sm:space-y-4 animate-in fade-in duration-200"
    >
      {/* Tool Header. On phones the method row takes the title's place next to the close button:
          the selected chip already names the method, and the second line cost scrolling. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 border-b border-border pb-2 sm:pb-0 sm:border-b-0">
        <div className={`min-w-0 col-start-1 row-start-1 ${hasSwitcher ? 'hidden sm:block' : ''}`}>
          <h2 className="font-bold text-sm sm:text-base text-text truncate">
            {currentMethod?.name[language] || (isDe ? 'Interaktive Web-App' : 'Interactive Web-App')}
          </h2>
          {currentMethod?.durationMinutes && (
            <p className="text-2xs text-text-tertiary mt-0.5">
              {currentMethod.durationMinutes}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="col-start-2 row-start-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] justify-center shrink-0"
          aria-label={isDe ? 'Web-App schließen' : 'Close Web-App'}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">{isDe ? 'Web-App schließen' : 'Close Web-App'}</span>
        </button>

        {/* Quick switcher to other web-apps */}
        {hasSwitcher && (
        <div className="col-start-1 row-start-1 sm:col-span-2 sm:row-start-2 min-w-0 space-y-1.5 sm:border-t sm:border-border sm:pt-4">
          {/* Hidden on phones: the row of method names speaks for itself and the line cost scrolling. */}
          <div className="hidden sm:block text-2xs text-text-tertiary font-medium">
            {isDe ? 'Andere Web-App wählen:' : 'Switch to another Web-App:'}
          </div>
          <div ref={chipsRef} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:py-1">
            {INTERACTIVE_TOOLS.map(({ id: tId, methodId }) => {
              const m = QUOTE_METHODS_DATA.find((method) => method.id === methodId);
              if (!m) return null;
              const isActive = tId === tool;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => onSelectTool?.(tId)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all min-h-[44px] cursor-pointer flex items-center gap-1.5 shrink-0 select-none outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-accent text-accent-contrast font-semibold shadow-xs border border-accent'
                      : 'bg-surface-2/80 text-text-secondary hover:text-text hover:bg-surface-2 font-medium border border-line/60'
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{m.name[language]}</span>
                </button>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Simulator Component. Keyed by quote and language: tools keep word indices in state, and
          switching the quote while a tool is open rendered stale indices (crash in ClozeTest). */}
      <React.Suspense key={`${quote.id}-${language}`} fallback={<div className="h-48 animate-pulse bg-surface-2 rounded-2xl" />}>
        {tool === 'chalkboard' && <Chalkboard quote={quote} language={language} />}
        {tool === 'firstLetter' && <FirstLetterBoard quote={quote} language={language} />}
        {tool === 'cloze' && <ClozeTest quote={quote} language={language} />}
        {tool === 'wordPuzzle' && <WordPuzzle quote={quote} language={language} />}
        {tool === 'imposter' && <ImposterDetector quote={quote} language={language} />}
        {tool === 'typeRecall' && <TypeRecall quote={quote} language={language} />}
        {tool === 'cascade' && <CumulativeCascade quote={quote} language={language} />}
        {tool === 'metronome' && <MetronomePacer quote={quote} language={language} />}
        {tool === 'codeClicker' && <CodeClicker quote={quote} language={language} />}
        {tool === 'speedRun' && <SpeedRunTimer quote={quote} language={language} />}
        {tool === 'flashReader' && <FlashReader quote={quote} language={language} />}
      </React.Suspense>
    </section>
  );
};
