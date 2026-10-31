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
  const isDe = language === 'de';
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

  // Category or general theme with uppercase first letter
  const rawCategoryOrTheme = activity.theme ? activity.theme[language] : categoryLabel;
  const categoryOrTheme = rawCategoryOrTheme.charAt(0).toUpperCase() + rawCategoryOrTheme.slice(1);

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

  // Setting text (indoor / outdoor info)
  const settingText =
    activity.setting === 'draussen'
      ? isDe ? 'Draußen' : 'Outdoors'
      : activity.setting === 'drinnen'
      ? isDe ? 'Drinnen' : 'Indoors'
      : isDe ? 'Drinnen & draußen' : 'Indoors & outdoors';

  const targetUrl = isService ? `/service/${activity.id}` : `/arts/${activity.id}`;

  return (
    <div className="group relative flex flex-col justify-between px-4 pb-4 pt-2.5 sm:px-5 sm:pb-5 sm:pt-3 rounded-card bg-surface border border-border/80 hover:bg-surface-2/40 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-2 transition-all duration-200 ease-out shadow-2xs h-full">
      {/* Optional image preview if imageUrl is present */}
      {activity.imageUrl && (
        <div className="mb-3 -mx-4 -mt-2.5 sm:-mx-5 sm:-mt-3 overflow-hidden rounded-t-card border-b border-border aspect-16/9 bg-surface-2 relative pointer-events-none">
          <img
            src={activity.imageUrl}
            alt={activity.title[language]}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          />
        </div>
      )}

      {/* Main content body matching Home page layout */}
      <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
        {/* Top row: category or general theme on left, duration + bookmark on right */}
        <div className="flex items-center justify-between gap-2 text-2xs text-text-tertiary">
          <span className="font-semibold tracking-normal text-text-secondary truncate">
            {categoryOrTheme}
          </span>

          <div className="flex items-center gap-1.5 -mr-1.5 -my-2 sm:-my-2.5 shrink-0 relative z-10" onClick={(e) => e.stopPropagation()}>
            {durationText && (
              <span className="font-medium tabular-nums text-text-tertiary text-2xs mr-0.5">
                {durationText}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => onToggleFavorite(activity.id, e)}
              aria-pressed={isFavorite}
              aria-label={`${t.savedItems}: ${activity.title[language]}`}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] inline-flex items-center justify-center rounded-control transition-all duration-150 active:scale-90 motion-reduce:transform-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                isFavorite
                  ? 'text-accent bg-accent-subtle/80 hover:bg-accent-subtle shadow-2xs'
                  : 'text-text-tertiary hover:text-text hover:bg-surface-2'
              }`}
            >
              <Bookmark className={`w-4 h-4 transition-transform duration-150 ${isFavorite ? 'fill-accent text-accent' : ''}`} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Clickable title & description */}
        <Link
          to={targetUrl}
          className="block group/link focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control after:absolute after:inset-0 after:rounded-card after:z-0"
        >
          <h3 className="font-bold text-text text-base leading-snug line-clamp-1 group-hover:text-accent transition-colors relative z-[1] tracking-tight">
            {activity.title[language]}
          </h3>
          {description && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1 sm:mt-1.5 leading-relaxed relative z-[1]">
              {description}
            </p>
          )}
        </Link>
      </div>

      {/* Bottom row: group size on left, indoor / outdoor info on bottom right */}
      <div className="pt-3 mt-3 border-t border-line flex items-center justify-between text-xs text-text-tertiary relative z-[1] pointer-events-none">
        <div className="flex items-center gap-1.5 truncate">
          <span>{activity.groupSize.min}–{activity.groupSize.max} {isDe ? 'Personen' : 'people'}</span>
          {bookTitle && (
            <>
              <span className="text-border" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 truncate text-2xs text-text-secondary">
                <BookOpen className="w-3 h-3 text-text-tertiary shrink-0" />
                <span className="truncate">{bookTitle}{lessonNumber ? ` · L. ${lessonNumber}` : ''}</span>
              </span>
            </>
          )}
        </div>
        <span className="font-semibold text-text-secondary shrink-0 ml-2">
          {settingText}
        </span>
      </div>
    </div>
  );
};
