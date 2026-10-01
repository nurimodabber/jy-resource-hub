import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, MapPin, Copy, Check, Info, Bookmark, 
  AlertCircle, Share2, MessageCircle, Plus, X 
} from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { Dialog } from './ui/Dialog';
import { Badge, BadgeCategory } from './ui/Badge';
import { IconButton } from './ui/IconButton';
import { shareResource, generateWhatsAppLink } from '../utils/share';
import { usePlanner } from '../context/PlannerContext';
import { useToast } from '../context/ToastContext';

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
  const navigate = useNavigate();
  const { addSlotToPlan } = usePlanner();
  const { showToast } = useToast();

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

  const handleAddToPlan = () => {
    const durationNum = parseInt(game.durationMinutes.replace(/[^0-9]/g, '')) || 15;
    const result = addSlotToPlan({
      type: game.energyLevel === 'calm' ? 'closing' : 'warmup',
      title: { de: game.title.de, en: game.title.en },
      durationMinutes: durationNum,
      description: { de: game.summary.de, en: game.summary.en },
      referenceId: game.id,
      referenceType: 'game',
    });

    showToast({
      text: language === 'de' ? 'Spiel zum Plan hinzugefügt' : 'Game added to plan',
      action: {
        label: language === 'de' ? 'Plan öffnen' : 'Open Plan',
        onClick: () => {
          onClose();
          navigate('/planner');
        },
      },
      undo: {
        label: language === 'de' ? 'Rückgängig' : 'Undo',
        onClick: () => {
          result.undo();
        },
      },
    });
  };

  return (
    <Dialog
      isOpen={!!game}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={false}
    >
      <div className="space-y-5 short:space-y-3">
        
        {/* 1. Title Row with Integrated Close Button (No ~90px empty top strip) */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge category={getCategory()} size="md">
                {getCategoryLabel()}
              </Badge>
              <Badge category="neutral" size="md">
                {getEnergyLabel()}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight leading-tight">
              {game.title[language]}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0 -mt-1">
            <IconButton
              label={isFavorite ? t.savedItems : `${t.savedItems} (hinzufügen)`}
              onClick={(e) => onToggleFavorite(game.id, e)}
              size="md"
              className={
                isFavorite
                  ? 'text-accent bg-accent-subtle hover:bg-accent/20'
                  : 'text-text-secondary hover:text-text'
              }
            >
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </IconButton>

            <IconButton
              label={t.close || 'Schließen (Esc)'}
              onClick={onClose}
              size="md"
              variant="ghost"
              className="text-text-secondary hover:text-text"
            >
              <X className="w-5 h-5" />
            </IconButton>
          </div>
        </div>

        {/* 2. Metadata Grid (Allows 2 lines so values like 'Keine Vorbereitung' never truncate) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-surface-2 rounded-2xl border border-border text-xs">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-text-tertiary text-2xs font-medium">{t.groupLabel}</p>
              <p className="font-semibold text-text leading-snug">{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-text-tertiary text-2xs font-medium">{t.durationLabel}</p>
              <p className="font-semibold text-text leading-snug">{game.durationMinutes}′</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-text-tertiary text-2xs font-medium">{t.prepLabel}</p>
              <p className="font-semibold text-text leading-snug">
                {game.prepLevel === 'instant' ? t.filterInstantPrep : t.filterMaterialPrep}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-text-tertiary text-2xs font-medium">{t.spaceLabel}</p>
              <p className="font-semibold text-text leading-snug">{game.space[language]}</p>
            </div>
          </div>
        </div>

        {/* 3. Primary Action: "Zum Plan hinzufügen" (One primary action per screen) */}
        <div>
          <button
            type="button"
            onClick={handleAddToPlan}
            className="w-full py-3 px-4 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'de' ? 'Zum Plan hinzufügen' : 'Add to Session Plan'}</span>
          </button>
        </div>

        {/* 4. Content (Responsive: 1 col portrait, 2 cols landscape) */}
        <div className="short:grid short:grid-cols-2 short:gap-4 space-y-5 short:space-y-0">
          
          {/* Column 1: Core Idea & Materials */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t.ideaTitle}
              </h3>
              <p className="text-text bg-surface-2 border border-border p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm">
                {game.idea[language]}
              </p>
            </div>

            {game.materials[language].length > 0 && game.materials[language][0] !== 'Keine' && game.materials[language][0] !== 'None' && (
              <div className="space-y-1.5">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {t.materialsTitle}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.materials[language].map((mat, i) => (
                    <span key={i} className="text-xs font-medium bg-surface-2 text-text px-2.5 py-1 rounded-full border border-border">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Rules Step by Step & Tips */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t.rulesTitle}
              </h3>
              <div className="space-y-2 max-h-[40vh] short:max-h-[25vh] overflow-y-auto custom-scrollbar pr-1">
                {game.rules[language].map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-surface-2 border border-border">
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-contrast font-semibold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-text leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {game.animatorTips[language].length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-2xs font-semibold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-accent-text" />
                  <span>{t.tipsTitle}</span>
                </h3>
                <div className="p-3 bg-accent-subtle border border-accent/20 rounded-2xl space-y-1.5 text-xs text-text">
                  {game.animatorTips[language].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent-text font-bold">•</span>
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 5. Secondary Utility Actions (Share, Copy, WhatsApp) - No 'Schließen' button */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedSuccess : t.copyRules}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text font-medium transition-colors cursor-pointer"
            >
              {shareSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{t.shareBtn || 'Teilen'}</span>
            </button>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-surface-2 hover:bg-surface-raised border border-border text-text-secondary hover:text-text font-medium transition-colors cursor-pointer"
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </a>
        </div>

      </div>
    </Dialog>
  );
};
