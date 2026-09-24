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
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {t.toolkitsHeaderTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
          {t.toolkitsHeaderDesc}
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-6 overflow-x-auto pb-1">
        <button
          onClick={() => setSubTab('empire')}
          className={`flex items-center gap-1.5 py-2.5 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            subTab === 'empire'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>{t.tabEmpireTool}</span>
        </button>

        <button
          onClick={() => setSubTab('discussion')}
          className={`flex items-center gap-1.5 py-2.5 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            subTab === 'discussion'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>{t.tabDiscussionTool}</span>
        </button>

        <button
          onClick={() => setSubTab('playbook')}
          className={`flex items-center gap-1.5 py-2.5 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            subTab === 'playbook'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>{t.tabPlaybookTool}</span>
        </button>
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
              className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {card.theme[language]}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {card.title[language]}
                </h3>

                <blockquote className="italic font-serif text-xs text-stone-600 border-l-2 border-stone-400 pl-3 py-1 bg-stone-50 rounded-r-lg leading-relaxed">
                  {card.quoteSnippet[language]}
                </blockquote>

                <div className="bg-stone-50 border border-stone-200/70 p-3 rounded-lg">
                  <strong className="text-xs font-semibold text-stone-900 block mb-1">
                    {t.coreQuestionLabel}:
                  </strong>
                  <p className="text-xs text-stone-800 leading-relaxed font-medium">
                    {card.coreQuestion[language]}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  {t.deepeningQuestionsLabel}:
                </span>
                <ul className="space-y-1 text-xs text-stone-600">
                  {card.deepeningQuestions[language].map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">•</span>
                      <span className="leading-relaxed">{q}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CAMP_BEST_PRACTICES.map((bp) => (
            <div
              key={bp.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                {bp.area[language]}
              </span>

              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                {bp.title[language]}
              </h3>

              <p className="text-xs font-serif italic text-stone-700 bg-stone-50 border border-stone-200/70 p-3 rounded-lg leading-relaxed">
                „{bp.quoteOrMotto[language]}“
              </p>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  {language === 'de' ? 'Praxisgrundsätze:' : 'Field Principles:'}
                </span>
                <ul className="space-y-2 text-xs text-stone-700">
                  {bp.keyInsights[language].map((ins, i) => (
                    <li key={i} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
