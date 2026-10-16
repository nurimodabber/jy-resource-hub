import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  Timer,
  MessageSquareQuote,
  Crown,
  Eye,
  Compass,
  Lightbulb,
  Award,
  ChevronRight,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { tr, ToolHeader } from './tools/common';
import { EmpireTool } from './tools/EmpireTool';
import { RolesTool } from './tools/RolesTool';
import { ScoreboardTool } from './tools/ScoreboardTool';
import { TeamsTool } from './tools/TeamsTool';
import { TimerTool } from './tools/TimerTool';
import { CardsTool } from './tools/CardsTool';
import { FinderTool } from './tools/FinderTool';
import { IdeasTool } from './tools/IdeasTool';

interface ToolkitsViewProps {
  language: Language;
  toolId?: string | null;
}

type ToolDef = {
  id: string;
  icon: LucideIcon;
  title: [string, string];
  desc: [string, string];
  group: 'run' | 'group' | 'ideas';
  Component: React.FC<{ language: Language }>;
};

const TOOLS: ToolDef[] = [
  {
    id: 'empire',
    icon: Crown,
    title: ['Empire', 'Empire'],
    desc: ['Kategorien, Begriffe vorlesen und Reiche verfolgen.', 'Categories, reading terms and tracking kingdoms.'],
    group: 'run',
    Component: EmpireTool,
  },
  {
    id: 'roles',
    icon: Eye,
    title: ['Rollenverteiler', 'Role dealer'],
    desc: ['Geheime Rollen für Spion, Wer bin ich, Werwölfe und Mörder.', 'Secret roles for Spy, Who am I, Werewolf and Killer.'],
    group: 'run',
    Component: RolesTool,
  },
  {
    id: 'scoreboard',
    icon: Award,
    title: ['Punktetafel', 'Scoreboard'],
    desc: ['Punkte für Stationen oder Quizrunden ohne Beschämung erfassen.', 'Track points for stations or quiz rounds without shaming.'],
    group: 'run',
    Component: ScoreboardTool,
  },
  {
    id: 'teams',
    icon: Users,
    title: ['Teams und Zweiergruppen', 'Teams and pairs'],
    desc: ['Zufällig einteilen, ohne dieselben Paare zu wiederholen.', 'Split at random without repeating the same pairs.'],
    group: 'group',
    Component: TeamsTool,
  },
  {
    id: 'timer',
    icon: Timer,
    title: ['Timer & Intervall', 'Timer & Interval'],
    desc: ['Große Anzeige mit Signalton und Runden für den Beamer.', 'Large display with chime and rounds for projector.'],
    group: 'group',
    Component: TimerTool,
  },
  {
    id: 'finder',
    icon: Compass,
    title: ['Spielfinder', 'Game finder'],
    desc: ['Gruppengröße und Zeit eingeben, passende Spiele erhalten.', 'Enter group size and time, get matching games.'],
    group: 'ideas',
    Component: FinderTool,
  },
  {
    id: 'ideas',
    icon: Lightbulb,
    title: ['Spontane Impulse', 'Spontaneous prompts'],
    desc: ['Sortierkriterien, Geschichtenanfänge und Psychiater-Regeln.', 'Line-up criteria, story starters and psychiatrist rules.'],
    group: 'ideas',
    Component: IdeasTool,
  },
  {
    id: 'cards',
    icon: MessageSquareQuote,
    title: ['Gesprächskarten', 'Conversation cards'],
    desc: ['Fragen und heilige Zitate für das Gespräch im Kreis.', 'Questions and sacred scripture for circle conversation.'],
    group: 'ideas',
    Component: CardsTool,
  },
];

const RECENT_KEY = 'jy_recent_tools';

