import React, { useState } from 'react';
import { 
  Users, Clock, MapPin, Copy, Check, Info, Bookmark, 
  AlertCircle, Share2, MessageCircle 
} from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { Dialog } from './ui/Dialog';
import { Badge, BadgeCategory } from './ui/Badge';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { shareResource, generateWhatsAppLink } from '../utils/share';

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
  const [shareSuccess, setShareSuccess] = useState(false);

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

  const gameUrl = `${window.location.origin}/games/${game.id}`;

  const handleShare = async () => {
    const result = await shareResource({
      title: `${game.title[language]} — JY Hub`,
      text: `${t.shareGameText || 'Hey, schau dir dieses Spiel für unsere JG an:'} ${game.title[language]}`,
      url: gameUrl,
    });

    if (result.success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const whatsappHref = generateWhatsAppLink(
    `${t.shareGameText || 'Hey, schau dir dieses Spiel für unsere JG an:'} ${game.title[language]}`,
    gameUrl
  );

  return (
    <Dialog
      isOpen={!!game}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={true}
    >
      <div className="space-y-6 short:space-y-3">
        {/* Header Badges & Title */}
        <div className="flex items-start justify-between gap-4 -mt-1">
          <div className="space-y-1.5">
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

          <div className="flex items-center gap-1">
            <IconButton
              label={t.shareBtn || 'Teilen'}
              onClick={handleShare}
              size="md"
              className={shareSuccess ? 'text-emerald-500 bg-emerald-500/10' : 'text-text-tertiary hover:text-text'}
            >
              {shareSuccess ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            </IconButton>

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
        </div>

        {/* Responsive Layout: 1 Column on Portrait / Desktop, 2 Columns in Phone Landscape (`short:grid-cols-2`) */}
        <div className="short:grid short:grid-cols-2 short:gap-4 space-y-6 short:space-y-0">
          
          {/* Column 1 (Left on landscape): Metrics, Idea, Materials */}
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 short:grid-cols-2 gap-2.5 p-3.5 bg-surface-2 rounded-2xl border border-border-subtle text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-tertiary shrink-0" />
                <div className="min-w-0">
                  <p className="text-text-tertiary text-2xs font-medium">{t.groupLabel}</p>
                  <p className="font-semibold text-text truncate">{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-tertiary shrink-0" />
                <div className="min-w-0">
                  <p className="text-text-tertiary text-2xs font-medium">{t.durationLabel}</p>
                  <p className="font-semibold text-text truncate">{game.durationMinutes}′</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-text-tertiary shrink-0" />
                <div className="min-w-0">
                  <p className="text-text-tertiary text-2xs font-medium">{t.prepLabel}</p>
                  <p className="font-semibold text-text truncate">
                    {game.prepLevel === 'instant' ? t.filterInstantPrep : t.filterMaterialPrep}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-tertiary shrink-0" />
                <div className="min-w-0">
                  <p className="text-text-tertiary text-2xs font-medium">{t.spaceLabel}</p>
                  <p className="font-semibold text-text truncate">{game.space[language]}</p>
                </div>
              </div>
            </div>

            {/* Core Idea */}
            <div className="space-y-1.5">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t.ideaTitle}
              </h3>
              <p className="text-text bg-surface-2 border border-border-subtle p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm">
                {game.idea[language]}
              </p>
            </div>

            {/* Materials */}
            {game.materials[language].length > 0 && game.materials[language][0] !== 'Keine' && game.materials[language][0] !== 'None' && (
              <div className="space-y-1.5">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {t.materialsTitle}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.materials[language].map((mat, i) => (
                    <span key={i} className="text-xs font-medium bg-surface-2 text-text px-2.5 py-1 rounded-full border border-border-subtle">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2 (Right on landscape): Rules Step by Step, Animator Tips */}
          <div className="space-y-4">
            {/* Rules Step by Step */}
            <div className="space-y-2">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t.rulesTitle}
              </h3>
              <div className="space-y-2 max-h-[45vh] short:max-h-[30vh] overflow-y-auto custom-scrollbar pr-1">
                {game.rules[language].map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-2 border border-border-subtle">
                    <span className="w-5 h-5 rounded-full bg-text text-bg font-semibold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-text leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilitator Tips */}
            {game.animatorTips[language].length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-accent" />
                  <span>{t.tipsTitle}</span>
                </h3>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5 text-xs text-text">
                  {game.animatorTips[language].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-text-tertiary" />}
              iconPosition="left"
            >
              {copied ? t.copiedSuccess : t.copyRules}
            </Button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors"
              title={t.shareOnWhatsApp || 'WhatsApp'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <Button
            onClick={onClose}
            variant="primary"
            size="sm"
          >
            {t.close}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
