import React, { useState } from 'react';
import { X, ExternalLink, Music, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface BahaiSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const BahaiSongsModal: React.FC<BahaiSongsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Music className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-stone-900">Bahá'í Songs</h3>
                <span className="text-[11px] font-medium text-stone-500 hidden sm:inline">bahaisongs.com</span>
              </div>
              <p className="text-[11px] text-stone-500">
                {language === 'de' 
                  ? 'Finde Akkorde, Texte und Aufnahmen für Andachten' 
                  : 'Find chords, lyrics, and recordings for devotionals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.bahaisongs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors border border-stone-200/80"
            >
              <span>{language === 'de' ? 'In neuem Tab öffnen' : 'Open in new tab'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content iframe */}
        <div className="relative flex-1 bg-stone-100 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-50/80 z-10">
              <div className="flex flex-col items-center gap-2 text-stone-500 text-xs font-medium">
                <RefreshCw className="w-5 h-5 animate-spin text-stone-700" />
                <span>{language === 'de' ? 'Lade bahaisongs.com...' : 'Loading bahaisongs.com...'}</span>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-stone-600 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <p className="text-sm font-semibold text-stone-800">
                {language === 'de' 
                  ? 'Die Seite konnte nicht eingebettet werden.' 
                  : 'Unable to embed website in this browser view.'}
              </p>
              <a
                href="https://www.bahaisongs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{language === 'de' ? 'Direkt auf bahaisongs.com öffnen' : 'Open directly on bahaisongs.com'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <iframe
              src="https://www.bahaisongs.com/"
              title="Bahá'í Songs"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </div>
      </div>
    </div>
  );
};
