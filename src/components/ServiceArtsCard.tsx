import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookOpen, Clock, Heart, Palette } from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { getBookById } from '../utils/bookProgress';

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
  const t = UI_TRANSLATIONS[language];
  const isService = activity.kind === 'dienst';

  // Subtitle / category
  const categoryLabel = isService
    ? activity.category === 'environmental'
      ? t.catEnvironmental
      : activity.category === 'neighborhood'
      ? t.catNeighborhood
      : activity.category === 'intergenerational'
      ? t.catIntergenerational
      : activity.category === 'children'
      ? t.catChildren
      : activity.category === 'institutional'
      ? t.catInstitutional
      : t.catCreative
    : activity.artForm === 'drama'
    ? t.artFormDrama
    : activity.artForm === 'music_poetry'
    ? t.artFormMusicPoetry
    : activity.artForm === 'visual_arts'
    ? t.artFormVisual
    : t.artFormMural;

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

  const themeLabel = activity.theme ? activity.theme[language] : undefined;

  return (
    <div className="group relative h-full flex flex-col justify-between bg-surface border border-border rounded-card hover:bg-surface-2/40 hover:shadow-2 transition-all duration-150 ease-out p-4 sm:p-5">
      {/* Optional image preview if imageUrl is present */}
      {activity.imageUrl && (
        <div className="mb-3.5 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 overflow-hidden rounded-t-card border-b border-border aspect-16/9 bg-surface-2 relative z-[1] pointer-events-none">
          <img
            src={activity.imageUrl}
            alt={activity.title[language]}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          />
        </div>
      )}

      {/* Top area with primary category badge, title, description */}
      <div className="flex-1 min-w-0 pr-10">
        <div className="flex items-center gap-1.5 mb-2 relative z-[1] pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent-subtle text-accent-text">
            {isService ? <Heart className="w-3 h-3" /> : <Palette className="w-3 h-3" />}
            <span>{categoryLabel}</span>
          </span>
        </div>

        <Link
          to={isService ? `/service/${activity.id}` : `/arts/${activity.id}`}
          className="block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0"
        >
          <h3 className="text-base font-semibold text-text leading-snug line-clamp-1 group-hover:text-accent transition-colors relative z-[1]">
            {activity.title[language]}
          </h3>
          {description && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed relative z-[1]">
              {description}
            </p>
          )}
        </Link>
      </div>

      {/* Top right bookmark button: touch target min 44x44px, stays above stretched link */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(activity.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${activity.title[language]}`}
        className={`absolute top-2.5 right-2.5 z-10 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-2 transition-all duration-100 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Bottom meta row: calm contextual info (no "Inspiration lesen" button) */}
      <div className="relative z-[1] pointer-events-none flex items-center justify-between gap-2 pt-2.5 mt-3 border-t border-border/50 text-2xs text-text-tertiary">
        {bookTitle ? (
          <span className="inline-flex items-center gap-1 font-medium truncate max-w-[200px]">
            <BookOpen className="w-3 h-3 text-text-tertiary shrink-0" />
            <span className="truncate">{bookTitle}{lessonNumber ? ` · L. ${lessonNumber}` : ''}</span>
          </span>
        ) : activity.duration ? (
          <span className="inline-flex items-center gap-1 font-medium truncate max-w-[200px]">
            <Clock className="w-3 h-3 text-text-tertiary shrink-0" />
            <span className="truncate">{activity.duration[language]}</span>
          </span>
        ) : (
          <span />
        )}

        {themeLabel && themeLabel !== categoryLabel && (
          <span className="truncate text-text-secondary max-w-[150px] text-right font-medium">
            {themeLabel}
          </span>
        )}
      </div>
    </div>
  );
};
