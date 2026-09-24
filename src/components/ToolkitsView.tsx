import React, { useState } from 'react';
import { Dices, MessageSquareQuote, HeartHandshake } from 'lucide-react';
import { Language } from '../types';
import { DISCUSSION_CARDS, CAMP_BEST_PRACTICES } from '../data/toolkits';
import { UI_TRANSLATIONS } from '../data/translations';
import { EmpireBoard } from './EmpireBoard';

interface ToolkitsViewProps {
  language: Language;
}

export const ToolkitsView: React.FC<ToolkitsViewProps> = ({ language }) => {
  const [subTab, setSubTab] = useState<'empire' | 'discussion' | 'playbook'>('empire');
  const t = UI_TRANSLATIONS[language];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Header & Segmented Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t.toolkitsHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] mt-1 max-w-xl font-normal leading-relaxed">
            {t.toolkitsHeaderDesc}
          </p>
        </div>

        {/* Apple Segmented Control */}
        <div className="inline-flex items-center p-1 bg-black/[0.05] rounded-full border border-black/[0.03] self-start sm:self-auto">
          <button
            onClick={() => setSubTab('empire')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              subTab === 'empire'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>{t.tabEmpireTool}</span>
          </button>

          <button
            onClick={() => setSubTab('discussion')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              subTab === 'discussion'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{t.tabDiscussionTool}</span>
          </button>

          <button
            onClick={() => setSubTab('playbook')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full font-medium transition-all ${
              subTab === 'playbook'
                ? 'bg-white text-[#1d1d1f] shadow-apple-pill font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{t.tabPlaybookTool}</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: Empire Board Assistant */}
      {subTab === 'empire' && (
        <EmpireBoard language={language} />
      )}

      {/* SubTab 2: Discussion Cards */}
      {subTab === 'discussion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {DISCUSSION_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-apple-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1d1d1f]">
                    {card.theme[language]}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#1d1d1f] leading-snug">
                  {card.title[language]}
                </h3>

                <blockquote className="italic font-serif text-xs text-[#6e6e73] border-l-2 border-black/20 pl-3 py-1 bg-[#f5f5f7] rounded-r-xl leading-relaxed">
                  {card.quoteSnippet[language]}
                </blockquote>

                <div className="bg-[#f5f5f7] border border-black/[0.03] p-3.5 rounded-xl">
                  <strong className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                    {t.coreQuestionLabel}:
                  </strong>
                  <p className="text-xs text-[#1d1d1f] leading-relaxed font-medium">
                    {card.coreQuestion[language]}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.04] space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] block">
                  {t.deepeningQuestionsLabel}:
                </span>
                <ul className="space-y-1 text-xs text-[#6e6e73]">
                  {card.deepeningQuestions[language].map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#aeaeb2] font-bold">•</span>
                      <span className="leading-relaxed font-normal">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubTab 3: Playbook */}
      {subTab === 'playbook' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {CAMP_BEST_PRACTICES.map((bp) => (
            <div
              key={bp.id}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-apple-card space-y-4"
            >
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] text-[#1d1d1f]">
                {bp.area[language]}
              </span>

              <h3 className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                {bp.title[language]}
              </h3>

              <p className="text-xs font-serif italic text-[#1d1d1f] bg-[#f5f5f7] border border-black/[0.03] p-3.5 rounded-xl leading-relaxed">
                „{bp.quoteOrMotto[language]}“
              </p>

              <ul className="space-y-1.5 text-xs text-[#6e6e73]">
                {bp.keyInsights[language].map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#aeaeb2]">•</span>
                    <span className="leading-relaxed font-normal">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
