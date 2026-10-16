import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, MapPin, Heart, Palette, Bookmark } from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

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

  return (
    <div className="group relative h-full flex flex-col justify-between bg-surface border border-border rounded-card hover:border-accent hover:shadow-xs transition-all p-4 sm:p-5">
      {/* Top area with round icon, title, category, description */}
      <div className="flex items-start gap-3 flex-1 min-w-0 pr-10">
        {/* Round Icon in Circle */}
        <div
          className="w-10 h-10 rounded-full bg-accent/15 text-accent shrink-0 flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >
          {isService ? (
            <Heart className="w-5 h-5 text-accent fill-accent/20" />
          ) : (
            <Palette className="w-5 h-5 text-accent" />
          )}
        </div>

        <Link
          to={`/service-arts/${activity.id}`}
          className="block flex-1 min-w-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text leading-snug line-clamp-1 group-hover:text-accent transition-colors">
              {activity.title[language]}
            </h3>
            {isCamp && (
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface-2 text-text-secondary shrink-0">
                Camp
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
            {categoryLabel}
          </p>
          {description && (
            <p className="text-xs text-text-tertiary line-clamp-1 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </Link>
      </div>

      {/* Top right bookmark button */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(activity.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${activity.title[language]}`}
        className={`absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
          isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Bottom meta row: Dauer · Personen links, Ort (Drinnen/Draußen) rechts */}
      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/50 text-xs text-text-secondary">
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
