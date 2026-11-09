import React from 'react';

/**
 * Eigene Spiel-Piktogramme, gebaut wie Leitsystem-Zeichen (Aicher München 1972, AIGA/DOT), damit sie auch bei 16 px tragen.
 * Regeln (bei neuen Icons einhalten):
 * - Figur = gefüllter Kopf + gefüllter Körper mit runden Schultern; keine Strich-Beine (verklumpen bei 16 px).
 *   Arme nur, wenn die Geste das Spiel erklärt.
 * - Eine Linienstärke: 2 px (SW), auf ganzen Koordinaten. Kein Detail und keine Lücke unter 1,5 px.
 * - Höchstens zwei ganze Figuren; Gruppen als Köpfe oder Büsten. Keine Schrift außer einer einzelnen Ziffer.
 * - 2 px Rand im 24er-Raster.
 * Die strokeWidth von IconTile (1,75 für lucide) wird bewusst ignoriert: diese Familie hat ihre eigene Stärke.
 */
type Props = { className?: string; strokeWidth?: number | string };

const SW = 2;
const ink = { fill: 'currentColor', stroke: 'none' } as const;

const make = (children: React.ReactNode): React.FC<Props> => {
  const Icon: React.FC<Props> = ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={SW}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
  return Icon;
};

type Vec = [number, number];

/**
 * Stehende Figur, Füße auf `base`. s = 1: Kopf r 2,5 (oben y 3), Körper 5 breit von y 9 bis 21.
 * arms: Wege ab der linken (-) bzw. rechten (+) Schulter, als Liste relativer Punkte.
 */
const Fig: React.FC<{ x: number; base?: number; s?: number; arms?: { side: -1 | 1; to: Vec[] }[] }> = ({
  x,
  base = 21,
  s = 1,
  arms = [],
}) => {
  const hr = Math.max(2.5 * s, 1.75);
  const half = 2.5 * s;
  const top = base - 12 * s;
  const shY = top + half;
  return (
    <g>
      <circle cx={x} cy={top - 1 - hr} r={hr} {...ink} />
      <path d={`M${x - half} ${base}V${shY}a${half} ${half} 0 0 1 ${2 * half} 0V${base}z`} {...ink} />
      {arms.map(({ side, to }, i) => (
        <path key={i} d={`M${x + side * (half - 0.5)} ${shY}${to.map(([dx, dy]) => `l${dx} ${dy}`).join('')}`} />
      ))}
    </g>
  );
};

/** Büste: gefüllter Kopf über gefüllten Schultern, Unterkante y 21. */
const Bust: React.FC<{ x: number; head: number; r?: number; w?: number }> = ({ x, head, r = 3, w = 6 }) => (
  <g {...ink}>
    <circle cx={x} cy={head} r={r} />
    <path d={`M${x - w} 21v-1a${w} ${w * 0.8} 0 0 1 ${2 * w} 0v1z`} />
  </g>
);

/** Ausstanzung (Augenbinde, Augen, Brille) aus gefüllten Formen. Gleiche ID auf mehreren Karten ist unkritisch: gleicher Inhalt. */
const Knock: React.FC<{ id: string; cut: React.ReactNode; children: React.ReactNode }> = ({ id, cut, children }) => (
  <>
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="white" />
      <g stroke="black" fill="none" strokeWidth="1.5">
        {cut}
      </g>
    </mask>
    <g mask={`url(#${id})`}>{children}</g>
  </>
);

const ring = (n: number, rad: number, r: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return <circle key={i} cx={12 + rad * Math.cos(a)} cy={12 + rad * Math.sin(a)} r={r} {...ink} />;
  });

const waves = 'M2 21c1.7-1.2 3.3-1.2 5 0s3.3 1.2 5 0 3.3-1.2 5 0 3.3 1.2 5 0';

// ── Zusammenarbeit ─────────────────────────────────────────────

export const KnotIcon = make(
  <>
    <Fig x={4} />
    <Fig x={20} />
    <path d="M6 11.5c3 0 3 5 6 5s3-5 6-5M6 16.5c3 0 3-5 6-5s3 5 6 5" />
  </>,
);