export const ToolkitsView: React.FC<ToolkitsViewProps> = ({ language, toolId: propToolId }) => {
  const { toolId: routeToolId } = useParams<{ toolId?: string }>();
  const toolId = propToolId ?? routeToolId;
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const navigate = useNavigate();

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const tool = TOOLS.find((x) => x.id === toolId);

  // Update recent tools list whenever a tool is opened
  useEffect(() => {
    if (toolId && TOOLS.some((x) => x.id === toolId)) {
      try {
        const stored = localStorage.getItem(RECENT_KEY);
        const list: string[] = stored ? JSON.parse(stored) : [];
        const updated = [toolId, ...list.filter((id) => id !== toolId)].slice(0, 4);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        setRecentIds(updated);
      } catch {
        /* ignore */
      }
    }
  }, [toolId]);

  if (tool) {
    const Tool = tool.Component;
    return (
      <div className="max-w-3xl mx-auto pb-28">
        <ToolHeader
          title={tool.title[language === 'de' ? 0 : 1]}
          subtitle={tool.desc[language === 'de' ? 0 : 1]}
          onBack={() => navigate('/tools')}
          backLabel={t.tabTools}
        />
        <Tool language={language} />
      </div>
    );
  }

  const groups: { id: ToolDef['group']; label: string; desc: string }[] = [
    {
      id: 'run',
      label: L('Spiele leiten', 'Run a game'),
      desc: L('Werkzeuge zur direkten Begleitung von Gruppenspielen', 'Tools for guiding group games live'),
    },
    {
      id: 'group',
      label: L('Gruppe organisieren', 'Organise the group'),
      desc: L('Teams bilden, Zeiten stoppen und Abläufe steuern', 'Form teams, manage time, and guide gatherings'),
    },
    {
      id: 'ideas',
      label: L('Ideen & Reflexion', 'Ideas & reflection'),
      desc: L('Impulse für Warm-ups und vertiefende Gespräche', 'Prompts for warm-ups and deeper discussions'),
    },
  ];

  const recentTools = recentIds
    .map((id) => TOOLS.find((x) => x.id === id))
    .filter((x): x is ToolDef => !!x);

  const renderToolVisual = (id: string, Icon: LucideIcon, size: 'sm' | 'md' = 'md') => {
    const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
    switch (id) {
      case 'timer':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line flex flex-col items-center justify-center shrink-0 group-hover:border-accent transition-colors`}>
            <span className={`font-mono font-bold text-accent tabular-nums ${size === 'sm' ? 'text-2xs' : 'text-xs'}`}>05:00</span>
            <span className="text-3xs text-text-tertiary uppercase font-mono leading-none">min</span>
          </div>
        );
      case 'teams':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line p-1.5 flex flex-col justify-between shrink-0 group-hover:border-accent transition-colors`}>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7DB6C9]" />
              <span className="text-3xs font-mono font-bold text-text leading-none">Team A</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E58A6B]" />
              <span className="text-3xs font-mono font-bold text-text leading-none">Team B</span>
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line p-1.5 flex flex-col justify-around shrink-0 group-hover:border-accent transition-colors`}>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="w-4 h-1 rounded-xs bg-line" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7DB6C9]" />
              <span className="w-5 h-1 rounded-xs bg-line" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9C46A]" />
              <span className="w-3 h-1 rounded-xs bg-line" />
            </div>
          </div>
        );
      case 'empire':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line flex flex-col items-center justify-center shrink-0 group-hover:border-accent transition-colors`}>
            <Crown className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-3xs font-bold text-text-tertiary leading-none mt-0.5">3 · 4 · 2</span>
          </div>
        );
      case 'scoreboard':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line flex flex-col items-center justify-center shrink-0 group-hover:border-accent transition-colors`}>
            <span className={`font-mono font-bold text-text tabular-nums leading-none ${size === 'sm' ? 'text-2xs' : 'text-xs'}`}>+1</span>
            <span className="font-mono text-3xs text-text-tertiary leading-none mt-0.5">12 pts</span>
          </div>
        );
      case 'finder':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line flex flex-col items-center justify-center shrink-0 group-hover:border-accent transition-colors`}>
            <span className={`font-mono font-bold text-text tabular-nums leading-none ${size === 'sm' ? 'text-2xs' : 'text-xs'}`}>2–40</span>
            <span className="text-3xs text-text-tertiary font-mono leading-none mt-0.5">Pers.</span>
          </div>
        );
      case 'cards':
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line relative flex items-center justify-center shrink-0 group-hover:border-accent transition-colors`}>
            <div className="w-4 h-5 rounded-xs border border-line bg-surface absolute translate-x-1 -translate-y-1" />
            <div className="w-4 h-5 rounded-xs border border-accent bg-surface-2 relative flex items-center justify-center">
              <span className="font-serif text-3xs text-accent">„“</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${dim} rounded-control bg-surface-2 border border-line flex items-center justify-center shrink-0 group-hover:border-accent transition-colors`}>
            <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-28 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text">
          {t.tabTools}
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-prose">
          {L(
            'Acht praktische Werkzeuge für Handy und Beamer live in der Gruppe. Alle teilen eine gemeinsame Namensliste.',
            'Eight handy tools for mobile and projector live in the group. All share a single group presence list.'
          )}
        </p>
      </div>

      {/* Zuletzt genutzt */}
      {recentTools.length > 0 && (
        <section aria-label={L('Zuletzt genutzt', 'Recently used')} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
            <Clock className="w-3.5 h-3.5" />
            <span>{L('Zuletzt genutzt', 'Recently used')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentTools.map((x) => {
              const Icon = x.icon;
              return (
                <Link
                  key={`recent-${x.id}`}
                  to={`/tools/${x.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-card bg-surface border border-line hover:border-accent hover:shadow-xs transition-all duration-150 group"
                >
                  {renderToolVisual(x.id, Icon, 'sm')}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text text-sm truncate group-hover:text-accent-text transition-colors">
                      {x.title[language === 'de' ? 0 : 1]}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">
                      {x.desc[language === 'de' ? 0 : 1]}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-text shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Tool Groups */}
      <div className="space-y-8">
        {groups.map((g) => {
          const groupTools = TOOLS.filter((x) => x.group === g.id);
          return (
            <section key={g.id} aria-label={g.label} className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-text tracking-tight">{g.label}</h2>
                <p className="text-xs text-text-tertiary">{g.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {groupTools.map((x) => {
                  const Icon = x.icon;
                  return (
                    <Link
                      key={x.id}
                      to={`/tools/${x.id}`}
                      className="flex items-start gap-4 p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-accent hover:shadow-1 transition-all duration-150 group cursor-pointer"
                    >
                      {renderToolVisual(x.id, Icon, 'md')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-text text-base group-hover:text-accent-text transition-colors">
                            {x.title[language === 'de' ? 0 : 1]}
                          </p>
                          <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-text shrink-0" />
                        </div>
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                          {x.desc[language === 'de' ? 0 : 1]}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
