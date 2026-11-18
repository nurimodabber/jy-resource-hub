import React from 'react';
import type { Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { getGameScene } from '../data/scenes';

/** Nur im Dev-Server (/vorschlag/icons): alle Aufbau-Szenen auf einen Blick. */
const IconProposalView: React.FC<{ language: Language }> = ({ language }) => {
  const scenes = GAMES_DATA.filter(g => getGameScene(g.id));
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <h1 className="sm:col-span-2 lg:col-span-3 font-serif text-3xl text-text">Aufbau-Szenen auf den Detailseiten</h1>
      {scenes.map(g => {
        const Scene = getGameScene(g.id);
        return (
          <figure key={g.id} className="rounded-card bg-surface-2 px-4 py-5 sm:px-6">
            <figcaption className="text-sm font-semibold text-text mb-3">{g.title[language]}</figcaption>
            <Scene language={language} />
          </figure>
        );
      })}
    </section>
  );
};

export default IconProposalView;