export const HeliumStickIcon = make(
  <>
    <path d="M2 3h20" />
    <Fig x={7} s={0.8} arms={[{ side: 1, to: [[1, -1], [0, -8]] }]} />
    <Fig x={17} s={0.8} arms={[{ side: -1, to: [[-1, -1], [0, -8]] }]} />
  </>,
);

export const MinefieldIcon = make(
  <>
    <Fig x={5} />
    <path d="M9 9.5a3 3 0 0 1 0 4M11.5 8a6 6 0 0 1 0 7" />
    <Knock id="jyp-mine" cut={<path d="M14 6h7" />}>
      <Fig x={18} />
    </Knock>
    <path d="M13 6h-1l-1 1.5" strokeWidth={1.5} />
  </>,
);

export const BallRunIcon = make(
  <>
    <circle cx="4" cy="4" r="2" {...ink} />
    <path d="M2 7h9M13 7h9" />
    <Fig x={6} s={0.7} arms={[{ side: 1, to: [[1, -1], [0, -5.35]] }]} />
    <Fig x={18} s={0.7} arms={[{ side: -1, to: [[-1, -1], [0, -5.35]] }]} />
  </>,
);

export const BlindSquareIcon = make(
  <>
    <Knock id="jyp-square" cut={<path d="M1 5h6M17 5h6M1 19h6M17 19h6" />}>
      {[[4.5, 5], [19.5, 5], [4.5, 19], [19.5, 19]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" {...ink} />
      ))}
    </Knock>
    <path d="M8.5 5h7M8.5 19h7M4.5 9v6M19.5 9v6" />
  </>,
);

export const BlanketFlipIcon = make(
  <>
    <path d="M2 21l4-4h16l-4 4z" />
    <Fig x={11} base={18} s={0.75} />
    <path d="M16 3a5 5 0 0 1 5 5M19 6.5L21 8.5l2-2" />
  </>,
);

export const IceFloeIcon = make(
  <>
    <path d={waves} />
    <rect x="2" y="16.5" width="7" height="2" rx="1" {...ink} />
    <rect x="15" y="16.5" width="7" height="2" rx="1" {...ink} />
    <Fig x={5.5} base={16.5} s={0.75} />
    <path d="M11 9c2-2.5 5-2.5 7 0M15.5 9h2.5V6.5" />
  </>,
);

export const ElectricFenceIcon = make(
  <>
    <path d="M3 12v9M21 12v9M3 15h4l1.5-2 2 4 1.5-2H21" />
    <Fig x={12} base={11} s={0.6} arms={[{ side: -1, to: [[-2.5, -2.5]] }, { side: 1, to: [[2.5, -2.5]] }]} />
  </>,
);

export const AcidLakeIcon = make(
  <>
    <path d="M3 3l9 8M21 3l-9 8" />
    <path d="M9 11h6l-1 5h-4z" {...ink} />
    <path d={waves} />
  </>,
);

export const SilentGridIcon = make(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    <g {...ink}>
      <rect x="4.5" y="16.5" width="3" height="3" rx="0.5" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
      <rect x="16.5" y="4.5" width="3" height="3" rx="0.5" />
    </g>
  </>,
);

export const SilentLineIcon = make(
  <>
    <Fig x={4.5} s={0.55} />
    <Fig x={11.5} s={0.75} />
    <Fig x={19} s={0.95} />
  </>,
);

export const ShrinkingIslandIcon = make(
  <>
    <ellipse cx="12" cy="19.5" rx="5" ry="1.5" {...ink} />
    <Fig x={10} base={18.5} s={0.7} />
    <Fig x={14} base={18.5} s={0.7} />
    <path d="M2 12h3M4 10l2 2-2 2M22 12h-3M20 10l-2 2 2 2" />
  </>,
);

