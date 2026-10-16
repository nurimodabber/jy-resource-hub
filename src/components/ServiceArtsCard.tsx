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

  // Subtitle: localized category for service or art form for arts
  const subtitle = isService
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
      ? `${activity.durationMin} ${language === 'de' ? 'Min' : 'min'}`
      : `${activity.durationMin}–${activity.durationMax} ${language === 'de' ? 'Min' : 'min'}`;
  const fullDurationTitle = activity.duration ? activity.duration[language] : shortDurationStr;

  return (
    <div className="group relative h-full flex flex-col justify-between bg-surface border border-border rounded-card hover:border-border-strong hover:shadow-card transition-all p-4">
      {/* Top area with icon pill, title, subtitle */}
      <div className="flex items-start gap-3 flex-1 min-w-0 pr-10">
        {/* Single tag: Symbol inside tinted circle on the left, no text pill */}
        <div
          className="w-9 h-9 rounded-full bg-accent-subtle text-accent-text shrink-0 flex items-center justify-center mt-0.5"
          aria-hidden="true"
          title={isService ? 'Dienstprojekt' : 'Kreative Kunst'}
        >
          {isService ? (
            <Heart className="w-4 h-4 text-accent fill-accent/20" />
          ) : (
            <Palette className="w-4 h-4 text-accent" />
          )}
        </div>

        <Link
          to={`/service-arts/${activity.id}`}
          className="block flex-1 min-w-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control"
        >
          <h3 className="text-base font-semibold text-text leading-snug line-clamp-2 group-hover:text-accent-text transition-colors">
            {activity.title[language]}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
            {subtitle}
          </p>
        </Link>
      </div>

      {/* Top right bookmark button */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(activity.id, e)}
        aria-pressed={isFavorite}
        aria-label={`${t.savedItems}: ${activity.title[language]}`}
        className={`absolute top-2 right-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-control hover:bg-surface-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
          isFavorite ? 'text-accent' : 'text-text-tertiary hover:text-text'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Bottom meta row with icons */}
      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/50 text-xs text-text-tertiary tabular-nums">
        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterDuration}: ${fullDurationTitle}`}
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
          <span className="text-[11px] text-text-secondary">{settingLabel}</span>
        </div>
      </div>
    </div>
  );
};
