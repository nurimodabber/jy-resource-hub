import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookOpen } from 'lucide-react';
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

  // Metadata parts: duration, group size, setting
  const metaParts: string[] = [];
  if (activity.duration) {
    metaParts.push(activity.duration[language]);
  }
  if (activity.groupSize) {
    metaParts.push(
      language === 'de'
        ? `${activity.groupSize.min}–${activity.groupSize.max} Pers.`
        : `${activity.groupSize.min}–${activity.groupSize.max} youth`
    );
  }
  if (activity.setting && activity.setting !== 'beides') {
    metaParts.push(
      activity.setting === 'draussen'
        ? language === 'de'
          ? 'Draußen'
          : 'Outdoors'
        : language === 'de'
        ? 'Drinnen'
        : 'Indoors'
    );
  }

  return (
    <div className="group relative h-full flex flex-col justify-between bg-surface border border-border/80 rounded-card hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200 ease-out p-5 sm:p-6 shadow-2xs">
      {/* Optional image preview if imageUrl is present */}
      {activity.imageUrl && (
        <div className="mb-4 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 overflow-hidden rounded-t-card border-b border-border aspect-16/9 bg-surface-2 relative z-[1] pointer-events-none">
          <img
            src={activity.imageUrl}
            alt={activity.title[language]}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          />
        </div>
      )}

      {/* Top area: noble, quiet tag chip + typographic metadata */}
      <div className="flex-1 min-w-0 pr-10">
        <div className="flex items-center gap-2 text-xs text-text-tertiary mb-3 relative z-[1] pointer-events-none flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-chip text-2xs font-semibold bg-accent/8 text-accent border border-accent/20">
            {categoryLabel}
          </span>
          {metaParts.length > 0 && (
            <span className="text-2xs text-text-secondary truncate">
              {metaParts.join(' · ')}
            </span>
          )}
        </div>

        <Link
          to={isService ? `/service/${activity.id}` : `/arts/${activity.id}`}
          className="block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0"
        >
          <h3 className="font-serif text-lg font-medium text-text leading-snug line-clamp-1 group-hover:text-accent transition-colors relative z-[1] tracking-tight">
            {activity.title[language]}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mt-2 leading-relaxed relative z-[1]">
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
        className={`absolute top-2.5 right-2.5 z-10 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite
            ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
            : 'text-text-tertiary hover:text-text hover:bg-surface-2'
        }`}
      >
        <Bookmark className={`w-4 h-4 transition-transform duration-150 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
      </button>

      {/* Bottom meta row: clean editorial footer (only when book or theme present) */}
      {(bookTitle || (themeLabel && themeLabel !== categoryLabel)) && (
        <div className="relative z-[1] pointer-events-none flex items-center justify-between gap-2 pt-3 mt-4 border-t border-border/40 text-xs text-text-tertiary">
          {bookTitle ? (
            <span className="inline-flex items-center gap-1.5 font-medium truncate max-w-[240px] text-text-secondary">
              <BookOpen className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
              <span className="truncate">{bookTitle}{lessonNumber ? ` · L. ${lessonNumber}` : ''}</span>
            </span>
          ) : (
            <span />
          )}

          {themeLabel && themeLabel !== categoryLabel && (
            <span className="truncate text-text-tertiary max-w-[160px] text-right font-medium text-2xs uppercase tracking-wider">
              {themeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
