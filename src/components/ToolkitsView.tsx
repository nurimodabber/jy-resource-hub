import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Users, Timer, MessageSquareQuote, Crown, Eye, Compass, Lightbulb, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { tr, ToolHeader } from './tools/common';
import { EmpireTool } from './tools/EmpireTool';
import { RolesTool } from './tools/RolesTool';
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
  icon: React.FC<{ className?: string }>;
  title: [string, string];
  desc: [string, string];
  group: 'run' | 'group' | 'ideas';
  Component: React.FC<{ language: Language }>;
};

const TOOLS: ToolDef[] = [
  { id: 'empire', icon: Crown, title: ['Empire', 'Empire'], desc: ['Kategorien, Begriffe vorlesen und Reiche verfolgen.', 'Categories, reading terms and tracking kingdoms.'], group: 'run', Component: EmpireTool },
  { id: 'roles', icon: Eye, title: ['Rollenverteiler', 'Role dealer'], desc: ['Geheime Karten für Spion, Wer bin ich, Werwölfe und Mörder.', 'Secret cards for Spy, Who am I, Werewolf and Killer.'], group: 'run', Component: RolesTool },
  { id: 'teams', icon: Users, title: ['Teams und Zweiergruppen', 'Teams and pairs'], desc: ['Zufällig einteilen, ohne dieselben Paare zu wiederholen.', 'Split at random without repeating the same pairs.'], group: 'group', Component: TeamsTool },
  { id: 'timer', icon: Timer, title: ['Timer', 'Timer'], desc: ['Große Anzeige mit Signalton, auch für den Beamer.', 'Large display with chime, good for a projector.'], group: 'group', Component: TimerTool },
  { id: 'finder', icon: Compass, title: ['Spielfinder', 'Game finder'], desc: ['Gruppengröße und Zeit eingeben, passende Spiele erhalten.', 'Enter group size and time, get matching games.'], group: 'ideas', Component: FinderTool },
  { id: 'ideas', icon: Lightbulb, title: ['Impulse', 'Prompts'], desc: ['Sortierkriterien, Geschichtenanfänge und Regeln.', 'Line-up criteria, story starters and rules.'], group: 'ideas', Component: IdeasTool },
  { id: 'cards', icon: MessageSquareQuote, title: ['Gesprächskarten', 'Conversation cards'], desc: ['Fragen und Zitate für das Gespräch im Kreis.', 'Questions and quotes for the circle conversation.'], group: 'ideas', Component: CardsTool },
];

export const ToolkitsView: React.FC<ToolkitsViewProps> = ({ language, toolId: propToolId }) => {
  const { toolId: routeToolId } = useParams<{ toolId?: string }>();
  const toolId = propToolId ?? routeToolId;
  const t = UI_TRANSLATIONS[language];
  const L = tr(language);
  const navigate = useNavigate();
  const tool = TOOLS.find((x) => x.id === toolId);

  if (tool) {
    const Tool = tool.Component;
    return (
      <div className="max-w-2xl mx-auto pb-16">
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

  const groups: { id: ToolDef['group']; label: string }[] = [
    { id: 'run', label: L('Spiele leiten', 'Run a game') },
    { id: 'group', label: L('Gruppe organisieren', 'Organise the group') },
    { id: 'ideas', label: L('Ideen', 'Ideas') },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">{t.tabTools}</h1>
      <p className="text-sm text-text-secondary mb-6">{L('Alles, was du live in der Gruppe brauchst. Funktioniert auf dem Handy.', 'Everything you need live in the group. Works on a phone.')}</p>
      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g.id} aria-label={g.label}>
            <h2 className="text-sm font-semibold text-text-secondary mb-2">{g.label}</h2>
            <ul className="divide-y divide-border border border-border rounded-xl bg-surface">
              {TOOLS.filter((x) => x.group === g.id).map((x) => {
                const Icon = x.icon;
                return (
                  <li key={x.id}>
                    <Link to={`/tools/${x.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2">
                      <Icon className="w-5 h-5 text-text-secondary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text">{x.title[language === 'de' ? 0 : 1]}</p>
                        <p className="text-sm text-text-secondary">{x.desc[language === 'de' ? 0 : 1]}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};
