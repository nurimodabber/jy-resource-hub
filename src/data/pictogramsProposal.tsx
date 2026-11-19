import React from 'react';
import { Fig, ink, LIMB, make } from './pictograms';

/**
 * Spiel-Icons nach dem Prinzip „zeige die Handlung“, vom Inhaber am 2026-11-18 freigegeben.
 * Gleiche Bauregeln wie pictograms.tsx (24er-Raster, Füße auf y 21, Striche 2 / 2,25, nichts unter 1,5 px).
 * gameIcons.ts nimmt sie über PROPOSED_GAME_ICONS auf; sie ersetzen dort ältere Icons derselben Spiele.
 */

const M = 0.8;
const S = 0.6;
const dash = { strokeWidth: 1.5, strokeDasharray: '1.5 2' } as const;

/** Billy Billy Bob, Pose Toaster: die Mitte springt hoch, die Nachbarn bilden mit erhobenem Arm den Toaster. */
export const ToasterIcon = make(
  <>
    <Fig x={4.5} s={S} arms={[{ side: 1, to: [[1.5, -1], [0, -5]] }]} />
    <Fig x={19.5} s={S} arms={[{ side: -1, to: [[-1.5, -1], [0, -5]] }]} />
    <Fig x={12} base={17} s={M} />
    <path d="M10.5 20.5h3" />
  </>,
);

/** Obstsalat: zwei leere Stühle, eine Person läuft zum freien Platz. */
export const FruitSaladIcon = make(
  <>
    <path d="M2.5 9v12M2.5 15h4.5v6M21.5 9v12M21.5 15H17v6" />
    <Fig x={12} s={M} arms={[{ side: -1, to: [[-2.25, 2.75]] }, { side: 1, to: [[2.25, -2.5]] }]} />
  </>,
);

/** Namensball: Wurf im Bogen von einer Person zur anderen. */
export const NameBallIcon = make(
  <>
    <Fig x={4} s={M} arms={[{ side: 1, to: [[2, -3]] }]} />
    <Fig x={20} s={M} arms={[{ side: -1, to: [[-2, -3]] }]} />
    <path d="M7 6C9 2 15 2 17 6" {...dash} />
    <circle cx="12" cy="3" r="2" {...ink} />
  </>,
);

/** Spaghetti-Turm: Fachwerkturm, oben ein Marshmallow. */
export const SpaghettiTowerIcon = make(
  <>
    <path d="M4 21L10 8.5h4L20 21M6.15 16.5h11.7M8.3 12h7.4M6.15 16.5L15.7 12M17.85 16.5L8.3 12" />
    <rect x="9.5" y="2.5" width="5" height="4.5" rx="1.5" {...ink} />
  </>,
);

/** Roboter steuern: hinten tippt eine Person der vorderen auf die Schulter, der Roboter geht steif voran. */
export const RobotIcon = make(
  <>
    <Fig x={6} s={M} arms={[{ side: 1, to: [[5.5, -0.75]] }]} />
    <Fig x={15} arms={[{ side: 1, to: [[4.5, 0]] }]} />
    <path d="M11.5 7.25l-1-1.75M13.25 6.25l.25-2" />
  </>,
);

/** Eierfall: Ei fällt in eine Konstruktion. */
export const EggDropIcon = make(
  <>
    <ellipse cx="12" cy="5" rx="2.6" ry="3.4" {...ink} />
    <path d="M12 10.5v2" />
    <path d="M6.5 21v-6h11v6M6.5 15l11 6M17.5 15l-11 6" />
  </>,
);

/** Säuresee: zwei Personen ziehen an Seilen einen Eimer aus der Sperrzone. */
export const AcidLakeNewIcon = make(
  <>
    <Fig x={3} s={M} arms={[{ side: 1, to: [[3, 1]] }]} />
    <Fig x={21} s={M} arms={[{ side: -1, to: [[-3, 1]] }]} />
    <path d="M7.25 14.75L9.75 16M16.75 14.75L14.25 16" />
    <path d="M9.5 15.5h5l-.75 4h-3.5z" {...ink} />
    <ellipse cx="12" cy="20.5" rx="6" ry="1" {...dash} />
  </>,
);

