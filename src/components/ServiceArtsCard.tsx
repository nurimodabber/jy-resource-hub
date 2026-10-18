import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, MapPin, Bookmark, BookOpen } from 'lucide-react';
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

  const settingLabel =
    activity.setting === 'drinnen'
      ? t.settingDrinnen
      : activity.setting === 'draussen'
      ? t.settingDraussen
      : t.settingBeides;

  const shortDurationStr =
    activity.durationMin === activity.durationMax
      ? `${activity.durationMin} ${language === 'de' ? 'Min.' : 'min.'}`
      : `${activity.durationMin}–${activity.durationMax} ${language === 'de' ? 'Min.' : 'min.'}`;

  const isCamp = activity.occasion === 'camp' || activity.occasion === 'beides';
  const description = isService
    ? activity.objective[language]
    : activity.description[language];

  // Associated book & lesson if present
  const bookMeta = activity.relatedBook ? getBookById(activity.relatedBook) : null;
  const bookTitle = bookMeta ? bookMeta.title[language] : (activity.kind === 'kunst' && activity.book ? activity.book[language] : null);
  const lessonNumber = activity.lesson;

  return (
    <div className="group relative h-full flex flex-col justify-between bg-surface border border-border rounded-card hover:border-accent hover:shadow-2 transition-all duration-150 ease-out p-4 sm:p-5">
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

      {/* Top area with badges, title, description */}
      <div className="flex-1 min-w-0 pr-10">
        <div className="flex flex-wrap items-center gap-1.5 mb-2 relative z-[1] pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-accent/15 text-accent">
            {categoryLabel}
          </span>
          {isCamp && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface-2 text-text-secondary">
              Camp
            </span>
          )}
          {bookTitle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium bg-surface-2 text-text-tertiary">
              <BookOpen className="w-3 h-3 text-text-tertiary" />
              <span className="truncate max-w-[160px]">{bookTitle}{lessonNumber ? ` · ${language === 'de' ? 'Lektion' : 'Lesson'} ${lessonNumber}` : ''}</span>
            </span>
          )}
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

      {/* Bottom meta row: Dauer · Personen links, Ort (Drinnen/Draußen) rechts */}
      <div className="relative z-[1] pointer-events-none flex items-center gap-3 pt-3 mt-3 border-t border-border/50 text-xs text-text-secondary">
        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterDuration}: ${shortDurationStr}`}
        >
          <Clock className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span>{shortDurationStr}</span>
        </div>

        <span className="text-border" aria-hidden="true">·</span>

        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterGroupSize}: ${activity.groupSize.min}–${activity.groupSize.max} ${t.peopleSuffix}`}
        >
          <Users className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span>{activity.groupSize.min}–{activity.groupSize.max}</span>
        </div>

        <span className="text-border" aria-hidden="true">·</span>

        <div
          className="inline-flex items-center gap-1.5 ml-auto shrink-0"
          title={`${t.settingLabel}: ${settingLabel}`}
        >
          <MapPin className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span className="text-xs text-text-secondary">{settingLabel}</span>
        </div>
      </div>
    </div>
  );
};
