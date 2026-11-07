import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { tr, primaryBtn } from './tools/common';

interface NotFoundViewProps {
  language: Language;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ language }) => {
  const L = tr(language);
  const isDe = language === 'de';

  // Plain list, no box: the page has one main action and the links are secondary.
  const destinations = [
    { to: '/games', label: L('Spiele', 'Games') },
    { to: '/quotes', label: L('Zitate', 'Quotes') },
    { to: '/service', label: L('Projekte', 'Projects') },
    { to: '/tools', label: L('Werkzeuge', 'Tools') },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
        <HelpCircle className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold text-accent-text">{L('Fehler 404', 'Error 404')}</span>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text mt-2 mb-3">
        {isDe ? 'Seite nicht gefunden' : 'Page Not Found'}
      </h1>
      <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto mb-8">
        {L('Diese Seite gibt es nicht oder sie wurde verschoben.', "This page doesn't exist or has moved.")}
      </p>

      <div className="flex justify-center mb-10">
        <Link to="/" className={`${primaryBtn} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg`}>
          <Home className="w-4 h-4" />
          <span>{isDe ? 'Zur Startseite' : 'Back to Home'}</span>
        </Link>
      </div>

      <nav aria-labelledby="not-found-popular" className="max-w-md mx-auto text-left">
        <h2 id="not-found-popular" className="text-xs font-semibold text-text-tertiary mb-2 px-1">
          {isDe ? 'Beliebte Bereiche' : 'Popular Destinations'}
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {destinations.map((d) => (
            <li key={d.to}>
              <Link
                to={d.to}
                className="flex items-center justify-between min-h-[48px] px-1 text-sm font-medium text-text hover:text-accent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-nested"
              >
                <span>{d.label}</span>
                <ChevronRight className="w-4 h-4 text-text-tertiary" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