/** Stille Matrix: Bodenraster, eine Person steht auf einem Feld und tastet sich vor. */
export const SilentGridNewIcon = make(
  <>
    <path d="M2.5 21L6 13h12l3.5 8zM4.25 17h15.5M10 13l-1 8M14 13l1 8" strokeWidth={1.5} />
    <Fig x={12} base={15} s={S} arms={[{ side: 1, to: [[2, 1.5]] }]} />
  </>,
);

/** Schrumpfende Insel: alter Platz gestrichelt, zwei halten sich auf der kleinen Fläche fest. */
export const ShrinkingIslandNewIcon = make(
  <>
    <path d="M2 21l3-4.5h14l3 4.5z" {...dash} />
    <path d="M7.5 21l1-1.75h7l1 1.75z" {...ink} />
    <Fig x={10} base={19.5} s={M} arms={[{ side: 1, to: [[3.5, -0.5]] }]} />
    <Fig x={14} base={19.5} s={M} arms={[{ side: -1, to: [[-3.5, 1]] }]} />
  </>,
);

/** Mord in der Disco: eine Person zwinkert, die angezwinkerte sackt zusammen. */
export const WinkNewIcon = make(
  <>
    <Fig x={5.5} />
    <path d="M9.5 4.75l2.5-.75M9.75 7l2.5.25" strokeWidth={LIMB - 0.75} />
    <g transform="rotate(30 17 21)">
      <Fig x={17} s={S} />
    </g>
  </>,
);

/** Gruppen-Jonglage: zwei Personen, drei Bälle gleichzeitig in der Luft. */
export const JuggleIcon = make(
  <>
    <Fig x={4} arms={[{ side: 1, to: [[2, -3.5]] }]} />
    <Fig x={20} arms={[{ side: -1, to: [[-2, -3.5]] }]} />
    <circle cx="9.5" cy="4.25" r="1.75" {...ink} />
    <circle cx="14.5" cy="4.25" r="1.75" {...ink} />
    <circle cx="12" cy="9.75" r="1.75" {...ink} />
  </>,
);

/** Delfin-Training: eine Person geht auf das Ziel zu, Applaus zeigt die richtige Richtung. */
export const DolphinIcon = make(
  <>
    <Fig x={6} arms={[{ side: 1, to: [[3, 1.5]] }]} />
    <path d="M12 20.5h1.5M16 20.5h1.5" />
    <circle cx="20.5" cy="20" r="1.5" {...ink} />
    <path d="M15.5 4.5l1.25 1.75M19 3v2.25M22.5 4.5l-1.25 1.75" />
  </>,
);

/** Das Seilhaus: das Haus vom Nikolaus aus einem Seil, an den Ecken halten Personen fest. */
export const RopeHouseIcon = make(
  <>
    <path d="M6 19.5V11h12v8.5zM6 11l6-6 6 6M6 11l12 8.5M18 11L6 19.5" />
    <circle cx="6" cy="19.5" r="2" {...ink} />
    <circle cx="18" cy="19.5" r="2" {...ink} />
    <circle cx="12" cy="4.5" r="2" {...ink} />
  </>,
);

/** Stühle balancieren: eine Person hält ihren Stuhl, der nur auf den Hinterbeinen steht. */
export const ChairTiltIcon = make(
  <>
    <Fig x={4.5} s={M} arms={[{ side: 1, to: [[2.5, -4.5]] }]} />
    <g transform="rotate(-20 13 21)">
      <path d="M13 21V5M13 13.5h7V21" strokeWidth={2.25} />
    </g>
  </>,
);

/** Ein Stift, vier Schnüre: vier Schnüre ziehen an einem Stift, der eine Linie zeichnet. */
export const PenStringsIcon = make(
  <>
    <path d="M12 8L3.5 4M12 8l8.5-4M12 8L3.5 13M12 8l8.5 5" strokeWidth={1.5} />
    <path d="M10.75 6h2.5v8.5L12 17l-1.25-2.5z" {...ink} />
    <circle cx="3.5" cy="4" r="1.75" {...ink} />
    <circle cx="20.5" cy="4" r="1.75" {...ink} />
    <circle cx="3.5" cy="13" r="1.75" {...ink} />
    <circle cx="20.5" cy="13" r="1.75" {...ink} />
    <path d="M12 20c-2.5 1.25-5-.75-8 .5" />
  </>,
);

