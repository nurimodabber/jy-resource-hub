import React, { useState } from 'react';
import { X, Users, Clock, MapPin, Copy, Check, Info, AlertCircle, Bookmark } from 'lucide-react';
import { Game, Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

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

  const handleCopy = () => {
    const text = `${game.title[language]}\n\n${t.ideaTitle}:\n${game.idea[language]}\n\n${t.rulesTitle}:\n${game.rules[language].map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n${t.tipsTitle}:\n${game.animatorTips[language].map(tip => `• ${tip}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl max-h-[88vh] rounded-3xl shadow-apple-modal flex flex-col overflow-hidden border border-black/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-black/[0.05] bg-[#fafafc] flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.05] text-[#1d1d1f]">
                {game.category === 'cooperative' && t.filterCooperative}
                {game.category === 'competitive' && t.filterCompetitive}
                {game.category === 'social_deduction' && t.filterSocialDeduction}
                {game.category === 'energizer' && t.filterEnergizer}
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                game.energyLevel === 'high' ? 'bg-amber-500/10 text-amber-800' :
                game.energyLevel === 'calm' ? 'bg-blue-500/10 text-blue-800' :
                'bg-black/[0.04] text-[#6e6e73]'
              }`}>
                {game.energyLevel === 'high' && t.filterHighEnergy}
                {game.energyLevel === 'medium' && t.filterMediumEnergy}
                {game.energyLevel === 'calm' && t.filterCalmEnergy}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              {game.title[language]}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-[#aeaeb2] hover:text-[#1d1d1f] hover:bg-black/[0.05]'
              }`}
              title={t.savedItems}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.05] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-[#1d1d1f] text-xs sm:text-sm">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#f5f5f7] rounded-2xl border border-black/[0.03] text-xs">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#86868b] shrink-0" />
              <div>
                <p className="text-[#86868b] text-[11px] font-medium">{t.groupLabel}</p>
                <p className="font-semibold text-[#1d1d1f]">{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#86868b] shrink-0" />
              <div>
                <p className="text-[#86868b] text-[11px] font-medium">{t.durationLabel}</p>
                <p className="font-semibold text-[#1d1d1f]">{game.durationMinutes}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#86868b] shrink-0" />
              <div>
                <p className="text-[#86868b] text-[11px] font-medium">{t.prepLabel}</p>
                <p className="font-semibold text-[#1d1d1f]">
                  {game.prepLevel === 'instant' ? t.filterInstantPrep : t.filterMaterialPrep}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#86868b] shrink-0" />
              <div>
                <p className="text-[#86868b] text-[11px] font-medium">{t.spaceLabel}</p>
                <p className="font-semibold text-[#1d1d1f]">{game.space[language]}</p>
              </div>
            </div>
          </div>

          {/* Core Idea */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
              {t.ideaTitle}
            </h3>
            <p className="text-[#1d1d1f] bg-[#f5f5f7] border border-black/[0.03] p-4 rounded-2xl leading-relaxed font-normal">
              {game.idea[language]}
            </p>
          </div>

          {/* Materials */}
          {game.materials[language].length > 0 && game.materials[language][0] !== 'Keine' && game.materials[language][0] !== 'None' && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                {t.materialsTitle}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {game.materials[language].map((mat, i) => (
                  <span key={i} className="text-xs font-medium bg-[#f5f5f7] text-[#1d1d1f] px-3 py-1 rounded-full border border-black/[0.04]">
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules Step by Step */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
              {t.rulesTitle}
            </h3>
            <div className="space-y-2">
              {game.rules[language].map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.03]">
                  <span className="w-5 h-5 rounded-full bg-[#1d1d1f] text-white font-medium text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-[#1d1d1f] leading-relaxed text-xs sm:text-sm font-normal">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Animator Tips */}
          {game.animatorTips[language].length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.tipsTitle}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-950 font-normal">
                {game.animatorTips[language].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#fafafc] border-t border-black/[0.05] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full text-[#1d1d1f] bg-white border border-black/[0.08] hover:bg-black/[0.03] transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#86868b]" />}
            <span>{copied ? t.copiedSuccess : t.copyRules}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1d1d1f] text-white text-xs font-semibold rounded-full hover:bg-black transition-colors shadow-apple-pill"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
