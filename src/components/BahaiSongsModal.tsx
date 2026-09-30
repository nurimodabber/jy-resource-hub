import React, { useState } from 'react';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';

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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="full"
      showCloseButton={true}
      title="Bahá'í Songs"
      description={
        language === 'de' 
          ? 'Akkorde, Texte und Aufnahmen für Andachten & Freizeiten (bahaisongs.com)' 
          : 'Chords, lyrics, and recordings for devotionals & camps (bahaisongs.com)'
      }
    >
      <div className="space-y-4">
        {/* External Link Action Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <span className="text-xs text-text-secondary">
            {language === 'de' ? 'Kuratierte Noten & Liedtexte' : 'Curated sheet music & lyrics'}
          </span>
          <a
            href="https://www.bahaisongs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] bg-surface-2 hover:bg-black/10 dark:hover:bg-white/10 text-text text-xs font-semibold rounded-full border border-border-subtle transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>{language === 'de' ? 'In neuem Tab öffnen' : 'Open in new tab'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Content iframe */}
        <div className="relative w-full h-[65vh] rounded-2xl bg-surface-2 border border-border-subtle overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-xs z-10">
              <div className="flex flex-col items-center gap-2.5 text-text-secondary text-xs font-medium">
                <RefreshCw className="w-5 h-5 animate-spin text-text" />
                <span>{language === 'de' ? 'Lade bahaisongs.com...' : 'Loading bahaisongs.com...'}</span>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-text-secondary space-y-3">
              <AlertCircle className="w-8 h-8 text-accent" />
              <p className="text-sm font-semibold text-text">
                {language === 'de' 
                  ? 'Die Seite kann in diesem Browserfenster nicht direkt eingebettet werden.' 
                  : 'Unable to embed website in this browser view.'}
              </p>
              <Button
                onClick={() => window.open('https://www.bahaisongs.com/', '_blank')}
                variant="primary"
                size="md"
                icon={<ExternalLink className="w-4 h-4" />}
                iconPosition="right"
              >
                {language === 'de' ? 'Direkt auf bahaisongs.com öffnen' : 'Open directly on bahaisongs.com'}
              </Button>
            </div>
          ) : (
            <iframe
              src="https://www.bahaisongs.com/"
              title="Bahai Songs Embed"
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};
