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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-5xl h-[88vh] rounded-3xl shadow-apple-modal flex flex-col overflow-hidden border border-black/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.05] bg-[#fafafc] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] text-white flex items-center justify-center shadow-apple-pill">
              <Music className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1f]">Bahá'í Songs</h3>
                <span className="text-[11px] font-medium text-[#86868b] hidden sm:inline">bahaisongs.com</span>
              </div>
              <p className="text-[11px] text-[#86868b]">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] text-xs font-medium rounded-full transition-colors"
            >
              <span>{language === 'de' ? 'In neuem Tab öffnen' : 'Open in new tab'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.05] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content iframe */}
        <div className="relative flex-1 bg-[#f5f5f7] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-10">
              <div className="flex flex-col items-center gap-2 text-[#86868b] text-xs font-medium">
                <RefreshCw className="w-5 h-5 animate-spin text-[#1d1d1f]" />
                <span>{language === 'de' ? 'Lade bahaisongs.com...' : 'Loading bahaisongs.com...'}</span>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-[#86868b] space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <p className="text-sm font-semibold text-[#1d1d1f]">
                {language === 'de' 
                  ? 'Die Seite konnte nicht eingebettet werden.' 
                  : 'Unable to embed website in this browser view.'}
              </p>
              <a
                href="https://www.bahaisongs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-[#1d1d1f] text-white text-xs font-semibold rounded-full hover:bg-black transition-all shadow-apple-pill inline-flex items-center gap-1.5"
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
