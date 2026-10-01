import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, Compass, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { Button } from './ui/Button';

interface NotFoundViewProps {
  language: Language;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ language }) => {
  const isDe = language === 'de';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
        <HelpCircle className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-accent">404 Error</span>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text mt-2 mb-3">
        {isDe ? 'Seite nicht gefunden' : 'Page Not Found'}
      </h1>
      <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto mb-8">
        {isDe
          ? 'Die gewünschte Ressource oder Seite existiert nicht oder wurde verschoben.'
          : 'The requested resource or page does not exist or has been moved.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <Link to="/">
          <Button
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4" />}
            iconPosition="left"
          >
            {isDe ? 'Zur Startseite' : 'Back to Home'}
          </Button>
        </Link>
        <Link to="/games">
          <Button
            variant="secondary"
            size="md"
            icon={<Compass className="w-4 h-4" />}
            iconPosition="left"
          >
            {isDe ? 'Alle Spiele durchstöbern' : 'Browse All Games'}
          </Button>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border-subtle text-left">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>{isDe ? 'Beliebte Bereiche' : 'Popular Destinations'}</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Link
            to="/games"
            className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border-subtle transition-colors text-text font-medium"
          >
            {isDe ? 'Spiele' : 'Games'}
          </Link>
          <Link
            to="/quotes"
            className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border-subtle transition-colors text-text font-medium"
          >
            {isDe ? 'Zitate' : 'Quotes'}
          </Link>
          <Link
            to="/planner"
            className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border-subtle transition-colors text-text font-medium"
          >
            {isDe ? 'Planer' : 'Planner'}
          </Link>
          <Link
            to="/tools"
            className="p-3 rounded-xl bg-surface-2 hover:bg-surface-raised border border-border-subtle transition-colors text-text font-medium"
          >
            {isDe ? 'Werkzeuge' : 'Tools'}
          </Link>
        </div>
      </div>
    </div>
  );
};
