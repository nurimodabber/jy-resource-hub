import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  Users,
  Timer,
  MessageSquareQuote,
  Award,
  UserCheck,
  LucideIcon,
} from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { tr, ToolHeader } from './tools/common';
import { FadedIconTile } from './ui/FadedIconTile';
// Each tool loads only when opened; the overview page needs none of them.
const ScoreboardTool = lazy(() => import('./tools/ScoreboardTool').then((m) => ({ default: m.ScoreboardTool })));
const TeamsTool = lazy(() => import('./tools/TeamsTool').then((m) => ({ default: m.TeamsTool })));
const TimerTool = lazy(() => import('./tools/TimerTool').then((m) => ({ default: m.TimerTool })));
const CardsTool = lazy(() => import('./tools/CardsTool').then((m) => ({ default: m.CardsTool })));
import { GroupManager } from './tools/GroupManager';

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
    <GroupManager language={language} compact={false} showTitle={false} />
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
      <div className="max-w-3xl mx-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-16 animate-in fade-in duration-150">
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

  return (
    <div className="max-w-5xl w-full mx-auto pb-24 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[32px] sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.15] sm:leading-[1.12]">
          {t.tabTools}
        </h1>
        <p className="hidden sm:block text-base sm:text-lg text-text-secondary mt-2 max-w-2xl font-normal leading-relaxed">
          {L(
            'Praktische Werkzeuge live in der Gruppe. Alle teilen eine gemeinsame Namensliste.',
            'Handy tools live in the group. All share a single group presence list.'
          )}
        </p>
      </div>

      {/* Tools as tiles: title + faded icon, no description, no category pill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {TOOLS.map((x) => (
          <FadedIconTile key={x.id} to={x.customHref || `/tools/${x.id}`} Icon={x.icon} title={x.title[isDe ? 0 : 1]} className="min-h-[76px] sm:min-h-[112px] lg:min-h-[160px]" />
        ))}
      </div>
    </div>
  );
};