/** Namensgedicht: Blatt, links Buchstaben untereinander, rechts je eine Zeile. */
export const NamePoemIcon = make(
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M7 6.75h2.75v2.75H7zM7 10.75h2.75v2.75H7zM7 14.75h2.75v2.75H7z" {...ink} />
    <path d="M12.5 8.1H17M12.5 12.1h3M12.5 16.1h4" />
  </>,
);

/** Geräusche raten: hinter einem Sichtschutz entsteht ein Geräusch, eine Person lauscht. */
export const SoundGuessIcon = make(
  <>
    <Fig x={5} arms={[{ side: 1, to: [[1.25, -3.5], [-0.25, -2]] }]} />
    <path d="M14 21V9l3.5 1.5L21 9v12M17.5 10.5V21" />
    <path d="M15.5 6.5a3 3 0 0 1 4 0M13.75 4a5.5 5.5 0 0 1 7.5 0" />
  </>,
);

/** Atem beobachten: sitzende Person, Hände auf den Knien, ruhiger Atem als zwei Bögen. */
export const BreathIcon = make(
  <>
    <circle cx="12" cy="6.5" r="2.5" {...ink} />
    <path d="M9.5 17v-4.5a2.5 2.5 0 0 1 5 0V17z" {...ink} />
    <path d="M5 21a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 21z" {...ink} />
    <path d="M10 13l-3 4.5M14 13l3 4.5" strokeWidth={LIMB} />
    <path d="M6.5 3.5a6 6 0 0 0 0 6M17.5 3.5a6 6 0 0 1 0 6" strokeWidth={1.5} />
  </>,
);

/** Vorhang fällt: zwischen zwei Personen fällt ein Tuch. */
export const CurtainIcon = make(
  <>
    <Fig x={4} s={M} arms={[{ side: 1, to: [[2.5, -1]] }]} />
    <Fig x={20} s={M} arms={[{ side: -1, to: [[-2.5, -1]] }]} />
    <rect x="9.75" y="2.5" width="4.5" height="12" rx="1" {...ink} />
    <path d="M10.5 17.5v3M13.5 17.5v3" strokeWidth={1.5} />
  </>,
);

/** Spiegel: zwei Personen, die Hände an derselben Stelle der Spiegelfläche, gleiche Haltung seitenverkehrt. */
export const MirrorIcon = make(
  <>
    <Fig x={6} arms={[{ side: 1, to: [[3.5, -4]] }, { side: -1, to: [[-1.25, 3.5]] }]} />
    <Fig x={18} arms={[{ side: -1, to: [[-3.5, -4]] }, { side: 1, to: [[1.25, 3.5]] }]} />
    <path d="M12 3v18" {...dash} />
  </>,
);

/** Lebendige Skulptur: zwei Personen erstarrt auf einem Sockel, die inneren Hände treffen sich. */
export const SculptureIcon = make(
  <>
    <Fig x={7} base={17.5} s={M} arms={[{ side: 1, to: [[3.75, -3.65]] }, { side: -1, to: [[-2.5, -4]] }]} />
    <Fig x={17} base={17.5} s={M} arms={[{ side: -1, to: [[-3.75, -3.65]] }, { side: 1, to: [[2.5, -4]] }]} />
    <rect x="4" y="19" width="16" height="2" rx=".5" {...ink} />
  </>,
);

export const PROPOSED_GAME_ICONS: Record<string, React.FC<{ className?: string; strokeWidth?: number | string }>> = {
  spiegel: MirrorIcon,
  'lebendige-skulptur': SculptureIcon,
  'billy-billy-bob': ToasterIcon,
  obstsalat: FruitSaladIcon,
  namensball: NameBallIcon,
  'spaghetti-turm': SpaghettiTowerIcon,
  roboterspiel: RobotIcon,
  eierfall: EggDropIcon,
  saeuresee: AcidLakeNewIcon,
  'stille-matrix': SilentGridNewIcon,
  'schrumpfende-insel': ShrinkingIslandNewIcon,
  'schlafmuetze-moerder': WinkNewIcon,
  'ball-jonglage': JuggleIcon,
  'delfin-training': DolphinIcon,
  hexenhaus: RopeHouseIcon,
  'stuehle-balancieren': ChairTiltIcon,
  'stift-an-schnueren': PenStringsIcon,
  'namens-akrostichon': NamePoemIcon,
  'geraeusche-raten': SoundGuessIcon,
  'atem-zaehlen': BreathIcon,
  'vorhang-faellt': CurtainIcon,
};
