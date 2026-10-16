import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, MapPin, Heart, Palette, Bookmark, Sparkles } from 'lucide-react';
import { ActivityItem, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface ServiceArtsCardProps {
  activity: ActivityItem;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

function getMaterialScope(materials: string[] = [], lang: Language): string {
  if (!materials || materials.length === 0) {
    return lang === 'de' ? 'Ohne Material' : 'No materials';
  }
  const joined = materials.join(' ').toLowerCase();
  if (joined.includes('kein') || joined.includes('none') || joined.includes('ohne')) {
    return lang === 'de' ? 'Ohne Material' : 'No materials';
  }
  if (joined.includes('papier') || joined.includes('stift') || joined.includes('pen') || joined.includes('paper')) {
    return lang === 'de' ? 'Stifte & Papier' : 'Pens & paper';
  }
  if (joined.includes('farbe') || joined.includes('pinsel') || joined.includes('paint') || joined.includes('brush') || joined.includes('leinwand')) {
    return lang === 'de' ? 'Farben & Pinsel' : 'Paints & brushes';
  }
  return lang === 'de' ? 'Einfaches Material' : 'Basic supplies';
}

function getServiceScopeLabel(scope: 'quick' | 'medium' | 'deep' | undefined, lang: Language): string {
  switch (scope) {
    case 'quick':
      return lang === 'de' ? 'Einmalig' : 'One-off';
    case 'medium':
      return lang === 'de' ? 'Halbtag' : 'Half-day';
    case 'deep':
      return lang === 'de' ? 'Fortlaufend' : 'Ongoing';
    default:
      return lang === 'de' ? 'Aktion' : 'Action';
  }
}

export const ServiceArtsCard: React.FC<ServiceArtsCardProps> = ({
  activity,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const t = UI_TRANSLATIONS[language];
  const isService = activity.kind === 'dienst';

  // Subtitle / Category
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
      ? `${activity.durationMin} ${language === 'de' ? 'Min' : 'min'}`
      : `${activity.durationMin}–${activity.durationMax} ${language === 'de' ? 'Min' : 'min'}`;

  // Schema-specific metadata for Service vs. Arts
  const serviceScope = isService && 'scope' in activity ? getServiceScopeLabel(activity.scope, language) : '';
  const artMaterials = !isService && 'materials' in activity ? getMaterialScope(activity.materials[language], language) : '';

  return (
    <div
      style={{
        borderLeftColor: isService ? '#B9C46A' : '#7DB6C9',
        borderLeftWidth: '3.5px',
      }}
      className="group relative h-full flex flex-col justify-between bg-surface border border-line rounded-card hover:border-accent/40 hover:shadow-xs transition-all p-4.5"
    >
      {/* Distinct Header Schema */}
      <div className="space-y-2.5 flex-1 min-w-0 pr-10">
        {isService ? (
          /* Service Header: Category + Ort (Setting) + Wirkung / Zeitrahmen */
          <div className="flex flex-wrap items-center gap-1.5 text-2xs">
            <span className="font-semibold px-2 py-0.5 rounded-control bg-[#B9C46A]/15 text-[#8A963E] dark:text-[#B9C46A]">
              {categoryLabel}
            </span>
            <span className="text-text-tertiary">·</span>
            <span className="font-medium text-text-secondary">
              {settingLabel}
            </span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono text-text-tertiary font-medium">
              {serviceScope}
            </span>
          </div>
        ) : (
          /* Arts Header: Disziplin (Art Form) + Materialaufwand */
          <div className="flex flex-wrap items-center gap-1.5 text-2xs">
            <span className="font-semibold px-2 py-0.5 rounded-control bg-[#7DB6C9]/15 text-[#4E889C] dark:text-[#7DB6C9]">
              {categoryLabel}
            </span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono text-text-secondary font-medium">
              {artMaterials}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2.5">
          <div
            className={`w-7 h-7 rounded-control shrink-0 flex items-center justify-center mt-0.5 border border-line ${
              isService ? 'bg-[#B9C46A]/10 text-[#B9C46A]' : 'bg-[#7DB6C9]/10 text-[#7DB6C9]'
            }`}
            aria-hidden="true"
          >
            {isService ? (
              <Heart className="w-3.5 h-3.5 text-[#B9C46A] fill-[#B9C46A]/20" />
            ) : (
              <Palette className="w-3.5 h-3.5 text-[#7DB6C9]" />
            )}
          </div>

          <Link
            to={`/service-arts/${activity.id}`}
            className="block flex-1 min-w-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-control"
          >
            <h3 className="text-base font-bold text-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
              {activity.title[language]}
            </h3>
            <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
              {isService && 'objective' in activity
                ? activity.objective[language]
                : 'description' in activity
                ? activity.description[language]
                : ''}
            </p>
          </Link>
        </div>
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
      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-line text-xs text-text-tertiary tabular-nums font-mono">
        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterDuration}: ${shortDurationStr}`}
        >
          <Clock className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span>{shortDurationStr}</span>
        </div>

        <span className="text-line" aria-hidden="true">·</span>

        <div
          className="inline-flex items-center gap-1.5 shrink-0"
          title={`${t.filterGroupSize}: ${activity.groupSize.min}–${activity.groupSize.max} ${t.peopleSuffix}`}
        >
          <Users className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
          <span>{activity.groupSize.min}–{activity.groupSize.max}</span>
        </div>

        {isService ? (
          <div
            className="inline-flex items-center gap-1.5 ml-auto shrink-0 font-sans text-2xs text-text-secondary"
            title={`${t.settingLabel}: ${settingLabel}`}
          >
            <MapPin className="w-3 h-3 text-text-tertiary" aria-hidden="true" />
            <span>{settingLabel}</span>
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-1.5 ml-auto shrink-0 font-sans text-2xs text-text-secondary truncate max-w-[120px]"
            title={'book' in activity ? activity.book[language] : ''}
          >
            <Sparkles className="w-3 h-3 text-[#7DB6C9]" aria-hidden="true" />
            <span className="truncate">{'book' in activity ? activity.book[language] : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
