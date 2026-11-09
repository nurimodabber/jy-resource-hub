import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Users, Clock } from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { getBookById } from '../utils/bookProgress';
import { activityTone } from '../data/activityTones';
import { IconTile } from './ui/IconTile';

interface ServiceArtsCardProps {
  activity: ActivityItem;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ServiceArtsCard: React.FC<ServiceArtsCardProps> = ({
  activity,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const isDe = language === 'de';
  const isService = activity.kind === 'dienst';

  const description = isService
    ? (activity.guidedBy ? activity.guidedBy[language] : activity.objective[language])
    : activity.description[language];

  // Associated book & lesson if present
  const bookMeta = activity.relatedBook ? getBookById(activity.relatedBook) : null;
  const bookTitle = bookMeta
    ? bookMeta.title[language]
    : activity.kind === 'kunst' && activity.book
    ? activity.book[language]
    : null;
  const lessonNumber = activity.lesson;

  // Duration text
  const durationText = activity.durationMin && activity.durationMax
    ? `${activity.durationMin}–${activity.durationMax} ${isDe ? 'Min' : 'min'}`
    : activity.duration
    ? activity.duration[language]
    : undefined;

  const { tone, icon: toneIcon } = activityTone(activity);
  const targetUrl = isService ? `/service/${activity.id}` : `/arts/${activity.id}`;

  return (
    <div
      className="group relative overflow-hidden flex flex-col justify-between rounded-card bg-surface border border-border/80 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200 ease-out shadow-2xs h-full px-3.5 pb-3.5 pt-3.5 sm:px-5 sm:pb-4 sm:pt-4"
    >
      {/* Subtle Top-Right Ambient Glow in Blue / Accent */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl opacity-10 dark:opacity-20 transition-opacity"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-rgb)) 0%, transparent 70%)' }}
      />

      {/* Top-Right Bookmark Button */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(activity.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${isDe ? 'Merken' : 'Save'}: ${activity.title[language]}`}
        // after: vergrößert nur die Tippfläche am Handy von 40 auf 44 px, sichtbar bleibt der Knopf gleich (Karte ist gesperrt).
        className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] after:absolute after:-inset-0.5 after:rounded-full after:content-[''] sm:after:hidden inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite
            ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
            : 'text-text-tertiary hover:text-text hover:bg-surface-2'
        }`}
      >
        <Bookmark className={`w-4 h-4 transition-transform duration-150 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
      </button>

      {/* Clickable title & description via stretched Link */}
      <Link
        to={targetUrl}
        className="block group/link flex-1 min-w-0 pr-10 sm:pr-12 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0 mb-4"
      >
        {/* KONZEPT: dieselbe Ton-Kachel wie auf der Detailseite, damit Bereich/Kunstform sofort sichtbar ist */}
        <div className={`flex items-center gap-3 mb-2.5 tone-${tone}`}>
          <IconTile icon={toneIcon} size="xl" toneClass="tone-tile" />
          <h3 className="font-serif text-lg sm:text-xl font-medium text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors tracking-tight min-w-0">
            {activity.title[language]}
          </h3>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed relative z-[1] max-w-[60ch]">
            {description}
          </p>
        )}
      </Link>

      {/* Full-bleed Footer: Dienst = group size & duration; Kunst = Buch unten links (ohne Icon), Dauer rechts */}
      <div className="relative z-[1] pointer-events-none -mx-3.5 -mb-3.5 px-3.5 py-3 sm:-mx-5 sm:-mb-4 sm:px-5 sm:py-3.5 border-t border-border/60 bg-surface-2/40 mt-auto flex items-center justify-between text-xs text-text-tertiary">
        {isService ? (
          <div className="flex items-center gap-2 truncate">
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{activity.groupSize.min}–{activity.groupSize.max} {isDe ? 'Personen' : 'people'}</span>
            </div>
            {durationText && (
              <>
                <span className="text-border" aria-hidden="true">·</span>
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>{durationText}</span>
                </div>
              </>
            )}
            {bookTitle && (
              <>
                <span className="text-border" aria-hidden="true">·</span>
                <span className="truncate text-2xs text-text-secondary">
                  {bookTitle}{lessonNumber ? ` · L. ${lessonNumber}` : ''}
                </span>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 truncate text-text-secondary text-2xs sm:text-xs min-w-0 font-medium">
              {bookTitle && (
                <span className="truncate">{bookTitle}{lessonNumber ? ` · L. ${lessonNumber}` : ''}</span>
              )}
            </div>
            {durationText && (
              <div className="inline-flex items-center gap-1.5 shrink-0 text-text-tertiary text-2xs sm:text-xs ml-auto">
                <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                <span>{durationText}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