export const BackToBackIcon = make(
  <>
    <circle cx="9" cy="5.5" r="2.5" {...ink} />
    <circle cx="15" cy="5.5" r="2.5" {...ink} />
    <g {...ink}>
      <path d="M7 15V11a2 2 0 0 1 4 0v4zM13 15v-4a2 2 0 0 1 4 0v4z" />
    </g>
    <path d="M9 15l-3.5 2v4M15 15l3.5 2v4M11 12h2" />
    <path d="M3 9V3M1 5l2-2 2 2" />
  </>,
);

export const BallKeepUpIcon = make(
  <>
    <circle cx="12" cy="4.5" r="2.5" />
    <Fig x={5} s={0.8} arms={[{ side: 1, to: [[3, -3.5]] }]} />
    <Fig x={19} s={0.8} arms={[{ side: -1, to: [[-3, -3.5]] }]} />
  </>,
);

// ── Kennenlernen, Energie, Ruhe ───────────────────────────────

export const StoryCircleIcon = make(
  <>
    {ring(6, 8.5, 2)}
    <path d="M9 9h6a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3l-2 2v-2H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" />
  </>,
);

export const ClapCircleIcon = make(
  <>
    {ring(8, 9, 1.75)}
    <path d="M12 7a5 5 0 1 1-5 5M5 10l2 2 2-2" />
  </>,
);

export const CountTogetherIcon = make(
  <>
    <Knock id="jyp-count" cut={<path d="M6 11.5c.6.6 1.4.6 2 0M10 11.5c.6.6 1.4.6 2 0" />}>
      <Bust x={9} head={11} r={4} w={6.5} />
    </Knock>
    <path d="M15 2h5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1.5L16 11V9h-1a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M16.5 4.5l1.5-1v4" strokeWidth={1.5} />
  </>,
);

// Huhn (Stufe am Boden) steigt per Bogenpfeil zum aufrechten Menschen auf
export const EvolutionIcon = make(
  <>
    <Knock id="jyp-evo" cut={<circle cx="9.4" cy="8.4" r=".6" fill="black" stroke="none" />}>
      <g {...ink}>
        <path d="M2 9.5l2.75 3.25c1-.5 2-.75 3-.75l.25-1.5h2l.25 2c.75.75 1.25 1.75 1.25 3 0 2.75-2.25 4.5-5 4.5S2 18.25 2 15.5z" />
        <circle cx="9" cy="8.75" r="2.25" />
        <path d="M7.25 6.75a1 1 0 0 1 1.5-1.25 1 1 0 0 1 1.75.25 1 1 0 0 1 .75 1.5z" />
        <path d="M11 8l1.75.85L11 9.7z" />
      </g>
    </Knock>
    <path d="M5.5 20v1.5M8 20v1.5" strokeWidth={1.75} />
    <path d="M3 3h11M12 1l2 2-2 2" />
    <Fig x={19} s={0.85} />
  </>,
);

export const ChopIcon = make(
  <>
    <Fig x={12} arms={[{ side: -1, to: [[-2, -5], [3, -4]] }, { side: 1, to: [[2, -5], [-3, -4]] }]} />
    <path d="M5 6.5L3 5.5M5 9.5H2.5M19 6.5l2-1M19 9.5h2.5" />
  </>,
);

export const NinjaIcon = make(
  <>
    <Fig x={5} arms={[{ side: 1, to: [[5, -4]] }]} />
    <Fig x={19} arms={[{ side: -1, to: [[-4, 1.5]] }]} />
  </>,
);

// ── Raten ──────────────────────────────────────────────────────

export const WhoAmIIcon = make(
  <>
    <rect x="7" y="2" width="10" height="7" rx="1.5" />
    <path d="M10.5 4.5a1.5 1.5 0 1 1 2.2 1.3c-.5.3-.7.6-.7 1" strokeWidth={1.5} />
    <Bust x={12} head={12.5} r={2.75} w={6.5} />
  </>,
);

