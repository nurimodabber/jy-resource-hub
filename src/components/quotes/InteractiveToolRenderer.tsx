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

  return (
    <section 
      aria-label={currentMethod?.name[language] || (isDe ? 'Interaktive Web-App' : 'Interactive Web-App')}
      className="bg-surface rounded-3xl border border-accent/40 p-4 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200"
    >
      {/* Tool Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block animate-pulse shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent-text border border-accent/20 inline-flex items-center">
                Web-App
              </span>
              {currentMethod?.durationMinutes && (
                <span className="text-2xs text-text-tertiary">
                  {currentMethod.durationMinutes}
                </span>
              )}
            </div>
            <h2 className="font-bold text-sm sm:text-base text-text truncate mt-0.5">
              {currentMethod?.name[language] || (isDe ? 'Interaktive Web-App' : 'Interactive Web-App')}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer min-h-[44px] shrink-0"
          aria-label={isDe ? 'Web-App schließen' : 'Close Web-App'}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">{isDe ? 'Web-App schließen' : 'Close Web-App'}</span>
        </button>
      </div>

      {/* Quick switcher to other web-apps */}
      {showSwitcher && onSelectTool && (
        <div className="space-y-1.5 pt-1">
          <div className="text-2xs text-text-tertiary font-medium">
            {isDe ? 'Andere Web-App wählen:' : 'Switch to another Web-App:'}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {INTERACTIVE_TOOLS.map(({ id: tId, methodId }) => {
              const m = QUOTE_METHODS_DATA.find((method) => method.id === methodId);
              if (!m) return null;
              const isActive = tId === tool;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => onSelectTool(tId)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors min-h-[44px] cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-accent text-white font-semibold shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-2/80 font-medium'
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

      {/* Simulator Component */}
      <React.Suspense fallback={<div className="h-48 animate-pulse bg-surface-2 rounded-2xl" />}>
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
