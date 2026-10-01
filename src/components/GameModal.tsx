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
      maxWidth="4xl"
      showCloseButton={false}
    >
      <div className="space-y-6">
        
        {/* Header Row: Title, Badges, Bookmark and Close */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge category={getCategory()} size="md">
                {getCategoryLabel()}
              </Badge>
              <Badge category="neutral" size="md">
                {getEnergyLabel()}
              </Badge>
              {game.prepLevel === 'instant' && (
                <Badge category="cooperative" size="md">
                  0′ Prep
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight leading-tight">
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
                  ? 'text-accent-contrast bg-accent hover:bg-accent-hover'
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

        {/* Two-Column Desktop / One-Column Tablet Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (≈60% - 7 cols): Idea & Wirkung, Ablauf im Detail (numbered steps) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Idee & Wirkung */}
            <div className="space-y-2">
              <h3 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {t.ideaTitle}
              </h3>
              <p className="text-text bg-surface-2/70 border border-border p-4 rounded-2xl leading-relaxed text-sm">
                {game.idea[language]}
              </p>
            </div>

            {/* 2. Ablauf im Detail (Numbered steps) */}
            <div className="space-y-3">
              <h3 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                {t.rulesTitle}
              </h3>
              <div className="space-y-2.5">
                {game.rules[language].map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-2 border border-border">
                    <span className="w-6 h-6 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-text leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials if needed */}
            {game.materials[language].length > 0 && game.materials[language][0] !== 'Keine' && game.materials[language][0] !== 'None' && (
              <div className="space-y-2">
                <h3 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary">
                  {t.materialsTitle}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.materials[language].map((mat, i) => (
                    <span key={i} className="text-xs font-semibold bg-surface-2 text-text px-3 py-1.5 rounded-xl border border-border">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (≈40% - 5 cols, sticky on desktop): Fact grid, Primary action, Tips, Share */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-2">
            
            {/* Fact Grid */}
            <div className="p-4 bg-surface-2 rounded-2xl border border-border space-y-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-text-tertiary block">
                {language === 'de' ? 'Spieldaten' : 'Overview'}
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-text-tertiary text-2xs font-medium">{t.groupLabel}</p>
                    <p className="font-bold text-text leading-snug">{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-text-tertiary text-2xs font-medium">{t.durationLabel}</p>
                    <p className="font-bold text-text leading-snug">{game.durationMinutes}′</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-text-tertiary text-2xs font-medium">{t.prepLabel}</p>
                    <p className="font-bold text-text leading-snug">
                      {game.prepLevel === 'instant' ? t.filterInstantPrep : t.filterMaterialPrep}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-text-tertiary text-2xs font-medium">{t.spaceLabel}</p>
                    <p className="font-bold text-text leading-snug">{game.space[language]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Amber fill with navy text */}
            <div>
              <button
                type="button"
                onClick={handleAddToPlan}
                className="w-full py-3 px-4 rounded-xl bg-accent text-accent-contrast hover:bg-accent-hover font-bold text-sm shadow-apple-pill flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer min-h-[46px] outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'de' ? 'Zum Plan hinzufügen' : 'Add to Session Plan'}</span>
              </button>
            </div>

            {/* Hinweise für Animatoren */}
            {game.animatorTips[language].length > 0 && (
              <div className="space-y-2">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-accent-text" />
                  <span>{t.tipsTitle}</span>
                </h4>
                <div className="p-3.5 bg-accent-subtle/70 border border-accent/25 rounded-2xl space-y-2 text-xs text-text">
                  {game.animatorTips[language].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent-text font-bold leading-relaxed">•</span>
                      <p className="leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Share Actions */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.copiedSuccess : t.copyRules}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer"
                >
                  {shareSuccess ? <Check className="w-3.5 h-3.5 text-sage" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{t.shareBtn || 'Teilen'}</span>
                </button>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl bg-surface-2 hover:bg-surface-raised border border-border text-text font-medium transition-colors cursor-pointer"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </Dialog>
  );
};