export const NumberLineIcon = make(
  <>
    <g {...ink}>
      <rect x="3" y="8" width="4" height="3" rx="0.75" />
      <rect x="10" y="5.5" width="4" height="3" rx="0.75" />
      <rect x="17" y="3" width="4" height="3" rx="0.75" />
    </g>
    {[5, 12, 19].map((x) => (
      <g key={x} {...ink}>
        <circle cx={x} cy="15" r="2.25" />
        <path d={`M${x - 3} 21v-.5a3 2.5 0 0 1 6 0v.5z`} />
      </g>
    ))}
  </>,
);

export const WerewolfIcon = make(
  <>
    <path d="M19.5 2a3.5 3.5 0 1 0 2.5 6A3 3 0 1 1 19.5 2z" {...ink} />
    <Knock id="jyp-wolf" cut={<path d="M5.5 12.5l2 1M12.5 12.5l-2 1" strokeWidth={1.75} />}>
      <path
        d="M4 4.5c.6-.4 1.3-.2 1.8.3L8 7.5h2l2.2-2.7c.5-.5 1.2-.7 1.8-.3.5.3.7.9.7 1.5L15 12c0 5-3 9-6 9s-6-4-6-9l.3-5.5c0-.6.2-1.2.7-1.5z"
        {...ink}
      />
    </Knock>
  </>,
);

export const SpyIcon = make(
  <>
    <Knock id="jyp-spy" cut={<path d="M7 13.5h4M13 13.5h4" strokeWidth={2.25} />}>
      <g {...ink}>
        <path d="M7 9l1.2-5.2c.2-.9 1.1-1.4 2-1.1l1.8.6 1.8-.6c.9-.3 1.8.2 2 1.1L17 9z" />
        <ellipse cx="12" cy="9.5" rx="10" ry="1.75" />
        <path d="M7 12v2a5 5 0 0 0 10 0v-2z" />
      </g>
    </Knock>
    <path d="M7 21l5-2.5 5 2.5" />
  </>,
);

export const InvestigatorIcon = make(
  <>
    <circle cx="16" cy="7" r="4.5" />
    <path d="M19.5 10.5L22 13" />
    <g {...ink}>
      <circle cx="5" cy="13.5" r="2.25" />
      <path d="M1.5 21v-.5a3.5 3 0 0 1 7 0v.5z" />
      <circle cx="12" cy="15" r="2.25" />
      <path d="M8.5 21v-.5a3.5 2.5 0 0 1 7 0v.5z" />
    </g>
  </>,
);

export const EmpireIcon = make(
  <>
    <path d="M5 6V2.5l2 1.5 1.5-2L10 4l2-1.5V6z" {...ink} />
    <Fig x={8.5} base={21} s={0.85} />
    <Fig x={17} base={21} s={0.75} arms={[{ side: -1, to: [[-4.5, 0]] }]} />
  </>,
);

export const WinkIcon = make(
  <>
    <path d="M2 12c1.5-3 3.5-4.5 5.5-4.5S11.5 9 13 12c-1.5 3-3.5 4.5-5.5 4.5S3.5 15 2 12z" />
    <circle cx="7.5" cy="12" r="1.75" {...ink} />
    <path d="M15 12.5c1.5 1.5 4.5 1.5 6 0M16 14l-.75 1.5M18 14.5V16M20 14l.75 1.5" />
  </>,
);

export const ShowdownIcon = make(
  <>
    <circle cx="8.5" cy="10.5" r="2" />
    <circle cx="15.5" cy="10.5" r="2" />
    <path d="M9.75 8.75L15.5 2M14.25 8.75L8.5 2" />
    <g {...ink}>
      {[4, 12, 20].map((x) => (
        <g key={x}>
          <circle cx={x} cy="17" r="1.75" />
          <path d={`M${x - 2.5} 22v-.5a2.5 2 0 0 1 5 0v.5z`} />
        </g>
      ))}
    </g>
  </>,
);

export const SaladBowlIcon = make(
  <>
    <path d="M3 12h18c0 5-4 9-9 9s-9-4-9-9z" />
    <path d="M7 12l1.5-6 3.5 1-1.25 5M14 12l2.5-5 3 1.5L18 12" />
  </>,
);
