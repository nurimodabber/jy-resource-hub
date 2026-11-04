import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { UI_TRANSLATIONS } from '../../data/translations';

/** Leiser Hinweis am Listenende. „Beitragen“ hat keinen eigenen Tab mehr, hier und im Menü oben ist es erreichbar. */
export const ContributeLink: React.FC<{ language: Language; className?: string }> = ({ language, className = '' }) => {
  const t = UI_TRANSLATIONS[language];
  return (
    <div className={`mt-10 pt-6 border-t border-line text-center print:hidden ${className}`}>
      <p className="text-sm text-text-secondary">{t.contributeLinkTitle}</p>
      <Link
        to="/vorschlagen"
        className="mt-1 inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-control text-sm font-semibold text-accent-text hover:underline focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t.contributeLinkDesc}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
};
