import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  Users,
  Timer,
  MessageSquareQuote,
  Award,
  UserCheck,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { tr, ToolHeader } from './tools/common';
// Each tool loads only when opened; the overview page needs none of them.
const ScoreboardTool = lazy(() => import('./tools/ScoreboardTool').then((m) => ({ default: m.ScoreboardTool })));
const TeamsTool = lazy(() => import('./tools/TeamsTool').then((m) => ({ default: m.TeamsTool })));
const TimerTool = lazy(() => import('./tools/TimerTool').then((m) => ({ default: m.TimerTool })));
const CardsTool = lazy(() => import('./tools/CardsTool').then((m) => ({ default: m.CardsTool })));
import { GroupManager } from './tools/GroupManager';
import { loadPresentNames, loadGroupNames } from '../utils/groupNames';
import { DISCUSSION_CARDS } from '../data/toolkits';

interface ToolkitsViewProps {
  language: Language;
  toolId?: string | null;
}

type ToolDef = {
  id: string;
  icon: LucideIcon;
  title: [string, string];
  desc: [string, string];
  group: 'group' | 'run' | 'ideas';
  customHref?: string;
  Component?: React.ComponentType<{ language: Language }>;
};

const GroupManagerToolWrapper: React.FC<{ language: Language }> = ({ language }) => (
  <div className="space-y-4">
    <GroupManager language={language} compact={false} />
  </div>
);

const TOOLS: ToolDef[] = [
  {
    id: 'cards',
    icon: MessageSquareQuote,
    title: ['Gesprächskarten', 'Conversation cards'],
    desc: ['Fragen und heilige Zitate für das Gespräch im Kreis.', 'Questions and sacred scripture for circle conversation.'],
    group: 'ideas',
    Component: CardsTool,
  },
  {
    id: 'teams',
    icon: Users,
    title: ['Gruppeneinteiler', 'Group divider'],
    desc: ['Faire Teams und Zweiergruppen bilden, ohne dieselben Paare zu wiederholen.', 'Form fair teams and pairs without repeating pairings.'],
    group: 'group',
    Component: TeamsTool,
  },
  {
    id: 'timer',
    icon: Timer,
    title: ['Timer & Intervall', 'Timer & Interval'],
    desc: ['Große Anzeige mit Signalton und Runden.', 'Large display with chime and rounds.'],
    group: 'run',
    Component: TimerTool,
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
    id: 'group',
    icon: UserCheck,
    title: ['Meine Gruppe', 'My group'],
    desc: ['Gemeinsame Namens- und Anwesenheitsliste für alle Werkzeuge.', 'Shared presence and member list across all tools.'],
    group: 'group',
    Component: GroupManagerToolWrapper,
  },
];

const RECENT_KEY = 'jy_recent_tools';

export const ToolkitsView: React.FC<ToolkitsViewProps> = ({ language, toolId: propToolId }) => {
  const { toolId: routeToolId } = useParams<{ toolId?: string }>();
  const toolId = propToolId ?? routeToolId;
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const isDe = language === 'de';
  const navigate = useNavigate();

  const [, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

  // Handle redirects for tools that moved to games or were consolidated
  if (toolId === 'empire') {
    return <Navigate to="/games/empire?mode=play" replace />;
  }
  if (toolId === 'roles') {
    return <Navigate to="/games/werwolf?mode=play" replace />;
  }
  if (toolId === 'ideas') {
    return <Navigate to="/games/stumme-reihe?mode=play" replace />;
  }
  if (toolId === 'finder') {
    return <Navigate to="/games" replace />;
  }
  if (toolId === 'planner') {
    return <Navigate to="/tools" replace />;
  }

  const tool = TOOLS.find((x) => x.id === toolId);

  if (tool) {
    if (tool.customHref) {
      return <Navigate to={tool.customHref} replace />;
    }
    const Tool = tool.Component;
    if (!Tool) {
      return <Navigate to="/tools" replace />;
    }
    return (
      <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-150">
        <ToolHeader
          title={tool.title[isDe ? 0 : 1]}
          subtitle={tool.desc[isDe ? 0 : 1]}
          onBack={() => navigate('/tools')}
          backLabel={t.tabTools}
        />
        <Suspense fallback={<div role="status" className="py-16 text-center text-sm text-text-secondary">{isDe ? 'Wird geladen …' : 'Loading …'}</div>}>
          <Tool language={language} />
        </Suspense>
      </div>
    );
  }

  const getActiveToolBadge = (id: string): string | null => {
    try {
      if (id === 'scoreboard') {
        const stored = localStorage.getItem('jy_scoreboard_teams');
        if (stored) {
          const teams = JSON.parse(stored);
          if (Array.isArray(teams)) {
            const totalScore = teams.reduce((acc: number, item: { score?: number }) => acc + (item.score || 0), 0);
            if (totalScore > 0) {
              return `${totalScore} Pkt.`;
            }
          }
        }
        return isDe ? 'Stationen' : 'Stations';
      }
      if (id === 'teams') {
        const present = loadPresentNames();
        if (present.length > 0) {
          return `${present.length} ${isDe ? 'anwesend' : 'present'}`;
        }
        return isDe ? 'Zufallsteams' : 'Random teams';
      }
      if (id === 'group') {
        const all = loadGroupNames();
        if (all.length > 0) {
          return `${all.length} ${isDe ? 'Namen' : 'names'}`;
        }
        return isDe ? 'Namensliste' : 'Roster';
      }
      if (id === 'timer') {
        return isDe ? 'Mit Signalton' : 'With chime';
      }
      if (id === 'cards') {
        return `${DISCUSSION_CARDS.length} ${isDe ? 'Karten' : 'cards'}`;
      }
    } catch {
      /* ignore */
    }
    return null;
  };

  return (
    <div className="max-w-5xl w-full mx-auto pb-24 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
          {t.tabTools}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-prose">
          {L(
            'Praktische Werkzeuge live in der Gruppe. Alle teilen eine gemeinsame Namensliste.',
            'Handy tools live in the group. All share a single group presence list.'
          )}
        </p>
      </div>

      {/* Raster (Grid) of Tools - 2 cols on mobile, 3 cols on tablet/desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {TOOLS.map((x) => {
          const Icon = x.icon;
          const activeBadge = getActiveToolBadge(x.id);
          return (
            <Link
              key={x.id}
              to={x.customHref || `/tools/${x.id}`}
              className="group p-4 sm:p-5 rounded-card bg-surface border border-border hover:bg-surface-2/40 hover:shadow-2 hover:border-accent/40 transition-all duration-150 flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-accent min-h-[140px] sm:min-h-[160px] shadow-xs cursor-pointer relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent-text flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  {activeBadge && (
                    <span className="tabular-nums text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border truncate max-w-[110px]">
                      {activeBadge}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-bold text-sm sm:text-base text-text group-hover:text-accent transition-colors leading-snug">
                    {x.title[isDe ? 0 : 1]}
                  </h2>
                  <p className="text-2xs sm:text-xs text-text-secondary mt-1 leading-snug line-clamp-2">
                    {x.desc[isDe ? 0 : 1]}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end text-xs text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="mr-1">{isDe ? 'Öffnen' : 'Open'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
