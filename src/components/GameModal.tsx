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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-stone-50/70 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700">
                {game.category === 'cooperative' && t.filterCooperative}
                {game.category === 'competitive' && t.filterCompetitive}
                {game.category === 'social_deduction' && t.filterSocialDeduction}
                {game.category === 'energizer' && t.filterEnergizer}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                game.energyLevel === 'high' ? 'bg-amber-100 text-amber-900' :
                game.energyLevel === 'calm' ? 'bg-indigo-100 text-indigo-900' :
                'bg-stone-200 text-stone-800'
              }`}>
                {game.energyLevel === 'high' && t.filterHighEnergy}
                {game.energyLevel === 'medium' && t.filterMediumEnergy}
                {game.energyLevel === 'calm' && t.filterCalmEnergy}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {game.title[language]}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200/60'
              }`}
              title={t.savedItems}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-stone-700 text-xs sm:text-sm">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-500 shrink-0" />
              <div>
                <p className="text-stone-400 font-medium">{t.groupLabel}</p>
                <p className="font-semibold text-stone-800">{game.groupSize.min}–{game.groupSize.max} {t.peopleSuffix}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500 shrink-0" />
              <div>
                <p className="text-stone-400 font-medium">{t.durationLabel}</p>
                <p className="font-semibold text-stone-800">{game.durationMinutes}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-500 shrink-0" />
              <div>
                <p className="text-stone-400 font-medium">{t.prepLabel}</p>
                <p className="font-semibold text-stone-800">
                  {game.prepLevel === 'instant' ? t.filterInstantPrep : t.filterMaterialPrep}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
              <div>
                <p className="text-stone-400 font-medium">{t.spaceLabel}</p>
                <p className="font-semibold text-stone-800">{game.space[language]}</p>
              </div>
            </div>
          </div>

          {/* Core Idea */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {t.ideaTitle}
            </h3>
            <p className="text-stone-900 font-medium bg-stone-50 border border-stone-200/70 p-3.5 rounded-xl leading-relaxed">
              {game.idea[language]}
            </p>
          </div>

          {/* Materials */}
          {game.materials[language].length > 0 && game.materials[language][0] !== 'Keine' && game.materials[language][0] !== 'None' && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {t.materialsTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.materials[language].map((mat, i) => (
                  <span key={i} className="text-xs font-medium bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200">
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules Step by Step */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              {t.rulesTitle}
            </h3>
            <div className="space-y-2">
              {game.rules[language].map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                  <span className="w-5 h-5 rounded-full bg-stone-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-stone-800 leading-relaxed text-xs sm:text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Animator Tips */}
          {game.animatorTips[language].length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.tipsTitle}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-950">
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
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span>{copied ? t.copiedSuccess : t.copyRules}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
