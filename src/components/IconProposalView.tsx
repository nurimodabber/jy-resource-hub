import React from 'react';
import type { Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { getGameScene } from '../data/scenes';
import { getGameIcon } from '../data/gameIcons';
import { IconTile } from './ui/IconTile';

/** Nur im Dev-Server (/vorschlag/icons): alle Spiel-Icons groß und in Kartengröße, darunter alle Aufbau-Szenen. */
const IconProposalView: React.FC<{ language: Language }> = ({ language }) => {
  const scenes = GAMES_DATA.filter(g => getGameScene(g.id));
  return (
    <>
      <section className="mb-10">
        <h1 className="font-serif text-3xl text-text mb-6">Spiel-Icons</h1>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {GAMES_DATA.map(g => {
            const I = getGameIcon(g.id);
            return (
              <figure key={g.id} className="flex flex-col items-center gap-2 text-center">
                <span className="inline-flex items-center justify-center w-24 h-24 rounded-card bg-surface-2 text-text-secondary">
                  <I className="w-16 h-16" />
                </span>
                <IconTile icon={I} size="xl" />
                <figcaption className="text-xs text-text-secondary">{g.title[language]}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="sm:col-span-2 lg:col-span-3 font-serif text-3xl text-text">Aufbau-Szenen auf den Detailseiten</h2>
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
    </>
  );
};

export default IconProposalView;
