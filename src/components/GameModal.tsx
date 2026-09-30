import React, { useState } from 'react';
import { Users, Clock, MapPin, Copy, Check, Info, Bookmark, AlertCircle } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { Dialog } from './ui/Dialog';
import { Badge, BadgeCategory } from './ui/Badge';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  onClose,
  language,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  if (!game) return null;

  const t = UI_TRANSLATIONS[language];

  const getCategory = (): BadgeCategory => {
    switch (game.category) {
      case 'cooperative': return 'cooperative';
      case 'competitive': return 'competitive';
      case 'social_deduction': return 'social';
      case 'energizer': return 'energizer';
    }
  };

  const getCategoryLabel = () => {
    switch (game.category) {
      case 'cooperative': return t.filterCooperative;
      case 'competitive': return t.filterCompetitive;
      case 'social_deduction': return t.filterSocialDeduction;
      case 'energizer': return t.filterEnergizer;
    }
  };

  const getEnergyLabel = () => {
    switch (game.energyLevel) {
      case 'high': return t.filterHighEnergy;
      case 'medium': return t.filterMediumEnergy;
      case 'calm': return t.filterCalmEnergy;
    }
  };

  const handleCopy = () => {
    const text = `${game.title[language]}\n\n${t.ideaTitle}:\n${game.idea[language]}\n\n${t.rulesTitle}:\n${game.rules[language].map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n${t.tipsTitle}:\n${game.animatorTips[language].map(tip => `• ${tip}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      isOpen={!!game}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Header Badges & Title */}
        <div className="flex items-start justify-between gap-4 -mt-1">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge category={getCategory()} size="md">
                {getCategoryLabel()}
              </Badge>
              <Badge category="neutral" size="md">
                {getEnergyLabel()}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
              {game.title[language]}
            </h2>
          </div>

          <IconButton
            label={isFavorite ? t.savedItems : `${t.savedItems} (hinzufügen)`}
            onClick={(e) => onToggleFavorite(game.id, e)}
            size="md"
            className={
              isFavorite
                ? 'text-accent bg-accent/10 hover:bg-accent/20'
                : 'text-text-tertiary hover:text-text'
            }
          >
            <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </IconButton>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-2 rounded-2xl border border-border-subtle text-xs">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-text-tertiary shrink-0" />
            <div>
              <p className="text-text-tertiary text-xs font-medium">{t.groupLabel}</p>
              <p className="font-semibold text-text">{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-text-tertiary shrink-0" />
            <div>
              <p className="text-text-tertiary text-xs font-medium">{t.durationLabel}</p>
              <p className="font-semibold text-text">{game.durationMinutes}′</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-text-tertiary shrink-0" />
            <div>
              <p className="text-text-tertiary text-xs font-medium">{t.prepLabel}</p>
              <p className="font-semibold text-text">
                {game.prepLevel === 'instant' ? t.filterInstantPrep : t.filterMaterialPrep}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-text-tertiary shrink-0" />
            <div>
              <p className="text-text-tertiary text-xs font-medium">{t.spaceLabel}</p>
              <p className="font-semibold text-text">{game.space[language]}</p>
            </div>
          </div>
        </div>

        {/* Core Idea */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {t.ideaTitle}
          </h3>
          <p className="text-text bg-surface-2 border border-border-subtle p-4 rounded-2xl leading-relaxed text-sm">
            {game.idea[language]}
          </p>
        </div>

        {/* Materials */}
        {game.materials[language].length > 0 && game.materials[language][0] !== 'Keine' && game.materials[language][0] !== 'None' && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {t.materialsTitle}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {game.materials[language].map((mat, i) => (
                <span key={i} className="text-xs font-medium bg-surface-2 text-text px-3 py-1.5 rounded-full border border-border-subtle">
                  {mat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rules Step by Step */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {t.rulesTitle}
          </h3>
          <div className="space-y-2.5">
            {game.rules[language].map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-2 border border-border-subtle">
                <span className="w-6 h-6 rounded-full bg-text text-bg font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-text leading-relaxed font-normal">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Facilitator Tips */}
        {game.animatorTips[language].length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-accent" />
              <span>{t.tipsTitle}</span>
            </h3>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-sm text-text">
              {game.animatorTips[language].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="md"
            icon={copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-text-tertiary" />}
          >
            {copied ? t.copiedSuccess : t.copyRules}
          </Button>

          <Button
            onClick={onClose}
            variant="primary"
            size="md"
          >
            {t.close}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
